-- Trading & Portfolio Migration
-- Crea tutte le tabelle per trading, portfolio, watchlist, journal
-- Version: 006
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
--
-- Set search_path for security
SET search_path = public;

-- ============================================================================
-- PORTFOLIO POSITIONS (Posizioni portfolio)
-- ============================================================================
CREATE TABLE IF NOT EXISTS portfolio_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255),
    quantity DECIMAL(18, 8) NOT NULL DEFAULT 0,
    average_price DECIMAL(18, 8) NOT NULL,
    current_price DECIMAL(18, 8),
    total_cost DECIMAL(18, 2) NOT NULL,
    current_value DECIMAL(18, 2),
    unrealized_pnl DECIMAL(18, 2),
    realized_pnl DECIMAL(18, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_user_id ON portfolio_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_asset_symbol ON portfolio_positions(asset_symbol);

-- RLS
ALTER TABLE portfolio_positions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own portfolio positions" ON portfolio_positions;

CREATE POLICY "Users can manage own portfolio positions"
    ON portfolio_positions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRADING JOURNAL (Journal trading)
-- ============================================================================
CREATE TABLE IF NOT EXISTS trading_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trade_date DATE NOT NULL,
    asset_symbol VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255),
    trade_type VARCHAR(20) NOT NULL CHECK (trade_type IN ('buy', 'sell', 'short', 'cover')),
    quantity DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    total_value DECIMAL(18, 2) NOT NULL,
    fees DECIMAL(18, 2) DEFAULT 0,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trading_journal_user_id ON trading_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_journal_trade_date ON trading_journal(trade_date DESC);
CREATE INDEX IF NOT EXISTS idx_trading_journal_asset_symbol ON trading_journal(asset_symbol);

-- RLS
ALTER TABLE trading_journal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own trading journal" ON trading_journal;

CREATE POLICY "Users can manage own trading journal"
    ON trading_journal FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- WATCHLIST (Watchlist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    asset_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, asset_symbol)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_asset_symbol ON watchlist(asset_symbol);

-- RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own watchlist" ON watchlist;

CREATE POLICY "Users can manage own watchlist"
    ON watchlist FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- WATCHLIST ALERTS (Alert watchlist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS watchlist_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percent_change', 'volume_spike')),
    target_value DECIMAL(18, 8),
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_user_id ON watchlist_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_asset_symbol ON watchlist_alerts(asset_symbol);
CREATE INDEX IF NOT EXISTS idx_watchlist_alerts_is_active ON watchlist_alerts(is_active);

-- RLS
ALTER TABLE watchlist_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own watchlist alerts" ON watchlist_alerts;

CREATE POLICY "Users can manage own watchlist alerts"
    ON watchlist_alerts FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- WATCHLIST ALERT HISTORY (Storia alert)
-- ============================================================================
CREATE TABLE IF NOT EXISTS watchlist_alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES watchlist_alerts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(20) NOT NULL,
    target_value DECIMAL(18, 8),
    actual_value DECIMAL(18, 8),
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_alert_history_alert_id ON watchlist_alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_alert_history_user_id ON watchlist_alert_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_alert_history_triggered_at ON watchlist_alert_history(triggered_at DESC);

-- RLS
ALTER TABLE watchlist_alert_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own alert history" ON watchlist_alert_history;

CREATE POLICY "Users can read own alert history"
    ON watchlist_alert_history FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================================================
-- EXPENSES (Spese)
-- ============================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    amount DECIMAL(18, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own expenses" ON expenses;

CREATE POLICY "Users can manage own expenses"
    ON expenses FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at on portfolio_positions
DROP TRIGGER IF EXISTS update_portfolio_positions_updated_at ON portfolio_positions;
CREATE TRIGGER update_portfolio_positions_updated_at
    BEFORE UPDATE ON portfolio_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on trading_journal
DROP TRIGGER IF EXISTS update_trading_journal_updated_at ON trading_journal;
CREATE TRIGGER update_trading_journal_updated_at
    BEFORE UPDATE ON trading_journal
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on watchlist_alerts
DROP TRIGGER IF EXISTS update_watchlist_alerts_updated_at ON watchlist_alerts;
CREATE TRIGGER update_watchlist_alerts_updated_at
    BEFORE UPDATE ON watchlist_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

