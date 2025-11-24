-- ============================================
-- ESPANSIONE MODULO 2: GESTIONE RISCHIO
-- ============================================
-- Aggiunge 2 lezioni approfondite al Modulo 2
-- ============================================

DO $$
DECLARE
  v_module_2_id UUID;
BEGIN
  SELECT id INTO v_module_2_id FROM education_modules WHERE slug = 'gestione-rischio-rischi';
  
  IF v_module_2_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 2 deve esistere. Esegui prima seed-education-module-2-risk-management.sql';
  END IF;

  -- ===== LEZIONE 4: Stress Testing e Scenario Analysis =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_2_id,
    'Stress Testing e Scenario Analysis: Prepararsi al Peggiore',
    '# Stress Testing e Scenario Analysis

**Riferimenti Accademici:**
- Kupiec (1995) - "Techniques for Verifying the Accuracy of Risk Measurement Models"
- Berkowitz (2001) - "Testing Density Forecasts"
- Breuer et al. (2009) - "How to Find Plausible, Severe, and Useful Stress Scenarios"

## Cos''è lo Stress Testing?

**Definizione**: Simulazione performance portafoglio in scenari estremi ma plausibili.

**Obiettivo**: Capire come il portafoglio reagisce a shock di mercato.

**Paper di Riferimento:**
> Kupiec (1995): "Techniques for Verifying the Accuracy of Risk Measurement Models", Journal of Derivatives

## Tipi di Stress Test

### 1. Historical Stress Test

**Metodologia**: Applica movimenti storici reali a portafoglio attuale.

**Scenari Storici:**

#### Crisi 2008 (Lehman Brothers)
- **Azioni Globali**: -50%
- **Obbligazioni Investment Grade**: -20%
- **Obbligazioni Governative**: +20%
- **Immobiliare**: -30%
- **Commodities**: -40%

**Esempio Portafoglio 60/40:**
- **Prima**: €100,000
- **Dopo**: €60,000 × 0.5 + €40,000 × 0.8 = €30,000 + €32,000 = **€62,000**
- **Perdita**: -38%

#### Stagflazione 1970s
- **Azioni**: -30%
- **Obbligazioni**: -10% (tassi salgono)
- **Inflazione**: +15%
- **Oro**: +200%

#### Pandemia 2020
- **Azioni**: -35% (Marzo 2020)
- **Recovery**: +50% (2020-2021)
- **Volatilità**: +300%

### 2. Hypothetical Stress Test

**Metodologia**: Crea scenari ipotetici estremi.

**Esempi:**
- **Crisi Geopolitica**: Azioni -60%, Oro +100%
- **Hyperinflation**: Inflazione +50%, Obbligazioni -80%
- **Deflazione**: Prezzi -10%, Obbligazioni +30%, Azioni -40%

### 3. Sensitivity Analysis

**Metodologia**: Varia un parametro alla volta.

**Esempi:**
- **Tasso interesse +2%**: Impatto su obbligazioni
- **Volatilità +50%**: Impatto su opzioni
- **Correlazione +0.3**: Impatto su diversificazione

**Paper di Riferimento:**
> Breuer et al. (2009): "How to Find Plausible, Severe, and Useful Stress Scenarios", International Journal of Central Banking

## Monte Carlo Simulation

### Definizione

**Simulazione**: Genera migliaia di scenari possibili basati su distribuzioni probabilistiche.

**Processo:**
1. Definisci distribuzioni rendimenti (media, volatilità, correlazioni)
2. Genera 10,000+ scenari random
3. Calcola outcome per ogni scenario
4. Analizza distribuzione risultati

**Output:**
- **Percentili**: 5%, 25%, 50%, 75%, 95%
- **Probabilità perdita > X%**: Es. 10% probabilità perdita > 30%
- **Worst Case**: Scenario peggiore (1%)

**Paper di Riferimento:**
> Jorion (2007): "Value at Risk: The New Benchmark for Managing Financial Risk"

## Scenario Analysis Pratica

### Scenario 1: Recessione Moderata

**Assunzioni:**
- Azioni: -20%
- Obbligazioni: +5%
- Inflazione: +3%

**Portafoglio 60/40:**
- **Perdita**: -10% (€100,000 → €90,000)
- **Tempo Recovery**: 12-18 mesi (storico)

### Scenario 2: Recessione Severa

**Assunzioni:**
- Azioni: -50%
- Obbligazioni: -10%
- Inflazione: +8%

**Portafoglio 60/40:**
- **Perdita**: -34% (€100,000 → €66,000)
- **Tempo Recovery**: 3-5 anni

### Scenario 3: Stagflazione

**Assunzioni:**
- Azioni: -30%
- Obbligazioni: -15% (tassi salgono)
- Inflazione: +12%

**Portafoglio 60/40:**
- **Perdita Reale**: -45% (nominale -33% + inflazione -12%)
- **Tempo Recovery**: 5-7 anni

## Best Practice Stress Testing

1. **Testa Scenari Storici**: Crisi 2008, 2000, 1970s
2. **Crea Scenari Ipotetici**: Cosa succede se...?
3. **Varia Parametri**: Sensibilità a cambiamenti
4. **Monte Carlo**: Distribuzione probabilità
5. **Review Annuale**: Aggiorna scenari con nuove condizioni

## Preparazione a Crisi

### Emergency Plan

**Checklist:**
- [ ] Calcolato perdita massima tollerabile
- [ ] Identificato asset liquidi per emergenze
- [ ] Definito quando ridurre rischio (soglie)
- [ ] Preparato mentalmente a drawdown
- [ ] Diversificato fonti reddito
- [ ] Emergency fund: 6-12 mesi spese

> **Principio**: "Spera per il meglio, preparati per il peggio. Lo stress testing ti prepara psicologicamente e finanziariamente."',
    'text',
    4,
    25,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 5: Risk Management Avanzato =====
  INSERT INTO education_lessons (
    module_id,
    title,
    content,
    content_type,
    order_index,
    estimated_minutes,
    is_active
  ) VALUES (
    v_module_2_id,
    'Risk Management Avanzato: Hedging, Options, Risk Parity',
    '# Risk Management Avanzato

**Riferimenti Accademici:**
- Black & Scholes (1973) - "The Pricing of Options and Corporate Liabilities"
- Maillard et al. (2010) - "The Properties of Equally Weighted Risk Contribution Portfolios"
- Asness et al. (2012) - "Leverage Aversion and Risk Parity"

## Hedging Strategies

### Definizione

**Hedging**: Protezione da movimenti avversi di prezzo.

**Principio**: Accetti costo (premium) per ridurre rischio.

### 1. Options Hedging

#### Put Options (Protezione da Cali)

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

**Paper di Riferimento:**
> Black & Scholes (1973): "The Pricing of Options and Corporate Liabilities", Journal of Political Economy

#### Covered Calls

**Strategia**: Vendi call options su stock che possiedi.

**Come Funziona:**
- Possiedi 100 azioni a €50
- Vendi call strike €55, premium €2
- **Scenari**:
  - Prezzo < €55: Tieni premium €200, tieni stock
  - Prezzo > €55: Stock chiamato via, ma guadagni €500 + €200 = €700

**Vantaggio**: Genera reddito, limita upside

### 2. Inverse ETFs

**Definizione**: ETF che si muove opposto a indice.

**Esempio:**
- **S&P 500**: -10%
- **Inverse S&P ETF**: +10%

**Limiti:**
- **Decay**: Perdita nel tempo (costo carry)
- **Solo Short-Term**: Non tenere > 1 giorno
- **Costi**: TER più alto

### 3. Correlazioni Negative

**Strategia**: Asset che si muovono opposti.

**Esempi:**
- **Azioni vs Obbligazioni**: Spesso correlazione negativa
- **USD vs Oro**: Spesso correlazione negativa
- **Azioni vs VIX**: Correlazione negativa (volatility index)

**Paper di Riferimento:**
> Bekaert et al. (2014): "International Stock Return Comovements"

## Risk Parity

### Teoria (Maillard et al., 2010)

**Definizione**: Alloca capitale per equalizzare contributo rischio, non peso.

**Formula Base:**
```
wi = (1/σi) / Σ(1/σj)
```

Dove:
- wi = Peso asset i
- σi = Volatilità asset i

**Esempio:**
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

**Paper di Riferimento:**
> Maillard et al. (2010): "The Properties of Equally Weighted Risk Contribution Portfolios", Journal of Portfolio Management

### Vantaggi Risk Parity

1. **Diversificazione Reale**: Rischio distribuito equamente
2. **Stabilità**: Meno volatilità portafoglio
3. **Performance**: Sharpe ratio migliore (storico)

### Svantaggi

1. **Leverage Necessario**: Per ottenere rendimento, serve leverage
2. **Complessità**: Più complesso da gestire
3. **Costi**: Leverage ha costi

## Dynamic Hedging

### Definizione

**Strategia**: Aggiusta hedge in base a condizioni mercato.

**Esempio:**
- **Volatilità Bassa**: Hedge minimo (costi bassi)
- **Volatilità Alta**: Hedge massimo (protezione necessaria)

**Metrica**: **VIX** (Volatility Index) come indicatore.

**Paper di Riferimento:**
> Whaley (2000): "The Investor Fear Gauge", Journal of Portfolio Management

## Portfolio Insurance

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

**Paper di Riferimento:**
> Black & Jones (1987): "Simplifying Portfolio Insurance", Journal of Portfolio Management

## Best Practice Avanzato

1. **Hedging Selettivo**: Non hedge tutto, solo quando necessario
2. **Costi vs Benefici**: Hedging ha costi, valuta trade-off
3. **Dynamic**: Aggiusta hedge con condizioni mercato
4. **Diversifica Hedging**: Non solo un metodo
5. **Monitora Correlazioni**: Cambiano nel tempo

> **Principio**: "L''hedging è un''assicurazione. Paghi premium per protezione. Usalo strategicamente, non sempre."',
    'text',
    5,
    30,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- Aggiorna ore stimate
  UPDATE education_modules 
  SET estimated_hours = 6 
  WHERE id = v_module_2_id;

  RAISE NOTICE '✅ Modulo 2 espanso: 5 lezioni (era 3)';
END $$;
