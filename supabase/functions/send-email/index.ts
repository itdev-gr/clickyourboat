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

type EmailType =
  | "welcome"
  | "new_message"
  | "boat_approved"
  | "booking_request"
  | "payment_received";

const PREF_COLUMN: Record<Exclude<EmailType, "welcome">, string> = {
  new_message: "email_new_message",
  boat_approved: "email_boat_approved",
  booking_request: "email_booking_request",
  payment_received: "email_payment_received",
};

const BRAND = "TapYourBoat";
const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://tapyourboat.com";

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function layout(title: string, bodyHtml: string, cta?: { label: string; url: string }): string {
  const ctaHtml = cta
    ? `<p style="text-align:center;margin:32px 0 8px;"><a href="${escapeHtml(cta.url)}" style="display:inline-block;background:#ff4d6d;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:12px;font-family:Arial,sans-serif;font-size:14px;">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #f1f5f9;">
          <a href="${escapeHtml(SITE_URL)}" style="text-decoration:none;color:#0f172a;font-size:18px;font-weight:800;letter-spacing:-0.01em;">${BRAND}</a>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a;">${escapeHtml(title)}</h1>
          <div style="font-size:15px;line-height:1.6;color:#334155;">${bodyHtml}</div>
          ${ctaHtml}
        </td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">
          You're receiving this email because you have an account on ${BRAND}. You can change your email preferences in <a href="${escapeHtml(SITE_URL)}/account" style="color:#94a3b8;">your account settings</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildEmail(
  type: EmailType,
  recipient: { first_name?: string | null; display_name?: string | null },
  data: Record<string, any>
): { subject: string; html: string } {
  const name = recipient.first_name || (recipient.display_name || "").split(" ")[0] || "there";
  switch (type) {
    case "welcome": {
      return {
        subject: `Welcome to ${BRAND}, ${name}!`,
        html: layout(
          `Welcome aboard, ${escapeHtml(name)}!`,
          `<p>Thanks for joining <strong>${BRAND}</strong>. We're thrilled to have you with us.</p>
           <p>You can now browse boats, save your favorites, and book your next trip in just a few taps.</p>
           <p>If you own a boat, you can list it and start earning — we'll be there every step of the way.</p>`,
          { label: "Explore boats", url: `${SITE_URL}/boat-rental` }
        ),
      };
    }
    case "new_message": {
      const senderName = data.sender_name || "Someone";
      const preview = (data.preview || "").toString().slice(0, 200);
      return {
        subject: `New message from ${senderName}`,
        html: layout(
          `You have a new message`,
          `<p><strong>${escapeHtml(senderName)}</strong> sent you a new message on ${BRAND}.</p>
           ${preview ? `<blockquote style="margin:16px 0;padding:12px 16px;background:#f8fafc;border-left:3px solid #ff4d6d;border-radius:6px;color:#475569;">${escapeHtml(preview)}</blockquote>` : ""}`,
          { label: "Open conversation", url: `${SITE_URL}/messages` }
        ),
      };
    }
    case "boat_approved": {
      const boatTitle = data.boat_title || "Your boat";
      return {
        subject: `${boatTitle} is now live on ${BRAND}`,
        html: layout(
          `Your boat is live!`,
          `<p>Great news, ${escapeHtml(name)}! Your listing <strong>${escapeHtml(boatTitle)}</strong> has been approved and is now visible to renters on ${BRAND}.</p>
           <p>Renters can now discover and book your boat.</p>`,
          { label: "View my listings", url: `${SITE_URL}/my-offers` }
        ),
      };
    }
    case "booking_request": {
      const boatTitle = data.boat_title || "your boat";
      const renterName = data.renter_name || "A traveler";
      const startDate = data.start_date || "";
      const endDate = data.end_date || "";
      const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : "the requested dates";
      return {
        subject: `New booking request for ${boatTitle}`,
        html: layout(
          `New booking request`,
          `<p><strong>${escapeHtml(renterName)}</strong> would like to book <strong>${escapeHtml(boatTitle)}</strong> for <strong>${escapeHtml(dateRange)}</strong>.</p>
           <p>Review the request and accept or decline it from your bookings page.</p>`,
          { label: "Review booking", url: `${SITE_URL}/bookings` }
        ),
      };
    }
    case "payment_received": {
      const boatTitle = data.boat_title || "your booking";
      const amount = data.amount ? `€${Number(data.amount).toFixed(2)}` : "";
      const isPrepay = !!data.is_prepay;
      const headline = isPrepay
        ? `Prepayment received for ${escapeHtml(boatTitle)}`
        : `Payment confirmed for ${escapeHtml(boatTitle)}`;
      const body = isPrepay
        ? `<p>We've received your prepayment${amount ? ` of <strong>${escapeHtml(amount)}</strong>` : ""} for <strong>${escapeHtml(boatTitle)}</strong>.</p>
           <p>The remaining balance will be due before your trip — we'll remind you in advance.</p>`
        : `<p>Your payment${amount ? ` of <strong>${escapeHtml(amount)}</strong>` : ""} for <strong>${escapeHtml(boatTitle)}</strong> is confirmed.</p>
           <p>Get ready for an amazing time on the water!</p>`;
      return {
        subject: headline.replace(/<[^>]+>/g, ""),
        html: layout(headline, body, { label: "View booking", url: `${SITE_URL}/bookings` }),
      };
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "RESEND_API_KEY is not configured" }, 500);

    const fromAddress = Deno.env.get("EMAIL_FROM") || "TapYourBoat <onboarding@resend.dev>";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const type = body.type as EmailType;
    const recipientId = body.recipient_id as string | undefined;
    const data = (body.data || {}) as Record<string, any>;

    if (!type || !recipientId) {
      return json({ error: "Missing type or recipient_id" }, 400);
    }

    // Fetch recipient profile (email + preferences)
    const prefCol = type !== "welcome" ? PREF_COLUMN[type] : null;
    const selectCols = `email, first_name, display_name${prefCol ? `, ${prefCol}` : ""}`;
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select(selectCols)
      .eq("id", recipientId)
      .maybeSingle();

    if (profileErr) {
      console.error("[send-email] profile lookup error:", profileErr);
      return json({ error: "Failed to load recipient profile" }, 500);
    }
    if (!profile?.email) {
      return json({ skipped: true, reason: "no_email" });
    }

    // Honor preference (welcome always sends)
    if (prefCol && profile[prefCol] === false) {
      return json({ skipped: true, reason: "preference_off" });
    }

    const { subject, html } = buildEmail(type, profile, data);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [profile.email],
        subject,
        html,
      }),
    });

    const resendBody = await resendRes.json().catch(() => ({}));
    if (!resendRes.ok) {
      console.error("[send-email] Resend error:", resendBody);
      return json({ error: resendBody?.message || "Failed to send email" }, 502);
    }

    return json({ success: true, id: resendBody.id });
  } catch (err) {
    console.error("[send-email] Error:", err);
    return json({ error: (err as Error).message || "Internal error" }, 500);
  }
});
