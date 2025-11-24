-- ============================================
-- ENHANCEMENT: SISTEMA EDUCATIVO AVANZATO
-- ============================================
-- Aggiunge best practice per apprendimento avanzato:
-- - Quiz interattivi durante lezioni (non solo test finale)
-- - Learning Objectives espliciti
-- - Spaced Repetition System
-- - Progress tracking avanzato
-- - Adaptive difficulty
-- ============================================

-- ===== 1. LEARNING OBJECTIVES =====
-- Obiettivi di apprendimento espliciti per ogni modulo/lezione (Bloom's Taxonomy)

CREATE TABLE IF NOT EXISTS education_learning_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES education_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES education_lessons(id) ON DELETE CASCADE,
  objective_text TEXT NOT NULL,
  bloom_level TEXT NOT NULL CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(COALESCE(module_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(lesson_id, '00000000-0000-0000-0000-000000000000'::UUID), order_index)
);

CREATE INDEX IF NOT EXISTS idx_learning_objectives_module ON education_learning_objectives(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_objectives_lesson ON education_learning_objectives(lesson_id);

-- ===== 2. LESSON QUIZZES (Quiz Interattivi Durante Lezioni) =====
-- Quiz embedded nelle lezioni per retrieval practice immediato

CREATE TABLE IF NOT EXISTS education_lesson_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES education_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position_in_lesson TEXT NOT NULL CHECK (position_in_lesson IN ('start', 'middle', 'end', 'checkpoint')), -- Quando mostrare il quiz
  checkpoint_paragraph INTEGER, -- Se position = 'checkpoint', dopo quale paragrafo
  question_count INTEGER DEFAULT 3, -- Numero domande da mostrare
  is_required BOOLEAN DEFAULT false, -- Deve essere completato per proseguire?
  show_immediate_feedback BOOLEAN DEFAULT true,
  allow_retry BOOLEAN DEFAULT true,
  points_reward INTEGER DEFAULT 0, -- XP per completamento
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_id, order_index)
);

-- Domande per lesson quizzes (riutilizza education_questions o crea nuove)
CREATE TABLE IF NOT EXISTS education_lesson_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_quiz_id UUID NOT NULL REFERENCES education_lesson_quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES education_questions(id) ON DELETE SET NULL, -- Riusa domanda esistente
  -- Oppure domanda custom per questo quiz
  question_text TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  order_index INTEGER NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lesson_quiz_id, order_index)
);

-- Opzioni per lesson quiz questions
CREATE TABLE IF NOT EXISTS education_lesson_quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES education_lesson_quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, order_index)
);

-- Risposte utente ai lesson quizzes
CREATE TABLE IF NOT EXISTS education_user_lesson_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_quiz_id UUID NOT NULL REFERENCES education_lesson_quizzes(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  time_spent_seconds INTEGER,
  answers JSONB, -- {question_id: {option_id: ..., is_correct: ...}}
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_quizzes_lesson ON education_lesson_quizzes(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lesson_quiz_questions ON education_lesson_quiz_questions(lesson_quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_lesson_quiz_attempts ON education_user_lesson_quiz_attempts(user_id, lesson_quiz_id);

-- ===== 3. SPACED REPETITION SYSTEM =====
-- Sistema per ripasso ottimizzato basato su algoritmo SM-2 (SuperMemo)

CREATE TABLE IF NOT EXISTS education_spaced_repetition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES education_questions(id) ON DELETE CASCADE,
  -- Parametri algoritmo SM-2
  ease_factor DECIMAL(3,2) DEFAULT 2.50, -- Fattore facilità (min 1.3, max 2.5)
  interval_days INTEGER DEFAULT 1, -- Giorni fino prossimo ripasso
  repetitions INTEGER DEFAULT 0, -- Numero ripassi completati
  next_review_date DATE NOT NULL, -- Data prossimo ripasso
  last_review_date DATE,
  -- Performance tracking
  total_reviews INTEGER DEFAULT 0,
  correct_reviews INTEGER DEFAULT 0,
  streak_correct INTEGER DEFAULT 0, -- Serie di risposte corrette consecutive
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Sessioni di spaced repetition
CREATE TABLE IF NOT EXISTS education_spaced_repetition_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('daily_review', 'focused_review', 'weak_areas')),
  questions_reviewed INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  time_spent_minutes INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spaced_rep_user ON education_spaced_repetition(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_review_date ON education_spaced_repetition(next_review_date) WHERE next_review_date <= CURRENT_DATE + INTERVAL '7 days';

-- ===== 4. ADAPTIVE DIFFICULTY TRACKING =====
-- Traccia performance per ogni domanda e adatta difficoltà

CREATE TABLE IF NOT EXISTS education_question_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES education_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = globale
  -- Statistiche
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  average_time_seconds INTEGER,
  difficulty_score DECIMAL(3,2), -- 0.0 (facile) - 1.0 (difficile), calcolato da performance
  -- Timestamps
  first_attempt_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::UUID))
);

CREATE INDEX IF NOT EXISTS idx_question_performance_question ON education_question_performance(question_id);
CREATE INDEX IF NOT EXISTS idx_question_performance_user ON education_question_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_question_performance_difficulty ON education_question_performance(difficulty_score);

-- ===== 5. REFLECTION PROMPTS =====
-- Prompt per metacognition e self-reflection

CREATE TABLE IF NOT EXISTS education_reflection_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES education_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES education_lessons(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('pre_lesson', 'post_lesson', 'mid_module', 'post_module')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(COALESCE(module_id, '00000000-0000-0000-0000-000000000000'::UUID), COALESCE(lesson_id, '00000000-0000-0000-0000-000000000000'::UUID), prompt_type, order_index)
);

-- Risposte utente ai reflection prompts
CREATE TABLE IF NOT EXISTS education_user_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES education_reflection_prompts(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS idx_reflection_prompts_module ON education_reflection_prompts(module_id);
CREATE INDEX IF NOT EXISTS idx_reflection_prompts_lesson ON education_reflection_prompts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_reflections ON education_user_reflections(user_id, prompt_id);

-- ===== 6. FUNZIONI SPACED REPETITION (Algoritmo SM-2) =====

-- Funzione per aggiornare spaced repetition dopo risposta
-- Paper: SuperMemo Algorithm SM-2 (Wozniak, 1987)
CREATE OR REPLACE FUNCTION update_spaced_repetition(
  p_user_id UUID,
  p_question_id UUID,
  p_quality INTEGER -- 0-5: qualità risposta (0=completamente sbagliato, 5=perfetto)
)
RETURNS JSONB AS $$
DECLARE
  v_record RECORD;
  v_new_ease_factor DECIMAL(3,2);
  v_new_interval INTEGER;
  v_new_repetitions INTEGER;
  v_result JSONB;
BEGIN
  -- Recupera record esistente o crea nuovo
  SELECT * INTO v_record
  FROM education_spaced_repetition
  WHERE user_id = p_user_id AND question_id = p_question_id;

  IF NOT FOUND THEN
    -- Prima volta: crea nuovo record
    INSERT INTO education_spaced_repetition (
      user_id, question_id, ease_factor, interval_days, repetitions,
      next_review_date, last_review_date, total_reviews, correct_reviews
    ) VALUES (
      p_user_id, p_question_id, 2.50, 1, 0,
      CURRENT_DATE + 1, CURRENT_DATE, 1,
      CASE WHEN p_quality >= 3 THEN 1 ELSE 0 END
    );
    
    v_result := jsonb_build_object(
      'next_review_date', CURRENT_DATE + 1,
      'interval_days', 1,
      'ease_factor', 2.50
    );
    RETURN v_result;
  END IF;

  -- Algoritmo SM-2
  -- Se qualità < 3, reset
  IF p_quality < 3 THEN
    v_new_ease_factor := GREATEST(1.30, v_record.ease_factor - 0.15);
    v_new_interval := 1;
    v_new_repetitions := 0;
  ELSE
    -- Calcola nuovo ease factor
    v_new_ease_factor := v_record.ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));
    v_new_ease_factor := GREATEST(1.30, LEAST(2.50, v_new_ease_factor));
    
    -- Calcola nuovo interval
    IF v_record.repetitions = 0 THEN
      v_new_interval := 1;
    ELSIF v_record.repetitions = 1 THEN
      v_new_interval := 6;
    ELSE
      v_new_interval := ROUND(v_record.interval_days * v_new_ease_factor)::INTEGER;
    END IF;
    
    v_new_repetitions := v_record.repetitions + 1;
  END IF;

  -- Aggiorna record
  UPDATE education_spaced_repetition
  SET
    ease_factor = v_new_ease_factor,
    interval_days = v_new_interval,
    repetitions = v_new_repetitions,
    next_review_date = CURRENT_DATE + v_new_interval,
    last_review_date = CURRENT_DATE,
    total_reviews = total_reviews + 1,
    correct_reviews = correct_reviews + CASE WHEN p_quality >= 3 THEN 1 ELSE 0 END,
    streak_correct = CASE 
      WHEN p_quality >= 3 THEN streak_correct + 1 
      ELSE 0 
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id AND question_id = p_question_id;

  v_result := jsonb_build_object(
    'next_review_date', CURRENT_DATE + v_new_interval,
    'interval_days', v_new_interval,
    'ease_factor', v_new_ease_factor,
    'repetitions', v_new_repetitions
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Funzione per ottenere domande da ripassare oggi (spaced repetition)
CREATE OR REPLACE FUNCTION get_spaced_repetition_questions(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  question_id UUID,
  test_id UUID,
  question_text TEXT,
  question_type TEXT,
  bloom_level TEXT,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.test_id,
    q.question_text,
    q.question_type,
    q.bloom_level,
    (CURRENT_DATE - sr.next_review_date)::INTEGER as days_overdue
  FROM education_spaced_repetition sr
  JOIN education_questions q ON q.id = sr.question_id
  WHERE sr.user_id = p_user_id
    AND sr.next_review_date <= CURRENT_DATE
    AND q.is_active = true
  ORDER BY 
    sr.next_review_date ASC, -- Prima quelle più in ritardo
    sr.ease_factor ASC -- Poi quelle più difficili
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ===== 7. FUNZIONE PER AGGIORNARE DIFFICULTY SCORE =====

CREATE OR REPLACE FUNCTION update_question_difficulty(p_question_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  v_total_attempts INTEGER;
  v_correct_attempts INTEGER;
  v_difficulty DECIMAL(3,2);
BEGIN
  SELECT 
    total_attempts,
    correct_attempts
  INTO v_total_attempts, v_correct_attempts
  FROM education_question_performance
  WHERE question_id = p_question_id AND user_id IS NULL; -- Globale

  IF v_total_attempts = 0 THEN
    RETURN 0.50; -- Default: media difficoltà
  END IF;

  -- Calcola difficoltà: 1 - (correct_rate)
  -- 0.0 = facile (tutti rispondono correttamente)
  -- 1.0 = difficile (nessuno risponde correttamente)
  v_difficulty := 1.0 - (v_correct_attempts::DECIMAL / v_total_attempts::DECIMAL);
  v_difficulty := GREATEST(0.0, LEAST(1.0, v_difficulty));

  -- Aggiorna
  UPDATE education_question_performance
  SET difficulty_score = v_difficulty, updated_at = NOW()
  WHERE question_id = p_question_id AND user_id IS NULL;

  RETURN v_difficulty;
END;
$$ LANGUAGE plpgsql;

-- ===== 8. RLS POLICIES =====

ALTER TABLE education_learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_lesson_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_lesson_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_lesson_quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_lesson_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_spaced_repetition ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_spaced_repetition_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_question_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_reflection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_user_reflections ENABLE ROW LEVEL SECURITY;

-- Public read per learning objectives, lesson quizzes, reflection prompts
CREATE POLICY "Public can view learning objectives"
  ON education_learning_objectives FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view lesson quizzes"
  ON education_lesson_quizzes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view lesson quiz questions"
  ON education_lesson_quiz_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view lesson quiz options"
  ON education_lesson_quiz_options FOR SELECT
  USING (true);

CREATE POLICY "Public can view reflection prompts"
  ON education_reflection_prompts FOR SELECT
  USING (is_active = true);

-- User-specific per spaced repetition, attempts, reflections
CREATE POLICY "Users can manage own spaced repetition"
  ON education_spaced_repetition FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own spaced repetition sessions"
  ON education_spaced_repetition_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own lesson quiz attempts"
  ON education_user_lesson_quiz_attempts FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reflections"
  ON education_user_reflections FOR ALL
  USING (auth.uid() = user_id);

-- Question performance: users can view global, manage own
CREATE POLICY "Public can view global question performance"
  ON education_question_performance FOR SELECT
  USING (user_id IS NULL);

CREATE POLICY "Users can manage own question performance"
  ON education_question_performance FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ===== 9. TRIGGERS =====

CREATE TRIGGER update_lesson_quizzes_updated_at
  BEFORE UPDATE ON education_lesson_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaced_rep_updated_at
  BEFORE UPDATE ON education_spaced_repetition
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_performance_updated_at
  BEFORE UPDATE ON education_question_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reflections_updated_at
  BEFORE UPDATE ON education_user_reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===== 10. COMMENTI DOCUMENTAZIONE =====

COMMENT ON TABLE education_learning_objectives IS 'Obiettivi di apprendimento espliciti (Bloom Taxonomy) per moduli/lezioni';
COMMENT ON TABLE education_lesson_quizzes IS 'Quiz interattivi embedded nelle lezioni per retrieval practice immediato';
COMMENT ON TABLE education_spaced_repetition IS 'Sistema spaced repetition (algoritmo SM-2) per ripasso ottimizzato';
COMMENT ON TABLE education_question_performance IS 'Tracking performance per adaptive difficulty e analytics';
COMMENT ON TABLE education_reflection_prompts IS 'Prompt per metacognition e self-regulated learning';

COMMENT ON FUNCTION update_spaced_repetition IS 'Aggiorna spaced repetition usando algoritmo SM-2 (SuperMemo)';
COMMENT ON FUNCTION get_spaced_repetition_questions IS 'Restituisce domande da ripassare oggi basate su spaced repetition';
COMMENT ON FUNCTION update_question_difficulty IS 'Calcola e aggiorna difficulty score basato su performance globale';
