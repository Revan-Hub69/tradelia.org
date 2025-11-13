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

-- ===== TABELLA PROPOSTE ASSET (COMMUNITY) =====
create table if not exists public.asset_proposals (
  id uuid primary key default gen_random_uuid(),
  asset_ticker text not null,
  proposed_by uuid not null references auth.users(id) on delete cascade,
  vote_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_asset_proposals_active on public.asset_proposals(is_active, vote_count desc);
create index if not exists idx_asset_proposals_proposed_by on public.asset_proposals(proposed_by);

-- ===== TABELLA VOTI ASSET =====
create table if not exists public.asset_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.asset_proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(proposal_id, user_id)
);

create index if not exists idx_asset_votes_proposal on public.asset_votes(proposal_id);
create index if not exists idx_asset_votes_user on public.asset_votes(user_id);

-- ===== TABELLA LINK PUBBLICI DESK =====
create table if not exists public.desk_public_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  link_url text not null,
  link_label text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (display_order >= 0 and display_order <= 2)
);

create index if not exists idx_desk_links_user on public.desk_public_links(user_id, display_order);

-- ===== TABELLA CREDITI ANALISI ON-DEMAND =====
create table if not exists public.user_analysis_credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  credits_balance int not null default 0,
  total_purchased int not null default 0,
  total_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists idx_analysis_credits_user on public.user_analysis_credits(user_id);

-- ===== TRIGGER PER AGGIORNAMENTO VOTE_COUNT =====
create or replace function update_proposal_vote_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.asset_proposals
    set vote_count = vote_count + 1, updated_at = now()
    where id = new.proposal_id;
  elsif tg_op = 'DELETE' then
    update public.asset_proposals
    set vote_count = greatest(0, vote_count - 1), updated_at = now()
    where id = old.proposal_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

drop trigger if exists trigger_update_vote_count on public.asset_votes;
create trigger trigger_update_vote_count
after insert or delete on public.asset_votes
for each row execute function update_proposal_vote_count();

-- ===== TRIGGER UPDATED_AT PER NUOVE TABELLE =====
drop trigger if exists asset_proposals_set_timestamp on public.asset_proposals;
create trigger asset_proposals_set_timestamp
before update on public.asset_proposals
for each row execute procedure moddatetime(updated_at);

drop trigger if exists desk_links_set_timestamp on public.desk_public_links;
create trigger desk_links_set_timestamp
before update on public.desk_public_links
for each row execute procedure moddatetime(updated_at);

drop trigger if exists analysis_credits_set_timestamp on public.user_analysis_credits;
create trigger analysis_credits_set_timestamp
before update on public.user_analysis_credits
for each row execute procedure moddatetime(updated_at);

-- ===== RLS PER ASSET_PROPOSALS =====
alter table public.asset_proposals enable row level security;

drop policy if exists "Everyone can view active proposals" on public.asset_proposals;
create policy "Everyone can view active proposals"
  on public.asset_proposals for select
  using (is_active = true);

drop policy if exists "Trial/Pro can propose" on public.asset_proposals;
create policy "Trial/Pro can propose"
  on public.asset_proposals for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('trial', 'pro')
    )
    and proposed_by = auth.uid()
  );

drop policy if exists "Admins can delete proposals" on public.asset_proposals;
create policy "Admins can delete proposals"
  on public.asset_proposals for delete
  using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

-- ===== RLS PER ASSET_VOTES =====
alter table public.asset_votes enable row level security;

drop policy if exists "Everyone can view votes" on public.asset_votes;
create policy "Everyone can view votes"
  on public.asset_votes for select
  using (true);

drop policy if exists "Trial/Pro can vote" on public.asset_votes;
create policy "Trial/Pro can vote"
  on public.asset_votes for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role in ('trial', 'pro')
    )
    and user_id = auth.uid()
  );

drop policy if exists "Users can remove own vote" on public.asset_votes;
create policy "Users can remove own vote"
  on public.asset_votes for delete
  using (user_id = auth.uid());

-- ===== RLS PER DESK_PUBLIC_LINKS =====
alter table public.desk_public_links enable row level security;

drop policy if exists "Everyone can view desk links" on public.desk_public_links;
create policy "Everyone can view desk links"
  on public.desk_public_links for select
  using (true);

drop policy if exists "Desk users manage own links" on public.desk_public_links;
create policy "Desk users manage own links"
  on public.desk_public_links for all
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'institutional'
    )
    and user_id = auth.uid()
  )
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'institutional'
    )
    and user_id = auth.uid()
  );

-- ===== RLS PER USER_ANALYSIS_CREDITS =====
alter table public.user_analysis_credits enable row level security;

drop policy if exists "Users view own credits" on public.user_analysis_credits;
create policy "Users view own credits"
  on public.user_analysis_credits for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages credits" on public.user_analysis_credits;
create policy "Service role manages credits"
  on public.user_analysis_credits for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');


