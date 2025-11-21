-- ============================================
-- PUSH SUBSCRIPTIONS SCHEMA
-- ============================================
-- Tabella per salvare le subscription push notifications
-- ============================================

create table if not exists public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  subscription jsonb not null,
  endpoint text generated always as (subscription->>'endpoint') stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, endpoint)
);

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);
create index if not exists idx_push_subscriptions_endpoint on public.push_subscriptions(endpoint);

create trigger push_subscriptions_set_timestamp
before update on public.push_subscriptions
for each row execute procedure public.moddatetime();

-- ===== ROW LEVEL SECURITY =====
alter table public.push_subscriptions enable row level security;

-- Policy: Gli utenti possono vedere solo le proprie subscription
create policy "Users can view own push subscriptions"
on public.push_subscriptions
for select
using (auth.uid() = user_id);

-- Policy: Gli utenti possono inserire solo le proprie subscription
create policy "Users can insert own push subscriptions"
on public.push_subscriptions
for insert
with check (auth.uid() = user_id);

-- Policy: Gli utenti possono aggiornare solo le proprie subscription
create policy "Users can update own push subscriptions"
on public.push_subscriptions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Policy: Gli utenti possono eliminare solo le proprie subscription
create policy "Users can delete own push subscriptions"
on public.push_subscriptions
for delete
using (auth.uid() = user_id);

