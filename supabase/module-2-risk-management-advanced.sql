-- ============================================
-- MODULO 2: GESTIONE RISCHIO E RISCHI - VERSIONE AVANZATA
-- ============================================
-- Livello: Beginner → Intermediate → Advanced → Expert
-- Ore: 8-10 ore
-- Lezioni: 8 lezioni progressive
-- Obiettivo Finale: Comprendere TUTTI i rischi reali e gestirli professionalmente
-- ============================================

DO $$
DECLARE
  v_module_1_id UUID;
  v_module_2_id UUID;
  v_lesson_id UUID;
  v_quiz_id UUID;
  v_q_id UUID;
BEGIN
  -- Verifica Modulo 1 esiste
  SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  IF v_module_1_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 1 deve esistere. Esegui prima seed-education-content.sql';
  END IF;

  -- Crea/aggiorna Modulo 2
  INSERT INTO education_modules (
    title,
    slug,
    description,
    difficulty_level,
    estimated_hours,
    order_index,
    is_active,
    prerequisites
  ) VALUES (
    'Gestione Rischio e Rischi: Analisi Completa e Professionale',
    'gestione-rischio-rischi',
    'Comprendi TUTTI i rischi finanziari reali: tassonomia completa, metriche quantitative avanzate (VaR, CVaR, Stress Testing), strategie pratiche (hedging, portfolio insurance), risk management professionale (Risk Parity, Factor Models), e gestione rischi estremi (Tail Risk, Black Swans). Dalla base al livello professionale.',
    'intermediate', -- Livello base, ma progredisce ad advanced/expert
    10,
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

  -- ============================================
  -- LEZIONE 1: TASSONOMIA COMPLETA DEI RISCHI
  -- ============================================
  -- Livello: Intermediate
  -- Obiettivo: Comprendere TUTTI i tipi di rischio finanziario
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
- Fama & French (1993) - "Common Risk Factors in the Returns on Stocks and Bonds"
- Merton (1974) - "On the Pricing of Corporate Debt"
- Kahneman & Tversky (1979) - "Prospect Theory"
- Barber & Odean (2000) - "Trading is Hazardous to Your Wealth"
- Lo (2004) - "The Adaptive Markets Hypothesis"

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

**Misurazione:**
- **Duration**: Sensibilità prezzo a variazione tasso
- **Modified Duration**: Duration aggiustata
- **Convexity**: Misura non-linearità

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

**Tipi:**
- **Transaction Risk**: Rischio su transazioni future
- **Translation Risk**: Rischio su conversioni contabili
- **Economic Risk**: Rischio su competitività

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
- **Agricole**: Volatilità 20-40% annua

## 2. RISCHIO DI CREDITO (Credit Risk)

### 2.1 Default Risk (Rischio Insolvenza)

**Definizione**: Rischio che emittente non paghi debiti.

**Misurazione:**
- **Credit Rating**: AAA (minimo rischio) → D (default)
- **Probability of Default (PD)**: Probabilità default
- **Loss Given Default (LGD)**: Perdita in caso default
- **Expected Loss (EL)**: PD × LGD × Exposure

**Paper:**
> Merton (1974): "On the Pricing of Corporate Debt"

**Esempio Pratico:**
- **Obbligazione Corporate**: Rating BBB
- **PD**: 0.5% annua
- **LGD**: 40%
- **Exposure**: €100,000
- **Expected Loss**: 0.5% × 40% × €100,000 = **€200/anno**

### 2.2 Credit Spread Risk

**Definizione**: Rischio che spread creditizio aumenti.

**Esempio:**
- **Spread iniziale**: 2% (vs risk-free)
- **Spread sale a 4%**: Prezzo obbligazione scende
- **Perdita**: ~20% (dipende da duration)

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

### 3.2 Funding Liquidity Risk

**Definizione**: Impossibilità ottenere finanziamento.

**Esempio:**
- **Margin Call**: Broker richiede più garanzie
- **Impossibile finanziare**: Devo vendere asset a prezzo svantaggioso

## 4. RISCHIO OPERATIVO (Operational Risk)

### 4.1 Definizione

**Rischio**: Perdite da errori interni, sistemi, persone, eventi esterni.

**Categorie:**
- **Internal Fraud**: Frodi interne
- **External Fraud**: Frodi esterne
- **Employment Practices**: Errori gestione personale
- **Clients, Products & Business Practices**: Errori prodotti/servizi
- **Damage to Physical Assets**: Danni fisici
- **Business Disruption**: Interruzioni business
- **Execution, Delivery & Process Management**: Errori processi

**Paper:**
> Basel Committee (2001): "Operational Risk"

## 5. RISCHIO LEGALE/REGOLAMENTARE (Legal/Regulatory Risk)

**Definizione**: Perdite da cambiamenti normativi o contenziosi.

**Esempi:**
- **MiFID II**: Nuove regole investimenti
- **GDPR**: Privacy data
- **Tax Changes**: Cambiamenti fiscali
- **Litigation**: Cause legali

## 6. RISCHIO MODELLO (Model Risk)

**Definizione**: Perdite da errori in modelli matematici.

**Esempi:**
- **VaR Model**: Sottostima rischio
- **Pricing Model**: Errore valutazione derivati
- **Credit Model**: Errore stima default

## 7. RISCHIO COMPORTAMENTALE (Behavioral Risk)

**Definizione**: Perdite da bias cognitivi e errori decisionali.

**Paper:**
> Kahneman & Tversky (1979): "Prospect Theory: An Analysis of Decision under Risk", Econometrica

**Bias Principali:**
- **Loss Aversion**: Paura perdite > piacere guadagni
- **Overconfidence**: Sovrastima abilità
- **Confirmation Bias**: Cerca conferme, ignora contraddizioni
- **Herding**: Segue folla
- **Anchoring**: Si fissa su prima informazione
- **Disposition Effect**: Vende vincitori, tiene perdenti

**Paper:**
> Barber & Odean (2000): "Trading is Hazardous to Your Wealth", Journal of Finance

**Dati:**
- Investitori attivi: Performance -3% vs mercato
- Overconfidence: Trading eccessivo → costi + performance peggiore

## 8. RISCHIO SISTEMICO (Systemic Risk)

**Definizione**: Rischio che fallimento un ente causi collasso sistema.

**Esempi:**
- **Lehman Brothers (2008)**: Fallimento → crisi globale
- **Too Big to Fail**: Enti troppo grandi per fallire

**Paper:**
> Acharya et al. (2017): "Measuring Systemic Risk", Review of Financial Studies

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

**Paper:**
> Longin & Solnik (2001): "Extreme Correlation of International Equity Markets", Journal of Finance

## 11. RISCHIO DI INFLATION (Inflation Risk)

**Definizione**: Inflazione erode potere d''acquisto.

**Esempio:**
- **Inflazione 3% annua**: €100,000 → €74,409 in 10 anni (potere d''acquisto)
- **Conto deposito 2%**: Perdi 1% reale annuo

## 12. RISCHIO DI LONGEVITÀ (Longevity Risk)

**Definizione**: Vivere più a lungo del previsto → esaurire risparmi.

**Esempio:**
- **Pensione a 65**: Previsto vivere fino 85
- **Vivi fino 95**: 10 anni in più → bisogno più capitale

## 13. RISCHIO DI EVENTO (Event Risk)

**Definizione**: Eventi estremi, rari, imprevedibili.

**Tipi:**
- **Black Swans** (Taleb): Eventi estremi, imprevedibili
- **Tail Risk**: Eventi code distribuzione (estremi)
- **Geopolitical Risk**: Guerre, tensioni
- **Pandemic Risk**: Pandemie

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
    35,
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

  -- Domande quiz start (pattern simile a example, ma più avanzate)
  -- [Continua con altre 7 lezioni...]

  RAISE NOTICE '✅ Modulo 2 avanzato creato: Lezione 1 completata';
  RAISE NOTICE '   Prossime lezioni: Metriche Quantitative, Stress Testing, Hedging, Risk Parity, VaR Models, Tail Risk';
END $$;
