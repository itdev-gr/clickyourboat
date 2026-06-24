# Pay-First Booking Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change the booking pipeline so a renter pays immediately (instant pay-and-book) and only *then* is put in contact with the boat owner — removing the owner accept/decline approval gate entirely.

**Architecture:** The renter confirms options on `confirm-booking`, which now redirects straight to Stripe Checkout (via the existing `create-checkout-session` edge function's "new order" branch). On successful payment, `confirm-order` flips the order to paid, **creates a renter↔owner conversation** (currently it only messages if one already exists), and emails both parties. The "Contact owner" button unlocks for any paid order. No owner approval step remains.

**Tech Stack:** Astro 5 (static output) + client-side TS, Supabase (Postgres + Edge Functions on Deno), Stripe Checkout, custom in-app messaging (`conversations`/`messages` tables) and email (`send-email` edge function + Resend).

> **No automated test harness exists** in this repo (no `test` script, no test files, no Vitest/Jest/Playwright). Setting one up for an Astro+Deno+Stripe app is a separate effort and is out of scope. Each task below therefore verifies with: (a) `npx astro check` for `.astro`/TS type-safety, (b) `deno check` for edge functions, (c) a **manual end-to-end click-through** on `http://localhost:4322` using a Stripe **test card** (`4242 4242 4242 4242`, any future expiry/CVC), and (d) **SQL assertions** via the Supabase MCP `execute_sql` (project ref `dmukceeargocoxtqzyga`). Adding Playwright E2E coverage is a recommended follow-up.

> **Deployment note:** Edge functions run on Supabase, not under `astro dev`. The local `.env` points the browser at the **live** project, so edge-function changes (Tasks 1–3) only take effect after **deploying** them (Task 4). Deploy via the Supabase CLI (`supabase functions deploy <name>`) or the Supabase MCP `deploy_edge_function`. `STRIPE_SECRET_KEY` is already configured as a function secret (payments work in prod).

---

## File Structure

**Modified — Edge functions (Deno, deploy to take effect):**
- `supabase/functions/create-checkout-session/index.ts` — accept + persist `renterMessage` on the new order.
- `supabase/functions/confirm-order/index.ts` — **find-or-create** the renter↔owner conversation, post the opening message, and email the owner.
- `supabase/functions/send-email/index.ts` — add a `new_booking_owner` email template.

**Modified — Front-end (Astro, hot-reloads under `astro dev`):**
- `src/pages/[...lang]/confirm-booking.astro` — Confirm button now goes straight to Stripe (pay-first) instead of `createBookingRequest()`.
- `src/pages/[...lang]/boat-detail.astro` — unlock "Contact owner" for paid orders.
- `src/pages/[...lang]/boat/[id].astro` — same unlock condition (alternate boat-detail route).
- `src/pages/[...lang]/booking-success.astro` — post-payment copy + "Message owner" CTA.

**Unchanged but now legacy (left intact, documented in Task 9):**
- `src/lib/api.ts` `createBookingRequest` / `acceptBookingRequest` / `declineBookingRequest` — no longer on the happy path; kept so any pre-existing `requested`/`accepted` orders still work.
- `src/pages/[...lang]/my-offers.astro`, `pay-booking.astro`, `Header.astro`/`DashboardSidebar.astro` "requested" badges — keep handling legacy orders.

---

## Task 1: Persist renter's message through checkout

The pay-first flow has no order until payment starts, so the renter's optional note must travel through `create-checkout-session` onto the new order, where `confirm-order` (Task 3) turns it into the opening message to the owner.

**Files:**
- Modify: `supabase/functions/create-checkout-session/index.ts:31-37` (body destructure) and `:124-132` (new-order insert)

- [ ] **Step 1: Accept `renterMessage` in the request body**

In the destructure block (currently lines 31-37), add `renterMessage`:

```ts
    const {
      orderId: existingOrderId,
      boatId, renterId, renterEmail, renterName, ownerId,
      startDate, endDate, siteUrl,
      insuranceType = "none", withSkipper = false, weatherGuarantee = false,
      paymentOption = "full", isHalfDay = false,
      renterMessage = "",
    } = body;
```

- [ ] **Step 2: Store it on the new-order insert**

In the `else` (new order) branch, add `renter_message` to the insert object (currently lines 125-132):

```ts
      const { data: newOrder, error: orderErr } = await supabase.from("orders").insert({
        boat_id: boatId, boat_title: boatTitle, boat_image: boatImage,
        renter_id: renterId, renter_name: renterName || "",
        owner_id: actualOwnerId, start_date: startDate, end_date: endDate,
        total_price: total, status: "pending", payment_status: "pending",
        insurance_type: insuranceType, skipper_included: withSkipper,
        weather_guarantee: weatherGuarantee, price_breakdown: breakdown,
        renter_message: renterMessage || null,
      }).select("id").single();
```

- [ ] **Step 3: Type-check the function**

Run: `deno check supabase/functions/create-checkout-session/index.ts`
Expected: PASS (no type errors). If `deno` is not installed, skip — it is re-verified by deploy in Task 4.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/create-checkout-session/index.ts
git commit -m "feat(checkout): carry renter message onto pay-first order"
```

---

## Task 2: Add owner "new booking" email template

On payment the owner must be emailed. The existing `payment_received` template is renter-facing; add an owner-facing `new_booking_owner` type to the `send-email` function. Reuse the existing `email_booking_request` preference column so no DB migration is needed.

**Files:**
- Modify: `supabase/functions/send-email/index.ts:16-30` (type + pref map) and `:115-130` (add a `case` after `booking_request`)

- [ ] **Step 1: Add the type and preference mapping**

Update the `EmailType` union (lines 16-22) and `PREF_COLUMN` (lines 24-30):

```ts
type EmailType =
  | "welcome"
  | "new_message"
  | "boat_approved"
  | "booking_request"
  | "new_booking_owner"
  | "payment_received"
  | "review_request";

const PREF_COLUMN: Record<Exclude<EmailType, "welcome">, string> = {
  new_message: "email_new_message",
  boat_approved: "email_boat_approved",
  booking_request: "email_booking_request",
  new_booking_owner: "email_booking_request",
  payment_received: "email_payment_received",
  review_request: "email_review_request",
};
```

- [ ] **Step 2: Add the template case**

Insert this `case` in `buildEmail` immediately after the `booking_request` case closes (after current line 130):

```ts
    case "new_booking_owner": {
      const boatTitle = data.boat_title || "your boat";
      const renterName = data.renter_name || "A traveler";
      const startDate = data.start_date || "";
      const endDate = data.end_date || "";
      const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : "the booked dates";
      const isPrepay = !!data.is_prepay;
      return {
        subject: `New confirmed booking for ${boatTitle}`,
        html: layout(
          `You have a new booking!`,
          `<p>Good news, ${escapeHtml(name)}! <strong>${escapeHtml(renterName)}</strong> has just
             booked and ${isPrepay ? "paid a deposit for" : "paid for"} <strong>${escapeHtml(boatTitle)}</strong>
             for <strong>${escapeHtml(dateRange)}</strong>.</p>
           <p>The booking is confirmed. Message the renter to arrange handover details.</p>`,
          { label: "Open conversation", url: `${SITE_URL}/messages` }
        ),
      };
    }
```

- [ ] **Step 3: Type-check the function**

Run: `deno check supabase/functions/send-email/index.ts`
Expected: PASS. (Skip if `deno` unavailable; re-verified on deploy.)

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/send-email/index.ts
git commit -m "feat(email): add new_booking_owner template"
```

---

## Task 3: Confirm-order — create the conversation + email the owner

This is the core of "then come in contact with the owner." Today `confirm-order` only posts a message **if a conversation already exists**, and only emails the renter. Change it to **find-or-create** the conversation (so contact is established even on a first-time, pay-first booking) and email the owner.

**Files:**
- Modify: `supabase/functions/confirm-order/index.ts:42-67` (also select `renter_message`), `:69-112` (replace notification block), and add an owner-email block after it.

- [ ] **Step 1: Also fetch `renter_message` on the order update**

Change the update's `.select(...)` (currently line 58) to include the message and price breakdown:

```ts
    const { data: order, error: updateErr } = await supabase
      .from("orders")
      .update({ payment_status: "succeeded", status: newStatus })
      .eq("checkout_session_id", sessionId)
      .select("id, boat_id, boat_title, owner_id, renter_id, renter_name, start_date, end_date, renter_message")
      .maybeSingle();
```

- [ ] **Step 2: Replace the owner-notification block with find-or-create**

Replace the entire `// --- Notify owner via messaging ---` try block (currently lines 69-112) with this. It finds an existing renter↔owner conversation or **creates one**, then posts the opening message (the renter's note if present, else a default):

```ts
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
```

- [ ] **Step 3: Email the owner (new) — add after the conversation block, before the renter email**

The renter `payment_received` email block already exists (current lines 114-137). Add this owner email immediately **before** it:

```ts
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
```

- [ ] **Step 4: Type-check the function**

Run: `deno check supabase/functions/confirm-order/index.ts`
Expected: PASS. (Skip if `deno` unavailable; re-verified on deploy.)

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/confirm-order/index.ts
git commit -m "feat(confirm-order): create owner conversation + owner email on paid"
```

---

## Task 4: Deploy the three edge functions

Front-end changes (Tasks 5–8) call the **live** functions, so deploy before manual testing.

**Files:** none (deployment only)

- [ ] **Step 1: Deploy all three**

Preferred (Supabase MCP), one call per function with `project_id: "dmukceeargocoxtqzyga"`:
`deploy_edge_function` for `create-checkout-session`, then `send-email`, then `confirm-order`.

CLI alternative (requires `supabase login` + linked project):

```bash
supabase functions deploy create-checkout-session --project-ref dmukceeargocoxtqzyga
supabase functions deploy send-email --project-ref dmukceeargocoxtqzyga
supabase functions deploy confirm-order --project-ref dmukceeargocoxtqzyga
```

- [ ] **Step 2: Verify deploy succeeded**

Expected: each deploy reports success / a new version. Via MCP, `list_edge_functions` shows updated `updated_at` timestamps for all three.

- [ ] **Step 3: Commit** — none (no file changes). Skip.

---

## Task 5: Pay-first redirect on confirm-booking

Replace the request-creation Confirm handler with a redirect straight to Stripe Checkout, mirroring `pay-booking.astro`'s pay button but with **no pre-existing order**.

**Files:**
- Modify: `src/pages/[...lang]/confirm-booking.astro:365` (imports) and `:689-776` (Confirm handler)

- [ ] **Step 1: Drop the now-unused imports**

Change the import on line 365 from:

```ts
  import { getBoatListing, getChargeSettings, sendBookingNotification, createBookingRequest } from "../../lib/api";
```

to:

```ts
  import { getBoatListing, getChargeSettings } from "../../lib/api";
```

- [ ] **Step 2: Replace the Confirm handler body**

Replace the whole `confirmBtn?.addEventListener("click", ...)` handler (currently lines 691-776) with a pay-first version. It gathers the same option inputs, then POSTs to `create-checkout-session` and redirects to Stripe:

```ts
      confirmBtn?.addEventListener("click", async () => {
        $("confirm-error")?.classList.add("hidden");

        if (!currentUser) {
          window.location.href = localPath("/login?redirect=") + encodeURIComponent(window.location.href);
          return;
        }

        confirmBtn.disabled = true;
        confirmBtn.textContent = getLangPrefix() === "gr" ? "Μετάβαση στην πληρωμή..." : "Redirecting to payment...";

        try {
          const insuranceRadio = document.querySelector('input[name="insurance"]:checked') as HTMLInputElement;
          const skipperRadio = document.querySelector('input[name="rental-type"]:checked') as HTMLInputElement;
          const weatherRadio = document.querySelector('input[name="weather"]:checked') as HTMLInputElement;

          const insuranceType = insuranceRadio?.value || "none";
          const withSkipper = skipperRadio?.value === "with-skipper";
          const weatherGuarantee = weatherRadio?.value === "yes";
          const renterMessage = msgTextarea?.value?.trim() || "";
          const renterName = currentUser.user_metadata?.full_name || currentUser.email || "Renter";
          const siteUrl = window.location.origin + (getLangPrefix() ? "/" + getLangPrefix() : "");

          const res = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              boatId: boatId!,
              renterId: currentUser.id,
              renterEmail: currentUser.email || "",
              renterName,
              ownerId,
              startDate: startDateStr!,
              endDate: endDateStr!,
              siteUrl,
              insuranceType,
              withSkipper,
              weatherGuarantee,
              paymentOption: selectedPaymentOption,
              isHalfDay,
              renterMessage,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to start payment");

          window.location.href = data.url;
        } catch (err: any) {
          const errorText = $("confirm-error-text");
          if (errorText) errorText.textContent = err.message || "Failed to start payment.";
          $("confirm-error")?.classList.remove("hidden");
          confirmBtn.disabled = false;
          confirmBtn.textContent = getLangPrefix() === "gr" ? "Συνέχεια στην πληρωμή" : "Continue to payment";
        }
      });
```

- [ ] **Step 3: Update the Confirm button's resting label**

Find the confirm button markup (search `id="confirm-btn"` in the same file) and set its visible text to `Continue to payment` (and the Greek `data-i18n` value, if present, to `Συνέχεια στην πληρωμή`). If it currently reads "Send booking request"/"Confirm and pay", replace that text node.

- [ ] **Step 4: Type-check**

Run: `npx astro check`
Expected: 0 errors. (Pre-existing warnings unrelated to this file are acceptable; no new errors referencing `confirm-booking.astro`.)

- [ ] **Step 5: Manual check — redirect reaches Stripe**

With the dev server running (`npm run dev`, http://localhost:4322), log in, open a boat, pick dates → Continue Booking → on `confirm-booking` click **Continue to payment**. Expected: browser redirects to `checkout.stripe.com`. Cancel back; via MCP `execute_sql` confirm a `pending` order now exists:

```sql
select id, status, payment_status, renter_message, total_price
from public.orders order by created_at desc limit 1;
```

Expected: newest row `status = 'pending'`, `payment_status = 'pending'`, `renter_message` matches what you typed.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/[...lang]/confirm-booking.astro"
git commit -m "feat(booking): confirm-booking pays first via Stripe (no approval gate)"
```

---

## Task 6: Unlock "Contact owner" for paid orders (boat-detail)

After payment the order is `paid`/`partially_paid` (never auto-`confirmed`), so the contact gate must include those statuses.

**Files:**
- Modify: `src/pages/[...lang]/boat-detail.astro:858`

- [ ] **Step 1: Widen the unlock query**

Change line 858 from:

```ts
            .in("status", ["confirmed", "completed"])
```

to:

```ts
            .in("status", ["paid", "partially_paid", "confirmed", "completed"])
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: no new errors referencing `boat-detail.astro`.

- [ ] **Step 3: Manual check**

Complete a **test payment** (Stripe card `4242 4242 4242 4242`) for a boat, then reopen that boat's detail page as the same renter. Expected: the "Contact owner" button is visible (not the "Contact available after booking" lock).

- [ ] **Step 4: Commit**

```bash
git add "src/pages/[...lang]/boat-detail.astro"
git commit -m "feat(boat-detail): unlock contact owner for paid orders"
```

---

## Task 7: Same unlock on the alternate boat route

`boat/[id].astro` has the same gate in two places.

**Files:**
- Modify: `src/pages/[...lang]/boat/[id].astro:598` and `:717`

- [ ] **Step 1: Update both conditions**

At lines 598 and 717, change each occurrence of:

```ts
        (o: any) => o.boatId === boatId && (o.status === "confirmed" || o.status === "completed")
```

to:

```ts
        (o: any) => o.boatId === boatId && ["paid", "partially_paid", "confirmed", "completed"].includes(o.status)
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: no new errors referencing `boat/[id].astro`.

- [ ] **Step 3: Commit**

```bash
git add "src/pages/[...lang]/boat/[id].astro"
git commit -m "feat(boat): unlock contact owner for paid orders on [id] route"
```

---

## Task 8: Post-payment page — confirmed copy + "Message owner"

`booking-success` currently says the request was "sent to the owner" and to await approval. With instant pay-and-book, the booking **is** confirmed; show that and offer a direct "Message owner" CTA.

**Files:**
- Modify: `src/pages/[...lang]/booking-success.astro:20-21` (copy) and the page `<script>` (use the `orderId` returned by `confirm-order`)

- [ ] **Step 1: Update the headline copy**

Replace lines 20-21:

```html
      <p class="text-text-muted mb-2">Your payment was successful and your booking request has been sent to the owner.</p>
      <p class="text-text-muted mb-6 text-sm">You will receive a confirmation once the owner approves your booking.</p>
```

with:

```html
      <p class="text-text-muted mb-2">Your payment was successful and your booking is <strong>confirmed</strong>.</p>
      <p class="text-text-muted mb-6 text-sm">You can now message the owner to arrange the details of your trip.</p>
```

- [ ] **Step 2: Add a hidden "Message owner" button to the CTA row**

In the `flex ... gap-3` CTA row (the one containing "View my bookings"), add this as the **first** child link, initially hidden:

```html
        <a id="message-owner-cta" href="#" class="hidden items-center px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z"/></svg>
          Message owner
        </a>
```

(Change the existing "View my bookings" button classes from `inline-flex` to `inline-flex` is unnecessary; leave it. The new button uses `hidden` and is switched to `inline-flex` by script.)

- [ ] **Step 3: Use `confirm-order`'s returned `orderId` to wire the CTA**

`confirm-order` returns `{ success, orderId }`. In the page `<script>`, capture it and look up the order to build a `/messages?with=<ownerId>...` link. Replace the `if (sessionId) { ... }` block with:

```ts
      if (sessionId) {
        try {
          const res = await fetch(`${import.meta.env.PUBLIC_SUPABASE_URL}/functions/v1/confirm-order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ sessionId }),
          });
          const data = await res.json();
          if (!res.ok) {
            console.error("Order confirmation failed:", data.error);
            const w = document.getElementById("confirmation-warning");
            if (w) w.classList.remove("hidden");
          } else if (data.orderId) {
            const { supabase } = await import("../../lib/supabase");
            const { data: order } = await supabase
              .from("orders")
              .select("owner_id, boat_id, boat_title")
              .eq("id", data.orderId)
              .maybeSingle();
            if (order?.owner_id) {
              const prefix = document.documentElement.dataset.langPrefix || "";
              const base = prefix ? "/" + prefix : "";
              const qs = new URLSearchParams({
                with: order.owner_id,
                boatId: order.boat_id || "",
                boatTitle: order.boat_title || "",
              });
              const cta = document.getElementById("message-owner-cta") as HTMLAnchorElement | null;
              if (cta) {
                cta.href = `${base}/messages?` + qs.toString();
                cta.classList.remove("hidden");
                cta.classList.add("inline-flex");
              }
            }
          }
        } catch (err) {
          console.error("Order confirmation failed:", err);
          const w = document.getElementById("confirmation-warning");
          if (w) w.classList.remove("hidden");
        }
      }
```

- [ ] **Step 4: Type-check**

Run: `npx astro check`
Expected: no new errors referencing `booking-success.astro`.

- [ ] **Step 5: Manual check — full happy path**

Fresh boat + dates → Continue to payment → pay with test card → land on `booking-success`. Expected: copy reads "booking is confirmed"; "Message owner" button appears and links to `/messages?with=<ownerId>...`. Then via MCP `execute_sql` verify the order + conversation:

```sql
select o.status, o.payment_status,
       (select count(*) from public.conversations c
         where c.participants @> array[o.renter_id, o.owner_id]) as convos,
       (select count(*) from public.messages m
         join public.conversations c on c.id = m.conversation_id
         where c.participants @> array[o.renter_id, o.owner_id]) as msgs
from public.orders o order by o.created_at desc limit 1;
```

Expected: `status = 'paid'` (or `partially_paid`), `payment_status = 'succeeded'`, `convos >= 1`, `msgs >= 1`. Also open `/messages` as the renter — the owner conversation with the opening message is present.

- [ ] **Step 6: Commit**

```bash
git add "src/pages/[...lang]/booking-success.astro"
git commit -m "feat(booking-success): confirmed copy + message-owner CTA"
```

---

## Task 9: End-to-end verification + legacy notes

**Files:** none (verification + documentation)

- [ ] **Step 1: Full regression click-through**

As a renter (not the boat owner), for a boat you don't own: pick dates → Continue to payment → pay (test card) → confirmed page → Message owner → send a reply. As the **owner** account, confirm the booking shows under `my-offers` (paid tab) and the renter's message + your owner email arrived. Confirm there is **no** accept/decline step anywhere in the renter path.

- [ ] **Step 2: Confirm legacy paths still don't break**

`createBookingRequest`/`acceptBookingRequest`/`declineBookingRequest` remain in `src/lib/api.ts` and `my-offers.astro` for any pre-existing `requested`/`accepted` orders. The "New Requests" tab and the `.eq("status","requested")` badges in `Header.astro`/`DashboardSidebar.astro` will simply show 0 for new activity — acceptable. **Out of scope (optional follow-ups):** relabel the my-offers "New Requests" tab, and repoint those badges to count new `paid` bookings for owners.

- [ ] **Step 3: Final type-check**

Run: `npx astro check`
Expected: no new errors across changed files.

- [ ] **Step 4: Commit any doc tweaks** (if this plan file was updated during execution)

```bash
git add docs/superpowers/plans/2026-06-24-pay-first-booking-pipeline.md
git commit -m "docs: pay-first booking pipeline plan"
```

---

## Self-Review

**Spec coverage:**
- "Pay first" → Task 5 (confirm-booking redirects to Stripe; no request/approval). ✓
- "Remove owner approval" → Tasks 5 + 9 (happy path no longer calls `createBookingRequest`/accept; legacy kept). ✓
- "Then contact the owner" → Task 3 (find-or-create conversation + opening message), Task 6/7 (unlock Contact owner), Task 8 (Message owner CTA). ✓
- "Email owner + renter" → Task 2 + Task 3 (owner `new_booking_owner`; renter `payment_received` already sent). ✓

**Placeholder scan:** No TBD/"handle errors"/"similar to". Every code step shows full code. ✓

**Type/name consistency:** `renterMessage` (camel, client/body) → `renter_message` (snake, DB column) used consistently in Tasks 1/3; new email type `new_booking_owner` declared in Task 2 and called in Task 3 with matching `data` keys (`boat_title`, `renter_name`, `start_date`, `end_date`, `is_prepay`); `confirm-order` returns `orderId` (existing) consumed in Task 8. ✓

**Known caveat (carried over, not introduced):** an abandoned Stripe checkout leaves a `pending` order that blocks the dates until cancelled — same behavior as the current `pay-booking` flow. A scheduled cleanup of stale `pending` orders is a reasonable follow-up but is out of scope here.
