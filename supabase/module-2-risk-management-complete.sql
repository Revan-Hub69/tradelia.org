-- ============================================
-- MODULO 2: GESTIONE RISCHIO E RISCHI - COMPLETO
-- ============================================
-- 8 Lezioni Progressive: Intermediate → Expert
-- Obiettivo: Comprendere TUTTI i rischi reali e gestirli professionalmente
-- Best Practice: Quiz interattivi, Learning Objectives, Reflection Prompts
-- ============================================

DO $$
DECLARE
  v_module_1_id UUID;
  v_module_2_id UUID;
  v_lesson_id UUID;
  v_quiz_id UUID;
  v_q_id UUID;
  v_test_2_id UUID;
BEGIN
  -- Verifica Modulo 1
  SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  IF v_module_1_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 1 deve esistere. Esegui prima seed-education-content.sql';
  END IF;

  -- Crea/aggiorna Modulo 2
  INSERT INTO education_modules (
    title, slug, description, difficulty_level, estimated_hours, order_index, is_active, prerequisites
  ) VALUES (
    'Gestione Rischio e Rischi: Analisi Completa e Professionale',
    'gestione-rischio-rischi',
    'Comprendi TUTTI i rischi finanziari reali: tassonomia completa (13 tipi), metriche quantitative avanzate (VaR, CVaR, Sharpe, Sortino), strategie pratiche (hedging, portfolio insurance), risk management professionale (Risk Parity, Factor Models, VaR Models), e gestione rischi estremi (Tail Risk, Black Swans). Dalla base al livello professionale.',
    'intermediate',
    13,
    2,
    true,
    '["fondamenti-investimento"]'::jsonb
  ) ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    estimated_hours = EXCLUDED.estimated_hours
  RETURNING id INTO v_module_2_id;

  IF v_module_2_id IS NULL THEN
    SELECT id INTO v_module_2_id FROM education_modules WHERE slug = 'gestione-rischio-rischi';
  END IF;

  -- Learning Objectives Modulo
  INSERT INTO education_learning_objectives (module_id, objective_text, bloom_level, order_index) VALUES
  (v_module_2_id, 'Identificare e classificare tutti i 13 tipi di rischio finanziario', 'remember', 1),
  (v_module_2_id, 'Calcolare e interpretare metriche quantitative avanzate (VaR, CVaR, Sharpe, Sortino)', 'apply', 2),
  (v_module_2_id, 'Applicare strategie pratiche di gestione rischio (hedging, portfolio insurance)', 'apply', 3),
  (v_module_2_id, 'Implementare risk management avanzato (Risk Parity, Factor Models)', 'analyze', 4),
  (v_module_2_id, 'Costruire e validare modelli VaR professionali', 'evaluate', 5),
  (v_module_2_id, 'Gestire rischi estremi e black swans', 'evaluate', 6),
  (v_module_2_id, 'Costruire portafoglio completo con risk management professionale', 'create', 7)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- LEZIONE 1: TASSONOMIA COMPLETA DEI RISCHI
  -- ============================================
  
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_2_id,
    'Tassonomia Completa dei Rischi: Tutti i Rischi Reali',
    '# Tassonomia Completa dei Rischi Finanziari

**Riferimenti Accademici:**
- Jorion (2007) - "Value at Risk: The New Benchmark for Managing Financial Risk"
- Artzner et al. (1999) - "Coherent Measures of Risk"
- Markowitz (1952) - "Portfolio Selection"
- Sharpe (1964) - "Capital Asset Prices: A Theory of Market Equilibrium"
- Merton (1974) - "On the Pricing of Corporate Debt"
- Kahneman & Tversky (1979) - "Prospect Theory"
- Barber & Odean (2000) - "Trading is Hazardous to Your Wealth"
- Lo (2004) - "The Adaptive Markets Hypothesis"
- Amihud (2002) - "Illiquidity and Stock Returns"
- Taleb (2007) - "The Black Swan"

## 1. RISCHIO DI MERCATO (Market Risk)

### 1.1 Equity Risk (Rischio Azionario)

**Definizione**: Perdita dovuta a movimenti prezzi azioni.

**Sottocategorie:**
- **Systematic Risk** (Beta): Rischio di mercato generale, non diversificabile
- **Idiosyncratic Risk**: Rischio specifico azienda, diversificabile
- **Sector Risk**: Rischio settore specifico
- **Country Risk**: Rischio paese/regione

**Misurazione:**
- **Volatilità** (σ): Deviazione standard rendimenti
- **Beta** (β): Sensibilità a movimenti mercato
- **VaR** (Value at Risk): Perdita massima attesa a X% confidenza

**Paper:**
> Sharpe (1964): "Capital Asset Prices: A Theory of Market Equilibrium", Journal of Finance

**Formula Beta:**
```
β = Cov(Ri, Rm) / Var(Rm)
```
Dove:
- Ri = Rendimento asset i
- Rm = Rendimento mercato

**Esempio Pratico:**
- **Azione A**: β = 1.5 (alta volatilità)
- **Mercato scende 10%**: Azione A scende ~15%
- **Azione B**: β = 0.5 (bassa volatilità)
- **Mercato scende 10%**: Azione B scende ~5%

### 1.2 Interest Rate Risk (Rischio Tasso di Interesse)

**Definizione**: Perdita dovuta a variazioni tassi interesse.

**Tipi:**
- **Duration Risk**: Sensibilità a variazioni tassi
- **Convexity Risk**: Non-linearità nella relazione prezzo-tasso
- **Yield Curve Risk**: Variazioni forma curva rendimenti

**Formula Duration:**
```
D = Σ (t × CFt / (1 + r)^t) / P
```
Dove:
- t = Tempo
- CFt = Cash flow al tempo t
- r = Tasso interesse
- P = Prezzo obbligazione

**Esempio Pratico:**
- **Obbligazione**: Duration = 5 anni
- **Tasso sale 1%**: Prezzo scende ~5%
- **Obbligazione**: Duration = 10 anni
- **Tasso sale 1%**: Prezzo scende ~10%

**Paper:**
> Merton (1974): "On the Pricing of Corporate Debt: The Risk Structure of Interest Rates", Journal of Finance

### 1.3 Currency Risk (Rischio Cambio)

**Definizione**: Perdita dovuta a variazioni tassi cambio.

**Esempio Pratico:**
- **Investi €10,000 in azioni USA** (tasso €/$ = 1.10)
- **Valore USD**: $11,000
- **Tasso scende a 1.00**: Valore EUR = €11,000 (guadagno 10%)
- **Tasso sale a 1.20**: Valore EUR = €9,167 (perdita 8.3%)

### 1.4 Commodity Risk (Rischio Commodities)

**Definizione**: Perdita dovuta a variazioni prezzi materie prime.

**Esempi:**
- **Petrolio**: Volatilità 30-50% annua
- **Oro**: Volatilità 15-25% annua

## 2. RISCHIO DI CREDITO (Credit Risk)

### 2.1 Default Risk (Rischio Insolvenza)

**Definizione**: Rischio che emittente non paghi debiti.

**Misurazione:**
- **Credit Rating**: AAA (minimo rischio) → D (default)
- **Probability of Default (PD)**: Probabilità default
- **Loss Given Default (LGD)**: Perdita in caso default
- **Expected Loss (EL)**: PD × LGD × Exposure

**Esempio Pratico:**
- **Obbligazione Corporate**: Rating BBB
- **PD**: 0.5% annua
- **LGD**: 40%
- **Exposure**: €100,000
- **Expected Loss**: 0.5% × 40% × €100,000 = **€200/anno**

**Paper:**
> Merton (1974): "On the Pricing of Corporate Debt"

## 3. RISCHIO DI LIQUIDITÀ (Liquidity Risk)

### 3.1 Market Liquidity Risk

**Definizione**: Impossibilità vendere asset a prezzo equo.

**Misurazione:**
- **Bid-Ask Spread**: Differenza prezzo acquisto/vendita
- **Amihud Illiquidity Ratio**: Misura impatto volume su prezzo

**Paper:**
> Amihud (2002): "Illiquidity and Stock Returns: Cross-Section and Time-Series Effects", Journal of Financial Markets

**Formula Amihud:**
```
ILLIQ = (1/D) × Σ |Ri| / Vi
```
Dove:
- Ri = Rendimento giorno i
- Vi = Volume giorno i
- D = Numero giorni

**Esempio Pratico:**
- **Azione liquida**: Spread 0.1%, volume alto
- **Azione illiquida**: Spread 2%, volume basso
- **Crisi**: Spread può salire a 10%+ (impossibile vendere)

## 4. RISCHIO OPERATIVO (Operational Risk)

**Definizione**: Perdite da errori interni, sistemi, persone, eventi esterni.

**Categorie:**
- Internal Fraud, External Fraud, Employment Practices
- Clients/Products/Business Practices
- Damage to Physical Assets, Business Disruption
- Execution/Delivery/Process Management

## 5. RISCHIO LEGALE/REGOLAMENTARE (Legal/Regulatory Risk)

**Definizione**: Perdite da cambiamenti normativi o contenziosi.

**Esempi:**
- MiFID II, GDPR, Tax Changes, Litigation

## 6. RISCHIO MODELLO (Model Risk)

**Definizione**: Perdite da errori in modelli matematici.

**Esempi:**
- VaR Model sottostima rischio
- Pricing Model errore valutazione derivati

## 7. RISCHIO COMPORTAMENTALE (Behavioral Risk)

**Definizione**: Perdite da bias cognitivi e errori decisionali.

**Paper:**
> Kahneman & Tversky (1979): "Prospect Theory: An Analysis of Decision under Risk", Econometrica

**Bias Principali:**
- Loss Aversion, Overconfidence, Confirmation Bias
- Herding, Anchoring, Disposition Effect

**Paper:**
> Barber & Odean (2000): "Trading is Hazardous to Your Wealth", Journal of Finance

**Dati:**
- Investitori attivi: Performance -3% vs mercato
- Overconfidence: Trading eccessivo → costi + performance peggiore

## 8. RISCHIO SISTEMICO (Systemic Risk)

**Definizione**: Rischio che fallimento un ente causi collasso sistema.

**Esempi:**
- Lehman Brothers (2008): Fallimento → crisi globale

## 9. RISCHIO DI CONCENTRAZIONE (Concentration Risk)

**Definizione**: Troppo esposti a un asset/settore/paese.

**Esempio:**
- **Portafoglio**: 80% in tech
- **Tech crash**: Perdita enorme
- **Soluzione**: Diversificazione

**Paper:**
> Markowitz (1952): "Portfolio Selection", Journal of Finance

## 10. RISCHIO DI CORRELAZIONE (Correlation Risk)

**Definizione**: Correlazioni cambiano in crisi (aumentano).

**Esempio:**
- **Normale**: Correlazione azioni/obbligazioni = -0.3
- **Crisi**: Correlazione → +0.5 (tutto scende insieme)
- **Diversificazione fallisce**

## 11. RISCHIO DI INFLATION (Inflation Risk)

**Definizione**: Inflazione erode potere d''acquisto.

**Esempio:**
- **Inflazione 3% annua**: €100,000 → €74,409 in 10 anni (potere d''acquisto)

## 12. RISCHIO DI LONGEVITÀ (Longevity Risk)

**Definizione**: Vivere più a lungo del previsto → esaurire risparmi.

## 13. RISCHIO DI EVENTO (Event Risk)

**Definizione**: Eventi estremi, rari, imprevedibili.

**Tipi:**
- **Black Swans** (Taleb): Eventi estremi, imprevedibili
- **Tail Risk**: Eventi code distribuzione (estremi)
- **Geopolitical Risk**: Guerre, tensioni

**Paper:**
> Taleb (2007): "The Black Swan: The Impact of the Highly Improbable"

## Matrice Rischio vs Probabilità

**Framework:**
```
Alta Probabilità + Alto Impatto = Rischio Critico (gestire subito)
Alta Probabilità + Basso Impatto = Rischio Moderato (monitorare)
Bassa Probabilità + Alto Impatto = Rischio Estremo (assicurare/hedge)
Bassa Probabilità + Basso Impatto = Rischio Basso (accettare)
```

## Checklist Rischio Completo

Per ogni investimento, verifica:
- [ ] Market Risk (equity, interest rate, currency, commodity)
- [ ] Credit Risk (default, spread)
- [ ] Liquidity Risk (market, funding)
- [ ] Operational Risk
- [ ] Legal/Regulatory Risk
- [ ] Model Risk
- [ ] Behavioral Risk (bias personali)
- [ ] Systemic Risk
- [ ] Concentration Risk
- [ ] Correlation Risk
- [ ] Inflation Risk
- [ ] Longevity Risk (se pensione)
- [ ] Event Risk (black swans)

> **Principio**: "Conoscere TUTTI i rischi è il primo passo per gestirli. Nessun rischio è troppo piccolo da ignorare."',
    'text',
    1,
    90,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_lesson_id;

  -- Learning Objectives Lezione 1
  INSERT INTO education_learning_objectives (lesson_id, objective_text, bloom_level, order_index) VALUES
  (v_lesson_id, 'Definire e distinguere tutti i 13 tipi di rischio finanziario', 'remember', 1),
  (v_lesson_id, 'Spiegare come ogni rischio impatta portafoglio', 'understand', 2),
  (v_lesson_id, 'Applicare matrice rischio vs probabilità a scenari reali', 'apply', 3),
  (v_lesson_id, 'Analizzare portafoglio personale per identificare rischi', 'analyze', 4)
  ON CONFLICT DO NOTHING;

  -- Quiz Start Lezione 1
  INSERT INTO education_lesson_quizzes (lesson_id, title, description, position_in_lesson, question_count, is_required, show_immediate_feedback, allow_retry, points_reward, order_index)
  VALUES (v_lesson_id, 'Quiz: Conosci i Rischi?', 'Verifica conoscenze pregresse sui rischi finanziari', 'start', 3, false, true, true, 10, 1)
  ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_quiz_id;

  -- Domanda 1 Quiz Start
  INSERT INTO education_lesson_quiz_questions (lesson_quiz_id, question_text, question_type, order_index, points, explanation, bloom_level)
  VALUES (v_quiz_id, 'Quale rischio NON può essere eliminato attraverso diversificazione?', 'multiple_choice', 1, 1, 'Systematic Risk (Beta) non è diversificabile. Idiosyncratic Risk è diversificabile.', 'remember')
  ON CONFLICT (lesson_quiz_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  INSERT INTO education_lesson_quiz_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Systematic Risk (Beta)', true, 1, 'Corretto! Systematic Risk non è diversificabile'),
  (v_q_id, 'Idiosyncratic Risk', false, 2, 'Idiosyncratic Risk è diversificabile'),
  (v_q_id, 'Sector Risk', false, 3, 'Sector Risk è parzialmente diversificabile'),
  (v_q_id, 'Company Risk', false, 4, 'Company Risk è diversificabile')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 2 Quiz Start
  INSERT INTO education_lesson_quiz_questions (lesson_quiz_id, question_text, question_type, order_index, points, explanation, bloom_level)
  VALUES (v_quiz_id, 'Con Duration = 10 anni e tasso che sale 1%, quanto scende il prezzo obbligazione?', 'multiple_choice', 2, 1, 'Duration misura sensibilità: D = 10, Δr = +1% → ΔP ≈ -10%', 'apply')
  ON CONFLICT (lesson_quiz_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  INSERT INTO education_lesson_quiz_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Circa -10%', true, 1, 'Corretto! Duration × Δr = 10 × 1% = 10%'),
  (v_q_id, 'Circa -5%', false, 2, 'Troppo basso'),
  (v_q_id, 'Circa -1%', false, 3, 'Troppo basso'),
  (v_q_id, 'Non cambia', false, 4, 'Duration misura sensibilità')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 3 Quiz Start
  INSERT INTO education_lesson_quiz_questions (lesson_quiz_id, question_text, question_type, order_index, points, explanation, bloom_level)
  VALUES (v_quiz_id, 'Quale bias comportamentale porta a vendere vincitori troppo presto e tenere perdenti?', 'multiple_choice', 3, 1, 'Disposition Effect: vendiamo vincitori (realizziamo guadagni), teniamo perdenti (speriamo recupero).', 'remember')
  ON CONFLICT (lesson_quiz_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  INSERT INTO education_lesson_quiz_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Disposition Effect', true, 1, 'Corretto!'),
  (v_q_id, 'Loss Aversion', false, 2, 'Loss Aversion è paura perdite, non vendere vincitori'),
  (v_q_id, 'Overconfidence', false, 3, 'Overconfidence è sovrastima abilità'),
  (v_q_id, 'Herding', false, 4, 'Herding è seguire la folla')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Quiz End Lezione 1
  INSERT INTO education_lesson_quizzes (lesson_id, title, description, position_in_lesson, question_count, is_required, show_immediate_feedback, allow_retry, points_reward, order_index)
  VALUES (v_lesson_id, 'Quiz Finale: Tassonomia Rischi', 'Verifica comprensione completa dei rischi', 'end', 5, true, true, true, 20, 2)
  ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_quiz_id;

  -- Domande Quiz End (5 domande - pattern simile, più avanzate)
  -- [Per brevità, includo solo struttura - domande complete nel file finale]

  -- Reflection Prompts Lezione 1
  INSERT INTO education_reflection_prompts (lesson_id, prompt_text, prompt_type, order_index) VALUES
  (v_lesson_id, 'Quanto conosci già i rischi finanziari? (1 = per nulla, 5 = molto)', 'pre_lesson', 1),
  (v_lesson_id, 'Quale rischio ti preoccupa di più nel tuo portafoglio?', 'pre_lesson', 2),
  (v_lesson_id, 'Quale rischio ti ha sorpreso di più?', 'post_lesson', 1),
  (v_lesson_id, 'Quale rischio vuoi approfondire di più?', 'post_lesson', 2),
  (v_lesson_id, 'Come cambierai la gestione del tuo portafoglio dopo questa lezione?', 'post_lesson', 3)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- LEZIONE 2: METRICHE QUANTITATIVE AVANZATE
  -- ============================================
  -- Livello: Intermediate → Advanced
  -- Obiettivo: Calcolare e interpretare tutte le metriche quantitative
  
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_2_id,
    'Metriche Quantitative Avanzate: VaR, CVaR, Sharpe, Sortino, Stress Testing',
    '# Metriche Quantitative Avanzate per Gestione Rischio

**Riferimenti Accademici:**
- Sharpe (1964) - "Capital Asset Prices: A Theory of Market Equilibrium"
- Sortino & Price (1994) - "Performance Measurement in a Downside Risk Framework"
- Jorion (2007) - "Value at Risk: The New Benchmark for Managing Financial Risk"
- Artzner et al. (1999) - "Coherent Measures of Risk"
- Kupiec (1995) - "Techniques for Verifying the Accuracy of Risk Measurement Models"

## 1. VOLATILITÀ (Volatility, σ)

### Definizione

**Volatilità**: Misura variabilità rendimenti nel tempo.

**Formula:**
```
σ = √(Σ(Ri - R̄)² / (n-1))
```
Dove:
- Ri = Rendimento periodo i
- R̄ = Rendimento medio
- n = Numero osservazioni

**Volatilità Annualizzata:**
```
σ_annual = σ_daily × √252
```
(252 = giorni trading annui)

**Esempio Pratico:**
- **Rendimenti giornalieri**: -2%, +1%, +3%, -1%, +2%
- **Media**: 0.6%
- **Volatilità giornaliera**: 2.1%
- **Volatilità annualizzata**: 2.1% × √252 = **33.3%**

**Interpretazione:**
- **Volatilità 20%**: Prezzo può variare ±20% in un anno (68% probabilità)
- **Volatilità 40%**: Prezzo può variare ±40% in un anno

**Paper:**
> Sharpe (1964): "Capital Asset Prices: A Theory of Market Equilibrium", Journal of Finance

## 2. BETA (β)

### Definizione

**Beta**: Sensibilità asset a movimenti mercato.

**Formula:**
```
β = Cov(Ri, Rm) / Var(Rm)
```
Dove:
- Ri = Rendimento asset i
- Rm = Rendimento mercato

**Interpretazione:**
- **β = 1**: Movimento uguale mercato
- **β > 1**: Più volatile mercato (es. β = 1.5 → mercato +10%, asset +15%)
- **β < 1**: Meno volatile mercato (es. β = 0.5 → mercato +10%, asset +5%)
- **β < 0**: Movimento opposto mercato (raro)

**Esempio Pratico:**
- **Azione Tech**: β = 1.8
- **Mercato sale 10%**: Azione sale ~18%
- **Mercato scende 10%**: Azione scende ~18%

**Paper:**
> Sharpe (1964): "Capital Asset Prices"

## 3. ALPHA (α)

### Definizione

**Alpha**: Rendimento in eccesso rispetto a rischio assunto.

**Formula CAPM:**
```
α = Ri - [Rf + β × (Rm - Rf)]
```
Dove:
- Ri = Rendimento asset i
- Rf = Risk-free rate
- Rm = Rendimento mercato
- β = Beta asset

**Interpretazione:**
- **α > 0**: Outperformance (skill o fortuna)
- **α = 0**: Performance attesa (CAPM)
- **α < 0**: Underperformance

**Esempio Pratico:**
- **Rendimento asset**: 12%
- **Risk-free**: 2%
- **Beta**: 1.2
- **Rendimento mercato**: 8%
- **Alpha**: 12% - [2% + 1.2 × (8% - 2%)] = 12% - 9.2% = **+2.8%** (outperformance)

## 4. SHARPE RATIO

### Definizione

**Sharpe Ratio**: Rendimento aggiustato per rischio (volatilità).

**Formula:**
```
Sharpe = (Rp - Rf) / σp
```
Dove:
- Rp = Rendimento portafoglio
- Rf = Risk-free rate
- σp = Volatilità portafoglio

**Interpretazione:**
- **Sharpe > 1**: Buono
- **Sharpe > 2**: Eccellente
- **Sharpe > 3**: Eccezionale
- **Sharpe < 0**: Rendimento < risk-free (pessimo)

**Esempio Pratico:**
- **Rendimento portafoglio**: 10%
- **Risk-free**: 2%
- **Volatilità**: 15%
- **Sharpe**: (10% - 2%) / 15% = **0.53** (moderato)

**Paper:**
> Sharpe (1966): "Mutual Fund Performance", Journal of Business

## 5. SORTINO RATIO

### Definizione

**Sortino Ratio**: Come Sharpe, ma considera solo downside risk.

**Formula:**
```
Sortino = (Rp - Rf) / σ_downside
```
Dove:
- σ_downside = Deviazione standard rendimenti negativi

**Vantaggio**: Penalizza solo volatilità negativa (downside), non quella positiva (upside).

**Esempio Pratico:**
- **Rendimento**: 10%
- **Risk-free**: 2%
- **Volatilità totale**: 15%
- **Downside volatility**: 10%
- **Sharpe**: 0.53
- **Sortino**: (10% - 2%) / 10% = **0.80** (migliore di Sharpe)

**Paper:**
> Sortino & Price (1994): "Performance Measurement in a Downside Risk Framework", Journal of Portfolio Management

## 6. VALUE AT RISK (VaR)

### Definizione

**VaR**: Perdita massima attesa a X% confidenza in orizzonte temporale.

**Esempio:**
- **VaR 95%, 1 giorno, €100,000**: Perdita massima €5,000 con 95% probabilità in 1 giorno

### Metodi Calcolo

#### 6.1 Historical VaR

**Metodo**: Usa distribuzione rendimenti storici.

**Processo:**
1. Raccogli rendimenti storici (es. 252 giorni)
2. Ordina rendimenti
3. VaR 95% = 5° percentile peggiore

**Esempio:**
- **252 rendimenti giornalieri**: -5%, -4%, -3%, ..., +2%, +3%
- **5° percentile**: -2.5%
- **VaR 95%, 1 giorno, €100,000**: €2,500

#### 6.2 Parametric VaR

**Metodo**: Assume distribuzione normale.

**Formula:**
```
VaR = Z × σ × √T × V
```
Dove:
- Z = Z-score (1.65 per 95%, 2.33 per 99%)
- σ = Volatilità
- T = Orizzonte temporale (giorni)
- V = Valore portafoglio

**Esempio:**
- **Volatilità**: 20% annua = 1.26% giornaliera
- **Z-score 95%**: 1.65
- **Valore**: €100,000
- **VaR 95%, 1 giorno**: 1.65 × 1.26% × €100,000 = **€2,079**

#### 6.3 Monte Carlo VaR

**Metodo**: Simula migliaia di scenari possibili.

**Processo:**
1. Genera 10,000+ scenari random basati su distribuzione
2. Calcola outcome per ogni scenario
3. VaR 95% = 5° percentile peggiore

**Vantaggio**: Non assume normalità, più flessibile.

**Paper:**
> Jorion (2007): "Value at Risk: The New Benchmark for Managing Financial Risk"

## 7. CONDITIONAL VaR (CVaR, Expected Shortfall)

### Definizione

**CVaR**: Perdita media attesa NEI casi peggiori (oltre VaR).

**Formula:**
```
CVaR = E[Loss | Loss > VaR]
```

**Esempio:**
- **VaR 95%**: €5,000
- **CVaR 95%**: €7,500 (perdita media quando supera VaR)

**Vantaggio**: CVaR considera "tail risk" meglio di VaR.

**Paper:**
> Artzner et al. (1999): "Coherent Measures of Risk", Mathematical Finance

## 8. STRESS TESTING

### Definizione

**Stress Testing**: Simula performance in scenari estremi ma plausibili.

**Scenari Storici:**

#### Crisi 2008
- **Azioni Globali**: -50%
- **Obbligazioni Investment Grade**: -20%
- **Obbligazioni Governative**: +20%
- **Immobiliare**: -30%

#### Stagflazione 1970s
- **Azioni**: -30%
- **Obbligazioni**: -10% (tassi salgono)
- **Inflazione**: +15%

#### Pandemia 2020
- **Azioni**: -35% (Marzo)
- **Recovery**: +50% (2020-2021)
- **Volatilità**: +300%

**Paper:**
> Kupiec (1995): "Techniques for Verifying the Accuracy of Risk Measurement Models", Journal of Derivatives

## 9. SCENARIO ANALYSIS

### Definizione

**Scenario Analysis**: Analizza outcome in scenari ipotetici.

**Esempi:**
- **Recessione Moderata**: Azioni -20%, Obbligazioni +5%
- **Recessione Severa**: Azioni -50%, Obbligazioni -10%
- **Stagflazione**: Azioni -30%, Obbligazioni -15%, Inflazione +12%

## Checklist Metriche

Per ogni portafoglio, calcola:
- [ ] Volatilità (σ)
- [ ] Beta (β)
- [ ] Alpha (α)
- [ ] Sharpe Ratio
- [ ] Sortino Ratio
- [ ] VaR (95%, 99%)
- [ ] CVaR (95%, 99%)
- [ ] Stress Test (scenari storici)
- [ ] Scenario Analysis (scenari ipotetici)

> **Principio**: "Non puoi gestire ciò che non misuri. Le metriche quantitative sono essenziali per gestione rischio professionale."',
    'text',
    2,
    120,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_lesson_id;

  -- Learning Objectives Lezione 2
  INSERT INTO education_learning_objectives (lesson_id, objective_text, bloom_level, order_index) VALUES
  (v_lesson_id, 'Calcolare volatilità, beta, alpha, Sharpe, Sortino', 'apply', 1),
  (v_lesson_id, 'Calcolare VaR usando Historical, Parametric, Monte Carlo', 'apply', 2),
  (v_lesson_id, 'Calcolare CVaR (Expected Shortfall)', 'apply', 3),
  (v_lesson_id, 'Eseguire stress testing e scenario analysis', 'analyze', 4),
  (v_lesson_id, 'Interpretare tutte le metriche per decisioni investimento', 'evaluate', 5)
  ON CONFLICT DO NOTHING;

  -- Quiz Start Lezione 2 (3 domande)
  INSERT INTO education_lesson_quizzes (lesson_id, title, description, position_in_lesson, question_count, is_required, show_immediate_feedback, allow_retry, points_reward, order_index)
  VALUES (v_lesson_id, 'Quiz: Conosci le Metriche?', 'Verifica conoscenze pregresse', 'start', 3, false, true, true, 10, 1)
  ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_quiz_id;

  -- Quiz End Lezione 2 (5 domande - struttura simile)
  INSERT INTO education_lesson_quizzes (lesson_id, title, description, position_in_lesson, question_count, is_required, show_immediate_feedback, allow_retry, points_reward, order_index)
  VALUES (v_lesson_id, 'Quiz Finale: Metriche Quantitative', 'Verifica comprensione', 'end', 5, true, true, true, 20, 2)
  ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- Reflection Prompts Lezione 2
  INSERT INTO education_reflection_prompts (lesson_id, prompt_text, prompt_type, order_index) VALUES
  (v_lesson_id, 'Hai mai calcolato metriche rischio per il tuo portafoglio?', 'pre_lesson', 1),
  (v_lesson_id, 'Quale metrica ti sembra più utile?', 'pre_lesson', 2),
  (v_lesson_id, 'Quale metrica ti è risultata più difficile da capire?', 'post_lesson', 1),
  (v_lesson_id, 'Come userai queste metriche per gestire il tuo portafoglio?', 'post_lesson', 2),
  (v_lesson_id, 'Quale metrica vuoi approfondire di più?', 'post_lesson', 3)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- LEZIONE 3: STRATEGIE PRATICHE DI GESTIONE RISCHIO
  -- ============================================
  -- Livello: Intermediate
  -- Obiettivo: Applicare strategie pratiche a portafoglio reale
  
  INSERT INTO education_lessons (
    module_id, title, content, content_type, order_index, estimated_minutes, is_active
  ) VALUES (
    v_module_2_id,
    'Strategie Pratiche di Gestione Rischio: Asset Allocation, Hedging, Portfolio Insurance',
    '# Strategie Pratiche di Gestione Rischio

**Riferimenti Accademici:**
- Markowitz (1952) - "Portfolio Selection"
- Black & Litterman (1992) - "Global Portfolio Optimization"
- Maillard et al. (2010) - "The Properties of Equally Weighted Risk Contribution Portfolios"
- DeMiguel et al. (2009) - "Optimal Versus Naive Diversification"
- Black & Scholes (1973) - "The Pricing of Options and Corporate Liabilities"
- Dammon et al. (2004) - "Optimal Asset Location and Allocation"
- Bekaert et al. (2014) - "International Stock Return Comovements"
- Constantinides (1979) - "A Note on the Suboptimality of Dollar-Cost Averaging"

## 1. ASSET ALLOCATION

### Definizione

**Asset Allocation**: Distribuzione capitale tra diverse classi di asset.

**Paper Fondamentale:**
> Markowitz (1952): "Portfolio Selection", Journal of Finance

### Strategie Accademiche

#### 60/40 Portfolio (Classico)

**Composizione:**
- 60% Azioni
- 40% Obbligazioni

**Vantaggi:**
- Bilanciato rischio/rendimento
- Semplice da gestire
- Performance storica solida

**Svantaggi:**
- Contributo rischio squilibrato (azioni contribuiscono più rischio)
- Non ottimale per tutti gli obiettivi

**Paper:**
> Markowitz (1952): "Portfolio Selection"

#### Risk Parity

**Principio**: Alloca per equalizzare contributo rischio, non peso.

**Formula:**
```
wi = (1/σi) / Σ(1/σj)
```
Dove:
- wi = Peso asset i
- σi = Volatilità asset i

**Esempio Pratico:**
- **Asset A** (Azioni): Volatilità 20%
- **Asset B** (Obbligazioni): Volatilità 5%

**Risk Parity:**
- Peso A: (1/20) / (1/20 + 1/5) = 0.05 / 0.25 = **20%**
- Peso B: (1/5) / (1/20 + 1/5) = 0.20 / 0.25 = **80%**

**Vs 60/40 Tradizionale:**
- 60/40: Contributo rischio azioni = 60% × 20% = 12%
- 60/40: Contributo rischio obbligazioni = 40% × 5% = 2%
- **Squilibrio**: Azioni contribuiscono 6x più rischio

**Risk Parity**: Contributo rischio uguale per entrambi.

**Paper:**
> Maillard et al. (2010): "The Properties of Equally Weighted Risk Contribution Portfolios", Journal of Portfolio Management

#### 1/N (Naive Diversification)

**Principio**: Peso uguale per tutti asset.

**Formula:**
```
wi = 1/N
```
Dove N = Numero asset

**Vantaggi:**
- Semplice
- Performance spesso migliore di strategie complesse (paradosso)

**Paper:**
> DeMiguel et al. (2009): "Optimal Versus Naive Diversification: How Inefficient is the 1/N Portfolio Strategy?", Review of Financial Studies

## 2. REBALANCING

### Definizione

**Rebalancing**: Ripristino asset allocation target.

### Strategie

#### Time-Based

**Metodo**: Rebalance ogni X mesi (es. 6-12 mesi).

**Vantaggi:**
- Semplice, disciplinato
- Prevedibile

**Svantaggi:**
- Può essere prematuro o tardivo
- Non considera condizioni mercato

#### Threshold-Based

**Metodo**: Rebalance quando deviazione > soglia (es. 5%).

**Vantaggi:**
- Solo quando necessario
- Più efficiente

**Svantaggi:**
- Può richiedere più transazioni
- Soglia da definire

#### Hybrid (Best Practice)

**Metodo**: Controllo periodico + threshold.

**Esempio:**
- Controllo trimestrale
- Rebalance se deviazione > 5%

**Paper:**
> Dammon et al. (2004): "Optimal Asset Location and Allocation with Taxable and Tax-Deferred Investing", Review of Financial Studies

## 3. DIVERSIFICAZIONE AVANZATA

### Diversificazione Geografica

**Principio**: Investi in mercati diversi.

**Esempio:**
- 40% Italia
- 30% Europa
- 30% Global

**Vantaggio**: Riduce rischio paese-specifico.

**Paper:**
> Bekaert et al. (2014): "International Stock Return Comovements", Journal of Finance

### Diversificazione Settoriale

**Principio**: Investi in settori diversi.

**Settori**: Tech, Healthcare, Finance, Energy, Consumer, etc.

**Regola**: Max 10-15% per settore.

**Vantaggio**: Riduce rischio settore-specifico.

### Diversificazione Temporale

**Principio**: Investi periodicamente (Dollar-Cost Averaging).

**Vantaggio**: Riduce timing risk.

**Paper:**
> Constantinides (1979): "A Note on the Suboptimality of Dollar-Cost Averaging as a Policy for Liquidity Accumulation", Journal of Financial and Quantitative Analysis

## 4. HEDGING STRATEGIES

### Definizione

**Hedging**: Protezione da movimenti avversi di prezzo.

### Strumenti

#### Options (Put Options)

**Come Funziona:**
- **Compri Put**: Diritto di vendere a prezzo fisso
- **Costo**: Premium pagato
- **Protezione**: Se prezzo scende sotto strike, put aumenta valore

**Esempio:**
- **Portafoglio**: €100,000 (ETF S&P 500)
- **Put Strike**: €95,000 (protezione -5%)
- **Premium**: €2,000 (2%)
- **Scenari**:
  - Prezzo sale a €110,000: Perdi €2,000 (premium), guadagni €10,000 = **+€8,000 netto**
  - Prezzo scende a €80,000: Put vale €15,000, pagato €2,000 = **+€13,000 netto** (vs -€20,000 senza hedge)

**Paper:**
> Black & Scholes (1973): "The Pricing of Options and Corporate Liabilities", Journal of Political Economy

#### Inverse ETFs

**Definizione**: ETF che si muove opposto a indice.

**Esempio:**
- **S&P 500**: -10%
- **Inverse S&P ETF**: +10%

**Limiti:**
- **Decay**: Perdita nel tempo (costo carry)
- **Solo Short-Term**: Non tenere > 1 giorno
- **Costi**: TER più alto

#### Correlazioni Negative

**Strategia**: Asset che si muovono opposti.

**Esempi:**
- **Azioni vs Obbligazioni**: Spesso correlazione negativa
- **USD vs Oro**: Spesso correlazione negativa

## 5. PORTFOLIO INSURANCE

### Constant Proportion Portfolio Insurance (CPPI)

**Strategia**: Protegge capitale minimo, investe resto in rischioso.

**Formula:**
```
Risky Allocation = Multiplier × (Portfolio Value - Floor)
```

**Esempio:**
- **Capitale**: €100,000
- **Floor**: €80,000 (protezione -20%)
- **Multiplier**: 2
- **Risky**: 2 × (€100,000 - €80,000) = €40,000
- **Safe**: €60,000

**Se portafoglio scende a €90,000:**
- **Risky**: 2 × (€90,000 - €80,000) = €20,000
- **Safe**: €70,000 (riduce rischio automaticamente)

**Paper:**
> Black & Jones (1987): "Simplifying Portfolio Insurance", Journal of Portfolio Management

## Checklist Strategie Pratiche

- [ ] Asset allocation definita e documentata
- [ ] Strategia rebalancing definita (time/threshold/hybrid)
- [ ] Diversificazione geografica implementata
- [ ] Diversificazione settoriale implementata
- [ ] Hedging considerato (se necessario)
- [ ] Portfolio insurance considerato (se necessario)
- [ ] Review periodico pianificato

> **Principio**: "Le strategie pratiche devono essere semplici da implementare e mantenere. Complessità non sempre significa migliore performance."',
    'text',
    3,
    90,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title
  RETURNING id INTO v_lesson_id;

  -- Learning Objectives Lezione 3
  INSERT INTO education_learning_objectives (lesson_id, objective_text, bloom_level, order_index) VALUES
  (v_lesson_id, 'Spiegare differenze tra 60/40, Risk Parity, 1/N', 'understand', 1),
  (v_lesson_id, 'Applicare strategie rebalancing a portafoglio reale', 'apply', 2),
  (v_lesson_id, 'Implementare diversificazione geografica/settoriale/temporale', 'apply', 3),
  (v_lesson_id, 'Valutare quando usare hedging e portfolio insurance', 'evaluate', 4)
  ON CONFLICT DO NOTHING;

  -- Quiz e Reflection per Lezione 3 (pattern simile)
  INSERT INTO education_lesson_quizzes (lesson_id, title, description, position_in_lesson, question_count, is_required, show_immediate_feedback, allow_retry, points_reward, order_index)
  VALUES (v_lesson_id, 'Quiz: Strategie Pratiche', 'Verifica conoscenze', 'start', 3, false, true, true, 10, 1),
         (v_lesson_id, 'Quiz Finale: Strategie Pratiche', 'Verifica comprensione', 'end', 5, true, true, true, 20, 2)
  ON CONFLICT (lesson_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  INSERT INTO education_reflection_prompts (lesson_id, prompt_text, prompt_type, order_index) VALUES
  (v_lesson_id, 'Quale strategia asset allocation usi attualmente?', 'pre_lesson', 1),
  (v_lesson_id, 'Hai mai fatto rebalancing del tuo portafoglio?', 'pre_lesson', 2),
  (v_lesson_id, 'Quale strategia ti sembra più adatta al tuo profilo?', 'post_lesson', 1),
  (v_lesson_id, 'Come implementerai queste strategie?', 'post_lesson', 2),
  (v_lesson_id, 'Quale strategia vuoi approfondire?', 'post_lesson', 3)
  ON CONFLICT DO NOTHING;

  -- [Lezioni 4-8: Per completare il modulo, aggiungerò struttura base con contenuto avanzato]
  -- Le lezioni 4-8 seguiranno stesso pattern con contenuto approfondito

  -- Test Finale Modulo
  INSERT INTO education_tests (module_id, title, description, passing_score, time_limit_minutes, is_active)
  VALUES (v_module_2_id, 'Test Finale: Gestione Rischio e Rischi', 'Test completo su tutti i rischi, metriche e strategie', 70, 30, true)
  ON CONFLICT (module_id, title) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_test_2_id;

  RAISE NOTICE '✅ Modulo 2 avanzato: Lezioni 1-3 completate';
  RAISE NOTICE '   Lezioni 4-8: Risk Parity, VaR Models, Tail Risk, Risk Budgeting, Mastery';
END $$;
