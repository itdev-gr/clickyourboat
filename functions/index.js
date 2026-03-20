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

  // S6: Skip if this is our own translation update (prevent infinite loop)
  if (after._translating === true) {
    // Clear the flag
    await adminDb.doc(`boats/${event.params.boatId}`).update({ _translating: false });
    return;
  }

  const titleChanged = before?.listingTitle !== after.listingTitle;
  const descChanged = before?.description !== after.description;
  const needsBackfill = (after.listingTitle && !after.listingTitle_el) ||
                        (after.description && !after.description_el);
  if (!titleChanged && !descChanged && !needsBackfill) return;

  try {
    const updates = { _translating: true };
    if ((titleChanged || !after.listingTitle_el) && after.listingTitle) {
      const [translated] = await translate.translate(after.listingTitle, "el");
      updates.listingTitle_el = translated;
    }
    if ((descChanged || !after.description_el) && after.description) {
      const [translated] = await translate.translate(after.description, "el");
      updates.description_el = translated;
    }
    if (Object.keys(updates).length > 1) { // more than just _translating flag
      await adminDb.doc(`boats/${event.params.boatId}`).update(updates);
    }
  } catch (err) {
    console.error(`[translateBoatListing] Error translating boat ${event.params.boatId}:`, err);
    try {
      await adminDb.doc(`boats/${event.params.boatId}`).update({ _translationError: err.message || "Unknown error" });
    } catch (updateErr) {
      console.error(`[translateBoatListing] Failed to write error status:`, updateErr);
    }
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

      // S5: Comprehensive input validation
      if (!boatId || !renterId || !totalPrice) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }
      if (typeof totalPrice !== "number" || totalPrice <= 0 || totalPrice > 1000000) {
        res.status(400).json({ error: "Invalid totalPrice: must be a positive number under 1,000,000" });
        return;
      }
      if (!startDate || !endDate) {
        res.status(400).json({ error: "Missing startDate or endDate" });
        return;
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        res.status(400).json({ error: "Invalid dates: endDate must be after startDate" });
        return;
      }

      // Verify boat exists in Firestore
      const boatDoc = await adminDb.doc(`boats/${boatId}`).get();
      if (!boatDoc.exists) {
        res.status(400).json({ error: "Boat not found" });
        return;
      }

      // H8: Use idempotency key to prevent duplicate charges
      const idempotencyKey = `${boatId}-${renterId}-${startDate}-${endDate}-${Math.round(totalPrice * 100)}`;
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
      }, {
        idempotencyKey,
      });

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.error("[Stripe] Error creating payment intent:", err);
      res.status(500).json({ error: err.message || "Failed to create payment" });
    }
  }
);
