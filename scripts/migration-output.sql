-- ═══ AUTH USERS + PROFILES ═══

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '514c95ff-0484-4365-acba-ece1a0f33853', 'authenticated', 'authenticated',
  'marioskif@test.com', '',
  NOW(), '2026-03-10T19:10:51.305Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"marioskif@test.com","first_name":"","last_name":"","display_name":"Marios Kif"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '514c95ff-0484-4365-acba-ece1a0f33853', '514c95ff-0484-4365-acba-ece1a0f33853',
  '{"sub":"514c95ff-0484-4365-acba-ece1a0f33853","email":"marioskif@test.com"}'::jsonb,
  'email', '514c95ff-0484-4365-acba-ece1a0f33853', NOW(), '2026-03-10T19:10:51.305Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '514c95ff-0484-4365-acba-ece1a0f33853', 'marioskif@test.com', 'Marios Kif', '', '',
  NULL, 'user', '2026-03-10T19:10:51.305Z', NULL, '0Q48trpZSHQNuJCFNfQSSeftRIX2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '628cd2ee-25bc-4655-84cf-e6cf05c1815a', 'authenticated', 'authenticated',
  'dimitrisminog@hotmail.com', '',
  NOW(), '2026-03-19T13:12:43.027Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"dimitrisminog@hotmail.com","first_name":"Dim","last_name":"Minog","display_name":"Dim Minog"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '628cd2ee-25bc-4655-84cf-e6cf05c1815a', '628cd2ee-25bc-4655-84cf-e6cf05c1815a',
  '{"sub":"628cd2ee-25bc-4655-84cf-e6cf05c1815a","email":"dimitrisminog@hotmail.com"}'::jsonb,
  'email', '628cd2ee-25bc-4655-84cf-e6cf05c1815a', NOW(), '2026-03-19T13:12:43.027Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '628cd2ee-25bc-4655-84cf-e6cf05c1815a', 'dimitrisminog@hotmail.com', 'Dim Minog', 'Dim', 'Minog',
  NULL, 'user', '2026-03-19T13:12:43.027Z', '2026-03-19T13:12:43.027Z', '3JRguj543lNzu09tAjtx5K4KzBD2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a1bf34fb-9951-49c1-a228-967a5fe8d897', 'authenticated', 'authenticated',
  'info@aktiboatrentals.com', '',
  NOW(), '2026-03-16T13:31:02.326Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"info@aktiboatrentals.com","first_name":"George","last_name":"Assos","display_name":"George Assos"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'a1bf34fb-9951-49c1-a228-967a5fe8d897', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  '{"sub":"a1bf34fb-9951-49c1-a228-967a5fe8d897","email":"info@aktiboatrentals.com"}'::jsonb,
  'email', 'a1bf34fb-9951-49c1-a228-967a5fe8d897', NOW(), '2026-03-16T13:31:02.326Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'a1bf34fb-9951-49c1-a228-967a5fe8d897', 'info@aktiboatrentals.com', 'George Assos', 'George', 'Assos',
  NULL, 'owner', '2026-03-16T13:31:02.326Z', '2026-03-16T13:31:02.326Z', '5BE3cMQvT4Xf6GrkBlGh8kGFhGI3'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '80cb0147-bc64-44b8-9e24-6db953afa33e', 'authenticated', 'authenticated',
  'marioskif@hotmail.com', '',
  NOW(), '2026-03-14T21:11:37.677Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"marioskif@hotmail.com","first_name":"test1","last_name":"test1","display_name":"test1 test1"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '80cb0147-bc64-44b8-9e24-6db953afa33e', '80cb0147-bc64-44b8-9e24-6db953afa33e',
  '{"sub":"80cb0147-bc64-44b8-9e24-6db953afa33e","email":"marioskif@hotmail.com"}'::jsonb,
  'email', '80cb0147-bc64-44b8-9e24-6db953afa33e', NOW(), '2026-03-14T21:11:37.677Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '80cb0147-bc64-44b8-9e24-6db953afa33e', 'marioskif@hotmail.com', 'test1 test1', 'test1', 'test1',
  NULL, 'user', '2026-03-14T21:11:37.677Z', '2026-03-14T21:11:37.677Z', '8uQUATlA7KOM1GdwhhA4MFpNO8Z2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '967dbf84-00f9-4fc3-acc2-5516034fbbe3', 'authenticated', 'authenticated',
  'xyderos.dimitris@gmail.com', '',
  NOW(), '2026-03-16T20:41:46.553Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"xyderos.dimitris@gmail.com","first_name":"dimitris ","last_name":"xyderos ","display_name":"dimitris  xyderos"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '967dbf84-00f9-4fc3-acc2-5516034fbbe3', '967dbf84-00f9-4fc3-acc2-5516034fbbe3',
  '{"sub":"967dbf84-00f9-4fc3-acc2-5516034fbbe3","email":"xyderos.dimitris@gmail.com"}'::jsonb,
  'email', '967dbf84-00f9-4fc3-acc2-5516034fbbe3', NOW(), '2026-03-16T20:41:46.553Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '967dbf84-00f9-4fc3-acc2-5516034fbbe3', 'xyderos.dimitris@gmail.com', 'dimitris  xyderos', 'dimitris ', 'xyderos ',
  NULL, 'user', '2026-03-16T20:41:46.553Z', '2026-03-16T20:41:46.553Z', 'EyYJPoggGucIQJWZidBbYN1J7P33'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '1be5abb5-387f-46d5-a4f0-3c1929957859', 'authenticated', 'authenticated',
  'info@almalibre-rib.gr', '',
  NOW(), '2026-03-14T11:31:59.791Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"info@almalibre-rib.gr","first_name":"Θοδωρης","last_name":"Ρουσακης","display_name":"Θοδωρης Ρουσακης"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '1be5abb5-387f-46d5-a4f0-3c1929957859', '1be5abb5-387f-46d5-a4f0-3c1929957859',
  '{"sub":"1be5abb5-387f-46d5-a4f0-3c1929957859","email":"info@almalibre-rib.gr"}'::jsonb,
  'email', '1be5abb5-387f-46d5-a4f0-3c1929957859', NOW(), '2026-03-14T11:31:59.791Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '1be5abb5-387f-46d5-a4f0-3c1929957859', 'info@almalibre-rib.gr', 'Θοδωρης Ρουσακης', 'Θοδωρης', 'Ρουσακης',
  NULL, 'user', '2026-03-14T11:31:59.791Z', '2026-03-14T11:33:55.000Z', 'IoEatAxG6GeBN9uCQip893CcGB72'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b8a2e5b7-6e7a-453c-ab3d-813362e1ad80', 'authenticated', 'authenticated',
  'patirisboxing@gmail.com', '',
  NOW(), '2026-03-17T16:06:31.387Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"patirisboxing@gmail.com","first_name":"Nikos","last_name":"Patiris","display_name":"Nikos Patiris"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'b8a2e5b7-6e7a-453c-ab3d-813362e1ad80', 'b8a2e5b7-6e7a-453c-ab3d-813362e1ad80',
  '{"sub":"b8a2e5b7-6e7a-453c-ab3d-813362e1ad80","email":"patirisboxing@gmail.com"}'::jsonb,
  'email', 'b8a2e5b7-6e7a-453c-ab3d-813362e1ad80', NOW(), '2026-03-17T16:06:31.387Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'b8a2e5b7-6e7a-453c-ab3d-813362e1ad80', 'patirisboxing@gmail.com', 'Nikos Patiris', 'Nikos', 'Patiris',
  NULL, 'owner', '2026-03-17T16:06:31.387Z', '2026-03-17T16:06:31.387Z', 'NiAG8VIDUoQMvLWSRUugR0AmUyt2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '15383117-e6e8-4a1f-8882-fa8efc086827', 'authenticated', 'authenticated',
  'm_lampaditis@yahoo.com', '',
  NOW(), '2026-03-15T07:55:38.569Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"m_lampaditis@yahoo.com","first_name":"Markos","last_name":"Lampaditis","display_name":"Markos Lampaditis"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '15383117-e6e8-4a1f-8882-fa8efc086827', '15383117-e6e8-4a1f-8882-fa8efc086827',
  '{"sub":"15383117-e6e8-4a1f-8882-fa8efc086827","email":"m_lampaditis@yahoo.com"}'::jsonb,
  'email', '15383117-e6e8-4a1f-8882-fa8efc086827', NOW(), '2026-03-15T07:55:38.569Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '15383117-e6e8-4a1f-8882-fa8efc086827', 'm_lampaditis@yahoo.com', 'Markos Lampaditis', 'Markos', 'Lampaditis',
  NULL, 'user', '2026-03-15T07:55:38.569Z', '2026-03-15T07:55:38.569Z', 'VZOPtcg7GsQ2ofh1LoltDTJIRvI2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '9c96feb1-88a9-4234-ab79-fcda5e9837dd', 'authenticated', 'authenticated',
  'solmaraegina@gmail.con', '',
  NOW(), '2026-03-15T20:12:14.719Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"solmaraegina@gmail.con","first_name":"Μαρία","last_name":"Σολωμάκου","display_name":"Μαρία Σολωμάκου"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '9c96feb1-88a9-4234-ab79-fcda5e9837dd', '9c96feb1-88a9-4234-ab79-fcda5e9837dd',
  '{"sub":"9c96feb1-88a9-4234-ab79-fcda5e9837dd","email":"solmaraegina@gmail.con"}'::jsonb,
  'email', '9c96feb1-88a9-4234-ab79-fcda5e9837dd', NOW(), '2026-03-15T20:12:14.719Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '9c96feb1-88a9-4234-ab79-fcda5e9837dd', 'solmaraegina@gmail.con', 'Μαρία Σολωμάκου', 'Μαρία', 'Σολωμάκου',
  NULL, 'user', '2026-03-15T20:12:14.719Z', '2026-03-15T20:12:14.719Z', 'XFeTi7986jMOzB5dchiEEr3j75j2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'ebfa22b6-e7bb-40bb-92fe-5a3865387801', 'authenticated', 'authenticated',
  'test@test.gr', '',
  NOW(), '2026-03-13T13:30:00.368Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"test@test.gr","first_name":"","last_name":"","display_name":"test teste1"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'ebfa22b6-e7bb-40bb-92fe-5a3865387801', 'ebfa22b6-e7bb-40bb-92fe-5a3865387801',
  '{"sub":"ebfa22b6-e7bb-40bb-92fe-5a3865387801","email":"test@test.gr"}'::jsonb,
  'email', 'ebfa22b6-e7bb-40bb-92fe-5a3865387801', NOW(), '2026-03-13T13:30:00.368Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'ebfa22b6-e7bb-40bb-92fe-5a3865387801', 'test@test.gr', 'test teste1', '', '',
  NULL, 'user', '2026-03-13T13:30:00.368Z', NULL, 'ZHBmfPRhVgMGWsUeOvMF6YNjQ3G2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'e80c36f8-3151-4498-ac6e-cccf221dd7cc', 'authenticated', 'authenticated',
  'info@fancysailing.com', '',
  NOW(), '2026-03-20T15:29:13.896Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"info@fancysailing.com","first_name":"Maria","last_name":"Tsirou","display_name":"Maria Tsirou"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'e80c36f8-3151-4498-ac6e-cccf221dd7cc', 'e80c36f8-3151-4498-ac6e-cccf221dd7cc',
  '{"sub":"e80c36f8-3151-4498-ac6e-cccf221dd7cc","email":"info@fancysailing.com"}'::jsonb,
  'email', 'e80c36f8-3151-4498-ac6e-cccf221dd7cc', NOW(), '2026-03-20T15:29:13.896Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'e80c36f8-3151-4498-ac6e-cccf221dd7cc', 'info@fancysailing.com', 'Maria Tsirou', 'Maria', 'Tsirou',
  NULL, 'user', '2026-03-20T15:29:13.896Z', '2026-03-20T15:29:13.896Z', 'aBwDiSS81CYAmQ6jBIbXTG2gPkG2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11cb327c-703d-4ae0-9eb4-93b135b688f1', 'authenticated', 'authenticated',
  'info@agniboats.com', '',
  NOW(), '2026-03-21T12:56:28.538Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"info@agniboats.com","first_name":"George","last_name":"Daffilos","display_name":"George Daffilos"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '11cb327c-703d-4ae0-9eb4-93b135b688f1', '11cb327c-703d-4ae0-9eb4-93b135b688f1',
  '{"sub":"11cb327c-703d-4ae0-9eb4-93b135b688f1","email":"info@agniboats.com"}'::jsonb,
  'email', '11cb327c-703d-4ae0-9eb4-93b135b688f1', NOW(), '2026-03-21T12:56:28.538Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '11cb327c-703d-4ae0-9eb4-93b135b688f1', 'info@agniboats.com', 'George Daffilos', 'George', 'Daffilos',
  NULL, 'user', '2026-03-21T12:56:28.538Z', '2026-03-21T12:56:28.538Z', 'acQJNEufbxVj13AKKphpWe5EbNX2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '6cb7fa11-5e03-4487-aed4-3a66269bdc57', 'authenticated', 'authenticated',
  'marios1@test.com', '',
  NOW(), '2026-03-10T22:11:53.291Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"marios1@test.com","first_name":"","last_name":"","display_name":"marios  marios"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '6cb7fa11-5e03-4487-aed4-3a66269bdc57', '6cb7fa11-5e03-4487-aed4-3a66269bdc57',
  '{"sub":"6cb7fa11-5e03-4487-aed4-3a66269bdc57","email":"marios1@test.com"}'::jsonb,
  'email', '6cb7fa11-5e03-4487-aed4-3a66269bdc57', NOW(), '2026-03-10T22:11:53.291Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '6cb7fa11-5e03-4487-aed4-3a66269bdc57', 'marios1@test.com', 'marios  marios', '', '',
  NULL, 'user', '2026-03-10T22:11:53.291Z', NULL, 'bGiJtsUAC3MgiHMZL29ZcMupf242'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a191863e-aec2-4c0f-b016-78afcb6f80d7', 'authenticated', 'authenticated',
  'info@boat4all.gr', '',
  NOW(), '2026-03-13T18:26:22.688Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"info@boat4all.gr","first_name":"Vasilis","last_name":"Skevis","display_name":"Vasilis Skevis"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'a191863e-aec2-4c0f-b016-78afcb6f80d7', 'a191863e-aec2-4c0f-b016-78afcb6f80d7',
  '{"sub":"a191863e-aec2-4c0f-b016-78afcb6f80d7","email":"info@boat4all.gr"}'::jsonb,
  'email', 'a191863e-aec2-4c0f-b016-78afcb6f80d7', NOW(), '2026-03-13T18:26:22.688Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'a191863e-aec2-4c0f-b016-78afcb6f80d7', 'info@boat4all.gr', 'Vasilis Skevis', 'Vasilis', 'Skevis',
  NULL, 'admin', '2026-03-13T18:26:22.688Z', '2026-03-22T16:35:13.325Z', 'dz4TFLlq3Fb3LbsLYorog7WwT4A3'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '19b04108-0a17-489d-842a-46cc4cc4e410', 'authenticated', 'authenticated',
  'mkifokeris@itdev.gr', '',
  NOW(), '2026-03-21T20:45:08.232Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"mkifokeris@itdev.gr","first_name":"","last_name":"","display_name":""}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '19b04108-0a17-489d-842a-46cc4cc4e410', '19b04108-0a17-489d-842a-46cc4cc4e410',
  '{"sub":"19b04108-0a17-489d-842a-46cc4cc4e410","email":"mkifokeris@itdev.gr"}'::jsonb,
  'email', '19b04108-0a17-489d-842a-46cc4cc4e410', NOW(), '2026-03-21T20:45:08.232Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '19b04108-0a17-489d-842a-46cc4cc4e410', 'mkifokeris@itdev.gr', '', '', '',
  NULL, 'user', '2026-03-21T20:45:08.232Z', NULL, 'eqm6RM54DzVkQd1FFLW2tw2zljg1'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f1783246-4610-41b5-a2bf-027dd5696c9a', 'authenticated', 'authenticated',
  'mysticbluegr@gmail.com', '',
  NOW(), '2026-03-21T15:40:36.347Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"mysticbluegr@gmail.com","first_name":"Lazaros","last_name":"Psaltopoulos","display_name":"Lazaros Psaltopoulos"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'f1783246-4610-41b5-a2bf-027dd5696c9a', 'f1783246-4610-41b5-a2bf-027dd5696c9a',
  '{"sub":"f1783246-4610-41b5-a2bf-027dd5696c9a","email":"mysticbluegr@gmail.com"}'::jsonb,
  'email', 'f1783246-4610-41b5-a2bf-027dd5696c9a', NOW(), '2026-03-21T15:40:36.347Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'f1783246-4610-41b5-a2bf-027dd5696c9a', 'mysticbluegr@gmail.com', 'Lazaros Psaltopoulos', 'Lazaros', 'Psaltopoulos',
  NULL, 'owner', '2026-03-21T15:40:36.347Z', '2026-03-22T08:21:25.692Z', 'iSmzMKMWYQZckXnZDwYNniwie9P2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'cb50a2ca-1326-48b7-ab11-93de0a214b1a', 'authenticated', 'authenticated',
  'tsiamisc@gmail.com', '',
  NOW(), '2026-03-15T08:24:50.745Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"tsiamisc@gmail.com","first_name":"Kostas ","last_name":"Tsiamis","display_name":"Kostas  Tsiamis"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'cb50a2ca-1326-48b7-ab11-93de0a214b1a', 'cb50a2ca-1326-48b7-ab11-93de0a214b1a',
  '{"sub":"cb50a2ca-1326-48b7-ab11-93de0a214b1a","email":"tsiamisc@gmail.com"}'::jsonb,
  'email', 'cb50a2ca-1326-48b7-ab11-93de0a214b1a', NOW(), '2026-03-15T08:24:50.745Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'cb50a2ca-1326-48b7-ab11-93de0a214b1a', 'tsiamisc@gmail.com', 'Kostas  Tsiamis', 'Kostas ', 'Tsiamis',
  NULL, 'user', '2026-03-15T08:24:50.745Z', '2026-03-15T08:24:50.745Z', 'lUOvXqFwlgPE6ROiuZwrd19L87H3'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '142b8c74-a420-4c15-bdce-971efb2d61d3', 'authenticated', 'authenticated',
  'nikoschalkidis@hotmail.com', '',
  NOW(), '2026-03-11T12:44:53.493Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"nikoschalkidis@hotmail.com","first_name":"","last_name":"","display_name":"Nick Chalki"}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '142b8c74-a420-4c15-bdce-971efb2d61d3', '142b8c74-a420-4c15-bdce-971efb2d61d3',
  '{"sub":"142b8c74-a420-4c15-bdce-971efb2d61d3","email":"nikoschalkidis@hotmail.com"}'::jsonb,
  'email', '142b8c74-a420-4c15-bdce-971efb2d61d3', NOW(), '2026-03-11T12:44:53.493Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '142b8c74-a420-4c15-bdce-971efb2d61d3', 'nikoschalkidis@hotmail.com', 'Nick Chalki', '', '',
  NULL, 'user', '2026-03-11T12:44:53.493Z', NULL, 'qdo9iRjRjVNcFRVZbbU7OIdZJdj2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd2a8f1d4-827e-4481-911c-a4674f764be7', 'authenticated', 'authenticated',
  'info@petalioitrips.gr', '',
  NOW(), '2026-03-16T07:41:53.447Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"info@petalioitrips.gr","first_name":"Petalioi ","last_name":"Trips ","display_name":"Petalioi  Trips "}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'd2a8f1d4-827e-4481-911c-a4674f764be7', 'd2a8f1d4-827e-4481-911c-a4674f764be7',
  '{"sub":"d2a8f1d4-827e-4481-911c-a4674f764be7","email":"info@petalioitrips.gr"}'::jsonb,
  'email', 'd2a8f1d4-827e-4481-911c-a4674f764be7', NOW(), '2026-03-16T07:41:53.447Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'd2a8f1d4-827e-4481-911c-a4674f764be7', 'info@petalioitrips.gr', 'Petalioi  Trips ', 'Petalioi ', 'Trips ',
  NULL, 'user', '2026-03-16T07:41:53.447Z', '2026-03-16T07:41:53.447Z', 'wCvd1AhDYHcb8E5YjvXP1NR2E4f1'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '065dabf4-ea81-42e4-9a44-423b427d8f9d', 'authenticated', 'authenticated',
  'aleksandros.mazis@hotmail.gr', '',
  NOW(), '2026-03-15T18:21:55.031Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"aleksandros.mazis@hotmail.gr","first_name":"Alexander ","last_name":"Mazis ","display_name":"Alexander  Mazis "}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  '065dabf4-ea81-42e4-9a44-423b427d8f9d', '065dabf4-ea81-42e4-9a44-423b427d8f9d',
  '{"sub":"065dabf4-ea81-42e4-9a44-423b427d8f9d","email":"aleksandros.mazis@hotmail.gr"}'::jsonb,
  'email', '065dabf4-ea81-42e4-9a44-423b427d8f9d', NOW(), '2026-03-15T18:21:55.031Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  '065dabf4-ea81-42e4-9a44-423b427d8f9d', 'aleksandros.mazis@hotmail.gr', 'Alexander  Mazis ', 'Alexander ', 'Mazis ',
  NULL, 'user', '2026-03-15T18:21:55.031Z', '2026-03-15T18:21:55.031Z', 'woiZCPVV9DbUfdg6rEOr58sAtEg2'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd581b790-56f8-4352-84df-49dda108ad22', 'authenticated', 'authenticated',
  'test-debug-12345@test.com', '',
  NOW(), '2026-03-21T20:47:22.541Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"email":"test-debug-12345@test.com","first_name":"","last_name":"","display_name":""}'::jsonb,
  false, ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  'd581b790-56f8-4352-84df-49dda108ad22', 'd581b790-56f8-4352-84df-49dda108ad22',
  '{"sub":"d581b790-56f8-4352-84df-49dda108ad22","email":"test-debug-12345@test.com"}'::jsonb,
  'email', 'd581b790-56f8-4352-84df-49dda108ad22', NOW(), '2026-03-21T20:47:22.541Z', NOW()
) ON CONFLICT (provider, provider_id) DO NOTHING;

INSERT INTO public.profiles (id, email, display_name, first_name, last_name, photo_url, user_type, created_at, last_login_at, firebase_uid)
VALUES (
  'd581b790-56f8-4352-84df-49dda108ad22', 'test-debug-12345@test.com', '', '', '',
  NULL, 'user', '2026-03-21T20:47:22.541Z', NULL, 'xSl53hTREKX4qFAZuBjBygXej092'
) ON CONFLICT (id) DO NOTHING;

-- ═══ BOATS ═══

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  'b118ac3c-5c9d-4b70-b097-e3b1a2ad402c', '9c96feb1-88a9-4234-ab79-fcda5e9837dd',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-15T20:22:29.963Z',
  '2026-03-15T20:22:29.963Z',
  '0jdTdWkUtamdt4SGbA8x'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  'e4a76bd2-7555-42ae-9275-c4e9b9f942ab', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'published',
  'rib',
  'Fost ',
  'Athens ',
  'Glyfafa ',
  'yes',
  'Aeolus',
  'Fost Big',
  NULL,
  NULL,
  7,
  3,
  3,
  'outboard',
  200,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F1buK35itYfP4wDWJuVjb%2F1773668112586-4-1024x558-1.jpg?alt=media&token=2e0fab25-5cee-4242-820e-585edeafeaff","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F1buK35itYfP4wDWJuVjb%2F1773668113415-8-scaled-1.jpg?alt=media&token=dfca9120-f0a6-41dc-a8a4-78bac6d48da0"}',
  '{}',
  'Fost Rib',
  'Fost Rib is a robust and versatile Rigid Inflatable Boat (RIB), designed for both leisure and professional use. It offers excellent stability, speed, and durability, making it ideal for coastal cruising, diving trips, and water sports.

1.High Stability and Safety
Fost Rib’s inflatable tubes provide outstanding stability on the water, making it safe even in choppy conditions.

2.Powerful Engine Options
Equipped with strong outboard engines that deliver fast acceleration and reliable performance.

3.Spacious Deck Layout
The boat offers ample deck space for passengers and gear, perfect for day trips or excursions.

4.Durable and Lightweight Construction
Made from high-quality materials that ensure durability while keeping the boat light and easy to maneuver.

5.Versatile Usage
Suitable for fishing, diving, family outings, or as a tender for larger yachts.',
  'Πρώην Ριμπ',
  'Το Fost Rib είναι ένα στιβαρό και ευέλικτο φουσκωτό σκάφος (RIB), σχεδιασμένο τόσο για αναψυχή όσο και για επαγγελματική χρήση. Προσφέρει εξαιρετική σταθερότητα, ταχύτητα και ανθεκτικότητα, καθιστώντας το ιδανικό για παράκτιες κρουαζιέρες, καταδύσεις και θαλάσσια σπορ.

1. Υψηλή σταθερότητα και ασφάλεια
Οι φουσκωτοί σωλήνες του Fost Rib παρέχουν εξαιρετική σταθερότητα στο νερό, καθιστώντας το ασφαλές ακόμα και σε συνθήκες με τρικυμίες.

2. Ισχυρές επιλογές κινητήρα
Εξοπλισμένο με ισχυρούς εξωλέμβιους κινητήρες που προσφέρουν γρήγορη επιτάχυνση και αξιόπιστη απόδοση.

3. Ευρύχωρη διάταξη καταστρώματος
Το σκάφος προσφέρει άφθονο χώρο καταστρώματος για επιβάτες και εξοπλισμό, ιδανικό για ημερήσιες εκδρομές ή εκδρομές.

4. Ανθεκτική και ελαφριά κατασκευή
Κατασκευασμένο από υλικά υψηλής ποιότητας που εξασφαλίζουν ανθεκτικότητα, διατηρώντας παράλληλα το σκάφος ελαφρύ και εύκολο στους ελιγμούς.

5. Ευέλικτη χρήση
Κατάλληλο για ψάρεμα, καταδύσεις, οικογενειακές εκδρομές ή ως tender για μεγαλύτερα γιοτ.',
  '{"en","el","fr"}',
  400,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general","description","photos","price","other"}',
  'Fost Rib',
  'rib',
  '{"city":"Athens ","country":"Greece"}',
  400,
  0, 0,
  false,
  false, NULL,
  '2026-03-16T13:33:42.382Z',
  '2026-03-16T19:05:53.975Z',
  '1buK35itYfP4wDWJuVjb'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '4c5ec8a7-3ab9-4910-89cc-55debbaa85c1', '514c95ff-0484-4365-acba-ece1a0f33853',
  'published',
  'motorboat',
  'test',
  'test',
  'test',
  'yes',
  'test',
  'test',
  NULL,
  NULL,
  10,
  10,
  10,
  'electric',
  10,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015455295-afbaa160-73a2-4d89-b334-db491d6650d8.jpeg?alt=media&token=7721db05-471f-470b-841f-95760ce5ccfd","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015456169-att.-I8CzQ-RHlyy62QGjyey4L160oR8_Z1Z9GZxE-oqxEc.jpeg?alt=media&token=83f4974b-cb7f-4412-94e4-eb60c68e0be4","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015456981-att.HYMu_k8QfwehOvDD2Xad3abnmrqV5IP4l8Ytu3BCoDU.jpeg?alt=media&token=e7affb0e-5c51-497d-82b8-5986e5cbe96a","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015457854-boat2_iamge2.jpeg?alt=media&token=041d08be-8d7b-4fc0-937b-05e9f4c47968","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015458838-boat2_image1.jpeg?alt=media&token=1ba2ca7f-17f3-437f-969f-9f73413e592f","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015478152-afbaa160-73a2-4d89-b334-db491d6650d8.jpeg?alt=media&token=17b16af0-c0e1-4089-b37a-b0ca357648fa","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015478824-att.-I8CzQ-RHlyy62QGjyey4L160oR8_Z1Z9GZxE-oqxEc.jpeg?alt=media&token=1bf0d661-8b76-48a0-a780-cda12af473ce","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015479417-att.HYMu_k8QfwehOvDD2Xad3abnmrqV5IP4l8Ytu3BCoDU.jpeg?alt=media&token=4bd08ec2-f53d-48d0-a3e7-5dce816527fc","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015480119-boat2_iamge2.jpeg?alt=media&token=0f9179ec-8626-4a48-89c0-50f4c0b4495f","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2F2VDXvSCetfm3s4Q0QK2o%2F1774015481006-boat2_image1.jpeg?alt=media&token=dc514d06-284b-4d00-8af5-47a2e917043a"}',
  '{}',
  'test',
  'test',
  'δοκιμή',
  'δοκιμή',
  '{"en"}',
  100,
  'EUR',
  '[]',
  NULL,
  NULL,
  'confirmation',
  '06:00',
  '06:00',
  '06:00',
  '06:00',
  25,
  7,
  'included',
  'yes',
  100,
  NULL,
  NULL,
  'yes',
  '[]',
  '{}',
  '[]',
  '[]',
  '{"photos","general","description","price","booking","documents","calendar","equipment","extras","other","discounts"}',
  'test',
  'motorboat',
  '{"city":"test","country":"Greece"}',
  100,
  0, 0,
  false,
  false, NULL,
  '2026-03-20T14:03:49.931Z',
  '2026-03-20T14:05:32.038Z',
  '2VDXvSCetfm3s4Q0QK2o'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '9c975578-6371-49ad-9431-cefc054b3b1d', '628cd2ee-25bc-4655-84cf-e6cf05c1815a',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-19T13:20:36.565Z',
  '2026-03-19T13:20:36.565Z',
  'AANXoEhUWmoSdVFvLaHq'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '55047641-8415-4b9f-b36e-9481bfb899c3', 'a191863e-aec2-4c0f-b016-78afcb6f80d7',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-17T15:21:47.875Z',
  '2026-03-17T15:21:47.875Z',
  'D3m9wrZqri2mMNuNJvJP'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '4e8113ac-b97a-454e-8639-e35313d64dc6', 'f1783246-4610-41b5-a2bf-027dd5696c9a',
  'published',
  'catamaran',
  'Mystic Blue ',
  'Poros',
  'Galatas',
  'yes',
  'Nautitech',
  '2017',
  NULL,
  12,
  12.1,
  7,
  1.35,
  'inboard',
  114,
  8.5,
  6,
  6,
  6,
  2,
  2017,
  'yes',
  2,
  4,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168656748-5%20Nautitech.jpg?alt=media&token=81fb66d9-0833-480b-8b8a-5c82d9b4daef","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168658894-1%20Nautitech.jpg?alt=media&token=c486fb1c-5d69-4bbb-b5f2-cbdbedf969cb","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168660108-2%20Nautitech.jpg?alt=media&token=037690e1-84b7-439b-9ae7-05df20481125","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168661496-4%20Nautitech.jpg?alt=media&token=8b426646-3af2-4373-9bd7-56ab83dd075b","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168662532-%CE%93%CF%81%CE%B1%CE%BD%CE%B9%CF%84%CE%AD%CE%BD%CE%B9%CE%B1%20%CF%80%CE%BB%CE%AC%CE%BA%CE%B1.jpg?alt=media&token=12cb9443-8ef9-4927-beb4-024f852ef6b5","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168990145-5%20Nautitech.jpg?alt=media&token=2dbe08a5-62fb-410f-a333-855a7cd1ed49","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168991678-1%20Nautitech.jpg?alt=media&token=c3352ecf-a034-4399-90f4-bd8f60978a2a","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168992691-2%20Nautitech.jpg?alt=media&token=6ac54d4f-dd9e-414b-b219-6af2d7142ee6","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168993742-4%20Nautitech.jpg?alt=media&token=164afc6d-7643-4676-a6d4-23234a979b75","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2F1774168994882-%CE%93%CF%81%CE%B1%CE%BD%CE%B9%CF%84%CE%AD%CE%BD%CE%B9%CE%B1%20%CF%80%CE%BB%CE%AC%CE%BA%CE%B1.jpg?alt=media&token=f4314511-152d-46a8-a063-47b3ae34f310"}',
  '{}',
  'Daily trips around Poros, Angistri, Perdika Aegina, Dokos and weekly trips Saronic gulf, Eastern Pelopenese and Cyclades (ask for prices)',
  'Enjoy daily trips around Poros island, Angistri island, Perdika + Aegina, Dokos island (max 12 persons). We offer free lunch + drinks at very low prices. And weekly trips around Saronic gulf, Eastern Peloponese to Kythira and Cyclades (where ever you like) (Ask for prices. Skipper and hostess are included at the price. Departure from Galatas port (near ferry) opposite to Poros island.',
  'Ημερήσιες εκδρομές γύρω από τον Πόρο, το Αγκίστρι, την Πέρδικα, την Αίγινα, τον Δοκό και εβδομαδιαίες εκδρομές στον Σαρωνικό κόλπο, την Ανατολική Πελοπόννησο και τις Κυκλάδες (ρωτήστε για τιμές)',
  'Απολαύστε ημερήσιες εκδρομές γύρω από τον Πόρο, το Αγκίστρι, την Πέρδικα + Αίγινα, το Δοκό (μέγιστο 12 άτομα). Προσφέρουμε δωρεάν γεύμα + ποτά σε πολύ χαμηλές τιμές. Και εβδομαδιαίες εκδρομές γύρω από τον Σαρωνικό κόλπο, την Ανατολική Πελοπόννησο προς τα Κύθηρα και τις Κυκλάδες (όπου θέλετε) (Ρωτήστε για τιμές. Ο καπετάνιος και η συνοδός περιλαμβάνονται στην τιμή. Αναχώρηση από το λιμάνι του Γαλατά (κοντά στο φέρι) απέναντι από τον Πόρο.',
  '{"en","el","fr","pl"}',
  1200,
  'EUR',
  '[]',
  1,
  1,
  'confirmation',
  '10:00',
  '18:00',
  '10:00',
  '18:00',
  25,
  14,
  'included',
  'no',
  NULL,
  'https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2Fdocuments%2Finsurance-1774171260942-%CE%92%CE%95%CE%92%CE%91%CE%99%CE%A9%CE%A3%CE%97%20%CE%A3%CE%9A%CE%91%CE%A6%CE%9F%CE%A5%CE%A3%20MYSTIC%20BLUE%202.2026.pdf?alt=media&token=d21643b1-a141-4da3-add7-65793442898c',
  'https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FDhvRvnxXDzD6xFELreOr%2Fdocuments%2Fownership-1774171262562-3323%20%CE%92%CE%95%CE%92%CE%91%CE%99%CE%A9%CE%A3%CE%97%20%CE%9D%CE%95%CE%A0%CE%91.pdf?alt=media&token=e9bd1442-b5f2-4c1f-a047-53fff7f26d1b',
  'yes',
  '[]',
  '{"bimini","outdoor-shower","external-table","external-speakers","bow-sundeck","aft-sundeck","bathing-platform","bathing-ladder","hot-water","fans","electric-toilet","bed-linen","bath-towels","beach-towels","wi-fi","usb-socket","tv","dinghy","dinghy-s-motor","electric-windlass","autopilot","gps","depth-sounder","vhf","fridge","freezer","oven-stovetop","bbq-grill","coffee-machine","paddle-board","snorkelling-equipment","fishing-equipment","diving-equipment","drone","power-inverter","220v-power-outlet"}',
  '[]',
  '[{"type":"first-booking","percentage":10}]',
  '{"general","equipment","description","price","calendar"}',
  'Daily trips around Poros, Angistri, Perdika Aegina, Dokos and weekly trips Saronic gulf, Eastern Pelopenese and Cyclades (ask for prices)',
  'catamaran',
  '{"city":"Poros","country":"Greece"}',
  1200,
  0, 0,
  false,
  false, NULL,
  '2026-03-21T16:04:41.157Z',
  '2026-03-22T16:04:41.448Z',
  'DhvRvnxXDzD6xFELreOr'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  'fcecd04e-2376-4a23-8a31-68b136f3e978', '065dabf4-ea81-42e4-9a44-423b427d8f9d',
  'draft',
  'without-licence',
  'Hawk',
  'Corfu',
  'Palaiokastritsa ',
  'yes',
  'Poseidon',
  '5,10',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FJHdpR4cloRRUShSqyqHN%2F1773599857043-IMG_2169.png?alt=media&token=6447d65a-be70-440e-8816-9dd179a5bceb","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FJHdpR4cloRRUShSqyqHN%2F1773599862828-IMG_2168.png?alt=media&token=c1c0146a-964f-4868-9292-f4d542e999c2"}',
  '{}',
  'Hawk',
  'Welcome onboard   Set off on a unique adventure from the beautiful Port of Paleokastritsa and discover Corfu’s stunning coastline at your own pace. Our boats are designed to be safe and easy to operate, making them perfect for anyone—even without a boating license or previous experience.  Enjoy a relaxing day on the water as you cruise past crystal-clear bays, visit hidden beaches, and explore sea caves only accessible by boat. We provide full instructions and a safety briefing before you head out, so all you need to bring is your sense of adventure. Fuel is not included, and the boats are ideal for couples, families, or small groups looking to create unforgettable memories on the Ionian Sea.  Book your day on the water and experience the freedom of exploring one of Corfu’s most beautiful areas from a whole new perspective.',
  NULL,
  NULL,
  '{"en","el"}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general","description","photos"}',
  'Hawk',
  'without-licence',
  '{"city":"Corfu","country":"Greece"}',
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-15T18:32:00.855Z',
  '2026-03-15T18:37:50.534Z',
  'JHdpR4cloRRUShSqyqHN'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  'c4bb8e75-c769-44df-b8de-f36a7bb349b8', 'a191863e-aec2-4c0f-b016-78afcb6f80d7',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-16T07:39:17.805Z',
  '2026-03-16T07:39:17.805Z',
  'VKp0YSCzXcvH7RblGjiU'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  'd0f27227-8a97-4050-ada2-1670539af969', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-20T09:21:52.721Z',
  '2026-03-20T09:21:52.721Z',
  'XRLWs6NTbAEGo9NRLJAp'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '2f6fe87f-6198-43a7-8010-de1b4bf6ffb8', '1be5abb5-387f-46d5-a4f0-3c1929957859',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-14T11:34:04.137Z',
  '2026-03-14T11:34:04.137Z',
  'XUmjtIf4DOTctECDgKZb'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '48db3cf8-2a0f-4ab1-959b-dd6bb005b905', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'published',
  'rib',
  'BSK 34 NC ',
  'Athens ',
  'Glyfafa ',
  'yes',
  'SKIPPER-BSK ',
  '34 NC ',
  NULL,
  NULL,
  10,
  3,
  4,
  'outboard',
  600,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FZKz5eVrTuGGJKX5OEraU%2F1773668537200-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-2-2.jpeg?alt=media&token=71eb0e04-a5a0-4173-8005-e681cbfab4ad","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FZKz5eVrTuGGJKX5OEraU%2F1773668538070-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-6.jpeg?alt=media&token=9edc0635-18ca-4c34-b453-c03b49daebd1","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FZKz5eVrTuGGJKX5OEraU%2F1773668538891-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-4-1.jpeg?alt=media&token=1b0c724d-a6f2-484e-acec-07585104c3dd","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FZKz5eVrTuGGJKX5OEraU%2F1773668539545-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-3-3.jpeg?alt=media&token=f6c89733-b081-462e-b929-3c3e1d57f8ca"}',
  '{}',
  'SKIPPER-BSK 34NC ',
  'The SKIPPER-BSK 34 NC is a luxurious and spacious motorboat designed for those who want comfort and performance on longer sea voyages. It blends elegance with advanced technology. 

1.Modern Design
Sleek exterior combined with a stylish, comfortable interior.

2.Powerful Engines
Twin engines providing smooth, powerful cruising capabilities.

3.Spacious Cabin
Offers well-equipped cabins and living spaces for extended trips.

4.Advanced Navigation Systems
Equipped with modern tech for easy and safe navigation.

5.Perfect for Family or Group Trips
Comfortably accommodates several passengers with ample amenities.

',
  'SKIPPER-BSK 34NC',
  'Το SKIPPER-BSK 34 NC είναι ένα πολυτελές και ευρύχωρο μηχανοκίνητο σκάφος σχεδιασμένο για όσους επιθυμούν άνεση και απόδοση σε μεγαλύτερα θαλάσσια ταξίδια. Συνδυάζει την κομψότητα με την προηγμένη τεχνολογία.

1. Μοντέρνος Σχεδιασμός
Κομψό εξωτερικό σε συνδυασμό με ένα κομψό, άνετο εσωτερικό.

2. Ισχυροί Κινητήρες
Δύο κινητήρες που παρέχουν ομαλές, ισχυρές δυνατότητες πλεύσης.

3. Ευρύχωρη Καμπίνα
Προσφέρει άρτια εξοπλισμένες καμπίνες και χώρους διαβίωσης για μεγάλα ταξίδια.

4. Προηγμένα Συστήματα Πλοήγησης
Εξοπλισμένο με σύγχρονη τεχνολογία για εύκολη και ασφαλή πλοήγηση.

5. Ιδανικό για Οικογενειακά ή Ομαδικά Ταξίδια
Χωράει άνετα αρκετούς επιβάτες με άφθονες ανέσεις.

',
  '{"en","el","fr"}',
  1300,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general","description","photos","price","other"}',
  'SKIPPER-BSK 34NC ',
  'rib',
  '{"city":"Athens ","country":"Greece"}',
  1300,
  0, 0,
  false,
  false, NULL,
  '2026-03-16T13:41:20.743Z',
  '2026-03-17T13:56:56.053Z',
  'ZKz5eVrTuGGJKX5OEraU'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  'bab585b9-edc0-4700-b4fb-d88f5e2f82c9', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'published',
  'rib',
  'Lobster 7',
  'Athens ',
  'Glyfafa ',
  'yes',
  'Lobster ',
  '7',
  NULL,
  NULL,
  7,
  3,
  3,
  'outboard',
  200,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FdphqrJtZXcI9MuuTdyeY%2F1773667971669-25b35aa6-4436-495e-a768-585589c31361.jpg?alt=media&token=bc0677af-3517-4eef-8093-cfd228f7bbd7","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FdphqrJtZXcI9MuuTdyeY%2F1773667972471-b42bbf2b-5e43-41dc-b144-e0ef66e0e64e.jpg?alt=media&token=6c98631a-54b9-459a-a596-4596f2e10376"}',
  '{}',
  'Lobster 7 ',
  'Lobster 7 is a compact yet powerful boat designed for quick and agile performance on the water. Perfect for day trips and short coastal adventures, it combines a sturdy build with easy handling, making it ideal for both beginners and experienced sailors.

Key Features & Highlights
1.Compact and Agile Design
Lobster 7’s small size allows it to navigate tight spaces and shallow waters with ease, perfect for exploring hidden coves and bays.

2.Fuel-Efficient Engine
Equipped with a reliable engine that balances power and fuel efficiency, making it economical for longer outings.

3.Comfortable Seating for 6 People
Despite its compact size, Lobster 7 offers comfortable seating and space for up to six passengers, ensuring a cozy and enjoyable ride.

4.Easy Maneuverability
Designed with user-friendly controls, this boat offers smooth and responsive handling, ideal for quick turns and precise navigation.

5.Durable Construction
Built with high-quality materials to withstand various sea conditions, ensuring safety and longevity.',
  'Αστακός 7',
  'Το Lobster 7 είναι ένα συμπαγές αλλά ισχυρό σκάφος σχεδιασμένο για γρήγορη και ευέλικτη απόδοση στο νερό. Ιδανικό για ημερήσιες εκδρομές και σύντομες παράκτιες περιπέτειες, συνδυάζει μια στιβαρή κατασκευή με εύκολο χειρισμό, καθιστώντας το ιδανικό τόσο για αρχάριους όσο και για έμπειρους ιστιοπλόους.

Βασικά Χαρακτηριστικά & Κύρια Σημεία
1. Συμπαγής και Ευέλικτος Σχεδιασμός
Το μικρό μέγεθος του Lobster 7 του επιτρέπει να πλοηγείται σε στενούς χώρους και ρηχά νερά με ευκολία, ιδανικό για εξερεύνηση κρυφών όρμων και κόλπων.

2. Κινητήρας με οικονομία καυσίμου
Εξοπλισμένο με έναν αξιόπιστο κινητήρα που εξισορροπεί την ισχύ και την οικονομία καυσίμου, καθιστώντας το οικονομικό για μεγαλύτερες εκδρομές.

3. Άνετα καθίσματα για 6 άτομα
Παρά το συμπαγές του μέγεθος, το Lobster 7 προσφέρει άνετα καθίσματα και χώρο για έως και έξι επιβάτες, εξασφαλίζοντας μια άνετη και ευχάριστη βόλτα.

4. Εύκολη ευελιξία
Σχεδιασμένο με φιλικά προς το χρήστη χειριστήρια, αυτό το σκάφος προσφέρει ομαλό και γρήγορο χειρισμό, ιδανικό για γρήγορες στροφές και ακριβή πλοήγηση.

5. Ανθεκτική κατασκευή
Κατασκευασμένο με υλικά υψηλής ποιότητας για να αντέχει σε διάφορες θαλάσσιες συνθήκες, εξασφαλίζοντας ασφάλεια και μακροζωία.',
  '{"en","el","fr"}',
  450,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general","description","photos","price","other"}',
  'Lobster 7 ',
  'rib',
  '{"city":"Athens ","country":"Greece"}',
  450,
  0, 0,
  false,
  false, NULL,
  '2026-03-16T13:31:45.268Z',
  '2026-03-16T19:05:54.470Z',
  'dphqrJtZXcI9MuuTdyeY'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '165fbe3d-a751-420e-932f-08da8afc0b04', '1be5abb5-387f-46d5-a4f0-3c1929957859',
  'draft',
  'rib',
  'Blondy ',
  'Αθηνα',
  'Λαυριο',
  'yes',
  'Seafighter rib',
  'Seafighter rib36 cabin',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general"}',
  'Blondy ',
  'rib',
  '{"city":"Αθηνα","country":"Greece"}',
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-14T11:34:47.036Z',
  '2026-03-14T12:08:56.216Z',
  'emuRkG6CZDQN3EDL2Llx'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '2e3b0ea5-18e1-4c89-a3e8-c73250f9a611', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-21T17:20:01.323Z',
  '2026-03-21T17:20:01.323Z',
  'fGhswnaDu1lZBtZ23M9r'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '0a7c0a8f-4af7-4c86-a58d-a23febd2a1a8', 'b8a2e5b7-6e7a-453c-ab3d-813362e1ad80',
  'published',
  'rib',
  'BLACKSWAN',
  NULL,
  'VLYCHADA ',
  'yes',
  'FOST',
  'STERNDRIVE 31ft',
  NULL,
  6,
  10,
  2.8,
  1,
  'inboard',
  450,
  60,
  NULL,
  NULL,
  NULL,
  NULL,
  2022,
  'yes',
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FgsH1yWzJl42ZZvOXKGgg%2F1773764106919-image00004.jpeg?alt=media&token=978deaca-5e66-4bcc-a968-9d16946f4961","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FgsH1yWzJl42ZZvOXKGgg%2F1773764108384-image00005.png?alt=media&token=f5c5a34c-69c6-4fb7-aeeb-e1c0a6b5ccb5","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FgsH1yWzJl42ZZvOXKGgg%2F1773764110566-image00010.png?alt=media&token=cb91f254-db02-4a83-80f7-297db09f5a1f","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FgsH1yWzJl42ZZvOXKGgg%2F1773764112215-image00002.png?alt=media&token=09c25c64-4940-4007-9315-25cf0d698c6f","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FgsH1yWzJl42ZZvOXKGgg%2F1773764114647-image00001.jpeg?alt=media&token=6a3d38ed-f942-4a92-96ad-d8b44feb25da"}',
  '{}',
  'Santorini Private Cruises',
  'Santorini is considered one of the top destinations and we are here to help you live the Greek experience.
Sail around the island and dive into the beautiful waters of the Aegean sea. Our crew members along with our co-captain Dior, the most adorable mini Maltese dog, will guide you along the way and show you the secret spots of the island. 

Setting sail from Vlychada port, you can choose among the following private cruises: 

3 hours or half-day 10-15:00 / 15:30-sunset: you get to see the Red and White beach, Mesa pigadia, Lighthouse, the famous Volcano hot springs. 
Full day 10:30- sunset: you get to see the Red and White beach, Mesa pigadia, Lighthouse, the famous Volcano hot springs, Ammoudi and Thirassia island, where you can have dinner in a traditional tavern. 

The price includes fuels&taxes, fruits, soft drinks, snacks, healthy sandwiches, beers, local wine, snorkeling gear and beach towels. All the comfort onboard is provided and all we need you to have is your good mood!!!

We also offer island hopping around Cyclades and VIP Transfer upon request.',
  'Ιδιωτικές Κρουαζιέρες στη Σαντορίνη',
  'Η Σαντορίνη θεωρείται ένας από τους κορυφαίους προορισμούς και είμαστε εδώ για να σας βοηθήσουμε να ζήσετε την ελληνική εμπειρία.
Πλοηγηθείτε στο νησί και βουτήξτε στα όμορφα νερά του Αιγαίου. Τα μέλη του πληρώματός μας μαζί με τον συγκυβερνήτη μας Dior, το πιο αξιολάτρευτο μίνι σκυλί Μαλτέζ, θα σας καθοδηγήσουν στην πορεία και θα σας δείξουν τα μυστικά σημεία του νησιού.

Ξεκινώντας από το λιμάνι της Βλυχάδας, μπορείτε να επιλέξετε ανάμεσα στις ακόλουθες ιδιωτικές κρουαζιέρες:

3 ώρες ή μισή ημέρα 10-15:00 / 15:30-δύση ηλίου: θα δείτε την Κόκκινη και Λευκή παραλία, τα Μέσα Πηγάδια, τον Φάρο, τις διάσημες ιαματικές πηγές του Ηφαιστείου.

Ολοήμερη 10:30-δύση ηλίου: θα δείτε την Κόκκινη και Λευκή παραλία, τα Μέσα Πηγάδια, τον Φάρο, τις διάσημες ιαματικές πηγές του Ηφαιστείου, το Αμμούδι και το νησί Θηρασιά, όπου μπορείτε να δειπνήσετε σε μια παραδοσιακή ταβέρνα.

Η τιμή περιλαμβάνει καύσιμα και φόρους, φρούτα, αναψυκτικά, σνακ, υγιεινά σάντουιτς, μπύρες, τοπικό κρασί, εξοπλισμό για κολύμβηση με αναπνευστήρα και πετσέτες θαλάσσης. Παρέχεται όλη η άνεση στο πλοίο και το μόνο που χρειαζόμαστε είναι η καλή σας διάθεση!!!

Προσφέρουμε επίσης δρομολόγια νησιών στις Κυκλάδες και VIP μεταφορά κατόπιν αιτήματος.',
  '{"en","el"}',
  1800,
  'EUR',
  '[]',
  NULL,
  NULL,
  'confirmation',
  '10:00',
  '20:00',
  '10:00',
  '20:00',
  25,
  7,
  'included',
  'no',
  NULL,
  'https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FgsH1yWzJl42ZZvOXKGgg%2Fdocuments%2Finsurance-1773765885756-INTERLIFE_Boat_CN_%20(1).pdf?alt=media&token=6b0808f7-2cb8-4709-b25a-c2dcdbdaf3bd',
  'https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FgsH1yWzJl42ZZvOXKGgg%2Fdocuments%2Fownership-1773765886766-image0.png?alt=media&token=5f797427-62c9-4f4d-8c83-c37fffa8d150',
  'yes',
  '[]',
  '{"bimini","outdoor-shower","external-speakers","teak-deck","bow-sundeck","aft-sundeck","bathing-platform","bathing-ladder","bath-towels","beach-towels","wi-fi","usb-socket","autopilot","gps","vhf","fridge","ice-box","snorkelling-equipment"}',
  '[{"name":"One-way transportation from/to your hotel/villa","pricePerDay":45,"mandatory":false},{"name":"Two-way transportation from/to your hotel/villa","pricePerDay":90,"mandatory":false},{"name":"Moet Champagne","pricePerDay":150,"mandatory":false},{"name":"Moet Champagne Ice/Rose","pricePerDay":200,"mandatory":false},{"name":"Cuban Cigar","pricePerDay":50,"mandatory":false}]',
  '[]',
  '{"general","description","photos","booking","equipment","extras","other","documents","discounts","calendar","price"}',
  'Santorini Private Cruises',
  'rib',
  NULL,
  1800,
  0, 0,
  false,
  false, NULL,
  '2026-03-17T16:08:19.220Z',
  '2026-03-18T08:08:35.726Z',
  'gsH1yWzJl42ZZvOXKGgg'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '09d1c775-9e04-426c-a178-3d7430e55774', '065dabf4-ea81-42e4-9a44-423b427d8f9d',
  'draft',
  'rib',
  'PRESIDENTE ',
  'Corfu',
  'Alipa port ',
  'yes',
  'Orizon ',
  '7,10',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general"}',
  'PRESIDENTE ',
  'rib',
  '{"city":"Corfu","country":"Greece"}',
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-15T18:23:29.271Z',
  '2026-03-15T18:24:27.128Z',
  'm3aQWRl2SOFC0ykg0Gk7'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '00006aa3-31dd-46ed-965b-1e36af37bd9b', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'published',
  'rib',
  'KOUALE',
  'Athens ',
  'Glyfafa ',
  'yes',
  'RainDrop ',
  '28 Revolution',
  NULL,
  NULL,
  8.5,
  3,
  3,
  'outboard',
  300,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2Fn9Xji1TCa35DYseIU9eA%2F1773668260743-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-5-3.jpeg?alt=media&token=ea5cbaf0-4a98-4552-84a3-3cc99ae14c0d","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2Fn9Xji1TCa35DYseIU9eA%2F1773668261604-IMG_2504-scaled-1.jpeg?alt=media&token=1b0bc435-25a8-49d2-98c0-5be912d2a2db","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2Fn9Xji1TCa35DYseIU9eA%2F1773668262402-IMG_2502-scaled-1.jpeg?alt=media&token=4348d018-bdab-4951-b052-fd30c3de1491"}',
  '{}',
  'RainDrop 28 -  speed and agility',
  'RainDrop 28 Revolution is a sleek and sporty RIB (Rigid Inflatable Boat) designed for speed and agility. It offers a perfect balance of performance and comfort, ideal for adventurous sea trips or water sports.

1.Innovative Hull Design
The deep-V hull provides excellent stability and smooth navigation even in choppy waters.

2.High-Powered Engine
Equipped with a powerful outboard motor for quick acceleration and reliable cruising.

3.Spacious Seating
Comfortable seats arranged to maximize passenger space and ensure enjoyable rides.

4.Durable Build
Constructed using high-quality materials that withstand harsh marine environments.

5.Versatile Usage
Perfect for day cruising, fishing, and coastal exploration.',
  'RainDrop 28 - ταχύτητα και ευκινησία',
  'Το RainDrop 28 Revolution είναι ένα κομψό και σπορ RIB (Rigid Inflatable Boat) σχεδιασμένο για ταχύτητα και ευκινησία. Προσφέρει τέλεια ισορροπία απόδοσης και άνεσης, ιδανικό για περιπετειώδεις θαλάσσιες εκδρομές ή θαλάσσια σπορ.

1. Καινοτόμος Σχεδιασμός Γάστρας
Η γάστρα βαθύ V παρέχει εξαιρετική σταθερότητα και ομαλή πλοήγηση ακόμα και σε ταραγμένα νερά.

2. Κινητήρας Υψηλής Ισχύος
Εξοπλισμένο με ισχυρό εξωλέμβιο κινητήρα για γρήγορη επιτάχυνση και αξιόπιστη πλεύση.

3. Ευρύχωρα Καθίσματα
Άνετα καθίσματα διατεταγμένα για μεγιστοποίηση του χώρου των επιβατών και εξασφάλιση απολαυστικών βόλτων.

4. Ανθεκτική Κατασκευή
Κατασκευασμένο με υλικά υψηλής ποιότητας που αντέχουν σε σκληρά θαλάσσια περιβάλλοντα.

5. Ευέλικτη Χρήση
Ιδανικό για ημερήσιες πλεύσεις, ψάρεμα και παράκτια εξερεύνηση.',
  '{"en","el","fr"}',
  550,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general","description","photos","price","other"}',
  'RainDrop 28 -  speed and agility',
  'rib',
  '{"city":"Athens ","country":"Greece"}',
  550,
  0, 0,
  false,
  false, NULL,
  '2026-03-16T13:36:47.073Z',
  '2026-03-16T19:05:53.473Z',
  'n9Xji1TCa35DYseIU9eA'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '8a728793-880e-465f-ba89-604c318c8b23', '628cd2ee-25bc-4655-84cf-e6cf05c1815a',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-19T13:12:43.338Z',
  '2026-03-19T13:12:43.338Z',
  'qCGlfpOclcf6th8UMuZl'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '8b371a32-2417-4933-8034-8d0be5415f73', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'published',
  'rib',
  'KLE',
  'Athens ',
  'Glyfafa ',
  'yes',
  'Dream',
  '28 RIB ',
  NULL,
  NULL,
  9,
  3,
  3,
  'outboard',
  300,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  'yes',
  NULL,
  NULL,
  '{"https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FreqWWclPo3B7LcBRbt7C%2F1773668398942-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-4-2.jpeg?alt=media&token=889828aa-84c3-4be3-98fd-41497dde7afc","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FreqWWclPo3B7LcBRbt7C%2F1773668399720-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-1-4.jpeg?alt=media&token=4755b664-cfa1-43b9-9d52-980f097cf30c","https://firebasestorage.googleapis.com/v0/b/clickyourboat-e7623.firebasestorage.app/o/boats%2FreqWWclPo3B7LcBRbt7C%2F1773668400361-%CE%B5%CE%B9%CE%BA%CE%BF%CC%81%CE%BD%CE%B1-3-4.jpeg?alt=media&token=369eac62-a637-404e-b47f-0962572568ed"}',
  '{}',
  'Dream28 RIB ',
  'Dream28 RIB combines innovative design with powerful performance to offer a smooth and exciting boating experience. It’s a versatile vessel suitable for families and adventure seekers alike.

1.Hydrodynamic Hull
Designed for optimal speed and fuel efficiency while maintaining comfort.

2.Robust Engine Power
Equipped with a reliable outboard engine for strong performance on the water.

3.Comfortable Layout
Ample seating and open deck design allow easy movement and relaxation.

4.Safety Features
Enhanced stability and safety rails for worry-free boating.

5.Multi-purpose Boat
Great for fishing, cruising, and watersports.',
  'Dream28 RIB',
  'Το Dream28 RIB συνδυάζει τον καινοτόμο σχεδιασμό με την ισχυρή απόδοση για να προσφέρει μια ομαλή και συναρπαστική εμπειρία πλοήγησης. Είναι ένα ευέλικτο σκάφος κατάλληλο τόσο για οικογένειες όσο και για λάτρεις της περιπέτειας.

1. Υδροδυναμική γάστρα
Σχεδιασμένο για βέλτιστη ταχύτητα και οικονομία καυσίμου, διατηρώντας παράλληλα την άνεση.

2. Ανθεκτική ισχύς κινητήρα
Εξοπλισμένο με αξιόπιστο εξωλέμβιο κινητήρα για ισχυρή απόδοση στο νερό.

3. Άνετη διάταξη
Τα άφθονα καθίσματα και ο σχεδιασμός ανοιχτού καταστρώματος επιτρέπουν την εύκολη μετακίνηση και χαλάρωση.

4. Χαρακτηριστικά ασφαλείας
Βελτιωμένη σταθερότητα και ράγες ασφαλείας για ξέγνοιαστη πλοήγηση.

5. Σκάφος πολλαπλών χρήσεων
Εξαιρετικό για ψάρεμα, κρουαζιέρες και θαλάσσια σπορ.',
  '{"en","el","fr"}',
  750,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general","description","photos","price","other"}',
  'Dream28 RIB ',
  'rib',
  '{"city":"Athens ","country":"Greece"}',
  750,
  0, 0,
  false,
  false, NULL,
  '2026-03-16T13:39:14.316Z',
  '2026-03-16T19:05:52.866Z',
  'reqWWclPo3B7LcBRbt7C'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '4229f8d6-81f2-4ff9-98f0-57ecf7e866f8', 'd2a8f1d4-827e-4481-911c-a4674f764be7',
  'draft',
  'motorboat',
  'Αγια Κυριακή Ν.Κ.40 ',
  'Μαρμάρι Εύβοιας ',
  'Μαρμάρι ',
  'yes',
  'Μπαρμπερακης',
  'Τρεχαντιρι ',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{"general"}',
  'Αγια Κυριακή Ν.Κ.40 ',
  'motorboat',
  '{"city":"Μαρμάρι Εύβοιας ","country":"Greece"}',
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-16T07:42:07.261Z',
  '2026-03-16T07:45:22.292Z',
  'rtad1BzRjYOt4MgPYYwO'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.boats (
  id, owner_id, status, boat_type, boat_name, city, harbour, professional,
  manufacturer, model, skipper, capacity, length, width, draft,
  engine_type, horsepower, speed, fuel, cabins, berths, bathrooms,
  year_of_construction, renovated, crew_members, tender_horsepower, equipped_offshore,
  company, website, images, boat_plan_images,
  listing_title, description, listing_title_el, description_el, languages,
  price_per_day, currency, price_periods, reservation_min_days, reservation_max_days,
  booking_mode, check_in_time, check_out_time, check_in_time_day_rental, check_out_time_day_rental,
  downpayment_percentage, days_before_balance_payment, fuel_cost, licence_required,
  security_deposit, insurance_certificate_url, ownership_certificate_url, yacht_insured,
  unavailability_periods, equipment, extras, discounts, completed_sections,
  title, type, location, price, rating, review_count, skipper_available,
  _translating, _translation_error,
  created_at, updated_at, firebase_id
) VALUES (
  '3c118a36-459a-4a62-a4e7-385edeff832a', 'a1bf34fb-9951-49c1-a228-967a5fe8d897',
  'draft',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  '{}',
  NULL,
  'EUR',
  '[]',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '[]',
  '{}',
  '[]',
  '[]',
  '{}',
  NULL,
  NULL,
  NULL,
  NULL,
  0, 0,
  false,
  false, NULL,
  '2026-03-17T22:08:21.916Z',
  '2026-03-17T22:08:21.916Z',
  'soxS9qvUuQKC1pF4qBvu'
) ON CONFLICT (id) DO NOTHING;

-- ═══ ORDERS ═══

-- ═══ CONVERSATIONS ═══

INSERT INTO public.conversations (id, participants, participant_details, last_message, boat_id, boat_title, unread_count, created_at, updated_at, firebase_id)
VALUES (
  '75dacf90-3f18-4785-a6ca-da87ea39f7c0',
  '{628cd2ee-25bc-4655-84cf-e6cf05c1815a,a1bf34fb-9951-49c1-a228-967a5fe8d897}',
  '{"628cd2ee-25bc-4655-84cf-e6cf05c1815a":{"displayName":"Dim Minog","photoURL":""},"a1bf34fb-9951-49c1-a228-967a5fe8d897":{"displayName":"George Assos","photoURL":""}}',
  NULL,
  '48db3cf8-2a0f-4ab1-959b-dd6bb005b905',
  'SKIPPER-BSK 34NC ',
  '{"628cd2ee-25bc-4655-84cf-e6cf05c1815a":0,"a1bf34fb-9951-49c1-a228-967a5fe8d897":0}',
  '2026-03-19T13:13:56.983Z',
  '2026-03-19T13:13:56.983Z',
  '1OUsFeIpdHIMNotFV1cA'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.conversations (id, participants, participant_details, last_message, boat_id, boat_title, unread_count, created_at, updated_at, firebase_id)
VALUES (
  'c5138ac4-bd89-4ab5-b857-4a92eebc1c41',
  '{19b04108-0a17-489d-842a-46cc4cc4e410,514c95ff-0484-4365-acba-ece1a0f33853}',
  '{"19b04108-0a17-489d-842a-46cc4cc4e410":{"displayName":"mkifokeris@itdev.gr","photoURL":""},"514c95ff-0484-4365-acba-ece1a0f33853":{"displayName":"User","photoURL":""}}',
  NULL,
  '4c5ec8a7-3ab9-4910-89cc-55debbaa85c1',
  'test',
  '{"19b04108-0a17-489d-842a-46cc4cc4e410":0,"514c95ff-0484-4365-acba-ece1a0f33853":0}',
  '2026-03-22T00:17:18.701Z',
  '2026-03-22T00:17:18.701Z',
  'As3tskvcSFR9qj5u8imO'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.conversations (id, participants, participant_details, last_message, boat_id, boat_title, unread_count, created_at, updated_at, firebase_id)
VALUES (
  'd305ea8b-eaf5-4ef1-a1e5-b575873f06b1',
  '{a191863e-aec2-4c0f-b016-78afcb6f80d7,a1bf34fb-9951-49c1-a228-967a5fe8d897}',
  '{"a191863e-aec2-4c0f-b016-78afcb6f80d7":{"displayName":"Vasilis Skevis","photoURL":""},"a1bf34fb-9951-49c1-a228-967a5fe8d897":{"displayName":"George Assos","photoURL":""}}',
  '{"text":"Hello","senderId":"a191863e-aec2-4c0f-b016-78afcb6f80d7","timestamp":"2026-03-20T15:01:59.533Z"}',
  '48db3cf8-2a0f-4ab1-959b-dd6bb005b905',
  'SKIPPER-BSK 34NC ',
  '{"a191863e-aec2-4c0f-b016-78afcb6f80d7":0,"a1bf34fb-9951-49c1-a228-967a5fe8d897":0}',
  '2026-03-17T15:23:33.010Z',
  '2026-03-20T15:01:59.533Z',
  'Jkief5TRQJaFMjDVxN78'
) ON CONFLICT (id) DO NOTHING;

-- ═══ MESSAGES ═══

INSERT INTO public.messages (id, conversation_id, text, sender_id, sender_name, timestamp, read_by)
VALUES (
  '9a747b18-a375-409a-9873-8846caa4aabf', 'd305ea8b-eaf5-4ef1-a1e5-b575873f06b1',
  'Hello', 'a191863e-aec2-4c0f-b016-78afcb6f80d7',
  NULL,
  '2026-03-20T15:01:59.444Z',
  '{}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (id, conversation_id, text, sender_id, sender_name, timestamp, read_by)
VALUES (
  'da5bf775-0bca-41d8-85b7-3d7f50b7c15f', 'd305ea8b-eaf5-4ef1-a1e5-b575873f06b1',
  'gamame?', 'a191863e-aec2-4c0f-b016-78afcb6f80d7',
  NULL,
  '2026-03-17T15:24:35.701Z',
  '{}'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.messages (id, conversation_id, text, sender_id, sender_name, timestamp, read_by)
VALUES (
  '5aa7897c-6e89-4da3-bbe4-ba6d5d895b81', 'd305ea8b-eaf5-4ef1-a1e5-b575873f06b1',
  'hello', 'a191863e-aec2-4c0f-b016-78afcb6f80d7',
  NULL,
  '2026-03-17T15:23:36.329Z',
  '{}'
) ON CONFLICT (id) DO NOTHING;

-- ═══ REVIEWS ═══

-- ═══ FAVORITES ═══

-- ═══ DESTINATIONS ═══

-- ═══ ARTICLES ═══

-- ═══ SUBSCRIBERS ═══

INSERT INTO public.subscribers (id, email, created_at)
VALUES (
  'b0b77da9-796d-43ee-8482-dd0d82b7aa8f', 'karidis2000@gmail.com',
  '2026-03-18T10:26:03.637Z'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.subscribers (id, email, created_at)
VALUES (
  'a9381174-f1d7-45f6-be5e-46e1f37cb4db', 'Info@almalibre-rib.gr',
  '2026-03-14T11:33:36.586Z'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.subscribers (id, email, created_at)
VALUES (
  '7c9119f3-20c6-4c41-96f8-5c3d8d273137', 'porosilona@gmail.com',
  '2026-03-22T08:48:13.876Z'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.subscribers (id, email, created_at)
VALUES (
  '6c86b823-67fb-4be1-89fc-d08ba0f89622', 'karidis2000@gmail.com',
  '2026-03-18T10:21:18.589Z'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.subscribers (id, email, created_at)
VALUES (
  '1998949e-3261-41a0-ae09-276b0cb9aeb6', 'tsiamisc@gmail.com',
  '2026-03-15T08:25:46.577Z'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.subscribers (id, email, created_at)
VALUES (
  '128d412d-2ca2-4507-83cc-b565f1df3c37', 'delmare_alimos@yahoo.com',
  '2026-03-17T19:52:21.276Z'
) ON CONFLICT (email) DO NOTHING;

-- ═══ SETTINGS ═══

INSERT INTO public.settings (key, value, updated_at)
VALUES ('charges', '{"serviceFee":10,"platformFeePercent":5,"commissionPercent":15,"updatedAt":{"_seconds":1773178041,"_nanoseconds":906000000}}', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();