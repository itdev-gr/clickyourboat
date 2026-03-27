/**
 * Firebase → Supabase Migration Script
 *
 * Reads all Firebase data (auth users, Firestore, Storage URLs)
 * and outputs JSON files ready for SQL insertion via Supabase MCP.
 *
 * Usage: node scripts/migrate-to-supabase.mjs
 *
 * Prerequisites:
 *   - firebase-admin installed
 *   - Firebase CLI authenticated (`firebase login`)
 *   - firebase-users.json exported via `firebase auth:export firebase-users.json --format=json`
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Initialize Firebase Admin ───────────────────────────────
// Uses Application Default Credentials from Firebase CLI
admin.initializeApp({
  projectId: 'clickyourboat-e7623',
});

const db = admin.firestore();

// ─── Load Firebase Auth export ───────────────────────────────
const authExport = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase-users.json'), 'utf8'));
const allAuthUsers = authExport.users;

// ─── Classify users ──────────────────────────────────────────
const googleUids = new Set();
const emailUids = new Set();

for (const u of allAuthUsers) {
  const providers = u.providerUserInfo.map(p => p.providerId);
  if (providers.includes('google.com')) {
    googleUids.add(u.localId);
  } else if (u.passwordHash) {
    emailUids.add(u.localId);
  }
}

console.log(`Total auth users: ${allAuthUsers.length}`);
console.log(`Google-only (skip): ${googleUids.size}`);
console.log(`Email/password (migrate): ${emailUids.size}`);

// ─── UID Mapping: firebase_uid → supabase_uuid ──────────────
const uidMap = new Map(); // firebase_uid → new supabase uuid
const boatIdMap = new Map(); // firebase_boat_id → new supabase uuid

// Generate new UUIDs for email users
for (const uid of emailUids) {
  uidMap.set(uid, randomUUID());
}

// ─── Read Firestore Collections ──────────────────────────────
console.log('\nReading Firestore collections...');

// Helper: convert Firestore timestamp to ISO string
function tsToISO(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate().toISOString();
  if (ts._seconds !== undefined) return new Date(ts._seconds * 1000).toISOString();
  if (typeof ts === 'string') return ts;
  return null;
}

// Helper: escape SQL string
function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? 'NULL' : String(val);
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  const s = String(val).replace(/'/g, "''");
  return `'${s}'`;
}

function escJson(obj) {
  if (obj === null || obj === undefined) return 'NULL';
  return esc(JSON.stringify(obj));
}

function escArr(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "'{}'";
  const items = arr.map(i => `"${String(i).replace(/"/g, '\\"')}"`).join(',');
  return `'{${items}}'`;
}

function escUuidArr(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "'{}'";
  const items = arr.map(i => String(i)).join(',');
  return `'{${items}}'`;
}

// ─── 1. Read Users from Firestore ────────────────────────────
console.log('Reading users...');
const usersSnap = await db.collection('users').get();
const firestoreUsers = new Map();
usersSnap.forEach(doc => {
  firestoreUsers.set(doc.id, doc.data());
});
console.log(`  Firestore users: ${firestoreUsers.size}`);

// ─── 2. Read Boats ───────────────────────────────────────────
console.log('Reading boats...');
const boatsSnap = await db.collection('boats').get();
const allBoats = [];
boatsSnap.forEach(doc => {
  allBoats.push({ id: doc.id, ...doc.data() });
});
console.log(`  Total boats: ${allBoats.length}`);

// Filter to email users' boats only
const emailBoats = allBoats.filter(b => emailUids.has(b.ownerId));
console.log(`  Email users' boats: ${emailBoats.length}`);

// Generate boat UUIDs
for (const boat of emailBoats) {
  boatIdMap.set(boat.id, randomUUID());
}

// ─── 3. Read Orders ──────────────────────────────────────────
console.log('Reading orders...');
const ordersSnap = await db.collection('orders').get();
const allOrders = [];
ordersSnap.forEach(doc => {
  allOrders.push({ id: doc.id, ...doc.data() });
});
console.log(`  Total orders: ${allOrders.length}`);

const emailOrders = allOrders.filter(o =>
  emailUids.has(o.renterId) && emailUids.has(o.ownerId)
);
console.log(`  Email users' orders: ${emailOrders.length}`);

// ─── 4. Read Conversations ──────────────────────────────────
console.log('Reading conversations...');
const convsSnap = await db.collection('conversations').get();
const allConvs = [];
convsSnap.forEach(doc => {
  allConvs.push({ id: doc.id, ...doc.data() });
});
console.log(`  Total conversations: ${allConvs.length}`);

const emailConvs = allConvs.filter(c => {
  const parts = c.participants || [];
  return parts.every(p => emailUids.has(p));
});
console.log(`  Email-only conversations: ${emailConvs.length}`);

// Generate conversation UUIDs
const convIdMap = new Map();
for (const conv of emailConvs) {
  convIdMap.set(conv.id, randomUUID());
}

// Read messages for email-only conversations
console.log('Reading messages...');
const allMessages = [];
for (const conv of emailConvs) {
  const msgsSnap = await db.collection('conversations').doc(conv.id).collection('messages').get();
  msgsSnap.forEach(doc => {
    allMessages.push({ id: doc.id, conversationId: conv.id, ...doc.data() });
  });
}
console.log(`  Total messages to migrate: ${allMessages.length}`);

// ─── 5. Read Reviews ─────────────────────────────────────────
console.log('Reading reviews...');
const reviewsSnap = await db.collection('reviews').get();
const allReviews = [];
reviewsSnap.forEach(doc => {
  allReviews.push({ id: doc.id, ...doc.data() });
});
console.log(`  Total reviews: ${allReviews.length}`);

const emailReviews = allReviews.filter(r =>
  emailUids.has(r.userId) && boatIdMap.has(r.boatId)
);
console.log(`  Email users' reviews: ${emailReviews.length}`);

// ─── 6. Read Favorites (subcollections) ──────────────────────
console.log('Reading favorites...');
const allFavorites = [];
for (const uid of emailUids) {
  const favsSnap = await db.collection('users').doc(uid).collection('favorites').get();
  favsSnap.forEach(doc => {
    allFavorites.push({ userId: uid, boatId: doc.id, ...doc.data() });
  });
}
const emailFavorites = allFavorites.filter(f => boatIdMap.has(f.boatId));
console.log(`  Total favorites to migrate: ${emailFavorites.length}`);

// ─── 7. Read Destinations ────────────────────────────────────
console.log('Reading destinations...');
const destsSnap = await db.collection('destinations').get();
const destinations = [];
destsSnap.forEach(doc => {
  destinations.push({ id: doc.id, ...doc.data() });
});
console.log(`  Destinations: ${destinations.length}`);

// ─── 8. Read Articles ────────────────────────────────────────
console.log('Reading articles...');
const articlesSnap = await db.collection('articles').get();
const articles = [];
articlesSnap.forEach(doc => {
  articles.push({ id: doc.id, ...doc.data() });
});
console.log(`  Articles: ${articles.length}`);

// ─── 9. Read Subscribers ─────────────────────────────────────
console.log('Reading subscribers...');
const subsSnap = await db.collection('subscribers').get();
const subscribers = [];
subsSnap.forEach(doc => {
  subscribers.push({ id: doc.id, ...doc.data() });
});
console.log(`  Subscribers: ${subscribers.length}`);

// ─── 10. Read Settings ───────────────────────────────────────
console.log('Reading settings...');
let chargeSettings = null;
try {
  const chargesDoc = await db.collection('settings').doc('charges').get();
  if (chargesDoc.exists) {
    chargeSettings = chargesDoc.data();
  }
} catch (e) {
  console.log('  No charge settings found');
}
console.log(`  Charge settings: ${chargeSettings ? 'found' : 'none'}`);

// ═══════════════════════════════════════════════════════════════
// GENERATE SQL
// ═══════════════════════════════════════════════════════════════

console.log('\n\nGenerating SQL...\n');

const sqlParts = [];

// ─── Auth Users + Profiles ───────────────────────────────────
sqlParts.push('-- ═══ AUTH USERS + PROFILES ═══');

for (const uid of emailUids) {
  const authUser = allAuthUsers.find(u => u.localId === uid);
  if (!authUser) continue;

  const fsUser = firestoreUsers.get(uid);
  const newId = uidMap.get(uid);
  const email = authUser.email;
  const displayName = fsUser?.displayName || authUser.displayName || '';
  const firstName = fsUser?.firstName || '';
  const lastName = fsUser?.lastName || '';
  const userType = fsUser?.type || 'user';
  const createdAt = fsUser?.createdAt ? tsToISO(fsUser.createdAt) : authUser.createdAt ? new Date(parseInt(authUser.createdAt)).toISOString() : new Date().toISOString();
  const lastLoginAt = fsUser?.lastLoginAt ? tsToISO(fsUser.lastLoginAt) : null;

  // Insert into auth.users (minimal — no password, they must reset)
  sqlParts.push(`
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '${newId}', 'authenticated', 'authenticated',
  ${esc(email)}, '',
  NOW(), ${esc(createdAt)}, NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  ${escJson({ email, first_name: firstName, last_name: lastName, display_name: displayName })}::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;`);

  // Insert auth.identities
  sqlParts.push(`
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '${newId}', '${newId}',
  ${escJson({ sub: newId, email })}::jsonb,
  'email', '${newId}', NOW(), ${esc(createdAt)}, NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;`);

  // Insert profile (with all Firestore user fields)
  const extraFields = {};
  if (fsUser) {
    // Copy all extra fields from Firestore user document
    for (const [k, v] of Object.entries(fsUser)) {
      if (!['email', 'displayName', 'firstName', 'lastName', 'photoURL', 'type', 'createdAt', 'lastLoginAt', 'uid'].includes(k)) {
        extraFields[k] = v;
      }
    }
  }

  sqlParts.push(`
INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '${newId}', ${esc(email)}, ${esc(displayName)}, ${esc(firstName)}, ${esc(lastName)},
  NULL, ${esc(userType)}, ${esc(createdAt)}, ${lastLoginAt ? esc(lastLoginAt) : 'NULL'}, ${esc(uid)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Boats ───────────────────────────────────────────────────
sqlParts.push('\n-- ═══ BOATS ═══');

for (const boat of emailBoats) {
  const newId = boatIdMap.get(boat.id);
  const newOwnerId = uidMap.get(boat.ownerId);
  if (!newOwnerId) continue;

  sqlParts.push(`
INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '${newId}', '${newOwnerId}',
  ${esc(boat.status || 'draft')},
  ${esc(boat.boatType || null)},
  ${esc(boat.boatName || null)},
  ${esc(boat.city || null)},
  ${esc(boat.harbour || null)},
  ${esc(boat.professional || null)},
  ${esc(boat.manufacturer || null)},
  ${esc(boat.model || null)},
  ${esc(boat.skipper || null)},
  ${boat.capacity || 'NULL'},
  ${boat.length || 'NULL'},
  ${boat.width || 'NULL'},
  ${boat.draft || 'NULL'},
  ${esc(boat.engineType || null)},
  ${boat.horsepower || 'NULL'},
  ${boat.speed || 'NULL'},
  ${boat.fuel || 'NULL'},
  ${boat.cabins || 'NULL'},
  ${boat.berths || 'NULL'},
  ${boat.bathrooms || 'NULL'},
  ${boat.yearOfConstruction || 'NULL'},
  ${esc(boat.renovated || null)},
  ${boat.crewMembers || 'NULL'},
  ${boat.tenderHorsepower || 'NULL'},
  ${esc(boat.equippedOffshore || null)},
  ${esc(boat.company || null)},
  ${esc(boat.website || null)},
  ${escArr(boat.images)},
  ${escArr(boat.boatPlanImages)},
  ${esc(boat.listingTitle || null)},
  ${esc(boat.description || null)},
  ${esc(boat.listingTitle_el || null)},
  ${esc(boat.description_el || null)},
  ${escArr(boat.languages)},
  ${boat.pricePerDay || 'NULL'},
  ${esc(boat.currency || 'EUR')},
  ${escJson(boat.pricePeriods || [])},
  ${boat.reservationMinDays || 'NULL'},
  ${boat.reservationMaxDays || 'NULL'},
  ${esc(boat.bookingMode || null)},
  ${esc(boat.checkInTime || null)},
  ${esc(boat.checkOutTime || null)},
  ${esc(boat.checkInTimeDayRental || null)},
  ${esc(boat.checkOutTimeDayRental || null)},
  ${boat.downpaymentPercentage || 'NULL'},
  ${boat.daysBeforeBalancePayment || 'NULL'},
  ${esc(boat.fuelCost || null)},
  ${esc(boat.licenceRequired || null)},
  ${boat.securityDeposit || 'NULL'},
  ${esc(boat.insuranceCertificateUrl || null)},
  ${esc(boat.ownershipCertificateUrl || null)},
  ${esc(boat.yachtInsured || null)},
  ${escJson(boat.unavailabilityPeriods || [])},
  ${escArr(boat.equipment)},
  ${escJson(boat.extras || [])},
  ${escJson(boat.discounts || [])},
  ${escArr(boat.completedSections)},
  ${esc(boat.listingTitle || boat.boatName || null)},
  ${esc(boat.boatType || null)},
  ${boat.city ? escJson({ city: boat.city, country: 'Greece' }) : 'NULL'},
  ${boat.pricePerDay || 'NULL'},
  0, 0,
  ${boat.skipper === 'with-skipper' || boat.skipper === 'both' ? 'true' : 'false'},
  false, NULL,
  ${esc(tsToISO(boat.createdAt) || new Date().toISOString())},
  ${esc(tsToISO(boat.updatedAt) || new Date().toISOString())},
  ${esc(boat.id)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Orders ──────────────────────────────────────────────────
sqlParts.push('\n-- ═══ ORDERS ═══');

for (const order of emailOrders) {
  const newId = randomUUID();
  const newRenterId = uidMap.get(order.renterId);
  const newOwnerId = uidMap.get(order.ownerId);
  const newBoatId = boatIdMap.get(order.boatId);
  if (!newRenterId || !newOwnerId) continue;

  sqlParts.push(`
INSERT INTO public.orders (id, boat_id, boat_title, boat_image, renter_id, renter_name, owner_id, start_date, end_date, total_price, status, created_at, firebase_id)
VALUES (
  '${newId}', ${newBoatId ? `'${newBoatId}'` : 'NULL'},
  ${esc(order.boatTitle || null)}, ${esc(order.boatImage || null)},
  '${newRenterId}', ${esc(order.renterName || null)},
  '${newOwnerId}',
  ${esc(order.startDate || null)}, ${esc(order.endDate || null)},
  ${order.totalPrice || 0}, ${esc(order.status || 'pending')},
  ${esc(tsToISO(order.createdAt) || new Date().toISOString())},
  ${esc(order.id)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Conversations ───────────────────────────────────────────
sqlParts.push('\n-- ═══ CONVERSATIONS ═══');

for (const conv of emailConvs) {
  const newId = convIdMap.get(conv.id);
  const newParticipants = (conv.participants || []).map(p => uidMap.get(p)).filter(Boolean);
  if (newParticipants.length < 2) continue;

  // Remap participant details
  const newDetails = {};
  if (conv.participantDetails) {
    for (const [oldUid, details] of Object.entries(conv.participantDetails)) {
      const newUid = uidMap.get(oldUid);
      if (newUid) newDetails[newUid] = details;
    }
  }

  // Remap lastMessage senderId
  let lastMsg = conv.lastMessage || null;
  if (lastMsg && lastMsg.senderId) {
    lastMsg = { ...lastMsg, senderId: uidMap.get(lastMsg.senderId) || lastMsg.senderId };
    if (lastMsg.timestamp) lastMsg.timestamp = tsToISO(lastMsg.timestamp);
  }

  // Remap unreadCount
  const newUnread = {};
  if (conv.unreadCount) {
    for (const [oldUid, count] of Object.entries(conv.unreadCount)) {
      const newUid = uidMap.get(oldUid);
      if (newUid) newUnread[newUid] = count;
    }
  }

  const newBoatId = conv.boatId ? boatIdMap.get(conv.boatId) : null;

  sqlParts.push(`
INSERT INTO public.conversations (id, participants, participant_details, last_message, boat_id, boat_title, unread_count, created_at, updated_at, firebase_id)
VALUES (
  '${newId}',
  ${escUuidArr(newParticipants)},
  ${escJson(newDetails)},
  ${escJson(lastMsg)},
  ${newBoatId ? `'${newBoatId}'` : 'NULL'},
  ${esc(conv.boatTitle || null)},
  ${escJson(newUnread)},
  ${esc(tsToISO(conv.createdAt) || new Date().toISOString())},
  ${esc(tsToISO(conv.updatedAt) || new Date().toISOString())},
  ${esc(conv.id)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Messages ────────────────────────────────────────────────
sqlParts.push('\n-- ═══ MESSAGES ═══');

for (const msg of allMessages) {
  const newConvId = convIdMap.get(msg.conversationId);
  const newSenderId = uidMap.get(msg.senderId);
  if (!newConvId || !newSenderId) continue;

  const newReadBy = (msg.readBy || []).map(u => uidMap.get(u)).filter(Boolean);

  sqlParts.push(`
INSERT INTO public.messages (id, conversation_id, text, sender_id, sender_name, timestamp, read_by)
VALUES (
  '${randomUUID()}', '${newConvId}',
  ${esc(msg.text || '')}, '${newSenderId}',
  ${esc(msg.senderName || null)},
  ${esc(tsToISO(msg.timestamp) || new Date().toISOString())},
  ${escUuidArr(newReadBy)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Reviews ─────────────────────────────────────────────────
sqlParts.push('\n-- ═══ REVIEWS ═══');

for (const review of emailReviews) {
  const newUserId = uidMap.get(review.userId);
  const newBoatId = boatIdMap.get(review.boatId);
  if (!newUserId || !newBoatId) continue;

  sqlParts.push(`
INSERT INTO public.reviews (id, boat_id, user_id, user_name, rating, comment, boat_name, location, created_at, firebase_id)
VALUES (
  '${randomUUID()}', '${newBoatId}', '${newUserId}',
  ${esc(review.userName || null)}, ${review.rating || 0},
  ${esc(review.comment || null)}, ${esc(review.boatName || null)},
  ${esc(review.location || null)},
  ${esc(tsToISO(review.createdAt) || new Date().toISOString())},
  ${esc(review.id)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Favorites ───────────────────────────────────────────────
sqlParts.push('\n-- ═══ FAVORITES ═══');

for (const fav of emailFavorites) {
  const newUserId = uidMap.get(fav.userId);
  const newBoatId = boatIdMap.get(fav.boatId);
  if (!newUserId || !newBoatId) continue;

  sqlParts.push(`
INSERT INTO public.favorites (id, user_id, boat_id, title, image, location, price, price_unit, type, rating, review_count, added_at)
VALUES (
  '${randomUUID()}', '${newUserId}', '${newBoatId}',
  ${esc(fav.title || null)}, ${esc(fav.image || null)},
  ${esc(fav.location || null)}, ${fav.price || 'NULL'},
  ${esc(fav.priceUnit || null)}, ${esc(fav.type || null)},
  ${fav.rating || 'NULL'}, ${fav.reviewCount || 'NULL'},
  ${esc(tsToISO(fav.addedAt) || new Date().toISOString())}
) ON CONFLICT (user_id, boat_id) DO NOTHING;`);
}

// ─── Destinations ────────────────────────────────────────────
sqlParts.push('\n-- ═══ DESTINATIONS ═══');

for (const dest of destinations) {
  sqlParts.push(`
INSERT INTO public.destinations (id, name, slug, image, description, boat_count, firebase_id)
VALUES (
  '${randomUUID()}', ${esc(dest.name)}, ${esc(dest.slug || null)},
  ${esc(dest.image || null)}, ${esc(dest.description || null)},
  ${dest.boatCount || 0}, ${esc(dest.id)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Articles ────────────────────────────────────────────────
sqlParts.push('\n-- ═══ ARTICLES ═══');

for (const article of articles) {
  sqlParts.push(`
INSERT INTO public.articles (id, title, slug, image, summary, content, created_at, firebase_id)
VALUES (
  '${randomUUID()}', ${escJson(article.title)}, ${esc(article.slug || null)},
  ${esc(article.image || null)}, ${escJson(article.summary || null)},
  ${escJson(article.content || null)},
  ${esc(tsToISO(article.createdAt) || new Date().toISOString())},
  ${esc(article.id)}
) ON CONFLICT (id) DO NOTHING;`);
}

// ─── Subscribers ─────────────────────────────────────────────
sqlParts.push('\n-- ═══ SUBSCRIBERS ═══');

for (const sub of subscribers) {
  sqlParts.push(`
INSERT INTO public.subscribers (id, email, created_at)
VALUES (
  '${randomUUID()}', ${esc(sub.email)},
  ${esc(tsToISO(sub.createdAt) || new Date().toISOString())}
) ON CONFLICT (email) DO NOTHING;`);
}

// ─── Settings ────────────────────────────────────────────────
sqlParts.push('\n-- ═══ SETTINGS ═══');

if (chargeSettings) {
  sqlParts.push(`
INSERT INTO public.settings (key, value, updated_at)
VALUES ('charges', ${escJson(chargeSettings)}, NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`);
}

// ─── Write SQL output ────────────────────────────────────────
const sql = sqlParts.join('\n');
const outPath = path.join(ROOT, 'scripts', 'migration-output.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`\nSQL written to: ${outPath}`);
console.log(`Total SQL length: ${sql.length} characters`);

// Also write the UID mapping for reference
const mappingPath = path.join(ROOT, 'scripts', 'uid-mapping.json');
const mapping = {};
for (const [fbUid, sbUuid] of uidMap) {
  const authUser = allAuthUsers.find(u => u.localId === fbUid);
  mapping[fbUid] = { supabaseId: sbUuid, email: authUser?.email || 'unknown' };
}
fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');
console.log(`UID mapping written to: ${mappingPath}`);

// Write boat ID mapping
const boatMappingPath = path.join(ROOT, 'scripts', 'boat-id-mapping.json');
const boatMapping = {};
for (const [fbId, sbId] of boatIdMap) {
  boatMapping[fbId] = sbId;
}
fs.writeFileSync(boatMappingPath, JSON.stringify(boatMapping, null, 2), 'utf8');
console.log(`Boat ID mapping written to: ${boatMappingPath}`);

// Summary
console.log('\n═══ MIGRATION SUMMARY ═══');
console.log(`Auth users to create: ${uidMap.size}`);
console.log(`Profiles to create: ${uidMap.size}`);
console.log(`Boats to migrate: ${emailBoats.length}`);
console.log(`Orders to migrate: ${emailOrders.length}`);
console.log(`Conversations to migrate: ${emailConvs.length}`);
console.log(`Messages to migrate: ${allMessages.length}`);
console.log(`Reviews to migrate: ${emailReviews.length}`);
console.log(`Favorites to migrate: ${emailFavorites.length}`);
console.log(`Destinations: ${destinations.length}`);
console.log(`Articles: ${articles.length}`);
console.log(`Subscribers: ${subscribers.length}`);
console.log(`Settings: ${chargeSettings ? 1 : 0}`);

process.exit(0);
