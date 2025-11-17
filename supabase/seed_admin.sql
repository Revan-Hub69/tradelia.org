-- Seed admin user, admin email, and dashboard token for amministrazione@tradelia.org

-- Ensure admin email
insert into public.admin_emails (email, notes)
values ('amministrazione@tradelia.org', 'Primary admin')
on conflict (email) do nothing;

-- Optionally ensure admin_users entry (if auth user exists)
-- (Replace UUID below with actual auth user id if available)
-- insert into public.admin_users (user_id, email, notes)
-- values ('00000000-0000-0000-0000-000000000000', 'amministrazione@tradelia.org', 'Seed admin')
-- on conflict (user_id) do nothing;

-- Generate token value client-side; here we store hash (SHA256)
-- Replace '<PLAIN_TOKEN>' with the value you will deliver to the admin.
-- Example (psql): select encode(digest('PLAIN_TOKEN','sha256'),'hex');

-- Hardcode for now (replace TOKEN_HASH_PLACEHOLDER with actual hash)
insert into public.dashboard_access_tokens (
  token_hash,
  email,
  plan_role,
  valid_until,
  revoked,
  source
)
values (
  '09127cd77d54f2141f81f158a94c6a62823e377e41378974ed2b870a1ecfc4bc',
  'amministrazione@tradelia.org',
  'admin',
  now() + interval '365 days',
  false,
  'seed'
)
on conflict (token_hash) do nothing;

