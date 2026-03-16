const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { Translate } = require("@google-cloud/translate").v2;
const Stripe = require("stripe");

initializeApp();
const translate = new Translate();
const adminDb = getFirestore();

exports.translateBoatListing = onDocumentWritten("boats/{boatId}", async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  if (!after) return; // deleted

  const titleChanged = before?.listingTitle !== after.listingTitle;
  const descChanged = before?.description !== after.description;
  const needsBackfill = (after.listingTitle && !after.listingTitle_el) ||
                        (after.description && !after.description_el);
  if (!titleChanged && !descChanged && !needsBackfill) return;

  const updates = {};
  if ((titleChanged || !after.listingTitle_el) && after.listingTitle) {
    const [translated] = await translate.translate(after.listingTitle, "el");
    updates.listingTitle_el = translated;
  }
  if ((descChanged || !after.description_el) && after.description) {
    const [translated] = await translate.translate(after.description, "el");
    updates.description_el = translated;
  }
  if (Object.keys(updates).length > 0) {
    await adminDb.doc(`boats/${event.params.boatId}`).update(updates);
  }
});

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
