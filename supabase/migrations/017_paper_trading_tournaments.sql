-- Paper Trading Tournaments - Tradelia
-- Best Practice: Tournament system per paper trading con regole professionali
-- Academic references: Competitive trading analysis, leaderboard systems

-- Tournament Types
CREATE TYPE tournament_format AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE tournament_status AS ENUM ('draft', 'open_registration', 'in_progress', 'completed', 'cancelled');
CREATE TYPE tournament_rule_type AS ENUM (
  'min_trades', 'max_drawdown', 'min_sharpe', 'min_win_rate', 
  'max_position_size', 'min_daily_trades', 'max_leverage', 'min_sharpe_consistency'
);

-- Tournaments
CREATE TABLE IF NOT EXISTS paper_trading_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  format tournament_format NOT NULL DEFAULT 'weekly',
  status tournament_status NOT NULL DEFAULT 'draft',
  
  -- Timing
  registration_start TIMESTAMPTZ NOT NULL,
  registration_end TIMESTAMPTZ NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Rules & Settings
  initial_capital NUMERIC(18, 8) NOT NULL DEFAULT 10000,
  max_leverage NUMERIC(5, 2) DEFAULT 2.0,
  max_position_size_percent NUMERIC(5, 2) DEFAULT 20.0,
  min_trades_required INTEGER DEFAULT 5,
  
  -- Scoring Rules (professional metrics)
  scoring_method VARCHAR(50) NOT NULL DEFAULT 'sharpe_ratio', -- sharpe_ratio, total_return, calmar_ratio, composite
  min_sharpe_ratio NUMERIC(10, 4) DEFAULT 0.5,
  max_drawdown_limit NUMERIC(5, 2) DEFAULT 20.0,
  min_win_rate NUMERIC(5, 2) DEFAULT 40.0,
  
  -- Eligibility
  min_level INTEGER DEFAULT 1, -- Minimum user level to participate
  require_pro BOOLEAN DEFAULT false,
  max_participants INTEGER,
  
  -- Prizes & Rewards
  prize_pool_xp INTEGER DEFAULT 0,
  prize_achievements TEXT[], -- Array of achievement IDs
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_tournament_dates CHECK (registration_start < registration_end AND registration_end < start_date AND start_date < end_date),
  CONSTRAINT valid_capital CHECK (initial_capital > 0),
  CONSTRAINT valid_leverage CHECK (max_leverage > 0 AND max_leverage <= 10)
);

-- Tournament Rules (detailed rules per tournament)
CREATE TABLE IF NOT EXISTS paper_trading_tournament_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES paper_trading_tournaments(id) ON DELETE CASCADE,
  rule_type tournament_rule_type NOT NULL,
  rule_value NUMERIC(18, 8) NOT NULL,
  rule_description TEXT,
  is_required BOOLEAN DEFAULT true,
  violation_penalty VARCHAR(50) DEFAULT 'disqualification', -- disqualification, score_penalty, warning
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(tournament_id, rule_type)
);

-- Tournament Participants
CREATE TABLE IF NOT EXISTS paper_trading_tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES paper_trading_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tournament-specific portfolio
  initial_capital NUMERIC(18, 8) NOT NULL,
  current_equity NUMERIC(18, 8) NOT NULL,
  total_pnl NUMERIC(18, 8) DEFAULT 0,
  total_return_percent NUMERIC(10, 4) DEFAULT 0,
  
  -- Performance Metrics (updated during tournament)
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate NUMERIC(5, 2) DEFAULT 0,
  sharpe_ratio NUMERIC(10, 4) DEFAULT 0,
  max_drawdown NUMERIC(10, 4) DEFAULT 0,
  calmar_ratio NUMERIC(10, 4) DEFAULT 0,
  profit_factor NUMERIC(10, 4) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_disqualified BOOLEAN DEFAULT false,
  disqualification_reason TEXT,
  disqualified_at TIMESTAMPTZ,
  
  -- Ranking
  current_rank INTEGER,
  final_rank INTEGER,
  score NUMERIC(18, 8) DEFAULT 0, -- Composite score based on scoring_method
  
  -- Timestamps
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(tournament_id, user_id)
);

-- Tournament Leaderboard (snapshot for performance)
CREATE TABLE IF NOT EXISTS paper_trading_tournament_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES paper_trading_tournaments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES paper_trading_tournament_participants(id) ON DELETE CASCADE,
  
  -- Snapshot metrics
  rank INTEGER NOT NULL,
  score NUMERIC(18, 8) NOT NULL,
  total_return NUMERIC(10, 4) NOT NULL,
  sharpe_ratio NUMERIC(10, 4),
  max_drawdown NUMERIC(10, 4),
  win_rate NUMERIC(5, 2),
  
  -- Snapshot timestamp
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(tournament_id, participant_id, snapshot_at)
);

-- Tournament Positions (isolated from regular paper trading)
CREATE TABLE IF NOT EXISTS paper_trading_tournament_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES paper_trading_tournaments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES paper_trading_tournament_participants(id) ON DELETE CASCADE,
  
  symbol VARCHAR(20) NOT NULL,
  asset_type VARCHAR(20) NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'forex', 'commodity')),
  side VARCHAR(10) NOT NULL CHECK (side IN ('long', 'short')),
  quantity NUMERIC(18, 8) NOT NULL CHECK (quantity > 0),
  entry_price NUMERIC(18, 8) NOT NULL CHECK (entry_price > 0),
  current_price NUMERIC(18, 8) NOT NULL CHECK (current_price > 0),
  entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  strategy VARCHAR(100),
  unrealized_pnl NUMERIC(18, 8) DEFAULT 0,
  unrealized_pnl_percent NUMERIC(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tournament History (closed positions in tournament)
CREATE TABLE IF NOT EXISTS paper_trading_tournament_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES paper_trading_tournaments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES paper_trading_tournament_participants(id) ON DELETE CASCADE,
  
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON paper_trading_tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_dates ON paper_trading_tournaments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament ON paper_trading_tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user ON paper_trading_tournament_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_rank ON paper_trading_tournament_participants(tournament_id, current_rank);
CREATE INDEX IF NOT EXISTS idx_tournament_leaderboard_tournament ON paper_trading_tournament_leaderboard(tournament_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_positions_tournament ON paper_trading_tournament_positions(tournament_id, participant_id);
CREATE INDEX IF NOT EXISTS idx_tournament_history_tournament ON paper_trading_tournament_history(tournament_id, participant_id);

-- RLS (Row Level Security)
ALTER TABLE paper_trading_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_tournament_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_tournament_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_tournament_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trading_tournament_history ENABLE ROW LEVEL SECURITY;

-- Policies: Tournaments
CREATE POLICY "Anyone can view active tournaments"
  ON paper_trading_tournaments FOR SELECT
  USING (status IN ('open_registration', 'in_progress', 'completed'));

CREATE POLICY "Admins can manage tournaments"
  ON paper_trading_tournaments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policies: Participants
CREATE POLICY "Users can view own participation"
  ON paper_trading_tournament_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view tournament participants (public leaderboard)"
  ON paper_trading_tournament_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM paper_trading_tournaments
      WHERE paper_trading_tournaments.id = tournament_id
      AND paper_trading_tournaments.status IN ('in_progress', 'completed')
    )
  );

CREATE POLICY "Users can register for tournaments"
  ON paper_trading_tournament_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM paper_trading_tournaments
      WHERE paper_trading_tournaments.id = tournament_id
      AND paper_trading_tournaments.status = 'open_registration'
      AND NOW() BETWEEN paper_trading_tournaments.registration_start AND paper_trading_tournaments.registration_end
    )
  );

-- Policies: Leaderboard (public during tournament)
CREATE POLICY "Anyone can view tournament leaderboard"
  ON paper_trading_tournament_leaderboard FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM paper_trading_tournaments
      WHERE paper_trading_tournaments.id = tournament_id
      AND paper_trading_tournaments.status IN ('in_progress', 'completed')
    )
  );

-- Policies: Positions & History (own data only)
CREATE POLICY "Users can manage own tournament positions"
  ON paper_trading_tournament_positions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM paper_trading_tournament_participants
      WHERE paper_trading_tournament_participants.id = participant_id
      AND paper_trading_tournament_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own tournament history"
  ON paper_trading_tournament_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM paper_trading_tournament_participants
      WHERE paper_trading_tournament_participants.id = participant_id
      AND paper_trading_tournament_participants.user_id = auth.uid()
    )
  );

-- Triggers
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON paper_trading_tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_participants_updated_at
  BEFORE UPDATE ON paper_trading_tournament_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_positions_updated_at
  BEFORE UPDATE ON paper_trading_tournament_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate tournament score
CREATE OR REPLACE FUNCTION calculate_tournament_score(
  p_tournament_id UUID,
  p_participant_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  v_scoring_method VARCHAR(50);
  v_total_return NUMERIC;
  v_sharpe_ratio NUMERIC;
  v_calmar_ratio NUMERIC;
  v_max_drawdown NUMERIC;
  v_score NUMERIC;
BEGIN
  -- Get tournament scoring method
  SELECT scoring_method INTO v_scoring_method
  FROM paper_trading_tournaments
  WHERE id = p_tournament_id;

  -- Get participant metrics
  SELECT 
    total_return_percent,
    sharpe_ratio,
    calmar_ratio,
    max_drawdown
  INTO 
    v_total_return,
    v_sharpe_ratio,
    v_calmar_ratio,
    v_max_drawdown
  FROM paper_trading_tournament_participants
  WHERE id = p_participant_id;

  -- Calculate score based on method
  CASE v_scoring_method
    WHEN 'sharpe_ratio' THEN
      v_score := COALESCE(v_sharpe_ratio, 0);
    WHEN 'total_return' THEN
      v_score := COALESCE(v_total_return, 0);
    WHEN 'calmar_ratio' THEN
      v_score := COALESCE(v_calmar_ratio, 0);
    WHEN 'composite' THEN
      -- Composite: 40% Sharpe, 30% Return, 20% Calmar, 10% Drawdown (inverse)
      v_score := 
        (COALESCE(v_sharpe_ratio, 0) * 0.4) +
        (COALESCE(v_total_return, 0) / 100 * 0.3) +
        (COALESCE(v_calmar_ratio, 0) * 0.2) +
        ((100 - COALESCE(v_max_drawdown, 100)) / 100 * 0.1);
    ELSE
      v_score := 0;
  END CASE;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update tournament rankings
CREATE OR REPLACE FUNCTION update_tournament_rankings(p_tournament_id UUID)
RETURNS void AS $$
BEGIN
  -- Update scores
  UPDATE paper_trading_tournament_participants
  SET score = calculate_tournament_score(p_tournament_id, id)
  WHERE tournament_id = p_tournament_id
  AND is_active = true
  AND is_disqualified = false;

  -- Update rankings
  WITH ranked AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, total_return_percent DESC) as new_rank
    FROM paper_trading_tournament_participants
    WHERE tournament_id = p_tournament_id
    AND is_active = true
    AND is_disqualified = false
  )
  UPDATE paper_trading_tournament_participants p
  SET current_rank = r.new_rank
  FROM ranked r
  WHERE p.id = r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments per documentazione accademica
COMMENT ON TABLE paper_trading_tournaments IS 'Paper trading tournaments - Competitive trading competitions with professional rules and scoring.';
COMMENT ON TABLE paper_trading_tournament_rules IS 'Detailed tournament rules - Professional constraints and requirements per tournament.';
COMMENT ON TABLE paper_trading_tournament_participants IS 'Tournament participants - Isolated portfolios and performance metrics per tournament.';
COMMENT ON TABLE paper_trading_tournament_leaderboard IS 'Tournament leaderboard snapshots - Historical ranking data for analysis.';
COMMENT ON FUNCTION calculate_tournament_score IS 'Calculate tournament score based on professional metrics (Sharpe, Return, Calmar, Composite).';
COMMENT ON FUNCTION update_tournament_rankings IS 'Update tournament rankings based on current scores and performance metrics.';
