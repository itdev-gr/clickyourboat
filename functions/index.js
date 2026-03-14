const { onRequest } = require("firebase-functions/v2/https");
const Stripe = require("stripe");

exports.createCheckoutSession = onRequest(
  { cors: true, secrets: ["STRIPE_SECRET_KEY"] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        res.status(500).json({ error: "STRIPE_SECRET_KEY is not configured" });
        return;
      }
      const stripe = new Stripe(key);

      const {
        boatId,
        boatTitle,
        renterId,
        renterEmail,
        ownerId,
        startDate,
        endDate,
        totalPrice,
      } = req.body;

      if (!boatId || !renterId || !totalPrice) {
        res.status(400).json({ error: "Missing required fields" });
        return;
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

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.error("[Stripe] Error creating payment intent:", err);
      res.status(500).json({ error: err.message || "Failed to create payment" });
    }
  }
);
