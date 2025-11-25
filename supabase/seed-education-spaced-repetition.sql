-- ============================================================================
-- Spaced Repetition System - Database Schema
-- Best Practice 2025: SM-2 Algorithm (Anki-style)
-- Research: Wozniak (1990), Ebbinghaus (1885), Roediger & Karpicke (2006)
-- ============================================================================

-- Table: spaced_repetition_items
CREATE TABLE IF NOT EXISTS spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('concept', 'formula', 'definition', 'key_point', 'formula_application', 'case_study')),
  module_id UUID REFERENCES education_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES education_lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  explanation TEXT,
  metadata JSONB DEFAULT '{}',
  repetitions INTEGER DEFAULT 0,
  ease_factor DECIMAL(3,2) DEFAULT 2.5 CHECK (ease_factor >= 1.3),
  interval_days INTEGER DEFAULT 0,
  next_review_date TIMESTAMPTZ,
  last_review_date TIMESTAMPTZ,
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  average_quality DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_item UNIQUE(user_id, module_id, lesson_id, content)
);

CREATE INDEX IF NOT EXISTS idx_sr_items_user_next_review ON spaced_repetition_items(user_id, next_review_date) WHERE next_review_date IS NOT NULL;
-- Note: Cannot use NOW() in index predicate (not IMMUTABLE). Query will filter at runtime.

-- Table: spaced_repetition_reviews
CREATE TABLE IF NOT EXISTS spaced_repetition_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES spaced_repetition_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 5),
  review_duration_seconds INTEGER,
  review_date TIMESTAMPTZ DEFAULT NOW(),
  new_repetitions INTEGER,
  new_ease_factor DECIMAL(3,2),
  new_interval_days INTEGER,
  new_next_review_date TIMESTAMPTZ,
  device_type TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: adaptive_learning_progress
CREATE TABLE IF NOT EXISTS adaptive_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES education_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES education_lessons(id) ON DELETE CASCADE,
  mastery_score DECIMAL(5,2) DEFAULT 0 CHECK (mastery_score >= 0 AND mastery_score <= 100),
  mastery_threshold DECIMAL(5,2) DEFAULT 80,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  base_difficulty INTEGER DEFAULT 1,
  total_attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  average_response_time_seconds INTEGER,
  learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading', 'mixed')),
  first_attempt_date TIMESTAMPTZ,
  last_attempt_date TIMESTAMPTZ,
  mastery_achieved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_lesson_progress UNIQUE(user_id, lesson_id)
);

-- Function: Calculate next review (SM-2 Algorithm)
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

-- Function: Get due items
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

-- RLS Policies
ALTER TABLE spaced_repetition_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaced_repetition_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE adaptive_learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own spaced repetition items"
  ON spaced_repetition_items FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reviews"
  ON spaced_repetition_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON spaced_repetition_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own adaptive progress"
  ON adaptive_learning_progress FOR ALL
  USING (auth.uid() = user_id);

-- Grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON spaced_repetition_items TO authenticated;
GRANT ALL ON spaced_repetition_reviews TO authenticated;
GRANT ALL ON adaptive_learning_progress TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_next_review_sm2 TO authenticated;
GRANT EXECUTE ON FUNCTION get_due_items TO authenticated;
