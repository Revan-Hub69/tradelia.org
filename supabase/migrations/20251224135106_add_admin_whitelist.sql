-- Admin whitelist table
create table if not exists public.admin_whitelist (
  email text primary key,
  role text not null default 'admin',
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- Add admin@tradelia.org to whitelist
insert into public.admin_whitelist (email, role, is_active)
values ('amministrazione@tradelia.org', 'admin', true)
on conflict (email) do nothing;

alter table public.admin_whitelist enable row level security;

-- Policy: only admins can view the whitelist
create policy "admin_whitelist_select_admins_only"
on public.admin_whitelist for select
using (
  exists (
    select 1 from public.admin_whitelist aw
    where aw.email = auth.jwt() ->> 'email'
    and aw.is_active = true
  )
);

-- Policy: only admins can insert new admins
create policy "admin_whitelist_insert_admins_only"
on public.admin_whitelist for insert
with check (
  exists (
    select 1 from public.admin_whitelist aw
    where aw.email = auth.jwt() ->> 'email'
    and aw.is_active = true
  )
);

-- Policy: only admins can update whitelist
create policy "admin_whitelist_update_admins_only"
on public.admin_whitelist for update
using (
  exists (
    select 1 from public.admin_whitelist aw
    where aw.email = auth.jwt() ->> 'email'
    and aw.is_active = true
  )
)
with check (
  exists (
    select 1 from public.admin_whitelist aw
    where aw.email = auth.jwt() ->> 'email'
    and aw.is_active = true
  )
);

-- Function to check if user is admin
create or replace function public.is_admin(user_email text)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from public.admin_whitelist
    where email = user_email
    and is_active = true
  );
$$;

-- Grant usage to authenticated users
grant execute on function public.is_admin(text) to authenticated;
