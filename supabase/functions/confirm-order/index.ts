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

    // --- Fetch order to determine payment type ---
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, price_breakdown, boat_title, owner_id, renter_id")
      .eq("checkout_session_id", sessionId)
      .maybeSingle();

    const breakdown = existingOrder?.price_breakdown || {};
    const isPrepay = breakdown.paymentOption === "prepayment";
    const newStatus = isPrepay ? "partially_paid" : "paid";

    // --- Update order ---
    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({ payment_status: "succeeded", status: newStatus })
      .eq("checkout_session_id", sessionId)
      .select("id, boat_id, boat_title, owner_id, renter_id, renter_name, start_date, end_date, renter_message")
      .maybeSingle();

    if (updateErr) {
      console.error("[confirm-order] Update error:", JSON.stringify(updateErr));
      return json({ error: "Failed to update order" }, 500);
    }
    if (!order) {
      return json({ error: "No order found for this session" }, 404);
    }

    // --- Establish contact with the owner (find-or-create conversation) ---
    try {
      const boatTitle = order.boat_title || "your boat";
      const renterMsg = (order.renter_message || "").trim();
      const dateRange = `${order.start_date} to ${order.end_date}`;
      const messageText = renterMsg
        ? renterMsg
        : (isPrepay
            ? `Hi! I've just booked "${boatTitle}" for ${dateRange} and paid the deposit. Looking forward to it!`
            : `Hi! I've just booked and paid for "${boatTitle}" for ${dateRange}. Looking forward to it!`);
      const now = new Date().toISOString();

      // Find an existing conversation between the two participants
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, participants, unread_count")
        .contains("participants", [order.renter_id]);

      let conversationId: string | null = null;
      let unread: Record<string, number> = {};
      if (convs) {
        for (const c of convs) {
          if ((c.participants as string[])?.includes(order.owner_id)) {
            conversationId = c.id;
            unread = (c.unread_count as Record<string, number>) || {};
            break;
          }
        }
      }

      // Create one if none exists (pay-first: usually the first contact)
      if (!conversationId) {
        const { data: renterProfile } = await supabase
          .from("profiles").select("display_name, photo_url, first_name, last_name")
          .eq("id", order.renter_id).maybeSingle();
        const { data: ownerProfile } = await supabase
          .from("profiles").select("display_name, photo_url, first_name, last_name")
          .eq("id", order.owner_id).maybeSingle();

        const { data: newConv, error: convErr } = await supabase
          .from("conversations")
          .insert({
            participants: [order.renter_id, order.owner_id],
            participant_details: {
              [order.renter_id]: {
                displayName: renterProfile?.display_name || order.renter_name || "",
                photoURL: renterProfile?.photo_url || null,
                firstName: renterProfile?.first_name || "",
                lastName: renterProfile?.last_name || "",
              },
              [order.owner_id]: {
                displayName: ownerProfile?.display_name || "",
                photoURL: ownerProfile?.photo_url || null,
                firstName: ownerProfile?.first_name || "",
                lastName: ownerProfile?.last_name || "",
              },
            },
            last_message: { text: "", senderId: order.renter_id, timestamp: now },
            boat_id: order.boat_id,
            boat_title: boatTitle,
            unread_count: { [order.renter_id]: 0, [order.owner_id]: 0 },
          })
          .select("id")
          .single();
        if (convErr) throw convErr;
        conversationId = newConv.id;
        unread = { [order.renter_id]: 0, [order.owner_id]: 0 };
      }

      // Post the opening message from the renter and bump the owner's unread count
      const ownerUnread = (unread[order.owner_id] || 0) + 1;
      await supabase.from("conversations").update({
        last_message: { text: messageText, senderId: order.renter_id, timestamp: now },
        updated_at: now,
        unread_count: { ...unread, [order.owner_id]: ownerUnread },
      }).eq("id", conversationId);

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        text: messageText,
        sender_id: order.renter_id,
        sender_name: order.renter_name || "Renter",
        read_by: [order.renter_id],
      });
    } catch (notifErr) {
      console.error("[confirm-order] Conversation error:", notifErr);
      // Don't fail the order confirmation if messaging fails
    }

    // --- Email the owner about the new confirmed booking (fire-and-forget) ---
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${serviceKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_booking_owner",
          recipient_id: order.owner_id,
          data: {
            boat_title: order.boat_title || "your boat",
            renter_name: order.renter_name || "A traveler",
            start_date: order.start_date,
            end_date: order.end_date,
            is_prepay: isPrepay,
          },
        }),
      });
    } catch (emailErr) {
      console.error("[confirm-order] Owner email error:", emailErr);
    }

    // --- Send payment-received email to renter (fire-and-forget) ---
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const amount = (session.amount_total ?? 0) / 100;
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "payment_received",
          recipient_id: order.renter_id,
          data: {
            boat_title: order.boat_title || "your booking",
            amount,
            is_prepay: isPrepay,
          },
        }),
      });
    } catch (emailErr) {
      console.error("[confirm-order] Email error:", emailErr);
    }

    return json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("[confirm-order] Error:", err);
    return json({ error: err.message || "Internal error" }, 500);
  }
});
