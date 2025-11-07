# Quick Start - File Necessari

## ✅ File Operativi (Solo Questi Servono!)

### Per Far Funzionare F1B:

```
modules/
├── f1b-data-collector.js          ✅ Raccoglie dati (ETF proxy + API)
├── f1b-processor-enhanced.js      ✅ Processa dati → output F1B
├── f1b-explanations.js            ✅ Spiegazioni metriche
├── f1b-output-formatter.js        ✅ Formatta con spiegazioni
└── f1b-enhanced-complete.js       ✅ Entry point principale
```

### Uso:

```javascript
import { processF1BComplete } from './modules/f1b-enhanced-complete.js';

const result = await processF1BComplete();
// result.formattedRows → per UI
// result.metricsPanel → per popup
// result.f1bSnapshot → dati completi
```

---

## 📚 File Documentazione (NON Necessari)

Tutti i file `.md` in `specs/` e `docs/` sono **SOLO documentazione**:
- Spiegazioni
- Analisi
- Guide
- **NON servono per far funzionare il codice**

---

## 🎯 Struttura Semplificata

Se vuoi solo codice operativo:

```
swing-master-5.0/
├── modules/          ← SOLO QUESTO serve
└── examples/         ← Utile per vedere come usare
```

Tutto il resto (`specs/`, `docs/`) è opzionale.

---

## ✅ Conclusione

**Per funzionare: basta la cartella `modules/`**

**Documentazione: utile ma non necessaria**

