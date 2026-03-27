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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "STRIPE_SECRET_KEY is not configured" }, 500);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { sessionId } = await req.json();
    if (!sessionId) return json({ error: "Missing sessionId" }, 400);

    // --- Verify Checkout Session with Stripe ---
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { "Authorization": `Bearer ${stripeKey}` },
    });
    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      return json({ error: session.error?.message || "Failed to verify session" }, 500);
    }

    if (session.payment_status !== "paid") {
      return json({ error: `Payment not completed. Status: ${session.payment_status}` }, 400);
    }

    // --- Update order ---
    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({ payment_status: "succeeded", status: "confirmed" })
      .eq("checkout_session_id", sessionId)
      .select("id, boat_id, owner_id, renter_id, start_date, end_date")
      .single();

    if (updateErr || !order) {
      console.error("[confirm-order] Update failed:", updateErr);
      return json({ error: "Order not found or update failed" }, 500);
    }

    return json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("[confirm-order] Error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
