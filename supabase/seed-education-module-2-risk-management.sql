-- ============================================
-- MODULO 2: GESTIONE RISCHIO E RISCHI
-- ============================================
-- Analisi maniacale e accademica di tutti i rischi negli investimenti
-- Basato su paper accademici 2015-2025
-- ============================================

DO $$
DECLARE
  v_module_1_id UUID;
  v_module_2_id UUID;
  v_test_2_id UUID;
  v_q_id UUID;
BEGIN
  -- Ottieni ID modulo 1 (prerequisito)
  SELECT id INTO v_module_1_id FROM education_modules WHERE slug = 'fondamenti-investimento';
  
  IF v_module_1_id IS NULL THEN
    RAISE EXCEPTION 'Modulo 1 (Fondamenti) deve esistere prima';
  END IF;

  -- ===== MODULO 2: GESTIONE RISCHIO E RISCHI =====
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
    'Gestione Rischio e Rischi: Analisi Completa',
    'Analisi approfondita e scientifica di tutti i rischi negli investimenti. Basato su ricerca accademica 2015-2025. Essenziale prima di qualsiasi strategia.',
    'gestione-rischio-rischi',
    2,
    'intermediate',
    5,
    true,
    true,
    v_module_1_id
  ) ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
  RETURNING id INTO v_module_2_id;

  IF v_module_2_id IS NULL THEN
    SELECT id INTO v_module_2_id FROM education_modules WHERE slug = 'gestione-rischio-rischi';
  END IF;

  -- ===== LEZIONE 1: Tassonomia Completa dei Rischi =====
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
    'Tassonomia Completa dei Rischi: Classificazione Scientifica',
    '# Tassonomia Completa dei Rischi

**Riferimenti Accademici:**
- Markowitz (1952) - Modern Portfolio Theory
- Sharpe (1964) - Capital Asset Pricing Model (CAPM)
- Fama & French (1993) - Three-Factor Model
- Jorion (2007) - Value at Risk (VaR)

## Classificazione dei Rischi

### 1. RISCHIO SISTEMATICO (Non Diversificabile)

#### 1.1 Rischio di Mercato (Market Risk)
**Definizione**: Fluttuazioni dei prezzi dovute a movimenti generali del mercato.

**Componenti:**
- **Equity Risk**: Variazioni dei prezzi azionari
- **Interest Rate Risk**: Variazioni dei tassi di interesse
- **Currency Risk**: Variazioni dei tassi di cambio
- **Commodity Risk**: Variazioni dei prezzi delle materie prime

**Misurazione Accademica:**
- **Beta (β)**: Misura la sensibilità rispetto al mercato
  - β = 1: Movimento uguale al mercato
  - β > 1: Più volatile del mercato
  - β < 1: Meno volatile del mercato
- **Formula**: β = Cov(ri, rm) / Var(rm)

**Paper di Riferimento:**
> Sharpe (1964): "Capital Asset Prices: A Theory of Market Equilibrium"

#### 1.2 Rischio di Inflazione (Inflation Risk)
**Definizione**: Perdita di potere d''acquisto nel tempo.

**Impatto:**
- Inflazione 2% annua = -50% potere d''acquisto in 35 anni
- Investimenti devono superare inflazione + premio rischio

**Misurazione:**
- **Real Return** = Nominal Return - Inflation Rate
- **TIPS** (Treasury Inflation-Protected Securities) come hedge

**Paper di Riferimento:**
> Fama & Schwert (1977): "Asset Returns and Inflation"

#### 1.3 Rischio di Liquidità di Mercato
**Definizione**: Impossibilità di vendere rapidamente senza impatto sul prezzo.

**Misurazione:**
- **Bid-Ask Spread**: Differenza tra prezzo acquisto/vendita
- **Volume**: Volume medio giornaliero
- **Amihud Illiquidity Ratio**: |Return| / Volume

**Paper di Riferimento:**
> Amihud (2002): "Illiquidity and Stock Returns"

### 2. RISCHIO IDIOSINCRATICO (Diversificabile)

#### 2.1 Rischio Specifico dell''Asset
**Definizione**: Rischio legato a caratteristiche specifiche dell''investimento.

**Componenti:**
- **Business Risk**: Rischio operativo dell''azienda
- **Financial Risk**: Rischio di default/insolvenza
- **Regulatory Risk**: Cambiamenti normativi
- **Technology Risk**: Obsolescenza tecnologica

**Eliminazione:**
- Diversificazione riduce rischio specifico
- **Formula**: σ²(portfolio) = Σ(wi²σi²) + ΣΣ(wiwjσij)
- Con N asset: rischio specifico → 0 per N → ∞

**Paper di Riferimento:**
> Markowitz (1952): "Portfolio Selection"

#### 2.2 Rischio di Concentrazione
**Definizione**: Eccessiva esposizione a singolo asset/settore/area.

**Misurazione:**
- **Herfindahl-Hirschman Index (HHI)**: Σ(wi²)
  - HHI < 0.15: Ben diversificato
  - HHI > 0.25: Concentrato
- **Effective Number of Holdings**: 1 / HHI

**Paper di Riferimento:**
> Bekaert et al. (2014): "International Stock Return Comovements"

### 3. RISCHI OPERATIVI

#### 3.1 Rischio di Controparte (Counterparty Risk)
**Definizione**: Rischio che la controparte non adempia agli obblighi.

**Misurazione:**
- **Credit Default Swap (CDS) Spread**: Premio per rischio default
- **Credit Rating**: S&P, Moody''s, Fitch
- **Probability of Default (PD)**: Probabilità default 1 anno

**Paper di Riferimento:**
> Merton (1974): "On the Pricing of Corporate Debt"

#### 3.2 Rischio Operativo (Operational Risk)
**Definizione**: Perdite dovute a errori umani, sistemi, processi.

**Categorie (Basel II):**
- Internal Fraud
- External Fraud
- Employment Practices
- Clients, Products & Business Practices
- Damage to Physical Assets
- Business Disruption
- Execution, Delivery & Process Management

**Misurazione:**
- **Value at Risk (VaR) Operativo**
- **Loss Distribution Approach (LDA)**

**Paper di Riferimento:**
> Basel Committee on Banking Supervision (2006): "International Convergence of Capital Measurement"

### 4. RISCHI STRUTTURALI

#### 4.1 Rischio di Durata (Duration Risk)
**Definizione**: Sensibilità obbligazioni a variazioni tassi interesse.

**Misurazione:**
- **Modified Duration**: % variazione prezzo per 1% variazione yield
- **Convexity**: Correzione per grandi variazioni
- **Formula**: ΔP/P ≈ -D × Δy + 0.5 × C × (Δy)²

**Paper di Riferimento:**
> Macaulay (1938): "Some Theoretical Problems Suggested by the Movements of Interest Rates"

#### 4.2 Rischio di Reinvestimento
**Definizione**: Incertezza sul tasso a cui reinvestire flussi futuri.

**Impatto:**
- Obbligazioni con cedole: rischio reinvestimento cedole
- Strategie: Laddering, Zero-Coupon Bonds

**Paper di Riferimento:**
> Fama (1984): "The Information in the Term Structure"

### 5. RISCHI COMPORTAMENTALI

#### 5.1 Rischio di Bias Cognitivi
**Definizione**: Errori sistematici nel processo decisionale.

**Bias Principali:**
- **Overconfidence**: Sottostima rischio, sovrastima abilità
- **Loss Aversion**: Paura perdite > gioia guadagni (Kahneman & Tversky)
- **Anchoring**: Fissazione su informazioni iniziali
- **Confirmation Bias**: Cerca informazioni che confermano convinzioni
- **Herding**: Seguire comportamento massa

**Misurazione:**
- **Behavioral Finance Questionnaires**
- **Trading Records Analysis**

**Paper di Riferimento:**
> Kahneman & Tversky (1979): "Prospect Theory: An Analysis of Decision under Risk"
> Barber & Odean (2000): "Trading is Hazardous to Your Wealth"

#### 5.2 Rischio Emotivo
**Definizione**: Decisioni guidate da emozioni invece che analisi.

**Fattori:**
- Stress finanziario
- Paura e Greed
- Panic Selling / FOMO Buying

**Mitigazione:**
- Regole predefinite (rules-based investing)
- Rebalancing automatico
- Dollar-Cost Averaging (DCA)

**Paper di Riferimento:**
> Lo (2004): "The Adaptive Markets Hypothesis"

### 6. RISCHI REGOLATORI E FISCALI

#### 6.1 Rischio Normativo
**Definizione**: Cambiamenti normativi che impattano investimenti.

**Esempi:**
- MiFID II: Regolamentazione servizi investimento
- Tobin Tax: Tassa su transazioni finanziarie
- Regolamentazione settoriale

**Paper di Riferimento:**
> ESMA (2018): "Guidelines on MiFID II product governance requirements"

#### 6.2 Rischio Fiscale
**Definizione**: Variazioni trattamento fiscale investimenti.

**Componenti:**
- Capital Gains Tax
- Dividend Tax
- Wealth Tax
- Inheritance Tax

**Mitigazione:**
- Tax-Loss Harvesting
- Asset Location Optimization
- Tax-Efficient Funds

**Paper di Riferimento:**
> Dammon et al. (2004): "Optimal Asset Location and Allocation"

### 7. RISCHI ESTREMI (Tail Risks)

#### 7.1 Rischio di Coda (Tail Risk)
**Definizione**: Eventi rari ma estremi (Black Swans).

**Misurazione:**
- **Value at Risk (VaR)**: Perdita massima attesa a livello confidenza
  - VaR(95%) = perdita massima nel 95% dei casi
- **Conditional VaR (CVaR)**: Perdita media oltre VaR
- **Expected Shortfall**: E[Loss | Loss > VaR]

**Paper di Riferimento:**
> Artzner et al. (1999): "Coherent Measures of Risk"
> Taleb (2007): "The Black Swan"

#### 7.2 Rischio di Evento (Event Risk)
**Definizione**: Eventi specifici che impattano valore.

**Esempi:**
- Default aziendale
- Catastrofi naturali
- Crisi geopolitiche
- Pandemie

**Misurazione:**
- **Stress Testing**: Scenario analysis
- **Monte Carlo Simulation**: Simulazione distribuzioni

**Paper di Riferimento:**
> Jorion (2007): "Value at Risk: The New Benchmark for Managing Financial Risk"

## Matrice Rischio-Rendimento Completa

| Tipo Rischio | Diversificabile | Misurabile | Mitigabile | Impatto |
|--------------|-----------------|------------|------------|---------|
| Market Risk | ❌ | ✅ (Beta) | Parziale (Hedging) | Alto |
| Inflation Risk | ❌ | ✅ (CPI) | ✅ (TIPS) | Medio |
| Liquidity Risk | Parziale | ✅ (Spread) | ✅ (Asset Selection) | Medio |
| Specific Risk | ✅ | ✅ (Volatility) | ✅ (Diversification) | Alto |
| Counterparty Risk | ✅ | ✅ (CDS) | ✅ (Selection) | Medio |
| Operational Risk | Parziale | ✅ (VaR) | ✅ (Controls) | Basso |
| Behavioral Risk | ❌ | ✅ (Questionnaires) | ✅ (Rules) | Alto |
| Regulatory Risk | ❌ | ⚠️ | Parziale | Medio |
| Tail Risk | ❌ | ✅ (VaR/CVaR) | Parziale (Options) | Estremo |

## Best Practice Accademica

1. **Identificare tutti i rischi** prima di investire
2. **Misurare** ogni rischio con metriche appropriate
3. **Diversificare** rischi idiosincratici
4. **Hedging** per rischi sistematici (se necessario)
5. **Monitorare** continuamente esposizione rischio
6. **Stress Test** regolari per tail risks

> **Principio Fondamentale**: Non puoi eliminare il rischio, ma puoi comprenderlo, misurarlo e gestirlo.',
    'text',
    1,
    30,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 2: Metriche Quantitative di Rischio =====
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
    'Metriche Quantitative: Volatility, VaR, Sharpe, Sortino',
    '# Metriche Quantitative di Rischio

**Riferimenti Accademici:**
- Markowitz (1952) - Mean-Variance Optimization
- Sharpe (1966) - Sharpe Ratio
- Sortino & Price (1994) - Sortino Ratio
- Jorion (2007) - Value at Risk

## 1. VOLATILITÀ (Standard Deviation)

### Definizione
Misura della variabilità dei rendimenti attorno alla media.

**Formula:**
```
σ = √[Σ(ri - r̄)² / (n-1)]
```

Dove:
- σ = Volatilità (standard deviation)
- ri = Rendimento periodo i
- r̄ = Rendimento medio
- n = Numero osservazioni

### Interpretazione
- **σ = 10%**: Rendimenti tipicamente tra -10% e +10% dalla media
- **σ = 20%**: Rendimenti più variabili, maggiore incertezza

### Volatilità Annualizzata
```
σ_annual = σ_monthly × √12
σ_annual = σ_daily × √252
```

**Paper di Riferimento:**
> Markowitz (1952): "Portfolio Selection"

## 2. VALUE AT RISK (VaR)

### Definizione
Perdita massima attesa a un livello di confidenza in un orizzonte temporale.

**Formula Parametrica (Variance-Covariance):**
```
VaR(α) = -μ + z_α × σ × √T
```

Dove:
- μ = Rendimento atteso
- z_α = Quantile distribuzione normale (es. 1.65 per 95%)
- σ = Volatilità
- T = Orizzonte temporale

**Esempio:**
- Portafoglio: €100,000
- Volatilità: 15% annua
- VaR(95%, 1 giorno) = -0 + 1.65 × 0.15 × √(1/252) = -1.56%
- Perdita massima attesa: €1,560

### Metodi VaR

#### 1. Parametrico (Variance-Covariance)
- Assunzione: Rendimenti distribuiti normalmente
- Vantaggio: Veloce, semplice
- Svantaggio: Non cattura tail risks

#### 2. Storico (Historical Simulation)
- Usa distribuzione storica reale
- Vantaggio: Cattura non-normalità
- Svantaggio: Assume passato = futuro

#### 3. Monte Carlo
- Simula migliaia di scenari
- Vantaggio: Flessibile, cattura complessità
- Svantaggio: Computazionalmente intensivo

**Paper di Riferimento:**
> Jorion (2007): "Value at Risk: The New Benchmark"

## 3. CONDITIONAL VaR (CVaR) / EXPECTED SHORTFALL

### Definizione
Perdita media attesa quando si supera il VaR.

**Formula:**
```
CVaR(α) = E[Loss | Loss > VaR(α)]
```

**Vantaggio su VaR:**
- Cattura severità eventi estremi
- Coerente (sub-additivo)
- Migliore per tail risk

**Paper di Riferimento:**
> Artzner et al. (1999): "Coherent Measures of Risk"

## 4. SHARPE RATIO

### Definizione
Rendimento in eccesso per unità di rischio.

**Formula:**
```
Sharpe = (Rp - Rf) / σp
```

Dove:
- Rp = Rendimento portafoglio
- Rf = Risk-free rate (es. BTP)
- σp = Volatilità portafoglio

### Interpretazione
- **Sharpe > 1**: Buono
- **Sharpe > 2**: Eccellente
- **Sharpe < 0.5**: Scarso

**Esempio:**
- Portafoglio: 8% rendimento annuo
- Risk-free: 2%
- Volatilità: 12%
- Sharpe = (8% - 2%) / 12% = 0.5

**Limiti:**
- Assume normalità distribuzione
- Penalizza volatilità positiva (rendimenti alti)

**Paper di Riferimento:**
> Sharpe (1966): "Mutual Fund Performance"

## 5. SORTINO RATIO

### Definizione
Sharpe Ratio modificato: considera solo downside volatility.

**Formula:**
```
Sortino = (Rp - Rf) / σ_downside
```

Dove:
- σ_downside = Deviazione standard rendimenti negativi

**Vantaggio:**
- Non penalizza volatilità positiva
- Focus su rischio di perdita

**Paper di Riferimento:**
> Sortino & Price (1994): "Performance Measurement in a Downside Risk Framework"

## 6. MAXIMUM DRAWDOWN (MDD)

### Definizione
Perdita massima da picco a minimo.

**Formula:**
```
MDD = (Peak - Trough) / Peak
```

**Esempio:**
- Picco: €100,000
- Minimo: €70,000
- MDD = (100,000 - 70,000) / 100,000 = 30%

**Interpretazione:**
- MDD < 10%: Basso drawdown
- MDD 10-20%: Moderato
- MDD > 20%: Alto

**Paper di Riferimento:**
> Chekhlov et al. (2005): "Drawdown Measure in Portfolio Optimization"

## 7. BETA (β)

### Definizione
Sensibilità rendimento asset rispetto al mercato.

**Formula:**
```
β = Cov(ri, rm) / Var(rm)
```

Dove:
- ri = Rendimento asset
- rm = Rendimento mercato (benchmark)

### Interpretazione
- **β = 1**: Movimento uguale al mercato
- **β > 1**: Più volatile (es. β = 1.5: +50% movimento)
- **β < 1**: Meno volatile (es. β = 0.7: +70% movimento)
- **β < 0**: Movimento opposto (rare)

**Paper di Riferimento:**
> Sharpe (1964): "Capital Asset Prices"

## 8. ALPHA (α)

### Definizione
Rendimento in eccesso rispetto a quello atteso dal CAPM.

**Formula:**
```
α = Rp - [Rf + β × (Rm - Rf)]
```

**Interpretazione:**
- **α > 0**: Outperformance (skill)
- **α = 0**: Performance attesa
- **α < 0**: Underperformance

**Paper di Riferimento:**
> Jensen (1968): "The Performance of Mutual Funds"

## 9. INFORMATION RATIO

### Definizione
Alpha per unità di tracking error.

**Formula:**
```
IR = α / Tracking Error
```

Dove:
- Tracking Error = σ(Rp - Rm)

**Interpretazione:**
- **IR > 0.5**: Buono
- **IR > 1**: Eccellente

**Paper di Riferimento:**
> Grinold & Kahn (1999): "Active Portfolio Management"

## 10. CALMAR RATIO

### Definizione
Rendimento annuo / Maximum Drawdown.

**Formula:**
```
Calmar = Annual Return / MDD
```

**Interpretazione:**
- **Calmar > 1**: Buono
- **Calmar > 3**: Eccellente

## Confronto Metriche

| Metrica | Focus | Limiti | Quando Usare |
|---------|-------|--------|--------------|
| Volatility | Variabilità generale | Non distingue up/down | Analisi base rischio |
| VaR | Perdita massima attesa | Non cattura tail | Risk management |
| CVaR | Severità eventi estremi | Complesso calcolo | Tail risk analysis |
| Sharpe | Risk-adjusted return | Assume normalità | Confronto portafogli |
| Sortino | Downside risk | Meno comune | Focus su perdite |
| MDD | Perdita massima storica | Retrospettivo | Analisi drawdown |
| Beta | Sensibilità mercato | Dipende benchmark | Asset allocation |
| Alpha | Skill vs luck | Dipende modello | Performance attribution |

## Best Practice

1. **Usa multiple metriche**: Nessuna metrica è perfetta
2. **Considera orizzonte temporale**: Metriche variano con timeframe
3. **Confronta con benchmark**: Metriche assolute vs relative
4. **Monitora nel tempo**: Metriche cambiano con condizioni mercato
5. **Comprendi limiti**: Ogni metrica ha assunzioni

> **Principio**: "Non esiste una metrica perfetta. Usa quelle appropriate per il tuo obiettivo."',
    'text',
    2,
    35,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== LEZIONE 3: Gestione Pratica del Rischio =====
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
    'Strategie Pratiche di Gestione Rischio',
    '# Strategie Pratiche di Gestione Rischio

**Riferimenti Accademici:**
- Black & Litterman (1992) - Black-Litterman Model
- Maillard et al. (2010) - Risk Parity
- DeMiguel et al. (2009) - 1/N Portfolio

## 1. ASSET ALLOCATION

### Definizione
Distribuzione capitale tra diverse classi di asset.

**Strategie Accademiche:**

#### 60/40 Portfolio (Classico)
- 60% Azioni
- 40% Obbligazioni
- **Vantaggio**: Bilanciato rischio/rendimento
- **Paper**: Markowitz (1952)

#### Risk Parity
- Alloca per equalizzare contributo rischio
- Non per peso, ma per rischio
- **Formula**: wi = 1/σi / Σ(1/σj)
- **Paper**: Maillard et al. (2010) - "The Properties of Equally Weighted Risk Contribution Portfolios"

#### 1/N (Naive Diversification)
- Peso uguale per tutti asset
- **Formula**: wi = 1/N
- **Paper**: DeMiguel et al. (2009) - "Optimal Versus Naive Diversification"

**Paper di Riferimento:**
> Black & Litterman (1992): "Global Portfolio Optimization"

## 2. REBALANCING

### Definizione
Ripristino asset allocation target.

**Strategie:**

#### Time-Based
- Rebalance ogni X mesi (es. 6-12 mesi)
- **Vantaggio**: Semplice, disciplinato
- **Svantaggio**: Può essere prematuro o tardivo

#### Threshold-Based
- Rebalance quando deviazione > soglia (es. 5%)
- **Vantaggio**: Solo quando necessario
- **Svantaggio**: Può richiedere più transazioni

#### Hybrid
- Controllo periodico + threshold
- **Best Practice**: Controllo trimestrale, rebalance se > 5%

**Paper di Riferimento:**
> Dammon et al. (2004): "Optimal Asset Location and Allocation with Taxable and Tax-Deferred Investing"

## 3. DIVERSIFICAZIONE AVANZATA

### Diversificazione Geografica
- **Correlazione mercati**: Non perfettamente correlati
- **Vantaggio**: Riduce rischio paese-specifico
- **Esempio**: 40% Italia, 30% Europa, 30% Global

**Paper di Riferimento:**
> Bekaert et al. (2014): "International Stock Return Comovements"

### Diversificazione Settoriale
- **Settori**: Tech, Healthcare, Finance, Energy, Consumer, ecc.
- **Vantaggio**: Riduce rischio settore-specifico
- **Regola**: Max 10-15% per settore

### Diversificazione Temporale
- **Dollar-Cost Averaging (DCA)**: Investi periodicamente
- **Vantaggio**: Riduce timing risk
- **Paper**: Constantinides (1979) - "A Note on the Suboptimality of Dollar-Cost Averaging"

## 4. HEDGING STRATEGIES

### Definizione
Protezione da movimenti avversi.

**Strumenti:**

#### Options
- **Put Options**: Protezione da cali
- **Cost**: Premium pagato
- **Esempio**: Put su portafoglio azionario

#### Inverse ETFs
- Movimento opposto a indice
- **Vantaggio**: Accesso facile
- **Svantaggio**: Decay nel tempo

#### Correlazioni Negative
- Asset che si muovono opposti
- **Esempio**: Azioni vs Obbligazioni (spesso)

**Paper di Riferimento:**
> Black & Scholes (1973): "The Pricing of Options and Corporate Liabilities"

## 5. POSITION SIZING

### Definizione
Dimensione posizione in base a rischio.

**Metodi:**

#### Fixed Fractional
- Investi % fisso capitale per trade
- **Esempio**: 2% per posizione

#### Kelly Criterion
- **Formula**: f* = (p × b - q) / b
  - f* = Frazione capitale
  - p = Probabilità vincita
  - b = Odds (guadagno/perdita)
  - q = 1 - p
- **Vantaggio**: Massimizza crescita long-term
- **Svantaggio**: Molto aggressivo, alto drawdown

**Paper di Riferimento:**
> Kelly (1956): "A New Interpretation of Information Rate"

#### Risk Parity Position Sizing
- Dimensione basata su volatilità
- **Formula**: Position Size = Risk Budget / Volatility
- **Vantaggio**: Equalizza rischio tra posizioni

## 6. STOP LOSS E TAKE PROFIT

### Stop Loss
- Vendita automatica se prezzo scende sotto soglia
- **Tipi**:
  - **Fixed**: Soglia fissa (es. -10%)
  - **Trailing**: Segue prezzo verso alto
  - **Volatility-based**: Basato su ATR (Average True Range)

**Paper di Riferimento:**
> Kaminski & Lo (2014): "When Do Stop-Loss Rules Stop Losses?"

### Take Profit
- Vendita automatica se prezzo sale sopra soglia
- **Strategia**: Parziale (es. 50% a +20%, resto a +40%)

## 7. STRESS TESTING

### Definizione
Simulazione scenari estremi.

**Scenari:**
- **Crisi 2008**: -50% azioni, +20% obbligazioni
- **Stagflazione**: -30% azioni, -10% obbligazioni, +15% inflazione
- **Pandemia**: -35% azioni, volatilità +200%

**Paper di Riferimento:**
> Kupiec (1995): "Techniques for Verifying the Accuracy of Risk Measurement Models"

## 8. MONITORAGGIO CONTINUO

### Metriche da Monitorare
1. **Exposure per Asset Class**: Rispetto target
2. **Correlazioni**: Cambiano nel tempo
3. **Volatilità**: Aumenta in crisi
4. **Drawdown**: Rispetto tolleranza
5. **VaR**: Rispetto limite

### Dashboard Rischio
- **Daily**: Volatilità, Exposure
- **Weekly**: Correlazioni, Drawdown
- **Monthly**: Rebalance, Stress Test

## Checklist Gestione Rischio

- [ ] Asset allocation definita e documentata
- [ ] Diversificazione geografica/settoriale
- [ ] Rebalancing strategy definita
- [ ] Position sizing rules
- [ ] Stop loss/take profit (se applicabile)
- [ ] Stress test eseguiti
- [ ] Monitoraggio metriche rischio
- [ ] Limiti rischio definiti (es. max 5% per titolo)
- [ ] Emergency plan per crisi
- [ ] Review periodico (trimestrale)

> **Principio**: "La gestione del rischio non è un evento, è un processo continuo."',
    'text',
    3,
    25,
    true
  ) ON CONFLICT (module_id, order_index) DO UPDATE SET title = EXCLUDED.title;

  -- ===== TEST MODULO 2 =====
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
    v_module_2_id,
    'Test: Gestione Rischio e Rischi',
    'Verifica comprensione completa dei rischi e metriche quantitative',
    75,
    3,
    25,
    'analyze',
    true
  ) ON CONFLICT DO NOTHING
  RETURNING id INTO v_test_2_id;

  IF v_test_2_id IS NULL THEN
    SELECT id INTO v_test_2_id FROM education_tests WHERE module_id = v_module_2_id AND title = 'Test: Gestione Rischio e Rischi';
  END IF;

  -- Domanda 1: Beta
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
    v_test_2_id,
    'Un asset con β = 1.5 significa che:',
    'multiple_choice',
    1,
    1,
    'Beta 1.5 significa che l''asset si muove 1.5 volte più del mercato. Se il mercato sale del 10%, l''asset sale del 15%.',
    'understand',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_2_id AND order_index = 1;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Si muove 1.5 volte più del mercato', true, 1, 'Corretto! Beta misura sensibilità al mercato'),
  (v_q_id, 'Ha rischio zero', false, 2, 'Beta non indica rischio zero'),
  (v_q_id, 'Si muove opposto al mercato', false, 3, 'Beta negativo indica movimento opposto'),
  (v_q_id, 'È sempre più redditizio', false, 4, 'Beta non indica redditività')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 2: VaR
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
    v_test_2_id,
    'Un VaR(95%) di €1,000 su portafoglio €100,000 significa:',
    'multiple_choice',
    2,
    1,
    'VaR(95%) indica che nel 95% dei casi la perdita sarà inferiore a €1,000. Nel 5% dei casi peggiori, la perdita può essere maggiore.',
    'apply',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_2_id AND order_index = 2;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Nel 95% dei casi la perdita sarà < €1,000', true, 1, 'Corretto! Questa è la definizione di VaR'),
  (v_q_id, 'La perdita massima è sempre €1,000', false, 2, 'VaR non è perdita massima garantita'),
  (v_q_id, 'La perdita media è €1,000', false, 3, 'VaR è perdita massima attesa, non media'),
  (v_q_id, 'Il portafoglio perderà sempre €1,000', false, 4, 'VaR è probabilità, non certezza')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 3: Sharpe Ratio
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
    v_test_2_id,
    'Un Sharpe Ratio di 0.5 è considerato:',
    'multiple_choice',
    3,
    1,
    'Sharpe Ratio < 0.5 è considerato scarso. Sharpe > 1 è buono, > 2 è eccellente.',
    'evaluate',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_2_id AND order_index = 3;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Scarso (dovrebbe essere > 1)', true, 1, 'Corretto! Sharpe > 1 è considerato buono'),
  (v_q_id, 'Eccellente', false, 2, 'Eccellente richiede Sharpe > 2'),
  (v_q_id, 'Ottimo', false, 3, 'Ottimo richiede Sharpe > 1'),
  (v_q_id, 'Non interpretabile', false, 4, 'Sharpe è sempre interpretabile')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 4: Diversificazione
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
    v_test_2_id,
    'Quale rischio può essere eliminato con la diversificazione?',
    'multiple_choice',
    4,
    1,
    'Il rischio specifico (idiosincratico) può essere eliminato con diversificazione. Il rischio sistematico (di mercato) no.',
    'analyze',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_2_id AND order_index = 4;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Rischio specifico (idiosincratico)', true, 1, 'Corretto! Diversificazione elimina rischio specifico'),
  (v_q_id, 'Rischio di mercato (sistematico)', false, 2, 'Rischio sistematico non è eliminabile'),
  (v_q_id, 'Rischio di inflazione', false, 3, 'Rischio inflazione è sistematico'),
  (v_q_id, 'Tutti i rischi', false, 4, 'Non tutti i rischi sono eliminabili')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  -- Domanda 5: Rebalancing
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
    v_test_2_id,
    'Quale strategia di rebalancing è generalmente considerata migliore?',
    'multiple_choice',
    5,
    1,
    'La strategia hybrid (controllo periodico + threshold) combina vantaggi di entrambe: disciplina e flessibilità.',
    'evaluate',
    true
  ) ON CONFLICT (test_id, order_index) DO UPDATE SET question_text = EXCLUDED.question_text
  RETURNING id INTO v_q_id;

  IF v_q_id IS NULL THEN
    SELECT id INTO v_q_id FROM education_questions WHERE test_id = v_test_2_id AND order_index = 5;
  END IF;

  INSERT INTO education_question_options (question_id, option_text, is_correct, order_index, explanation) VALUES
  (v_q_id, 'Hybrid: controllo periodico + threshold', true, 1, 'Corretto! Combina disciplina e flessibilità'),
  (v_q_id, 'Mai rebalance', false, 2, 'Rebalancing è importante per mantenere asset allocation'),
  (v_q_id, 'Solo time-based', false, 3, 'Può essere prematuro o tardivo'),
  (v_q_id, 'Solo threshold-based', false, 4, 'Può richiedere troppe transazioni')
  ON CONFLICT (question_id, order_index) DO UPDATE SET option_text = EXCLUDED.option_text;

  RAISE NOTICE '✅ Modulo 2 creato: Gestione Rischio e Rischi';
  RAISE NOTICE '📚 Lezioni: 3 (Tassonomia, Metriche, Strategie)';
  RAISE NOTICE '📝 Test: 1 (5 domande)';
END $$;
