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
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_items_user_next_review 
  ON spaced_repetition_items(user_id, next_review_date) 
  WHERE next_review_date IS NOT NULL;

-- Index per spaced_repetition_items (query frequente: user_id + module_id + lesson_id)
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_items_user_module_lesson 
  ON spaced_repetition_items(user_id, module_id, lesson_id);

-- Index per adaptive_learning_progress (query frequente: user_id + module_id)
CREATE INDEX IF NOT EXISTS idx_adaptive_learning_progress_user_module 
  ON adaptive_learning_progress(user_id, module_id);

-- Index per education_pathway_modules (query frequente: pathway_id + order_index)
CREATE INDEX IF NOT EXISTS idx_education_pathway_modules_pathway_order 
  ON education_pathway_modules(pathway_id, order_index);

-- Index per education_user_pathway_progress (query frequente: user_id + pathway_id)
CREATE INDEX IF NOT EXISTS idx_education_user_pathway_progress_user_pathway 
  ON education_user_pathway_progress(user_id, pathway_id);

-- ===== GIN INDEX PER JSONB (Query JSONB più veloci) =====

-- Index GIN per prerequisites JSONB in education_modules
CREATE INDEX IF NOT EXISTS idx_education_modules_prerequisites_gin 
  ON education_modules USING GIN (prerequisites) 
  WHERE prerequisites IS NOT NULL;

-- Index GIN per criteria JSONB in education_badges
CREATE INDEX IF NOT EXISTS idx_education_badges_criteria_gin 
  ON education_badges USING GIN (criteria) 
  WHERE criteria IS NOT NULL;

-- Index GIN per answers JSONB in education_user_test_attempts
CREATE INDEX IF NOT EXISTS idx_education_user_test_attempts_answers_gin 
  ON education_user_test_attempts USING GIN (answers) 
  WHERE answers IS NOT NULL;

-- ===== INDEX PER TIMESTAMP (Query per date range) =====

-- Index per created_at in education_modules (query per moduli recenti)
CREATE INDEX IF NOT EXISTS idx_education_modules_created_at 
  ON education_modules(created_at DESC) 
  WHERE is_active = true;

-- Index per last_accessed_at in education_user_progress (query per attività recente)
CREATE INDEX IF NOT EXISTS idx_education_user_progress_last_accessed 
  ON education_user_progress(last_accessed_at DESC) 
  WHERE last_accessed_at IS NOT NULL;

-- Index per completed_at in education_user_lesson_progress (query per completamenti recenti)
CREATE INDEX IF NOT EXISTS idx_education_user_lesson_progress_completed_at 
  ON education_user_lesson_progress(completed_at DESC) 
  WHERE completed_at IS NOT NULL;

-- ===== INDEX COMPOSITI PER QUERY COMPLESSE =====

-- Index composito per education_user_progress (query: user_id + status + progress_percentage)
CREATE INDEX IF NOT EXISTS idx_education_user_progress_user_status_progress 
  ON education_user_progress(user_id, status, progress_percentage DESC);

-- Index composito per education_user_stats (query: user_id + current_level)
CREATE INDEX IF NOT EXISTS idx_education_user_stats_user_level 
  ON education_user_stats(user_id, current_level DESC);

-- ===== ANALYZE TABLES (Aggiorna statistiche per query planner) =====

ANALYZE education_modules;
ANALYZE education_lessons;
ANALYZE education_tests;
ANALYZE education_questions;
ANALYZE education_question_options;
ANALYZE education_user_progress;
ANALYZE education_user_lesson_progress;
ANALYZE education_user_test_attempts;
ANALYZE spaced_repetition_items;
ANALYZE adaptive_learning_progress;

-- ===== VERIFICA INDEX CREATI =====

-- Query per verificare tutti gli index creati
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE 'education_%'
  OR tablename LIKE 'spaced_%'
  OR tablename LIKE 'adaptive_%'
ORDER BY tablename, indexname;

