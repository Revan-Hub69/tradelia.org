-- ============================================
-- Tabella per richieste analisi on-demand (pubbliche)
-- ============================================
-- Esegui questo script in Supabase Dashboard → SQL Editor
-- Per richieste da utenti non autenticati (form pubblico)
-- ============================================

-- ===== TABELLA RICHIESTE ANALISI ON-DEMAND PUBBLICHE =====
create table if not exists public.on_demand_analysis_requests (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  tipologia text not null check (tipologia in ('privato', 'azienda')),
  codice_fiscale text,
  ragione_sociale text,
  piva text,
  indirizzo text,
  tipo_analisi text not null,
  dettagli text not null,
  consenso_gdpr boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Indici per performance
create index if not exists idx_on_demand_analysis_requests_email on public.on_demand_analysis_requests(email);
create index if not exists idx_on_demand_analysis_requests_status on public.on_demand_analysis_requests(status);
create index if not exists idx_on_demand_analysis_requests_created_at on public.on_demand_analysis_requests(created_at desc);

-- Trigger per updated_at
drop trigger if exists on_demand_analysis_requests_set_timestamp on public.on_demand_analysis_requests;
create trigger on_demand_analysis_requests_set_timestamp
before update on public.on_demand_analysis_requests
for each row execute procedure moddatetime(updated_at);

-- ===== RLS PER ON_DEMAND_ANALYSIS_REQUESTS =====
alter table public.on_demand_analysis_requests enable row level security;

-- Policy: Service role può gestire tutte le richieste (per API server-side)
drop policy if exists "Service role manages on-demand requests" on public.on_demand_analysis_requests;
create policy "Service role manages on-demand requests"
  on public.on_demand_analysis_requests for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Policy: Admins possono vedere tutte le richieste
drop policy if exists "Admins view all on-demand requests" on public.on_demand_analysis_requests;
create policy "Admins view all on-demand requests"
  on public.on_demand_analysis_requests for select
  using (
    exists (
      select 1 from public.admin_emails ae
      where ae.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Commenti
comment on table public.on_demand_analysis_requests is 'Richieste analisi on-demand da utenti non autenticati (form pubblico)';
comment on column public.on_demand_analysis_requests.tipologia is 'Tipologia cliente: privato o azienda';
comment on column public.on_demand_analysis_requests.tipo_analisi is 'Tipo di analisi richiesta (Single Stock Analysis, ETF Monitor, etc.)';
comment on column public.on_demand_analysis_requests.status is 'Stato della richiesta: pending, processing, completed, cancelled';

