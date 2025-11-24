-- ============================================
-- SEED EDUCATION CONTENT
-- ============================================
-- Popola il sistema educativo con contenuti reali
-- Modulo 1: Fondamenti di Investimento per Retail
-- ============================================

-- ===== MODULO 1: FONDAMENTI DI INVESTIMENTO =====
DO $$
DECLARE
  v_module_1_id UUID;
  v_test_1_id UUID;
  v_q1_id UUID;
  v_q2_id UUID;
  v_q3_id UUID;
  v_q4_id UUID;
  v_q5_id UUID;
BEGIN
  -- Crea modulo
  INSERT INTO education_modules (
    title,
    description,
    slug,
    order_index,
    difficulty_level,
    estimated_hours,
    is_active,
    requires_previous_module,
    previous_module_id
  ) VALUES (
    'Fondamenti di Investimento',
    'Impara le basi degli investimenti: cosa sono, come funzionano, e come iniziare in modo sicuro. Perfetto per principianti assoluti.',
    'fondamenti-investimento',
    1,
    'beginner',
    3,
    true,
    false,
    NULL
  ) ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_module_1_id;

  IF v_module_1_id IS NULL THEN
    SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  END IF;

  RAISE NOTICE 'Modulo creato: %', v_module_1_id;

  -- ===== LEZIONE 1 =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_1_id,
    'Cos''è un investimento?',
    '# Cos''è un investimento?

Un **investimento** è l''allocazione di denaro con l''obiettivo di ottenere un rendimento nel tempo.

## Differenza tra Risparmio e Investimento

- **Risparmio**: Denaro messo da parte, solitamente in conto corrente o libretto. Basso rischio, basso rendimento.
- **Investimento**: Denaro utilizzato per acquistare asset che possono aumentare di valore. Rischio variabile, potenziale rendimento maggiore.

## Tipi di Investimenti

### 1. Azioni (Equity)
- Acquisto di una quota di una società
- Rendimento: dividendi + crescita del valore
- Rischio: medio-alto

### 2. Obbligazioni (Bond)
- Prestito a un''azienda o stato
- Rendimento: interessi periodici
- Rischio: medio-basso

### 3. Fondi Comuni / ETF
- Investimento diversificato in più asset
- Gestito da professionisti
- Rischio: variabile in base al fondo

### 4. Immobiliare
- Acquisto di proprietà
- Rendimento: affitti + crescita valore
- Rischio: medio

## Principio Fondamentale

> **Maggiore il potenziale rendimento, maggiore il rischio**

Non esiste un investimento senza rischio. L''importante è comprendere e gestire il rischio in base alle proprie esigenze.',
    'text',
    1,
    15,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 2 =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_1_id,
    'Diversificazione: Non mettere tutte le uova in un paniere',
    '# Diversificazione del Portafoglio

La **diversificazione** è una strategia fondamentale per ridurre il rischio senza sacrificare troppo il rendimento.

## Cosa significa Diversificare?

Distribuire i propri investimenti su:
- **Più asset** (azioni, obbligazioni, immobili)
- **Più settori** (tecnologia, sanità, energia, ecc.)
- **Più aree geografiche** (Italia, Europa, USA, Asia)
- **Più società** (non solo una o poche)

## Perché Diversificare?

### Riduce il Rischio Specifico
Se investi tutto in una sola azienda e quella azienda fallisce, perdi tutto. Con la diversificazione, un fallimento ha un impatto limitato.

### Esempio Pratico

**Portafoglio NON diversificato:**
- 100% in azioni Tech Company A
- Se Tech Company A crolla: -100% del portafoglio

**Portafoglio diversificato:**
- 30% azioni tecnologia
- 30% obbligazioni
- 20% ETF internazionali
- 20% immobiliare
- Se un settore crolla: impatto limitato

## Regola del 5-10-15

- **Massimo 5%** in un singolo titolo
- **Massimo 10%** in un singolo settore
- **Massimo 15%** in un singolo paese

## Come Diversificare

1. **ETF Diversificati**: Investi in fondi che contengono centinaia di asset
2. **Asset Allocation**: Bilanciamento tra azioni, obbligazioni, e altri asset
3. **Rebalancing Periodico**: Riequilibra il portafoglio ogni 6-12 mesi

> **Ricorda**: La diversificazione non elimina il rischio, ma lo distribuisce meglio.',
    'text',
    2,
    20,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 3 =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_1_id,
    'Comprensione del Rischio',
    '# Comprensione del Rischio

Il **rischio** è la possibilità che un investimento non produca il rendimento atteso o addirittura perda valore.

## Tipi di Rischio

### 1. Rischio di Mercato
- Fluttuazioni generali del mercato
- Colpisce tutti gli investimenti
- Non eliminabile, ma gestibile

### 2. Rischio Specifico
- Rischio legato a una singola azienda/settore
- Eliminabile con la diversificazione

### 3. Rischio di Liquidità
- Difficoltà a vendere rapidamente un investimento
- Esempio: immobiliare vs azioni

### 4. Rischio di Inflazione
- Il potere d''acquisto del denaro diminuisce nel tempo
- Investimenti devono superare l''inflazione

## Profili di Rischio

### Conservatore
- Obiettivo: preservare il capitale
- Asset: obbligazioni, conti deposito
- Rendimento atteso: 2-4% annuo
- Volatilità: bassa

### Moderato
- Obiettivo: crescita moderata
- Asset: mix 50/50 azioni/obbligazioni
- Rendimento atteso: 4-6% annuo
- Volatilità: media

### Aggressivo
- Obiettivo: massimizzare la crescita
- Asset: principalmente azioni
- Rendimento atteso: 6-10% annuo
- Volatilità: alta

## Come Valutare il Tuo Profilo

1. **Orizzonte Temporale**: Quanto tempo hai prima di aver bisogno del denaro?
2. **Tolleranza al Rischio**: Quanto puoi sopportare perdite temporanee?
3. **Obiettivi Finanziari**: Cosa vuoi ottenere con l''investimento?

## Regola d''Oro

> **Investi solo quello che puoi permetterti di perdere**

Non investire mai denaro necessario per:
- Emergenze
- Spese immediate
- Debiti ad alto interesse',
    'text',
    3,
    18,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 4 =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_1_id,
    'Costi e Commissioni: L''impatto nascosto',
    '# Costi e Commissioni negli Investimenti

I **costi** possono erodere significativamente i rendimenti nel tempo. È fondamentale conoscerli.

## Tipi di Costi

### 1. Commissioni di Intermediazione
- Costo per acquistare/vendere titoli
- Esempio: 5-10€ per operazione
- **Impatto**: Riduce il rendimento, specialmente su piccoli importi

### 2. Commissioni di Gestione (TER)
- Costo annuo per gestire un fondo/ETF
- Esempio: 0.2% - 2% annuo
- **Impatto**: Composto nel tempo, può ridurre significativamente i rendimenti

### 3. Commissioni di Performance
- Percentuale sui guadagni (alcuni fondi)
- Esempio: 20% dei guadagni
- **Impatto**: Riduce i profitti

### 4. Spread Bid-Ask
- Differenza tra prezzo di acquisto e vendita
- Implicito nel prezzo
- **Impatto**: Costo nascosto

## Esempio: Impatto dei Costi

**Investimento di 10.000€ per 20 anni, rendimento 6% annuo:**

- **Senza costi**: 32.071€
- **Con TER 0.5%**: 29.568€ (-7.8%)
- **Con TER 2%**: 22.196€ (-30.8%)

## Come Minimizzare i Costi

1. **Scegli ETF a basso costo**: TER < 0.5%
2. **Investi periodicamente**: Riduci commissioni di intermediazione
3. **Evita trading frequente**: Ogni operazione ha un costo
4. **Confronta broker**: Commissioni variano molto

## Regola del 1%

> **Costi totali annui dovrebbero essere < 1% del portafoglio**

Se paghi più dell''1% annuo in costi, stai probabilmente pagando troppo.

## Checklist Costi

Prima di investire, verifica:
- [ ] Commissioni di intermediazione
- [ ] TER (Total Expense Ratio) del fondo/ETF
- [ ] Commissioni di performance
- [ ] Costi di mantenimento conto
- [ ] Imposte e tasse',
    'text',
    4,
    15,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== TEST FINALE =====
  INSERT INTO education_tests (
    module_id,
    title,
    description,
    passing_score,
    max_attempts,
    time_limit_minutes,
    bloom_level,
    is_active
  ) VALUES (
    v_module_1_id,
    'Test: Fondamenti di Investimento',
    'Verifica la tua comprensione dei concetti base degli investimenti',
    70,
    3,
    20,
    'understand',
    true
  ) ON CONFLICT DO NOTHING
  RETURNING id INTO v_test_1_id;

  IF v_test_1_id IS NULL THEN
    SELECT id INTO v_test_1_id FROM education_tests WHERE module_id = v_module_1_id AND title = 'Test: Fondamenti di Investimento';
  END IF;

  -- Domanda 1
  INSERT INTO education_questions (
    test_id,
    question_text,
    question_type,
    order_index,
    points,
    explanation,
    bloom_level,
    is_active
  ) VALUES (
    v_test_1_id,
    'Qual è la principale differenza tra risparmio e investimento?',
    'multiple_choice',
    1,
    1,
    'Il risparmio è denaro messo da parte con basso rischio e basso rendimento. L''investimento cerca un rendimento maggiore accettando un rischio più alto.',
    'remember',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q1_id;

  IF v_q1_id IS NULL THEN
    SELECT id INTO v_q1_id FROM education_questions WHERE test_id = v_test_1_id AND order_index = 1;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q1_id, 'Il risparmio ha sempre rendimento negativo', false, 1, 'Il risparmio ha rendimento positivo ma molto basso'),
  (v_q1_id, 'L''investimento ha sempre rischio zero', false, 2, 'Non esiste investimento senza rischio'),
  (v_q1_id, 'Il risparmio ha basso rischio/basso rendimento, l''investimento cerca rendimento maggiore accettando rischio', true, 3, 'Corretto! Questa è la differenza fondamentale'),
  (v_q1_id, 'Non c''è differenza', false, 4, 'Ci sono differenze significative tra risparmio e investimento')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 2
  INSERT INTO education_questions (
    test_id,
    question_text,
    question_type,
    order_index,
    points,
    explanation,
    bloom_level,
    is_active
  ) VALUES (
    v_test_1_id,
    'Cosa significa diversificare un portafoglio?',
    'multiple_choice',
    2,
    1,
    'La diversificazione significa distribuire gli investimenti su più asset, settori, aree geografiche per ridurre il rischio specifico.',
    'understand',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q2_id;

  IF v_q2_id IS NULL THEN
    SELECT id INTO v_q2_id FROM education_questions WHERE test_id = v_test_1_id AND order_index = 2;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q2_id, 'Investire tutto in un solo asset', false, 1, 'Questo è l''opposto della diversificazione'),
  (v_q2_id, 'Distribuire investimenti su più asset, settori e aree geografiche', true, 2, 'Esatto! La diversificazione riduce il rischio'),
  (v_q2_id, 'Investire solo in azioni', false, 3, 'La diversificazione include diversi tipi di asset'),
  (v_q2_id, 'Non investire mai', false, 4, 'La diversificazione riguarda come investire, non se investire')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 3
  INSERT INTO education_questions (
    test_id,
    question_text,
    question_type,
    order_index,
    points,
    explanation,
    bloom_level,
    is_active
  ) VALUES (
    v_test_1_id,
    'Quale principio fondamentale lega rischio e rendimento?',
    'multiple_choice',
    3,
    1,
    'Maggiore il potenziale rendimento, maggiore il rischio. Questo è un principio fondamentale degli investimenti.',
    'understand',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q3_id;

  IF v_q3_id IS NULL THEN
    SELECT id INTO v_q3_id FROM education_questions WHERE test_id = v_test_1_id AND order_index = 3;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q3_id, 'Maggiore rendimento = minore rischio', false, 1, 'È il contrario'),
  (v_q3_id, 'Maggiore rendimento = maggiore rischio', true, 2, 'Corretto! Questo è il trade-off fondamentale'),
  (v_q3_id, 'Rischio e rendimento non sono correlati', false, 3, 'Sono strettamente correlati'),
  (v_q3_id, 'Il rischio è sempre zero', false, 4, 'Non esiste investimento senza rischio')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 4
  INSERT INTO education_questions (
    test_id,
    question_text,
    question_type,
    order_index,
    points,
    explanation,
    bloom_level,
    is_active
  ) VALUES (
    v_test_1_id,
    'Quale percentuale massima dovresti investire in un singolo titolo secondo la regola del 5-10-15?',
    'multiple_choice',
    4,
    1,
    'La regola del 5-10-15 suggerisce massimo 5% in un singolo titolo per una buona diversificazione.',
    'apply',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q4_id;

  IF v_q4_id IS NULL THEN
    SELECT id INTO v_q4_id FROM education_questions WHERE test_id = v_test_1_id AND order_index = 4;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q4_id, '50%', false, 1, 'Troppo concentrato, rischio elevato'),
  (v_q4_id, '25%', false, 2, 'Ancora troppo concentrato'),
  (v_q4_id, '5%', true, 3, 'Corretto! Massimo 5% per titolo'),
  (v_q4_id, '100%', false, 4, 'Nessuna diversificazione, rischio massimo')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 5
  INSERT INTO education_questions (
    test_id,
    question_text,
    question_type,
    order_index,
    points,
    explanation,
    bloom_level,
    is_active
  ) VALUES (
    v_test_1_id,
    'Quale costo annuo totale è considerato accettabile per un portafoglio secondo la "Regola dell''1%"?',
    'multiple_choice',
    5,
    1,
    'La regola dell''1% suggerisce che i costi totali annui dovrebbero essere inferiori all''1% del portafoglio.',
    'apply',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q5_id;

  IF v_q5_id IS NULL THEN
    SELECT id INTO v_q5_id FROM education_questions WHERE test_id = v_test_1_id AND order_index = 5;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q5_id, '5%', false, 1, 'Troppo alto, erode significativamente i rendimenti'),
  (v_q5_id, '3%', false, 2, 'Ancora troppo alto'),
  (v_q5_id, '1%', true, 3, 'Corretto! Massimo 1% annuo'),
  (v_q5_id, '10%', false, 4, 'Eccessivo, riduce drasticamente i rendimenti')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Badge
  INSERT INTO education_badges (
    name,
    description,
    badge_type,
    criteria,
    points_reward,
    is_active
  ) VALUES (
    'Primo Passo',
    'Completato il primo modulo formativo',
    'module_completion',
    '{"module_slug": "fondamenti-investimento"}'::jsonb,
    100,
    true
  ) ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

  RAISE NOTICE '✅ Contenuti educativi creati con successo!';
  RAISE NOTICE '📚 Modulo: Fondamenti di Investimento';
  RAISE NOTICE '📖 Lezioni: 4';
  RAISE NOTICE '📝 Test: 1 (5 domande)';
  RAISE NOTICE '🏆 Badge: Primo Passo';
END $$;
