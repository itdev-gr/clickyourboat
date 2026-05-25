# Admin Conversations View — Design

**Status:** Approved, ready for implementation plan
**Date:** 2026-05-25

---

## ⚠️ Hard constraint: NO DELETION

This feature is **strictly read + annotate**. The implementation MUST NOT:

- Add any DELETE policy to `conversations` or `messages`
- Add any UI affordance to delete conversations or messages (no buttons, links, swipe actions, bulk actions)
- Add any API function that deletes conversations or messages
- Include any `DELETE` or destructive `UPDATE` against existing rows in the migration

The only writes the feature performs are upserts into a new `conversation_admin_flags` table. The single `ON DELETE CASCADE` in the schema (on the flags table) only ensures cleanup *if* a conversation is ever deleted by some other code path — this feature does not delete anything itself.

---

## Goal

Give admins a view of every conversation on the platform, with light moderation state (open / flagged / reviewed + optional note). Read-only access to messages, plus filtering, full-text search, and pagination.

## Non-goals

- Sending messages as admin
- Deleting messages or conversations
- Real-time updates
- Per-message moderation state (state is per-conversation)
- Notifying users when an admin views their thread

## Architecture

A new **Messages** tab is added to the existing `/admin` page sidebar, following the established tab pattern (`data-sidebar-tab="messages"` + `<div id="tab-messages" class="admin-tab-content hidden">`). The tab shows a paginated table of all platform conversations. Filters: participant name/email, flag state, full-text search on message content. Clicking a row opens a modal with the full thread (read-only) and flag controls.

Admin annotations live in a separate `conversation_admin_flags` table, RLS-locked so participants can never read them. RLS on `conversations` and `messages` gets new permissive SELECT policies for admins (existing participant-only policies are not modified).

### Units (each one focused, well-bounded)

| Unit | Responsibility | Depends on |
|---|---|---|
| `conversation_admin_flags` table + RLS | Persist per-conversation flag state + note | `conversations`, `profiles` |
| Admin SELECT policies on `conversations`, `messages` | Grant admin read-all; existing policies untouched | `profiles.user_type` |
| FTS index on `messages.text` | Enable efficient content search | `messages` |
| `getAdminConversations()`, `getAdminMessagesForConversation()`, `setConversationFlag()` in `src/lib/api.ts` | Encapsulate the admin queries | `supabase` client, RLS |
| `#tab-messages` content + sidebar/top buttons in `admin.astro` | Filters bar + table + pagination UI | Existing tab system in admin.astro |
| `#admin-thread-modal` in `admin.astro` | Read-only thread viewer + flag controls | The three API functions |

## Database changes

### Migration file

`supabase/migrations/20260525120000_admin_messages_view.sql` — purely additive, no destructive operations.

### New table

```sql
CREATE TABLE conversation_admin_flags (
  conversation_id uuid PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'open' CHECK (state IN ('open','flagged','reviewed')),
  note text,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversation_admin_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read flags" ON conversation_admin_flags
  FOR SELECT USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins write flags" ON conversation_admin_flags
  FOR ALL USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  ) WITH CHECK (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

Rows are created lazily on first annotation; absence of a row means `state = 'open'`. The UI must LEFT JOIN and coalesce.

### Admin SELECT policies on existing tables

```sql
CREATE POLICY "admins read all conversations" ON conversations
  FOR SELECT USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins read all messages" ON messages
  FOR SELECT USING (
    (SELECT user_type FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

Postgres OR-combines permissive policies, so participant-only access remains correct for regular users.

### FTS index

```sql
CREATE INDEX messages_text_fts_idx
  ON messages USING gin (to_tsvector('simple', text));
```

`'simple'` (no stemming) was chosen because the platform mixes English and Greek; language-specific configs would lose recall on cross-language content.

## API layer (`src/lib/api.ts`)

Three new exported functions, added in the existing `// --- Admin functions ---` block:

```ts
export type AdminFlagState = "open" | "flagged" | "reviewed";

export interface AdminConversationRow {
  id: string;
  participants: string[];
  participantDetails: Record<string, {
    displayName: string;
    photoURL: string | null;
    firstName: string;
    lastName: string;
  }>;
  boatId: string | null;
  boatTitle: string | null;
  lastMessage: { text: string; senderId: string; timestamp: string } | null;
  updatedAt: string;
  flagState: AdminFlagState;
  flagNote: string | null;
  flagUpdatedAt: string | null;
}

export async function getAdminConversations(params: {
  flagState?: AdminFlagState | "all";
  participantQuery?: string;   // matches display name OR email
  contentQuery?: string;       // FTS on messages.text
  limit?: number;              // default 50
  offset?: number;             // default 0
}): Promise<{ rows: AdminConversationRow[]; total: number }>;

export async function getAdminMessagesForConversation(
  conversationId: string
): Promise<Array<{
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  readBy: string[];
}>>;

export async function setConversationFlag(
  conversationId: string,
  state: AdminFlagState,
  note: string | null
): Promise<void>;
```

### Query strategy for `getAdminConversations`

- **No content query** → single query on `conversations` LEFT JOIN `conversation_admin_flags`, ordered `updated_at DESC`, with `LIMIT/OFFSET`. Participant search uses ILIKE against the JSONB `participant_details` cast to text plus a parallel match on `profiles.email` for the participant IDs.
- **Content query present** → first query `messages` with `to_tsvector('simple', text) @@ plainto_tsquery('simple', $query)` to get distinct `conversation_id`s, then load those conversations + their flag rows. `plainto_tsquery` auto-escapes user input.
- **Total** → separate `count: 'exact', head: true` query with the same filters.

`setConversationFlag` is an upsert keyed on `conversation_id`, setting `updated_by = auth.uid()` and `updated_at = now()` (the column default also handles `updated_at`, but explicit is fine).

Authorization relies on RLS, not on client-side checks. The page-level admin gate stays as a UX nicety.

## UI (`src/pages/[...lang]/admin.astro`)

### Sidebar + top tab buttons

Insert before the "Charges" entries in the sidebar nav and the matching top tab strip:

```html
<button type="button" data-sidebar-tab="messages" class="sidebar-tab ...">
  <svg class="h-5 w-5"><!-- chat bubble icon --></svg>
  Messages
  <span id="sidebar-flagged-count" class="ml-auto bg-gray-600 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"></span>
</button>
```

(Plus matching top tab button with `data-admin-tab="messages"`.)

### Tab content

`<div id="tab-messages" class="admin-tab-content hidden">` containing three regions:

```
┌─ Filters bar ──────────────────────────────────────────────┐
│ [Search participant…] [State: All ▾] [Search messages…] [⟳]│
├─ Conversations table ──────────────────────────────────────┤
│ Participants          | Boat        | Last msg      | Flag │
│ Renter A ↔ Owner B    | Aphrodite   | "Sounds…"     |  ⚑   │
│ …                                                          │
├─ Pagination ───────────────────────────────────────────────┤
│ ‹ Prev   Page 1 of 3   Next ›    Showing 1–50 of 127       │
└────────────────────────────────────────────────────────────┘
```

### Thread modal

`<dialog id="admin-thread-modal">` styled like the existing `boat-detail-modal`:

```
┌─ Thread header ───────────────────────────────────────────┐
│ Renter A ↔ Owner B  ·  Boat: Aphrodite                  ✕ │
├─ Messages (scrollable, read-only) ────────────────────────┤
│ [Renter A · 14:02] Hi, is the boat available next week?   │
│ [Owner B  · 14:05] Yes — what dates?                      │
│ …                                                         │
├─ Flag controls (sticky bottom) ───────────────────────────┤
│ State: (•) Open  ( ) Flagged  ( ) Reviewed                │
│ Note: [textarea]                                          │
│ Last updated by Admin Marios on 2026-05-25 14:30          │
│                                          [Cancel] [Save]  │
└───────────────────────────────────────────────────────────┘
```

No per-message actions. No delete affordances anywhere.

### Script additions

Inside the existing `<script>` block in `admin.astro`:

- Import the three new API functions.
- `loadAdminMessages(opts)` — fetches via `getAdminConversations`, renders rows, updates pagination + sidebar flagged-count badge.
- `openThreadModal(conversationId)` — fetches messages, renders, populates flag-control state from the row.
- `saveFlag(conversationId)` — calls `setConversationFlag`, refreshes the affected row in the table, updates sidebar count if state changed.
- Debounced filter inputs (300ms) on the two text inputs to avoid hammering the DB on keystroke.
- Initial flagged-count badge: a small `count: 'exact', head: true` query for `flag_state = 'flagged'`.

## Data flow

1. Admin clicks "Messages" tab.
2. Page calls `getAdminConversations({ limit: 50, offset: 0 })`.
3. RLS allows the query because the caller is admin.
4. Table renders with flag badges; sidebar count badge populated by parallel count query.
5. Filter change → debounced re-fetch with new params.
6. Row click → `getAdminMessagesForConversation(id)` → modal opens with thread.
7. Flag save → `setConversationFlag(id, state, note)` → upsert → modal closes → affected row refreshed → sidebar count refreshed if state changed.

## Error handling

- **Non-admin** lands on `/admin#messages` → existing access-denied panel renders (the page already gates).
- **API error** on table load → inline red banner above the table with a "Retry" button.
- **API error** in modal → inline error inside the modal; modal stays open so the admin can retry without losing context.
- **Empty result** → empty state ("No conversations match these filters").
- **Conversation deleted between table load and modal open** → modal shows "This conversation no longer exists" + Refresh button.
- **Empty thread** (conversation exists but no messages) → "No messages in this conversation."

## Edge cases

- **No `boat_id`** (general DM) → boat column renders "—".
- **Deleted participant profile** → use the denormalized `displayName` from `participant_details` JSONB (captured at conversation creation, survives profile deletion). Fall back to "Deleted user" if the JSONB entry is also missing.
- **Long message bodies in table** → truncate to 80 chars with ellipsis; full text in modal.
- **FTS special characters** → `plainto_tsquery` auto-escapes — never use `to_tsquery` with raw user input.
- **Note field over-long** → soft cap in UI at 1000 chars; no DB-level constraint (text field is fine).
- **Rendering "last updated by"** → `getAdminConversations` and `getAdminMessagesForConversation` do not need the admin's display name. The modal fetches the flag row separately (or the row from `getAdminConversations` already contains `flag_updated_at`); display name of `updated_by` is resolved by a lightweight `profiles` lookup on modal open (one query for the single admin ID). If `updated_by IS NULL` (admin was deleted), render "Last updated [timestamp]" without a name.

## Testing

The project doesn't use an automated test runner. Follow the existing pattern (smoke-test markdown doc, per commits `befd33e` and `8d5a8d9`):

### Migration verification

Apply migration to local Supabase, then:

- `SELECT` on `conversation_admin_flags` as anon → returns 0 rows (RLS blocks).
- `SELECT` on `conversations` as a participant → still works (existing policy).
- `SELECT` on `conversations` as admin → returns all rows (new policy).
- Insert into `conversation_admin_flags` as non-admin → fails.
- Insert into `conversation_admin_flags` as admin → succeeds.
- FTS index exists: `\d messages` shows `messages_text_fts_idx`.

### UI smoke test (new file `docs/admin-messages-smoke-test.md`)

1. Create 3 test conversations across 3 user pairs (reuse existing test accounts).
2. Log in as admin → Messages tab visible in sidebar.
3. All 3 conversations listed, newest first.
4. Filter by participant name → results narrow correctly.
5. Search message content for a known phrase → returns matching conversation.
6. Filter by flag state "Open" → all 3 appear (no flags set yet).
7. Open conversation → thread renders, messages in chronological order, read-only.
8. Verify no delete buttons or message actions are present.
9. Set state to "Flagged" + add note → save → row badge updates, sidebar count increments.
10. Reload page → flag persists.
11. Filter by "Flagged" → only the flagged conversation appears.
12. Set state back to "Reviewed" → sidebar count decrements.
13. Log out, log in as participant → regular `/messages` page works unchanged, no admin annotations visible.
14. Log in as non-admin → `/admin` shows access-denied panel, no Messages tab leak.
15. Attempt direct query of `conversation_admin_flags` as non-admin via console → blocked.

No automated tests get added — out of scope.

## What we are NOT building

- Sending or replying as admin
- Deleting messages or conversations (hard constraint — see top of doc)
- Real-time updates
- Per-message flag state
- Notification to participants
- Boat filter (deferred; participant + content search covers initial needs)
- Reason tags / structured taxonomy (deferred; free-text note is enough for now)
- Bulk actions
