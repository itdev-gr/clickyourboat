export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";

function getStripe() {
  const key = import.meta.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const stripe = getStripe();
    const body = await request.json();
    const {
      boatId,
      boatTitle,
      renterId,
      renterEmail,
      ownerId,
      startDate,
      endDate,
      totalPrice,
    } = body;

    if (!boatId || !renterId || !totalPrice) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
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
    });

    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[Stripe] Error creating payment intent:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to create payment" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
