-- ============================================
-- USER NOTIFICATION PREFERENCES SCHEMA
-- ============================================
-- Tabella per salvare preferenze notifiche (SMS/WhatsApp) per utenti Pro
-- ============================================

create table if not exists public.user_notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  notification_method text check (notification_method in ('email', 'sms', 'whatsapp')) default 'email',
  phone_number text, -- Numero per SMS/WhatsApp (formato internazionale: +39...)
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

create index if not exists idx_user_notification_preferences_user on public.user_notification_preferences(user_id);
create index if not exists idx_user_notification_preferences_method on public.user_notification_preferences(notification_method);

create trigger user_notification_preferences_set_timestamp
before update on public.user_notification_preferences
for each row execute procedure public.moddatetime();

-- ===== ROW LEVEL SECURITY =====
alter table public.user_notification_preferences enable row level security;

-- Policy: Gli utenti possono vedere solo le proprie preferenze
create policy "Users can view own notification preferences"
on public.user_notification_preferences
for select
using (auth.uid() = user_id);

-- Policy: Gli utenti possono inserire solo le proprie preferenze
create policy "Users can insert own notification preferences"
on public.user_notification_preferences
for insert
with check (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare solo le proprie preferenze
create policy "Users can update own notification preferences"
on public.user_notification_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Gli utenti possono eliminare solo le proprie preferenze
create policy "Users can delete own notification preferences"
on public.user_notification_preferences
for delete
using (auth.uid() = user_id);

