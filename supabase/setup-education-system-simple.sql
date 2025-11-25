-- ============================================
-- SETUP SISTEMA EDUCATIVO - VERSIONE SEMPLIFICATA
-- ============================================
-- Script unico che crea tutto in ordine corretto
-- Esegui questo script DOPO aver verificato che le tabelle base esistano
-- ============================================

-- ===== VERIFICA PREREQUISITI =====
DO $$
BEGIN
  -- Verifica che auth.users esista (Supabase base)
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    RAISE EXCEPTION 'Tabelle auth.users non trovata. Verifica connessione Supabase.';
  END IF;
  
  RAISE NOTICE '✅ Prerequisiti verificati';
END $$;

-- ===== 1. TABELLE BASE (se non esistono) =====

-- Moduli formativi
CREATE TABLE IF NOT EXISTS education_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_hours INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  requires_previous_module BOOLEAN DEFAULT true,
  previous_module_id UUID REFERENCES education_modules(id) ON DELETE SET NULL,
  prerequisites JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lezioni
CREATE TABLE IF NOT EXISTS education_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'interactive', 'pdf')),
  video_url TEXT,
  pdf_url TEXT,
  order_index INTEGER NOT NULL,
  estimated_minutes INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Test
CREATE TABLE IF NOT EXISTS education_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domande
CREATE TABLE IF NOT EXISTS education_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES education_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'case_study')),
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, order_index)
);

-- Opzioni domande
CREATE TABLE IF NOT EXISTS education_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES education_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, order_index)
);

-- Progress utente moduli
CREATE TABLE IF NOT EXISTS education_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES education_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'locked')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Progress lezioni
CREATE TABLE IF NOT EXISTS education_user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES education_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Tentativi test (MINIMIZZATO - GDPR)
CREATE TABLE IF NOT EXISTS education_user_test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES education_tests(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  wrong_question_ids UUID[], -- Solo IDs domande sbagliate (minimizzazione GDPR)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, test_id, attempt_number)
);

-- Badge base
CREATE TABLE IF NOT EXISTS education_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  badge_type TEXT CHECK (badge_type IN ('module_completion', 'test_perfect', 'streak', 'milestone', 'special')),
  criteria JSONB,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badge utenti
CREATE TABLE IF NOT EXISTS education_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES education_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Stats utente
CREATE TABLE IF NOT EXISTS education_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  modules_completed INTEGER DEFAULT 0,
  tests_passed INTEGER DEFAULT 0,
  perfect_tests INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking preferences (GDPR)
CREATE TABLE IF NOT EXISTS education_user_tracking_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  track_detailed_progress BOOLEAN DEFAULT true,
  track_test_scores BOOLEAN DEFAULT true,
  track_test_answers BOOLEAN DEFAULT false, -- Default: NO (minimizzazione)
  share_anonymous_analytics BOOLEAN DEFAULT true,
  consent_given_at TIMESTAMPTZ DEFAULT NOW(),
  consent_withdrawn_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 2. INDICI =====

CREATE INDEX IF NOT EXISTS idx_education_modules_order ON education_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_education_lessons_module ON education_lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_education_tests_module ON education_tests(module_id);
CREATE INDEX IF NOT EXISTS idx_education_questions_test ON education_questions(test_id, order_index);
CREATE INDEX IF NOT EXISTS idx_education_options_question ON education_question_options(question_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON education_user_progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON education_user_lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_test_attempts_user ON education_user_test_attempts(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON education_user_badges(user_id, badge_id);

-- ===== 3. FUNZIONE UPDATE UPDATED_AT =====

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== 4. TRIGGERS =====

CREATE TRIGGER update_education_modules_updated_at
  BEFORE UPDATE ON education_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_lessons_updated_at
  BEFORE UPDATE ON education_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_tests_updated_at
  BEFORE UPDATE ON education_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_user_progress_updated_at
  BEFORE UPDATE ON education_user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_user_lesson_progress_updated_at
  BEFORE UPDATE ON education_user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_user_stats_updated_at
  BEFORE UPDATE ON education_user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracking_preferences_updated_at
  BEFORE UPDATE ON education_user_tracking_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 5. RLS POLICIES BASE =====

ALTER TABLE education_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_tracking_preferences ENABLE ROW LEVEL SECURITY;

-- Public read per moduli, lezioni, test, domande, opzioni, badge
DROP POLICY IF EXISTS "Public can view modules" ON education_modules;
CREATE POLICY "Public can view modules"
  ON education_modules FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view lessons" ON education_lessons;
CREATE POLICY "Public can view lessons"
  ON education_lessons FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view tests" ON education_tests;
CREATE POLICY "Public can view tests"
  ON education_tests FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view questions" ON education_questions;
CREATE POLICY "Public can view questions"
  ON education_questions FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Public can view question options" ON education_question_options;
CREATE POLICY "Public can view question options"
  ON education_question_options FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view active badges" ON education_badges;
CREATE POLICY "Public can view active badges"
  ON education_badges FOR SELECT
  USING (is_active = true);

-- User-specific per progress, attempts, badges, stats, preferences
DROP POLICY IF EXISTS "Users can manage own progress" ON education_user_progress;
CREATE POLICY "Users can manage own progress"
  ON education_user_progress FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own lesson progress" ON education_user_lesson_progress;
CREATE POLICY "Users can manage own lesson progress"
  ON education_user_lesson_progress FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own test attempts" ON education_user_test_attempts;
CREATE POLICY "Users can manage own test attempts"
  ON education_user_test_attempts FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own badges" ON education_user_badges;
CREATE POLICY "Users can manage own badges"
  ON education_user_badges FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own stats" ON education_user_stats;
CREATE POLICY "Users can manage own stats"
  ON education_user_stats FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own tracking preferences" ON education_user_tracking_preferences;
CREATE POLICY "Users can manage own tracking preferences"
  ON education_user_tracking_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ===== 6. FUNZIONE VERIFICA CONSENSO =====

CREATE OR REPLACE FUNCTION has_tracking_consent(
  p_user_id UUID,
  p_tracking_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_preferences RECORD;
BEGIN
  SELECT * INTO v_preferences
  FROM education_user_tracking_preferences
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN CASE 
      WHEN p_tracking_type = 'test_answers' THEN false
      ELSE true
    END;
  END IF;

  CASE p_tracking_type
    WHEN 'detailed_progress' THEN
      RETURN v_preferences.track_detailed_progress;
    WHEN 'test_scores' THEN
      RETURN v_preferences.track_test_scores;
    WHEN 'test_answers' THEN
      RETURN v_preferences.track_test_answers;
    WHEN 'anonymous_analytics' THEN
      RETURN v_preferences.share_anonymous_analytics;
    ELSE
      RETURN true;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ===== 7. FUNZIONE DELETE USER DATA (GDPR) =====

CREATE OR REPLACE FUNCTION delete_user_education_data(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_test_attempts INTEGER;
  v_lesson_progress INTEGER;
  v_module_progress INTEGER;
  v_badges INTEGER;
  v_stats INTEGER;
  v_tracking_prefs INTEGER;
BEGIN
  DELETE FROM education_user_test_attempts WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_test_attempts = ROW_COUNT;

  DELETE FROM education_user_lesson_progress WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_lesson_progress = ROW_COUNT;

  DELETE FROM education_user_progress WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_module_progress = ROW_COUNT;

  DELETE FROM education_user_badges WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_badges = ROW_COUNT;

  DELETE FROM education_user_stats WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_stats = ROW_COUNT;

  DELETE FROM education_user_tracking_preferences WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_tracking_prefs = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'deleted', jsonb_build_object(
      'test_attempts', v_test_attempts,
      'lesson_progress', v_lesson_progress,
      'module_progress', v_module_progress,
      'badges', v_badges,
      'stats', v_stats,
      'tracking_preferences', v_tracking_prefs
    ),
    'message', 'Dati educativi eliminati'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ===== 8. VERIFICA FINALE =====

DO $$
DECLARE
  v_tables_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_tables_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name LIKE 'education_%';

  RAISE NOTICE '✅ Setup completato: % tabelle education create', v_tables_count;
END $$;
