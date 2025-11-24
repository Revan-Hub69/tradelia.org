-- ============================================
-- MODULO 3: VOGLIO RISPARMIARE
-- ============================================
-- Strategie accademiche per accumulo capitale
-- Basato su ricerca comportamentale e finanza personale
-- ============================================

DO $$
DECLARE
  v_module_2_id UUID;
  v_module_3_id UUID;
  v_test_3_id UUID;
  v_q_id UUID;
BEGIN
  -- Ottieni ID modulo 2 (prerequisito)
  SELECT id INTO v_module_2_id FROM education_modules WHERE slug = 'gestione-rischio-rischi';
  
  IF v_module_2_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 2 (Gestione Rischio) deve esistere prima';
  END IF;

  -- ===== MODULO 3: VOGLIO RISPARMIARE =====
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
    'Voglio Risparmiare: Strategie Scientifiche per Accumulo Capitale',
    'Cosa dice la ricerca accademica sul risparmio? Strategie evidence-based per massimizzare l''accumulo di capitale. Basato su behavioral finance e finanza personale.',
    'voglio-risparmiare',
    3,
    'beginner',
    4,
    true,
    true,
    v_module_2_id
  ) ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_module_3_id;

  IF v_module_3_id IS NULL THEN
    SELECT id INTO v_module_3_id FROM education_modules WHERE slug = 'voglio-risparmiare';
  END IF;

  -- ===== LEZIONE 1: La Scienza del Risparmio =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_3_id,
    'La Scienza del Risparmio: Cosa Dice la Ricerca',
    '# La Scienza del Risparmio

**Riferimenti Accademici:**
- Thaler & Benartzi (2004) - "Save More Tomorrow™: Using Behavioral Economics to Increase Employee Saving"
- Choi et al. (2002) - "Defined Contribution Pensions: Plan Rules, Participant Choices, and the Path of Least Resistance"
- Benartzi & Thaler (2007) - "Heuristics and Biases in Retirement Savings Behavior"

## Il Problema del Risparmio

### Statistiche Allarmanti
- **Italia**: Tasso risparmio medio ~8% (ISTAT 2023)
- **USA**: 50% lavoratori non hanno abbastanza per pensione
- **Europa**: Gap pensionistico stimato €2 trilioni

### Perché Non Risparmiamo?

**Barriere Psicologiche (Behavioral Finance):**

1. **Present Bias**
   - Valutiamo presente > futuro
   - "Spenderò domani" diventa sempre "domani"
   - **Paper**: Laibson (1997) - "Golden Eggs and Hyperbolic Discounting"

2. **Loss Aversion**
   - Perdita percepita di consumo oggi > guadagno futuro
   - **Paper**: Kahneman & Tversky (1979) - "Prospect Theory"

3. **Inertia**
   - Status quo bias: difficile iniziare
   - Una volta iniziato, difficile fermarsi
   - **Paper**: Samuelson & Zeckhauser (1988) - "Status Quo Bias in Decision Making"

4. **Overconfidence**
   - Sottostimiamo bisogno futuro
   - "Avrò tempo per risparmiare dopo"
   - **Paper**: Barber & Odean (2001) - "Boys Will Be Boys"

## Strategie Evidence-Based

### 1. SAVE MORE TOMORROW (SMarT)

**Autori**: Thaler & Benartzi (2004)

**Principio**: Impegnati oggi a risparmiare di più domani (quando avrai aumenti salariali).

**Come Funziona:**
1. Impegnati oggi a risparmiare X% del prossimo aumento
2. L''aumento arriva → risparmio aumenta automaticamente
3. Nessuna perdita percepita di consumo attuale

**Risultati Studio:**
- Partecipanti: 315 dipendenti
- Risparmio medio: +3.5% in 4 anni
- Retention: 78% dopo 4 anni (vs 20% programmi tradizionali)

**Perché Funziona:**
- Elimina present bias (impegno futuro)
- Elimina loss aversion (nessuna riduzione consumo attuale)
- Sfrutta inertia (una volta attivo, continua)

**Applicazione Personale:**
- Impegnati a risparmiare 50% di ogni aumento futuro
- Imposta aumento automatico risparmio ogni 6 mesi
- Usa "round-up" apps (arrotonda spese, investi differenza)

**Paper di Riferimento:**
> Thaler & Benartzi (2004): "Save More Tomorrow™: Using Behavioral Economics to Increase Employee Saving", Journal of Political Economy

### 2. AUTOMATIC ENROLLMENT

**Autori**: Madrian & Shea (2001)

**Principio**: Opt-out invece di opt-in aumenta drasticamente partecipazione.

**Risultati Studio:**
- Opt-in: 20% partecipazione
- Opt-out: 90%+ partecipazione
- Differenza: **70 punti percentuali**

**Perché Funziona:**
- Sfrutta inertia (default è partecipare)
- Riduce fatica decisionale
- Elimina procrastinazione

**Applicazione Personale:**
- Setup automatic transfer: stipendio → conto risparmio
- "Pay yourself first": risparmia prima di spendere
- Automatizza tutto: bonifici, investimenti, contributi

**Paper di Riferimento:**
> Madrian & Shea (2001): "The Power of Suggestion: Inertia in 401(k) Participation and Savings Behavior", Quarterly Journal of Economics

### 3. MENTAL ACCOUNTING

**Autori**: Thaler (1985, 1999)

**Principio**: Trattiamo denaro diversamente in base a "conto mentale".

**Esempi:**
- "Conto vacanze": difficile toccare
- "Conto emergenze": sacro
- "Conto spese": facile spendere

**Strategia:**
- Crea "conto mentale" per obiettivi specifici
- Nome conto: "Pensione", "Casa", "Emergenze"
- Separazione fisica: conti diversi per obiettivi diversi

**Paper di Riferimento:**
> Thaler (1999): "Mental Accounting Matters", Journal of Behavioral Decision Making

### 4. COMMITMENT DEVICES

**Autori**: Bryan et al. (2010)

**Principio**: Impegni vincolanti aumentano probabilità successo.

**Esempi:**
- **StickK.com**: Scommetti denaro su obiettivi
- **Locked savings accounts**: Conti bloccati fino a scadenza
- **Social commitment**: Condividi obiettivi pubblicamente

**Risultati Studio:**
- Con commitment device: 78% successo
- Senza: 35% successo

**Applicazione:**
- Conto deposito vincolato
- App con penalità se non rispetti obiettivo
- Condividi obiettivo con amico/famiglia

**Paper di Riferimento:**
> Bryan et al. (2010): "Commitment Devices", Annual Review of Economics

## Regole d''Oro Accademiche

### 1. Regola del 50/30/20 (Warren & Tyagi, 2005)
- **50%**: Necessità (casa, cibo, trasporti)
- **30%**: Desideri (svago, hobby)
- **20%**: Risparmio e investimenti

**Paper**: "All Your Worth: The Ultimate Lifetime Money Plan"

### 2. Regola del 4% (Bengen, 1994)
- In pensione, preleva max 4% annuo del portafoglio
- Implica: bisogno 25x spese annuali al pensionamento
- **Esempio**: Spese €30,000/anno → bisogno €750,000

**Paper**: Bengen (1994): "Determining Withdrawal Rates Using Historical Data"

### 3. Regola del 15% (Vanguard, 2020)
- Risparmia 15% reddito per pensione adeguata
- Include: contributi datore + propri
- Inizia a 25 anni → pensione a 65 con 80% reddito finale

**Paper**: Vanguard Research (2020): "How America Saves"

## Calcolo Obiettivo Risparmio

### Formula Accademica (Merton, 1969)

**Capitale Necessario (CN):**
```
CN = Spese Annuali × (1 / Tasso Prelievo Sicuro)
```

**Esempio:**
- Spese: €30,000/anno
- Tasso sicuro: 4%
- CN = €30,000 × 25 = €750,000

**Risparmio Mensile Necessario:**
```
PMT = CN × [r / ((1+r)^n - 1)]
```

Dove:
- r = Rendimento atteso annuo (es. 6%)
- n = Anni fino a pensione (es. 30)

**Esempio:**
- CN: €750,000
- r: 6% annuo = 0.5% mensile
- n: 30 anni = 360 mesi
- PMT = €750,000 × [0.005 / ((1.005)^360 - 1)] = €750,000 × 0.0012 = **€900/mese**

## Strategie Pratiche

### 1. Dollar-Cost Averaging (DCA)
- Investi importo fisso periodicamente
- Riduce timing risk
- **Paper**: Constantinides (1979)

### 2. Round-Up Investing
- Arrotonda ogni spesa
- Investi differenza automaticamente
- **Esempio**: Spesa €9.50 → investi €0.50

### 3. Windfall Strategy
- Bonifici inaspettati → 50% risparmio, 50% spesa
- Evita "lifestyle inflation"
- **Paper**: Thaler (1990) - "Anomalies: Saving, Fungibility, and Mental Accounts"

### 4. Expense Tracking
- Traccia ogni spesa per 30 giorni
- Identifica "leaks" (spese non necessarie)
- **Risultato tipico**: 10-20% risparmio identificato

## Checklist Risparmio

- [ ] Calcolato obiettivo risparmio (formula Merton)
- [ ] Setup automatic transfer (pay yourself first)
- [ ] Creati "conti mentali" per obiettivi
- [ ] Implementato SMarT (aumenti futuri)
- [ ] Setup DCA per investimenti
- [ ] Tracciamento spese per 30 giorni
- [ ] Emergency fund: 3-6 mesi spese
- [ ] Review mensile progresso

> **Principio Accademico**: "Il risparmio non è questione di disciplina, è questione di sistemi. Automatizza tutto."',
    'text',
    1,
    25,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 2: Dove Mettere i Risparmi =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_3_id,
    'Dove Mettere i Risparmi: Asset Allocation per Accumulo',
    '# Dove Mettere i Risparmi

**Riferimenti Accademici:**
- Merton (1969) - "Lifetime Portfolio Selection under Uncertainty"
- Samuelson (1969) - "Lifetime Portfolio Selection by Dynamic Stochastic Programming"
- Cocco et al. (2005) - "Consumption and Portfolio Choice over the Life Cycle"

## Strategia Life-Cycle (Ciclo di Vita)

### Modello Merton-Samuelson

**Principio**: Asset allocation cambia con età e orizzonte temporale.

**Formula:**
```
Stock Allocation = 100 - Age
```

**Esempio:**
- 25 anni: 75% azioni, 25% obbligazioni
- 40 anni: 60% azioni, 40% obbligazioni
- 60 anni: 40% azioni, 60% obbligazioni

**Paper di Riferimento:**
> Merton (1969): "Lifetime Portfolio Selection under Uncertainty: The Continuous-Time Case", Review of Economics and Statistics

### Modello Target-Date Funds

**Principio**: Asset allocation si adatta automaticamente verso scadenza.

**Esempio Target-Date 2050:**
- 2024 (26 anni prima): 90% azioni
- 2035 (15 anni prima): 70% azioni
- 2045 (5 anni prima): 50% azioni
- 2050 (scadenza): 40% azioni

**Paper di Riferimento:**
> Poterba et al. (2007): "The Decline of Defined Benefit Retirement Plans and Asset Flows"

## Asset Allocation per Obiettivi

### 1. Emergency Fund (Fondo Emergenze)
**Obiettivo**: Liquidità immediata, zero rischio

**Asset:**
- Conto deposito svincolabile
- Conto corrente (minimo necessario)
- **Importo**: 3-6 mesi spese

**Paper di Riferimento:**
> Lusardi & Mitchell (2011): "Financial Literacy and Planning: Implications for Retirement Wellbeing"

### 2. Obiettivi a Breve Termine (< 3 anni)
**Obiettivo**: Preservare capitale

**Asset:**
- 100% Obbligazioni a breve scadenza
- Conti deposito vincolati
- **Rendimento atteso**: 2-3% annuo

**Esempi:**
- Vacanza (1 anno)
- Auto (2 anni)
- Anticipo casa (3 anni)

### 3. Obiettivi a Medio Termine (3-10 anni)
**Obiettivo**: Crescita moderata

**Asset:**
- 40-60% Azioni
- 40-60% Obbligazioni
- **Rendimento atteso**: 4-6% annuo

**Esempi:**
- Casa (5 anni)
- Istruzione figli (7 anni)

### 4. Obiettivi a Lungo Termine (> 10 anni)
**Obiettivo**: Massimizzare crescita

**Asset:**
- 70-90% Azioni
- 10-30% Obbligazioni
- **Rendimento atteso**: 6-8% annuo

**Esempi:**
- Pensione (20+ anni)
- Indipendenza finanziaria (15+ anni)

**Paper di Riferimento:**
> Cocco et al. (2005): "Consumption and Portfolio Choice over the Life Cycle", Review of Financial Studies

## Strategia 3-Bucket

### Bucket 1: Liquidità (0-2 anni)
- Conto deposito
- Obbligazioni a breve
- **Funzione**: Spese immediate, emergenze

### Bucket 2: Stabilità (3-10 anni)
- Obbligazioni a medio-lungo termine
- 20-30% Azioni defensive
- **Funzione**: Obiettivi intermedi

### Bucket 3: Crescita (10+ anni)
- 80-90% Azioni
- ETF globali diversificati
- **Funzione**: Crescita long-term

**Paper di Riferimento:**
> Bengen (1994): "Determining Withdrawal Rates Using Historical Data"

## Dove Investire: Strumenti Specifici

### 1. Conti Deposito
- **Rischio**: Zero (garanzia fino €100k)
- **Rendimento**: 2-4% annuo
- **Liquidità**: Variabile (svincolabile o vincolato)
- **Quando**: Emergency fund, obiettivi < 3 anni

### 2. Obbligazioni Governative (BTP)
- **Rischio**: Basso (default stato raro)
- **Rendimento**: 3-5% annuo
- **Liquidità**: Media (mercato secondario)
- **Quando**: Stabilità, obiettivi 3-10 anni

### 3. ETF Obbligazionari
- **Rischio**: Basso-Medio
- **Rendimento**: 3-5% annuo
- **Liquidità**: Alta (quotati in borsa)
- **Vantaggio**: Diversificazione automatica
- **Quando**: Parte stabile portafoglio

### 4. ETF Azionari Globali
- **Rischio**: Medio-Alto
- **Rendimento**: 6-8% annuo (storico)
- **Liquidità**: Alta
- **Vantaggio**: Diversificazione globale, bassi costi
- **Quando**: Crescita, obiettivi > 10 anni

**Esempi:**
- **VWCE** (Vanguard FTSE All-World): Azioni globali
- **EIMI** (iShares MSCI Emerging Markets): Mercati emergenti
- **SXR8** (iShares Core S&P 500): USA large cap

**Paper di Riferimento:**
> Bogle (2014): "The Little Book of Common Sense Investing"

### 5. PIR (Piani Individuali Risparmio)
- **Vantaggio fiscale**: 30% detrazione fino €5,000/anno
- **Vincolo**: 5 anni minimo
- **Asset**: Solo azioni italiane/UE
- **Quando**: Se hai margine fiscale, obiettivo > 5 anni

## Costi: L''Impatto sul Risparmio

### Regola dell''1% (Bogle, 2014)

**Costi totali annui < 1% del portafoglio.**

**Esempio su 30 anni, €100,000:**
- Rendimento 6% annuo
- **Costi 0.2%**: €574,000 finali
- **Costi 2%**: €324,000 finali
- **Differenza**: €250,000 persi in costi!

**Paper di Riferimento:**
> Bogle (2014): "The Arithmetic of Active Management"

## Strategia Pratica: Laddering

### Bond Laddering
- Acquista obbligazioni con scadenze diverse
- Esempio: 1 anno, 2 anni, 3 anni, 4 anni, 5 anni
- Ogni anno: una scade, reinvesti a 5 anni
- **Vantaggio**: Liquidità periodica + rendimento medio-lungo

### CD Laddering (Conti Deposito)
- Stesso principio con conti deposito
- **Vantaggio**: Liquidità + rendimento migliore

## Checklist Asset Allocation

- [ ] Emergency fund: 3-6 mesi spese (conto deposito)
- [ ] Obiettivi < 3 anni: 100% obbligazioni/conti deposito
- [ ] Obiettivi 3-10 anni: 40-60% azioni, 40-60% obbligazioni
- [ ] Obiettivi > 10 anni: 70-90% azioni, 10-30% obbligazioni
- [ ] Costi totali < 1% annuo
- [ ] Diversificazione geografica (Italia, Europa, Global)
- [ ] Rebalancing strategy definita
- [ ] Review annuale asset allocation

> **Principio**: "L''asset allocation è più importante della selezione titoli. Diversifica, mantieni costi bassi, rebalance."',
    'text',
    2,
    20,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 3: Errori Comuni e Come Evitarli =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_3_id,
    'Errori Comuni nel Risparmio: Cosa Dice la Ricerca',
    '# Errori Comuni nel Risparmio

**Riferimenti Accademici:**
- Barber & Odean (2000) - "Trading is Hazardous to Your Wealth"
- Odean (1999) - "Do Investors Trade Too Much?"
- Benartzi & Thaler (1995) - "Myopic Loss Aversion"

## 1. TRADING TROPPO FREQUENTE

### Il Problema

**Studio**: Barber & Odean (2000)

**Metodologia:**
- 66,465 conti broker USA (1991-1996)
- Confronto: trader attivi vs buy-and-hold

**Risultati:**
- **Trader attivi**: -2.65% annuo vs buy-and-hold
- **Trader più attivi**: -6.5% annuo
- **Causa principale**: Commissioni + timing sbagliato

**Paper di Riferimento:**
> Barber & Odean (2000): "Trading is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors", Journal of Finance

### Perché Accade

1. **Overconfidence**: Sottostimiamo costo trading
2. **Illusion of Control**: Pensiamo di poter battere mercato
3. **Disposition Effect**: Vendiamo vincitori, teniamo perdenti

**Paper di Riferimento:**
> Odean (1998): "Are Investors Reluctant to Realize Their Losses?", Journal of Finance

### Soluzione

- **Buy-and-Hold**: Compra e tieni
- **Rebalancing**: Solo 1-2 volte/anno
- **DCA**: Investi periodicamente, non trade

## 2. TIMING THE MARKET

### Il Problema

**Studio**: Dichev (2007)

**Metodologia:**
- Analisi rendimenti investitori vs rendimenti asset (1926-2002)

**Risultati:**
- **Rendimento asset**: 9.85% annuo
- **Rendimento investitori**: 5.04% annuo
- **Gap**: -4.81% annuo (timing sbagliato)

**Paper di Riferimento:**
> Dichev (2007): "What Are Stock Investors'' Actual Historical Returns? Evidence from Dollar-Weighted Returns", American Economic Review

### Perché Accade

- **FOMO**: Fear of Missing Out → compra in alto
- **Panic Selling**: Vende in basso
- **Market Timing**: Cerca di prevedere movimenti

**Paper di Riferimento:**
> Malkiel (2003): "The Efficient Market Hypothesis and Its Critics", Journal of Economic Perspectives

### Soluzione

- **Dollar-Cost Averaging**: Investi sempre, indipendentemente da prezzo
- **Time in Market > Timing Market**: Resta investito
- **Rebalancing**: Vendi quando sale, compra quando scende (automatico)

## 3. MYOPIC LOSS AVERSION

### Il Problema

**Studio**: Benartzi & Thaler (1995)

**Definizione**: Valutiamo perdite 2x più dei guadagni + guardiamo troppo spesso.

**Esperimento:**
- Portfolio A: 50% probabilità +€200, 50% -€100
- Portfolio B: 50% probabilità +€200, 50% -€100 (stesso)
- **Risultato**: Preferiamo B se guardiamo meno spesso

**Paper di Riferimento:**
> Benartzi & Thaler (1995): "Myopic Loss Aversion and the Equity Premium Puzzle", Quarterly Journal of Economics

### Implicazioni

- **Guardare troppo spesso**: Aumenta ansia, riduce azioni
- **Focus su perdite**: Ignoriamo guadagni long-term
- **Soluzione**: Guarda portafoglio 1-2 volte/anno, non giornalmente

## 4. CHASING PERFORMANCE

### Il Problema

**Studio**: Sirri & Tufano (1998)

**Comportamento:**
- Investitori comprano fondi dopo performance positiva
- Vendono dopo performance negativa
- **Risultato**: Comprano alto, vendono basso

**Paper di Riferimento:**
> Sirri & Tufano (1998): "Costly Search and Mutual Fund Flows", Journal of Finance

### Perché Accade

- **Recency Bias**: Sovrappeso informazioni recenti
- **Halo Effect**: Performance passata ≠ performance futura
- **Media Hype**: Notizie spingono decisioni sbagliate

### Soluzione

- **Ignore Past Performance**: Non comprare fondi "hot"
- **Focus on Costs**: Costi bassi > performance passata
- **Diversificazione**: Non concentrarsi su settori "caldi"

## 5. UNDERDIVERSIFICATION

### Il Problema

**Studio**: Goetzmann & Kumar (2008)

**Metodologia:**
- 60,000 portafogli individuali (1991-1996)

**Risultati:**
- **Media holdings**: 4 titoli
- **Ottimale**: 20+ titoli per diversificazione
- **Costo underdiversification**: -2-4% annuo

**Paper di Riferimento:**
> Goetzmann & Kumar (2008): "Equity Portfolio Diversification", Review of Finance

### Soluzione

- **ETF Diversificati**: 1 ETF = centinaia di titoli
- **Minimo 10-15 titoli**: Se compri singoli titoli
- **Regola 5-10-15**: Max 5% per titolo, 10% per settore, 15% per paese

## 6. IGNORARE COSTI

### Il Problema

**Studio**: French (2008)

**Costi totali investimenti USA:**
- **2006**: $100 miliardi/anno
- **Impatto**: -2% annuo rendimenti

**Paper di Riferimento:**
> French (2008): "The Cost of Active Investing", Journal of Finance

### Costi Nascosti

1. **TER (Total Expense Ratio)**: 0.2% - 2% annuo
2. **Commissioni Trading**: 5-20€ per operazione
3. **Bid-Ask Spread**: 0.1-0.5% per trade
4. **Tax Drag**: Imposte su dividendi/plusvalenze

### Soluzione

- **ETF Low-Cost**: TER < 0.5%
- **Trading Minimale**: 1-2 operazioni/anno
- **Tax-Efficient**: Asset location optimization

## 7. EMOTIONAL DECISIONS

### Il Problema

**Studio**: Lo (2004)

**Emozioni guidano decisioni:**
- Paura → Vende in panico
- Greed → Compra in FOMO
- Stress → Decisioni impulsive

**Paper di Riferimento:**
> Lo (2004): "The Adaptive Markets Hypothesis: Market Efficiency from an Evolutionary Perspective", Journal of Portfolio Management

### Soluzione

- **Rules-Based**: Regole predefinite, no decisioni emotive
- **Automation**: Automatizza tutto possibile
- **Advisor/App**: Terza parte per decisioni difficili

## Checklist Evitare Errori

- [ ] Non trade frequentemente (max 1-2 volte/anno)
- [ ] Non cercare di "timare" il mercato
- [ ] Guarda portafoglio 1-2 volte/anno, non giornalmente
- [ ] Non "chase" performance passata
- [ ] Diversifica (minimo 10-15 titoli o ETF)
- [ ] Mantieni costi < 1% annuo
- [ ] Automatizza decisioni (no emozioni)
- [ ] Focus su long-term, ignora rumore short-term

> **Principio**: "Gli errori più costosi sono comportamentali, non tecnici. Automatizza, diversifica, mantieni costi bassi."',
    'text',
    3,
    20,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== TEST MODULO 3 =====
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
    v_module_3_id,
    'Test: Voglio Risparmiare',
    'Verifica comprensione strategie evidence-based per risparmio',
    70,
    3,
    20,
    'apply',
    true
  ) ON CONFLICT DO NOTHING
  RETURNING id INTO v_test_3_id;

  IF v_test_3_id IS NULL THEN
    SELECT id INTO v_test_3_id FROM education_tests WHERE module_id = v_module_3_id AND title = 'Test: Voglio Risparmiare';
  END IF;

  -- Domanda 1: SMarT
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
    v_test_3_id,
    'Cosa è il programma "Save More Tomorrow" (SMarT) di Thaler & Benartzi?',
    'multiple_choice',
    1,
    1,
    'SMarT è un programma che ti fa impegnare oggi a risparmiare una percentuale dei futuri aumenti salariali, eliminando la perdita percepita di consumo attuale.',
    'remember',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_3_id AND order_index = 1;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Impegnarsi oggi a risparmiare % dei futuri aumenti salariali', true, 1, 'Corretto! Elimina present bias e loss aversion'),
  (v_q_id, 'Risparmiare tutto lo stipendio', false, 2, 'Non realistico'),
  (v_q_id, 'Investire solo in azioni', false, 3, 'Non è il focus di SMarT'),
  (v_q_id, 'Non risparmiare mai', false, 4, 'Opposto di SMarT')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 2: Asset Allocation
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
    v_test_3_id,
    'Secondo il modello life-cycle, un 30enne dovrebbe avere:',
    'multiple_choice',
    2,
    1,
    'Life-cycle: Stock Allocation = 100 - Age. 30 anni = 70% azioni, 30% obbligazioni.',
    'apply',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_3_id AND order_index = 2;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, '70% azioni, 30% obbligazioni', true, 1, 'Corretto! 100 - 30 = 70% azioni'),
  (v_q_id, '30% azioni, 70% obbligazioni', false, 2, 'Troppo conservativo per 30 anni'),
  (v_q_id, '100% azioni', false, 3, 'Troppo aggressivo, manca diversificazione'),
  (v_q_id, '50% azioni, 50% contanti', false, 4, 'Contanti non è strategia long-term')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 3: Trading
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
    v_test_3_id,
    'Secondo Barber & Odean (2000), i trader attivi performano:',
    'multiple_choice',
    3,
    1,
    'Barber & Odean hanno dimostrato che i trader attivi underperformano buy-and-hold di 2-6% annuo a causa di commissioni e timing sbagliato.',
    'understand',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_3_id AND order_index = 3;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Peggio di buy-and-hold (circa -2-6% annuo)', true, 1, 'Corretto! Trading frequente è costoso'),
  (v_q_id, 'Meglio di buy-and-hold', false, 2, 'Non supportato da ricerca'),
  (v_q_id, 'Uguale a buy-and-hold', false, 3, 'I costi riducono performance'),
  (v_q_id, 'Non misurabile', false, 4, 'È misurabile e dimostrato')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 4: Costi
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
    v_test_3_id,
    'Quale costo annuo totale è considerato accettabile secondo la "Regola dell''1%" di Bogle?',
    'multiple_choice',
    4,
    1,
    'Bogle dimostra che costi > 1% erodono significativamente i rendimenti nel tempo.',
    'apply',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_3_id AND order_index = 4;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, '< 1% annuo', true, 1, 'Corretto! Massimo 1% annuo'),
  (v_q_id, '< 5% annuo', false, 2, 'Troppo alto'),
  (v_q_id, '< 10% annuo', false, 3, 'Eccessivo'),
  (v_q_id, 'Non importa', false, 4, 'I costi sono cruciali')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 5: Myopic Loss Aversion
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
    v_test_3_id,
    'Secondo Benartzi & Thaler (1995), guardare il portafoglio troppo spesso:',
    'multiple_choice',
    5,
    1,
    'Myopic loss aversion: guardare troppo spesso aumenta ansia e riduce propensione a investire in asset rischiosi, riducendo rendimenti long-term.',
    'understand',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_3_id AND order_index = 5;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Aumenta ansia e riduce propensione a investire', true, 1, 'Corretto! Myopic loss aversion'),
  (v_q_id, 'Migliora le decisioni', false, 2, 'Non supportato da ricerca'),
  (v_q_id, 'Non ha impatto', false, 3, 'Ha impatto significativo'),
  (v_q_id, 'Riduce solo commissioni', false, 4, 'Non è il problema principale')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  RAISE NOTICE '✅ Modulo 3 creato: Voglio Risparmiare';
  RAISE NOTICE '📚 Lezioni: 3 (Scienza Risparmio, Asset Allocation, Errori Comuni)';
  RAISE NOTICE '📝 Test: 1 (5 domande)';
END $$;
