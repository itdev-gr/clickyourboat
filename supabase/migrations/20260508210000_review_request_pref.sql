-- Email preference for review request emails (sent when booking ends).
alter table public.profiles
  add column if not exists email_review_request boolean not null default true;
