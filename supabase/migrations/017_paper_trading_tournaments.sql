-- Paper Trading Tournaments - Tradelia
-- Best Practice: Tournament system per paper trading con regole professionali
-- Academic references: Competitive trading analysis, leaderboard systems

-- Tournament Types
CREATE TYPE tournament_format AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE tournament_status AS ENUM ('draft', 'open_registration', 'in_progress', 'completed', 'cancelled');
CREATE TYPE tournament_prize_type AS ENUM ('pro_access', 'desk_access', 'xp_pool', 'achievement', 'custom');
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
  
  -- Entry Fee (XP cost to participate)
  entry_fee_xp INTEGER DEFAULT 0,
  
  -- Prizes & Rewards
  prize_type tournament_prize_type NOT NULL DEFAULT 'xp_pool',
  prize_pro_access_duration_days INTEGER, -- Days of Pro access (if prize_type = 'pro_access')
  prize_desk_access_duration_days INTEGER, -- Days of Desk access (if prize_type = 'desk_access')
  prize_pool_xp INTEGER DEFAULT 0, -- XP pool to distribute (if prize_type = 'xp_pool')
  prize_achievements TEXT[], -- Array of achievement IDs (if prize_type = 'achievement')
  prize_custom_description TEXT, -- Custom prize description (if prize_type = 'custom')
  
  -- Prize Distribution (top N winners get prizes)
  prize_top_n INTEGER DEFAULT 10, -- Top N participants get prizes
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_tournament_dates CHECK (registration_start < registration_end AND registration_end < start_date AND start_date < end_date),
  CONSTRAINT valid_capital CHECK (initial_capital > 0),
  CONSTRAINT valid_leverage CHECK (max_leverage > 0 AND max_leverage <= 10),
  CONSTRAINT valid_entry_fee CHECK (entry_fee_xp >= 0),
  CONSTRAINT valid_prize_top_n CHECK (prize_top_n > 0)
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
  
  -- Entry fee payment
  entry_fee_paid BOOLEAN DEFAULT false,
  entry_fee_xp_amount INTEGER DEFAULT 0,
  entry_fee_paid_at TIMESTAMPTZ,
  
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
  
  -- Prize
  prize_awarded BOOLEAN DEFAULT false,
  prize_type tournament_prize_type,
  prize_details JSONB, -- Store prize details (duration, amount, etc.)
  prize_awarded_at TIMESTAMPTZ,
  
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

-- Tournament Templates (predefined tournament types)
CREATE TABLE IF NOT EXISTS paper_trading_tournament_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  format tournament_format NOT NULL,
  
  -- Default settings
  default_initial_capital NUMERIC(18, 8) DEFAULT 10000,
  default_max_leverage NUMERIC(5, 2) DEFAULT 2.0,
  default_max_position_size_percent NUMERIC(5, 2) DEFAULT 20.0,
  default_min_trades_required INTEGER DEFAULT 5,
  default_scoring_method VARCHAR(50) DEFAULT 'sharpe_ratio',
  default_min_sharpe_ratio NUMERIC(10, 4) DEFAULT 0.5,
  default_max_drawdown_limit NUMERIC(5, 2) DEFAULT 20.0,
  default_min_win_rate NUMERIC(5, 2) DEFAULT 40.0,
  
  -- Default entry fee
  default_entry_fee_xp INTEGER DEFAULT 50,
  
  -- Default prize
  default_prize_type tournament_prize_type DEFAULT 'pro_access',
  default_prize_pro_access_days INTEGER DEFAULT 30,
  default_prize_desk_access_days INTEGER DEFAULT 7,
  default_prize_pool_xp INTEGER DEFAULT 500,
  default_prize_top_n INTEGER DEFAULT 10,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert predefined tournament templates
INSERT INTO paper_trading_tournament_templates (
  name, description, format,
  default_initial_capital, default_max_leverage, default_max_position_size_percent,
  default_min_trades_required, default_scoring_method, default_min_sharpe_ratio,
  default_max_drawdown_limit, default_min_win_rate,
  default_entry_fee_xp, default_prize_type, default_prize_pro_access_days, default_prize_top_n
) VALUES
  -- Daily Quick Tournament
  (
    'Daily Quick',
    'Torneo giornaliero veloce - 24 ore di trading intensivo',
    'daily',
    5000, 2.0, 15.0,
    3, 'total_return', 0.3,
    15.0, 35.0,
    25, 'pro_access', 7, 5
  ),
  -- Weekly Standard Tournament
  (
    'Weekly Standard',
    'Torneo settimanale standard - 7 giorni con regole professionali',
    'weekly',
    10000, 2.0, 20.0,
    5, 'sharpe_ratio', 0.5,
    20.0, 40.0,
    50, 'pro_access', 30, 10
  ),
  -- Monthly Professional Tournament
  (
    'Monthly Professional',
    'Torneo mensile professionale - 30 giorni con metriche avanzate',
    'monthly',
    20000, 2.0, 20.0,
    10, 'composite', 0.7,
    15.0, 45.0,
    100, 'desk_access', 14, 10
  ),
  -- Elite Tournament (High Stakes)
  (
    'Elite Championship',
    'Campionato Elite - Torneo premium con accesso Desk per i vincitori',
    'monthly',
    50000, 1.5, 15.0,
    20, 'composite', 1.0,
    10.0, 50.0,
    200, 'desk_access', 30, 5
  ),
  -- Beginner Friendly Tournament
  (
    'Beginner Friendly',
    'Torneo per principianti - Regole semplici e premi XP',
    'weekly',
    5000, 1.0, 25.0,
    2, 'total_return', 0.0,
    25.0, 30.0,
    10, 'xp_pool', 0, 10
  ),
  -- Risk Management Tournament
  (
    'Risk Management Master',
    'Torneo focalizzato sulla gestione del rischio - Max drawdown limitato',
    'weekly',
    10000, 1.5, 15.0,
    8, 'calmar_ratio', 0.6,
    10.0, 40.0,
    75, 'pro_access', 21, 8
  ),
  -- Sharpe Ratio Tournament
  (
    'Sharpe Ratio Challenge',
    'Sfida Sharpe Ratio - Vince chi ha il miglior Sharpe Ratio',
    'weekly',
    10000, 2.0, 20.0,
    5, 'sharpe_ratio', 0.5,
    20.0, 40.0,
    60, 'pro_access', 14, 10
  ),
  -- World Trading Championship Style
  (
    'World Trading Championship',
    'Campionato Mondiale - Formato ispirato al World Cup Trading Championship',
    'monthly',
    100000, 2.0, 15.0,
    25, 'composite', 1.2,
    12.0, 50.0,
    300, 'desk_access', 60, 10
  ),
  -- Top Trader Championship
  (
    'Top Trader Championship',
    'Campionato Top Trader - Formato ispirato a competizioni internazionali',
    'monthly',
    50000, 1.5, 18.0,
    15, 'sharpe_ratio', 0.8,
    15.0, 45.0,
    200, 'desk_access', 30, 10
  ),
  -- Futures Trading Championship Style
  (
    'Futures Trading Championship',
    'Campionato Futures - Formato ispirato al Robbins World Cup',
    'monthly',
    100000, 2.0, 20.0,
    20, 'total_return', 0.0,
    20.0, 40.0,
    250, 'desk_access', 45, 10
  ),
  -- US Investing Championship Style
  (
    'US Investing Championship',
    'Campionato US Investing - Formato ispirato al US Investing Championship',
    'monthly',
    500000, 1.0, 10.0,
    30, 'total_return', 0.0,
    10.0, 50.0,
    500, 'desk_access', 90, 5
  ),
  -- Daily Trading Challenge
  (
    'Daily Trading Challenge',
    'Sfida Giornaliera - Trading intensivo 24h',
    'daily',
    10000, 2.5, 25.0,
    5, 'total_return', 0.0,
    25.0, 35.0,
    30, 'pro_access', 3, 10
  ),
  -- Weekly Momentum Challenge
  (
    'Weekly Momentum Challenge',
    'Sfida Momentum Settimanale - Focus su strategie momentum',
    'weekly',
    15000, 2.0, 22.0,
    8, 'calmar_ratio', 0.6,
    18.0, 42.0,
    80, 'pro_access', 21, 8
  ),
  -- Monthly Consistency Challenge
  (
    'Monthly Consistency Challenge',
    'Sfida Consistenza Mensile - Focus su win rate e drawdown',
    'monthly',
    25000, 1.5, 15.0,
    12, 'composite', 0.7,
    12.0, 48.0,
    150, 'pro_access', 45, 10
  ),
  -- High Frequency Trading Challenge
  (
    'High Frequency Challenge',
    'Sfida High Frequency - Minimo 20 trade, focus su frequenza',
    'weekly',
    20000, 2.0, 15.0,
    20, 'sharpe_ratio', 0.6,
    15.0, 40.0,
    100, 'pro_access', 14, 10
  ),
  -- Swing Trading Championship
  (
    'Swing Trading Championship',
    'Campionato Swing Trading - Focus su posizioni a medio termine',
    'monthly',
    30000, 1.0, 25.0,
    8, 'calmar_ratio', 0.8,
    20.0, 45.0,
    120, 'pro_access', 30, 8
  ),
  -- Crypto Trading Championship
  (
    'Crypto Trading Championship',
    'Campionato Crypto - Focus su criptovalute, volatilità alta',
    'weekly',
    20000, 3.0, 20.0,
    10, 'sharpe_ratio', 0.5,
    30.0, 35.0,
    90, 'pro_access', 21, 10
  ),
  -- Forex Trading Championship
  (
    'Forex Trading Championship',
    'Campionato Forex - Focus su coppie valutarie',
    'weekly',
    50000, 5.0, 15.0,
    12, 'composite', 0.6,
    15.0, 40.0,
    110, 'pro_access', 14, 10
  ),
  -- Stock Picking Championship
  (
    'Stock Picking Championship',
    'Campionato Stock Picking - Focus su selezione azioni',
    'monthly',
    100000, 1.0, 30.0,
    15, 'total_return', 0.0,
    25.0, 40.0,
    180, 'desk_access', 30, 10
  ),
  -- Options Trading Championship
  (
    'Options Trading Championship',
    'Campionato Options - Focus su strategie opzioni',
    'monthly',
    50000, 1.0, 20.0,
    10, 'sharpe_ratio', 0.7,
    20.0, 45.0,
    200, 'desk_access', 21, 8
  ),
  -- Risk-Free Championship
  (
    'Risk-Free Championship',
    'Campionato Risk-Free - Max drawdown limitato al 5%',
    'monthly',
    100000, 1.0, 10.0,
    20, 'calmar_ratio', 1.0,
    5.0, 50.0,
    400, 'desk_access', 60, 5
  ),
  -- Speed Trading Challenge
  (
    'Speed Trading Challenge',
    'Sfida Speed Trading - Minimo 50 trade in 7 giorni',
    'weekly',
    10000, 2.0, 10.0,
    50, 'total_return', 0.0,
    20.0, 30.0,
    70, 'pro_access', 7, 15
  ),
  -- Beginner Bootcamp
  (
    'Beginner Bootcamp',
    'Bootcamp Principianti - Torneo educativo con regole semplici',
    'weekly',
    3000, 1.0, 30.0,
    1, 'total_return', 0.0,
    30.0, 25.0,
    5, 'xp_pool', 0, 20
  ),
  -- Intermediate Challenge
  (
    'Intermediate Challenge',
    'Sfida Intermedia - Per trader con esperienza base',
    'weekly',
    7500, 1.5, 25.0,
    3, 'sharpe_ratio', 0.3,
    25.0, 35.0,
    20, 'pro_access', 7, 15
  ),
  -- Advanced Masters
  (
    'Advanced Masters',
    'Masters Avanzati - Per trader esperti',
    'monthly',
    75000, 1.5, 12.0,
    25, 'composite', 1.0,
    10.0, 50.0,
    350, 'desk_access', 45, 5
  ),
  -- Grand Prix Trading
  (
    'Grand Prix Trading',
    'Grand Prix Trading - Formato ispirato a competizioni automobilistiche',
    'monthly',
    200000, 1.0, 8.0,
    40, 'composite', 1.5,
    8.0, 55.0,
    600, 'desk_access', 90, 3
  )
ON CONFLICT (name) DO NOTHING;

-- RLS for templates
ALTER TABLE paper_trading_tournament_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates"
  ON paper_trading_tournament_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON paper_trading_tournament_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Function to award tournament prizes
CREATE OR REPLACE FUNCTION award_tournament_prizes(p_tournament_id UUID)
RETURNS void AS $$
DECLARE
  v_tournament RECORD;
  v_participant RECORD;
  v_rank INTEGER;
  v_prize_type tournament_prize_type;
  v_pro_days INTEGER;
  v_desk_days INTEGER;
  v_xp_amount INTEGER;
  v_user_profile RECORD;
BEGIN
  -- Get tournament details
  SELECT * INTO v_tournament
  FROM paper_trading_tournaments
  WHERE id = p_tournament_id;

  IF NOT FOUND OR v_tournament.status != 'completed' THEN
    RETURN;
  END IF;

  v_prize_type := v_tournament.prize_type;
  v_pro_days := v_tournament.prize_pro_access_duration_days;
  v_desk_days := v_tournament.prize_desk_access_duration_days;
  v_xp_amount := v_tournament.prize_pool_xp;

  -- Award prizes to top N participants
  FOR v_participant IN
    SELECT *
    FROM paper_trading_tournament_participants
    WHERE tournament_id = p_tournament_id
    AND is_active = true
    AND is_disqualified = false
    AND final_rank IS NOT NULL
    AND final_rank <= v_tournament.prize_top_n
    ORDER BY final_rank ASC
  LOOP
    -- Skip if already awarded
    IF v_participant.prize_awarded THEN
      CONTINUE;
    END IF;

    -- Award based on prize type
    CASE v_prize_type
      WHEN 'pro_access' THEN
        -- Grant Pro access
        UPDATE user_profiles
        SET role = 'pro',
            pro_expires_at = CASE
              WHEN pro_expires_at IS NULL OR pro_expires_at < NOW() THEN
                NOW() + (v_pro_days || ' days')::INTERVAL
              ELSE
                pro_expires_at + (v_pro_days || ' days')::INTERVAL
            END
        WHERE user_id = v_participant.user_id;

      WHEN 'desk_access' THEN
        -- Grant Desk access
        UPDATE user_profiles
        SET role = 'desk',
            desk_expires_at = CASE
              WHEN desk_expires_at IS NULL OR desk_expires_at < NOW() THEN
                NOW() + (v_desk_days || ' days')::INTERVAL
              ELSE
                desk_expires_at + (v_desk_days || ' days')::INTERVAL
            END
        WHERE user_id = v_participant.user_id;

      WHEN 'xp_pool' THEN
        -- Award XP from pool (distributed proportionally)
        DECLARE
          v_xp_share INTEGER;
        BEGIN
          -- Calculate XP share based on rank (winner gets more)
          v_xp_share := CASE v_participant.final_rank
            WHEN 1 THEN (v_xp_amount * 0.4)::INTEGER
            WHEN 2 THEN (v_xp_amount * 0.2)::INTEGER
            WHEN 3 THEN (v_xp_amount * 0.15)::INTEGER
            ELSE (v_xp_amount * 0.25 / GREATEST(v_tournament.prize_top_n - 3, 1))::INTEGER
          END;

          -- Award XP
          UPDATE user_stats
          SET total_xp = total_xp + v_xp_share
          WHERE user_id = v_participant.user_id;
        END;

      WHEN 'achievement' THEN
        -- Award achievements (handled separately via achievement system)
        NULL;

      ELSE
        -- Custom prize (stored in prize_details)
        NULL;
    END CASE;

    -- Mark prize as awarded
    UPDATE paper_trading_tournament_participants
    SET prize_awarded = true,
        prize_type = v_prize_type,
        prize_details = jsonb_build_object(
          'pro_days', v_pro_days,
          'desk_days', v_desk_days,
          'xp_amount', CASE WHEN v_prize_type = 'xp_pool' THEN v_xp_amount ELSE NULL END
        ),
        prize_awarded_at = NOW()
    WHERE id = v_participant.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-award prizes when tournament completes
CREATE OR REPLACE FUNCTION trigger_award_tournament_prizes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM award_tournament_prizes(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tournament_completed_prize_award
  AFTER UPDATE ON paper_trading_tournaments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION trigger_award_tournament_prizes();

-- Comments per documentazione accademica
COMMENT ON TABLE paper_trading_tournaments IS 'Paper trading tournaments - Competitive trading competitions with professional rules, scoring, and XP entry fees.';
COMMENT ON TABLE paper_trading_tournament_templates IS 'Predefined tournament templates - Quick setup for common tournament types.';
COMMENT ON TABLE paper_trading_tournament_rules IS 'Detailed tournament rules - Professional constraints and requirements per tournament.';
COMMENT ON TABLE paper_trading_tournament_participants IS 'Tournament participants - Isolated portfolios, performance metrics, entry fee payment, and prize awards.';
COMMENT ON TABLE paper_trading_tournament_leaderboard IS 'Tournament leaderboard snapshots - Historical ranking data for analysis.';
COMMENT ON FUNCTION calculate_tournament_score IS 'Calculate tournament score based on professional metrics (Sharpe, Return, Calmar, Composite).';
COMMENT ON FUNCTION update_tournament_rankings IS 'Update tournament rankings based on current scores and performance metrics.';
COMMENT ON FUNCTION award_tournament_prizes IS 'Automatically award prizes (Pro/Desk access, XP, achievements) to top N tournament participants.';
