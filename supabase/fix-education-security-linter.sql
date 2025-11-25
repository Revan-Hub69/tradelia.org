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
DROP FUNCTION IF EXISTS calculate_module_progress(UUID, UUID);
DROP FUNCTION IF EXISTS can_access_module(UUID, UUID);
DROP FUNCTION IF EXISTS update_user_education_stats(UUID);
DROP FUNCTION IF EXISTS calculate_user_level(INTEGER);
DROP FUNCTION IF EXISTS add_education_xp(UUID, INTEGER, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS update_learning_streak(UUID);
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS check_and_unlock_badge(UUID, JSONB);

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

-- Funzione: add_education_xp
CREATE OR REPLACE FUNCTION add_education_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_source_type TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_total_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Aggiungi XP
  INSERT INTO public.education_user_stats (user_id, total_points, updated_at)
  VALUES (p_user_id, p_xp_amount, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = public.education_user_stats.total_points + p_xp_amount,
    updated_at = NOW();

  -- Registra transazione
  INSERT INTO public.education_xp_transactions (user_id, xp_amount, source_type, source_id, description)
  VALUES (p_user_id, p_xp_amount, p_source_type, p_source_id, p_description);

  -- Calcola nuovo livello
  SELECT total_points INTO new_total_xp
  FROM public.education_user_stats
  WHERE user_id = p_user_id;

  new_level := calculate_user_level(new_total_xp);

  -- Aggiorna livello se cambiato
  UPDATE public.education_user_stats
  SET current_level = new_level
  WHERE user_id = p_user_id AND current_level != new_level;
END;
$$;

-- Funzione: update_learning_streak
CREATE OR REPLACE FUNCTION update_learning_streak(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  last_activity DATE;
  current_streak INTEGER;
  longest_streak INTEGER;
  today_date DATE := CURRENT_DATE;
BEGIN
  SELECT last_activity_date, current_streak_days, longest_streak_days
  INTO last_activity, current_streak, longest_streak
  FROM public.education_user_stats
  WHERE user_id = p_user_id;

  IF last_activity IS NULL OR last_activity < today_date - INTERVAL '1 day' THEN
    -- Streak rotto, resetta
    current_streak := 1;
  ELSIF last_activity = today_date THEN
    -- Già aggiornato oggi, non fare nulla
    RETURN;
  ELSE
    -- Continua streak
    current_streak := COALESCE(current_streak, 0) + 1;
  END IF;

  -- Aggiorna longest streak se necessario
  IF current_streak > COALESCE(longest_streak, 0) THEN
    longest_streak := current_streak;
  END IF;

  -- Aggiorna stats
  UPDATE public.education_user_stats
  SET 
    current_streak_days = current_streak,
    longest_streak_days = longest_streak,
    last_activity_date = today_date,
    updated_at = NOW()
  WHERE user_id = p_user_id;
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

-- Funzione: calculate_next_review_sm2 (da seed-education-spaced-repetition.sql)
-- Nota: Questa funzione deve essere aggiornata nel file spaced-repetition.sql
-- Per ora aggiungiamo solo il SET search_path se esiste

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'calculate_next_review_sm2') THEN
    -- La funzione esiste, ma non possiamo modificarla qui
    -- Deve essere aggiornata nel file spaced-repetition.sql
    RAISE NOTICE 'Funzione calculate_next_review_sm2 esiste. Aggiorna seed-education-spaced-repetition.sql per aggiungere SET search_path';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_due_items') THEN
    RAISE NOTICE 'Funzione get_due_items esiste. Aggiorna seed-education-spaced-repetition.sql per aggiungere SET search_path';
  END IF;
END $$;

-- ===== 6. FIX FUNZIONE create_notification (se esiste) =====

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_notification') THEN
    RAISE NOTICE 'Funzione create_notification esiste. Aggiorna il file che la crea per aggiungere SET search_path';
  END IF;
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
  routine_name,
  CASE 
    WHEN pg_get_functiondef(oid) LIKE '%SET search_path%' THEN 'OK'
    ELSE 'MISSING search_path'
  END as search_path_status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'calculate_module_progress',
    'can_access_module',
    'update_user_education_stats',
    'calculate_user_level',
    'add_education_xp',
    'update_learning_streak',
    'update_updated_at_column',
    'check_and_unlock_badge'
  )
ORDER BY routine_name;

