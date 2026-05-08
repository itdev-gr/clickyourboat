-- Email notification preferences on profiles.
-- Each toggle defaults to TRUE so existing users opt-in by default.
alter table public.profiles
  add column if not exists email_new_message      boolean not null default true,
  add column if not exists email_boat_approved    boolean not null default true,
  add column if not exists email_booking_request  boolean not null default true,
  add column if not exists email_payment_received boolean not null default true;
