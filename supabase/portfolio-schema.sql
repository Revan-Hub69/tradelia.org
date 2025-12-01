-- ============================================
-- PORTFOLIO POSITIONS SCHEMA
-- ============================================
-- Sistema completo per gestione portfolio
-- ============================================

-- Tabella posizioni portfolio
create table if not exists public.portfolio_positions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  
  -- Asset Info
  symbol text not null,
  quantity numeric not null check (quantity > 0),
  price numeric not null check (price > 0),
  total_value numeric not null, -- quantity * price (calcolato)
  
  -- Current Market Data (aggiornato via real-time)
  current_price numeric,
  current_value numeric, -- quantity * current_price
  change_amount numeric default 0, -- current_value - total_value
  change_percent numeric default 0, -- (change_amount / total_value) * 100
  
  -- Metadata
  notes text,
  tags text[],
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Unique constraint: un utente può avere più posizioni dello stesso simbolo
  -- (per tracking di acquisti multipli)
);

create index idx_portfolio_positions_user on public.portfolio_positions(user_id, created_at desc);
create index idx_portfolio_positions_symbol on public.portfolio_positions(symbol);

-- RLS Policies
alter table public.portfolio_positions enable row level security;

-- Policy: Users can view only their own positions
drop policy if exists "Users can view own positions" on public.portfolio_positions;
create policy "Users can view own positions"
  on public.portfolio_positions for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own positions
drop policy if exists "Users can insert own positions" on public.portfolio_positions;
create policy "Users can insert own positions"
  on public.portfolio_positions for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own positions
drop policy if exists "Users can update own positions" on public.portfolio_positions;
create policy "Users can update own positions"
  on public.portfolio_positions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own positions
drop policy if exists "Users can delete own positions" on public.portfolio_positions;
create policy "Users can delete own positions"
  on public.portfolio_positions for delete
  using (auth.uid() = user_id);

-- Trigger per updated_at
create or replace function update_portfolio_positions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_portfolio_positions_updated_at on public.portfolio_positions;
create trigger update_portfolio_positions_updated_at
  before update on public.portfolio_positions
  for each row
  execute function update_portfolio_positions_updated_at();

