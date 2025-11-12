-- Supabase schema for Tradelia report system (CTA 2025 refactor)
-- Execute this in the Supabase SQL editor or via CLI after creating the project.

set check_function_bodies = off;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('trial','pro','institutional')),
  assigned_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  status text not null check (status in ('draft','active','archived')),
  report_type text not null check (report_type in ('swing_master_5_0','daily_market_intel_3_1','custom')),
  chart_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.report_modules (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  module_key text not null,
  content jsonb not null,
  order_index int,
  created_at timestamptz not null default now()
);

create table if not exists public.report_comments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 3 and 5000),
  author_display_name text,
  author_role text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_report_modules_report_id on public.report_modules(report_id);
create unique index if not exists uq_report_module_key_per_report
  on public.report_modules(report_id, module_key);

create index if not exists idx_report_comments_report_id on public.report_comments(report_id);
create index if not exists idx_report_comments_user_id on public.report_comments(user_id);

create extension if not exists moddatetime;
drop trigger if exists set_timestamp on public.reports;
create trigger set_timestamp
before update on public.reports
for each row execute procedure moddatetime(updated_at);

drop trigger if exists user_profiles_set_timestamp on public.user_profiles;
create trigger user_profiles_set_timestamp
before update on public.user_profiles
for each row execute procedure moddatetime(updated_at);

drop trigger if exists report_comments_set_timestamp on public.report_comments;
create trigger report_comments_set_timestamp
before update on public.report_comments
for each row execute procedure moddatetime(updated_at);

-- Optional helper view to expose active reports with modules ordered.
create or replace view public.active_reports_expanded as
select
  r.id,
  r.slug,
  r.title,
  r.status,
  r.report_type,
  r.chart_path,
  r.notes,
  r.created_at,
  r.updated_at,
  r.published_at,
  rm.module_key,
  rm.content,
  rm.order_index,
  row_number() over (partition by r.id order by coalesce(rm.order_index, 9999), rm.module_key) as module_position
from public.reports r
left join public.report_modules rm on rm.report_id = r.id
where r.status = 'active';

-- Example policies (adjust roles as needed).
-- Allow authenticated users full access (admin use-case).
alter table public.admin_users enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.reports enable row level security;
alter table public.report_modules enable row level security;
alter table public.report_comments enable row level security;

drop policy if exists "Admins can read admin_users" on public.admin_users;
create policy "Admins can read admin_users"
  on public.admin_users for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can manage admin_users" on public.admin_users;
create policy "Service role can manage admin_users"
  on public.admin_users using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users can read own role" on public.user_roles;
create policy "Users can read own role"
  on public.user_roles for select
  using (auth.uid() = user_id);

drop policy if exists "Admins manage user roles" on public.user_roles;
create policy "Admins manage user roles"
  on public.user_roles for all
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

drop policy if exists "Service role can manage user roles" on public.user_roles;
create policy "Service role can manage user roles"
  on public.user_roles using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists "Users manage own profile" on public.user_profiles;
create policy "Users manage own profile"
  on public.user_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins manage profiles" on public.user_profiles;
create policy "Admins manage profiles"
  on public.user_profiles for all
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

drop policy if exists "Admins manage reports" on public.reports;
create policy "Admins manage reports"
  on public.reports for all
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

drop policy if exists "Admins manage modules" on public.report_modules;
create policy "Admins manage modules"
  on public.report_modules for all
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

drop policy if exists "Everyone can read comments" on public.report_comments;
create policy "Everyone can read comments"
  on public.report_comments for select
  using (not is_deleted);

drop policy if exists "Eligible users insert comments" on public.report_comments;
create policy "Eligible users insert comments"
  on public.report_comments for insert
  with check (
    exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('pro','institutional')
    )
  );

drop policy if exists "Authors update own comments" on public.report_comments;
create policy "Authors update own comments"
  on public.report_comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Authors soft delete own comments" on public.report_comments;
create policy "Authors soft delete own comments"
  on public.report_comments for delete
  using (auth.uid() = user_id);

drop policy if exists "Admins moderate comments" on public.report_comments;
create policy "Admins moderate comments"
  on public.report_comments for all
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
  with check (true);


