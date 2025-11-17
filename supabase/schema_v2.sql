-- Supabase Schema v2 (generated from docs/schema-v2.md)
-- NOTE: run in a clean database (drop existing tables or use supabase db reset)

-- ===============================
-- 0. Extensions / Helpers
-- ===============================
create extension if not exists "uuid-ossp";

-- Trigger helper (moddatetime)
create or replace function public.moddatetime() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ===============================
-- 1. Identity & Access
-- ===============================

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text,
  company text,
  country text,
  user_type text check (user_type in ('retail','pro','desk','internal')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

create trigger user_profiles_set_timestamp
before update on public.user_profiles
for each row execute procedure public.moddatetime();

create table if not exists public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  email text unique not null,
  role text not null check (role in ('trial','pro','institutional','desk','admin')),
  plan_source text,
  valid_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger user_roles_set_timestamp
before update on public.user_roles
for each row execute procedure public.moddatetime();

create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_user_roles_valid_until on public.user_roles(valid_until);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  plan text not null,
  status text not null,
  gateway text not null,
  gateway_subscription_id text,
  started_at timestamptz default now(),
  renew_at timestamptz,
  cancelled_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

create table if not exists public.dashboard_access_tokens (
  id uuid primary key default uuid_generate_v4(),
  token_hash text unique not null,
  email text not null,
  user_id uuid references auth.users,
  plan_role text not null,
  valid_until timestamptz not null,
  revoked boolean default false,
  source text,
  usage_count integer default 0,
  last_used_at timestamptz,
  created_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_dashboard_tokens_email on public.dashboard_access_tokens(email);
create index if not exists idx_dashboard_tokens_valid on public.dashboard_access_tokens(valid_until);

create table if not exists public.admin_emails (
  email text primary key,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users,
  email text unique not null,
  notes text,
  created_at timestamptz default now()
);

-- ===============================
-- 2. Reporting Engine
-- ===============================

create table if not exists public.report_templates (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  label text not null,
  description text,
  status text default 'active',
  default_version_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.report_template_versions (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references public.report_templates on delete cascade,
  version text not null,
  changelog text,
  schema jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.report_templates
  add constraint report_templates_default_version_fk
  foreign key (default_version_id) references public.report_template_versions(id);

create table if not exists public.report_template_modules (
  id uuid primary key default uuid_generate_v4(),
  template_version_id uuid not null references public.report_template_versions on delete cascade,
  module_key text not null,
  order_index integer default 0,
  required boolean default false,
  default_content jsonb default '{}'::jsonb
);

create unique index if not exists idx_template_modules_unique
on public.report_template_modules(template_version_id, module_key);

create table if not exists public.report_templates_fields (
  id uuid primary key default uuid_generate_v4(),
  template_version_id uuid not null references public.report_template_versions on delete cascade,
  field_name text not null,
  field_type text not null,
  validation jsonb default '{}'::jsonb
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  report_type text not null,
  template_version_id uuid references public.report_template_versions,
  slug text unique not null,
  title text not null,
  status text not null default 'draft',
  notes text,
  chart_path text,
  published_at timestamptz,
  created_by uuid references public.admin_users(user_id),
  updated_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_reports_type on public.reports(report_type);
create trigger reports_set_timestamp
before update on public.reports
for each row execute procedure public.moddatetime();

create table if not exists public.report_modules (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports on delete cascade,
  module_key text not null,
  order_index integer default 0,
  content jsonb not null,
  locked boolean default false
);
create unique index if not exists idx_report_modules_unique
on public.report_modules(report_id, module_key);

create table if not exists public.report_assets (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports on delete cascade,
  asset_type text not null,
  storage_path text not null,
  signed_url text,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.report_audit_log (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid not null references public.reports on delete cascade,
  action text not null,
  performed_by uuid references public.admin_users(user_id),
  payload jsonb,
  created_at timestamptz default now()
);

-- ===============================
-- 3. Community Intelligence
-- ===============================

create table if not exists public.asset_proposals (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  proposed_by uuid references auth.users,
  title text not null,
  description text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger asset_proposals_set_timestamp
before update on public.asset_proposals
for each row execute procedure public.moddatetime();

create table if not exists public.asset_votes (
  id uuid primary key default uuid_generate_v4(),
  proposal_id uuid not null references public.asset_proposals on delete cascade,
  user_id uuid not null references auth.users,
  vote text not null check (vote in ('up','down')),
  created_at timestamptz default now(),
  unique (proposal_id, user_id)
);

create table if not exists public.community_insights (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  reference_id uuid,
  summary text,
  metrics jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ===============================
-- 4. Monetization & Billing
-- ===============================

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  gateway text not null,
  gateway_payment_id text,
  amount numeric(10,2) not null,
  currency text not null default 'EUR',
  status text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  subscription_id uuid references public.subscriptions,
  invoice_number text unique not null,
  status text not null,
  issued_at timestamptz default now(),
  due_at timestamptz,
  pdf_url text,
  metadata jsonb default '{}'::jsonb
);

create table if not exists public.billing_events (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.analysis_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  ticker text not null,
  timeframe text,
  priority text,
  status text default 'pending',
  notes text,
  result_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger analysis_requests_set_timestamp
before update on public.analysis_requests
for each row execute procedure public.moddatetime();

create table if not exists public.user_analysis_credits (
  user_id uuid primary key references auth.users,
  credits_balance integer not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.user_analysis_credits_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users,
  delta integer not null,
  reason text,
  related_request_id uuid references public.analysis_requests(id),
  created_at timestamptz default now()
);

create table if not exists public.desk_public_links (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users,
  title text not null,
  url text not null,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger desk_links_set_timestamp
before update on public.desk_public_links
for each row execute procedure public.moddatetime();

-- ===============================
-- 5. Analysis Requests
-- ===============================

-- ===============================
-- 6. Operations & Telemetry
-- ===============================

create table if not exists public.ops_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  actor_user_id uuid,
  context text,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.error_reports (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  severity text not null,
  message text not null,
  stacktrace text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ===============================
-- Seeds (optional defaults)
-- ===============================

insert into public.report_templates (id, slug, label, description, status)
values
  (uuid_generate_v4(), 'swing_master_5_0', 'SRD v5.0 — Swing Research Deck', 'Template Swing Research Deck', 'active')
on conflict (slug) do nothing;

insert into public.report_template_versions (id, template_id, version, changelog)
select uuid_generate_v4(), id, 'v5.0', 'Initial version'
from public.report_templates
where slug = 'swing_master_5_0'
  and not exists (
    select 1 from public.report_template_versions
    where template_id = public.report_templates.id and version = 'v5.0'
  );

