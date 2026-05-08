import { supabase } from "./supabase";

export type EmailType =
  | "welcome"
  | "new_message"
  | "boat_approved"
  | "booking_request"
  | "payment_received";

// Fire-and-forget. Email failures must never block user flows or surface to the UI.
export async function sendNotificationEmail(
  type: EmailType,
  recipientId: string,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: { type, recipient_id: recipientId, data },
    });
    if (error) console.error("[email]", type, "invoke error:", error);
  } catch (err) {
    console.error("[email]", type, "failed:", err);
  }
}
