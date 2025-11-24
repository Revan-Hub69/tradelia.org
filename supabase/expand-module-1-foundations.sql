-- ============================================
-- ESPANSIONE MODULO 1: FONDAMENTI
-- ============================================
-- Aggiunge 2 lezioni al Modulo 1 esistente
-- ============================================

DO $$
DECLARE
  v_module_1_id UUID;
BEGIN
  SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  
  IF v_module_1_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 1 deve esistere. Esegui prima seed-education-content.sql';
  END IF;

  -- ===== LEZIONE 5: Inflazione e Potere d'Acquisto =====
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
    'Inflazione e Potere d''Acquisto: Il Nemico Invisibile',
    '# Inflazione e Potere d''Acquisto

**Riferimenti Accademici:**
- Fama & Schwert (1977) - "Asset Returns and Inflation"
- Ibbotson & Siegel (1983) - "The Demand for Capital Market Returns"
- Fisher (1930) - "The Theory of Interest"

## Cos''è l''Inflazione?

**Definizione**: Aumento generale dei prezzi nel tempo → diminuzione potere d''acquisto.

**Misurazione:**
- **CPI** (Consumer Price Index): Indice prezzi al consumo
- **Inflazione Italia**: Media 2-3% annua (storico)
- **Inflazione 2022-2023**: Picco 8-10% (eccezionale)

## L''Impatto dell''Inflazione

### Esempio Pratico

**€100,000 oggi con inflazione 3% annua:**

- **Dopo 10 anni**: Potere d''acquisto = €74,409
- **Dopo 20 anni**: Potere d''acquisto = €55,368
- **Dopo 30 anni**: Potere d''acquisto = €41,199

**Formula:**
```
Valore Reale = Valore Nominale / (1 + Inflazione)^Anni
```

### Regola del 72

**Quanto tempo per dimezzare potere d''acquisto?**

```
Anni = 72 / Tasso Inflazione
```

**Esempi:**
- Inflazione 3%: 72/3 = **24 anni** per dimezzare
- Inflazione 6%: 72/6 = **12 anni** per dimezzare

## Inflazione vs Investimenti

### Rendimento Nominale vs Reale

**Formula:**
```
Rendimento Reale = Rendimento Nominale - Inflazione
```

**Esempi:**
- Conto deposito 2% - Inflazione 3% = **-1% reale** (perdi potere d''acquisto)
- Azioni 8% - Inflazione 3% = **+5% reale** (guadagni potere d''acquisto)

**Paper di Riferimento:**
> Fama & Schwert (1977): "Asset Returns and Inflation", Journal of Financial Economics

## Asset come Hedge Inflazione

### 1. Azioni (Equity)
- **Correlazione inflazione**: Positiva long-term
- **Ragione**: Aziende aumentano prezzi con inflazione
- **Efficacia**: Media-Alta

### 2. Immobiliare (Real Estate)
- **Correlazione inflazione**: Positiva
- **Ragione**: Affitti e valori aumentano con inflazione
- **Efficacia**: Alta

### 3. Commodities
- **Correlazione inflazione**: Positiva
- **Ragione**: Prezzi materie prime aumentano
- **Efficacia**: Alta

### 4. TIPS (Treasury Inflation-Protected Securities)
- **Protezione**: Diretta (cedola + capitale adeguati a inflazione)
- **Efficacia**: Perfetta (per obbligazioni)

**Paper di Riferimento:**
> Ibbotson & Siegel (1983): "The Demand for Capital Market Returns: A New Look at the Risk Premium", Journal of Portfolio Management

## Strategia Anti-Inflazione

1. **Minimizza Contanti**: Conto corrente solo per spese immediate
2. **Investi in Asset Reali**: Azioni, immobiliare, commodities
3. **Considera TIPS**: Se disponibili nel tuo paese
4. **Diversifica**: Non solo un tipo di asset

> **Principio**: "L''inflazione è il nemico invisibile. I tuoi investimenti devono superare l''inflazione per preservare potere d''acquisto."',
    'text',
    5,
    18,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 6: Tassazione degli Investimenti =====
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
    'Tassazione degli Investimenti: Imposte e Ottimizzazione',
    '# Tassazione degli Investimenti

**Riferimenti Accademici:**
- Dammon et al. (2004) - "Optimal Asset Location and Allocation"
- Poterba (2004) - "Taxation and Portfolio Structure"
- Shoven & Sialm (2004) - "Asset Location in Tax-Deferred and Conventional Savings Accounts"

## Tipi di Tassazione

### 1. Capital Gains Tax (Plusvalenze)

**Italia:**
- **Redditi diversi**: 26% su plusvalenze
- **Redditi da lavoro**: 43% (se qualificato come lavoro)

**Esempio:**
- Acquisto: €10,000
- Vendita: €15,000
- Plusvalenza: €5,000
- **Imposta**: €5,000 × 26% = €1,300
- **Netto**: €13,700

### 2. Dividend Tax

**Italia:**
- **26%** su dividendi (se da redditi diversi)
- **Esempio**: Dividendo €1,000 → Netto €740

### 3. Interest Tax (Interessi)

**Italia:**
- **26%** su interessi obbligazioni, conti deposito
- **Esempio**: Interesse €1,000 → Netto €740

## Tax-Loss Harvesting

### Strategia

**Principio**: Vendi asset in perdita per compensare plusvalenze.

**Esempio:**
- **Plusvalenza A**: +€5,000
- **Minusvalenza B**: -€3,000
- **Imponibile**: €5,000 - €3,000 = €2,000
- **Imposta**: €2,000 × 26% = €520 (vs €1,300 senza harvesting)

**Regole:**
- **Wash Sale**: Non ricomprare stesso asset 30 giorni prima/dopo
- **Limite**: Minusvalenze compensabili fino a 4 anni

**Paper di Riferimento:**
> Dammon & Spatt (1996): "The Optimal Trading and Pricing of Securities with Asymmetric Capital Gains Taxes"

## Asset Location Optimization

### Principio

**Metti asset tax-efficienti in conti tassabili, asset tax-inefficienti in conti tax-deferred.**

**Esempi:**

#### Taxable Account (Conto Tassabile)
- **ETF Azionari**: Tassazione solo su vendita (long-term)
- **Stock Picking**: Tassazione solo su vendita
- **Vantaggio**: Controllo timing realizzazione plusvalenze

#### Tax-Deferred Account (Conto Tax-Deferred)
- **Obbligazioni**: Interessi tassati annualmente
- **Fondi con distribuzione**: Dividendi tassati annualmente
- **Vantaggio**: Differimento tassazione

**Paper di Riferimento:**
> Dammon et al. (2004): "Optimal Asset Location and Allocation with Taxable and Tax-Deferred Investing", Review of Financial Studies

## Strategie di Ottimizzazione Fiscale

### 1. Holding Period Optimization

**Principio**: Tieni asset > 1 anno per benefici fiscali (se applicabile).

**Italia**: Non c''è differenza holding period, ma:
- **Realizzazione differita**: Tassa pagata più tardi = valore attuale minore

### 2. Tax-Loss Harvesting Automatico

**Strategia:**
- Monitora posizioni in perdita
- Vendi se perdita > soglia (es. -10%)
- Reinvesti in asset simile (non stesso)
- Compensa plusvalenze

### 3. Asset Location

**Regola:**
- **Taxable**: Azioni (tassazione differita)
- **Tax-Deferred**: Obbligazioni (tassazione immediata differita)

### 4. Charitable Giving

**Strategia**: Dona asset con plusvalenze invece di vendere.

**Beneficio:**
- Deduzione fiscale valore asset
- Eviti tassazione plusvalenze

## Calcolo Impatto Tassazione

### Esempio: Investimento 20 Anni

**Scenario A: Tassazione Annuale (Obbligazioni)**
- Investimento: €100,000
- Rendimento: 4% annuo
- Tassa: 26% su interessi
- **Netto dopo 20 anni**: €180,000

**Scenario B: Tassazione Differita (Azioni)**
- Investimento: €100,000
- Rendimento: 8% annuo
- Tassa: 26% solo su vendita finale
- **Netto dopo 20 anni**: €366,000

**Differenza**: €186,000 (104% in più!)

**Paper di Riferimento:**
> Poterba (2004): "Taxation and Portfolio Structure: Issues and Implications", NBER Working Paper

## Checklist Ottimizzazione Fiscale

- [ ] Compreso tipo tassazione asset
- [ ] Asset location ottimizzata
- [ ] Tax-loss harvesting implementato
- [ ] Holding period considerato
- [ ] Consultato commercialista per casi complessi
- [ ] Documentato tutte le transazioni
- [ ] Calcolato impatto tassazione su rendimenti

> **Principio**: "La tassazione può erodere significativamente i rendimenti. Ottimizza asset location e usa tax-loss harvesting."',
    'text',
    6,
    20,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- Aggiorna test con 2 domande aggiuntive
  DECLARE
    v_test_1_id UUID;
    v_q6_id UUID;
    v_q7_id UUID;
  BEGIN
    SELECT id INTO v_test_1_id FROM education_tests WHERE module_id = v_module_1_id AND title = 'Test: Fondamenti di Investimento';

    -- Domanda 6: Inflazione
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
      'Con inflazione 3% annua, quanto tempo serve per dimezzare il potere d''acquisto?',
      'multiple_choice',
      6,
      1,
      'Regola del 72: 72 / 3% = 24 anni per dimezzare potere d''acquisto.',
      'apply',
      true
    ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
    RETURNING id INTO v_q6_id;

    IF v_q6_id IS NULL THEN
      SELECT id INTO v_q6_id FROM education_questions WHERE test_id = v_test_1_id AND order_index = 6;
    END IF;

    INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
    (v_q6_id, '24 anni (regola del 72)', true, 1, 'Corretto! 72 / 3 = 24 anni'),
    (v_q6_id, '10 anni', false, 2, 'Troppo breve'),
    (v_q6_id, '50 anni', false, 3, 'Troppo lungo'),
    (v_q6_id, 'Mai', false, 4, 'L''inflazione erode sempre potere d''acquisto')
    ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

    -- Domanda 7: Tassazione
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
      'Quale strategia fiscale è generalmente migliore?',
      'multiple_choice',
      7,
      1,
      'Asset location optimization: metti asset tax-efficienti (azioni) in conti tassabili, asset tax-inefficienti (obbligazioni) in conti tax-deferred.',
      'apply',
      true
    ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
    RETURNING id INTO v_q7_id;

    IF v_q7_id IS NULL THEN
      SELECT id INTO v_q7_id FROM education_questions WHERE test_id = v_test_1_id AND order_index = 7;
    END IF;

    INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
    (v_q7_id, 'Asset location: azioni in taxable, obbligazioni in tax-deferred', true, 1, 'Corretto! Ottimizza differimento tassazione'),
    (v_q7_id, 'Tutto in conto corrente', false, 2, 'Perdi rendimenti'),
    (v_q7_id, 'Tutto in conto tax-deferred', false, 3, 'Non sempre disponibile o ottimale'),
    (v_q7_id, 'Non importa', false, 4, 'La tassazione ha impatto significativo')
    ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;
  END;

  -- Aggiorna ore stimate
  UPDATE education_modules 
  SET estimated_hours = 4 
  WHERE id = v_module_1_id;

  RAISE NOTICE '✅ Modulo 1 espanso: 6 lezioni (era 4), 7 domande test (era 5)';
END $$;
