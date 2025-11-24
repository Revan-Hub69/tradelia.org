-- ============================================
-- ESEMPIO: Popolare Advanced Features
-- ============================================
-- Questo script mostra come popolare:
-- 1. Learning Objectives
-- 2. Lesson Quizzes (quiz interattivi durante lezioni)
-- 3. Reflection Prompts
-- ============================================
-- Usa questo come template per tutti i moduli
-- ============================================

DO $$
DECLARE
  v_module_1_id UUID;
  v_lesson_1_id UUID;
  v_lesson_2_id UUID;
  v_quiz_start_id UUID;
  v_quiz_end_id UUID;
  v_q1_id UUID;
  v_q2_id UUID;
  v_q3_id UUID;
BEGIN
  -- Ottieni Modulo 1 (Fondamenti)
  SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  
  IF v_module_1_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 1 deve esistere. Esegui prima seed-education-content.sql';
  END IF;

  -- Ottieni Lezione 1 (Cos'è un investimento?)
  SELECT id INTO v_lesson_1_id FROM education_lessons 
  WHERE module_id = v_module_1_id AND order_index = 1;
  
  IF v_lesson_1_id IS NULL THEN
    RAISE EXCEPTION 'Lezione 1 deve esistere';
  END IF;

  -- ===== 1. LEARNING OBJECTIVES =====
  -- Obiettivi per Modulo 1
  INSERT INTO education_learning_objectives (module_id, objective_text, bloom_level, order_index) VALUES
  (v_module_1_id, 'Definire cosa è un investimento e distinguerlo da risparmio', 'remember', 1),
  (v_module_1_id, 'Spiegare i principi base di diversificazione del portafoglio', 'understand', 2),
  (v_module_1_id, 'Applicare concetti di rischio e rendimento in scenari reali', 'apply', 3),
  (v_module_1_id, 'Analizzare impatto di costi e commissioni su rendimenti', 'analyze', 4),
  (v_module_1_id, 'Valutare strategie di investimento per obiettivi personali', 'evaluate', 5)
  ON CONFLICT DO NOTHING;

  -- Obiettivi per Lezione 1
  INSERT INTO education_learning_objectives (lesson_id, objective_text, bloom_level, order_index) VALUES
  (v_lesson_1_id, 'Definire investimento vs risparmio', 'remember', 1),
  (v_lesson_1_id, 'Spiegare differenza tra asset e passività', 'understand', 2),
  (v_lesson_1_id, 'Identificare esempi di investimenti', 'apply', 3)
  ON CONFLICT DO NOTHING;

  -- ===== 2. LESSON QUIZ: START (Prima della Lezione) =====
  -- Quiz iniziale per attivare conoscenze pregresse
  
  INSERT INTO education_lesson_quizzes (
    lesson_id, title, description, position_in_lesson, question_count,
    is_required, show_immediate_feedback, allow_retry, points_reward, order_index
  ) VALUES (
    v_lesson_1_id,
    'Quiz Iniziale: Cosa Sai Già?',
    'Rispondi a queste domande per attivare le tue conoscenze pregresse',
    'start',
    3,
    false, -- Non required, ma consigliato
    true,
    true,
    10, -- 10 XP
    1
  ) ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_quiz_start_id;

  IF v_quiz_start_id IS NULL THEN
    SELECT id INTO v_quiz_start_id FROM education_lesson_quizzes 
    WHERE lesson_id = v_lesson_1_id AND order_index = 1;
  END IF;

  -- Domanda 1: Cos'è un investimento?
  INSERT INTO education_lesson_quiz_questions (
    lesson_quiz_id, question_text, question_type, order_index, points, explanation, bloom_level
  ) VALUES (
    v_quiz_start_id,
    'Quale delle seguenti è un investimento?',
    'multiple_choice',
    1,
    1,
    'Un investimento è un asset che genera rendimento nel tempo. Il conto corrente non genera rendimento significativo.',
    'remember'
  ) ON CONFLICT (lesson_quiz_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q1_id;

  IF v_q1_id IS NULL THEN
    SELECT id INTO v_q1_id FROM education_lesson_quiz_questions 
    WHERE lesson_quiz_id = v_quiz_start_id AND order_index = 1;
  END IF;

  INSERT INTO education_lesson_quiz_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q1_id, 'Conto corrente con €1,000', false, 1, 'Il conto corrente non genera rendimento significativo'),
  (v_q1_id, 'Azione di un''azienda quotata', true, 2, 'Corretto! Le azioni possono generare dividendi e plusvalenze'),
  (v_q1_id, 'Prestito a un amico senza interessi', false, 3, 'Non è un investimento, è un prestito senza rendimento'),
  (v_q1_id, 'Spesa per cena al ristorante', false, 4, 'È una spesa, non un investimento')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 2: Investimento vs Risparmio
  INSERT INTO education_lesson_quiz_questions (
    lesson_quiz_id, question_text, question_type, order_index, points, explanation, bloom_level
  ) VALUES (
    v_quiz_start_id,
    'Qual è la differenza principale tra investimento e risparmio?',
    'multiple_choice',
    2,
    1,
    'L''investimento cerca rendimento (con rischio), il risparmio preserva capitale (basso rischio).',
    'understand'
  ) ON CONFLICT (lesson_quiz_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q2_id;

  IF v_q2_id IS NULL THEN
    SELECT id INTO v_q2_id FROM education_lesson_quiz_questions 
    WHERE lesson_quiz_id = v_quiz_start_id AND order_index = 2;
  END IF;

  INSERT INTO education_lesson_quiz_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q2_id, 'Nessuna differenza, sono la stessa cosa', false, 1, 'Sono concetti diversi'),
  (v_q2_id, 'Investimento cerca rendimento (con rischio), risparmio preserva capitale', true, 2, 'Corretto!'),
  (v_q2_id, 'Risparmio è sempre migliore', false, 3, 'Dipende da obiettivi e time horizon'),
  (v_q2_id, 'Investimento è sempre più rischioso', false, 4, 'Non sempre, dipende dal tipo')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 3: Time Horizon
  INSERT INTO education_lesson_quiz_questions (
    lesson_quiz_id, question_text, question_type, order_index, points, explanation, bloom_level
  ) VALUES (
    v_quiz_start_id,
    'Per un obiettivo a 30 anni (es. pensione), quale strategia è generalmente migliore?',
    'multiple_choice',
    3,
    1,
    'Con time horizon lungo, puoi tollerare più rischio e cercare crescita (azioni).',
    'apply'
  ) ON CONFLICT (lesson_quiz_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q3_id;

  IF v_q3_id IS NULL THEN
    SELECT id INTO v_q3_id FROM education_lesson_quiz_questions 
    WHERE lesson_quiz_id = v_quiz_start_id AND order_index = 3;
  END IF;

  INSERT INTO education_lesson_quiz_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q3_id, 'Solo conto corrente (sicuro)', false, 1, 'Perdi potere d''acquisto con inflazione'),
  (v_q3_id, 'Portafoglio azionario (crescita)', true, 2, 'Corretto! Time horizon lungo permette di tollerare volatilità'),
  (v_q3_id, 'Solo obbligazioni (stabile)', false, 3, 'Rendimenti più bassi, meno crescita'),
  (v_q3_id, 'Non investire', false, 4, 'Perdi opportunità di crescita')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- ===== 3. LESSON QUIZ: END (Dopo la Lezione) =====
  -- Quiz finale per consolidare apprendimento
  
  INSERT INTO education_lesson_quizzes (
    lesson_id, title, description, position_in_lesson, question_count,
    is_required, show_immediate_feedback, allow_retry, points_reward, order_index
  ) VALUES (
    v_lesson_1_id,
    'Quiz Finale: Verifica Apprendimento',
    'Verifica cosa hai imparato in questa lezione',
    'end',
    3,
    true, -- Required per completare lezione
    true,
    true,
    20, -- 20 XP
    2
  ) ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_quiz_end_id;

  IF v_quiz_end_id IS NULL THEN
    SELECT id INTO v_quiz_end_id FROM education_lesson_quizzes 
    WHERE lesson_id = v_lesson_1_id AND order_index = 2;
  END IF;

  -- Domande per quiz finale (simili ma più approfondite)
  -- [Pattern simile a quiz start, ma con domande più avanzate]

  -- ===== 4. REFLECTION PROMPTS =====
  
  -- Pre-Lesson Reflection
  INSERT INTO education_reflection_prompts (
    lesson_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_lesson_1_id,
    'Quanto conosci già questo argomento? (1 = per nulla, 5 = molto)',
    'pre_lesson',
    1
  ) ON CONFLICT DO NOTHING;

  INSERT INTO education_reflection_prompts (
    lesson_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_lesson_1_id,
    'Cosa ti aspetti di imparare da questa lezione?',
    'pre_lesson',
    2
  ) ON CONFLICT DO NOTHING;

  -- Post-Lesson Reflection
  INSERT INTO education_reflection_prompts (
    lesson_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_lesson_1_id,
    'Quale concetto ti è risultato più chiaro?',
    'post_lesson',
    1
  ) ON CONFLICT DO NOTHING;

  INSERT INTO education_reflection_prompts (
    lesson_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_lesson_1_id,
    'Quale concetto vuoi approfondire di più?',
    'post_lesson',
    2
  ) ON CONFLICT DO NOTHING;

  INSERT INTO education_reflection_prompts (
    lesson_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_lesson_1_id,
    'Come applicherai questi concetti nella tua situazione finanziaria?',
    'post_lesson',
    3
  ) ON CONFLICT DO NOTHING;

  -- Mid-Module Reflection (per modulo)
  INSERT INTO education_reflection_prompts (
    module_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_module_1_id,
    'Stai raggiungendo i tuoi obiettivi di apprendimento?',
    'mid_module',
    1
  ) ON CONFLICT DO NOTHING;

  -- Post-Module Reflection
  INSERT INTO education_reflection_prompts (
    module_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_module_1_id,
    'Quali sono i 3 concetti chiave che hai appreso in questo modulo?',
    'post_module',
    1
  ) ON CONFLICT DO NOTHING;

  INSERT INTO education_reflection_prompts (
    module_id, prompt_text, prompt_type, order_index
  ) VALUES (
    v_module_1_id,
    'Come cambierà il tuo approccio agli investimenti dopo questo modulo?',
    'post_module',
    2
  ) ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Advanced features popolate per Modulo 1, Lezione 1';
  RAISE NOTICE '   - Learning objectives: 5 (modulo) + 3 (lezione)';
  RAISE NOTICE '   - Lesson quizzes: 2 (start + end)';
  RAISE NOTICE '   - Reflection prompts: 7 (pre/post lesson + mid/post module)';
END $$;
