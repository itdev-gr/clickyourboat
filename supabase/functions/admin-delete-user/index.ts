import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Missing Authorization header" }, 401);

  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "Invalid session" }, 401);
  const callerId = userData.user.id;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: callerProfile, error: profErr } = await admin
    .from("profiles")
    .select("user_type")
    .eq("id", callerId)
    .maybeSingle();
  if (profErr) return json({ error: profErr.message }, 500);
  if (callerProfile?.user_type !== "admin") return json({ error: "Forbidden" }, 403);

  let body: { uid?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const targetUid = body.uid;
  if (!targetUid || typeof targetUid !== "string") return json({ error: "uid is required" }, 400);
  if (targetUid === callerId) return json({ error: "You cannot delete your own account" }, 400);

  const { error: delProfileErr } = await admin
    .from("profiles")
    .delete()
    .eq("id", targetUid);
  if (delProfileErr) return json({ error: `Profile delete failed: ${delProfileErr.message}` }, 500);

  const { error: delAuthErr } = await admin.auth.admin.deleteUser(targetUid);
  if (delAuthErr && !/User not found/i.test(delAuthErr.message)) {
    return json({ error: `Auth delete failed: ${delAuthErr.message}` }, 500);
  }

  return json({ ok: true, uid: targetUid });
});
