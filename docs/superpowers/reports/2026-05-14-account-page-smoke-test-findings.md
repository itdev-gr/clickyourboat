# Account Page Smoke Test — Findings

**Date:** 2026-05-14
**Tested by:** Claude Code (Opus 4.7) — automated via Playwright MCP
**Test user id:** `5bcdc509-fd20-4637-8369-6916391e4152` (UUID only; credentials redacted)
**Dev server:** `http://localhost:4322` (actual port; plan said 4321)
**Astro version:** 5.17.1
**Test sentinel timestamp:** `1778751687`
**Source under test:** `src/pages/[...lang]/account.astro`

---

## Summary

| Area | Status |
|---|---|
| Tab switching (5 tabs) | PASS |
| Information form save | PASS |
| Avatar upload | KNOWN-BUG |
| Experience form save | PASS |
| Payment IBAN form — mismatch validation | PASS |
| Payment IBAN form — actual save to DB | FAIL (missing columns) |
| Company files upload (`#files-form`) | KNOWN-BUG |
| Payment settings (`#payment-settings-form`) | KNOWN-BUG (also missing columns) |
| Password change + validations (mismatch, too-short, wrong-old, real) | PASS |
| Delete account button | KNOWN-BUG |
| Notifications form save | PASS |
| Reload-restore (Information, Experience, Notifications) | PASS |
| Reload-restore (Payment IBAN — save never landed) | N/A — save failed |

---

## Detailed Results

### Task 1 — Login + baseline
- Logged in as `smoketest-...@tapyourboat.com` via `/login` (selector: `#login-email`, `#login-password`, button `Sign in`).
- `#profile-content` became visible; all 5 tab buttons rendered.
- Baseline profile row: empty strings for `display_name/first_name/last_name`, `null` for all profile fields, `updated_at = null`, all 5 `email_*` notification flags default `true`.

### Task 2 — Tab switching: PASS
- Iterated `experience → payment → password → notifications → information`.
- For each click, the corresponding `#section-<name>` had no `hidden` class while the other four were hidden, and the clicked tab gained `border-text text-text` while others got `border-transparent text-text-muted`.

### Task 3 — Information tab form: PASS
- Filled all 18 fields with sentinel values (suffix `_1778751687`).
- `#info-success` text confirmed "Profile saved successfully."
- DB verification matched every column exactly; `display_name = "FirstSmoke_1778751687 LastSmoke_1778751687"`; `updated_at = 2026-05-14 09:43:30.989+00`.
- After page reload, every field rendered the saved value (verified via DOM read).

### Task 4 — Avatar upload: KNOWN-BUG (confirmed)
- `grep` shows `#avatar-upload` declared at line 76 and `avatar_url` only read at line 583. No `addEventListener`, no `supabase.storage.from(...).upload(...)`.
- Runtime: `document.getElementById('avatar-upload').onchange === null`.

### Task 5 — Experience tab: PASS
- Filled selects, textarea, three checkbox groups.
- `#exp-success` text confirmed "Experience saved successfully."
- DB matched: `nautical_level=intermediate`, `boat_preference=catamaran`, `description="Smoke test description 1778751687"`, `licences=["Coastal license","Offshore license"]`, `other_certs=["Radio operator's certificate"]`, `sailing_exp=["I'm an owner"]`; `updated_at = 2026-05-14 09:44:43.489+00`.
- Reload restored every field correctly.

### Task 6 — Payment IBAN form: MIXED (validation PASS, save FAIL)
- IBAN mismatch validation: PASS. `#payment-error` showed "IBAN fields do not match." `updated_at` did not change.
- Fixed confirmIban and resubmitted. UI showed `#payment-error` "Failed to save your changes. Please try again."
- Console error: `POST https://...supabase.co/rest/v1/profiles?id=eq.5bcdc509-...:0 400`.
- Root cause: the `profiles` table does **not contain** the columns `payment_type`, `bank_holder`, `iban`, `bic`. Verified directly:
  ```sql
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='profiles'
    AND column_name IN ('payment_type','bank_holder','iban','bic','downpayment','balance_days');
  -- returns []
  ```
- `updated_at` remained `2026-05-14 09:44:43.489+00` (unchanged from Task 5), confirming no write landed.
- Save handler exists (`account.astro:804-841`), but it tries to update columns that do not exist.

### Task 7 — Company files form (`#files-form`): KNOWN-BUG (confirmed)
- `grep` shows only the form/input declarations; no submit listener.
- Runtime: clicking Save inside `#files-form` caused a default browser submission. URL became `http://localhost:4322/account?certIncorporation=&identityDoc=&ibanDoc=&certOwnership=`. No upload to Supabase Storage; no `profiles` columns written.

### Task 8 — Payment settings form (`#payment-settings-form`): KNOWN-BUG (confirmed)
- `grep` shows only the form declaration (line 384); no submit listener.
- Columns `downpayment` and `balance_days` do **not** exist in the `profiles` table either (see Task 6 SQL).
- Runtime: setting `#pf-downpayment=30`, `#pf-balanceDays=14` and clicking Save caused a default form submission to `/account?downpayment=30&balanceDays=14`. After reload, both selects were empty — no persistence.

### Task 9 — Password change: PASS
- Mismatched-new-password: `#pw-error` = "New passwords do not match." PASS
- Too-short (`short`, 5 chars): `#pw-error` = "Password must be at least 8 characters." PASS
- Wrong old password: `#pw-error` = "Old password is incorrect." PASS
- Real change (`SmokeP@ss-... → NewPassSmoke!1`): `#pw-success` = "Password changed successfully." Form was reset.
- Logged out via Header `#user-menu-btn → #logout-btn` (redirected to `/`), logged back in with `NewPassSmoke!1` — success.
- Restored original password using `NewPassSmoke!1` as old. Success message confirmed. Logged out + back in with original password — success.

### Task 10 — Delete account button: KNOWN-BUG (confirmed)
- `grep` shows only the button declaration at line 447; no `addEventListener("click")`.
- Runtime: `document.getElementById('delete-account-btn').onclick === null`. Clicked it; URL stayed at `/account`, no console error, no navigation.
- `SELECT id, email FROM auth.users WHERE id = '<TEST_USER_UUID>'` returned the user — still exists.

### Task 11 — Notifications: PASS
- Toggled to pattern `[false, true, false, true, false]`.
- `#notif-success` = "Notification preferences saved."
- DB matched exactly; `updated_at = 2026-05-14 09:50:47.239+00`.
- Reload restored every checkbox to the saved value.

---

## Known Bugs

### 1. Avatar upload has no handler
- **File/line:** `src/pages/[...lang]/account.astro:66-78` (input declaration), no event listener anywhere.
- **UI presents:** "Change Photo" / "Remove" buttons over a hidden `<input type=file id=avatar-upload>`.
- **Why it doesn't work:** No `addEventListener('change', …)` is registered for `#avatar-upload`. No call to `supabase.storage.from(...).upload(...)`. Column `avatar_url` is read at line 583 (from `user_metadata`) but never written.
- **Suggested fix:** Add a `change` listener that uploads the file to a Supabase Storage bucket (e.g. `avatars/{user_id}/…`) and updates either `auth.user_metadata.avatar_url` or a new `profiles.avatar_url` column.

### 2. Company files form (`#files-form`) has no handler
- **File/line:** `src/pages/[...lang]/account.astro:354-379`.
- **UI presents:** Four file inputs (certIncorporation, identityDoc, ibanDoc, certOwnership) and a Save button.
- **Why it doesn't work:** No submit listener; clicking Save triggers the default form submission, navigating to `/account?…=` with empty values. No Storage upload, no DB write.
- **Suggested fix:** Add `e.preventDefault()` submit handler that uploads each non-empty file to Supabase Storage and persists the resulting URLs/paths to dedicated columns in `profiles` (which must also be added — none exist today).

### 3. Payment settings form (`#payment-settings-form`) has no handler AND no columns
- **File/line:** `src/pages/[...lang]/account.astro:382-411`.
- **UI presents:** `downpayment` and `balanceDays` selects plus a Save button.
- **Why it doesn't work:** (a) no submit listener — default submission shows `?downpayment=…&balanceDays=…` in URL; (b) the columns `downpayment` and `balance_days` do not exist in `profiles`, so even with a handler the write would fail. Load logic at lines 630-631 reads these columns, implying they were planned but never migrated.
- **Suggested fix:** Add columns `downpayment numeric` and `balance_days integer` to `profiles`, then wire a submit handler analogous to `payment-form` (`account.astro:804-841`).

### 4. Delete account button has no handler
- **File/line:** `src/pages/[...lang]/account.astro:447`.
- **UI presents:** A "Delete" button next to "Delete account" heading.
- **Why it doesn't work:** No `addEventListener('click', …)` registered for `#delete-account-btn`. Clicking is a no-op.
- **Suggested fix:** Add a click handler that shows a confirmation dialog and, on confirm, calls a server-side endpoint or edge function with the service-role key to delete the auth user and cascade-clean their `profiles` row, `boats`, etc.

### 5. Payment IBAN form save fails because DB columns are missing
- **File/line:** Handler `src/pages/[...lang]/account.astro:804-841`.
- **UI presents:** `paymentType`, `bankHolder`, `iban`, `confirmIban`, `bic` inputs and a Save button. Client-side IBAN-match validation works.
- **Why it doesn't work:** The handler issues `supabase.from('profiles').update({ payment_type, bank_holder, iban, bic, updated_at })`, but `profiles` does not contain `payment_type`, `bank_holder`, `iban`, or `bic`. The PostgREST call returns HTTP 400 and the UI shows "Failed to save your changes."
- **Suggested fix:** Add the missing columns to `profiles` via a migration (e.g. `payment_type text`, `bank_holder text`, `iban text`, `bic text`) and reload PostgREST schema cache. (Note: storing raw IBAN/BIC may have compliance implications — consider a separate encrypted table.)

---

## Failures

### Task 6 Step 4 — Payment save HTTP 400
- **Step that failed:** Clicking Save in `#payment-form` after fixing the confirm-IBAN.
- **Expected:** `#payment-success` visible with "Payment details saved successfully."; DB row updated with the four payment columns.
- **Actual:** `#payment-error` shown with "Failed to save your changes. Please try again."; DB `updated_at` did not advance from its Task-5 value of `2026-05-14 09:44:43.489+00`.
- **Console message captured:** `[ERROR] Failed to load resource: the server responded with a status of 400 () @ https://dmukceeargocoxtqzyga.supabase.co/rest/v1/profiles?id=eq.5bcdc509-fd20-4637-8369-6916391e4152:0`.
- **Reproduction:** see Task 6 in the plan; relies on the `profiles` table NOT containing `payment_type/bank_holder/iban/bic` (verified via `information_schema.columns`).

No other unexpected failures.

---

## Incidental Observations

- The login email regex pattern produces a runtime console warning: `Pattern attribute value [0-9s-+()]{6,20} is not a valid regular expression: Range out of order in character class`. This is on the `/login` page (not `/account`) but visible during smoke. Likely intended `[0-9\s\-+()]{6,20}`.
- Default form-submit behavior for `#files-form` and `#payment-settings-form` rewrites the URL on click, which clobbers any unsaved state in other tabs. Worth adding `e.preventDefault()` even before a real handler is wired, to avoid surprising UX.
- Information-tab "email" input is correctly readonly and not written on save (per the field map in `account.astro:677-689`).
- `#pf-confirmIban` is intentionally not restored on reload (not in the field map at `account.astro:604-636`) — confirmed expected.

---

## Test User State After Run

- Test user `5bcdc509-fd20-4637-8369-6916391e4152` still exists in `auth.users`.
- Password restored to original. The user can be safely deleted by the controller.
- Profile row reflects: Information + Experience + Notifications writes from this run. No payment / files / payment-settings data (because those code paths cannot persist).
