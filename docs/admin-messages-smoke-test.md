# Admin Conversations View — Smoke Test

Manual checklist. Run end-to-end before considering the feature shipped.

## Pre-requisites

- Two regular user accounts (renter, owner) and one admin account exist.
- At least 3 conversations across at least 2 user pairs, with at least one
  conversation having multiple messages.

## A. Migration sanity (SQL Editor)

- [ ] `SELECT * FROM conversation_admin_flags LIMIT 1` as admin → succeeds (likely 0 rows initially).
- [ ] `SELECT * FROM conversation_admin_flags LIMIT 1` as anon → blocked by RLS.
- [ ] `SELECT proname FROM pg_proc WHERE proname='search_admin_conversations'` → 1 row.
- [ ] `SELECT indexname FROM pg_indexes WHERE indexname='messages_text_fts_idx'` → exists.
- [ ] Existing participant-only access still works: log in as a regular user,
      load `/messages`, see only their own conversations.

## B. Admin UI

- [ ] Log in as admin → `/admin` loads.
- [ ] Sidebar shows "Messages" between "Orders" and "Charges".
- [ ] Top tab strip shows "Messages" in the same position.
- [ ] Click "Messages" → tab loads, table populates with all conversations,
      newest first.
- [ ] Each row shows: participants joined by "↔", boat title or "—",
      truncated last message, updated date, "Open" flag badge.
- [ ] Pagination shows correct totals; Next/Prev disable at boundaries.
- [ ] No delete buttons or message-deletion affordances are present anywhere
      in the table, the modal, or as keyboard shortcuts.

## C. Filters

- [ ] Search participant by partial name → table narrows correctly.
- [ ] Search participant by partial email (use an email belonging to a known
      participant) → that user's conversations surface.
- [ ] Clear participant field → all conversations return.
- [ ] State filter "Flagged" → 0 rows initially.
- [ ] Type a known word from a real message in "Search message content…" →
      conversations containing it surface.
- [ ] Combine state filter + content search → both apply.

## D. Thread modal

- [ ] Click a row → modal opens with participant names + boat subtitle.
- [ ] Messages render chronologically with sender + time.
- [ ] Newlines + long lines wrap correctly.
- [ ] Flag radio reflects current state.
- [ ] Note textarea reflects current note (empty initially).
- [ ] "Not yet annotated." meta line on first open.
- [ ] No per-message actions; no delete button; no edit affordance.

## E. Flagging

- [ ] Set state = Flagged, add a note → Save → "Saved ✓" → modal closes.
- [ ] Row in table shows red Flagged badge immediately.
- [ ] Sidebar badge shows "1"; top tab badge shows "1".
- [ ] Reload page → badge and row state persist.
- [ ] Reopen the same conversation → flag + note still present.
- [ ] Meta line shows "Last updated by [admin name] on [date]".
- [ ] Filter by Flagged → only this conversation appears.
- [ ] Change state to Reviewed → Save → row shows green Reviewed badge,
      badges decrement to 0.
- [ ] Change state to Open + clear note → Save → row shows gray Open badge.

## F. RLS regression — non-admin

- [ ] Log out, log in as a regular (non-admin) user.
- [ ] `/messages` still works; conversation list is the user's own only.
- [ ] Open browser console and run:
      `await window.supabase.rpc('search_admin_conversations', { p_limit: 5 })`
      → either errors with permission denied or returns an empty array.
- [ ] Open browser console and run:
      `await window.supabase.from('conversation_admin_flags').select('*')`
      → returns empty (RLS blocks).
- [ ] Navigate to `/admin` → access-denied panel shows; Messages tab is not visible.
- [ ] Inspect DOM: there is no leak of admin-only conversation data.

## G. Edge cases

- [ ] Conversation with no boat_id → boat column shows "—".
- [ ] Conversation whose participant profile was deleted → name falls back to
      the denormalized JSONB displayName (or "Deleted user" if the JSONB is also
      missing). No crashes.
- [ ] Very long message → truncated in table to ~60 chars + ellipsis,
      full text in modal.
- [ ] Note > 1000 chars → UI prevents (maxlength).
- [ ] FTS query with single-quote or `&` characters → does not error
      (`plainto_tsquery` escapes input).
- [ ] Empty thread (conversation row exists, no messages) → modal shows
      "No messages in this conversation."

## Result

When every box is checked, paste the result into the PR or commit message.
Anything that fails → block the merge and fix before continuing.
