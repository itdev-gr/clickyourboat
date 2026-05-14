# Account Page Smoke Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Manually verify every interactive control on `src/pages/[...lang]/account.astro` works end-to-end: tab switching, form submission, Supabase write, and reload-restore. Surface any control that has no save handler or fails to persist.

**Architecture:** Run the Astro dev server, drive the browser with the Playwright MCP, and verify each write by querying Supabase via the `mcp__supabase__execute_sql` MCP tool. Each tab is one task: fill → save → verify in DB → reload → confirm UI restores the saved values.

**Tech Stack:** Astro 5 dev server, Supabase (`profiles` table + `auth.users`), Playwright MCP, Supabase MCP.

---

## Prerequisites

A test user account must exist in Supabase auth. If one does not, create it before starting:

```sql
-- Run via mcp__supabase__execute_sql, replacing values:
-- (Use auth.admin or Supabase dashboard — this is reference only.)
SELECT id, email FROM auth.users WHERE email = 'smoketest@tapyourboat.com';
```

Store the test user's `id` (UUID) and `email` for use in verification queries. Pass the password to Playwright when filling the login form. **Never commit credentials.**

The dev server must be running locally on `http://localhost:4321` (Astro's default). One terminal stays dedicated to it for the duration of the smoke test.

---

## File Structure

This plan creates no new files. It only reads from the codebase and writes to:
- A markdown findings report: `docs/superpowers/reports/2026-05-14-account-page-smoke-test-findings.md` (created in Task 12).

---

## Task 1: Start dev server and log in test user

**Files:** None modified.

- [ ] **Step 1: Start the dev server in a background bash**

Run: `npm run dev` with `run_in_background: true`. Confirm the server is up by reading the bash output for `Local   http://localhost:4321/`.

- [ ] **Step 2: Navigate to /account in the browser**

Use `mcp__playwright__browser_navigate` to `http://localhost:4321/account`. Expected: the auth gate appears with "Log in to view your profile".

- [ ] **Step 3: Log in**

Click the "Log in" button. On the login page, fill `email` and `password` fields with the test user's credentials, submit. Expected: redirect back to `/account` and the profile content (`#profile-content`) becomes visible.

- [ ] **Step 4: Snapshot the page**

Use `mcp__playwright__browser_snapshot` to confirm the Information tab is the active default and all 5 tab buttons render: Information, Boating experience level, Payment methods, Password, Notifications.

- [ ] **Step 5: Record baseline profile row**

Run via `mcp__supabase__execute_sql`:

```sql
SELECT * FROM profiles WHERE id = '<TEST_USER_UUID>';
```

Save the result. After every save task you will diff against this baseline to confirm exactly which columns changed.

---

## Task 2: Tab switching works

**Files:** None modified.

- [ ] **Step 1: Click each tab in order**

For each section in `["experience", "payment", "password", "notifications", "information"]`:

```
mcp__playwright__browser_click on selector: button.profile-tab[data-section="<section>"]
```

After each click, take a snapshot. Verify:
- `#section-<active>` is visible (not `.hidden`)
- All four other `#section-<name>` divs have the `hidden` class
- The clicked tab has classes `border-text text-text`
- The other tabs have classes `border-transparent text-text-muted`

- [ ] **Step 2: Record result**

If all five tabs switch correctly, mark PASS. If any tab fails to show its section, record the failure with the section id and the actual visible DOM in the findings report (Task 12).

---

## Task 3: Information tab — Personal Information form

**Files:** Reads `src/pages/[...lang]/account.astro:81-218`, writes to Supabase `profiles` table.

The form fields (input id → DB column) are defined at `account.astro:677-689` and reload at `account.astro:604-632`. These are the columns this form must update:

```
first_name, last_name, gender, birth_day, birth_month, birth_year,
language, phone_country, phone, address, postal_code, city,
company, company_address, siret, vat_number, website, booking_system, display_name, updated_at
```

The `email` field is `readonly` and is not saved.

- [ ] **Step 1: Click the Information tab**

Click `button.profile-tab[data-section="information"]`.

- [ ] **Step 2: Fill every field with unique test sentinel values**

Use `mcp__playwright__browser_fill_form` with the following values (suffix `_SMOKE_<timestamp>` so a repeat run does not collide):

| Selector | Value |
|---|---|
| `#pf-firstName` | `FirstSmoke_<ts>` |
| `#pf-lastName` | `LastSmoke_<ts>` |
| `#pf-gender` (select) | `female` |
| `#pf-birthDay` (select) | `15` |
| `#pf-birthMonth` (select) | `7` |
| `#pf-birthYear` (select) | `1990` |
| `#pf-language` (select) | `el` |
| `#pf-phoneCountry` (select) | `+44` |
| `#pf-phone` | `2071234567` |
| `#pf-address` | `1 Smoke St` |
| `#pf-postalCode` | `EC1A 1AA` |
| `#pf-city` | `London` |
| `#pf-company` | `SmokeCo_<ts>` |
| `#pf-companyAddress` | `2 Co Lane` |
| `#pf-siret` | `12345678901234` |
| `#pf-vatNumber` | `GB123456789` |
| `#pf-website` | `https://smoke.example.com` |
| `#pf-bookingSystem` | `SmokeBookings` |

- [ ] **Step 3: Click Save**

Click the submit button inside `#personal-info-form`.

- [ ] **Step 4: Verify UI feedback**

Wait up to 3 seconds. Expected: `#info-success` becomes visible with text "Profile saved successfully." `#info-error` stays hidden.

If `#info-error` shows instead, capture its text and console messages (`mcp__playwright__browser_console_messages`) and stop — record as FAIL.

- [ ] **Step 5: Verify Supabase write**

Run:

```sql
SELECT first_name, last_name, gender, birth_day, birth_month, birth_year,
       language, phone_country, phone, address, postal_code, city,
       company, company_address, siret, vat_number, website, booking_system,
       display_name, updated_at
FROM profiles WHERE id = '<TEST_USER_UUID>';
```

Assert every column equals the value sent. Assert `display_name` equals `"FirstSmoke_<ts> LastSmoke_<ts>"`. Assert `updated_at` is within the last 60 seconds.

- [ ] **Step 6: Reload and verify restore**

Use `mcp__playwright__browser_navigate` to `http://localhost:4321/account` (forces a reload). Wait for `#profile-content` to be visible. Snapshot the form. Assert every field renders the saved value (per the load logic at `account.astro:604-636`).

- [ ] **Step 7: Record result in findings report**

PASS/FAIL with diff if FAIL.

---

## Task 4: Information tab — Avatar upload control

**Files:** Reads `account.astro:66-78`.

The control is an `<input type="file" id="avatar-upload">` with no `change` listener anywhere in the page script. This task verifies that observation.

- [ ] **Step 1: Search the page source for an avatar handler**

Run:

```
grep -n "avatar-upload\|avatar_url" 'src/pages/[...lang]/account.astro'
```

Expected: only the `<input>` declaration and the read-side at line 583. No `addEventListener` against `#avatar-upload`. No `supabase.storage.from(...).upload(` call.

- [ ] **Step 2: Confirm in the browser**

In the running page, evaluate:

```js
mcp__playwright__browser_evaluate with function: "() => { const el = document.getElementById('avatar-upload'); return { exists: !!el, hasOnchange: !!el?.onchange }; }"
```

Expected: `{ exists: true, hasOnchange: false }`.

- [ ] **Step 3: Record as KNOWN-BUG**

Avatar upload is decorative. Selecting an image does nothing. Add to findings: "Avatar `<input type=file id=avatar-upload>` has no `change` handler — uploading does not persist to Supabase Storage or `profiles.avatar_url`."

---

## Task 5: Boating experience tab

**Files:** Reads `account.astro:223-309` and the save handler at `account.astro:704-731`.

Columns written: `nautical_level, boat_preference, description, licences (text[]), other_certs (text[]), sailing_exp (text[]), updated_at`.

- [ ] **Step 1: Switch to experience tab**

Click `button.profile-tab[data-section="experience"]`.

- [ ] **Step 2: Fill fields**

| Selector | Value |
|---|---|
| `#pf-nauticalLevel` | `intermediate` |
| `#pf-boatPreference` | `catamaran` |
| `#pf-description` | `Smoke test description <ts>` |
| checkbox `input[name="licences"][value="Coastal license"]` | check |
| checkbox `input[name="licences"][value="Offshore license"]` | check |
| checkbox `input[name="otherCerts"][value="Radio operator's certificate"]` | check |
| checkbox `input[name="sailingExp"][value="I'm an owner"]` | check |

Leave the other three checkboxes unchecked.

- [ ] **Step 3: Click Save**

Submit button inside `#experience-form`.

- [ ] **Step 4: Verify UI feedback**

Expected: `#exp-success` visible with "Experience saved successfully." `#exp-error` hidden.

- [ ] **Step 5: Verify Supabase write**

```sql
SELECT nautical_level, boat_preference, description,
       licences, other_certs, sailing_exp, updated_at
FROM profiles WHERE id = '<TEST_USER_UUID>';
```

Assert:
- `nautical_level = 'intermediate'`
- `boat_preference = 'catamaran'`
- `description = 'Smoke test description <ts>'`
- `licences = ARRAY['Coastal license','Offshore license']` (order may differ — compare as set)
- `other_certs = ARRAY["Radio operator''s certificate"]`
- `sailing_exp = ARRAY["I''m an owner"]`
- `updated_at` within last 60 seconds

- [ ] **Step 6: Reload and verify restore**

Navigate to `/account`, click the experience tab, assert each select / textarea / checkbox shows the saved value.

- [ ] **Step 7: Record result**

PASS/FAIL.

---

## Task 6: Payment tab — IBAN/PayPal form

**Files:** Reads `account.astro:312-348` and save handler `account.astro:804-841`.

Columns written: `payment_type, bank_holder, iban, bic, updated_at`. (Note: `confirmIban` is client-side validation only.)

- [ ] **Step 1: Switch to payment tab**

Click `button.profile-tab[data-section="payment"]`.

- [ ] **Step 2: First, test IBAN mismatch validation**

Fill:
- `#pf-paymentType` = `iban`
- `#pf-bankHolder` = `Smoke Holder`
- `#pf-iban` = `GR1601101250000000012300695`
- `input[name="confirmIban"]` = `GR9999999999999999999999999`
- `#pf-bic` = `ETHNGRAA`

Click Save. Expected: `#payment-error` shows "IBAN fields do not match." No Supabase write.

Verify no DB update happened:

```sql
SELECT iban, updated_at FROM profiles WHERE id = '<TEST_USER_UUID>';
```

`iban` should still match the previous value, `updated_at` unchanged from Task 5.

- [ ] **Step 3: Fix the confirm-IBAN and re-save**

Change `input[name="confirmIban"]` to `GR1601101250000000012300695`. Click Save.

Expected: `#payment-success` visible. `#payment-error` hidden.

- [ ] **Step 4: Verify Supabase write**

```sql
SELECT payment_type, bank_holder, iban, bic, updated_at
FROM profiles WHERE id = '<TEST_USER_UUID>';
```

Assert all four values match what was sent.

- [ ] **Step 5: Reload and verify restore**

Reload `/account`, switch to payment tab. Confirm `#pf-paymentType`, `#pf-bankHolder`, `#pf-iban`, `#pf-bic` show saved values.

**Note:** `#pf-confirmIban` is intentionally NOT restored on reload (per `account.astro:604-636` it is not in the field map). Document this as expected behavior.

- [ ] **Step 6: Record result**

PASS/FAIL.

---

## Task 7: Payment tab — Company's files upload (KNOWN-BUG candidate)

**Files:** Reads `account.astro:351-379`.

The form `#files-form` has four `<input type="file">` fields and a Save button, but inspection of the script (`account.astro:537-874`) shows no `addEventListener` against `files-form`. This task confirms that observation.

- [ ] **Step 1: Search for a handler**

Run:

```
grep -n "files-form\|certIncorporation\|identityDoc\|ibanDoc\|certOwnership" 'src/pages/[...lang]/account.astro'
```

Expected: only the form/input declarations. No submit handler, no storage upload call.

- [ ] **Step 2: Confirm in the browser**

Switch to the payment tab. Click the Save button inside `#files-form` without picking files. Expected: form submits via default browser action (page may reload with empty query string). Capture the resulting URL and any console errors.

- [ ] **Step 3: Record as KNOWN-BUG**

Add to findings: "`#files-form` has no submit handler. Clicking Save triggers a default form submission, files are never uploaded to Supabase Storage, and no `profiles` columns are written for these documents."

---

## Task 8: Payment tab — Payment settings (KNOWN-BUG candidate)

**Files:** Reads `account.astro:382-411`.

The form `#payment-settings-form` has `downpayment` and `balanceDays` selects plus a Save button, but no submit handler in the script. The reload code at `account.astro:604-636` does include `pf-downpayment` and `pf-balanceDays`, implying the columns `downpayment` and `balance_days` exist in `profiles` — but nothing writes them.

- [ ] **Step 1: Search for a handler**

```
grep -n "payment-settings-form" 'src/pages/[...lang]/account.astro'
```

Expected: only the form declaration on line ~384. No submit listener.

- [ ] **Step 2: Confirm columns exist**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
  AND column_name IN ('downpayment','balance_days');
```

Record whether both columns exist. If they do, the bug is "controls exist + columns exist but no save wiring." If they don't, the bug also includes a schema gap.

- [ ] **Step 3: Try to save manually**

Switch to the payment tab. Set `#pf-downpayment` = `30`, `#pf-balanceDays` = `14`. Click the Save button inside `#payment-settings-form`. Reload `/account`. Switch to payment tab. Assert both selects are EMPTY (proves no persistence).

- [ ] **Step 4: Record as KNOWN-BUG**

Add to findings with column-exists status from Step 2.

---

## Task 9: Password tab — Change password

**Files:** Reads `account.astro:415-441` and handler `account.astro:734-801`.

This task DOES change the test user's password. After the test, set it back so the credentials stored in the prerequisites stay valid.

- [ ] **Step 1: Switch to password tab**

Click `button.profile-tab[data-section="password"]`.

- [ ] **Step 2: Test mismatched-new-password validation**

Fill:
- `oldPassword` = `<current_test_password>`
- `newPassword` = `NewPassSmoke!1`
- `confirmNewPassword` = `Different!1`

Click Save. Expected: `#pw-error` shows "New passwords do not match." No password change.

- [ ] **Step 3: Test too-short-password validation**

Fill `newPassword` and `confirmNewPassword` = `short` (5 chars). Click Save. Expected: `#pw-error` shows "Password must be at least 8 characters."

- [ ] **Step 4: Test wrong-old-password validation**

Fill:
- `oldPassword` = `WrongOldPass!1`
- `newPassword` = `NewPassSmoke!1`
- `confirmNewPassword` = `NewPassSmoke!1`

Click Save. Expected: `#pw-error` shows "Old password is incorrect."

- [ ] **Step 5: Perform a real password change**

Fill correctly:
- `oldPassword` = `<current_test_password>`
- `newPassword` = `NewPassSmoke!1`
- `confirmNewPassword` = `NewPassSmoke!1`

Click Save. Expected: `#pw-success` shows "Password changed successfully." Form is reset.

- [ ] **Step 6: Verify new password works**

Log out (use the user menu or `mcp__playwright__browser_evaluate` to call `supabase.auth.signOut()`). Re-login with `NewPassSmoke!1`. Expected: login succeeds.

- [ ] **Step 7: Restore the original password**

In the password tab, change it back:
- `oldPassword` = `NewPassSmoke!1`
- `newPassword` = `<current_test_password>`
- `confirmNewPassword` = `<current_test_password>`

Verify success message. Verify login still works with the original password (sign out + sign in).

- [ ] **Step 8: Record result**

PASS/FAIL.

---

## Task 10: Password tab — Delete account button (BEHAVIORAL CHECK ONLY — do not actually delete)

**Files:** Reads `account.astro:443-450`.

The `<button id="delete-account-btn">` has no click handler in the script. This task confirms that without actually deleting.

- [ ] **Step 1: Search for a handler**

```
grep -n "delete-account-btn" 'src/pages/[...lang]/account.astro'
```

Expected: only the button declaration. No `addEventListener("click")`.

- [ ] **Step 2: Click the button**

Switch to the password tab. Click `#delete-account-btn`. Expected: nothing happens, no console error, no navigation. The user is NOT deleted.

- [ ] **Step 3: Confirm test user still exists**

```sql
SELECT id, email FROM auth.users WHERE id = '<TEST_USER_UUID>';
```

Row must still exist.

- [ ] **Step 4: Record as KNOWN-BUG**

Add to findings: "`#delete-account-btn` has no click handler. Clicking does nothing; account deletion is not implemented in this UI."

---

## Task 11: Notifications tab

**Files:** Reads `account.astro:453-499` and handler `account.astro:844-872`.

Columns written: `email_new_message, email_boat_approved, email_booking_request, email_payment_received, email_review_request, updated_at`. Default-true on first load (per `data.email_* !== false` at `account.astro:651-657`).

- [ ] **Step 1: Switch to notifications tab**

Click `button.profile-tab[data-section="notifications"]`.

- [ ] **Step 2: Toggle to a specific pattern**

Set checkboxes:
- `#pf-emailNewMessage` = unchecked
- `#pf-emailBoatApproved` = checked
- `#pf-emailBookingRequest` = unchecked
- `#pf-emailPaymentReceived` = checked
- `#pf-emailReviewRequest` = unchecked

- [ ] **Step 3: Click Save**

Submit button in `#notifications-form`.

Expected: `#notif-success` shows "Notification preferences saved."

- [ ] **Step 4: Verify Supabase write**

```sql
SELECT email_new_message, email_boat_approved, email_booking_request,
       email_payment_received, email_review_request, updated_at
FROM profiles WHERE id = '<TEST_USER_UUID>';
```

Assert: `email_new_message = false`, `email_boat_approved = true`, `email_booking_request = false`, `email_payment_received = true`, `email_review_request = false`.

- [ ] **Step 5: Reload and verify restore**

Reload `/account`, switch to notifications tab. Assert each checkbox matches the saved value above.

- [ ] **Step 6: Record result**

PASS/FAIL.

---

## Task 12: Write findings report and commit

**Files:**
- Create: `docs/superpowers/reports/2026-05-14-account-page-smoke-test-findings.md`

- [ ] **Step 1: Compile findings**

Build the report with this structure:

```markdown
# Account Page Smoke Test — Findings

**Date:** 2026-05-14
**Tested by:** <agent or person>
**Test user id:** <REDACTED — UUID only, no email>
**Dev server:** http://localhost:4321
**Astro version:** <from package-lock>

## Summary

| Area | Status |
|---|---|
| Tab switching | PASS / FAIL |
| Information form save | PASS / FAIL |
| Avatar upload | KNOWN-BUG |
| Experience form save | PASS / FAIL |
| Payment IBAN form save + IBAN-mismatch validation | PASS / FAIL |
| Company files upload (`#files-form`) | KNOWN-BUG |
| Payment settings (`#payment-settings-form`) | KNOWN-BUG |
| Password change + validations | PASS / FAIL |
| Delete account button | KNOWN-BUG |
| Notifications form save | PASS / FAIL |
| Reload-restore across all tabs | PASS / FAIL |

## Known Bugs

For each KNOWN-BUG above, write a short paragraph:
- File + line range
- What the UI presents to the user
- Why it does not work (missing listener / missing column / etc.)
- Suggested fix one-liner

## Failures

For each FAIL, write:
- Step that failed
- Expected vs actual
- Console messages captured
- Reproduction steps (already in the relevant task)
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/reports/2026-05-14-account-page-smoke-test-findings.md
git commit -m "$(cat <<'EOF'
Add account page smoke test findings

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Tear down**

Close all Playwright browser contexts. Stop the dev server (`KillShell` on the background bash). Confirm no orphan processes with `ps aux | grep astro`.

---

## Spec Coverage Check

Every interactive control on `account.astro` is covered:
- 5 tabs → Task 2 (switching) + Tasks 3, 5, 6, 9, 11 (per-tab content)
- 6 forms with save buttons → Tasks 3 (`#personal-info-form`), 5 (`#experience-form`), 6 (`#payment-form`), 7 (`#files-form`), 8 (`#payment-settings-form`), 9 (`#password-form`), 11 (`#notifications-form`) — 7 total
- 2 non-form controls → Task 4 (avatar) + Task 10 (delete account)
- Reload-restore is verified inside each save task (Steps "Reload and verify restore")

No spec gaps.
