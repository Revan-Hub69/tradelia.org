# Workflow Automatico - Swing Master 5.0

## 🎯 Come Funziona

**Tu fornisci:** Ticker (es: "AAPL")  
**Il sistema esegue automaticamente:**
1. ✅ Genera header.json
2. ✅ Aggiorna header con timestamp/versione
3. ✅ Esegue F1B (ricerca web automatica, API pubbliche)
4. ✅ Salva tutto in `reports/{reportID}/`

**Nessun intervento umano necessario!**

---

## 🚀 Uso

### Esempio Base

```javascript
import { executeFullWorkflow } from './modules/orchestrator.js';

// Basta dare il ticker, tutto il resto è automatico!
const result = await executeFullWorkflow('AAPL');
```

### Cosa Fa Automaticamente

1. **Header Generation**
   - Fetch dati ticker da Yahoo Finance (automatico)
   - Genera header.json
   - Crea rows per display
   - Aggiunge metrics panel

2. **Versioning**
   - Timestamp automatico
   - Versione incrementale
   - Log cambiamenti
   - Tracciabilità completa

3. **F1B Execution**
   - Raccolta dati automatica (ETF proxy + API)
   - Processamento metriche
   - Generazione Finviz query
   - Formattazione con spiegazioni

4. **Save**
   - Salva header.json
   - Salva f1b.json
   - Salva manifest.json
   - Tutto in `reports/{reportID}/`

---

## 📋 Output Generato

### Struttura Report

```
reports/20251107-1630/
├── header.json      ← Header ticker con versioning
├── f1b.json         ← F1B completo
└── manifest.json    ← Metadata e versioni
```

### Header.json Include

- Dati ticker (price, change, currency)
- Rows formattate per display
- Metrics panel per popup
- **Versioning**: timestamp, versione, log cambiamenti

### F1B.json Include

- f1bSnapshot (metriche complete)
- finvizFilters (query dinamiche)
- bridgeF2 (handoff a F2)
- formattedRows (per UI)
- metricsPanel (spiegazioni)

---

## 🔄 Workflow Dettagliato

```
Input: Ticker "AAPL"
   ↓
1. Fetch Ticker Data (Yahoo Finance API)
   → Price, Change, Exchange, Currency
   ↓
2. Generate Header
   → header.json con rows e metrics
   → Version: 1.0.0
   → Timestamp: 2025-11-07T16:30:00Z
   ↓
3. Execute F1B (Automatic)
   → Web search: VIX, Treasury, Commodities
   → ETF proxy: Settori, Size buckets
   → Process: Calcola metriche
   → Generate: Finviz query
   ↓
4. Update Header Version
   → Version: 1.0.1
   → Changes: ["F1B processed: Momentum-light"]
   → Timestamp: aggiornato
   ↓
5. Save All
   → reports/20251107-1630/header.json
   → reports/20251107-1630/f1b.json
   → reports/20251107-1630/manifest.json
   ↓
Output: Report completo
```

---

## 📊 Versioning Automatico

### Header Versioning

Ogni aggiornamento incrementa versione e logga cambiamenti:

```json
{
  "meta": {
    "version": "1.0.1",
    "lastUpdated": "2025-11-07T16:30:00Z",
    "changes": [
      {
        "timestamp": "2025-11-07T16:30:00Z",
        "version": "1.0.1",
        "changes": ["F1B processed: Momentum-light"]
      }
    ]
  }
}
```

---

## ✅ Nessun Intervento Umano

**Tutto automatico:**
- ✅ Fetch dati ticker → Yahoo Finance API
- ✅ Fetch dati macro → Web search + ETF proxy
- ✅ Processing → Calcoli automatici
- ✅ Versioning → Timestamp e versioni automatiche
- ✅ Saving → Salvataggio automatico JSON

**Tu fornisci solo:** Ticker symbol

---

## 🎯 Esempio Completo

```javascript
import { executeFullWorkflow } from './modules/orchestrator.js';

// Un solo comando, tutto automatico!
const result = await executeFullWorkflow('AAPL');

// Output:
// - result.header (header.json)
// - result.f1b (f1b.json completo)
// - result.reportPath (dove è salvato)
```

---

## 📝 Note

- **F1A**: Non ancora implementato (Ticker Macro Context)
- **F1B**: Completamente automatico (Market Regime)
- **Web Search**: Usato automaticamente per dati macro
- **API Pubbliche**: Yahoo Finance, ETF proxy (tutto automatico)

