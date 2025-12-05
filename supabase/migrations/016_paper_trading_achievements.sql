-- Paper Trading Achievements - Tradelia
-- Best Practice: Achievement system per gamification paper trading
-- Academic references: Self-Determination Theory (Deci & Ryan, 2000)

-- Add missing columns to achievements table if they don't exist
DO $$
BEGIN
  -- Add condition_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'achievements' 
    AND column_name = 'condition_type'
  ) THEN
    ALTER TABLE achievements ADD COLUMN condition_type VARCHAR(100);
  END IF;
  
  -- Add condition_value column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'achievements' 
    AND column_name = 'condition_value'
  ) THEN
    ALTER TABLE achievements ADD COLUMN condition_value NUMERIC(15, 2);
  END IF;
  
  -- Add category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'achievements' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE achievements ADD COLUMN category VARCHAR(50);
  END IF;
  
  -- Add code column for achievement identification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'achievements' 
    AND column_name = 'code'
  ) THEN
    ALTER TABLE achievements ADD COLUMN code VARCHAR(100) UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_achievements_code ON achievements(code);
  END IF;
END
$$;

-- Insert paper trading achievements
-- Using gen_random_uuid() for id and code for identification
INSERT INTO achievements (id, code, title, description, icon_type, condition_type, condition_value, xp_reward, category)
VALUES
  -- Base Achievements
  (gen_random_uuid(), 'paper-first-step', 'Primo Passo', 'Apri la tua prima posizione paper trading', 'target', 'paper_trades_total', 1, 10, 'paper-trading'),
  (gen_random_uuid(), 'paper-first-close', 'Primo Trade Chiuso', 'Chiudi la tua prima posizione', 'check-circle', 'paper_trades_closed', 1, 15, 'paper-trading'),
  (gen_random_uuid(), 'paper-active-trader', 'Trader Attivo', 'Esegui 10 trade paper trading', 'trending-up', 'paper_trades_total', 10, 25, 'paper-trading'),
  
  -- Performance Achievements
  (gen_random_uuid(), 'paper-win-streak', 'Win Streak', '3 trade vincenti consecutivi', 'flame', 'paper_win_streak', 3, 30, 'paper-trading'),
  (gen_random_uuid(), 'paper-win-rate-master', 'Win Rate Master', 'Win rate > 60% (min 10 trade)', 'trophy', 'paper_win_rate', 60, 50, 'paper-trading'),
  (gen_random_uuid(), 'paper-risk-manager', 'Risk Manager', 'Max drawdown < 10% (min 20 trade)', 'shield', 'paper_max_drawdown', 10, 40, 'paper-trading'),
  (gen_random_uuid(), 'paper-profit-maker', 'Profit Maker', 'Total P&L > 1000 (simulato)', 'dollar-sign', 'paper_total_pnl', 1000, 60, 'paper-trading'),
  (gen_random_uuid(), 'paper-consistency-king', 'Consistency King', 'Sharpe Ratio > 1.5 (min 30 trade)', 'crown', 'paper_sharpe_ratio', 1.5, 75, 'paper-trading'),
  
  -- Strategy Achievements
  (gen_random_uuid(), 'paper-ma-master', 'MA Master', '5 trade con Moving Average Crossover', 'trending-up', 'paper_strategy_ma', 5, 20, 'paper-trading'),
  (gen_random_uuid(), 'paper-rsi-expert', 'RSI Expert', '5 trade con RSI Mean Reversion', 'activity', 'paper_strategy_rsi', 5, 20, 'paper-trading'),
  (gen_random_uuid(), 'paper-macd-pro', 'MACD Pro', '5 trade con MACD Trend', 'zap', 'paper_strategy_macd', 5, 20, 'paper-trading'),
  (gen_random_uuid(), 'paper-strategy-explorer', 'Strategy Explorer', 'Usa 3 strategie diverse', 'map', 'paper_strategies_used', 3, 35, 'paper-trading'),
  
  -- Engagement Achievements
  (gen_random_uuid(), 'paper-daily-trader', 'Daily Trader', 'Trade ogni giorno per 7 giorni', 'calendar', 'paper_daily_streak', 7, 40, 'paper-trading'),
  
  -- Tournament Achievements
  (gen_random_uuid(), 'tournament-first', 'Primo Torneo', 'Partecipa al tuo primo torneo', 'trophy', 'tournaments_joined', 1, 20, 'tournaments'),
  (gen_random_uuid(), 'tournament-winner', 'Campione', 'Vinci un torneo', 'crown', 'tournaments_won', 1, 100, 'tournaments'),
  (gen_random_uuid(), 'tournament-top-10', 'Top 10', 'Finisci nei top 10 di un torneo', 'medal', 'tournaments_top10', 1, 50, 'tournaments'),
  (gen_random_uuid(), 'tournament-consistent', 'Consistente', 'Finisci nei top 10 in 3 tornei', 'target', 'tournaments_top10', 3, 75, 'tournaments'),
  (gen_random_uuid(), 'tournament-participant', 'Partecipante Attivo', 'Partecipa a 5 tornei', 'users', 'tournaments_joined', 5, 30, 'tournaments'),
  (gen_random_uuid(), 'tournament-sharpe-master', 'Sharpe Master', 'Vinci un torneo con Sharpe > 2.0', 'zap', 'tournament_sharpe_winner', 2.0, 150, 'tournaments')
ON CONFLICT (code) DO NOTHING;

-- Function to check paper trading achievements
CREATE OR REPLACE FUNCTION check_paper_trading_achievements(p_user_id UUID, p_action_type TEXT)
RETURNS TABLE(achievement_id TEXT) AS $$
DECLARE
  v_stats RECORD;
  v_achievements TEXT[];
  v_achievement_code TEXT;
BEGIN
  -- Get user stats
  SELECT * INTO v_stats
  FROM paper_trading_stats
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check each achievement condition
  FOR v_achievement_code IN
    SELECT code FROM achievements
    WHERE category = 'paper-trading'
    AND condition_type IS NOT NULL
  LOOP
    -- Check condition based on type
    CASE 
      WHEN v_achievement_code = 'paper-first-step' AND v_stats.total_trades >= 1 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
      WHEN v_achievement_code = 'paper-first-close' AND (v_stats.winning_trades + v_stats.losing_trades) >= 1 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
      WHEN v_achievement_code = 'paper-active-trader' AND v_stats.total_trades >= 10 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
      WHEN v_achievement_code = 'paper-win-streak' AND v_stats.current_win_streak >= 3 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
      WHEN v_achievement_code = 'paper-win-rate-master' AND 
           v_stats.total_trades >= 10 AND 
           (v_stats.winning_trades::NUMERIC / NULLIF(v_stats.total_trades, 0) * 100) >= 60 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
      WHEN v_achievement_code = 'paper-risk-manager' AND 
           v_stats.total_trades >= 20 AND 
           v_stats.max_drawdown < 10 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
      WHEN v_achievement_code = 'paper-profit-maker' AND v_stats.total_pnl >= 1000 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
      WHEN v_achievement_code = 'paper-consistency-king' AND 
           v_stats.total_trades >= 30 AND 
           v_stats.sharpe_ratio >= 1.5 THEN
        v_achievements := array_append(v_achievements, v_achievement_code);
    END CASE;
  END LOOP;

  RETURN QUERY SELECT unnest(v_achievements);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
