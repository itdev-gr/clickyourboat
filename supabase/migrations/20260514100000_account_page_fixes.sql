-- Add columns required by the account page that were never migrated.
-- All are nullable; existing rows are unaffected.
--
-- Covers:
--   * Payment IBAN form        (payment_type, bank_holder, iban, bic)
--   * Payment settings form    (downpayment, balance_days)
--   * Company files uploads    (cert_incorporation_url, identity_doc_url, iban_doc_url, cert_ownership_url)
--
-- Avatar uses existing profiles.photo_url; no new column needed for that.
-- Storage bucket for the company files is created in a separate migration.

alter table public.profiles
  add column if not exists payment_type            text,
  add column if not exists bank_holder             text,
  add column if not exists iban                    text,
  add column if not exists bic                     text,
  add column if not exists downpayment             integer,
  add column if not exists balance_days            integer,
  add column if not exists cert_incorporation_url  text,
  add column if not exists identity_doc_url        text,
  add column if not exists iban_doc_url            text,
  add column if not exists cert_ownership_url      text;
