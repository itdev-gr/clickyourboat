-- Private storage bucket for personal documents uploaded from the account page
-- (certificate of incorporation, identity doc, IBAN doc, certificate of ownership).
--
-- RLS pattern matches the existing avatars / boat-assets buckets: the first path
-- segment must equal auth.uid(), so each user can only read/write their own folder.
-- Unlike avatars/boat-assets, this bucket is private — no public SELECT.

insert into storage.buckets (id, name, public)
values ('user-documents', 'user-documents', false)
on conflict (id) do nothing;

drop policy if exists user_documents_owner_read on storage.objects;
create policy user_documents_owner_read on storage.objects
  for select
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists user_documents_owner_insert on storage.objects;
create policy user_documents_owner_insert on storage.objects
  for insert
  with check (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists user_documents_owner_update on storage.objects;
create policy user_documents_owner_update on storage.objects
  for update
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );

drop policy if exists user_documents_owner_delete on storage.objects;
create policy user_documents_owner_delete on storage.objects
  for delete
  using (
    bucket_id = 'user-documents'
    and (storage.foldername(name))[1] = (auth.uid())::text
  );
