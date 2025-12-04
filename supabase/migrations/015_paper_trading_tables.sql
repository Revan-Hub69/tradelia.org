-- Paper Trading Tables - Tradelia
-- Best Practice: Database schema per paper trading con supporto gamification
-- References: Academic standards per trading simulation

-- Paper Trading Positions
CREATE TABLE IF NOT EXISTS paper_trading_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex', 'commodity')),
  side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
  quantity NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
  entry_price NUMERIC(18, 8) NOT NULL CHECK (entry_price > 0),
  current_price NUMERIC(18, 8) NOT NULL CHECK (current_price > 0),
  entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  strategy VARCHAR(100),
  notes TEXT,
  unrealized_pnl NUMERIC(18, 8) DEFAULT 0,
  unrealized_pnl_percent NUMERIC(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT paper_positions_user_symbol_unique UNIQUE (user_id, symbol, side, entry_time)
);

-- Paper Trading Orders
CREATE TABLE IF NOT EXISTS paper_trading_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex', 'commodity')),
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'trailing_stop')),
  side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
  limit_price NUMERIC(18, 8),
  stop_price NUMERIC(18, 8),
  trailing_stop_percent NUMERIC(5, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'expired')),
  execution_price NUMERIC(18, 8),
  execution_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paper Trading History (closed positions)
CREATE TABLE IF NOT EXISTS paper_trading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  asset_type VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  quantity NUMERIC(18, 8) NOT NULL,
  entry_price NUMERIC(18, 8) NOT NULL,
  exit_price NUMERIC(18, 8) NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ NOT NULL,
  realized_pnl NUMERIC(18, 8) NOT NULL,
  realized_pnl_percent NUMERIC(10, 4) NOT NULL,
  strategy VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paper Trading Stats (per gamification)
CREATE TABLE IF NOT EXISTS paper_trading_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  total_pnl NUMERIC(18, 8) DEFAULT 0,
  max_drawdown NUMERIC(10, 4) DEFAULT 0,
  sharpe_ratio NUMERIC(10, 4) DEFAULT 0,
  current_win_streak INTEGER DEFAULT 0,
  max_win_streak INTEGER DEFAULT 0,
  last_trade_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_paper_positions_user ON paper_trading_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_positions_symbol ON paper_trading_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_orders_user ON paper_trading_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_orders_status ON paper_trading_orders(status);
CREATE INDEX IF NOT EXISTS idx_paper_orders_symbol ON paper_trading_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_paper_history_user ON paper_trading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_paper_history_exit_time ON paper_trading_history(exit_time);

-- RLS (Row Level Security)
ALTER TABLE paper_trading_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_stats ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view own positions"
  ON paper_trading_positions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own positions"
  ON paper_trading_positions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own positions"
  ON paper_trading_positions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own positions"
  ON paper_trading_positions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders"
  ON paper_trading_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON paper_trading_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON paper_trading_orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own history"
  ON paper_trading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON paper_trading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own stats"
  ON paper_trading_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON paper_trading_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update stats when position closed
CREATE OR REPLACE FUNCTION update_paper_trading_stats()
RETURNS TRIGGER AS $$
DECLARE
  is_win BOOLEAN;
  current_streak INTEGER;
BEGIN
  -- Check if position was closed (moved to history)
  IF TG_OP = 'DELETE' THEN
    -- Position was closed, stats will be updated by API
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_paper_positions_updated_at
  BEFORE UPDATE ON paper_trading_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paper_orders_updated_at
  BEFORE UPDATE ON paper_trading_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paper_stats_updated_at
  BEFORE UPDATE ON paper_trading_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments per documentazione accademica
COMMENT ON TABLE paper_trading_positions IS 'Paper trading positions - Simulated trading positions using real prices. Educational purpose only.';
COMMENT ON TABLE paper_trading_orders IS 'Paper trading orders - Advanced order types (limit, stop, trailing stop) for paper trading simulation.';
COMMENT ON TABLE paper_trading_history IS 'Paper trading history - Closed positions for performance analysis and gamification.';
COMMENT ON TABLE paper_trading_stats IS 'Paper trading statistics - Aggregated stats for gamification and achievement tracking.';
