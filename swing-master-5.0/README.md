# SRD v5.0 — Swing Research Deck

Framework proprietario per analisi swing (orizzonte 3-10 giorni) basato su pipeline AI e modelli quantitativi.

## 📁 Struttura

```
swing-master-5.0/
├── modules/          # ✅ CODICE OPERATIVO
│   ├── orchestrator.js                # 🆕 Workflow completo automatico
│   ├── f1b-data-collector.js          # Raccoglie dati
│   ├── f1b-processor-enhanced.js      # Processa dati
│   ├── f1b-explanations.js            # Spiegazioni
│   ├── f1b-output-formatter.js        # Formatta output
│   ├── f1b-enhanced-complete.js       # Entry point completo
│   └── f1b-report-saver.js            # Salva JSON automaticamente
├── examples/         # Esempi di utilizzo
│   └── orchestrator-example.js        # 🆕 Esempio workflow completo
├── test/            # Test
│   └── test-orchestrator.js           # 🆕 Test orchestrator
└── docs/            # Documentazione (opzionale)
```

## ✅ Status Moduli

| Modulo | Status | Descrizione |
|--------|--------|-------------|
| **F1** | ✅ **OPERATIVO** | Screening / Macro Context |
| F2 | ⏳ Da implementare | Macro/Sentiment |
| F3 | ⏳ Da implementare | Analisi Tecnica |
| F4 | ⏳ Da implementare | Intermarket |
| F5 | ⏳ Da implementare | Setup Operativo |
| F6 | ⏳ Da implementare | Gestione Dinamica |
| F7 | ⏳ Da implementare | Audit & Feedback |
| F8 | ⏳ Da implementare | Performance & KPI |

## 🚀 Quick Start

### 🎯 Workflow Completo Automatico (Ticker → Header → F1B)

**Nuovo!** Workflow completamente automatico: tu fornisci il ticker, il sistema genera tutto!

```javascript
import { executeFullWorkflow } from './modules/orchestrator.js';

// Un solo comando, tutto automatico!
const result = await executeFullWorkflow('AAPL');

// Output include:
// - result.header (header.json completo con versioning)
// - result.f1b (f1b.json completo)
// - result.reportPath (dove è salvato)
// - result.reportID (ID report)
```

**Cosa fa automaticamente:**
1. ✅ Genera header.json (fetch dati ticker, company info)
2. ✅ Esegue F1B (web search automatico + API pubbliche)
3. ✅ Aggiorna versioning (timestamp, versione, log cambiamenti)
4. ✅ Salva tutto (header.json, f1b.json, manifest.json)

**Nessun intervento umano necessario!**

Vedi: `WORKFLOW-COMPLETO.md` per dettagli.

---

### F1 - Market Regime con Auto-Save

```javascript
import { processF1BComplete } from './modules/f1b-enhanced-complete.js';

// Processa e salva automaticamente JSON
const result = await processF1BComplete({
  saveReport: true  // Salva in reports/{reportID}/f1b.json
});

// Output include:
// - result.f1bSnapshot (dati completi)
// - result.formattedRows (per UI)
// - result.metricsPanel (per popup spiegazioni)
// - result.meta.savedReport (info salvataggio)
```

### F1 - Solo Processing (senza save)

```javascript
const result = await processF1BComplete({
  saveReport: false
});
```

## 💾 Salvataggio Automatico

Il sistema salva automaticamente JSON in:
- **Path**: `report/reports/{reportID}/f1b.json`
- **ID**: Auto-generato (YYYYMMDD-HHMM) o custom
- **Manifest**: Opzionale `manifest.json`

## 🧪 Test

```bash
# Test HTML (browser)
# Apri: test/test-f1b-simple.html

# Test Node.js
node test/test-f1b.js
```

## 📚 Documentazione

- **QUICK-START.md** - File necessari per funzionamento
- **STATUS.md** - Status operativo moduli
- **docs/guides/** - Guide operative
