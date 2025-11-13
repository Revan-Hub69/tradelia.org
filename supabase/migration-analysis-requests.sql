-- ============================================
-- MIGRAZIONE: Tabella analysis_requests
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Aggiunge la tabella per le richieste di analisi on-demand
-- ============================================

-- ===== TABELLA RICHIESTE ANALISI ON-DEMAND =====
create table if not exists public.analysis_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Indici per performance
create index if not exists idx_analysis_requests_user on public.analysis_requests(user_id, created_at desc);
create index if not exists idx_analysis_requests_status on public.analysis_requests(status);
create index if not exists idx_analysis_requests_ticker on public.analysis_requests(ticker);

-- Trigger per updated_at
drop trigger if exists analysis_requests_set_timestamp on public.analysis_requests;
create trigger analysis_requests_set_timestamp
before update on public.analysis_requests
for each row execute procedure moddatetime(updated_at);

-- ===== RLS PER ANALYSIS_REQUESTS =====
alter table public.analysis_requests enable row level security;

-- Policy: Utenti vedono solo le proprie richieste
drop policy if exists "Users view own requests" on public.analysis_requests;
create policy "Users view own requests"
  on public.analysis_requests for select
  using (user_id = auth.uid());

-- Policy: Utenti institutional possono creare richieste
drop policy if exists "Institutional users can create requests" on public.analysis_requests;
create policy "Institutional users can create requests"
  on public.analysis_requests for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'institutional'
    )
    and user_id = auth.uid()
  );

-- Policy: Utenti possono aggiornare solo le proprie richieste (solo se pending)
drop policy if exists "Users update own pending requests" on public.analysis_requests;
create policy "Users update own pending requests"
  on public.analysis_requests for update
  using (
    user_id = auth.uid()
    and status = 'pending'
  )
  with check (
    user_id = auth.uid()
    and status = 'pending'
  );

-- Policy: Admins possono gestire tutte le richieste
drop policy if exists "Admins manage all requests" on public.analysis_requests;
create policy "Admins manage all requests"
  on public.analysis_requests for all
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

-- Policy: Service role può gestire tutte le richieste (per webhook/automazioni)
drop policy if exists "Service role manages requests" on public.analysis_requests;
create policy "Service role manages requests"
  on public.analysis_requests for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

