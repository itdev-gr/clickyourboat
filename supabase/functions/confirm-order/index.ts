import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "STRIPE_SECRET_KEY is not configured" }, 500);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { paymentIntentId } = await req.json();
    if (!paymentIntentId) {
      return json({ error: "Missing paymentIntentId" }, 400);
    }

    // --- Verify payment with Stripe ---
    const stripeRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: { "Authorization": `Bearer ${stripeKey}` },
    });
    const pi = await stripeRes.json();
    if (!stripeRes.ok) {
      return json({ error: pi.error?.message || "Failed to verify payment" }, 500);
    }

    if (pi.status !== "succeeded") {
      return json({ error: `Payment not succeeded. Status: ${pi.status}` }, 400);
    }

    // --- Update order ---
    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({ payment_status: "succeeded", status: "confirmed" })
      .eq("payment_intent_id", paymentIntentId)
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
