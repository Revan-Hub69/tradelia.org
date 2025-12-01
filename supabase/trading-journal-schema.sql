-- ============================================
-- TRADING JOURNAL SCHEMA
-- ============================================
-- Sistema completo per journal trading
-- ============================================

-- Tabella trade entries
create table if not exists public.trading_journal (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  
  -- Trade Info
  symbol text not null,
  trade_type text not null check (trade_type in ('buy', 'sell', 'long', 'short')),
  entry_date timestamptz not null,
  exit_date timestamptz,
  
  -- Prices
  entry_price numeric not null check (entry_price > 0),
  exit_price numeric check (exit_price > 0),
  quantity numeric not null check (quantity > 0),
  
  -- P&L
  profit_loss numeric, -- Calcolato: (exit_price - entry_price) * quantity per long, (entry_price - exit_price) * quantity per short
  profit_loss_percent numeric, -- Calcolato: ((exit_price - entry_price) / entry_price) * 100
  
  -- Fees & Costs
  entry_fee numeric default 0,
  exit_fee numeric default 0,
  total_fees numeric default 0, -- entry_fee + exit_fee
  
  -- Trade Analysis
  strategy text, -- Nome strategia utilizzata
  setup_type text, -- Tipo di setup (es. breakout, pullback, reversal)
  timeframe text, -- Timeframe principale (es. 1h, 4h, daily)
  
  -- Psychology & Notes
  entry_reason text, -- Perché è entrato
  exit_reason text, -- Perché è uscito
  notes text, -- Note generali
  emotions text, -- Emozioni durante il trade (es. confident, anxious, greedy)
  
  -- Performance Metrics
  risk_reward_ratio numeric, -- Risk/Reward ratio calcolato
  max_drawdown numeric, -- Massimo drawdown durante il trade
  holding_period_days integer, -- Giorni di detenzione
  
  -- Tags & Categories
  tags text[],
  category text, -- Categoria trade (es. swing, day, scalping)
  
  -- Status
  is_closed boolean not null default false,
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_trading_journal_user on public.trading_journal(user_id, entry_date desc);
create index idx_trading_journal_symbol on public.trading_journal(symbol);
create index idx_trading_journal_closed on public.trading_journal(user_id, is_closed) where is_closed = true;

-- RLS Policies
alter table public.trading_journal enable row level security;

-- Policy: Users can view only their own trades
drop policy if exists "Users can view own trades" on public.trading_journal;
create policy "Users can view own trades"
  on public.trading_journal for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own trades
drop policy if exists "Users can insert own trades" on public.trading_journal;
create policy "Users can insert own trades"
  on public.trading_journal for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own trades
drop policy if exists "Users can update own trades" on public.trading_journal;
create policy "Users can update own trades"
  on public.trading_journal for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own trades
drop policy if exists "Users can delete own trades" on public.trading_journal;
create policy "Users can delete own trades"
  on public.trading_journal for delete
  using (auth.uid() = user_id);

-- Trigger per updated_at
create or replace function update_trading_journal_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_trading_journal_updated_at on public.trading_journal;
create trigger update_trading_journal_updated_at
  before update on public.trading_journal
  for each row
  execute function update_trading_journal_updated_at();

-- Function per calcolare P&L automaticamente
create or replace function calculate_trade_pnl()
returns trigger as $$
begin
  -- Calcola P&L solo se exit_price è presente
  if new.exit_price is not null and new.entry_price is not null and new.quantity > 0 then
    if new.trade_type in ('buy', 'long') then
      -- Long: profit = (exit - entry) * quantity
      new.profit_loss := (new.exit_price - new.entry_price) * new.quantity;
      new.profit_loss_percent := ((new.exit_price - new.entry_price) / new.entry_price) * 100;
    elsif new.trade_type in ('sell', 'short') then
      -- Short: profit = (entry - exit) * quantity
      new.profit_loss := (new.entry_price - new.exit_price) * new.quantity;
      new.profit_loss_percent := ((new.entry_price - new.exit_price) / new.entry_price) * 100;
    end if;
    
    -- Calcola total fees
    new.total_fees := coalesce(new.entry_fee, 0) + coalesce(new.exit_fee, 0);
    
    -- Sottrai fees dal P&L
    new.profit_loss := new.profit_loss - new.total_fees;
    
    -- Calcola holding period
    if new.exit_date is not null then
      new.holding_period_days := extract(day from (new.exit_date - new.entry_date));
    end if;
    
    -- Marca come chiuso se exit_price presente
    new.is_closed := true;
  end if;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists calculate_trade_pnl_trigger on public.trading_journal;
create trigger calculate_trade_pnl_trigger
  before insert or update on public.trading_journal
  for each row
  execute function calculate_trade_pnl();

