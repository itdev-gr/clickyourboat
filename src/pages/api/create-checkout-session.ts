export const prerender = false;

import type { APIRoute } from "astro";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      boatId,
      boatTitle,
      boatImage,
      renterId,
      renterEmail,
      ownerId,
      startDate,
      endDate,
      charterPrice,
      insuranceCost,
      weatherCost,
      serviceFee,
      platformFee,
      totalPrice,
    } = body;

    if (!boatId || !renterId || !totalPrice) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: boatTitle || "Boat Rental",
            description: `${startDate} — ${endDate}`,
            ...(boatImage ? { images: [boatImage] } : {}),
          },
          unit_amount: Math.round(charterPrice * 100),
        },
        quantity: 1,
      },
    ];

    if (insuranceCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Cruise Insurance" },
          unit_amount: Math.round(insuranceCost * 100),
        },
        quantity: 1,
      });
    }

    if (weatherCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Weather Guarantee" },
          unit_amount: Math.round(weatherCost * 100),
        },
        quantity: 1,
      });
    }

    if (serviceFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Service Fee" },
          unit_amount: Math.round(serviceFee * 100),
        },
        quantity: 1,
      });
    }

    if (platformFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Platform Fee" },
          unit_amount: Math.round(platformFee * 100),
        },
        quantity: 1,
      });
    }

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: renterEmail || undefined,
      metadata: {
        boatId,
        renterId,
        ownerId,
        startDate,
        endDate,
        totalPrice: String(totalPrice),
      },
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}&boatId=${boatId}&startDate=${startDate}&endDate=${endDate}`,
      cancel_url: `${origin}/confirm-booking?boatId=${boatId}&startDate=${startDate}&endDate=${endDate}`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[Stripe] Error creating checkout session:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to create checkout session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
