-- Extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Helper: updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles (1:1 con auth.users)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  display_name text,
  risk_profile jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb
);

create trigger trg_profiles_updated
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = user_id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- exchange_connections (metadata + riferimento a secret in Vault)
create table if not exists public.exchange_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  exchange text not null,
  venue text not null,
  label text not null default 'default',

  api_key_public_hint text,
  is_testnet boolean not null default true,
  is_enabled boolean not null default true,

  vault_secret_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, exchange, venue, label)
);

create trigger trg_exchange_connections_updated
before update on public.exchange_connections
for each row execute function public.set_updated_at();

alter table public.exchange_connections enable row level security;

create policy "excon_select_own"
on public.exchange_connections for select
using (auth.uid() = user_id);

create policy "excon_insert_own"
on public.exchange_connections for insert
with check (auth.uid() = user_id);

create policy "excon_update_own"
on public.exchange_connections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "excon_delete_own"
on public.exchange_connections for delete
using (auth.uid() = user_id);

-- symbol_universe (snapshot giornaliero + tiering)
create table if not exists public.symbol_universe (
  id uuid primary key default gen_random_uuid(),
  asof_date date not null,
  exchange text not null default 'binance',
  venue text not null default 'futures_usdt',

  symbol text not null,
  status text not null default 'ACTIVE',
  tier text not null default 'B',
  scores jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  rules jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  unique(asof_date, exchange, venue, symbol)
);

alter table public.symbol_universe enable row level security;

create policy "universe_select_auth"
on public.symbol_universe for select
using (auth.role() = 'authenticated');

-- feature_snapshots
create table if not exists public.feature_snapshots (
  snapshot_id uuid primary key default gen_random_uuid(),
  exchange text not null default 'binance',
  venue text not null default 'futures_usdt',
  symbol text not null,
  ts timestamptz not null,

  features jsonb not null,
  quality jsonb not null,
  source_meta jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists idx_feature_snapshots_symbol_ts
on public.feature_snapshots(symbol, ts desc);

alter table public.feature_snapshots enable row level security;

create policy "features_select_auth"
on public.feature_snapshots for select
using (auth.role() = 'authenticated');

-- trade_plans
create table if not exists public.trade_plans (
  plan_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  exchange_connection_id uuid not null references public.exchange_connections(id) on delete restrict,

  exchange text not null default 'binance',
  venue text not null default 'futures_usdt',
  symbol text not null,

  strategy_version text not null,
  mode text not null,
  side text not null,

  state text not null default 'DRAFT',
  gates jsonb not null,
  inputs jsonb not null,
  decision jsonb not null,
  snapshot_refs uuid[] not null default '{}'::uuid[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_trade_plans_updated
before update on public.trade_plans
for each row execute function public.set_updated_at();

create index if not exists idx_trade_plans_user_created
on public.trade_plans(user_id, created_at desc);

alter table public.trade_plans enable row level security;

create policy "plans_select_own"
on public.trade_plans for select
using (auth.uid() = user_id);

create policy "plans_insert_own"
on public.trade_plans for insert
with check (auth.uid() = user_id);

create policy "plans_update_own"
on public.trade_plans for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "plans_delete_own"
on public.trade_plans for delete
using (auth.uid() = user_id);

-- jobs
create table if not exists public.jobs (
  job_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.trade_plans(plan_id) on delete set null,

  type text not null,
  status text not null default 'QUEUED',
  priority int not null default 100,

  payload jsonb not null,
  result jsonb,
  error text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text
);

create trigger trg_jobs_updated
before update on public.jobs
for each row execute function public.set_updated_at();

create index if not exists idx_jobs_status_priority
on public.jobs(status, priority asc, created_at asc);

alter table public.jobs enable row level security;

create policy "jobs_select_own"
on public.jobs for select
using (auth.uid() = user_id);

create policy "jobs_insert_own"
on public.jobs for insert
with check (auth.uid() = user_id);

-- executions
create table if not exists public.executions (
  exec_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.trade_plans(plan_id) on delete set null,

  exchange text not null default 'binance',
  venue text not null default 'futures_usdt',
  symbol text not null,

  state text not null default 'OPEN',
  position jsonb not null default '{}'::jsonb,

  orders jsonb not null default '[]'::jsonb,
  fills jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,

  audit jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_executions_updated
before update on public.executions
for each row execute function public.set_updated_at();

create index if not exists idx_executions_user_created
on public.executions(user_id, created_at desc);

alter table public.executions enable row level security;

create policy "exec_select_own"
on public.executions for select
using (auth.uid() = user_id);
