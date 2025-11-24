-- ============================================
-- MODULO 4: VOGLIO GESTIRE IL MIO PATRIMONIO
-- ============================================
-- Wealth management basato su ricerca accademica
-- Strategie per gestione patrimonio esistente
-- ============================================

DO $$
DECLARE
  v_module_2_id UUID;
  v_module_4_id UUID;
  v_test_4_id UUID;
  v_q_id UUID;
BEGIN
  -- Ottieni ID modulo 2 (prerequisito)
  SELECT id INTO v_module_2_id FROM education_modules WHERE slug = 'gestione-rischio-rischi';
  
  IF v_module_2_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 2 (Gestione Rischio) deve esistere prima';
  END IF;

  -- ===== MODULO 4: VOGLIO GESTIRE IL MIO PATRIMONIO =====
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
    'Voglio Gestire il Mio Patrimonio: Wealth Management Evidence-Based',
    'Strategie accademiche per gestione patrimonio esistente. Asset allocation, rebalancing, tax optimization, withdrawal strategies. Basato su Merton, Samuelson, Cocco et al.',
    'voglio-gestire-patrimonio',
    4,
    'intermediate',
    5,
    true,
    true,
    v_module_2_id
  ) ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_module_4_id;

  IF v_module_4_id IS NULL THEN
    SELECT id INTO v_module_4_id FROM education_modules WHERE slug = 'voglio-gestire-patrimonio';
  END IF;

  -- ===== LEZIONE 1: Optimal Portfolio Theory =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_4_id,
    'Teoria del Portafoglio Ottimale: Markowitz, Merton, Black-Litterman',
    '# Teoria del Portafoglio Ottimale

**Riferimenti Accademici:**
- Markowitz (1952) - "Portfolio Selection"
- Merton (1969) - "Lifetime Portfolio Selection"
- Black & Litterman (1992) - "Global Portfolio Optimization"
- Fama & French (1993) - "Common Risk Factors in the Returns on Stocks and Bonds"

## Modern Portfolio Theory (Markowitz, 1952)

### Il Problema

**Domanda**: Come allocare capitale tra asset per massimizzare rendimento dato rischio?

### Mean-Variance Optimization

**Formula:**
```
Maximize: E[Rp] - (λ/2) × Var(Rp)
```

Dove:
- E[Rp] = Rendimento atteso portafoglio
- Var(Rp) = Varianza portafoglio (rischio)
- λ = Coefficiente avversione rischio

**Soluzione:**
```
w* = (1/λ) × Σ⁻¹ × (μ - rf × 1)
```

Dove:
- w* = Pesi ottimali
- Σ = Matrice varianza-covarianza
- μ = Vettore rendimenti attesi
- rf = Risk-free rate

**Paper di Riferimento:**
> Markowitz (1952): "Portfolio Selection", Journal of Finance

### Efficient Frontier

**Definizione**: Insieme portafogli che massimizzano rendimento per ogni livello rischio.

**Caratteristiche:**
- Ogni portafoglio sulla frontiera è "efficiente"
- Sotto la frontiera: inefficiente (stesso rischio, rendimento minore)
- Sopra la frontiera: impossibile (stesso rischio, rendimento maggiore)

**Implicazioni:**
- Diversificazione riduce rischio senza sacrificare rendimento
- Correlazione < 1 tra asset → beneficio diversificazione

## Capital Asset Pricing Model (CAPM)

### Sharpe (1964), Lintner (1965), Mossin (1966)

**Formula:**
```
E[Ri] = Rf + βi × (E[Rm] - Rf)
```

Dove:
- E[Ri] = Rendimento atteso asset i
- Rf = Risk-free rate
- βi = Beta asset i
- E[Rm] = Rendimento atteso mercato

**Interpretazione:**
- Rendimento = Risk-free + Premio rischio
- Premio rischio = β × Market Risk Premium

**Paper di Riferimento:**
> Sharpe (1964): "Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk", Journal of Finance

### Limiti CAPM

1. **Single-Factor Model**: Solo rischio mercato
2. **Beta Instabile**: Cambia nel tempo
3. **Anomalies**: Size effect, value effect non spiegati

## Fama-French Three-Factor Model (1993)

### Estensione CAPM

**Formula:**
```
E[Ri] = Rf + βi × (Rm - Rf) + si × SMB + hi × HML
```

Dove:
- SMB = Small Minus Big (size factor)
- HML = High Minus Low (value factor)
- si, hi = Sensibilità a size e value

**Fattori:**
1. **Market Factor**: Rm - Rf (come CAPM)
2. **Size Factor**: Small cap outperform large cap
3. **Value Factor**: Value stocks outperform growth stocks

**Paper di Riferimento:**
> Fama & French (1993): "Common Risk Factors in the Returns on Stocks and Bonds", Journal of Financial Economics

### Fama-French Five-Factor Model (2015)

**Aggiunge:**
- **Profitability Factor** (RMW): Robust Minus Weak
- **Investment Factor** (CMA): Conservative Minus Aggressive

**Paper di Riferimento:**
> Fama & French (2015): "A Five-Factor Asset Pricing Model", Journal of Financial Economics

## Lifetime Portfolio Selection (Merton, 1969)

### Il Problema

**Domanda**: Come allocare capitale durante tutta la vita?

### Modello Merton

**Assunzioni:**
- Orizzonte infinito (o molto lungo)
- Utility function: CRRA (Constant Relative Risk Aversion)
- Rendimenti distribuiti normalmente

**Risultato:**
```
Stock Allocation = (μ - r) / (γ × σ²)
```

Dove:
- μ = Rendimento atteso azioni
- r = Risk-free rate
- γ = Coefficiente avversione rischio
- σ² = Varianza azioni

**Interpretazione:**
- Stock allocation **costante** nel tempo (se parametri costanti)
- Dipende da: rendimento atteso, rischio, avversione rischio
- **NON** dipende da età (contrario a regola "100 - age")

**Paper di Riferimento:**
> Merton (1969): "Lifetime Portfolio Selection under Uncertainty: The Continuous-Time Case", Review of Economics and Statistics

### Modello Samuelson (1969)

**Risultato Simile:**
- Stock allocation costante se orizzonte lungo
- **Ma**: Se orizzonte finito → allocation diminuisce verso scadenza

**Paper di Riferimento:**
> Samuelson (1969): "Lifetime Portfolio Selection by Dynamic Stochastic Programming", Review of Economics and Statistics

## Black-Litterman Model (1992)

### Il Problema

**Markowitz ha limiti:**
- Input (rendimenti attesi) instabili
- Portafogli estremi (100% in pochi asset)
- Sensibile a piccole variazioni input

### Soluzione Black-Litterman

**Approccio:**
1. **Prior**: Market equilibrium (CAPM)
2. **Views**: Opinioni investitore su asset specifici
3. **Combina**: Bayesian updating

**Formula:**
```
E[R] = [(τΣ)⁻¹ + P''Ω⁻¹P]⁻¹ × [(τΣ)⁻¹Π + P''Ω⁻¹Q]
```

Dove:
- Π = Rendimenti equilibrio mercato
- P = Matrice views
- Q = Vettore views
- Ω = Incertezza views
- τ = Peso views vs equilibrio

**Vantaggi:**
- Portafogli più stabili
- Incorpora views senza ignorare equilibrio
- Diversificazione automatica

**Paper di Riferimento:**
> Black & Litterman (1992): "Global Portfolio Optimization", Financial Analysts Journal

## Consumption and Portfolio Choice (Cocco et al., 2005)

### Modello Life-Cycle Completo

**Fattori Considerati:**
- Età
- Reddito (stipendio)
- Patrimonio esistente
- Orizzonte temporale
- Avversione rischio

**Risultati:**
- **Giovani (25-35)**: 80-100% azioni (reddito futuro alto)
- **Mezza età (35-50)**: 60-80% azioni
- **Pre-pensione (50-65)**: 40-60% azioni
- **Pensione (65+)**: 20-40% azioni

**Paper di Riferimento:**
> Cocco et al. (2005): "Consumption and Portfolio Choice over the Life Cycle", Review of Financial Studies

## Asset Allocation Pratica

### Regola "100 - Age" (Semplificata)

**Formula:**
```
Stock % = 100 - Age
Bond % = Age
```

**Esempi:**
- 30 anni: 70% azioni, 30% obbligazioni
- 50 anni: 50% azioni, 50% obbligazioni
- 70 anni: 30% azioni, 70% obbligazioni

**Limiti:**
- Non considera: reddito, patrimonio, obiettivi
- Troppo semplice per casi complessi

### Regola "120 - Age" (Più Aggressiva)

**Formula:**
```
Stock % = 120 - Age
```

**Giustificazione:**
- Aspettativa vita aumentata
- Orizzonte temporale più lungo
- Inflazione più alta

### Regola "Age in Bonds" (Più Conservativa)

**Formula:**
```
Bond % = Age
Stock % = 100 - Age
```

**Quando Usare:**
- Avversione rischio alta
- Patrimonio già sufficiente
- Obiettivo: preservare, non crescere

## Rebalancing Strategico

### Perché Rebalance?

1. **Mantiene Asset Allocation Target**: Azioni salgono → % aumenta → vende per riequilibrare
2. **Buy Low, Sell High**: Automatico con rebalancing
3. **Controlla Rischio**: Evita concentrazione eccessiva

**Paper di Riferimento:**
> Dammon et al. (2004): "Optimal Asset Location and Allocation with Taxable and Tax-Deferred Investing", Review of Financial Studies

### Strategie Rebalancing

#### 1. Time-Based
- **Frequenza**: Trimestrale, semestrale, annuale
- **Vantaggio**: Semplice, disciplinato
- **Svantaggio**: Può essere prematuro o tardivo

#### 2. Threshold-Based
- **Soglia**: Deviazione > X% (es. 5%)
- **Vantaggio**: Solo quando necessario
- **Svantaggio**: Più transazioni in mercati volatili

#### 3. Hybrid (Best Practice)
- **Controllo**: Periodico (es. trimestrale)
- **Rebalance**: Se deviazione > soglia (es. 5%)
- **Vantaggio**: Disciplina + flessibilità

### Costi Rebalancing

**Considera:**
- Commissioni trading
- Spread bid-ask
- Imposte (plusvalenze)
- **Regola**: Rebalance solo se beneficio > costi

## Tax Optimization

### Asset Location

**Principio**: Metti asset tax-efficienti in conti tassabili, asset tax-inefficienti in conti tax-deferred.

**Esempi:**
- **Taxable Account**: ETF azionari (tassazione solo su vendita)
- **Tax-Deferred**: Obbligazioni (interessi tassati annualmente)

**Paper di Riferimento:**
> Dammon et al. (2004): "Optimal Asset Location and Allocation"

### Tax-Loss Harvesting

**Strategia**: Vendi asset in perdita per realizzare loss, compensa plusvalenze.

**Regole:**
- **Wash Sale Rule**: Non ricomprare stesso asset 30 giorni prima/dopo
- **Beneficio**: Riduce imposte, mantiene esposizione

**Paper di Riferimento:**
> Dammon & Spatt (1996): "The Optimal Trading and Pricing of Securities with Asymmetric Capital Gains Taxes"

## Withdrawal Strategies (Pensione)

### Regola del 4% (Bengen, 1994)

**Principio**: Preleva 4% capitale iniziale, aumentato per inflazione.

**Esempio:**
- Capitale: €1,000,000
- Prelievo anno 1: €40,000
- Prelievo anno 2: €40,000 × 1.02 (inflazione 2%) = €40,800

**Success Rate**: 95% su 30 anni (storico USA)

**Paper di Riferimento:**
> Bengen (1994): "Determining Withdrawal Rates Using Historical Data", Journal of Financial Planning

### Guardrails Strategy (Blanchett et al., 2022)

**Principio**: Aggiusta prelievo in base a performance portafoglio.

**Regole:**
- **Portafoglio > Target**: Aumenta prelievo 10%
- **Portafoglio < Target**: Riduci prelievo 10%
- **Limiti**: Min 2.5%, Max 5.5%

**Paper di Riferimento:**
> Blanchett et al. (2022): "A More Dynamic Approach to Spending for Retirees", Journal of Financial Planning

## Checklist Gestione Patrimonio

- [ ] Asset allocation definita (Markowitz/Merton)
- [ ] Rebalancing strategy (hybrid: time + threshold)
- [ ] Tax optimization (asset location, tax-loss harvesting)
- [ ] Withdrawal strategy (se in pensione)
- [ ] Diversificazione geografica/settoriale
- [ ] Costi < 1% annuo
- [ ] Review annuale strategia
- [ ] Stress test portafoglio
- [ ] Estate planning (successione)
- [ ] Insurance review (vita, invalidità)

> **Principio**: "La gestione del patrimonio è un processo continuo, non un evento. Monitora, adatta, ottimizza."',
    'text',
    1,
    30,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 2: Strategie di Withdrawal =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_4_id,
    'Strategie di Prelievo in Pensione: Regola 4%, Guardrails, Bucket',
    '# Strategie di Prelievo in Pensione

**Riferimenti Accademici:**
- Bengen (1994) - "Determining Withdrawal Rates Using Historical Data"
- Cooley et al. (1998) - "Retirement Savings: Choosing a Withdrawal Rate"
- Blanchett et al. (2022) - "A More Dynamic Approach to Spending"
- Guyton & Klinger (2006) - "Decision Rules and Portfolio Management for Retirees"

## Il Problema del Withdrawal

### Domanda Fondamentale

**"Quanto posso prelevare annualmente dal mio portafoglio senza esaurirlo?"**

**Fattori:**
- Capitale iniziale
- Rendimento atteso portafoglio
- Inflazione
- Orizzonte temporale (aspettativa vita)
- Volatilità mercati

## Regola del 4% (Bengen, 1994)

### Lo Studio Originale

**Metodologia:**
- Analisi storica USA (1926-1994)
- Portafogli 50/50 azioni/obbligazioni
- Orizzonte: 30 anni
- Prelievo: 4% capitale iniziale, aumentato per inflazione

**Risultati:**
- **Success Rate**: 95% (portafoglio non esaurito in 30 anni)
- **Worst Case**: 1966 (portafoglio esaurito in 28 anni)
- **Best Case**: Portafoglio cresciuto significativamente

**Paper di Riferimento:**
> Bengen (1994): "Determining Withdrawal Rates Using Historical Data", Journal of Financial Planning

### Come Funziona

**Esempio:**
- Capitale iniziale: €1,000,000
- Prelievo anno 1: €40,000 (4%)
- Inflazione: 2% annua
- Prelievo anno 2: €40,800 (€40,000 × 1.02)
- Prelievo anno 3: €41,616 (€40,800 × 1.02)
- E così via...

**Formula:**
```
Withdrawal_t = Initial_Capital × 0.04 × (1 + Inflation)^(t-1)
```

### Limiti e Critiche

1. **Basato su Storia USA**: Altri mercati possono performare diversamente
2. **Orizzonte 30 anni**: Se vivi più a lungo, rischio esaurimento
3. **Asset Allocation Fissa**: 50/50 può non essere ottimale
4. **Inflazione Assunta**: Inflazione reale può variare

**Paper di Riferimento:**
> Cooley et al. (1998): "Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable", AAII Journal

### Varianti

#### Regola del 3% (Più Conservativa)
- **Success Rate**: 99%+ su 30 anni
- **Quando**: Avversione rischio alta, orizzonte > 30 anni

#### Regola del 5% (Più Aggressiva)
- **Success Rate**: ~80% su 30 anni
- **Quando**: Orizzonte < 25 anni, accetti rischio

## Guardrails Strategy (Blanchett et al., 2022)

### Principio

**Aggiusta prelievo in base a performance portafoglio.**

### Regole

1. **Upper Guardrail**: Se portafoglio > 120% target → aumenta prelievo 10%
2. **Lower Guardrail**: Se portafoglio < 80% target → riduci prelievo 10%
3. **Limiti**: Prelievo tra 2.5% e 5.5% capitale iniziale

**Esempio:**
- Target: €1,000,000
- Prelievo base: €40,000 (4%)
- **Anno 1**: Portafoglio = €1,200,000 (120% target) → Prelievo = €44,000 (+10%)
- **Anno 2**: Portafoglio = €800,000 (80% target) → Prelievo = €36,000 (-10%)

**Vantaggi:**
- Adattivo a condizioni mercato
- Mantiene sostenibilità
- Permette flessibilità spesa

**Paper di Riferimento:**
> Blanchett et al. (2022): "A More Dynamic Approach to Spending for Retirees", Journal of Financial Planning

## Guyton-Klinger Rules (2006)

### Sistema di Regole

**4 Regole Principali:**

1. **Withdrawal Rule**: Prelievo base aumentato per inflazione
2. **Capital Preservation Rule**: Se portafoglio scende < 20% valore iniziale → congela aumento inflazione
3. **Prosperity Rule**: Se portafoglio sale > 20% valore iniziale → aumenta prelievo 10%
4. **Money Guard Rule**: Se prelievo > 20% portafoglio corrente → riduci prelievo 10%

**Paper di Riferimento:**
> Guyton & Klinger (2006): "Decision Rules and Portfolio Management for Retirees: Is the 'Safe' Initial Withdrawal Rate Too Safe?", Journal of Financial Planning

## Bucket Strategy

### Principio

**Divide portafoglio in "secchi" per orizzonte temporale.**

### Struttura

#### Bucket 1: Liquidità (0-2 anni)
- **Asset**: Contanti, conti deposito
- **Funzione**: Spese immediate
- **Importo**: 2 anni spese

#### Bucket 2: Stabilità (3-10 anni)
- **Asset**: Obbligazioni a medio termine
- **Funzione**: Rifornisce Bucket 1
- **Importo**: 8 anni spese

#### Bucket 3: Crescita (10+ anni)
- **Asset**: Azioni, ETF globali
- **Funzione**: Crescita long-term, rifornisce Bucket 2
- **Importo**: Resto portafoglio

### Meccanismo

1. **Spendi da Bucket 1** (liquidità)
2. **Ogni anno**: Rifornisci Bucket 1 da Bucket 2
3. **Ogni 2-3 anni**: Rifornisci Bucket 2 da Bucket 3 (se necessario)

**Vantaggi:**
- Separazione psicologica (liquidità vs crescita)
- Protezione da volatilità short-term
- Mantiene esposizione crescita long-term

## Variable Withdrawal Strategies

### VPW (Variable Percentage Withdrawal)

**Principio**: Prelievo % variabile basato su età e rendimento atteso.

**Formula:**
```
Withdrawal % = 1 / (Life_Expectancy - Current_Age)
```

**Esempio:**
- Età: 65
- Aspettativa vita: 85
- Withdrawal % = 1 / (85 - 65) = 5%
- Capitale: €1,000,000 → Prelievo: €50,000

**Vantaggio**: Adattivo a età e aspettativa vita

**Paper di Riferimento:**
> Bogleheads Wiki: "Variable Percentage Withdrawal"

## Confronto Strategie

| Strategia | Prelievo Iniziale | Flessibilità | Success Rate | Complessità |
|-----------|-------------------|--------------|--------------|-------------|
| 4% Rule | 4% fisso | Bassa | 95% | Bassa |
| 3% Rule | 3% fisso | Bassa | 99%+ | Bassa |
| Guardrails | 4% variabile | Alta | 95%+ | Media |
| Guyton-Klinger | 4% con regole | Alta | 95%+ | Alta |
| Bucket | Variabile | Media | 95%+ | Media |
| VPW | % variabile | Alta | 95%+ | Media |

## Best Practice

1. **Inizia Conservativo**: 3-3.5% se orizzonte lungo
2. **Monitora Performance**: Review annuale portafoglio
3. **Sii Flessibile**: Riduci spese se mercati crollano
4. **Considera Fonti Multiple**: Pensione + portafoglio + immobiliare
5. **Pianifica Successione**: Estate planning

> **Principio**: "Il withdrawal rate non è fisso. Adattalo a condizioni mercato e cambiamenti personali."',
    'text',
    2,
    25,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== TEST MODULO 4 =====
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
    v_module_4_id,
    'Test: Voglio Gestire il Mio Patrimonio',
    'Verifica comprensione wealth management e withdrawal strategies',
    75,
    3,
    25,
    'analyze',
    true
  ) ON CONFLICT DO NOTHING
  RETURNING id INTO v_test_4_id;

  IF v_test_4_id IS NULL THEN
    SELECT id INTO v_test_4_id FROM education_tests WHERE module_id = v_module_4_id AND title = 'Test: Voglio Gestire il Mio Patrimonio';
  END IF;

  -- Domanda 1: Markowitz
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
    v_test_4_id,
    'Secondo Markowitz (1952), la diversificazione riduce il rischio perché:',
    'multiple_choice',
    1,
    1,
    'Markowitz dimostra che con correlazione < 1, la varianza del portafoglio è minore della media ponderata delle varianze individuali.',
    'understand',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_4_id AND order_index = 1;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Le correlazioni tra asset < 1 riducono varianza portafoglio', true, 1, 'Corretto! Questo è il principio base di Markowitz'),
  (v_q_id, 'Aumenta sempre il rendimento', false, 2, 'Diversificazione può ridurre rendimento se asset migliori sono esclusi'),
  (v_q_id, 'Elimina tutto il rischio', false, 3, 'Elimina solo rischio specifico, non sistematico'),
  (v_q_id, 'Non ha effetto sul rischio', false, 4, 'Ha effetto significativo')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 2: Regola 4%
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
    v_test_4_id,
    'Secondo Bengen (1994), la "Regola del 4%" prevede:',
    'multiple_choice',
    2,
    1,
    'La regola del 4% prevede di prelevare il 4% del capitale iniziale il primo anno, poi aumentare per inflazione ogni anno successivo.',
    'remember',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_4_id AND order_index = 2;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, '4% capitale iniziale anno 1, poi aumentato per inflazione', true, 1, 'Corretto! Questa è la regola del 4%'),
  (v_q_id, '4% del portafoglio corrente ogni anno', false, 2, 'Questo sarebbe VPW, non regola 4%'),
  (v_q_id, '4% solo il primo anno', false, 3, 'Si continua ad aumentare per inflazione'),
  (v_q_id, '4% solo se portafoglio cresce', false, 4, 'È fisso, indipendentemente da performance')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 3: Merton
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
    v_test_4_id,
    'Secondo Merton (1969), l''asset allocation ottimale:',
    'multiple_choice',
    3,
    1,
    'Merton dimostra che con orizzonte infinito e utility CRRA, l''asset allocation è costante nel tempo, non dipende dall''età.',
    'analyze',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_4_id AND order_index = 3;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'È costante nel tempo se orizzonte infinito', true, 1, 'Corretto! Questo è il risultato di Merton'),
  (v_q_id, 'Diminuisce sempre con l''età', false, 2, 'Questo è modello life-cycle semplificato, non Merton'),
  (v_q_id, 'Aumenta sempre con l''età', false, 3, 'Non supportato da Merton'),
  (v_q_id, 'Dipende solo dal reddito', false, 4, 'Dipende da rendimento atteso, rischio, avversione rischio')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 4: Rebalancing
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
    v_test_4_id,
    'La strategia di rebalancing "hybrid" combina:',
    'multiple_choice',
    4,
    1,
    'La strategia hybrid combina controllo periodico (time-based) con soglia di deviazione (threshold-based) per bilanciare disciplina e flessibilità.',
    'apply',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_4_id AND order_index = 4;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Controllo periodico + soglia deviazione', true, 1, 'Corretto! Best practice'),
  (v_q_id, 'Solo controllo periodico', false, 2, 'Manca flessibilità'),
  (v_q_id, 'Solo soglia deviazione', false, 3, 'Manca disciplina'),
  (v_q_id, 'Nessun rebalancing', false, 4, 'Rebalancing è importante')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 5: Guardrails
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
    v_test_4_id,
    'Nella strategia Guardrails, se il portafoglio scende sotto l''80% del target:',
    'multiple_choice',
    5,
    1,
    'La strategia Guardrails prevede di ridurre il prelievo del 10% quando il portafoglio scende sotto l''80% del target per preservare il capitale.',
    'apply',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_4_id AND order_index = 5;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Riduci prelievo 10% per preservare capitale', true, 1, 'Corretto! Lower guardrail'),
  (v_q_id, 'Aumenta prelievo 10%', false, 2, 'Questo è upper guardrail quando portafoglio > 120%'),
  (v_q_id, 'Mantieni prelievo invariato', false, 3, 'La strategia prevede aggiustamento'),
  (v_q_id, 'Vendi tutto', false, 4, 'Non è parte della strategia')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  RAISE NOTICE '✅ Modulo 4 creato: Voglio Gestire il Mio Patrimonio';
  RAISE NOTICE '📚 Lezioni: 2 (Portfolio Theory, Withdrawal Strategies)';
  RAISE NOTICE '📝 Test: 1 (5 domande)';
END $$;
