-- ============================================
-- SCHEMA COMPLETO DASHBOARD - Tradelia
-- ============================================
-- Questo file completa lo schema_v2.sql con:
-- 1. Tabelle mancanti (notifications, user_plans, plan_usage, payment_orders)
-- 2. Funzioni RPC per dashboard
-- 3. RLS policies complete
-- 4. Indici per performance
-- ============================================
-- Eseguire DOPO schema_v2.sql in Supabase Dashboard → SQL Editor
-- ============================================

-- ===============================
-- 1. TABELLA NOTIFICATIONS
-- ===============================

-- Tabella notifications (alias per user_notifications per compatibilità)
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  user_token text, -- Per compatibilità con dashboard access tokens
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'error', 'analysis_completed', 'plan_expiring', 'credits_low', 'system')),
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_token on public.notifications(user_token, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

create trigger notifications_set_timestamp
before update on public.notifications
for each row execute procedure public.moddatetime();

-- ===============================
-- 2. TABELLA USER_PLANS
-- ============================================
-- Piano utente (Pro/Desk) con gestione scadenze e pagamenti
-- ============================================

create table if not exists public.user_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  plan_type text not null check (plan_type in ('pro', 'desk')),
  status text not null default 'active' check (status in ('active', 'pending_payment', 'pending_manual', 'cancelled', 'expired')),
  started_at timestamptz default now(),
  expires_at timestamptz, -- Solo per Desk
  xolo_payment_status text, -- pending, paid, failed
  xolo_payment_due_date timestamptz,
  email text, -- Email utente (per compatibilità)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_user_plans_user on public.user_plans(user_id, started_at desc);
create index if not exists idx_user_plans_status on public.user_plans(status);
create index if not exists idx_user_plans_type on public.user_plans(plan_type);

create trigger user_plans_set_timestamp
before update on public.user_plans
for each row execute procedure public.moddatetime();

-- ===============================
-- 3. TABELLA PLAN_USAGE
-- ============================================
-- Tracciamento utilizzo analisi per piano (Pro/Desk)
-- ============================================

create table if not exists public.plan_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  plan_id uuid not null references public.user_plans on delete cascade,
  month_year text not null, -- Formato: YYYY-MM
  pro_included_used integer not null default 0 check (pro_included_used >= 0),
  pro_extra_used integer not null default 0 check (pro_extra_used >= 0),
  desk_included_used integer not null default 0 check (desk_included_used >= 0),
  desk_extra_used integer not null default 0 check (desk_extra_used >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, plan_id, month_year)
);

create index if not exists idx_plan_usage_user_month on public.plan_usage(user_id, month_year);
create index if not exists idx_plan_usage_plan on public.plan_usage(plan_id);

create trigger plan_usage_set_timestamp
before update on public.plan_usage
for each row execute procedure public.moddatetime();

-- ===============================
-- 4. TABELLA PAYMENT_ORDERS
-- ============================================
-- Ordini di pagamento per analisi extra
-- ============================================

create table if not exists public.payment_orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  plan_id uuid references public.user_plans on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending_manual' check (status in ('pending_manual', 'paid', 'cancelled', 'refunded')),
  invoice_date timestamptz default now(),
  due_date timestamptz,
  description text,
  xolo_invoice_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_payment_orders_user on public.payment_orders(user_id, created_at desc);
create index if not exists idx_payment_orders_status on public.payment_orders(status);

create trigger payment_orders_set_timestamp
before update on public.payment_orders
for each row execute procedure public.moddatetime();

-- ===============================
-- 5. AGGIORNA ANALYSIS_REQUESTS
-- ============================================
-- Aggiungi campi mancanti per integrazione plan/usage
-- ============================================

alter table public.analysis_requests
add column if not exists user_id uuid references auth.users on delete set null,
add column if not exists access_token text, -- Per compatibilità con dashboard tokens
add column if not exists plan_type text check (plan_type in ('pro', 'desk')),
add column if not exists cost numeric(10,2) default 0,
add column if not exists payment_order_id uuid references public.payment_orders on delete set null,
add column if not exists included_in_plan boolean default false,
add column if not exists request_type text check (request_type in ('included', 'extra_pro', 'extra_desk', 'standalone')),
add column if not exists report_slug text,
add column if not exists report_id uuid;

create index if not exists idx_analysis_requests_user on public.analysis_requests(user_id, created_at desc);
create index if not exists idx_analysis_requests_token on public.analysis_requests(access_token);
create index if not exists idx_analysis_requests_status on public.analysis_requests(status);

-- ===============================
-- 6. RLS POLICIES
-- ============================================

-- Notifications
alter table public.notifications enable row level security;

drop policy if exists "Users view own notifications" on public.notifications;
create policy "Users view own notifications"
  on public.notifications for select
  using (user_id = auth.uid() OR user_token IN (
    SELECT token_hash FROM public.dashboard_access_tokens 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ));

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Service role manages notifications" on public.notifications;
create policy "Service role manages notifications"
  on public.notifications for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- User Plans
alter table public.user_plans enable row level security;

drop policy if exists "Users view own plans" on public.user_plans;
create policy "Users view own plans"
  on public.user_plans for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages plans" on public.user_plans;
create policy "Service role manages plans"
  on public.user_plans for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Plan Usage
alter table public.plan_usage enable row level security;

drop policy if exists "Users view own usage" on public.plan_usage;
create policy "Users view own usage"
  on public.plan_usage for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages usage" on public.plan_usage;
create policy "Service role manages usage"
  on public.plan_usage for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Payment Orders
alter table public.payment_orders enable row level security;

drop policy if exists "Users view own payment orders" on public.payment_orders;
create policy "Users view own payment orders"
  on public.payment_orders for select
  using (user_id = auth.uid());

drop policy if exists "Service role manages payment orders" on public.payment_orders;
create policy "Service role manages payment orders"
  on public.payment_orders for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Analysis Requests (aggiorna RLS esistente)
alter table public.analysis_requests enable row level security;

drop policy if exists "Users view own requests" on public.analysis_requests;
create policy "Users view own requests"
  on public.analysis_requests for select
  using (
    user_id = auth.uid() OR 
    access_token IN (
      SELECT token_hash FROM public.dashboard_access_tokens 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

drop policy if exists "Users create own requests" on public.analysis_requests;
create policy "Users create own requests"
  on public.analysis_requests for insert
  with check (user_id = auth.uid());

drop policy if exists "Service role manages requests" on public.analysis_requests;
create policy "Service role manages requests"
  on public.analysis_requests for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ===============================
-- 7. FUNZIONI RPC PER DASHBOARD
-- ============================================

-- Funzione: get_user_plan_data
-- Restituisce piano, usage e crediti per utente
create or replace function public.get_user_plan_data(p_user_id uuid)
returns jsonb as $$
declare
  v_plan jsonb;
  v_usage jsonb;
  v_result jsonb;
begin
  -- Piano attivo
  select jsonb_build_object(
    'type', plan_type,
    'status', status,
    'startedAt', started_at,
    'expiresAt', expires_at,
    'xoloPaymentStatus', xolo_payment_status,
    'xoloPaymentDueDate', xolo_payment_due_date,
    'desk', case 
      when plan_type = 'desk' and status = 'active' then jsonb_build_object(
        'analysesIncluded', 2,
        'analysesUsed', 0, -- Calcolato da usage
        'analysesRemaining', 2 -- Calcolato da usage
      )
      else null
    end,
    'credits', 0 -- TODO: da user_analysis_credits
  ) into v_plan
  from public.user_plans
  where user_id = p_user_id
    and status in ('active', 'pending_payment', 'pending_manual')
  order by plan_type desc, started_at desc
  limit 1;

  -- Usage corrente
  if v_plan is not null then
    select jsonb_build_object(
      'month', month_year,
      'proIncludedUsed', pro_included_used,
      'proExtraUsed', pro_extra_used,
      'proExtraRemaining', case 
        when v_plan->>'type' = 'pro' then greatest(0, 1 - (pro_included_used::int))
        else 0
      end,
      'deskIncludedUsed', desk_included_used,
      'deskExtraUsed', desk_extra_used,
      'deskIncludedRemaining', case 
        when v_plan->>'type' = 'desk' then greatest(0, 2 - (desk_included_used::int))
        else 0
      end
    ) into v_usage
    from public.plan_usage
    where user_id = p_user_id
      and month_year = to_char(now(), 'YYYY-MM')
    limit 1;
  end if;

  -- Risultato
  v_result := jsonb_build_object(
    'plan', coalesce(v_plan, '{}'::jsonb),
    'usage', coalesce(v_usage, jsonb_build_object(
      'month', to_char(now(), 'YYYY-MM'),
      'proIncludedUsed', 0,
      'proExtraUsed', 0,
      'proExtraRemaining', 0,
      'deskIncludedUsed', 0,
      'deskExtraUsed', 0,
      'deskIncludedRemaining', 0
    ))
  );

  return v_result;
end;
$$ language plpgsql security definer;

-- Funzione: create_notification
-- Crea notifica per utente
create or replace function public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_link text default null
)
returns uuid as $$
declare
  v_notification_id uuid;
begin
  insert into public.notifications (
    user_id,
    type,
    title,
    message,
    link
  ) values (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link
  )
  returning id into v_notification_id;

  return v_notification_id;
end;
$$ language plpgsql security definer;

-- Funzione: mark_notification_read
-- Marca notifica come letta
create or replace function public.mark_notification_read(p_notification_id uuid)
returns boolean as $$
begin
  update public.notifications
  set is_read = true,
      updated_at = now()
  where id = p_notification_id
    and user_id = auth.uid();

  return found;
end;
$$ language plpgsql security definer;

-- ===============================
-- 8. COMMENTI DOCUMENTAZIONE
-- ============================================

comment on table public.notifications is 'Notifiche sistema per utenti dashboard';
comment on table public.user_plans is 'Piani utente (Pro/Desk) con gestione scadenze';
comment on table public.plan_usage is 'Tracciamento utilizzo analisi per piano';
comment on table public.payment_orders is 'Ordini di pagamento per analisi extra';

comment on function public.get_user_plan_data(uuid) is 'Restituisce piano, usage e crediti per utente';
comment on function public.create_notification(uuid, text, text, text, text) is 'Crea notifica per utente';
comment on function public.mark_notification_read(uuid) is 'Marca notifica come letta';

-- ===============================
-- 9. VERIFICA FINALE
-- ============================================

-- Verifica che tutte le tabelle siano state create
do $$
declare
  v_tables text[] := array[
    'notifications',
    'user_plans',
    'plan_usage',
    'payment_orders'
  ];
  v_table text;
  v_exists boolean;
begin
  foreach v_table in array v_tables
  loop
    select exists (
      select 1 from information_schema.tables
      where table_schema = 'public'
        and table_name = v_table
    ) into v_exists;
    
    if not v_exists then
      raise warning 'Tabella % non trovata!', v_table;
    else
      raise notice '✅ Tabella % creata correttamente', v_table;
    end if;
  end loop;
end $$;

