# Workflow Completo Automatico - Swing Master 5.0

## 🎯 Come Funziona

**Tu fornisci:** Ticker (es: "AAPL")  
**Il sistema esegue automaticamente (senza intervento umano):**

1. ✅ **Genera Header** → Fetch dati ticker, crea header.json con versioning
2. ✅ **Esegue F1B** → Web search automatico + API pubbliche, calcola metriche
3. ✅ **Aggiorna Versioning** → Timestamp, versione, log cambiamenti
4. ✅ **Salva Tutto** → header.json, f1b.json, manifest.json

**Tutto automatico, nessun intervento umano!**

---

## 🚀 Uso

### Esempio Base

```javascript
import { executeFullWorkflow } from './modules/orchestrator.js';

// Un solo comando, tutto automatico!
const result = await executeFullWorkflow('AAPL');
```

### Cosa Viene Fatto Automaticamente

#### 1. Header Generation
- ✅ Fetch dati ticker da Yahoo Finance (automatico)
- ✅ Fetch company info (nome, settore, exchange)
- ✅ Genera header.json completo
- ✅ Crea rows formattate per display
- ✅ Aggiunge metrics panel per popup
- ✅ Versioning automatico

#### 2. Versioning
- ✅ Timestamp automatico
- ✅ Versione incrementale (v2025.11.07-rc1)
- ✅ Log cambiamenti con timestamp
- ✅ Tracciabilità completa

#### 3. F1B Execution (100% Automatico)
- ✅ **Web search automatico**: VIX, Treasury, Commodities
- ✅ **API pubbliche**: Yahoo Finance, ETF proxy
- ✅ **Processamento**: Calcola tutte le metriche
- ✅ **Generazione**: Finviz query dinamiche
- ✅ **Formattazione**: Spiegazioni inline

#### 4. Save Modulare
- ✅ Salva `header.json`
- ✅ Salva `f1b.json`
- ✅ Salva `manifest.json`
- ✅ Tutto in `reports/{reportID}/`

---

## 📋 Output Generato

### Struttura Report

```
reports/20251107-1630/
├── header.json      ← Header completo con versioning
├── f1b.json         ← F1B completo con spiegazioni
└── manifest.json    ← Metadata, versioni, cambiamenti
```

### Header.json Include

- **Meta**: versione, auditPathId, state, changes log
- **Rows**: company-line, price-line, quality-line, window-line
- **Metrics Panel**: tutte le metriche con spiegazioni
- **Versioning**: timestamp, versione, log cambiamenti

### F1B.json Include

- **f1bSnapshot**: metriche complete regime
- **finvizFilters**: query dinamiche generate
- **bridgeF2**: handoff signals per F2
- **formattedRows**: per UI display
- **metricsPanel**: spiegazioni per popup

---

## 🔄 Workflow Dettagliato

```
Input: Ticker "AAPL"
   ↓
┌─────────────────────────────────────┐
│ STEP 1: HEADER GENERATION           │
├─────────────────────────────────────┤
│ • Fetch ticker data (Yahoo Finance) │
│ • Fetch company info                │
│ • Genera header.json completo       │
│ • Version: v2025.11.07-rc1          │
│ • Timestamp: 2025-11-07T16:30:00Z   │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ STEP 2: F1B EXECUTION (AUTOMATICO)  │
├─────────────────────────────────────┤
│ • Web search: VIX, Treasury, Oil    │
│ • API pubbliche: Yahoo Finance      │
│ • ETF proxy: Settori, Size buckets  │
│ • Process: Calcola metriche         │
│ • Generate: Finviz query            │
│ • Format: Spiegazioni inline        │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ STEP 3: VERSIONING UPDATE           │
├─────────────────────────────────────┤
│ • Version: v2025.11.07-rc2          │
│ • Changes log:                      │
│   - "F1B processed: Momentum-light" │
│ • Timestamp: aggiornato             │
└─────────────────────────────────────┘
   ↓
┌─────────────────────────────────────┐
│ STEP 4: SAVE MODULARE               │
├─────────────────────────────────────┤
│ • reports/20251107-1630/header.json │
│ • reports/20251107-1630/f1b.json    │
│ • reports/20251107-1630/manifest.json│
└─────────────────────────────────────┘
   ↓
Output: Report completo
```

---

## 📊 Versioning Automatico

### Header Versioning

Ogni modifica incrementa versione e logga:

```json
{
  "meta": {
    "version": "v2025.11.07-rc2",
    "auditPathId": "RPT-2025-11-07-AAPL-HEAD",
    "changes": [
      {
        "timestamp": "2025-11-07T16:30:00Z",
        "version": "v2025.11.07-rc1",
        "changes": ["Header generato automaticamente"]
      },
      {
        "timestamp": "2025-11-07T16:30:15Z",
        "version": "v2025.11.07-rc2",
        "changes": [
          "F1B processed: StrategyMode=Momentum-light, RegimeScore=0.25",
          "F1B version: v19-Dynamic"
        ]
      }
    ]
  }
}
```

---

## ✅ Nessun Intervento Umano

**Tutto automatico:**
- ✅ Fetch dati ticker → Yahoo Finance API
- ✅ Fetch dati macro → Web search automatico
- ✅ ETF proxy → API pubbliche automatiche
- ✅ Processing → Calcoli automatici
- ✅ Versioning → Timestamp e versioni automatiche
- ✅ Saving → Salvataggio automatico modulare

**Tu fornisci solo:** Ticker symbol

---

## 🎯 Esempio Completo

```javascript
import { executeFullWorkflow } from './modules/orchestrator.js';

// Un solo comando!
const result = await executeFullWorkflow('AAPL');

// Output:
// - result.header (header.json completo)
// - result.f1b (f1b.json completo)
// - result.reportPath (dove è salvato)
// - result.reportID (ID report)
```

---

## 📝 Note

- **F1A**: Non ancora implementato (Ticker Macro Context specifico)
- **F1B**: Completamente automatico (Market Regime generale)
- **Web Search**: Usato automaticamente per dati macro
- **API Pubbliche**: Yahoo Finance, ETF proxy (tutto automatico)
- **Versioning**: Automatico con log cambiamenti

