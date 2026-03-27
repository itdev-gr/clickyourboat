/**
 * Migrate Firebase Storage files to Supabase Storage
 * Downloads images/PDFs from Firebase and uploads to Supabase boat-assets bucket
 */
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env for Supabase credentials
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : process.env[key] || "";
}

const SUPABASE_URL = getEnv("PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = getEnv("PUBLIC_SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Fetch all boats with Firebase URLs ───
const { data: boats, error } = await supabase
  .from("boats")
  .select("id, owner_id, boat_name, images, boat_plan_images, insurance_certificate_url, ownership_certificate_url");

if (error) {
  console.error("Failed to fetch boats:", error);
  process.exit(1);
}

const boatsWithFiles = boats.filter(
  (b) =>
    (b.images && b.images.length > 0) ||
    b.insurance_certificate_url ||
    b.ownership_certificate_url
);

console.log(`Found ${boatsWithFiles.length} boats with files to migrate\n`);

let totalFiles = 0;
let successFiles = 0;
let failedFiles = 0;

/**
 * Download a file from a URL and return it as a Buffer + content type
 */
async function downloadFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  return { buffer, contentType };
}

/**
 * Extract a clean filename from a Firebase Storage URL
 */
function extractFilename(firebaseUrl) {
  try {
    const url = new URL(firebaseUrl);
    const encodedPath = url.pathname.split("/o/")[1]?.split("?")[0];
    if (!encodedPath) return `file-${Date.now()}`;
    const decodedPath = decodeURIComponent(encodedPath);
    let filename = decodedPath.split("/").pop() || `file-${Date.now()}`;
    // Sanitize: replace non-ASCII chars with transliteration or underscore
    filename = filename.replace(/[^\x20-\x7E]/g, "_").replace(/\s+/g, "_").replace(/__+/g, "_");
    return filename;
  } catch {
    return `file-${Date.now()}`;
  }
}

/**
 * Upload a file to Supabase Storage and return the public URL
 */
async function uploadToSupabase(filePath, buffer, contentType) {
  const { error } = await supabase.storage
    .from("boat-assets")
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });
  if (error) throw error;
  const { data } = supabase.storage.from("boat-assets").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Migrate a single URL: download from Firebase, upload to Supabase
 */
async function migrateUrl(firebaseUrl, ownerId, boatId, subDir = "") {
  totalFiles++;
  const filename = extractFilename(firebaseUrl);
  const storagePath = subDir
    ? `${ownerId}/${boatId}/${subDir}/${filename}`
    : `${ownerId}/${boatId}/${filename}`;

  try {
    const { buffer, contentType } = await downloadFile(firebaseUrl);
    const newUrl = await uploadToSupabase(storagePath, buffer, contentType);
    successFiles++;
    console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
    return newUrl;
  } catch (err) {
    failedFiles++;
    console.error(`  ✗ ${filename}: ${err.message}`);
    return firebaseUrl; // Keep original URL on failure
  }
}

// ─── Process each boat ───
for (const boat of boatsWithFiles) {
  console.log(`\n── ${boat.boat_name || boat.id} ──`);

  const updates = {};

  // Migrate images
  if (boat.images && boat.images.length > 0) {
    const newImages = [];
    for (const url of boat.images) {
      if (url.includes("firebasestorage.googleapis.com")) {
        const newUrl = await migrateUrl(url, boat.owner_id, boat.id);
        newImages.push(newUrl);
      } else {
        newImages.push(url); // Already migrated or non-Firebase URL
      }
    }
    updates.images = newImages;
  }

  // Migrate boat_plan_images
  if (boat.boat_plan_images && boat.boat_plan_images.length > 0) {
    const newPlanImages = [];
    for (const url of boat.boat_plan_images) {
      if (url.includes("firebasestorage.googleapis.com")) {
        const newUrl = await migrateUrl(url, boat.owner_id, boat.id);
        newPlanImages.push(newUrl);
      } else {
        newPlanImages.push(url);
      }
    }
    updates.boat_plan_images = newPlanImages;
  }

  // Migrate insurance certificate
  if (boat.insurance_certificate_url?.includes("firebasestorage.googleapis.com")) {
    updates.insurance_certificate_url = await migrateUrl(
      boat.insurance_certificate_url, boat.owner_id, boat.id, "documents"
    );
  }

  // Migrate ownership certificate
  if (boat.ownership_certificate_url?.includes("firebasestorage.googleapis.com")) {
    updates.ownership_certificate_url = await migrateUrl(
      boat.ownership_certificate_url, boat.owner_id, boat.id, "documents"
    );
  }

  // Update the boat row
  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await supabase
      .from("boats")
      .update(updates)
      .eq("id", boat.id);
    if (updateErr) {
      console.error(`  ✗ Failed to update boat row: ${updateErr.message}`);
    } else {
      console.log(`  → Updated boat row with ${Object.keys(updates).length} field(s)`);
    }
  }
}

console.log(`\n═══ STORAGE MIGRATION SUMMARY ═══`);
console.log(`Total files: ${totalFiles}`);
console.log(`Success: ${successFiles}`);
console.log(`Failed: ${failedFiles}`);

process.exit(failedFiles > 0 ? 1 : 0);
