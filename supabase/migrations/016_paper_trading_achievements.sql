-- Paper Trading Achievements - Tradelia
-- Best Practice: Achievement system per gamification paper trading
-- Academic references: Self-Determination Theory (Deci & Ryan, 2000)

-- Insert paper trading achievements
INSERT INTO achievements (id, title, description, icon_type, condition_type, condition_value, xp_reward, category)
VALUES
  -- Base Achievements
  ('paper-first-step', 'Primo Passo', 'Apri la tua prima posizione paper trading', 'target', 'paper_trades_total', 1, 10, 'paper-trading'),
  ('paper-first-close', 'Primo Trade Chiuso', 'Chiudi la tua prima posizione', 'check-circle', 'paper_trades_closed', 1, 15, 'paper-trading'),
  ('paper-active-trader', 'Trader Attivo', 'Esegui 10 trade paper trading', 'trending-up', 'paper_trades_total', 10, 25, 'paper-trading'),
  
  -- Performance Achievements
  ('paper-win-streak', 'Win Streak', '3 trade vincenti consecutivi', 'flame', 'paper_win_streak', 3, 30, 'paper-trading'),
  ('paper-win-rate-master', 'Win Rate Master', 'Win rate > 60% (min 10 trade)', 'trophy', 'paper_win_rate', 60, 50, 'paper-trading'),
  ('paper-risk-manager', 'Risk Manager', 'Max drawdown < 10% (min 20 trade)', 'shield', 'paper_max_drawdown', 10, 40, 'paper-trading'),
  ('paper-profit-maker', 'Profit Maker', 'Total P&L > 1000 (simulato)', 'dollar-sign', 'paper_total_pnl', 1000, 60, 'paper-trading'),
  ('paper-consistency-king', 'Consistency King', 'Sharpe Ratio > 1.5 (min 30 trade)', 'crown', 'paper_sharpe_ratio', 1.5, 75, 'paper-trading'),
  
  -- Strategy Achievements
  ('paper-ma-master', 'MA Master', '5 trade con Moving Average Crossover', 'trending-up', 'paper_strategy_ma', 5, 20, 'paper-trading'),
  ('paper-rsi-expert', 'RSI Expert', '5 trade con RSI Mean Reversion', 'activity', 'paper_strategy_rsi', 5, 20, 'paper-trading'),
  ('paper-macd-pro', 'MACD Pro', '5 trade con MACD Trend', 'zap', 'paper_strategy_macd', 5, 20, 'paper-trading'),
  ('paper-strategy-explorer', 'Strategy Explorer', 'Usa 3 strategie diverse', 'map', 'paper_strategies_used', 3, 35, 'paper-trading'),
  
  -- Engagement Achievements
  ('paper-daily-trader', 'Daily Trader', 'Trade ogni giorno per 7 giorni', 'calendar', 'paper_daily_streak', 7, 40, 'paper-trading')
ON CONFLICT (id) DO NOTHING;

-- Function to check paper trading achievements
CREATE OR REPLACE FUNCTION check_paper_trading_achievements(p_user_id UUID, p_action_type TEXT)
RETURNS TABLE(achievement_id TEXT) AS $$
DECLARE
  v_stats RECORD;
  v_achievements TEXT[];
BEGIN
  -- Get user stats
  SELECT * INTO v_stats
  FROM paper_trading_stats
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check each achievement condition
  FOR achievement_id IN
    SELECT id FROM achievements
    WHERE category = 'paper-trading'
    AND condition_type IS NOT NULL
  LOOP
    -- Check condition based on type
    CASE 
      WHEN achievement_id = 'paper-first-step' AND v_stats.total_trades >= 1 THEN
        achievements := array_append(achievements, achievement_id);
      WHEN achievement_id = 'paper-first-close' AND (v_stats.winning_trades + v_stats.losing_trades) >= 1 THEN
        achievements := array_append(achievements, achievement_id);
      WHEN achievement_id = 'paper-active-trader' AND v_stats.total_trades >= 10 THEN
        achievements := array_append(achievements, achievement_id);
      WHEN achievement_id = 'paper-win-streak' AND v_stats.current_win_streak >= 3 THEN
        achievements := array_append(achievements, achievement_id);
      WHEN achievement_id = 'paper-win-rate-master' AND 
           v_stats.total_trades >= 10 AND 
           (v_stats.winning_trades::NUMERIC / NULLIF(v_stats.total_trades, 0) * 100) >= 60 THEN
        achievements := array_append(achievements, achievement_id);
      WHEN achievement_id = 'paper-risk-manager' AND 
           v_stats.total_trades >= 20 AND 
           v_stats.max_drawdown < 10 THEN
        achievements := array_append(achievements, achievement_id);
      WHEN achievement_id = 'paper-profit-maker' AND v_stats.total_pnl >= 1000 THEN
        achievements := array_append(achievements, achievement_id);
      WHEN achievement_id = 'paper-consistency-king' AND 
           v_stats.total_trades >= 30 AND 
           v_stats.sharpe_ratio >= 1.5 THEN
        achievements := array_append(achievements, achievement_id);
    END CASE;
  END LOOP;

  RETURN QUERY SELECT unnest(achievements);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
