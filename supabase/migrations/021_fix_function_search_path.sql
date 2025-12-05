-- Fix Function Search Path - Security Best Practice
-- This migration fixes all functions to include SET search_path for security
-- Version: 021
-- Date: 2025-01-27
--
-- IMPORTANT: This migration is idempotent - safe to run multiple times
-- Fixes security warnings for functions with mutable search_path

SET search_path = public;

-- ============================================================================
-- FIX: update_updated_at_column
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX: update_paper_trading_stats
-- ============================================================================
CREATE OR REPLACE FUNCTION update_paper_trading_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================================================
-- FIX: check_paper_trading_achievements
-- ============================================================================
CREATE OR REPLACE FUNCTION check_paper_trading_achievements(p_user_id UUID, p_action_type TEXT)
RETURNS TABLE(achievement_id TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================================================
-- FIX: calculate_tournament_score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_tournament_score(
  p_tournament_id UUID,
  p_participant_id UUID
) RETURNS NUMERIC 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================================================
-- FIX: update_tournament_rankings
-- ============================================================================
CREATE OR REPLACE FUNCTION update_tournament_rankings(p_tournament_id UUID)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- ============================================================================
-- FIX: award_tournament_prizes
-- ============================================================================
CREATE OR REPLACE FUNCTION award_tournament_prizes(p_tournament_id UUID)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tournament RECORD;
  v_participant RECORD;
  v_rank INTEGER;
  v_prize_type tournament_prize_type;
  v_pro_days INTEGER;
  v_desk_days INTEGER;
  v_xp_amount INTEGER;
  v_user_profile RECORD;
  v_xp_share INTEGER;
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
        -- Grant Pro access via user_roles (UNIQUE constraint on user_id)
        INSERT INTO user_roles (user_id, role, valid_until)
        VALUES (
          v_participant.user_id,
          'pro',
          NOW() + (v_pro_days || ' days')::INTERVAL
        )
        ON CONFLICT (user_id) DO UPDATE
        SET 
          role = CASE
            -- If user has desk/admin, keep higher role, just extend valid_until
            WHEN user_roles.role IN ('desk', 'admin') THEN user_roles.role
            ELSE 'pro'
          END,
          valid_until = CASE
            WHEN user_roles.valid_until IS NULL OR user_roles.valid_until < NOW() THEN
              NOW() + (v_pro_days || ' days')::INTERVAL
            ELSE
              user_roles.valid_until + (v_pro_days || ' days')::INTERVAL
          END;

      WHEN 'desk_access' THEN
        -- Grant Desk access via user_roles (UNIQUE constraint on user_id)
        -- Desk is higher than Pro, so always upgrade to Desk
        INSERT INTO user_roles (user_id, role, valid_until)
        VALUES (
          v_participant.user_id,
          'desk',
          NOW() + (v_desk_days || ' days')::INTERVAL
        )
        ON CONFLICT (user_id) DO UPDATE
        SET 
          role = CASE
            -- If user has admin, keep admin role, just extend valid_until
            WHEN user_roles.role = 'admin' THEN 'admin'
            ELSE 'desk'
          END,
          valid_until = CASE
            WHEN user_roles.valid_until IS NULL OR user_roles.valid_until < NOW() THEN
              NOW() + (v_desk_days || ' days')::INTERVAL
            ELSE
              user_roles.valid_until + (v_desk_days || ' days')::INTERVAL
          END;

      WHEN 'xp_pool' THEN
        -- Award XP from pool (distributed proportionally)
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
$$;

-- ============================================================================
-- FIX: trigger_award_tournament_prizes
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_award_tournament_prizes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM award_tournament_prizes(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX: cleanup_expired_widget_notifications
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_widget_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM widget_notifications
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND is_read = true; -- Rimuovi solo quelle lette e scadute
END;
$$;

-- Comments
COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates updated_at timestamp. Fixed with SET search_path for security.';
COMMENT ON FUNCTION update_paper_trading_stats IS 'Updates paper trading statistics. Fixed with SET search_path for security.';
COMMENT ON FUNCTION check_paper_trading_achievements IS 'Checks and awards paper trading achievements. Fixed with SET search_path for security.';
COMMENT ON FUNCTION calculate_tournament_score IS 'Calculate tournament score based on professional metrics. Fixed with SET search_path for security.';
COMMENT ON FUNCTION update_tournament_rankings IS 'Update tournament rankings based on current scores. Fixed with SET search_path for security.';
COMMENT ON FUNCTION award_tournament_prizes IS 'Automatically award prizes to tournament winners. Fixed with SET search_path for security.';
COMMENT ON FUNCTION trigger_award_tournament_prizes IS 'Trigger function to award prizes when tournament completes. Fixed with SET search_path for security.';
COMMENT ON FUNCTION cleanup_expired_widget_notifications IS 'Cleans up expired widget notifications. Fixed with SET search_path for security.';
