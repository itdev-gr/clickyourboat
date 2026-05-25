# Admin Conversations View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give admins a read-only view of every platform conversation with three-state flag moderation (open / flagged / reviewed) + optional note.

**Architecture:** New `conversation_admin_flags` table (RLS: admin-only). New permissive SELECT policies on `conversations` and `messages` for admins. New Postgres function `search_admin_conversations(...)` wraps all filter logic (participant search, FTS content search, state filter, pagination) into one RPC. UI is a new "Messages" tab in the existing `/admin` page sidebar — filters bar + table + thread-viewer modal — using the project's established tab pattern.

**Tech Stack:** Astro 5, TypeScript, Supabase (Postgres + RLS + RPC), Tailwind CSS. No test runner — verification is SQL queries against the DB + manual browser smoke tests (the project's existing pattern, e.g. `docs/account-page-smoke-test-findings.md`).

**Hard constraint:** **No deletion of existing conversations or messages.** The migration is purely additive; no DELETE policies on `conversations`/`messages`; no UI delete affordances; no API delete functions. See `docs/superpowers/specs/2026-05-25-admin-conversations-view-design.md` for the full design.

---

## File map

**Create:**
- `supabase/migrations/20260525120000_admin_messages_view.sql` — new table + RLS + index + RPC function
- `docs/admin-messages-smoke-test.md` — manual smoke-test checklist (Task 11)

**Modify:**
- `src/lib/api.ts` — add `AdminFlagState`, `AdminConversationRow`, `getAdminConversations`, `getAdminMessagesForConversation`, `setConversationFlag` in the existing `// --- Admin functions ---` block (around line 347)
- `src/pages/[...lang]/admin.astro` — add sidebar button (around line 84, before Charges), top tab button (around line 117, before Charges), `#tab-messages` content container (insert after `#tab-orders`), `#admin-thread-modal` dialog (insert near `#boat-detail-modal` around line 317), script logic in the existing `<script>` block

---

## Pre-flight: schema sanity check

Before any code changes, verify the actual column types in the live DB. We've inferred from `src/lib/api.ts` that `messages` uses `timestamp` for chronological ordering and `conversations.participants` holds participant user IDs. If types differ, adjust the migration accordingly.

- [ ] **Step 0.1: Query the live schema for the relevant tables**

Ask the user to run this in the Supabase Dashboard → SQL Editor and paste back the output:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('conversations', 'messages', 'profiles')
ORDER BY table_name, ordinal_position;
```

Expected: `conversations.participants` is `ARRAY` (text[] or uuid[]), `messages.text` is `text`, `messages.conversation_id` is `uuid`, `profiles.id` is `uuid`, `profiles.email` is `text`, `profiles.display_name` is `text`, `profiles.user_type` is `text`.

**If `participants` is `text[]`:** use the migration as written below.
**If `participants` is `uuid[]`:** in the RPC's `EXISTS` subquery, change `p.id = ANY(c.participants)` to `p.id::text = ANY(c.participants::text[])` — or vice versa, ensure both sides are the same type. Note the type observed at this step and use it consistently.

---

## Task 1: Create the migration file

**Files:**
- Create: `supabase/migrations/20260525120000_admin_messages_view.sql`

**Why this task is split from "apply migration":** Writing the SQL is local + reversible. Applying it modifies the production Supabase project and is much harder to undo. Splitting them lets the user inspect the SQL before applying.

- [ ] **Step 1.1: Create the migration file with the exact content below**

```sql
-- Admin Conversations View — additive migration.
-- Adds: conversation_admin_flags table, admin RLS policies on conversations/messages,
-- FTS GIN index on messages.text, and search_admin_conversations() RPC.
--
-- HARD CONSTRAINT: This migration is purely additive. NO DROP, NO DELETE,
-- NO destructive UPDATE. No DELETE policies are added.

-- 1. Flag table (admin annotations) ------------------------------------------

CREATE TABLE IF NOT EXISTS public.conversation_admin_flags (
  conversation_id uuid PRIMARY KEY REFERENCES public.conversations(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'open' CHECK (state IN ('open','flagged','reviewed')),
  note text,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.conversation_admin_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read flags" ON public.conversation_admin_flags
  FOR SELECT USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins write flags" ON public.conversation_admin_flags
  FOR ALL USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  ) WITH CHECK (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 2. Admin SELECT policies on existing tables (additive — existing
--    participant-only policies remain in force for non-admin users). --------

CREATE POLICY "admins read all conversations" ON public.conversations
  FOR SELECT USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins read all messages" ON public.messages
  FOR SELECT USING (
    (SELECT user_type FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. FTS index on messages.text. 'simple' config (no stemming) chosen
--    because conversations mix English and Greek. ---------------------------

CREATE INDEX IF NOT EXISTS messages_text_fts_idx
  ON public.messages USING gin (to_tsvector('simple', text));

-- 4. RPC function: one-call admin search with filters + pagination ----------

CREATE OR REPLACE FUNCTION public.search_admin_conversations(
  p_flag_state text DEFAULT NULL,         -- 'open' | 'flagged' | 'reviewed' | NULL
  p_participant_query text DEFAULT NULL,  -- matches profiles.email OR display_name (ILIKE)
  p_content_query text DEFAULT NULL,      -- FTS on messages.text
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  participants text[],
  participant_details jsonb,
  boat_id uuid,
  boat_title text,
  last_message jsonb,
  updated_at timestamptz,
  flag_state text,
  flag_note text,
  flag_updated_at timestamptz,
  total_count bigint
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  WITH filtered AS (
    SELECT
      c.id,
      c.participants,
      c.participant_details,
      c.boat_id,
      c.boat_title,
      c.last_message,
      c.updated_at,
      COALESCE(f.state, 'open') AS flag_state,
      f.note AS flag_note,
      f.updated_at AS flag_updated_at
    FROM public.conversations c
    LEFT JOIN public.conversation_admin_flags f ON f.conversation_id = c.id
    WHERE
      (p_flag_state IS NULL OR COALESCE(f.state, 'open') = p_flag_state)
      AND (
        p_participant_query IS NULL
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = ANY(c.participants)
            AND (p.email ILIKE '%' || p_participant_query || '%'
                 OR p.display_name ILIKE '%' || p_participant_query || '%')
        )
      )
      AND (
        p_content_query IS NULL
        OR EXISTS (
          SELECT 1 FROM public.messages m
          WHERE m.conversation_id = c.id
            AND to_tsvector('simple', m.text) @@ plainto_tsquery('simple', p_content_query)
        )
      )
  )
  SELECT
    fi.id, fi.participants, fi.participant_details,
    fi.boat_id, fi.boat_title, fi.last_message, fi.updated_at,
    fi.flag_state, fi.flag_note, fi.flag_updated_at,
    COUNT(*) OVER () AS total_count
  FROM filtered fi
  ORDER BY fi.updated_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
$$;

REVOKE EXECUTE ON FUNCTION public.search_admin_conversations(text, text, text, int, int) FROM public;
GRANT EXECUTE ON FUNCTION public.search_admin_conversations(text, text, text, int, int) TO authenticated;
```

**Note on type adjustment from Step 0.1:** if `participants` is `uuid[]` rather than `text[]`, change the RPC's `RETURNS TABLE (..., participants text[], ...)` to `uuid[]` and adjust the EXISTS clause accordingly. Also adjust the participant element type in `AdminConversationRow` (Task 3) — TypeScript will see uuid as string either way.

- [ ] **Step 1.2: Lint the SQL file**

Run: `head -5 supabase/migrations/20260525120000_admin_messages_view.sql`
Expected: file exists, first lines are the `-- Admin Conversations View — additive migration.` comment.

- [ ] **Step 1.3: Commit**

```bash
git add supabase/migrations/20260525120000_admin_messages_view.sql
git commit -m "$(cat <<'EOF'
Add migration for admin conversations view

Additive only: new conversation_admin_flags table with admin-only RLS,
new permissive SELECT policies on conversations/messages for admins,
FTS GIN index on messages.text, and search_admin_conversations() RPC.

No DELETE policies, no destructive operations.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Apply the migration and verify

**Files:** none (DB-only)

This task touches the production Supabase project. Get explicit user confirmation before applying.

- [ ] **Step 2.1: Confirm with user**

Ask the user (verbatim): *"Ready to apply migration `20260525120000_admin_messages_view.sql` to the Supabase project? This is additive — no existing data is modified or deleted. Reply 'apply' to proceed, or 'wait' to hold."*

Wait for explicit "apply" before continuing.

- [ ] **Step 2.2: Apply via Supabase Dashboard**

Provide the user with these instructions:

> 1. Open https://supabase.com/dashboard/project/dmukceeargocoxtqzyga/sql/new
> 2. Paste the entire contents of `supabase/migrations/20260525120000_admin_messages_view.sql`
> 3. Click "Run"
> 4. Confirm "Success" message
> 5. Reply "done" here

Wait for "done" before continuing.

(Alternative if `supabase` CLI is configured locally: `supabase db push`. Do not run it on the user's behalf — let them choose.)

- [ ] **Step 2.3: Verify the table, index, policies, and RPC exist**

Ask the user to run in Supabase SQL Editor and paste the results:

```sql
-- Should return 1 row
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' AND table_name='conversation_admin_flags';

-- Should return at least 4 policies (2 on flags, 1 each new on conversations/messages)
SELECT tablename, policyname FROM pg_policies
WHERE schemaname='public'
  AND policyname LIKE 'admins %'
ORDER BY tablename, policyname;

-- Should return 1 row
SELECT indexname FROM pg_indexes
WHERE schemaname='public' AND indexname='messages_text_fts_idx';

-- Should return 1 row
SELECT proname FROM pg_proc WHERE proname='search_admin_conversations';
```

Expected output:
- `conversation_admin_flags`
- 4 policies: `admins read all conversations`, `admins read all messages`, `admins read flags`, `admins write flags`
- `messages_text_fts_idx`
- `search_admin_conversations`

If any are missing, stop and debug before continuing.

- [ ] **Step 2.4: Verify RLS works as expected**

Ask the user to run, as a non-admin user (you can simulate by switching to the anon role in SQL Editor or by running via curl with an anon JWT):

```sql
-- As anon: should return 0 rows
SELECT count(*) FROM public.conversation_admin_flags;

-- As anon: should return 0 (or just the user's own if RLS permits)
SELECT count(*) FROM public.search_admin_conversations();
```

As an admin user (via `?as=user_id` or by logging in and using browser console):

```js
// In browser console after logging in as admin
const { data, error } = await window.supabase.rpc('search_admin_conversations', {
  p_limit: 5
});
console.log({ data, error });
// Expected: data is an array (possibly empty if no conversations), error is null
```

If admin returns 0 rows but you know conversations exist, double-check the admin's `profiles.user_type='admin'`.

---

## Task 3: Add admin types and `getAdminConversations` to `src/lib/api.ts`

**Files:**
- Modify: `src/lib/api.ts` — insert in the `// --- Admin functions ---` section (after `adminDeleteUser` around line 439, before `// --- Orders ---`)

- [ ] **Step 3.1: Add types and `getAdminConversations`**

Open `src/lib/api.ts`. Find the line containing `// --- Orders ---` (around line 441). Immediately before it, insert:

```ts
// --- Admin Conversations (read-only + flag annotations) ---

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
  participantQuery?: string;
  contentQuery?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ rows: AdminConversationRow[]; total: number }> {
  const state = params.flagState && params.flagState !== "all" ? params.flagState : null;
  const participant = params.participantQuery?.trim() || null;
  const content = params.contentQuery?.trim() || null;

  const { data, error } = await supabase.rpc("search_admin_conversations", {
    p_flag_state: state,
    p_participant_query: participant,
    p_content_query: content,
    p_limit: params.limit ?? 50,
    p_offset: params.offset ?? 0,
  });
  if (error) throw error;

  const rows: AdminConversationRow[] = (data || []).map((r: any) => ({
    id: r.id,
    participants: r.participants || [],
    participantDetails: r.participant_details || {},
    boatId: r.boat_id || null,
    boatTitle: r.boat_title || null,
    lastMessage: r.last_message || null,
    updatedAt: r.updated_at,
    flagState: (r.flag_state || "open") as AdminFlagState,
    flagNote: r.flag_note || null,
    flagUpdatedAt: r.flag_updated_at || null,
  }));

  const total = data && data.length > 0 ? Number(data[0].total_count) : 0;
  return { rows, total };
}
```

- [ ] **Step 3.2: Type-check**

Run: `npm run check`
Expected: clean exit (0 errors). If the existing codebase already has unrelated `astro check` warnings, ensure none are new ones from your edit.

- [ ] **Step 3.3: Commit**

```bash
git add src/lib/api.ts
git commit -m "$(cat <<'EOF'
Add getAdminConversations + admin types to api.ts

Wraps the search_admin_conversations RPC with typed input/output.
Read-only — no delete/edit paths added.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add `getAdminMessagesForConversation` and `setConversationFlag`

**Files:**
- Modify: `src/lib/api.ts` — append to the new `// --- Admin Conversations` block created in Task 3

- [ ] **Step 4.1: Append the two new functions**

In `src/lib/api.ts`, immediately after `getAdminConversations` (still inside the `// --- Admin Conversations ...` block, before `// --- Orders ---`), insert:

```ts
export interface AdminThreadMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  readBy: string[];
}

export async function getAdminMessagesForConversation(
  conversationId: string
): Promise<AdminThreadMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id, text, sender_id, sender_name, timestamp, read_by")
    .eq("conversation_id", conversationId)
    .order("timestamp", { ascending: true });
  if (error) throw error;
  return (data || []).map((m: any) => ({
    id: m.id,
    text: m.text,
    senderId: m.sender_id,
    senderName: m.sender_name || "",
    timestamp: m.timestamp,
    readBy: Array.isArray(m.read_by) ? m.read_by : [],
  }));
}

export async function setConversationFlag(
  conversationId: string,
  state: AdminFlagState,
  note: string | null
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("conversation_admin_flags")
    .upsert({
      conversation_id: conversationId,
      state,
      note: note && note.trim().length > 0 ? note.trim() : null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: "conversation_id" });
  if (error) throw error;
}

export async function getAdminFlaggedCount(): Promise<number> {
  const { count, error } = await supabase
    .from("conversation_admin_flags")
    .select("conversation_id", { count: "exact", head: true })
    .eq("state", "flagged");
  if (error) throw error;
  return count || 0;
}

export async function getProfileDisplayName(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("display_name, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return data.display_name || [data.first_name, data.last_name].filter(Boolean).join(" ") || null;
}
```

Why `getAdminFlaggedCount` and `getProfileDisplayName` get added here:
- `getAdminFlaggedCount`: powers the sidebar badge (cheap separate query so we don't have to walk through paginated data).
- `getProfileDisplayName`: small helper used by the thread modal to render "Last updated by [admin name]". Reused, not duplicated.

- [ ] **Step 4.2: Type-check**

Run: `npm run check`
Expected: 0 new errors.

- [ ] **Step 4.3: Commit**

```bash
git add src/lib/api.ts
git commit -m "$(cat <<'EOF'
Add getAdminMessagesForConversation, setConversationFlag,
getAdminFlaggedCount, and getProfileDisplayName helpers

Read messages for a conversation (chronological), upsert the per-
conversation admin flag, count flagged conversations for the sidebar
badge, and resolve a profile's display name for the modal's "last
updated by" line.

No deletion paths.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Add Messages tab buttons + empty content shell in `admin.astro`

**Files:**
- Modify: `src/pages/[...lang]/admin.astro`

- [ ] **Step 5.1: Add the sidebar nav button**

In `src/pages/[...lang]/admin.astro`, find the sidebar `<nav>` block (around line 66). Locate the existing "Charges" sidebar button (around line 84):

```html
<button type="button" data-sidebar-tab="charges" class="sidebar-tab ...">
  <svg ...><path .../></svg>
  Charges
</button>
```

**Immediately before** that Charges button, insert this new "Messages" sidebar button:

```html
<button type="button" data-sidebar-tab="messages" class="sidebar-tab flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full">
  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/></svg>
  Messages
  <span id="sidebar-messages-count" class="ml-auto bg-gray-600 px-1.5 py-0.5 rounded-full text-[10px] font-semibold hidden"></span>
</button>
```

- [ ] **Step 5.2: Add the top tab button**

In the same file, find the top tab bar (around line 104–120). Locate the existing "Charges" top tab button (around line 117):

```html
<button type="button" data-admin-tab="charges" class="admin-tab ...">
  Charges
</button>
```

**Immediately before** that Charges top tab, insert:

```html
<button type="button" data-admin-tab="messages" class="admin-tab px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-white text-gray-600 border border-gray-300 hover:bg-gray-50">
  Messages <span id="top-messages-count" class="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs hidden"></span>
</button>
```

- [ ] **Step 5.3: Add the empty `#tab-messages` content shell**

Find the existing `<div id="tab-orders" class="admin-tab-content hidden">` block (around line 273). After its closing `</div>` (the one that closes `#tab-orders`), insert this new empty shell:

```html
<!-- Tab: Messages (admin read-only view of all conversations) -->
<div id="tab-messages" class="admin-tab-content hidden">
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <!-- Filters bar -->
    <div class="px-6 py-4 border-b border-gray-100 flex items-center flex-wrap gap-3">
      <h2 class="text-lg font-bold text-text mr-2">All Conversations</h2>
      <input type="text" id="adminmsg-participant-input" placeholder="Search participant (name or email)…" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64" />
      <select id="adminmsg-state-filter" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="all">All states</option>
        <option value="open">Open</option>
        <option value="flagged">Flagged</option>
        <option value="reviewed">Reviewed</option>
      </select>
      <input type="text" id="adminmsg-content-input" placeholder="Search message content…" class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64" />
      <button type="button" id="adminmsg-refresh-btn" class="ml-auto px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Refresh</button>
    </div>

    <!-- Loading -->
    <div id="adminmsg-loading" class="flex items-center justify-center py-12">
      <div class="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Error -->
    <div id="adminmsg-error" class="hidden px-6 py-4 text-sm text-red-600 bg-red-50 border-b border-red-100"></div>

    <!-- Empty -->
    <div id="adminmsg-empty" class="hidden px-6 py-12 text-center">
      <p class="text-sm text-text-muted">No conversations match these filters</p>
    </div>

    <!-- Table -->
    <div id="adminmsg-table-wrap" class="hidden overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left">
          <tr>
            <th class="px-6 py-3 font-semibold text-gray-600">Participants</th>
            <th class="px-6 py-3 font-semibold text-gray-600">Boat</th>
            <th class="px-6 py-3 font-semibold text-gray-600">Last message</th>
            <th class="px-6 py-3 font-semibold text-gray-600">Updated</th>
            <th class="px-6 py-3 font-semibold text-gray-600">Flag</th>
          </tr>
        </thead>
        <tbody id="adminmsg-tbody" class="divide-y divide-gray-100"></tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div id="adminmsg-pagination" class="hidden px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
      <span id="adminmsg-pagination-info" class="text-gray-500"></span>
      <div class="flex items-center gap-2">
        <button type="button" id="adminmsg-prev-btn" class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">‹ Prev</button>
        <span id="adminmsg-page-indicator" class="text-gray-600"></span>
        <button type="button" id="adminmsg-next-btn" class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next ›</button>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 5.4: Build to verify HTML is valid**

Run: `npm run build`
Expected: build succeeds. If it fails, check for unclosed tags around the insertion points.

- [ ] **Step 5.5: Manual visual check**

Run: `npm run dev`. In a browser, log in as admin, go to `/admin`. Verify:
1. "Messages" appears in the sidebar between "Orders" and "Charges".
2. "Messages" appears in the top tab strip between "Orders" and "Charges".
3. Clicking either "Messages" button switches to the Messages tab. The tab shows the filters bar, the loading spinner, but the table is empty (correct — no logic wired yet).
4. The existing tabs (Pending, Listings, Users, Orders, Charges) still work.

Stop dev server.

- [ ] **Step 5.6: Commit**

```bash
git add src/pages/[...lang]/admin.astro
git commit -m "$(cat <<'EOF'
Add Messages tab buttons and empty content shell to admin page

Sidebar button, top tab button, and the empty filter-bar + table +
pagination scaffold. No data loading yet — that comes in the next
commits.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Load and render the conversations table

**Files:**
- Modify: `src/pages/[...lang]/admin.astro` — script block

- [ ] **Step 6.1: Update the imports at the top of the script block**

In `src/pages/[...lang]/admin.astro`, find the existing import statement near the top of the `<script>` block (around line 386):

```ts
import {
  isUserAdmin, getAllUsers, getAllListings, getListingsByStatus,
  updateListingStatus, updateUserType, adminDeleteUser, deleteBoatListing,
  getAllOrders, updateOrderStatus, promoteToOwnerIfNeeded,
  getChargeSettings, saveChargeSettings, getBoatFullRow
} from "../../lib/api";
```

Replace it with:

```ts
import {
  isUserAdmin, getAllUsers, getAllListings, getListingsByStatus,
  updateListingStatus, updateUserType, adminDeleteUser, deleteBoatListing,
  getAllOrders, updateOrderStatus, promoteToOwnerIfNeeded,
  getChargeSettings, saveChargeSettings, getBoatFullRow,
  getAdminConversations, getAdminMessagesForConversation,
  setConversationFlag, getAdminFlaggedCount, getProfileDisplayName,
  type AdminConversationRow, type AdminFlagState, type AdminThreadMessage,
} from "../../lib/api";
```

- [ ] **Step 6.2: Add the admin-messages state and loader at the bottom of the script**

Find the end of the existing `<script>` block (the closing `</script>` near the very end of the file). Immediately before that closing tag, insert this new block:

```ts
// ============================================================
// Admin Messages tab — read-only conversation viewer + flagging
// ============================================================

const adminMsgState = {
  page: 0,
  pageSize: 50,
  total: 0,
  flagState: "all" as AdminFlagState | "all",
  participantQuery: "",
  contentQuery: "",
  rows: [] as AdminConversationRow[],
  loading: false,
  initialized: false,
};

const amEls = {
  loading: $("adminmsg-loading") as HTMLElement,
  error: $("adminmsg-error") as HTMLElement,
  empty: $("adminmsg-empty") as HTMLElement,
  wrap: $("adminmsg-table-wrap") as HTMLElement,
  tbody: $("adminmsg-tbody") as HTMLElement,
  pagination: $("adminmsg-pagination") as HTMLElement,
  pageInfo: $("adminmsg-pagination-info") as HTMLElement,
  pageIndicator: $("adminmsg-page-indicator") as HTMLElement,
  prevBtn: $("adminmsg-prev-btn") as HTMLButtonElement,
  nextBtn: $("adminmsg-next-btn") as HTMLButtonElement,
  participantInput: $("adminmsg-participant-input") as HTMLInputElement,
  stateFilter: $("adminmsg-state-filter") as HTMLSelectElement,
  contentInput: $("adminmsg-content-input") as HTMLInputElement,
  refreshBtn: $("adminmsg-refresh-btn") as HTMLButtonElement,
  sidebarBadge: $("sidebar-messages-count") as HTMLElement,
  topBadge: $("top-messages-count") as HTMLElement,
};

function amSetLoading(loading: boolean) {
  adminMsgState.loading = loading;
  amEls.loading.classList.toggle("hidden", !loading);
}

function amSetError(msg: string | null) {
  if (msg) {
    amEls.error.textContent = msg;
    amEls.error.classList.remove("hidden");
  } else {
    amEls.error.classList.add("hidden");
  }
}

function amOtherParticipantLabel(row: AdminConversationRow): string {
  // Both participants are equally relevant for an admin view. We render both names.
  const names = row.participants.map((pid) => {
    const d = row.participantDetails?.[pid];
    if (!d) return "Deleted user";
    const name = d.displayName || [d.firstName, d.lastName].filter(Boolean).join(" ").trim();
    return name || "Deleted user";
  });
  return names.join(" ↔ ");
}

function amFlagBadgeHtml(state: AdminFlagState): string {
  if (state === "flagged") {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">⚑ Flagged</span>`;
  }
  if (state === "reviewed") {
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800">✓ Reviewed</span>`;
  }
  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">Open</span>`;
}

function amTruncate(s: string | null | undefined, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function amRenderRows() {
  amEls.tbody.innerHTML = "";
  for (const row of adminMsgState.rows) {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50 cursor-pointer";
    tr.dataset.convId = row.id;
    tr.innerHTML = `
      <td class="px-6 py-3 text-text">${escapeHtml(amOtherParticipantLabel(row))}</td>
      <td class="px-6 py-3 text-text-muted">${row.boatTitle ? escapeHtml(amTruncate(row.boatTitle, 30)) : "—"}</td>
      <td class="px-6 py-3 text-text-muted">${escapeHtml(amTruncate(row.lastMessage?.text || "", 60))}</td>
      <td class="px-6 py-3 text-text-muted whitespace-nowrap">${formatDate(row.updatedAt)}</td>
      <td class="px-6 py-3">${amFlagBadgeHtml(row.flagState)}</td>
    `;
    amEls.tbody.appendChild(tr);
  }
}

async function loadAdminMessages() {
  if (adminMsgState.loading) return;
  amSetError(null);
  amSetLoading(true);
  amEls.empty.classList.add("hidden");
  amEls.wrap.classList.add("hidden");
  amEls.pagination.classList.add("hidden");
  try {
    const { rows, total } = await getAdminConversations({
      flagState: adminMsgState.flagState,
      participantQuery: adminMsgState.participantQuery || undefined,
      contentQuery: adminMsgState.contentQuery || undefined,
      limit: adminMsgState.pageSize,
      offset: adminMsgState.page * adminMsgState.pageSize,
    });
    adminMsgState.rows = rows;
    adminMsgState.total = total;
    amSetLoading(false);
    if (rows.length === 0) {
      amEls.empty.classList.remove("hidden");
      return;
    }
    amEls.wrap.classList.remove("hidden");
    amEls.pagination.classList.remove("hidden");
    amRenderRows();
    amRenderPagination();
  } catch (err: any) {
    amSetLoading(false);
    amSetError(err?.message || "Failed to load conversations");
  }
}

function amRenderPagination() {
  const start = adminMsgState.page * adminMsgState.pageSize + 1;
  const end = Math.min(start + adminMsgState.rows.length - 1, adminMsgState.total);
  amEls.pageInfo.textContent = `Showing ${start}–${end} of ${adminMsgState.total}`;
  const totalPages = Math.max(1, Math.ceil(adminMsgState.total / adminMsgState.pageSize));
  amEls.pageIndicator.textContent = `Page ${adminMsgState.page + 1} of ${totalPages}`;
  amEls.prevBtn.disabled = adminMsgState.page <= 0;
  amEls.nextBtn.disabled = adminMsgState.page + 1 >= totalPages;
}

// Initialize the tab on first switch (lazy)
function ensureAdminMessagesInit() {
  if (adminMsgState.initialized) return;
  adminMsgState.initialized = true;

  amEls.refreshBtn.addEventListener("click", () => {
    adminMsgState.page = 0;
    loadAdminMessages();
    refreshAdminMsgBadge();
  });

  loadAdminMessages();
  refreshAdminMsgBadge();
}

// Trigger init when user clicks the Messages tab (top or sidebar)
document.querySelectorAll('[data-sidebar-tab="messages"], [data-admin-tab="messages"]').forEach((btn) => {
  btn.addEventListener("click", () => ensureAdminMessagesInit());
});

async function refreshAdminMsgBadge() {
  try {
    const count = await getAdminFlaggedCount();
    if (count > 0) {
      amEls.sidebarBadge.textContent = String(count);
      amEls.sidebarBadge.classList.remove("hidden");
      amEls.topBadge.textContent = String(count);
      amEls.topBadge.classList.remove("hidden");
    } else {
      amEls.sidebarBadge.classList.add("hidden");
      amEls.topBadge.classList.add("hidden");
    }
  } catch {
    // Badge is non-critical — fail silently
  }
}

// Refresh the badge once on page load (without forcing tab init)
refreshAdminMsgBadge();
```

- [ ] **Step 6.3: Type-check + build**

Run: `npm run check && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 6.4: Manual smoke test (data load)**

Run: `npm run dev`. Log in as admin, click "Messages" tab. Expect:

1. Spinner appears briefly.
2. Table populates with up to 50 conversations, sorted newest first.
3. Each row shows: participants joined by "↔", boat title (or "—"), truncated last message, updated date, "Open" flag badge.
4. Pagination bar shows "Showing 1–N of M" and page indicator.
5. If there are no conversations on the platform, empty state appears.
6. If you have any conversations already in "flagged" state (none yet on first run), the sidebar badge would show — for now it's hidden.

Stop dev server.

- [ ] **Step 6.5: Commit**

```bash
git add src/pages/[...lang]/admin.astro
git commit -m "$(cat <<'EOF'
Wire up admin Messages tab data load and table render

Lazy init on first tab click. Loads via getAdminConversations RPC,
renders rows, paginates, and shows a sidebar/top badge with the
flagged-count.

Filters are still wired but their inputs are not yet listening —
next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Wire up filters + pagination buttons

**Files:**
- Modify: `src/pages/[...lang]/admin.astro` — extend the same script block

- [ ] **Step 7.1: Add a debounce helper near the top of the admin-messages section**

In `src/pages/[...lang]/admin.astro`, find the line `const adminMsgState = { ... }` you added in Task 6. Immediately before it, insert:

```ts
function amDebounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let t: ReturnType<typeof setTimeout> | null = null;
  return ((...args: any[]) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  }) as T;
}
```

- [ ] **Step 7.2: Extend `ensureAdminMessagesInit` to wire filter and pagination listeners**

Find the function `ensureAdminMessagesInit` you added in Task 6. Replace its body with the version below (additive — keeps the existing refresh button + loadAdminMessages call):

```ts
function ensureAdminMessagesInit() {
  if (adminMsgState.initialized) return;
  adminMsgState.initialized = true;

  const debouncedReload = amDebounce(() => {
    adminMsgState.page = 0;
    loadAdminMessages();
  }, 300);

  amEls.participantInput.addEventListener("input", () => {
    adminMsgState.participantQuery = amEls.participantInput.value;
    debouncedReload();
  });

  amEls.contentInput.addEventListener("input", () => {
    adminMsgState.contentQuery = amEls.contentInput.value;
    debouncedReload();
  });

  amEls.stateFilter.addEventListener("change", () => {
    adminMsgState.flagState = amEls.stateFilter.value as AdminFlagState | "all";
    adminMsgState.page = 0;
    loadAdminMessages();
  });

  amEls.refreshBtn.addEventListener("click", () => {
    adminMsgState.page = 0;
    loadAdminMessages();
    refreshAdminMsgBadge();
  });

  amEls.prevBtn.addEventListener("click", () => {
    if (adminMsgState.page > 0) {
      adminMsgState.page -= 1;
      loadAdminMessages();
    }
  });

  amEls.nextBtn.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(adminMsgState.total / adminMsgState.pageSize));
    if (adminMsgState.page + 1 < totalPages) {
      adminMsgState.page += 1;
      loadAdminMessages();
    }
  });

  loadAdminMessages();
  refreshAdminMsgBadge();
}
```

- [ ] **Step 7.3: Type-check + build**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 7.4: Manual smoke test (filters + pagination)**

Run: `npm run dev`. Log in as admin, go to Messages tab. Verify:

1. Type a partial name in "Search participant…" → after ~300ms the table refilters.
2. Clear the participant field → all rows return.
3. Select state = "Flagged" → 0 rows initially (none flagged yet).
4. Select state = "All states" → all rows return.
5. Type a known word from a real message in "Search message content…" → table narrows to conversations containing that word.
6. If you have > 50 conversations: click "Next ›" → page 2 loads, Prev becomes enabled.
7. Click "Refresh" → table reloads from page 1.

Stop dev server.

- [ ] **Step 7.5: Commit**

```bash
git add src/pages/[...lang]/admin.astro
git commit -m "$(cat <<'EOF'
Wire admin Messages filters and pagination

Debounced text inputs (300ms), instant select-change, and prev/next
buttons. All filter changes reset to page 0.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Add the thread modal DOM and open/close behavior

**Files:**
- Modify: `src/pages/[...lang]/admin.astro`

- [ ] **Step 8.1: Add the `<dialog>` element**

Find the existing `<dialog id="boat-detail-modal" ...>` block (around line 317). Immediately after its closing `</dialog>` tag, insert:

```html
<dialog id="admin-thread-modal" class="w-[min(800px,95vw)] max-h-[90vh] p-0 rounded-2xl shadow-2xl backdrop:bg-black/50">
  <div class="flex flex-col h-[min(90vh,800px)]">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
      <div class="min-w-0">
        <h2 id="atm-title" class="text-lg font-bold text-text truncate">Conversation</h2>
        <p id="atm-subtitle" class="text-xs text-text-muted mt-0.5"></p>
      </div>
      <button type="button" id="atm-close" class="h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0" aria-label="Close">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <!-- Messages (scrollable) -->
    <div class="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
      <div id="atm-loading" class="flex items-center justify-center py-12">
        <div class="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div id="atm-error" class="hidden text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3"></div>
      <div id="atm-empty" class="hidden text-center text-sm text-text-muted py-12">No messages in this conversation.</div>
      <div id="atm-messages" class="space-y-3"></div>
    </div>

    <!-- Flag controls (sticky bottom) -->
    <div class="border-t border-gray-100 bg-white p-5 space-y-3">
      <div class="flex items-center gap-4 flex-wrap">
        <span class="text-sm font-semibold text-text">Flag state:</span>
        <label class="inline-flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" name="atm-flag-state" value="open" class="atm-flag-radio" /> Open
        </label>
        <label class="inline-flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" name="atm-flag-state" value="flagged" class="atm-flag-radio" /> Flagged
        </label>
        <label class="inline-flex items-center gap-1.5 text-sm cursor-pointer">
          <input type="radio" name="atm-flag-state" value="reviewed" class="atm-flag-radio" /> Reviewed
        </label>
      </div>
      <div>
        <label for="atm-note" class="block text-xs font-semibold text-gray-600 mb-1">Note (admin-only, optional)</label>
        <textarea id="atm-note" rows="2" maxlength="1000" placeholder="Notes about this conversation…" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"></textarea>
      </div>
      <div class="flex items-center justify-between gap-3">
        <p id="atm-meta" class="text-xs text-text-muted"></p>
        <div class="flex items-center gap-2">
          <span id="atm-save-status" class="text-sm hidden"></span>
          <button type="button" id="atm-cancel-btn" class="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="button" id="atm-save-btn" class="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark">Save</button>
        </div>
      </div>
    </div>
  </div>
</dialog>
```

- [ ] **Step 8.2: Add the modal element references and open/close logic**

In `src/pages/[...lang]/admin.astro`, find the end of the admin-messages script block you added in Task 6 + Task 7 (just before the closing `</script>` of the file). Append:

```ts
// ---- Admin thread modal: DOM refs + open/close ----

const atmEls = {
  dialog: $("admin-thread-modal") as HTMLDialogElement,
  title: $("atm-title") as HTMLElement,
  subtitle: $("atm-subtitle") as HTMLElement,
  loading: $("atm-loading") as HTMLElement,
  error: $("atm-error") as HTMLElement,
  empty: $("atm-empty") as HTMLElement,
  messages: $("atm-messages") as HTMLElement,
  note: $("atm-note") as HTMLTextAreaElement,
  meta: $("atm-meta") as HTMLElement,
  saveBtn: $("atm-save-btn") as HTMLButtonElement,
  cancelBtn: $("atm-cancel-btn") as HTMLButtonElement,
  closeBtn: $("atm-close") as HTMLButtonElement,
  saveStatus: $("atm-save-status") as HTMLElement,
};

let atmCurrentConvId: string | null = null;

function atmReset() {
  atmCurrentConvId = null;
  atmEls.messages.innerHTML = "";
  atmEls.note.value = "";
  atmEls.title.textContent = "Conversation";
  atmEls.subtitle.textContent = "";
  atmEls.meta.textContent = "";
  atmEls.error.classList.add("hidden");
  atmEls.empty.classList.add("hidden");
  atmEls.saveStatus.classList.add("hidden");
  atmEls.saveStatus.textContent = "";
  document.querySelectorAll<HTMLInputElement>(".atm-flag-radio").forEach((r) => { r.checked = false; });
}

function atmClose() {
  if (atmEls.dialog.open) atmEls.dialog.close();
  atmReset();
}

atmEls.closeBtn.addEventListener("click", atmClose);
atmEls.cancelBtn.addEventListener("click", atmClose);

// Close on backdrop click
atmEls.dialog.addEventListener("click", (e) => {
  if (e.target === atmEls.dialog) atmClose();
});

// Row click delegation → open modal
amEls.tbody.addEventListener("click", (e) => {
  const tr = (e.target as HTMLElement).closest("tr") as HTMLTableRowElement | null;
  if (!tr || !tr.dataset.convId) return;
  openAdminThreadModal(tr.dataset.convId);
});

// Stub that gets filled in Task 9
async function openAdminThreadModal(convId: string) {
  const row = adminMsgState.rows.find((r) => r.id === convId);
  if (!row) return;
  atmCurrentConvId = convId;
  atmEls.title.textContent = amOtherParticipantLabel(row);
  atmEls.subtitle.textContent = row.boatTitle ? `Boat: ${row.boatTitle}` : "Direct message (no boat)";
  atmEls.loading.classList.remove("hidden");
  atmEls.empty.classList.add("hidden");
  atmEls.error.classList.add("hidden");
  atmEls.messages.innerHTML = "";
  if (!atmEls.dialog.open) atmEls.dialog.showModal();
  // Message + flag loading lives in Task 9
}
```

- [ ] **Step 8.3: Type-check + build**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 8.4: Manual smoke test (modal open/close)**

Run: `npm run dev`. Log in as admin, open Messages tab, click any row. Expect:

1. Modal opens, shows participant names in header and boat subtitle.
2. Messages area shows the spinner indefinitely (because Task 9 hasn't been written yet — that's expected).
3. Click "Cancel", "Close (X)", or click outside the modal → modal closes, content cleared.

Stop dev server.

- [ ] **Step 8.5: Commit**

```bash
git add src/pages/[...lang]/admin.astro
git commit -m "$(cat <<'EOF'
Add admin thread modal DOM and open/close behavior

Dialog renders header, messages container, and flag-control footer.
Row click in the table opens the modal. Cancel/Close/backdrop close it.
Message loading wired in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Load and render messages + populate flag controls

**Files:**
- Modify: `src/pages/[...lang]/admin.astro` — replace the `openAdminThreadModal` stub

- [ ] **Step 9.1: Replace `openAdminThreadModal` with the full implementation**

In `src/pages/[...lang]/admin.astro`, find the stub function `async function openAdminThreadModal(convId: string)` from Task 8. **Replace its entire body** with:

```ts
async function openAdminThreadModal(convId: string) {
  const row = adminMsgState.rows.find((r) => r.id === convId);
  if (!row) return;
  atmCurrentConvId = convId;
  atmEls.title.textContent = amOtherParticipantLabel(row);
  atmEls.subtitle.textContent = row.boatTitle ? `Boat: ${row.boatTitle}` : "Direct message (no boat)";

  // Pre-populate flag controls from row
  document.querySelectorAll<HTMLInputElement>(".atm-flag-radio").forEach((r) => {
    r.checked = r.value === row.flagState;
  });
  atmEls.note.value = row.flagNote || "";

  atmEls.loading.classList.remove("hidden");
  atmEls.empty.classList.add("hidden");
  atmEls.error.classList.add("hidden");
  atmEls.messages.innerHTML = "";
  if (!atmEls.dialog.open) atmEls.dialog.showModal();

  // Load messages
  try {
    const msgs = await getAdminMessagesForConversation(convId);
    atmEls.loading.classList.add("hidden");
    if (msgs.length === 0) {
      atmEls.empty.classList.remove("hidden");
    } else {
      atmRenderMessages(msgs, row);
    }
  } catch (err: any) {
    atmEls.loading.classList.add("hidden");
    atmEls.error.textContent = err?.message || "Failed to load messages";
    atmEls.error.classList.remove("hidden");
  }

  // Load "Last updated by" line
  await atmRenderMeta(row);
}

function atmRenderMessages(msgs: AdminThreadMessage[], row: AdminConversationRow) {
  atmEls.messages.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const m of msgs) {
    const senderDetails = row.participantDetails?.[m.senderId];
    const senderName = senderDetails?.displayName
      || [senderDetails?.firstName, senderDetails?.lastName].filter(Boolean).join(" ").trim()
      || m.senderName
      || "Unknown";
    const time = m.timestamp ? new Date(m.timestamp).toLocaleString(dateLang, {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    }) : "";
    const div = document.createElement("div");
    div.className = "bg-white border border-gray-200 rounded-lg px-3 py-2";
    div.innerHTML = `
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs font-semibold text-text">${escapeHtml(senderName)}</span>
        <span class="text-[11px] text-gray-400">${escapeHtml(time)}</span>
      </div>
      <div class="text-sm text-text whitespace-pre-wrap break-words">${escapeHtml(m.text || "")}</div>
    `;
    frag.appendChild(div);
  }
  atmEls.messages.appendChild(frag);
  // Scroll to bottom (most recent)
  atmEls.messages.parentElement!.scrollTop = atmEls.messages.parentElement!.scrollHeight;
}

async function atmRenderMeta(row: AdminConversationRow) {
  if (!row.flagUpdatedAt) {
    atmEls.meta.textContent = "Not yet annotated.";
    return;
  }
  const when = formatDate(row.flagUpdatedAt);
  // We don't have updated_by on the row — fetch it separately if we need the name.
  // For now we show the date only; if Task 4 stored updated_by anywhere we'd surface it.
  // The flag row carries updated_by — query it lazily here.
  try {
    const { data } = await supabase
      .from("conversation_admin_flags")
      .select("updated_by")
      .eq("conversation_id", row.id)
      .maybeSingle();
    const adminId = (data as any)?.updated_by as string | null | undefined;
    if (adminId) {
      const name = await getProfileDisplayName(adminId);
      atmEls.meta.textContent = name
        ? `Last updated by ${name} on ${when}`
        : `Last updated on ${when}`;
    } else {
      atmEls.meta.textContent = `Last updated on ${when}`;
    }
  } catch {
    atmEls.meta.textContent = `Last updated on ${when}`;
  }
}
```

- [ ] **Step 9.2: Type-check + build**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 9.3: Manual smoke test (messages render)**

Run: `npm run dev`. Log in as admin, open Messages tab, click a conversation row. Expect:

1. Modal opens.
2. Spinner disappears within ~1s.
3. Each message renders in chronological order, with sender name + timestamp + text (whitespace + newlines preserved).
4. Long messages wrap correctly.
5. Flag controls show "Open" radio selected (default for non-annotated conversations).
6. Note textarea is empty.
7. Meta line says "Not yet annotated."
8. Close modal → reopen a different conversation → loads independently.

Stop dev server.

- [ ] **Step 9.4: Commit**

```bash
git add src/pages/[...lang]/admin.astro
git commit -m "$(cat <<'EOF'
Render thread messages and populate flag controls in admin modal

Messages render chronologically with sender + timestamp + text.
Flag radio + note pre-fill from the row's current flag state.
"Last updated by" line resolves the admin's display name when present.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Save flag handler + row refresh

**Files:**
- Modify: `src/pages/[...lang]/admin.astro`

- [ ] **Step 10.1: Add the save handler**

In `src/pages/[...lang]/admin.astro`, find the end of the admin-messages script block (just before the closing `</script>` of the file). Append:

```ts
async function atmSaveFlag() {
  if (!atmCurrentConvId) return;
  const selected = document.querySelector<HTMLInputElement>(".atm-flag-radio:checked");
  if (!selected) {
    atmEls.saveStatus.textContent = "Select a flag state first";
    atmEls.saveStatus.className = "text-sm text-red-600";
    atmEls.saveStatus.classList.remove("hidden");
    return;
  }
  const state = selected.value as AdminFlagState;
  const note = atmEls.note.value;
  atmEls.saveBtn.disabled = true;
  atmEls.saveStatus.textContent = "Saving…";
  atmEls.saveStatus.className = "text-sm text-text-muted";
  atmEls.saveStatus.classList.remove("hidden");
  try {
    await setConversationFlag(atmCurrentConvId, state, note);
    atmEls.saveStatus.textContent = "Saved ✓";
    atmEls.saveStatus.className = "text-sm text-green-600";
    // Update row in-memory + rerender table
    const idx = adminMsgState.rows.findIndex((r) => r.id === atmCurrentConvId);
    if (idx >= 0) {
      adminMsgState.rows[idx] = {
        ...adminMsgState.rows[idx],
        flagState: state,
        flagNote: note.trim() || null,
        flagUpdatedAt: new Date().toISOString(),
      };
      amRenderRows();
    }
    // Refresh sidebar/top badge (flagged count may have changed)
    refreshAdminMsgBadge();
    // Auto-close after a beat
    setTimeout(() => {
      atmClose();
    }, 600);
  } catch (err: any) {
    atmEls.saveStatus.textContent = err?.message || "Save failed";
    atmEls.saveStatus.className = "text-sm text-red-600";
  } finally {
    atmEls.saveBtn.disabled = false;
  }
}

atmEls.saveBtn.addEventListener("click", atmSaveFlag);
```

- [ ] **Step 10.2: Type-check + build**

Run: `npm run check && npm run build`
Expected: 0 errors.

- [ ] **Step 10.3: Manual smoke test (save + row refresh + badge)**

Run: `npm run dev`. Log in as admin, open Messages tab. For one conversation:

1. Open it. Note current flag state ("Open").
2. Click "Flagged" radio, add note "test flag".
3. Click "Save". "Saving…" → "Saved ✓" → modal auto-closes after ~600ms.
4. The table row's Flag column now shows the red "Flagged" badge.
5. The sidebar "Messages" entry gains a red badge with "1".
6. The top "Messages" tab gains a red badge with "1".
7. Reload the page. Reopen the same conversation: flag is still "Flagged", note still "test flag".
8. Change to "Reviewed" and Save → row shows green "Reviewed" badge, badges decrement.
9. Change to "Open" + empty the note → row shows gray "Open" badge.
10. Filter by "Flagged" → empty result.
11. Filter by "Reviewed" → still 0 (you set it back to open).
12. Filter by "Open" → conversation appears.

Stop dev server.

- [ ] **Step 10.4: Commit**

```bash
git add src/pages/[...lang]/admin.astro
git commit -m "$(cat <<'EOF'
Wire admin flag save + in-place row refresh

Save button persists the flag state and note via setConversationFlag,
updates the row in the table without a full reload, refreshes the
sidebar/top flagged badges, and auto-closes the modal.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Smoke-test document + final verification pass

**Files:**
- Create: `docs/admin-messages-smoke-test.md`

- [ ] **Step 11.1: Write the smoke-test doc**

Create `docs/admin-messages-smoke-test.md` with this content:

```markdown
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
- [ ] `\d messages_text_fts_idx` (or `SELECT indexname FROM pg_indexes WHERE indexname='messages_text_fts_idx'`) → exists.
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
```

- [ ] **Step 11.2: Run through the smoke-test doc end-to-end**

Walk through the entire `docs/admin-messages-smoke-test.md` checklist manually. If anything fails, fix and re-run that section.

- [ ] **Step 11.3: Commit**

```bash
git add docs/admin-messages-smoke-test.md
git commit -m "$(cat <<'EOF'
Add manual smoke-test checklist for admin conversations view

Covers migration sanity, UI rendering, filters, modal, flagging,
non-admin RLS regression, and edge cases. No delete-action checks
required (intentional — feature contains no deletion paths).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-review (against the spec)

| Spec section | Plan coverage |
|---|---|
| Hard constraint: no deletion | Stated at top of plan; reaffirmed in Tasks 1, 3, 4, 11 |
| `conversation_admin_flags` table + RLS | Task 1, verified Task 2 |
| Admin SELECT policies on conversations / messages | Task 1, verified Task 2 |
| FTS GIN index | Task 1, verified Task 2 |
| `'simple'` config | Task 1 (SQL uses `to_tsvector('simple', text)`) |
| `SET NULL` on `updated_by` deletion | Task 1 |
| `getAdminConversations` with state / participant / content filters + pagination | Task 3 (via RPC) |
| `getAdminMessagesForConversation` | Task 4 |
| `setConversationFlag` (upsert keyed on conversation_id, sets updated_by + updated_at) | Task 4 |
| Lazy-created flag rows; `LEFT JOIN ... COALESCE(state,'open')` | Migration RPC (Task 1) does the COALESCE |
| Sidebar + top tab button | Task 5 |
| Tab content with filters, table, pagination | Tasks 5–7 |
| Modal: header, messages, flag controls | Tasks 8–10 |
| No per-message actions, no delete | Tasks 8–10 (DOM has none) |
| Debounced filter inputs (300ms) | Task 7 |
| Sidebar flagged-count badge | Tasks 4, 6 |
| Empty / error / loading states | Tasks 5, 6, 9, 10 |
| `plainto_tsquery` (escapes user input) | Task 1 RPC |
| Edge case: deleted participant → JSONB denormalized name | Task 6 (`amOtherParticipantLabel`) |
| Edge case: long messages truncated in table | Task 6 (`amTruncate`) |
| Edge case: `updated_by` deleted → render without name | Task 9 (`atmRenderMeta`) |
| Note soft cap 1000 chars | Task 8 (`maxlength="1000"`) |
| Smoke test doc | Task 11 |

No spec requirement is uncovered. Type names (`AdminFlagState`, `AdminConversationRow`, `AdminThreadMessage`), function signatures, and DOM element IDs are used consistently across tasks. No placeholders remain.
