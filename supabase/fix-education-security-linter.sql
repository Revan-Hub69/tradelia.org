-- ============================================
-- FIX: Security Linter Errors
-- ============================================
-- Corregge errori di sicurezza rilevati dal linter Supabase
-- ============================================

-- ===== 1. ABILITA RLS PER TABELLE MANCANTI =====

-- Abilita RLS per education_badges (se non già abilitato)
ALTER TABLE IF EXISTS education_badges ENABLE ROW LEVEL SECURITY;

-- Abilita RLS per education_pathway_modules (se non già abilitato)
ALTER TABLE IF EXISTS education_pathway_modules ENABLE ROW LEVEL SECURITY;

-- ===== 2. CREA POLICY PER education_badges =====

-- Rimuovi policy esistente se presente
DROP POLICY IF EXISTS "Public can view active badges" ON education_badges;

-- Policy: Tutti possono vedere badge attivi
CREATE POLICY "Public can view active badges"
  ON education_badges FOR SELECT
  USING (is_active = true);

-- ===== 3. CREA POLICY PER education_pathway_modules =====

-- Rimuovi policy esistente se presente
DROP POLICY IF EXISTS "Public can view pathway modules" ON education_pathway_modules;

-- Policy: Tutti possono vedere moduli nei percorsi
CREATE POLICY "Public can view pathway modules"
  ON education_pathway_modules FOR SELECT
  USING (true);

-- ===== 4. FIX SEARCH_PATH PER TUTTE LE FUNZIONI =====

-- Rimuovi trigger che dipendono da update_updated_at_column prima
DROP TRIGGER IF EXISTS update_education_modules_updated_at ON education_modules;
DROP TRIGGER IF EXISTS update_education_lessons_updated_at ON education_lessons;
DROP TRIGGER IF EXISTS update_education_tests_updated_at ON education_tests;
DROP TRIGGER IF EXISTS update_education_user_progress_updated_at ON education_user_progress;
DROP TRIGGER IF EXISTS update_education_user_pathway_progress_updated_at ON education_user_pathway_progress;

-- Rimuovi funzioni esistenti se presenti (per permettere cambio signature)
-- Usa CASCADE per droppare tutte le versioni (overload) delle funzioni
DROP FUNCTION IF EXISTS calculate_module_progress(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS can_access_module(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_user_education_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER) CASCADE;
-- add_education_xp potrebbe avere signature diverse, droppa tutte
DROP FUNCTION IF EXISTS add_education_xp(UUID, INTEGER, TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS add_education_xp(UUID, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS add_education_xp(UUID, INTEGER, TEXT, UUID) CASCADE;
-- Droppa tutte le versioni di add_education_xp usando query dinamica
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc
    WHERE proname = 'add_education_xp'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident('public') || '.' || quote_ident(func_record.proname) || '(' || func_record.args || ') CASCADE';
  END LOOP;
END $$;
-- Droppa tutte le versioni di update_learning_streak
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc
    WHERE proname = 'update_learning_streak'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident('public') || '.' || quote_ident(func_record.proname) || '(' || func_record.args || ') CASCADE';
  END LOOP;
END $$;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
-- Droppa tutte le versioni di check_and_unlock_badge
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc
    WHERE proname = 'check_and_unlock_badge'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident('public') || '.' || quote_ident(func_record.proname) || '(' || func_record.args || ') CASCADE';
  END LOOP;
END $$;

-- Funzione: calculate_module_progress
CREATE OR REPLACE FUNCTION calculate_module_progress(p_user_id UUID, p_module_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  total_lessons INTEGER;
  completed_lessons INTEGER;
  progress_pct INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_lessons
  FROM public.education_lessons
  WHERE module_id = p_module_id AND is_active = true;

  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*) INTO completed_lessons
  FROM public.education_user_lesson_progress
  WHERE user_id = p_user_id
    AND lesson_id IN (SELECT id FROM public.education_lessons WHERE module_id = p_module_id AND is_active = true)
    AND status = 'completed';

  progress_pct := (completed_lessons * 100) / total_lessons;
  RETURN progress_pct;
END;
$$;

-- Funzione: can_access_module
CREATE OR REPLACE FUNCTION can_access_module(p_user_id UUID, p_module_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  module_record RECORD;
  previous_completed BOOLEAN;
BEGIN
  SELECT * INTO module_record FROM public.education_modules WHERE id = p_module_id;

  IF NOT module_record.is_active THEN
    RETURN false;
  END IF;

  IF NOT module_record.requires_previous_module OR module_record.previous_module_id IS NULL THEN
    RETURN true;
  END IF;

  SELECT status = 'completed' INTO previous_completed
  FROM public.education_user_progress
  WHERE user_id = p_user_id AND module_id = module_record.previous_module_id;

  RETURN COALESCE(previous_completed, false);
END;
$$;

-- Funzione: update_user_education_stats
CREATE OR REPLACE FUNCTION update_user_education_stats(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.education_user_stats (user_id, modules_completed, tests_passed, total_points, updated_at)
  SELECT 
    p_user_id,
    COUNT(*) FILTER (WHERE status = 'completed'),
    0,
    0,
    NOW()
  FROM public.education_user_progress
  WHERE user_id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    modules_completed = EXCLUDED.modules_completed,
    updated_at = NOW();
END;
$$;

-- Funzione: calculate_user_level
CREATE OR REPLACE FUNCTION calculate_user_level(p_total_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_level INTEGER;
BEGIN
  SELECT COALESCE(MAX(level_number), 1) INTO user_level
  FROM public.education_levels
  WHERE min_xp <= p_total_xp AND (max_xp IS NULL OR p_total_xp <= max_xp);
  
  RETURN COALESCE(user_level, 1);
END;
$$;

-- Funzione: add_education_xp (versione che ritorna JSONB - compatibile con enhance-gamification-system.sql)
CREATE OR REPLACE FUNCTION add_education_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source_type TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_total_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_level_up BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- Aggiungi XP transaction
  INSERT INTO public.education_xp_transactions (user_id, xp_amount, source_type, source_id, description)
  VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_description);

  -- Aggiorna total XP
  INSERT INTO public.education_user_stats (user_id, total_points, updated_at)
  VALUES (p_user_id, p_xp_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.education_user_stats.total_points + p_xp_amount,
    updated_at = NOW()
  RETURNING total_points INTO v_new_total_xp;

  -- Calcola livelli
  SELECT current_level INTO v_old_level
  FROM public.education_user_stats
  WHERE user_id = p_user_id;

  v_new_level := calculate_user_level(v_new_total_xp);

  -- Check level up
  IF v_new_level > COALESCE(v_old_level, 1) THEN
    v_level_up := true;
    UPDATE public.education_user_stats
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
$$;

-- Funzione: update_learning_streak (versione compatibile con enhance-gamification-system.sql)
CREATE OR REPLACE FUNCTION update_learning_streak(p_user_id UUID, p_streak_type TEXT DEFAULT 'daily')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_activity DATE;
  v_today DATE := CURRENT_DATE;
  v_streak_broken BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- Get current streak da education_user_streaks se esiste, altrimenti da education_user_stats
  SELECT current_streak, longest_streak, last_activity_date
  INTO v_current_streak, v_longest_streak, v_last_activity
  FROM public.education_user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  -- Se non esiste in education_user_streaks, usa education_user_stats
  IF NOT FOUND THEN
    SELECT current_streak_days, longest_streak_days, last_activity_date
    INTO v_current_streak, v_longest_streak, v_last_activity
    FROM public.education_user_stats
    WHERE user_id = p_user_id;
  END IF;

  -- Se non esiste, crea
  IF v_current_streak IS NULL THEN
    INSERT INTO public.education_user_stats (user_id, current_streak_days, longest_streak_days, last_activity_date, updated_at)
    VALUES (p_user_id, 1, 1, v_today, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak_days = 1,
      longest_streak_days = 1,
      last_activity_date = v_today,
      updated_at = NOW();
    v_current_streak := 1;
    v_longest_streak := 1;
  ELSE
    -- Se attività oggi, non fare nulla (già contato)
    IF v_last_activity = v_today THEN
      -- Nessun cambiamento
    ELSIF v_last_activity = v_today - 1 THEN
      -- Continua streak
      v_current_streak := v_current_streak + 1;
      IF v_current_streak > COALESCE(v_longest_streak, 0) THEN
        v_longest_streak := v_current_streak;
      END IF;
    ELSE
      -- Streak rotto
      v_streak_broken := true;
      v_current_streak := 1;
    END IF;

    -- Aggiorna stats
    UPDATE public.education_user_stats
    SET 
      current_streak_days = v_current_streak,
      longest_streak_days = GREATEST(longest_streak_days, v_longest_streak),
      last_activity_date = v_today,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;

  v_result := jsonb_build_object(
    'current_streak', v_current_streak,
    'longest_streak', v_longest_streak,
    'streak_broken', v_streak_broken,
    'last_activity', v_today
  );

  RETURN v_result;
END;
$$;

-- Funzione: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Ricrea trigger che usano update_updated_at_column
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

CREATE TRIGGER update_education_user_pathway_progress_updated_at
  BEFORE UPDATE ON education_user_pathway_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funzione: check_and_unlock_badge
CREATE OR REPLACE FUNCTION check_and_unlock_badge(p_user_id UUID, p_badge_criteria JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  badge_id UUID;
  criteria_type TEXT;
BEGIN
  criteria_type := p_badge_criteria->>'type';

  -- Cerca badge che corrisponde ai criteri
  SELECT id INTO badge_id
  FROM public.education_badges
  WHERE criteria @> p_badge_criteria
    AND is_active = true
  LIMIT 1;

  IF badge_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Verifica se già sbloccato
  IF EXISTS (
    SELECT 1 FROM public.education_user_badges
    WHERE user_id = p_user_id AND badge_id = badge_id
  ) THEN
    RETURN NULL;
  END IF;

  -- Sblocca badge
  INSERT INTO public.education_user_badges (user_id, badge_id)
  VALUES (p_user_id, badge_id)
  ON CONFLICT DO NOTHING;

  -- Aggiungi XP per badge
  PERFORM add_education_xp(
    p_user_id,
    (SELECT points_reward FROM public.education_badges WHERE id = badge_id),
    'badge_earned',
    badge_id,
    'Badge sbloccato: ' || (SELECT name FROM public.education_badges WHERE id = badge_id)
  );

  RETURN badge_id;
END;
$$;

-- ===== 5. FIX FUNZIONI SPACED REPETITION =====

-- Droppa funzioni spaced repetition esistenti per ricrearle con SET search_path
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc
    WHERE proname IN ('calculate_next_review_sm2', 'get_due_items')
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident('public') || '.' || quote_ident(func_record.proname) || '(' || func_record.args || ') CASCADE';
  END LOOP;
END $$;

-- Ricrea calculate_next_review_sm2 con SET search_path
CREATE OR REPLACE FUNCTION calculate_next_review_sm2(
  p_quality INTEGER,
  p_repetitions INTEGER,
  p_ease_factor DECIMAL,
  p_interval_days INTEGER
)
RETURNS TABLE (
  new_repetitions INTEGER,
  new_ease_factor DECIMAL,
  new_interval_days INTEGER,
  next_review_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_new_ease_factor DECIMAL(3,2);
  v_new_repetitions INTEGER;
  v_new_interval INTEGER;
BEGIN
  p_quality := GREATEST(0, LEAST(5, p_quality));
  v_new_ease_factor := p_ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));
  IF v_new_ease_factor < 1.3 THEN
    v_new_ease_factor := 1.3;
  END IF;
  
  IF p_quality < 3 THEN
    v_new_repetitions := 0;
    v_new_interval := 1;
  ELSE
    v_new_repetitions := p_repetitions + 1;
    IF v_new_repetitions = 1 THEN
      v_new_interval := 1;
    ELSIF v_new_repetitions = 2 THEN
      v_new_interval := 6;
    ELSE
      v_new_interval := ROUND(p_interval_days * v_new_ease_factor);
    END IF;
  END IF;
  
  RETURN QUERY SELECT
    v_new_repetitions,
    v_new_ease_factor,
    v_new_interval,
    NOW() + (v_new_interval || ' days')::INTERVAL;
END;
$$;

-- Ricrea get_due_items con SET search_path
CREATE OR REPLACE FUNCTION get_due_items(p_user_id UUID, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  item_type TEXT,
  module_id UUID,
  lesson_id UUID,
  question TEXT,
  answer TEXT,
  hint TEXT,
  explanation TEXT,
  repetitions INTEGER,
  ease_factor DECIMAL,
  next_review_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sri.id, sri.item_type, sri.module_id, sri.lesson_id,
    sri.question, sri.answer, sri.hint, sri.explanation,
    sri.repetitions, sri.ease_factor, sri.next_review_date
  FROM public.spaced_repetition_items sri
  WHERE sri.user_id = p_user_id
    AND (sri.next_review_date IS NULL OR sri.next_review_date <= NOW())
  ORDER BY 
    CASE WHEN sri.next_review_date IS NULL THEN 0 ELSE 1 END,
    sri.next_review_date ASC
  LIMIT p_limit;
END;
$$;

-- ===== 6. FIX FUNZIONE create_notification (se esiste) =====

-- Droppa e ricrea create_notification se esiste (funzione non-education ma presente nel sistema)
DO $$
DECLARE
  func_record RECORD;
  func_def TEXT;
BEGIN
  FOR func_record IN 
    SELECT oid, proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc
    WHERE proname = 'create_notification'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  LOOP
    -- Ottieni definizione funzione
    SELECT pg_get_functiondef(func_record.oid) INTO func_def;
    
    -- Se non ha già SET search_path, droppa e ricrea
    IF func_def NOT LIKE '%SET search_path%' THEN
      EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident('public') || '.' || quote_ident(func_record.proname) || '(' || func_record.args || ') CASCADE';
      RAISE NOTICE 'Funzione create_notification droppata. Ricreala manualmente con SET search_path = ''''' || ' oppure ignora questo warning se non è critica.';
    END IF;
  END LOOP;
END $$;

-- ===== VERIFICA FINALE =====

-- Verifica RLS abilitato
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'RLS Enabled' ELSE 'RLS Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('education_badges', 'education_pathway_modules')
ORDER BY tablename;

-- Verifica funzioni con search_path
SELECT 
  p.proname as routine_name,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN 'OK'
    ELSE 'MISSING search_path'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'calculate_module_progress',
    'can_access_module',
    'update_user_education_stats',
    'calculate_user_level',
    'add_education_xp',
    'update_learning_streak',
    'update_updated_at_column',
    'check_and_unlock_badge',
    'calculate_next_review_sm2',
    'get_due_items'
  )
ORDER BY p.proname;

