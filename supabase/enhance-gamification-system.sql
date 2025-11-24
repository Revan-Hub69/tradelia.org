-- ============================================
-- ENHANCEMENT: GAMIFICATION SYSTEM PROFESSIONALE
-- ============================================
-- Sistema gamification avanzato con best practice
-- Non competitivo, focus su self-improvement
-- ============================================

-- ===== 1. ENHANCED LEVEL SYSTEM =====
-- Sistema livelli più sofisticato

CREATE TABLE IF NOT EXISTS education_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE,
  level_name TEXT NOT NULL UNIQUE,
  level_title TEXT NOT NULL, -- "Foundation", "Explorer", etc.
  min_xp INTEGER NOT NULL,
  max_xp INTEGER, -- NULL = no max (ultimo livello)
  icon_url TEXT,
  color_hex TEXT, -- Colore per UI
  description TEXT,
  benefits JSONB, -- Benefici sbloccati a questo livello
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_education_levels_xp ON education_levels(min_xp, max_xp);

-- ===== 2. XP TRANSACTIONS (Tracking Dettagliato) =====
-- Traccia ogni guadagno XP per trasparenza

CREATE TABLE IF NOT EXISTS education_xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'lesson_completed',
    'quiz_start',
    'quiz_end',
    'test_passed',
    'test_perfect',
    'spaced_repetition',
    'retrieval_practice',
    'reflection',
    'streak_bonus',
    'daily_login',
    'milestone',
    'badge_earned',
    'admin_adjustment'
  )),
  source_id UUID, -- ID lezione, quiz, test, etc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON education_xp_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_source ON education_xp_transactions(source_type, source_id);

-- ===== 3. ENHANCED BADGE SYSTEM =====
-- Badge più sofisticati con progress tracking

ALTER TABLE education_badges ADD COLUMN IF NOT EXISTS badge_category TEXT CHECK (badge_category IN (
  'achievement',
  'milestone',
  'special',
  'skill',
  'social',
  'time_based'
));

ALTER TABLE education_badges ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common' CHECK (rarity IN (
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
));

ALTER TABLE education_badges ADD COLUMN IF NOT EXISTS progress_tracking JSONB; -- Per badge progressivi

-- Badge Progressivi (es. "Completa 10 lezioni", "Completa 50 lezioni")
CREATE TABLE IF NOT EXISTS education_badge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES education_badges(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_badge_progress_user ON education_badge_progress(user_id, badge_id);

-- ===== 4. STREAK SYSTEM AVANZATO =====
-- Tracking dettagliato streak

ALTER TABLE education_user_stats ADD COLUMN IF NOT EXISTS streak_history JSONB; -- Array di date
ALTER TABLE education_user_stats ADD COLUMN IF NOT EXISTS streak_rewards_claimed JSONB; -- Rewards già riscossi

-- Streak Rewards
CREATE TABLE IF NOT EXISTS education_streak_rewards (
  streak_days INTEGER PRIMARY KEY,
  xp_reward INTEGER NOT NULL,
  badge_id UUID REFERENCES education_badges(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 5. LEARNING STREAKS (Diversi Tipi) =====
-- Non solo daily, ma anche weekly, monthly

CREATE TABLE IF NOT EXISTS education_user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('daily', 'weekly', 'monthly')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

CREATE INDEX IF NOT EXISTS idx_user_streaks ON education_user_streaks(user_id, streak_type);

-- ===== 6. ACHIEVEMENTS SYSTEM =====
-- Achievement più complessi di badge semplici

CREATE TABLE IF NOT EXISTS education_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'completion',
    'performance',
    'consistency',
    'mastery',
    'exploration',
    'social'
  )),
  criteria JSONB NOT NULL, -- Criteri complessi
  xp_reward INTEGER DEFAULT 0,
  badge_id UUID REFERENCES education_badges(id),
  icon_url TEXT,
  rarity TEXT DEFAULT 'common',
  is_hidden BOOLEAN DEFAULT false, -- Hidden achievements
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES education_achievements(id) ON DELETE CASCADE,
  progress JSONB, -- Progress per achievement complessi
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements ON education_user_achievements(user_id, achievement_id);

-- ===== 7. QUEST SYSTEM (Missioni/Obiettivi) =====
-- Quest giornaliere/settimanali per engagement

CREATE TABLE IF NOT EXISTS education_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'special')),
  objectives JSONB NOT NULL, -- Array di obiettivi
  xp_reward INTEGER NOT NULL,
  badge_id UUID REFERENCES education_badges(id),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education_user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES education_quests(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, quest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_quests ON education_user_quests(user_id, status);

-- ===== 8. SOCIAL FEATURES (Non Competitivi) =====
-- Community goals, sharing progress (opzionale)

CREATE TABLE IF NOT EXISTS education_community_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_count INTEGER NOT NULL, -- Es. 1000 utenti completano Modulo 1
  current_count INTEGER DEFAULT 0,
  xp_reward INTEGER, -- XP per tutti quando raggiunto
  badge_id UUID REFERENCES education_badges(id),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education_user_community_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES education_community_goals(id) ON DELETE CASCADE,
  contributed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_id)
);

-- ===== 9. FUNZIONI GAMIFICATION =====

-- Funzione per calcolare livello da XP
CREATE OR REPLACE FUNCTION calculate_user_level(p_total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER;
BEGIN
  SELECT level_number INTO v_level
  FROM education_levels
  WHERE min_xp <= p_total_xp
    AND (max_xp IS NULL OR max_xp >= p_total_xp)
  ORDER BY level_number DESC
  LIMIT 1;

  RETURN COALESCE(v_level, 1);
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiungere XP e aggiornare stats
CREATE OR REPLACE FUNCTION add_education_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source_type TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_new_total_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- Aggiungi XP transaction
  INSERT INTO education_xp_transactions (user_id, xp_amount, source_type, source_id, description)
  VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_description);

  -- Aggiorna total XP
  INSERT INTO education_user_stats (user_id, total_points, updated_at)
  VALUES (p_user_id, p_xp_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = education_user_stats.total_points + p_xp_amount,
    updated_at = NOW()
  RETURNING total_points INTO v_new_total_xp;

  -- Calcola livelli
  SELECT current_level INTO v_old_level
  FROM education_user_stats
  WHERE user_id = p_user_id;

  v_new_level := calculate_user_level(v_new_total_xp);

  -- Check level up
  IF v_new_level > COALESCE(v_old_level, 1) THEN
    v_level_up := true;
    UPDATE education_user_stats
    SET current_level = v_new_level
    WHERE user_id = p_user_id;
  END IF;

  v_result := jsonb_build_object(
    'new_total_xp', v_new_total_xp,
    'old_level', COALESCE(v_old_level, 1),
    'new_level', v_new_level,
    'level_up', v_level_up,
    'xp_added', p_xp_amount
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare streak
CREATE OR REPLACE FUNCTION update_learning_streak(p_user_id UUID, p_streak_type TEXT DEFAULT 'daily')
RETURNS JSONB AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
  v_streak_broken BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- Get current streak
  SELECT current_streak, longest_streak, last_activity_date
  INTO v_current_streak, v_longest_streak, v_last_activity
  FROM education_user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  -- Se non esiste, crea
  IF NOT FOUND THEN
    INSERT INTO education_user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, p_streak_type, 1, 1, v_today)
    RETURNING current_streak, longest_streak INTO v_current_streak, v_longest_streak;
  ELSE
    -- Se attività oggi, non fare nulla (già contato)
    IF v_last_activity = v_today THEN
      -- Nessun cambiamento
    ELSIF v_last_activity = v_today - 1 THEN
      -- Continua streak
      v_current_streak := v_current_streak + 1;
      IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
      END IF;
      UPDATE education_user_streaks
      SET current_streak = v_current_streak,
          longest_streak = v_longest_streak,
          last_activity_date = v_today,
          updated_at = NOW()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    ELSE
      -- Streak rotto
      v_streak_broken := true;
      v_current_streak := 1;
      UPDATE education_user_streaks
      SET current_streak = 1,
          last_activity_date = v_today,
          updated_at = NOW()
      WHERE user_id = p_user_id AND streak_type = p_streak_type;
    END IF;
  END IF;

  -- Aggiorna anche education_user_stats per compatibilità
  UPDATE education_user_stats
  SET current_streak_days = v_current_streak,
      longest_streak_days = GREATEST(longest_streak_days, v_longest_streak),
      last_activity_date = v_today,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  v_result := jsonb_build_object(
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'streak_broken', v_streak_broken,
    'last_activity', v_today
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Funzione per check e unlock badge
CREATE OR REPLACE FUNCTION check_and_unlock_badge(p_user_id UUID, p_badge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_earned BOOLEAN;
  v_criteria JSONB;
  v_meets_criteria BOOLEAN := false;
BEGIN
  -- Check se già ottenuto
  SELECT EXISTS(
    SELECT 1 FROM education_user_badges
    WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) INTO v_already_earned;

  IF v_already_earned THEN
    RETURN false;
  END IF;

  -- Get criteria
  SELECT criteria INTO v_criteria
  FROM education_badges
  WHERE id = p_badge_id;

  -- Check criteria (implementazione semplificata, espandere per criteri complessi)
  -- TODO: Implementare logica specifica per ogni tipo di badge

  -- Se criteria soddisfatti, unlock
  IF v_meets_criteria THEN
    INSERT INTO education_user_badges (user_id, badge_id)
    VALUES (p_user_id, p_badge_id)
    ON CONFLICT DO NOTHING;

    -- Aggiungi XP se badge ha reward
    SELECT points_reward INTO v_criteria FROM education_badges WHERE id = p_badge_id;
    IF v_criteria > 0 THEN
      PERFORM add_education_xp(p_user_id, v_criteria, 'badge_earned', p_badge_id, 'Badge: ' || (SELECT name FROM education_badges WHERE id = p_badge_id));
    END IF;

    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- ===== 10. RLS POLICIES =====

ALTER TABLE education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_badge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_streak_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_community_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_community_contributions ENABLE ROW LEVEL SECURITY;

-- Public read per levels, badges, quests, community goals
CREATE POLICY "Public can view levels"
  ON education_levels FOR SELECT
  USING (true);

CREATE POLICY "Public can view active badges"
  ON education_badges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active quests"
  ON education_quests FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active community goals"
  ON education_community_goals FOR SELECT
  USING (is_active = true);

-- User-specific per transactions, progress, achievements
CREATE POLICY "Users can view own XP transactions"
  ON education_xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badge progress"
  ON education_badge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks"
  ON education_user_streaks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements"
  ON education_user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quests"
  ON education_user_quests FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own community contributions"
  ON education_user_community_contributions FOR SELECT
  USING (auth.uid() = user_id);

-- ===== 11. SEED DATA: LEVELS =====

INSERT INTO education_levels (level_number, level_name, level_title, min_xp, max_xp, color_hex, description) VALUES
(1, 'foundation', 'Foundation', 0, 100, '#6B7280', 'Hai iniziato il tuo percorso formativo'),
(2, 'explorer', 'Explorer', 101, 300, '#3B82F6', 'Stai esplorando i concetti base'),
(3, 'scholar', 'Scholar', 301, 600, '#8B5CF6', 'Hai acquisito conoscenze solide'),
(4, 'master', 'Master', 601, 1000, '#EC4899', 'Hai raggiunto un livello avanzato'),
(5, 'grandmaster', 'Grandmaster', 1001, NULL, '#F59E0B', 'Hai raggiunto la maestria')
ON CONFLICT (level_number) DO UPDATE SET
  level_name = EXCLUDED.level_name,
  level_title = EXCLUDED.level_title,
  min_xp = EXCLUDED.min_xp,
  max_xp = EXCLUDED.max_xp;

-- ===== 12. SEED DATA: STREAK REWARDS =====

INSERT INTO education_streak_rewards (streak_days, xp_reward, description) VALUES
(7, 50, 'Week Warrior - 7 giorni consecutivi'),
(14, 100, 'Two Week Champion - 14 giorni consecutivi'),
(30, 200, 'Month Master - 30 giorni consecutivi'),
(60, 400, 'Two Month Legend - 60 giorni consecutivi'),
(100, 500, 'Century Club - 100 giorni consecutivi')
ON CONFLICT (streak_days) DO UPDATE SET
  xp_reward = EXCLUDED.xp_reward,
  description = EXCLUDED.description;

-- ===== 13. COMMENTI DOCUMENTAZIONE =====

COMMENT ON TABLE education_levels IS 'Sistema livelli avanzato con progressione XP';
COMMENT ON TABLE education_xp_transactions IS 'Tracking dettagliato ogni guadagno XP per trasparenza';
COMMENT ON TABLE education_badge_progress IS 'Progress tracking per badge progressivi';
COMMENT ON TABLE education_user_streaks IS 'Sistema streak avanzato (daily, weekly, monthly)';
COMMENT ON TABLE education_achievements IS 'Achievement system complesso con criteri avanzati';
COMMENT ON TABLE education_quests IS 'Quest system per engagement (daily, weekly, special)';
COMMENT ON TABLE education_community_goals IS 'Community goals non competitivi per engagement sociale';

COMMENT ON FUNCTION add_education_xp IS 'Aggiunge XP, aggiorna stats, check level up';
COMMENT ON FUNCTION update_learning_streak IS 'Aggiorna streak giornaliero/settimanale/mensile';
COMMENT ON FUNCTION check_and_unlock_badge IS 'Verifica criteri e unlock badge se soddisfatti';
