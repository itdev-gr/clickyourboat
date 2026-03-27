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

const INSURANCE_RATES: Record<string, number> = {
  "multi-risk": 47,
  "assistance": 29,
  "none": 0,
};
const SKIPPER_PER_DAY = 100;
const WEATHER_PER_DAY = 14;

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

    const body = await req.json();
    const {
      boatId, renterId, renterEmail, renterName, ownerId,
      startDate, endDate,
      insuranceType = "none",
      withSkipper = false,
      weatherGuarantee = false,
    } = body;

    // --- Validate inputs ---
    if (!boatId || !renterId || !startDate || !endDate) {
      return json({ error: "Missing required fields" }, 400);
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return json({ error: "Invalid dates" }, 400);
    }
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // --- Fetch boat ---
    const { data: boat, error: boatErr } = await supabase
      .from("boats")
      .select("id, price_per_day, price, security_deposit, manufacturer, model, listing_title, boat_name, images, owner_id")
      .eq("id", boatId)
      .maybeSingle();
    if (boatErr || !boat) return json({ error: "Boat not found" }, 400);

    const pricePerDay = Number(boat.price_per_day || boat.price || 0);
    const securityDeposit = Number(boat.security_deposit || 0);
    const boatTitle = boat.listing_title || boat.boat_name || [boat.manufacturer, boat.model].filter(Boolean).join(" ") || "Boat";
    const boatImage = boat.images?.[0] || "";
    const actualOwnerId = ownerId || boat.owner_id || "";

    // --- Fetch charge settings ---
    const { data: settingsRow } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "charges")
      .maybeSingle();
    const charges = settingsRow?.value || {};
    const serviceFee = Number(charges.serviceFee || 0);
    const platformFeePercent = Number(charges.platformFeePercent || 0);

    // --- Compute price server-side ---
    const charterPrice = days * pricePerDay;
    const insurancePerDay = INSURANCE_RATES[insuranceType] || 0;
    const insuranceTot = insurancePerDay * days;
    const skipperTot = withSkipper ? SKIPPER_PER_DAY * days : 0;
    const weatherTot = weatherGuarantee ? WEATHER_PER_DAY * days : 0;
    const subtotal = charterPrice + insuranceTot + skipperTot + weatherTot;
    const platformFee = Math.round(subtotal * platformFeePercent) / 100;
    const total = subtotal + serviceFee + platformFee + securityDeposit;

    if (total <= 0) return json({ error: "Calculated total must be positive" }, 400);

    const breakdown = {
      charterPrice, insuranceTot, skipperTot, weatherTot,
      serviceFee, platformFee, securityDeposit, days, pricePerDay,
    };

    // --- Check availability (no overlapping confirmed orders) ---
    const { data: overlapping } = await supabase
      .from("orders")
      .select("id")
      .eq("boat_id", boatId)
      .neq("status", "cancelled")
      .lt("start_date", endDate)
      .gt("end_date", startDate)
      .limit(1);
    if (overlapping && overlapping.length > 0) {
      return json({ error: "Boat is not available for the selected dates" }, 409);
    }

    // --- Create Stripe PaymentIntent ---
    const params = new URLSearchParams();
    params.append("amount", String(Math.round(total * 100)));
    params.append("currency", "eur");
    if (renterEmail) params.append("receipt_email", renterEmail);
    params.append("metadata[boatId]", boatId);
    params.append("metadata[boatTitle]", boatTitle);
    params.append("metadata[renterId]", renterId);
    params.append("metadata[ownerId]", actualOwnerId);
    params.append("metadata[startDate]", startDate);
    params.append("metadata[endDate]", endDate);

    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const stripeData = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error("[Stripe] Error:", JSON.stringify(stripeData));
      return json({ error: stripeData.error?.message || "Failed to create payment" }, 500);
    }

    // --- Insert pending order ---
    const { error: orderErr } = await supabase.from("orders").insert({
      boat_id: boatId,
      boat_title: boatTitle,
      boat_image: boatImage,
      renter_id: renterId,
      renter_name: renterName || "",
      owner_id: actualOwnerId,
      start_date: startDate,
      end_date: endDate,
      total_price: total,
      status: "pending",
      payment_intent_id: stripeData.id,
      payment_status: "pending",
      insurance_type: insuranceType,
      skipper_included: withSkipper,
      weather_guarantee: weatherGuarantee,
      price_breakdown: breakdown,
    });
    if (orderErr) {
      console.error("[Order] Insert failed:", orderErr);
      return json({ error: "Failed to create order" }, 500);
    }

    return json({
      clientSecret: stripeData.client_secret,
      paymentIntentId: stripeData.id,
      total,
      breakdown,
    });
  } catch (err) {
    console.error("[create-checkout-session] Error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
