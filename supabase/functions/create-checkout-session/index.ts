import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    const {
      boatId,
      boatTitle,
      renterId,
      renterEmail,
      ownerId,
      startDate,
      endDate,
      totalPrice,
    } = await req.json();

    // Validate required fields
    if (!boatId || !renterId || !totalPrice) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof totalPrice !== "number" || totalPrice <= 0 || totalPrice > 1000000) {
      return new Response(
        JSON.stringify({ error: "Invalid totalPrice: must be a positive number under 1,000,000" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!startDate || !endDate) {
      return new Response(JSON.stringify({ error: "Missing startDate or endDate" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return new Response(
        JSON.stringify({ error: "Invalid dates: endDate must be after startDate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify boat exists in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: boat, error: boatError } = await supabase
      .from("boats")
      .select("id")
      .eq("id", boatId)
      .maybeSingle();

    if (boatError || !boat) {
      return new Response(JSON.stringify({ error: "Boat not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create PaymentIntent with idempotency key to prevent duplicate charges
    const idempotencyKey = `${boatId}-${renterId}-${startDate}-${endDate}-${Math.round(totalPrice * 100)}`;
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(totalPrice * 100),
        currency: "eur",
        receipt_email: renterEmail || undefined,
        metadata: {
          boatId,
          boatTitle: boatTitle || "",
          renterId,
          ownerId: ownerId || "",
          startDate,
          endDate,
        },
      },
      { idempotencyKey },
    );

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Stripe] Error creating payment intent:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to create payment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
