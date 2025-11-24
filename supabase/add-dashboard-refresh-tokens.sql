-- ============================================
-- Dashboard Refresh Tokens
-- ============================================
-- Scopo: gestire refresh token separati dagli access token
--        per sessioni sicure (NIST 800-63B, OWASP)
-- ============================================

create table if not exists public.dashboard_refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  access_token_id uuid not null references public.dashboard_access_tokens(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  token_hash text not null unique,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked boolean not null default false,
  revoked_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_dashboard_refresh_token_hash on public.dashboard_refresh_tokens(token_hash);
create index if not exists idx_dashboard_refresh_user on public.dashboard_refresh_tokens(user_id) where user_id is not null;
create index if not exists idx_dashboard_refresh_active on public.dashboard_refresh_tokens(expires_at, revoked) where revoked = false;

alter table public.dashboard_refresh_tokens enable row level security;

drop policy if exists "Service role manages refresh tokens" on public.dashboard_refresh_tokens;
create policy "Service role manages refresh tokens"
  on public.dashboard_refresh_tokens for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

comment on table public.dashboard_refresh_tokens is 'Refresh token per sessioni dashboard (rotazione forzata, revoca, audit)';
