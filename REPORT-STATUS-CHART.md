# Status Report per Chart F1B

## Report Completi (Chart Completi) ✅

### 1. **sample-id** (NVDA)
- **Path**: `/report/reports/sample-id/`
- **F1B Status**: ✅ COMPLETO
- **Dati disponibili**:
  - ✅ RegimeScore: "+0.60"
  - ✅ VIX: "VIX ~17 (<20)"
  - ✅ Breadth 1M: "0.72"
  - ✅ RiskTilt: "Pro-rischio (growth/ciclici > difensivi)"
  - ✅ **Leadership settoriale**: ["Technology", "Communication Services", "Consumer Cyclical", "Industrials"]
  - ✅ **Lagging settori**: ["Real Estate", "Financial"]
  - ✅ **Yield 10Y**: da internals_raw.Curve_UST
  - ✅ **Street View**: presente
  - ✅ **Internals raw**: presente
  
- **Chart disponibili**: **TUTTI I 7 CHART** ✅
  - ✅ RegimeScore Timeline
  - ✅ Breadth 1M & RiskTilt
  - ✅ Leadership Settoriale
  - ✅ Volatilità & VIX overlay 10Y yield
  - ✅ Breadth Depth Matrix
  - ✅ RiskTilt vs VolRegime
  - ✅ Sector Rotation Ribbon

---

### 2. **20251107-1630** (AAPL)
- **Path**: `/report/reports/20251107-1630/`
- **F1B Status**: ✅ COMPLETO
- **Dati disponibili**:
  - ✅ RegimeScore: "+0.25"
  - ✅ VIX: "VIX ~18 (<20)"
  - ✅ Breadth 1M: "0.68"
  - ✅ RiskTilt: "Pro-rischio (growth/ciclici > difensivi)"
  - ✅ **Leadership settoriale**: ["Technology", "Communication Services", "Consumer Cyclical", "Industrials"]
  - ✅ **Lagging settori**: ["Real Estate", "Financial"]
  - ✅ **Yield 10Y**: da internals_raw.Curve_UST ("2s10s ≈ +0.48%")
  - ✅ **Street View**: presente
  - ✅ **Internals raw**: presente
  
- **Chart disponibili**: **TUTTI I 7 CHART** ✅
  - ✅ RegimeScore Timeline
  - ✅ Breadth 1M & RiskTilt
  - ✅ Leadership Settoriale
  - ✅ Volatilità & VIX overlay 10Y yield
  - ✅ Breadth Depth Matrix
  - ✅ RiskTilt vs VolRegime
  - ✅ Sector Rotation Ribbon

---

## Report Parziali (Chart Parziali) ⚠️

### 3. **example-complete** (FLNC)
- **Path**: `/report/reports/example-complete/`
- **F1B Status**: ⚠️ PARZIALE (dati minimi)
- **Dati disponibili**:
  - ✅ RegimeScore: "+0.60"
  - ✅ VIX: "VIX ~17 (<20)"
  - ✅ Breadth 1M: "0.65"
  - ✅ RiskTilt: "Growth/Ciclici"
  - ❌ **Leadership settoriale**: MANCANTE
  - ❌ **Lagging settori**: MANCANTE
  - ❌ **Yield 10Y**: MANCANTE (internals_raw non presente)
  - ❌ **Street View**: MANCANTE
  - ❌ **Internals raw**: MANCANTE
  
- **Chart disponibili**: **4 CHART PARZIALI** ⚠️
  - ✅ RegimeScore Timeline (con dati mock per timeline)
  - ✅ Breadth 1M & RiskTilt
  - ⚠️ Leadership Settoriale (usa dati mock/fallback)
  - ⚠️ Volatilità & VIX overlay 10Y yield (yield mock)
  - ✅ Breadth Depth Matrix (dati simulati)
  - ✅ RiskTilt vs VolRegime
  - ⚠️ Sector Rotation Ribbon (dati mock)

---

### 4. **example-with-screenshot** (AAPL)
- **Path**: `/report/reports/example-with-screenshot/`
- **F1B Status**: ⚠️ PARZIALE (dati minimi)
- **Dati disponibili**:
  - ✅ RegimeScore: "+0.65"
  - ✅ VIX: "VIX ~18 (<20)"
  - ✅ Breadth 1M: "0.68"
  - ✅ RiskTilt: "Growth/Ciclici"
  - ❌ **Leadership settoriale**: MANCANTE
  - ❌ **Lagging settori**: MANCANTE
  - ❌ **Yield 10Y**: MANCANTE
  - ❌ **Street View**: MANCANTE
  - ❌ **Internals raw**: MANCANTE
  
- **Chart disponibili**: **4 CHART PARZIALI** ⚠️
  - ✅ RegimeScore Timeline (con dati mock per timeline)
  - ✅ Breadth 1M & RiskTilt
  - ⚠️ Leadership Settoriale (usa dati mock/fallback)
  - ⚠️ Volatilità & VIX overlay 10Y yield (yield mock)
  - ✅ Breadth Depth Matrix (dati simulati)
  - ✅ RiskTilt vs VolRegime
  - ⚠️ Sector Rotation Ribbon (dati mock)

---

### 5. **example-without-screenshot** (MSFT)
- **Path**: `/report/reports/example-without-screenshot/`
- **F1B Status**: ⚠️ PARZIALE (dati minimi)
- **Dati disponibili**:
  - ✅ RegimeScore: "+0.45"
  - ✅ VIX: "VIX ~19 (<20)"
  - ✅ Breadth 1M: "0.62"
  - ✅ RiskTilt: "Growth/Ciclici"
  - ❌ **Leadership settoriale**: MANCANTE
  - ❌ **Lagging settori**: MANCANTE
  - ❌ **Yield 10Y**: MANCANTE
  - ❌ **Street View**: MANCANTE
  - ❌ **Internals raw**: MANCANTE
  
- **Chart disponibili**: **4 CHART PARZIALI** ⚠️
  - ✅ RegimeScore Timeline (con dati mock per timeline)
  - ✅ Breadth 1M & RiskTilt
  - ⚠️ Leadership Settoriale (usa dati mock/fallback)
  - ⚠️ Volatilità & VIX overlay 10Y yield (yield mock)
  - ✅ Breadth Depth Matrix (dati simulati)
  - ✅ RiskTilt vs VolRegime
  - ⚠️ Sector Rotation Ribbon (dati mock)

---

## Riepilogo

### Report con Chart Completi (2):
1. ✅ **sample-id** - Tutti i 7 chart completi
2. ✅ **20251107-1630** - Tutti i 7 chart completi

### Report con Chart Parziali (3):
3. ⚠️ **example-complete** - 4 chart funzionanti, 3 con dati mock
4. ⚠️ **example-with-screenshot** - 4 chart funzionanti, 3 con dati mock
5. ⚠️ **example-without-screenshot** - 4 chart funzionanti, 3 con dati mock

---

## Come Testare i Chart

### Per vedere i chart completi:
1. Apri: `http://localhost:3001/report/?id=sample-id`
2. Scrolla fino al modulo F1B
3. Clicca sulla tab "Chart" nel menu laterale
4. Dovresti vedere tutti i 7 chart

### Per vedere i chart parziali:
1. Apri: `http://localhost:3001/report/?id=example-complete`
2. Scrolla fino al modulo F1B
3. Clicca sulla tab "Chart" nel menu laterale
4. Dovresti vedere 4 chart completi e 3 con dati mock

---

## Note

- I chart funzionano anche con dati parziali (usano fallback/mock per dati mancanti)
- I report `example-*` sono esempi minimi, quindi hanno dati limitati
- I report `sample-id` e `20251107-1630` sono completi e mostrano tutti i chart correttamente

