-- ============================================
-- WATCHLIST E ALERT SYSTEM
-- ============================================
-- Sistema completo per watchlist personalizzata
-- con notifiche a target precisi
-- ============================================

-- ===============================
-- 1. TABELLA WATCHLIST
-- ===============================
-- Lista asset monitorati dall'utente

create table if not exists public.watchlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  
  -- Asset Info
  asset_symbol text not null,
  asset_name text,
  asset_type text check (asset_type in ('stock', 'crypto', 'forex', 'commodity', 'other')),
  exchange text, -- es. NASDAQ, NYSE, Binance, etc.
  
  -- Metadata
  notes text,
  tags text[],
  priority integer default 0, -- 0 = normale, 1 = alta, 2 = massima
  
  -- Status
  is_active boolean not null default true,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Unique constraint: un utente non può avere lo stesso asset due volte
  unique(user_id, asset_symbol)
);

create index idx_watchlist_user on public.watchlist(user_id, created_at desc);
create index idx_watchlist_active on public.watchlist(user_id, is_active) where is_active = true;
create index idx_watchlist_symbol on public.watchlist(asset_symbol);

-- ===============================
-- 2. TABELLA ALERT TARGETS
-- ===============================
-- Target precisi per ogni asset in watchlist

create table if not exists public.watchlist_alerts (
  id uuid primary key default uuid_generate_v4(),
  watchlist_id uuid not null references public.watchlist on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  
  -- Target Type
  alert_type text not null check (alert_type in (
    'price_above',      -- Prezzo sale sopra target
    'price_below',      -- Prezzo scende sotto target
    'price_change_pct', -- Variazione percentuale
    'volume_above',     -- Volume sopra soglia
    'rsi_above',        -- RSI sopra soglia (futuro)
    'rsi_below',        -- RSI sotto soglia (futuro)
    'custom'            -- Alert personalizzato
  )),
  
  -- Target Value
  target_value numeric not null,
  current_value numeric, -- Ultimo valore rilevato (per tracking)
  
  -- Comparison
  comparison_operator text check (comparison_operator in ('>', '<', '>=', '<=', '=')),
  
  -- Notification Settings
  notify_via_push boolean not null default true,
  notify_via_email boolean not null default false,
  notify_via_sms boolean not null default false,
  
  -- Status
  is_active boolean not null default true,
  is_triggered boolean not null default false, -- Se true, alert è stato attivato
  triggered_at timestamptz, -- Quando è stato attivato
  last_checked_at timestamptz, -- Ultima volta che è stato controllato
  
  -- Metadata
  notes text,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_watchlist_alerts_watchlist on public.watchlist_alerts(watchlist_id);
create index idx_watchlist_alerts_user on public.watchlist_alerts(user_id, is_active) where is_active = true;
create index idx_watchlist_alerts_active on public.watchlist_alerts(is_active, is_triggered) where is_active = true and is_triggered = false;
create index idx_watchlist_alerts_check on public.watchlist_alerts(last_checked_at) where is_active = true;

-- ===============================
-- 3. TABELLA ALERT HISTORY
-- ===============================
-- Storico di tutti gli alert attivati

create table if not exists public.watchlist_alert_history (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid not null references public.watchlist_alerts on delete cascade,
  watchlist_id uuid not null references public.watchlist on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  
  -- Alert Info
  alert_type text not null,
  target_value numeric not null,
  triggered_value numeric not null, -- Valore quando è stato attivato
  
  -- Notification Status
  notification_sent boolean not null default false,
  notification_sent_at timestamptz,
  notification_channels text[], -- ['push', 'email', 'sms']
  
  -- Timestamps
  triggered_at timestamptz default now()
);

create index idx_alert_history_user on public.watchlist_alert_history(user_id, triggered_at desc);
create index idx_alert_history_alert on public.watchlist_alert_history(alert_id);
create index idx_alert_history_watchlist on public.watchlist_alert_history(watchlist_id);

-- ===============================
-- 4. TRIGGERS
-- ===============================

create trigger watchlist_set_timestamp
before update on public.watchlist
for each row execute procedure public.moddatetime(updated_at);

create trigger watchlist_alerts_set_timestamp
before update on public.watchlist_alerts
for each row execute procedure public.moddatetime(updated_at);

-- ===============================
-- 5. RLS POLICIES
-- ===============================

-- Watchlist: utenti possono vedere solo la propria
alter table public.watchlist enable row level security;

create policy "Users can view own watchlist"
  on public.watchlist for select
  using (auth.uid() = user_id);

create policy "Users can insert own watchlist"
  on public.watchlist for insert
  with check (auth.uid() = user_id);

create policy "Users can update own watchlist"
  on public.watchlist for update
  using (auth.uid() = user_id);

create policy "Users can delete own watchlist"
  on public.watchlist for delete
  using (auth.uid() = user_id);

-- Watchlist Alerts: utenti possono gestire solo i propri alert
alter table public.watchlist_alerts enable row level security;

create policy "Users can view own alerts"
  on public.watchlist_alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert own alerts"
  on public.watchlist_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own alerts"
  on public.watchlist_alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete own alerts"
  on public.watchlist_alerts for delete
  using (auth.uid() = user_id);

-- Alert History: utenti possono vedere solo la propria storia
alter table public.watchlist_alert_history enable row level security;

create policy "Users can view own alert history"
  on public.watchlist_alert_history for select
  using (auth.uid() = user_id);

-- Admin può vedere tutto (per monitoring)
create policy "Admins can view all watchlist"
  on public.watchlist for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

create policy "Admins can view all alerts"
  on public.watchlist_alerts for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- ===============================
-- 6. FUNZIONI HELPER
-- ===============================

-- Funzione per ottenere watchlist con alert attivi
create or replace function public.get_watchlist_with_alerts(p_user_id uuid)
returns table (
  watchlist_id uuid,
  asset_symbol text,
  asset_name text,
  asset_type text,
  is_active boolean,
  alert_count bigint,
  active_alert_count bigint
) as $$
begin
  return query
  select 
    w.id as watchlist_id,
    w.asset_symbol,
    w.asset_name,
    w.asset_type,
    w.is_active,
    count(a.id) as alert_count,
    count(a.id) filter (where a.is_active = true and a.is_triggered = false) as active_alert_count
  from public.watchlist w
  left join public.watchlist_alerts a on a.watchlist_id = w.id
  where w.user_id = p_user_id
  group by w.id, w.asset_symbol, w.asset_name, w.asset_type, w.is_active
  order by w.created_at desc;
end;
$$ language plpgsql security definer;

-- Commenti
comment on table public.watchlist is 'Lista asset monitorati dall''utente';
comment on table public.watchlist_alerts is 'Target precisi per alert su asset in watchlist';
comment on table public.watchlist_alert_history is 'Storico di tutti gli alert attivati';

