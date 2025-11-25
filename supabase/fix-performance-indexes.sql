-- =====================================================
-- PERFORMANCE OPTIMIZATION: INDEX MANCANTI
-- Fase 3: Performance - Ottimizzazione Query
-- =====================================================

-- ===== INDEX PER FOREIGN KEYS E QUERY FREQUENTI =====

-- Index per education_lessons (query frequente: module_id + order_index)
CREATE INDEX IF NOT EXISTS idx_education_lessons_module_order 
  ON education_lessons(module_id, order_index) 
  WHERE is_active = true;

-- Index per education_questions (query frequente: test_id + order_index)
CREATE INDEX IF NOT EXISTS idx_education_questions_test_order 
  ON education_questions(test_id, order_index) 
  WHERE is_active = true;

-- Index per education_question_options (query frequente: question_id + order_index)
CREATE INDEX IF NOT EXISTS idx_education_question_options_question_order 
  ON education_question_options(question_id, order_index);

-- Index per education_user_lesson_progress (query frequente: user_id + lesson_id)
CREATE INDEX IF NOT EXISTS idx_education_user_lesson_progress_user_lesson 
  ON education_user_lesson_progress(user_id, lesson_id);

-- Index per education_user_lesson_progress (query frequente: status)
CREATE INDEX IF NOT EXISTS idx_education_user_lesson_progress_status 
  ON education_user_lesson_progress(status) 
  WHERE status = 'completed';

-- Index per education_user_test_attempts (query frequente: user_id + test_id + attempt_number)
CREATE INDEX IF NOT EXISTS idx_education_user_test_attempts_user_test_attempt 
  ON education_user_test_attempts(user_id, test_id, attempt_number DESC);

-- Index per spaced_repetition_items (query frequente: user_id + next_review_date)
-- Verifica se la tabella esiste prima di creare l'index
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spaced_repetition_items') THEN
    CREATE INDEX IF NOT EXISTS idx_spaced_repetition_items_user_next_review 
      ON spaced_repetition_items(user_id, next_review_date) 
      WHERE next_review_date IS NOT NULL;
  END IF;
END $$;

-- Index per spaced_repetition_items (query frequente: user_id + module_id + lesson_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spaced_repetition_items') THEN
    CREATE INDEX IF NOT EXISTS idx_spaced_repetition_items_user_module_lesson 
      ON spaced_repetition_items(user_id, module_id, lesson_id);
  END IF;
END $$;

-- Index per adaptive_learning_progress (query frequente: user_id + module_id)
-- Verifica se la tabella esiste prima di creare l'index
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'adaptive_learning_progress') THEN
    CREATE INDEX IF NOT EXISTS idx_adaptive_learning_progress_user_module 
      ON adaptive_learning_progress(user_id, module_id);
  END IF;
END $$;

-- Index per education_pathway_modules (query frequente: pathway_id + order_index)
-- Verifica se la tabella esiste prima di creare l'index
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'education_pathway_modules') THEN
    CREATE INDEX IF NOT EXISTS idx_education_pathway_modules_pathway_order 
      ON education_pathway_modules(pathway_id, order_index);
  END IF;
END $$;

-- Index per education_user_pathway_progress (query frequente: user_id + pathway_id)
-- Verifica se la tabella esiste prima di creare l'index
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'education_user_pathway_progress') THEN
    CREATE INDEX IF NOT EXISTS idx_education_user_pathway_progress_user_pathway 
      ON education_user_pathway_progress(user_id, pathway_id);
  END IF;
END $$;

-- ===== GIN INDEX PER JSONB (Query JSONB più veloci) =====
-- Solo se le colonne JSONB esistono

-- Index GIN per criteria JSONB in education_badges (se esiste)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'education_badges' 
    AND column_name = 'criteria'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_education_badges_criteria_gin 
      ON education_badges USING GIN (criteria) 
      WHERE criteria IS NOT NULL;
  END IF;
END $$;

-- Index GIN per answers JSONB in education_user_test_attempts (se esiste)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'education_user_test_attempts' 
    AND column_name = 'answers'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_education_user_test_attempts_answers_gin 
      ON education_user_test_attempts USING GIN (answers) 
      WHERE answers IS NOT NULL;
  END IF;
END $$;

-- ===== INDEX PER TIMESTAMP (Query per date range) =====

-- Index per created_at in education_modules (query per moduli recenti)
CREATE INDEX IF NOT EXISTS idx_education_modules_created_at 
  ON education_modules(created_at DESC) 
  WHERE is_active = true;

-- Index per last_accessed_at in education_user_progress (query per attività recente)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'education_user_progress' 
    AND column_name = 'last_accessed_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_education_user_progress_last_accessed 
      ON education_user_progress(last_accessed_at DESC) 
      WHERE last_accessed_at IS NOT NULL;
  END IF;
END $$;

-- Index per completed_at in education_user_lesson_progress (query per completamenti recenti)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'education_user_lesson_progress' 
    AND column_name = 'completed_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_education_user_lesson_progress_completed_at 
      ON education_user_lesson_progress(completed_at DESC) 
      WHERE completed_at IS NOT NULL;
  END IF;
END $$;

-- ===== INDEX COMPOSITI PER QUERY COMPLESSE =====

-- Index composito per education_user_progress (query: user_id + status + progress_percentage)
CREATE INDEX IF NOT EXISTS idx_education_user_progress_user_status_progress 
  ON education_user_progress(user_id, status, progress_percentage DESC);

-- Index composito per education_user_stats (query: user_id + current_level)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'education_user_stats') THEN
    CREATE INDEX IF NOT EXISTS idx_education_user_stats_user_level 
      ON education_user_stats(user_id, current_level DESC);
  END IF;
END $$;

-- ===== ANALYZE TABLES (Aggiorna statistiche per query planner) =====

ANALYZE education_modules;
ANALYZE education_lessons;
ANALYZE education_tests;
ANALYZE education_questions;
ANALYZE education_question_options;
ANALYZE education_user_progress;
ANALYZE education_user_lesson_progress;
ANALYZE education_user_test_attempts;

-- Analizza tabelle opzionali solo se esistono
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spaced_repetition_items') THEN
    ANALYZE spaced_repetition_items;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'adaptive_learning_progress') THEN
    ANALYZE adaptive_learning_progress;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'education_user_stats') THEN
    ANALYZE education_user_stats;
  END IF;
END $$;

-- ===== VERIFICA INDEX CREATI =====

-- Query per verificare tutti gli index creati
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    tablename LIKE 'education_%'
    OR tablename LIKE 'spaced_%'
    OR tablename LIKE 'adaptive_%'
  )
ORDER BY tablename, indexname;
