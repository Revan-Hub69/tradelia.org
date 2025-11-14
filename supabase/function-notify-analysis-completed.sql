-- ============================================
-- FUNZIONE: Notifica quando analisi completata
-- ============================================
-- Trigger che invia notifica quando analysis_requests.status = 'completed'
-- ============================================

-- Tabella per notifiche (se non esiste)
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('analysis_completed', 'plan_expiring', 'credits_low', 'system')),
  title text not null,
  message text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_notifications_user on public.user_notifications(user_id, created_at desc);
create index if not exists idx_user_notifications_unread on public.user_notifications(user_id, is_read) where is_read = false;

-- RLS per notifications
alter table public.user_notifications enable row level security;

drop policy if exists "Users view own notifications" on public.user_notifications;
create policy "Users view own notifications"
  on public.user_notifications for select
  using (user_id = auth.uid());

drop policy if exists "Users update own notifications" on public.user_notifications;
create policy "Users update own notifications"
  on public.user_notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Funzione trigger per creare notifica quando analisi completata
create or replace function notify_analysis_completed()
returns trigger as $$
begin
  -- Solo quando status cambia a 'completed'
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    insert into public.user_notifications (
      user_id,
      type,
      title,
      message,
      link
    ) values (
      new.user_id,
      'analysis_completed',
      'Analisi completata',
      format('L''analisi per %s è stata completata.', new.ticker),
      case 
        when new.report_slug is not null then format('/report/index.html?id=%s', new.report_slug)
        when new.report_id is not null then format('/report/index.html?id=%s', new.report_id)
        else null
      end
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists trigger_notify_analysis_completed on public.analysis_requests;
create trigger trigger_notify_analysis_completed
after update on public.analysis_requests
for each row
execute function notify_analysis_completed();

-- Commenti
comment on table public.user_notifications is 'Notifiche per utenti (analisi completate, scadenze, ecc.)';
comment on function notify_analysis_completed() is 'Crea notifica quando analysis_requests.status diventa completed';

