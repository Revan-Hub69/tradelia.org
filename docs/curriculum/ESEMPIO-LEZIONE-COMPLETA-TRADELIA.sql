-- ============================================
-- ESEMPIO COMPLETO LEZIONE TRADELIA AI
-- ============================================
-- Template da replicare per tutte le 109 lezioni
-- ============================================

-- ===== LEZIONE ESEMPIO: Commitment Devices e Automazione =====
INSERT INTO education_lessons (
  module_id, title, content, content_type, order_index, estimated_minutes, is_active
) VALUES (
  v_module_2_id,
  'Commitment Devices e Automazione: Save More Tomorrow',
  '# Commitment Devices e Automazione: Save More Tomorrow

**Questa lezione Tradelia AI esplora** i commitment devices e l''automazione del risparmio per aiutarti a superare problemi di autocontrollo e migliorare l''aderenza al tuo PAC. **L''obiettivo è** fornirti il Metodo Tradelia AI per implementare automazione efficace basata su evidenze accademiche.

**Pillola Educativa:** Lo studio di Thaler & Benartzi (2004), pubblicato sul *Journal of Political Economy*, ha sviluppato il programma Save More Tomorrow™ dimostrando che l''automazione con pre-commitment aumenta il tasso di risparmio dal 3.5% al 13.6% in 4 anni. La ricerca evidenzia che l''automazione è cruciale per superare present bias e migliorare risultati finanziari retail.

## Teoria Commitment Devices

### Definizione Metodo Tradelia AI

**Commitment Device**: Meccanismo che vincola comportamento futuro per superare problemi di autocontrollo.

**Problema Present Bias**:
- Preferenza consumo presente > futuro
- Sottostima utilità risparmio futuro
- Procrastinazione decisioni finanziarie

**Paper di Riferimento:**
> Thaler & Benartzi (2004): "Save More Tomorrow™: Using Behavioral Economics to Increase Employee Saving", Journal of Political Economy

## Save More Tomorrow (SMarT)

### Meccanismo Tradelia AI

**Metodo Tradelia AI** in 4 step:

1. **Pre-commitment**: Impegno futuro aumento risparmio
2. **Timing**: Aumento automatico a prossimo aumento stipendio
3. **Escalation**: Aumento graduale (es. +1% ogni anno)
4. **Opt-out**: Possibilità uscita (ma default = continuare)

### Evidenze Empiriche

**Studio Thaler & Benartzi (2004)**:
- **Campione**: 3 aziende, 315 dipendenti
- **Risultato**: Tasso risparmio medio aumentato da 3.5% a 13.6% in 4 anni
- **Meccanismo**: Automazione + timing (aumento stipendio) + escalation

**Formula Aumento Risparmio Metodo Tradelia AI**:
```
Risparmio_t = Risparmio_t-1 × (1 + escalation_rate)
```

Dove escalation_rate = 1-3% annuo

**Esempio Pratico Tradelia AI**:
- **Scenario**: Reddito 2.000€/mese, risparmio iniziale 200€/mese (10%)
- **Escalation**: +1% ogni anno
- **Anno 1**: 200€/mese (10%)
- **Anno 2**: 220€/mese (11%)
- **Anno 3**: 240€/mese (12%)
- **Anno 4**: 260€/mese (13%)
- **Risultato**: Totale 4 anni = 11.040€ investiti vs 9.600€ senza escalation (+15%)

**Paper di Riferimento:**
> Thaler & Benartzi (2004): "Save More Tomorrow™: Using Behavioral Economics to Increase Employee Saving"

## Automazione PAC: Metodo Tradelia AI

### Componenti Essenziali

**Metodo Tradelia AI** per automazione completa:

1. **Addebito Automatico**: Bonifico automatico mensile
2. **Investimento Automatico**: Acquisto automatico ETF/fondi
3. **Rebalancing Automatico**: Riequilibrio automatico portafoglio
4. **Review Automatico**: Report automatico periodico

### Formula Costo Opportunità Automazione

**Senza Automazione**:
- Probabilità skip mese: 20-30%
- Costo opportunità: Capitale_non_investito × r × t

**Con Automazione Metodo Tradelia AI**:
- Probabilità skip mese: <5%
- Costo opportunità: ~0 (investimento garantito)

**Paper di Riferimento:**
> Choi et al. (2002): "Defined Contribution Pensions: Plan Rules, Participant Choices, and the Role of the Planner", Journal of Public Economics

## Best Practice Implementazione Tradelia AI

### Checklist Automazione PAC

**Metodo Tradelia AI** - Checklist completa:

- [ ] Bonifico automatico configurato
- [ ] Investimento automatico attivo
- [ ] Rebalancing automatico (trimestrale/semestrale)
- [ ] Review automatico (mensile)
- [ ] Alert automatici (anomalie, costi)
- [ ] Escalation automatica (aumento risparmio annuale)

> **Principio Tradelia AI**: L''automazione non è opzionale per PAC retail, è essenziale. Il Metodo Tradelia AI combina evidenze accademiche (Thaler & Benartzi) con implementazione pratica per massimizzare aderenza e risultati.',
  'text',
  2,
  90,
  true
) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title
RETURNING id INTO v_lesson_id;

-- Learning Objectives (4 obiettivi)
INSERT INTO education_learning_objectives (lesson_id, objective_text, bloom_level, order_index) VALUES
(v_lesson_id, 'Comprendere teoria commitment devices (Thaler & Benartzi) con Metodo Tradelia AI', 'understand', 1),
(v_lesson_id, 'Analizzare evidenze Save More Tomorrow (SMarT) e impatto su risparmio', 'analyze', 2),
(v_lesson_id, 'Valutare benefici automazione PAC per investitori retail', 'evaluate', 3),
(v_lesson_id, 'Applicare Metodo Tradelia AI per implementare automazione efficace', 'apply', 4)
ON CONFLICT DO NOTHING;

-- Quiz Start (3 domande)
INSERT INTO education_lesson_quizzes (
  lesson_id, title, description, position_in_lesson, question_count, is_required, 
  show_immediate_feedback, allow_retry, points_reward, order_index
) VALUES (
  v_lesson_id, 'Quiz Start: Commitment Devices', 'Verifica conoscenze iniziali', 'start', 3, false, 
  true, true, 10, 1
) ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
RETURNING id INTO v_quiz_id;

-- Domanda 1 Quiz Start
INSERT INTO education_questions (test_id, question_text, question_type, order_index, points, explanation, bloom_level, is_active)
VALUES (v_quiz_id, 'Cosa sono i commitment devices?', 'multiple_choice', 1, 1, 
  'I commitment devices sono meccanismi che vincolano comportamento futuro per superare problemi di autocontrollo', 'remember', true)
ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
RETURNING id INTO v_q_id;

INSERT INTO education_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_id, 'Dispositivi tecnologici per trading', false, 1),
(v_q_id, 'Meccanismi che vincolano comportamento futuro per autocontrollo', true, 2),
(v_q_id, 'Strumenti di analisi finanziaria', false, 3),
(v_q_id, 'Contratti di investimento', false, 4)
ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

-- Domanda 2 Quiz Start
INSERT INTO education_questions (test_id, question_text, question_type, order_index, points, explanation, bloom_level, is_active)
VALUES (v_quiz_id, 'Secondo Thaler & Benartzi (2004), quanto aumenta il tasso di risparmio con Save More Tomorrow?', 'multiple_choice', 2, 1, 
  'Il tasso di risparmio aumenta da 3.5% a 13.6% in 4 anni con il programma Save More Tomorrow', 'remember', true)
ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
RETURNING id INTO v_q_id;

INSERT INTO education_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_id, 'Da 3.5% a 13.6% in 4 anni', true, 1),
(v_q_id, 'Da 5% a 10% in 2 anni', false, 2),
(v_q_id, 'Da 2% a 8% in 3 anni', false, 3),
(v_q_id, 'Da 4% a 12% in 5 anni', false, 4)
ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

-- Domanda 3 Quiz Start
INSERT INTO education_questions (test_id, question_text, question_type, order_index, points, explanation, bloom_level, is_active)
VALUES (v_quiz_id, 'Quale componente NON è essenziale per automazione PAC secondo Metodo Tradelia AI?', 'multiple_choice', 3, 1, 
  'Tutte le componenti (addebito, investimento, rebalancing, review) sono essenziali per automazione completa', 'understand', true)
ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
RETURNING id INTO v_q_id;

INSERT INTO education_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_id, 'Addebito automatico', false, 1),
(v_q_id, 'Investimento automatico', false, 2),
(v_q_id, 'Rebalancing automatico', false, 3),
(v_q_id, 'Tutte sono essenziali', true, 4)
ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

-- Quiz End (5 domande)
INSERT INTO education_lesson_quizzes (
  lesson_id, title, description, position_in_lesson, question_count, is_required, 
  show_immediate_feedback, allow_retry, points_reward, order_index
) VALUES (
  v_lesson_id, 'Quiz Finale: Commitment Devices e Automazione', 'Verifica comprensione completa', 'end', 5, true, 
  true, true, 20, 2
) ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
RETURNING id INTO v_quiz_id;

-- Domanda 1 Quiz End
INSERT INTO education_questions (test_id, question_text, question_type, order_index, points, explanation, bloom_level, is_active)
VALUES (v_quiz_id, 'Quale problema risolve principalmente l''automazione del risparmio?', 'multiple_choice', 1, 1, 
  'L''automazione risolve principalmente il present bias, riducendo procrastinazione e migliorando aderenza', 'understand', true)
ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
RETURNING id INTO v_q_id;

INSERT INTO education_question_options (question_id, option_text, is_correct, order_index) VALUES
(v_q_id, 'Present bias e procrastinazione', true, 1),
(v_q_id, 'Volatilità di mercato', false, 2),
(v_q_id, 'Costi di transazione', false, 3),
(v_q_id, 'Inflazione', false, 4)
ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

-- [Continua con domande 2-5 Quiz End...]

-- Reflection Prompts (Pre 2, Post 3)
INSERT INTO education_reflection_prompts (lesson_id, prompt_text, prompt_type, order_index) VALUES
(v_lesson_id, 'Quanto conosci già commitment devices e automazione? (1-5)', 'pre_lesson', 1),
(v_lesson_id, 'Cosa ti aspetti di imparare su automazione PAC?', 'pre_lesson', 2),
(v_lesson_id, 'Quale concetto ti è risultato più chiaro?', 'post_lesson', 1),
(v_lesson_id, 'Quale concetto vuoi approfondire?', 'post_lesson', 2),
(v_lesson_id, 'Come applicherai automazione al tuo PAC?', 'post_lesson', 3)
ON CONFLICT DO NOTHING;

RAISE NOTICE '✅ Percorso PAC Tradelia AI: Lezione 2 creata';

```

