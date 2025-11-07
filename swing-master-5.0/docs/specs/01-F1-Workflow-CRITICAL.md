# F1 — Workflow per Uso Critico

## ⚠️ IMPORTANTE: Uso Critico Richiede Qualità ≥95%

Questo workflow è ottimizzato per uso critico, non solo educativo.

---

## 🎯 Architettura Multi-Layer

### Layer 1: Multi-Source API Aggregation (Primary)

**Obiettivo**: Raccogliere dati da multiple fonti API gratuite

#### Fonti:
1. **Yahoo Finance API** (gratuita, unlimited)
   - Performance settori
   - Performance indici
   - Dati real-time

2. **Alpha Vantage API** (gratuita, 5 calls/min)
   - Dati settori
   - Performance indici
   - Rate limiting da gestire

3. **Polygon.io Free Tier** (5 calls/min)
   - Dati aggregati settori
   - Performance indici

#### Implementazione:
```javascript
async function getSectorFromMultipleAPIs(sector) {
  const sources = await Promise.all([
    yahooFinance.getSector(sector),
    alphaVantage.getSector(sector).catch(() => null),
    polygon.getSector(sector).catch(() => null)
  ]);
  
  return aggregateSources(sources);
}
```

---

### Layer 2: ETF Proxy + Small Cap Adjustment

**Obiettivo**: Correggere bias large cap e includere small/mid cap

#### Metodologia:
1. Ottieni performance ETF SPDR (large cap)
2. Calcola performance small/mid cap per settore
3. Ricostruisci performance settore completo con pesatura

#### Fonti Small/Mid Cap:
- Russell 2000 by sector (se disponibile)
- S&P MidCap 400 by sector (se disponibile)
- ETF small cap settoriali

#### Implementazione:
```javascript
function adjustSectorForSmallCap(etfPerf, sector) {
  const largeCapWeight = 0.70;
  const smallMidCapWeight = 0.30;
  
  const smallMidCapPerf = getSmallMidCapPerformance(sector);
  
  return (etfPerf * largeCapWeight) + (smallMidCapPerf * smallMidCapWeight);
}
```

---

### Layer 3: Web Scraping Settori Ufficiali

**Obiettivo**: Validazione con dati ufficiali settoriali

#### Fonti:
1. **Sector SPDR Website** (se ToS permesso)
   - Performance ufficiali settori
   - Dati storici

2. **ETF.com / ETFDB** (se ToS permesso)
   - Performance ETF settoriali
   - Composizione ETF

#### Implementazione:
```javascript
async function scrapeSectorOfficial(sector) {
  try {
    const spdrData = await scrapeSPDRWebsite(sector);
    const etfData = await scrapeETFCom(sector);
    return validateSources(spdrData, etfData);
  } catch (error) {
    return null; // Fallback silenzioso
  }
}
```

---

### Layer 4: GPT-5 + Screenshot (Fallback)

**Obiettivo**: Ultimo fallback se fonti primarie non raggiungono confidence

#### Quando usare:
- Solo se confidence < 0.85 dopo Layer 1-3
- Come ultimo tentativo

#### Implementazione:
```javascript
async function getFinvizViaScreenshot(sector) {
  if (confidence >= 0.85) return null; // Skip se non necessario
  
  const screenshot = await headlessBrowser.screenshot('finviz.com');
  const extracted = await gpt5Vision.extract(screenshot);
  return extracted;
}
```

---

## 🔄 Workflow Completo

```
1. Layer 1: Multi-source API aggregation
   ├─ Yahoo Finance
   ├─ Alpha Vantage
   └─ Polygon.io
   → Calcola convergence e confidence

2. Layer 2: ETF Proxy + Small Cap adjustment
   ├─ ETF SPDR performance
   ├─ Small/Mid cap performance
   └─ Ricostruzione pesata
   → Aggiungi al pool dati

3. Layer 3: Web scraping (opzionale)
   ├─ Sector SPDR website
   └─ ETF.com
   → Validazione incrociata

4. Validation & Aggregation
   ├─ Cross-check tutte le fonti
   ├─ Calcola confidence score
   └─ Se confidence < 0.85 → Layer 4

5. Layer 4: GPT-5 + Screenshot (fallback)
   └─ Solo se necessario

6. Output Finale
   ├─ Dato aggregato
   ├─ Confidence score
   └─ Fonte principale
```

---

## 📊 Confidence Scoring

### Calcolo Confidence:

```javascript
function calculateConfidence(sources) {
  // 1. Convergenza (40% weight)
  const convergence = calculateConvergence(sources);
  // Quanto si accordano le fonti (0-1)
  
  // 2. Source Quality (40% weight)
  const sourceQuality = calculateSourceQuality(sources);
  // Qualità intrinseca fonti (0-1)
  
  // 3. Freshness (20% weight)
  const freshness = calculateFreshness(sources);
  // Quanto recenti sono i dati (0-1)
  
  const confidence = 
    (convergence * 0.4) + 
    (sourceQuality * 0.4) + 
    (freshness * 0.2);
  
  return Math.min(1.0, confidence);
}
```

### Thresholds:

- **confidence ≥ 0.90**: Eccellente, usa direttamente
- **confidence ≥ 0.85**: Buono, accettabile per uso critico
- **confidence ≥ 0.75**: Accettabile, con warning
- **confidence < 0.75**: Fallback a Layer 4 o flag HOLD

---

## ✅ Output Finale

```json
{
  "sector": "Technology",
  "performance_1M": 0.082,
  "confidence": 0.87,
  "sources": [
    {"name": "Yahoo Finance", "value": 0.081, "weight": 0.3},
    {"name": "Alpha Vantage", "value": 0.083, "weight": 0.3},
    {"name": "ETF Proxy Adjusted", "value": 0.082, "weight": 0.4}
  ],
  "convergence": 0.95,
  "freshness": "T-0",
  "method": "multi_source_aggregated"
}
```

---

## 🚀 Setup Richiesto

### API Keys (Tutte Gratuite):

1. **Yahoo Finance**: Nessuna key necessaria
2. **Alpha Vantage**: Registrazione gratuita → API key
3. **Polygon.io**: Registrazione gratuita → API key

### Dipendenze:

- Headless browser (Puppeteer/Playwright) per screenshot
- Web scraping library (Cheerio/BeautifulSoup)
- GPT-5 Vision API (se usato fallback)

---

## 📋 Checklist Implementazione

- [ ] Setup API keys (Alpha Vantage, Polygon)
- [ ] Implementare Layer 1 (Multi-source API)
- [ ] Implementare Layer 2 (ETF + Small Cap adjustment)
- [ ] Implementare Layer 3 (Web scraping - opzionale)
- [ ] Implementare confidence scoring
- [ ] Implementare Layer 4 (GPT-5 fallback - opzionale)
- [ ] Test con dati reali
- [ ] Validazione qualità vs Finviz Premium
- [ ] Monitoraggio e alerting

---

## ⚠️ Limitazioni Note

1. **Rate Limiting**: Alpha Vantage e Polygon hanno limiti (5 calls/min)
   - Soluzione: Caching e scheduling intelligente

2. **ToS Compliance**: Web scraping richiede verifica ToS
   - Soluzione: Solo siti che permettono scraping

3. **Small Cap Data**: Non sempre disponibile per tutti i settori
   - Soluzione: Fallback a stime basate su pattern storici

4. **GPT-5 Cost**: Se usato frequentemente, può avere costi
   - Soluzione: Solo come fallback, caching aggressivo

---

## 🎯 Qualità Attesa

- **Accuratezza**: ≥95% vs Finviz Premium
- **Confidence**: ≥0.85 nella maggior parte dei casi
- **Affidabilità**: Alta (multiple fonti + fallback)
- **Costo**: Zero (o minimo per API keys gratuite)

---

## 📚 Documentazione Correlata

- [01-F1-Critical-Use-Solutions.md](../docs/01-F1-Critical-Use-Solutions.md) - Soluzioni dettagliate
- [01-F1-Quality-Comparison.md](../docs/01-F1-Quality-Comparison.md) - Confronto qualità
- [01-F1-Workflow.md](./01-F1-Workflow.md) - Workflow base (educativo)

