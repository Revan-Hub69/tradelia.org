-- ============================================
-- MODULO 5: VOGLIO SPECULARE
-- ============================================
-- Trading e speculazione: cosa dice la ricerca accademica
-- Basato su paper che dimostrano limiti e opportunità
-- ============================================

DO $$
DECLARE
  v_module_2_id UUID;
  v_module_5_id UUID;
  v_test_5_id UUID;
  v_q_id UUID;
BEGIN
  -- Ottieni ID modulo 2 (prerequisito)
  SELECT id INTO v_module_2_id FROM education_modules WHERE slug = 'gestione-rischio-rischi';
  
  IF v_module_2_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 2 (Gestione Rischio) deve esistere prima';
  END IF;

  -- ===== MODULO 5: VOGLIO SPECULARE =====
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
    'Voglio Speculare: Trading e Speculazione - Cosa Dice la Ricerca',
    'Analisi critica della speculazione basata su ricerca accademica. Perché la maggior parte dei trader perde, cosa funziona (e cosa no), strategie evidence-based. Basato su Barber & Odean, Frazzini & Pedersen, Jegadeesh & Titman.',
    'voglio-speculare',
    5,
    'advanced',
    6,
    true,
    true,
    v_module_2_id
  ) ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_module_5_id;

  IF v_module_5_id IS NULL THEN
    SELECT id INTO v_module_5_id FROM education_modules WHERE slug = 'voglio-speculare';
  END IF;

  -- ===== LEZIONE 1: La Realtà del Trading =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_5_id,
    'La Realtà del Trading: Cosa Dice la Ricerca',
    '# La Realtà del Trading

**Riferimenti Accademici:**
- Barber & Odean (2000) - "Trading is Hazardous to Your Wealth"
- Odean (1999) - "Do Investors Trade Too Much?"
- Barber et al. (2009) - "Just How Much Do Individual Investors Lose by Trading?"

## Il Problema: La Maggior Parte dei Trader Perde

### Studio Seminale: Barber & Odean (2000)

**Metodologia:**
- **Campione**: 66,465 conti broker USA (1991-1996)
- **Confronto**: Trader attivi vs buy-and-hold passivo
- **Metrica**: Rendimenti netti (dopo commissioni)

**Risultati Scioccanti:**

1. **Trader Attivi vs Buy-and-Hold:**
   - **Trader attivi**: -2.65% annuo vs buy-and-hold
   - **Trader più attivi (top 20%)**: -6.5% annuo
   - **Gap**: 2.65-6.5% annuo perso in trading

2. **Causa Principale:**
   - **Commissioni**: 1.44% annuo
   - **Timing sbagliato**: -1.21% annuo
   - **Totale**: -2.65% annuo

3. **Per Gender:**
   - **Uomini**: Trade 45% più spesso → performano peggio
   - **Donne**: Trade meno → performano meglio
   - **Gap**: Uomini -2.65%, Donne -1.72%

**Paper di Riferimento:**
> Barber & Odean (2000): "Trading is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors", Journal of Finance

### Studio Successivo: Barber et al. (2009)

**Metodologia:**
- **Campione**: 66,465 conti Taiwan (1995-1999)
- **Mercato**: Diverso da USA, conferma risultati

**Risultati:**
- **Trader attivi**: -3.8% annuo vs buy-and-hold
- **Causa**: Commissioni + timing sbagliato
- **Conferma**: Risultati universali, non specifici USA

**Paper di Riferimento:**
> Barber et al. (2009): "Just How Much Do Individual Investors Lose by Trading?", Review of Financial Studies

## Perché i Trader Perdono?

### 1. OVERCONFIDENCE

**Studio**: Odean (1998)

**Comportamento:**
- Trader sottostimano costo trading
- Sovrastimano abilità di timing
- Ignorano evidenza che timing è difficile

**Paper di Riferimento:**
> Odean (1998): "Volume, Volatility, Price, and Profit When All Traders Are Above Average", Journal of Finance

### 2. DISPOSITION EFFECT

**Studio**: Odean (1998)

**Comportamento:**
- **Vendono vincitori troppo presto**: Realizzano guadagni rapidamente
- **Tengono perdenti troppo a lungo**: Sperano di recuperare
- **Risultato**: Lock-in perdite, perdono guadagni

**Paper di Riferimento:**
> Odean (1998): "Are Investors Reluctant to Realize Their Losses?", Journal of Finance

### 3. HERDING

**Studio**: Hong et al. (2004)

**Comportamento:**
- Seguono comportamento massa
- Comprano quando tutti comprano (alto)
- Vendono quando tutti vendono (basso)

**Paper di Riferimento:**
> Hong et al. (2004): "Social Interaction and Stock-Market Participation", Journal of Finance

### 4. ATTENTION-BASED TRADING

**Studio**: Barber & Odean (2008)

**Comportamento:**
- Comprano titoli "in notizia"
- Headlines guidano decisioni
- **Risultato**: Comprano alto, vendono basso

**Paper di Riferimento:**
> Barber & Odean (2008): "All That Glitters: The Effect of Attention and News on the Buying Behavior of Individual and Institutional Investors", Review of Financial Studies

## Efficient Market Hypothesis (EMH)

### Fama (1970)

**Definizione**: I prezzi riflettono tutta l''informazione disponibile.

**Tre Forme:**

1. **Weak Form**: Prezzi riflettono informazioni storiche
   - **Implicazione**: Analisi tecnica non funziona
   - **Paper**: Fama (1970) - "Efficient Capital Markets: A Review of Theory and Empirical Work"

2. **Semi-Strong Form**: Prezzi riflettono informazioni pubbliche
   - **Implicazione**: Analisi fondamentale pubblica non funziona
   - **Paper**: Fama (1970)

3. **Strong Form**: Prezzi riflettono tutte le informazioni (pubbliche + private)
   - **Implicazione**: Anche insider trading non funziona
   - **Paper**: Fama (1970)

### Implicazioni per Trading

**Se EMH è vera:**
- **Timing Market**: Impossibile
- **Stock Picking**: Impossibile (senza informazione privilegiata)
- **Trading Attivo**: Perde denaro (commissioni + timing sbagliato)

**Paper di Riferimento:**
> Fama (1970): "Efficient Capital Markets: A Review of Theory and Empirical Work", Journal of Finance

## Anomalies: Eccezioni all''EMH?

### 1. MOMENTUM EFFECT

**Studio**: Jegadeesh & Titman (1993)

**Definizione**: Titoli che performano bene continuano a performare bene (6-12 mesi).

**Risultati:**
- **Strategia**: Compra winners, vendi losers
- **Rendimento**: +1% mensile (dopo costi)
- **Persistenza**: 6-12 mesi

**Paper di Riferimento:**
> Jegadeesh & Titman (1993): "Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency", Journal of Finance

**Limiti:**
- **Costi Trading**: Riduce rendimenti
- **Volatilità**: Alta
- **Drawdown**: Può essere significativo

### 2. VALUE EFFECT

**Studio**: Fama & French (1992)

**Definizione**: Value stocks (alto book-to-market) outperform growth stocks.

**Risultati:**
- **HML Factor**: +4% annuo (storico)
- **Persistenza**: Long-term (decenni)

**Paper di Riferimento:**
> Fama & French (1992): "The Cross-Section of Expected Stock Returns", Journal of Finance

**Limiti:**
- **Periodi di Underperformance**: Value può underperformare per anni
- **Patience Required**: Strategia long-term

### 3. SIZE EFFECT

**Studio**: Banz (1981)

**Definizione**: Small cap stocks outperform large cap stocks.

**Risultati:**
- **SMB Factor**: +2-3% annuo (storico)
- **Persistenza**: Varia nel tempo

**Paper di Riferimento:**
> Banz (1981): "The Relationship Between Return and Market Value of Common Stocks", Journal of Financial Economics

**Limiti:**
- **Diminuito**: Size effect è diminuito dopo scoperta
- **Costi**: Trading small cap è più costoso

### 4. REVERSAL EFFECT

**Studio**: DeBondt & Thaler (1985)

**Definizione**: Titoli che performano male (3-5 anni) tendono a recuperare.

**Risultati:**
- **Strategia**: Compra losers, vendi winners
- **Rendimento**: +8% annuo (dopo costi, long-term)

**Paper di Riferimento:**
> DeBondt & Thaler (1985): "Does the Stock Market Overreact?", Journal of Finance

**Limiti:**
- **Orizzonte Lungo**: 3-5 anni
- **Volatilità**: Alta durante holding period

## Betting Against Beta (Frazzini & Pedersen, 2014)

### Il Problema

**Anomalia**: Low-beta stocks outperform high-beta stocks (contrario a CAPM).

### Strategia BAB

**Definizione**: Long low-beta, short high-beta (market neutral).

**Risultati:**
- **Rendimento**: +8% annuo (dopo costi)
- **Sharpe Ratio**: 0.78
- **Persistenza**: 40+ anni dati

**Paper di Riferimento:**
> Frazzini & Pedersen (2014): "Betting Against Beta", Journal of Financial Economics

**Perché Funziona:**
- **Leverage Constraints**: Investitori non possono usare leverage → overpay per high-beta
- **Low-beta**: Sottovalutato, offre rendimento migliore

## Limitazioni e Rischi

### 1. COSTI TRADING

**Impatto:**
- **Commissioni**: 0.1-0.5% per trade
- **Spread**: 0.1-0.5% per trade
- **Tax**: Imposte su plusvalenze
- **Totale**: 0.5-2% per round-trip

**Strategie attive**: Richiedono molti trade → costi elevati

### 2. TRANSACTION COSTS KILL ALPHA

**Studio**: Lesmond et al. (2004)

**Risultato**: Dopo costi, molte strategie non sono profittevoli.

**Paper di Riferimento:**
> Lesmond et al. (2004): "The Illusory Nature of Momentum Profits", Journal of Financial Economics

### 3. DATA MINING BIAS

**Problema**: Strategie che funzionano su dati storici possono non funzionare futuro.

**Soluzione:**
- **Out-of-Sample Testing**: Testa su dati non usati per sviluppo
- **Multiple Markets**: Verifica su mercati diversi
- **Economic Rationale**: Strategia deve avere logica economica

**Paper di Riferimento:**
> Lo & MacKinlay (1990): "Data-Snooping Biases in Tests of Financial Asset Pricing Models", Review of Financial Studies

### 4. CAPACITY CONSTRAINTS

**Problema**: Strategie funzionano su piccoli capitali, falliscono su grandi.

**Esempio:**
- Momentum: Funziona con $1M, fallisce con $1B
- **Causa**: Impatto sul mercato quando entri/esci

## Strategie Evidence-Based (Se Vuoi Speculare)

### 1. MOMENTUM (Jegadeesh & Titman)

**Come:**
- Compra top 10% performers ultimi 6-12 mesi
- Vendi dopo 6-12 mesi
- **Rendimento atteso**: +5-8% annuo (dopo costi)

**Rischi:**
- Alta volatilità
- Drawdown significativi
- Costi trading elevati

### 2. VALUE (Fama & French)

**Come:**
- Compra stocks con alto book-to-market
- Hold long-term (3-5+ anni)
- **Rendimento atteso**: +2-4% annuo vs market

**Rischi:**
- Periodi underperformance
- Richiede pazienza

### 3. LOW-VOLATILITY (Betting Against Beta)

**Come:**
- Compra stocks con bassa volatilità (low-beta)
- Evita stocks ad alta volatilità
- **Rendimento atteso**: +3-5% annuo vs market

**Rischi:**
- Underperformance in bull markets estremi

### 4. FACTOR INVESTING (Multi-Factor)

**Come:**
- Combina multiple factors (value, momentum, quality, low-vol)
- ETF factor-based (es. iShares Factor ETFs)
- **Rendimento atteso**: +2-4% annuo vs market

**Rischi:**
- Complessità
- Costi leggermente più alti

## Cosa NON Funziona (Evidence)

### 1. DAY TRADING

**Studio**: Barber et al. (2014)

**Risultati:**
- **80% day traders perdono** in 1 anno
- **Solo 1% profittevole** long-term
- **Causa**: Commissioni + spread + timing sbagliato

**Paper di Riferimento:**
> Barber et al. (2014): "The Cross-Section of Speculator Skill: Evidence from Day Trading", Journal of Financial Markets

### 2. TECHNICAL ANALYSIS

**Studio**: Malkiel (2003)

**Risultati:**
- **Patterns tecnici**: Non predittivi dopo costi
- **Chart patterns**: Funzionano solo in-sample, non out-of-sample
- **Causa**: Data mining, overfitting

**Paper di Riferimento:**
> Malkiel (2003): "The Efficient Market Hypothesis and Its Critics", Journal of Economic Perspectives

### 3. STOCK PICKING (Individual Stocks)

**Studio**: French (2008)

**Risultati:**
- **Active managers**: 80%+ underperformano benchmark
- **Persistenza**: Performance passata ≠ performance futura
- **Causa**: Costi + difficoltà timing

**Paper di Riferimento:**
> French (2008): "The Cost of Active Investing", Journal of Finance

## Best Practice (Se Vuoi Speculare)

### 1. Limita % Portafoglio
- **Max 5-10%** portafoglio totale per speculazione
- **90-95%** in strategie passive/diversificate

### 2. Usa Strategie Evidence-Based
- Momentum, Value, Low-Vol (se proprio devi)
- **Evita**: Day trading, technical analysis pura

### 3. Minimizza Costi
- **ETF Factor-Based**: Costi bassi (TER < 0.5%)
- **Evita**: Trading frequente, stock picking individuale

### 4. Gestisci Rischio
- **Position Sizing**: Max 2-5% per posizione speculativa
- **Stop Loss**: Definiti in anticipo
- **Diversifica**: Anche nella speculazione

### 5. Monitora Performance
- **Track**: Rendimenti vs benchmark
- **Review**: Se underperformi > 2 anni → considera stop
- **Be Honest**: Se perdi, ammetti e cambia strategia

## Conclusione Accademica

**La Ricerca Dimostra:**
1. **Maggior parte trader perde**: -2-6% annuo vs buy-and-hold
2. **Causa principale**: Costi + timing sbagliato
3. **Strategie attive**: Solo alcune funzionano (momentum, value, low-vol)
4. **Costi**: Erodono significativamente rendimenti
5. **Best Practice**: Limita speculazione a 5-10% portafoglio

**Paper di Riferimento Finale:**
> Malkiel (2011): "A Random Walk Down Wall Street" (11th Edition)

> **Principio**: "Se vuoi speculare, fallo con occhi aperti. La ricerca mostra che è difficile. Limita l''esposizione, usa strategie evidence-based, minimizza costi."',
    'text',
    1,
    30,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 2: Strategie Evidence-Based =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_5_id,
    'Strategie Evidence-Based: Momentum, Value, Low-Vol',
    '# Strategie Evidence-Based per Speculazione

**Riferimenti Accademici:**
- Jegadeesh & Titman (1993) - Momentum
- Fama & French (1992) - Value
- Frazzini & Pedersen (2014) - Betting Against Beta

## 1. MOMENTUM STRATEGY

### Teoria (Jegadeesh & Titman, 1993)

**Definizione**: Titoli che performano bene continuano a performare bene.

**Meccanismo:**
1. **Formation Period**: Identifica winners/losers (6-12 mesi)
2. **Holding Period**: Tieni winners, vendi losers (6-12 mesi)
3. **Rebalance**: Ripeti mensilmente/trimestralmente

**Risultati Studio:**
- **Rendimento**: +1% mensile (12% annuo, prima costi)
- **Dopo costi**: +5-8% annuo
- **Sharpe Ratio**: 0.5-0.7
- **Persistenza**: 6-12 mesi

**Paper di Riferimento:**
> Jegadeesh & Titman (1993): "Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency", Journal of Finance

### Perché Funziona?

**Teorie:**
1. **Underreaction**: Mercato sottoreagisce a notizie → continuazione trend
2. **Behavioral**: Investitori lenti ad aggiornare aspettative
3. **Risk**: Premium per rischio momentum

**Paper di Riferimento:**
> Daniel et al. (1998): "Investor Psychology and Security Market Under- and Overreactions", Journal of Finance

### Implementazione Pratica

**Opzione 1: ETF Momentum**
- **Esempio**: iShares MSCI USA Momentum Factor ETF
- **TER**: ~0.15%
- **Vantaggio**: Diversificazione automatica, costi bassi

**Opzione 2: Stock Picking**
- **Screening**: Top 10% performers 6-12 mesi
- **Rebalance**: Mensile/trimestrale
- **Rischi**: Concentrazione, costi elevati

### Limiti e Rischi

1. **Crashes**: Momentum crolla in crisi (2008: -50%)
2. **Reversals**: Dopo 12 mesi, momentum si inverte
3. **Costi**: Trading frequente → costi elevati
4. **Volatilità**: Alta volatilità

## 2. VALUE STRATEGY

### Teoria (Fama & French, 1992)

**Definizione**: Titoli con alto book-to-market (value) outperform growth.

**Metriche Value:**
- **P/B** (Price-to-Book): Basso = value
- **P/E** (Price-to-Earnings): Basso = value
- **P/S** (Price-to-Sales): Basso = value
- **EV/EBITDA**: Basso = value

**Risultati Studio:**
- **HML Factor**: +4% annuo (storico USA)
- **Persistenza**: Decenni
- **Sharpe Ratio**: 0.3-0.5

**Paper di Riferimento:**
> Fama & French (1992): "The Cross-Section of Expected Stock Returns", Journal of Finance

### Perché Funziona?

**Teorie:**
1. **Risk Premium**: Value stocks sono più rischiosi → premio
2. **Behavioral**: Investitori overreact a notizie negative → value sottovalutato
3. **Mean Reversion**: Value stocks tendono a recuperare

**Paper di Riferimento:**
> Lakonishok et al. (1994): "Contrarian Investment, Extrapolation, and Risk", Journal of Finance

### Implementazione Pratica

**Opzione 1: ETF Value**
- **Esempio**: iShares MSCI USA Value Factor ETF
- **TER**: ~0.15%
- **Vantaggio**: Diversificazione, costi bassi

**Opzione 2: Stock Screening**
- **Screening**: P/B < 1, P/E < 15, P/S < 1
- **Hold**: Long-term (3-5+ anni)
- **Rischi**: Value traps (stocks che rimangono cheap)

### Limiti e Rischi

1. **Value Traps**: Stocks che rimangono cheap per anni
2. **Underperformance**: Value può underperformare per 5-10 anni
3. **Patience**: Richiede pazienza long-term
4. **Cyclical**: Value performa meglio in recovery

## 3. LOW-VOLATILITY STRATEGY

### Teoria (Frazzini & Pedersen, 2014)

**Definizione**: Stocks con bassa volatilità (low-beta) outperform high-beta.

**Anomalia**: Contrario a CAPM (che predice: più rischio = più rendimento).

**Risultati Studio:**
- **BAB Factor**: +8% annuo (dopo costi)
- **Sharpe Ratio**: 0.78
- **Persistenza**: 40+ anni

**Paper di Riferimento:**
> Frazzini & Pedersen (2014): "Betting Against Beta", Journal of Financial Economics

### Perché Funziona?

**Teoria:**
- **Leverage Constraints**: Investitori non possono usare leverage
- **Overpay for Beta**: Pagano troppo per high-beta (per ottenere rendimento)
- **Low-Beta**: Sottovalutato, offre rendimento migliore risk-adjusted

### Implementazione Pratica

**Opzione 1: ETF Low-Vol**
- **Esempio**: iShares MSCI USA Minimum Volatility ETF
- **TER**: ~0.15%
- **Vantaggio**: Bassa volatilità, rendimento buono

**Opzione 2: Stock Screening**
- **Screening**: Beta < 0.8, Volatility < 15%
- **Hold**: Long-term
- **Rischi**: Underperformance in bull markets estremi

### Limiti e Rischi

1. **Bull Markets**: Low-vol underperforma in mercati rialzisti estremi
2. **Concentration**: Può concentrarsi su settori specifici
3. **Liquidity**: Alcuni low-vol stocks hanno bassa liquidità

## 4. QUALITY FACTOR

### Teoria (Asness et al., 2013)

**Definizione**: Stocks con alta qualità (profittabilità, stabilità, crescita) outperform.

**Metriche Quality:**
- **ROE** (Return on Equity): Alto
- **ROA** (Return on Assets): Alto
- **Debt/Equity**: Basso
- **Earnings Stability**: Alta

**Risultati Studio:**
- **Quality Factor**: +2-3% annuo vs market
- **Sharpe Ratio**: 0.4-0.6

**Paper di Riferimento:**
> Asness et al. (2013): "Quality Minus Junk", Review of Accounting Studies

### Implementazione

**ETF Quality:**
- **Esempio**: iShares MSCI USA Quality Factor ETF
- **TER**: ~0.15%

## 5. MULTI-FACTOR STRATEGY

### Principio

**Combina**: Value + Momentum + Quality + Low-Vol

**Vantaggi:**
- Diversificazione tra factors
- Riduce rischio specifico factor
- Rendimento più stabile

**Paper di Riferimento:**
> Fama & French (2015): "A Five-Factor Asset Pricing Model"

### Implementazione

**ETF Multi-Factor:**
- **Esempio**: iShares Edge MSCI Multifactor USA ETF
- **TER**: ~0.20%
- **Vantaggio**: Diversificazione factors automatica

## Confronto Strategie

| Strategia | Rendimento Atteso | Sharpe | Volatilità | Costi | Complessità |
|-----------|-------------------|--------|------------|-------|-------------|
| Momentum | +5-8% annuo | 0.5-0.7 | Alta | Medio-Alto | Media |
| Value | +2-4% vs market | 0.3-0.5 | Media | Basso | Bassa |
| Low-Vol | +3-5% vs market | 0.6-0.8 | Bassa | Basso | Bassa |
| Quality | +2-3% vs market | 0.4-0.6 | Media | Basso | Media |
| Multi-Factor | +3-5% vs market | 0.5-0.7 | Media | Basso | Media |

## Best Practice

1. **Limita Esposizione**: Max 5-10% portafoglio
2. **Usa ETF**: Diversificazione + costi bassi
3. **Long-Term**: Factors funzionano long-term, non short-term
4. **Diversifica Factors**: Non solo uno, combina
5. **Monitora**: Review annuale, stop se underperformi > 2 anni

> **Principio**: "Se speculi, usa strategie evidence-based. Ma ricorda: la ricerca mostra che è difficile battere il mercato. Limita l''esposizione."',
    'text',
    2,
    25,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== TEST MODULO 5 =====
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
    v_module_5_id,
    'Test: Voglio Speculare',
    'Verifica comprensione realtà trading e strategie evidence-based',
    75,
    3,
    25,
    'evaluate',
    true
  ) ON CONFLICT DO NOTHING
  RETURNING id INTO v_test_5_id;

  IF v_test_5_id IS NULL THEN
    SELECT id INTO v_test_5_id FROM education_tests WHERE module_id = v_module_5_id AND title = 'Test: Voglio Speculare';
  END IF;

  -- Domanda 1: Barber & Odean
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
    v_test_5_id,
    'Secondo Barber & Odean (2000), i trader attivi performano rispetto a buy-and-hold:',
    'multiple_choice',
    1,
    1,
    'Barber & Odean dimostrano che i trader attivi underperformano buy-and-hold di 2.65-6.5% annuo a causa di commissioni e timing sbagliato.',
    'understand',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_5_id AND order_index = 1;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Peggio di 2.65-6.5% annuo', true, 1, 'Corretto! Trading attivo è costoso'),
  (v_q_id, 'Meglio di 2-3% annuo', false, 2, 'Non supportato da ricerca'),
  (v_q_id, 'Uguale a buy-and-hold', false, 3, 'I costi riducono performance'),
  (v_q_id, 'Non misurabile', false, 4, 'È misurabile e dimostrato')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 2: Momentum
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
    v_test_5_id,
    'Secondo Jegadeesh & Titman (1993), l''effetto momentum persiste per:',
    'multiple_choice',
    2,
    1,
    'L''effetto momentum persiste per 6-12 mesi. Dopo 12 mesi, tende a invertirsi (reversal effect).',
    'remember',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_5_id AND order_index = 2;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, '6-12 mesi', true, 1, 'Corretto! Momentum persiste 6-12 mesi'),
  (v_q_id, '1-2 settimane', false, 2, 'Troppo breve'),
  (v_q_id, '3-5 anni', false, 3, 'Troppo lungo, dopo 12 mesi si inverte'),
  (v_q_id, 'Sempre', false, 4, 'Non persiste indefinitamente')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 3: Efficient Market
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
    v_test_5_id,
    'Secondo l''Efficient Market Hypothesis (Fama, 1970), l''analisi tecnica:',
    'multiple_choice',
    3,
    1,
    'EMH weak form afferma che prezzi riflettono informazioni storiche, quindi analisi tecnica (basata su storia) non dovrebbe funzionare.',
    'analyze',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_5_id AND order_index = 3;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Non dovrebbe funzionare (prezzi riflettono storia)', true, 1, 'Corretto! EMH weak form'),
  (v_q_id, 'Funziona sempre', false, 2, 'Non supportato da EMH'),
  (v_q_id, 'Funziona solo su crypto', false, 3, 'EMH si applica a tutti i mercati'),
  (v_q_id, 'Funziona solo di notte', false, 4, 'Non ha senso')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 4: Betting Against Beta
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
    v_test_5_id,
    'Secondo Frazzini & Pedersen (2014), perché low-beta stocks outperformano high-beta?',
    'multiple_choice',
    4,
    1,
    'Frazzini & Pedersen dimostrano che investitori con leverage constraints overpay per high-beta stocks, rendendo low-beta sottovalutato.',
    'analyze',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_5_id AND order_index = 4;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Investitori overpay per high-beta (leverage constraints)', true, 1, 'Corretto! Questo è il meccanismo'),
  (v_q_id, 'Low-beta è più rischioso', false, 2, 'È il contrario'),
  (v_q_id, 'High-beta ha sempre rendimento negativo', false, 3, 'Non sempre negativo'),
  (v_q_id, 'Non c''è differenza', false, 4, 'C''è differenza significativa')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 5: Best Practice
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
    v_test_5_id,
    'Quale percentuale massima del portafoglio dovresti allocare a speculazione secondo best practice?',
    'multiple_choice',
    5,
    1,
    'Best practice accademica suggerisce di limitare speculazione a 5-10% del portafoglio totale, mantenendo 90-95% in strategie passive/diversificate.',
    'evaluate',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_5_id AND order_index = 5;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, '5-10% (resto in strategie passive)', true, 1, 'Corretto! Limita rischio speculazione'),
  (v_q_id, '50%', false, 2, 'Troppo alto, rischio eccessivo'),
  (v_q_id, '100%', false, 3, 'Rischio massimo, non raccomandato'),
  (v_q_id, '0% (mai speculare)', false, 4, 'Se vuoi speculare, fallo con limiti')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  RAISE NOTICE '✅ Modulo 5 creato: Voglio Speculare';
  RAISE NOTICE '📚 Lezioni: 2 (Realtà Trading, Strategie Evidence-Based)';
  RAISE NOTICE '📝 Test: 1 (5 domande)';
END $$;
