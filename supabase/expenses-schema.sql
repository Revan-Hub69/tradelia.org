-- ============================================
-- EXPENSES TRACKER SCHEMA
-- ============================================
-- Sistema per tracciare spese personali
-- 100% GRATIS - Solo database Supabase Free
-- ============================================

-- ===============================
-- TABELLA EXPENSES
-- ===============================

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  
  -- Spesa Info
  amount numeric not null check (amount > 0),
  category text not null check (category in (
    'food',           -- Cibo
    'transport',      -- Trasporti
    'shopping',       -- Shopping
    'bills',          -- Bollette
    'entertainment',  -- Intrattenimento
    'health',         -- Salute
    'education',      -- Educazione
    'travel',         -- Viaggi
    'other'           -- Altro
  )),
  description text,
  date date not null default current_date,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_expenses_user on public.expenses(user_id, date desc);
create index idx_expenses_month on public.expenses(user_id, date);
create index idx_expenses_category on public.expenses(user_id, category);

-- Trigger per updated_at
create trigger expenses_set_timestamp
before update on public.expenses
for each row execute procedure public.moddatetime(updated_at);

-- ===============================
-- RLS POLICIES
-- ===============================

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Admin può vedere tutto
create policy "Admins can view all expenses"
  on public.expenses for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Commenti
comment on table public.expenses is 'Spese personali degli utenti';
comment on column public.expenses.category is 'Categoria spesa: food, transport, shopping, bills, entertainment, health, education, travel, other';

