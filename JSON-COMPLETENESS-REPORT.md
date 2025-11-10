# Report Completamento JSON F1B per Chart

## Dati Richiesti dai Chart

I chart F1B richiedono i seguenti dati:

### 1. RegimeScore Gauge
- ✅ `regime_and_risk.RegimeScore.raw` (es: "+0.60")
- ✅ `regime_and_risk.StrategyMode_macro.raw` (es: "Momentum")

### 2. Breadth 1M & RiskTilt
- ✅ `breadth_rotation.Breadth_1M.raw` (es: "0.72")
- ✅ `breadth_rotation.RiskTilt_1M.raw` (es: "Pro-rischio (growth/ciclici > difensivi)")

### 3. Leadership Settoriale
- ✅ `breadth_rotation.Leadership.LeadersMultiTF.items` (array: ["Technology", "Communication Services"])
- ✅ `breadth_rotation.Leadership.Lagging.items` (array: ["Real Estate", "Financial"])

### 4. Volatilità VIX & Yield
- ✅ `regime_and_risk.VolRegime.raw` (es: "VIX ~17 (<20)")
- ⚠️ `internals_raw.Curve_UST.items` (opzionale, es: ["2s10s ≈ +0.52% (T-1)"])
- ⚠️ `internals_raw.Vol_USD.items` (opzionale, es: ["VIX ~17", "USD leggermente debole/neutro"])

### 5. RiskTilt vs VolRegime
- ✅ `breadth_rotation.RiskTilt_1M.raw`
- ✅ `regime_and_risk.VolRegime.raw`

---

## Analisi Report

### ✅ **1. sample-id** (NVDA) - COMPLETO
**Path**: `/report/reports/sample-id/f1b.json`

**Dati presenti**:
- ✅ `regime_and_risk.RegimeScore.raw`: "+0.60"
- ✅ `regime_and_risk.StrategyMode_macro.raw`: "Momentum"
- ✅ `regime_and_risk.VolRegime.raw`: "VIX ~17 (<20), 1W in calo; possibili spike intraday"
- ✅ `breadth_rotation.Breadth_1M.raw`: "0.72"
- ✅ `breadth_rotation.RiskTilt_1M.raw`: "Pro-rischio (growth/ciclici > difensivi)"
- ✅ `breadth_rotation.Leadership.LeadersMultiTF.items`: ["Technology", "Communication Services", "Consumer Cyclical", "Industrials"]
- ✅ `breadth_rotation.Leadership.Lagging.items`: ["Real Estate", "Financial"]
- ✅ `internals_raw.Curve_UST.items`: ["2s10s ≈ +0.52% (T-1)"]
- ✅ `internals_raw.Vol_USD.items`: ["VIX ~17", "USD leggermente debole/neutro"]

**Chart disponibili**: **TUTTI I 5 CHART COMPLETI** ✅

---

### ✅ **2. 20251107-1630** (AAPL) - COMPLETO
**Path**: `/report/reports/20251107-1630/f1b.json`

**Dati presenti**:
- ✅ `regime_and_risk.RegimeScore.raw`: "+0.25"
- ✅ `regime_and_risk.StrategyMode_macro.raw`: "Momentum-light"
- ✅ `regime_and_risk.VolRegime.raw`: "VIX ~18 (<20), 1W stabile; possibili spike intraday"
- ✅ `breadth_rotation.Breadth_1M.raw`: "0.68"
- ✅ `breadth_rotation.RiskTilt_1M.raw`: "Pro-rischio (growth/ciclici > difensivi)"
- ✅ `breadth_rotation.Leadership.LeadersMultiTF.items`: ["Technology", "Communication Services", "Consumer Cyclical", "Industrials"]
- ✅ `breadth_rotation.Leadership.Lagging.items`: ["Real Estate", "Financial"]
- ✅ `internals_raw.Curve_UST.items`: ["2s10s ≈ +0.48% (T-1)"]
- ✅ `internals_raw.Vol_USD.items`: ["VIX ~18", "USD neutro/debole"]

**Chart disponibili**: **TUTTI I 5 CHART COMPLETI** ✅

---

### ⚠️ **3. example-complete** (FLNC) - PARZIALE
**Path**: `/report/reports/example-complete/f1b.json`

**Dati presenti**:
- ✅ `regime_and_risk.RegimeScore.raw`: "+0.60"
- ✅ `regime_and_risk.StrategyMode_macro.raw`: "Momentum"
- ✅ `regime_and_risk.VolRegime.raw`: "VIX ~17 (<20), 1W in calo; possibili spike intraday"
- ✅ `breadth_rotation.Breadth_1M.raw`: "0.65"
- ✅ `breadth_rotation.RiskTilt_1M.raw`: "Growth/Ciclici"
- ❌ `breadth_rotation.Leadership`: **MANCANTE**
- ❌ `internals_raw`: **MANCANTE**

**Chart disponibili**: **3 CHART COMPLETI, 2 PARZIALI** ⚠️
- ✅ RegimeScore Gauge
- ✅ Breadth 1M & RiskTilt
- ⚠️ Leadership Settoriale (mostra messaggio "Dati non disponibili")
- ⚠️ Volatilità VIX & Yield (solo VIX, senza yield)
- ✅ RiskTilt vs VolRegime

---

### ⚠️ **4. example-with-screenshot** (AAPL) - PARZIALE
**Path**: `/report/reports/example-with-screenshot/f1b.json`

**Dati presenti**:
- ✅ `regime_and_risk.RegimeScore.raw`: "+0.65"
- ✅ `regime_and_risk.StrategyMode_macro.raw`: "Momentum"
- ✅ `regime_and_risk.VolRegime.raw`: "VIX ~18 (<20), 1W stabile; possibili spike intraday"
- ✅ `breadth_rotation.Breadth_1M.raw`: "0.68"
- ✅ `breadth_rotation.RiskTilt_1M.raw`: "Growth/Ciclici"
- ❌ `breadth_rotation.Leadership`: **MANCANTE**
- ❌ `internals_raw`: **MANCANTE**

**Chart disponibili**: **3 CHART COMPLETI, 2 PARZIALI** ⚠️
- ✅ RegimeScore Gauge
- ✅ Breadth 1M & RiskTilt
- ⚠️ Leadership Settoriale (mostra messaggio "Dati non disponibili")
- ⚠️ Volatilità VIX & Yield (solo VIX, senza yield)
- ✅ RiskTilt vs VolRegime

---

### ⚠️ **5. example-without-screenshot** (MSFT) - PARZIALE
**Path**: `/report/reports/example-without-screenshot/f1b.json`

**Dati presenti**:
- ✅ `regime_and_risk.RegimeScore.raw`: "+0.45"
- ✅ `regime_and_risk.StrategyMode_macro.raw`: "Momentum-light"
- ✅ `regime_and_risk.VolRegime.raw`: "VIX ~19 (<20), 1W stabile; possibili spike intraday"
- ✅ `breadth_rotation.Breadth_1M.raw`: "0.62"
- ✅ `breadth_rotation.RiskTilt_1M.raw`: "Growth/Ciclici"
- ❌ `breadth_rotation.Leadership`: **MANCANTE**
- ❌ `internals_raw`: **MANCANTE**

**Chart disponibili**: **3 CHART COMPLETI, 2 PARZIALI** ⚠️
- ✅ RegimeScore Gauge
- ✅ Breadth 1M & RiskTilt
- ⚠️ Leadership Settoriale (mostra messaggio "Dati non disponibili")
- ⚠️ Volatilità VIX & Yield (solo VIX, senza yield)
- ✅ RiskTilt vs VolRegime

---

## Riepilogo

### JSON Completi (2):
1. ✅ **sample-id** - Tutti i 5 chart completi
2. ✅ **20251107-1630** - Tutti i 5 chart completi

### JSON Parziali (3):
3. ⚠️ **example-complete** - 3 chart completi, 2 parziali
4. ⚠️ **example-with-screenshot** - 3 chart completi, 2 parziali
5. ⚠️ **example-without-screenshot** - 3 chart completi, 2 parziali

---

## Dati Mancanti nei JSON Parziali

I JSON parziali (`example-*`) mancano di:
1. ❌ `breadth_rotation.Leadership` (oggetto completo con `LeadersMultiTF.items` e `Lagging.items`)
2. ❌ `internals_raw` (oggetto completo con `Curve_UST.items` e `Vol_USD.items`)

Questi dati sono necessari per:
- **Leadership Settoriale** chart (richiede `Leadership`)
- **Volatilità VIX & Yield** chart (richiede `internals_raw` per yield)

---

## Note

- I JSON completi (`sample-id`, `20251107-1630`) hanno tutti i dati necessari per tutti i chart
- I JSON parziali (`example-*`) hanno solo i dati base e funzionano per 3 chart su 5
- I chart gestiscono correttamente i dati mancanti mostrando messaggi informativi o usando solo i dati disponibili

