# Template Completo Lezione Tradelia AI

## Struttura SQL Completa

```sql
-- ===== LEZIONE X: [Titolo] =====
INSERT INTO education_lessons (
  module_id, title, content, content_type, order_index, estimated_minutes, is_active
) VALUES (
  v_module_id,
  '[Titolo Lezione]',
  '# [Titolo Lezione]

**Questa lezione Tradelia AI esplora** [argomento principale] per [obiettivo pratico]. **L''obiettivo è** [risultato concreto per l''utente].

**Pillola Educativa:** [Citazione accademica con autore, anno, journal]. [Implicazione pratica per l''utente].

## [Sezione 1: Teoria/Concetti Base]

[Contenuto strutturato con evidenze accademiche]

**Metodo Tradelia AI:**
- [Approccio distintivo 1]
- [Approccio distintivo 2]
- [Best practice]

**Paper di Riferimento:**
> Autore (Anno): "Titolo", Journal

## [Sezione 2: Applicazione Pratica]

**Esempio Pratico Tradelia AI:**
- **Scenario**: [Situazione reale]
- **Calcolo**: [Formula applicata]
- **Risultato**: [Outcome concreto]

**Metodo Tradelia AI per [applicazione]:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

## [Sezione 3: Evidenze/Case Study]

[Contenuto con case study o evidenze empiriche]

**Paper di Riferimento:**
> Autore (Anno): "Titolo", Journal

> **Principio Tradelia AI**: "[Principio distintivo e memorabile]"
',
  'text',
  X,
  90, -- 90 minuti per lezione avanzata
  true
) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title
RETURNING id INTO v_lesson_id;

-- Learning Objectives (4-6 obiettivi)
INSERT INTO education_learning_objectives (lesson_id, objective_text, bloom_level, order_index) VALUES
(v_lesson_id, '[Obiettivo 1 - Remember/Understand]', 'remember', 1),
(v_lesson_id, '[Obiettivo 2 - Understand/Analyze]', 'understand', 2),
(v_lesson_id, '[Obiettivo 3 - Apply]', 'apply', 3),
(v_lesson_id, '[Obiettivo 4 - Analyze/Evaluate]', 'analyze', 4)
ON CONFLICT DO NOTHING;

-- Quiz Start (3 domande)
INSERT INTO education_lesson_quizzes (
  lesson_id, title, description, position_in_lesson, question_count, is_required,
  show_immediate_feedback, allow_retry, points_reward, order_index
) VALUES (
  v_lesson_id, 'Quiz Start: [Titolo]', 'Verifica conoscenze iniziali', 'start', 3, false,
  true, true, 10, 1
) ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
RETURNING id INTO v_quiz_id;

-- Domanda 1 Quiz Start
INSERT INTO education_questions (test_id, question_text, question_type, order_index, points, explanation, bloom_level, is_active)
VALUES (v_quiz_id, '[Domanda conoscenza base]', 'multiple_choice', 1, 1,
  '[Spiegazione risposta corretta]', 'remember', true)
ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
RETURNING id INTO v_q_id;

INSERT INTO education_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_id, '[Opzione 1 - sbagliata]', false, 1),
(v_q_id, '[Opzione 2 - corretta]', true, 2),
(v_q_id, '[Opzione 3 - sbagliata]', false, 3),
(v_q_id, '[Opzione 4 - sbagliata]', false, 4)
ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

-- [Ripeti per domande 2-3 Quiz Start]

-- Quiz End (5-7 domande)
INSERT INTO education_lesson_quizzes (
  lesson_id, title, description, position_in_lesson, question_count, is_required,
  show_immediate_feedback, allow_retry, points_reward, order_index
) VALUES (
  v_lesson_id, 'Quiz Finale: [Titolo]', 'Verifica comprensione completa', 'end', 5, true,
  true, true, 20, 2
) ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
RETURNING id INTO v_quiz_id;

-- [Domande Quiz End - stesso pattern]

-- Reflection Prompts (Pre 2, Post 3)
INSERT INTO education_reflection_prompts (lesson_id, prompt_text, prompt_type, order_index) VALUES
(v_lesson_id, 'Quanto conosci già questo argomento? (1-5)', 'pre_lesson', 1),
(v_lesson_id, 'Cosa ti aspetti di imparare?', 'pre_lesson', 2),
(v_lesson_id, 'Quale concetto ti è risultato più chiaro?', 'post_lesson', 1),
(v_lesson_id, 'Quale concetto vuoi approfondire?', 'post_lesson', 2),
(v_lesson_id, 'Come applicherai questi concetti?', 'post_lesson', 3)
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅ [Percorso]: Lezione X creata';
```

## Componenti Obbligatorie

### 1. Contenuto Lezione

- ✅ Apertura "Questa lezione Tradelia AI esplora..."
- ✅ Obiettivo esplicito
- ✅ Pillola Educativa con citazione
- ✅ Metodo Tradelia AI esplicito
- ✅ Esempi pratici con numeri reali
- ✅ Riferimenti accademici (3-5 paper)
- ✅ Principio finale distintivo

### 2. Learning Objectives (4-6)

- Remember/Understand (1-2)
- Apply (1-2)
- Analyze/Evaluate (1-2)

### 3. Quiz Start (3 domande)

- Conoscenze base
- Livello: Remember/Understand
- Feedback immediato

### 4. Quiz End (5-7 domande)

- Comprensione completa
- Livelli: Understand, Apply, Analyze
- Feedback immediato

### 5. Reflection Prompts

- Pre: 2 domande
- Post: 3 domande

## Esempio Completo

[Vedi file separato con esempio completo]
