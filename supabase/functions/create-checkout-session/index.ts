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

const INSURANCE_RATES: Record<string, number> = { "multi-risk": 47, "assistance": 29, "none": 0 };
const SKIPPER_PER_DAY = 100;
const WEATHER_PER_DAY = 14;
const DEFAULT_SITE_URL = "https://tapyourboat.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "STRIPE_SECRET_KEY is not configured" }, 500);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json();
    const {
      boatId, renterId, renterEmail, renterName, ownerId,
      startDate, endDate, siteUrl,
      insuranceType = "none", withSkipper = false, weatherGuarantee = false,
      paymentOption = "full",
    } = body;

    if (!boatId || !renterId || !startDate || !endDate) {
      return json({ error: "Missing required fields" }, 400);
    }
    const resolvedSiteUrl = siteUrl || DEFAULT_SITE_URL;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return json({ error: "Invalid dates" }, 400);
    }
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // --- Fetch boat ---
    const { data: boat, error: boatErr } = await supabase
      .from("boats")
      .select("id, price_per_day, price, security_deposit, downpayment_percentage, manufacturer, model, listing_title, boat_name, images, owner_id")
      .eq("id", boatId).maybeSingle();
    if (boatErr || !boat) return json({ error: "Boat not found" }, 400);

    const pricePerDay = Number(boat.price_per_day || boat.price || 0);
    const securityDeposit = Number(boat.security_deposit || 0);
    const boatTitle = boat.listing_title || boat.boat_name || [boat.manufacturer, boat.model].filter(Boolean).join(" ") || "Boat";
    const boatImage = boat.images?.[0] || "";
    const actualOwnerId = ownerId || boat.owner_id || "";

    // --- Fetch charge settings ---
    const { data: settingsRow } = await supabase.from("settings").select("value").eq("key", "charges").maybeSingle();
    const charges = settingsRow?.value || {};
    const serviceFee = Number(charges.serviceFee || 0);
    const platformFeePercent = Number(charges.platformFeePercent || 0);

    // --- Compute price ---
    const charterPrice = days * pricePerDay;
    const insuranceTot = (INSURANCE_RATES[insuranceType] || 0) * days;
    const skipperTot = withSkipper ? SKIPPER_PER_DAY * days : 0;
    const weatherTot = weatherGuarantee ? WEATHER_PER_DAY * days : 0;
    // Platform fee always on full charter price
    const fullSubtotal = charterPrice + insuranceTot + skipperTot + weatherTot;
    const platformFee = Math.round(fullSubtotal * platformFeePercent) / 100;

    // Handle prepayment: charge 30% of charter price + full fees
    const isPrepay = paymentOption === "prepayment";
    const charterCharged = isPrepay ? Math.round(charterPrice * 0.3 * 100) / 100 : charterPrice;
    const charterBalance = isPrepay ? charterPrice - charterCharged : 0;
    const total = charterCharged + insuranceTot + skipperTot + weatherTot + serviceFee + platformFee + securityDeposit;
    const fullTotal = charterPrice + insuranceTot + skipperTot + weatherTot + serviceFee + platformFee + securityDeposit;
    if (total <= 0) return json({ error: "Calculated total must be positive" }, 400);

    const breakdown = {
      charterPrice, charterCharged, charterBalance, insuranceTot, skipperTot, weatherTot,
      serviceFee, platformFee, securityDeposit, days, pricePerDay, paymentOption, fullTotal,
    };

    // --- Check availability ---
    const { data: overlapping } = await supabase.from("orders").select("id")
      .eq("boat_id", boatId).neq("status", "cancelled")
      .lt("start_date", endDate).gt("end_date", startDate).limit(1);
    if (overlapping && overlapping.length > 0) {
      return json({ error: "Boat is not available for the selected dates" }, 409);
    }

    // --- Insert pending order ---
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      boat_id: boatId, boat_title: boatTitle, boat_image: boatImage,
      renter_id: renterId, renter_name: renterName || "",
      owner_id: actualOwnerId, start_date: startDate, end_date: endDate,
      total_price: total, status: "pending", payment_status: "pending",
      insurance_type: insuranceType, skipper_included: withSkipper,
      weather_guarantee: weatherGuarantee, price_breakdown: breakdown,
    }).select("id").single();
    if (orderErr || !order) {
      console.error("[Order] Insert failed:", JSON.stringify(orderErr));
      return json({ error: "Failed to create order" }, 500);
    }

    // --- Create Stripe Checkout Session ---
    const cancelUrl = `${resolvedSiteUrl}/confirm-booking?boatId=${boatId}&startDate=${startDate}&endDate=${endDate}`;
    const successUrl = `${resolvedSiteUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}&startDate=${startDate}&endDate=${endDate}`;

    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);
    params.append("line_items[0][price_data][currency]", "eur");
    params.append("line_items[0][price_data][product_data][name]", isPrepay ? `Boat Charter (30% Prepayment): ${boatTitle}` : `Boat Charter: ${boatTitle}`);
    params.append("line_items[0][price_data][product_data][description]", `${days} day${days > 1 ? "s" : ""} · ${startDate} to ${endDate}`);
    params.append("line_items[0][price_data][unit_amount]", String(Math.round(total * 100)));
    params.append("line_items[0][quantity]", "1");
    if (renterEmail) params.append("customer_email", renterEmail);
    params.append("metadata[orderId]", order.id);
    params.append("metadata[boatId]", boatId);
    params.append("metadata[renterId]", renterId);
    params.append("metadata[ownerId]", actualOwnerId);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error("[Stripe] Error:", JSON.stringify(session));
      await supabase.from("orders").delete().eq("id", order.id);
      return json({ error: session.error?.message || "Failed to create checkout session" }, 500);
    }

    // --- Update order with session ID ---
    await supabase.from("orders").update({ checkout_session_id: session.id }).eq("id", order.id);

    return json({ url: session.url, total, breakdown });
  } catch (err) {
    console.error("[create-checkout-session] Error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
