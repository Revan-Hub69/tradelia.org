# 📋 Esempio Completo: Header Ticker + Chart + Market Context Snapshot

Questo documento mostra tutti i file necessari per visualizzare correttamente:
- **Header Ticker** (informazioni sul ticker)
- **Market Context Snapshot** (fascia gradient regime)
- **Chart Widget** (screenshot o TradingView LIVE)

---

## 📁 Struttura File Necessari

```
report/reports/{reportId}/
  ├── header.json          ← Header Ticker (OBBLIGATORIO)
  ├── f1b.json            ← Market Context Snapshot (OPZIONALE ma consigliato)
  ├── chart-snapshot.png  ← Screenshot chart (OPZIONALE, se presente usa questo invece di LIVE)
  └── manifest.json       ← Metadata report (OPZIONALE)
```

---

## 1️⃣ HEADER.JSON - Header Ticker

### File: `report/reports/{reportId}/header.json`

**Campi OBBLIGATORI per Chart Widget:**
- `rows[].parts[].key === "Ticker"` → Usato per TradingView widget LIVE
- `meta.timestamp` o `meta.UpdatedAt` → Timestamp del report (mostrato nel sottotitolo)

**Campi OBBLIGATORI per Market Context Snapshot:**
- Nessuno (usa f1b.json)

### Esempio Completo:

```json
{
  "meta": {
    "module": "HEADER",
    "version": "v2025.11.07",
    "auditPathId": "RPT-2025-11-07-NVDA-HEAD",
    "state": "ACTIVE",
    "timestamp": "2025-11-07T16:30:00Z",
    "UpdatedAt": "2025-11-07T16:30:00Z"
  },
  "rows": [
    {
      "id": "company-line",
      "parts": [
        { "kind": "text", "text": "Report Framework Accademico AI, Tradelia Swing Master 5.0 su " },
        { "kind": "metric", "key": "CompanyName", "value": "NVIDIA Corporation", "tone": "neutral" },
        { "kind": "text", "text": ". " },
        { "kind": "text", "text": "Ticker: " },
        { "kind": "metric", "key": "Ticker", "value": "NVDA", "tone": "neutral", "label": "Ticker" },
        { "kind": "text", "text": ". " },
        { "kind": "text", "text": "Borsa principale: " },
        { "kind": "metric", "key": "Venue", "value": "NASDAQ", "tone": "neutral" },
        { "kind": "text", "text": ". " },
        { "kind": "text", "text": "Settore: " },
        { "kind": "metric", "key": "Sector", "value": "Tecnologia", "tone": "neutral" },
        { "kind": "text", "text": "." }
      ]
    },
    {
      "id": "price-line",
      "parts": [
        { "kind": "text", "text": "Prezzo al momento dello start: " },
        { "kind": "metric", "key": "Price", "value": 123.45, "tone": "ok" },
        { "kind": "text", "text": ". " },
        { "kind": "text", "text": "Cambiamento di prezzo: " },
        { "kind": "metric", "key": "ChangePct", "value": "-2.13%", "tone": "err" },
        { "kind": "text", "text": "." }
      ]
    },
    {
      "id": "window-line",
      "parts": [
        { "kind": "text", "text": "Report iniziato il " },
        { "kind": "metric", "key": "Start", "value": "2025-10-21", "tone": "neutral" },
        { "kind": "text", "text": " e concluso il " },
        { "kind": "metric", "key": "End", "value": "2025-10-25", "tone": "neutral" },
        { "kind": "text", "text": ". " },
        { "kind": "text", "text": "Ultimo aggiornamento: " },
        { "kind": "metric", "key": "UpdatedAt", "value": "2025-10-25T22:14:00Z", "tone": "neutral" },
        { "kind": "text", "text": ". " },
        { "kind": "text", "text": "Versione: " },
        { "kind": "metric", "key": "Version", "value": "v2025.10.25-rc3", "tone": "neutral" },
        { "kind": "text", "text": "." }
      ]
    }
  ],
  "footer": {
    "links": [
      {
        "label": "Scopri tutte le metriche",
        "action": "open-metrics-panel"
      }
    ]
  },
  "metricsPanel": [
    { "key": "Ticker", "label": "Ticker", "value": "NVDA", "tone": "neutral" },
    { "key": "CompanyName", "label": "Nome azienda", "value": "NVIDIA Corporation", "tone": "neutral" },
    { "key": "Price", "label": "Prezzo", "value": 123.45, "tone": "ok" },
    { "key": "UpdatedAt", "label": "Ultimo aggiornamento", "value": "2025-10-25T22:14:00Z", "tone": "neutral" }
  ]
}
```

### 🔑 Campi Chiave per Chart Widget:

```json
{
  "meta": {
    "timestamp": "2025-11-07T16:30:00Z",  // ← Usato per sottotitolo chart
    "UpdatedAt": "2025-11-07T16:30:00Z"   // ← Fallback per timestamp
  },
  "rows": [
    {
      "parts": [
        {
          "kind": "metric",
          "key": "Ticker",        // ← OBBLIGATORIO: Usato per TradingView widget
          "value": "NVDA"          // ← Simbolo ticker (es: NVDA, AAPL, FLNC)
        }
      ]
    }
  ]
}
```

---

## 2️⃣ F1B.JSON - Market Context Snapshot

### File: `report/reports/{reportId}/f1b.json`

**Campi OBBLIGATORI per Market Context Snapshot:**
- `regime_and_risk.RegimeScore.raw` → Valore tra -1 (risk-off) e +1 (risk-on)
- `regime_and_risk.StrategyMode_macro.raw` → Modo strategia (opzionale)

### Esempio Completo:

```json
{
  "meta": {
    "timestampET": "2025-10-29 16:20 ET",
    "module": "F1B · Market Regime",
    "moduleVersion": "v19-Dynamic",
    "moduleStatus": "ACTIVE"
  },
  "regime_and_risk": {
    "StrategyMode_macro": {
      "raw": "Momentum",
      "tone": "green"
    },
    "RegimeScore": {
      "raw": "+0.60",           // ← OBBLIGATORIO: Valore tra -1 e +1
      "tone": "green"            // ← Colore marker (green = risk-on, red = risk-off)
    }
  }
}
```

### 🔑 Campo Chiave:

```json
{
  "regime_and_risk": {
    "RegimeScore": {
      "raw": "+0.60"  // ← Valore tra -1 (risk-off) e +1 (risk-on)
                      // Esempi:
                      //   "+0.60" = risk-on (verde, marker a destra)
                      //   "-0.30" = risk-off (rosso, marker a sinistra)
                      //   "0.00"  = neutro (arancione, marker al centro)
    }
  }
}
```

### Struttura Alternativa Supportata:

```json
{
  "f1bSnapshot": {
    "regime_state": {
      "RegimeScore": 0.60,              // ← Numero diretto (non stringa)
      "StrategyMode_macro": "Momentum"
    }
  }
}
```

---

## 3️⃣ CHART-SNAPSHOT.PNG - Screenshot Chart

### File: `report/reports/{reportId}/chart-snapshot.png`

**Priorità Chart Widget:**
1. ✅ **Se esiste `chart-snapshot.png`** → Mostra screenshot statico con fonte Exante
2. ❌ **Se NON esiste** → Mostra TradingView LIVE widget

### Come Salvare Screenshot:

#### Opzione 1: Manuale
1. Salva screenshot come `chart-snapshot.png`
2. Copia in `report/reports/{reportId}/chart-snapshot.png`

#### Opzione 2: Script PowerShell
```powershell
.\save-chart-screenshot.ps1 -ReportId "sample-id" -ImagePath "C:\path\to\screenshot.png"
```

### Formato Screenshot:
- **Formato:** PNG (consigliato) o JPEG
- **Risoluzione:** Qualsiasi (il sistema si adatta)
- **Contenuto:** Grafico con indicatori (SMA, RSI, ATR, Volume, ecc.)

### Fonte Automatica:
Quando viene mostrato lo screenshot, appare automaticamente:
```
Fonte: Grafico gentilmente concesso da Exante
```
(Link a `/Exante.html`)

---

## 4️⃣ MANIFEST.JSON - Metadata (Opzionale)

### File: `report/reports/{reportId}/manifest.json`

```json
{
  "reportID": "sample-id",
  "ticker": "NVDA",
  "timestamp": "2025-11-07T16:30:00Z",
  "modules": ["Header", "F1B", "F2", "F3"],
  "versions": {
    "header": "v2025.11.07",
    "f1b": "v19-Dynamic"
  }
}
```

---

## 🎯 Comportamento Chart Widget

### Scenario 1: Screenshot Presente
```
report/reports/sample-id/chart-snapshot.png ✅ ESISTE
```
**Risultato:**
- Mostra screenshot statico
- Sottotitolo: "Snapshot al momento del report"
- Timestamp: "[data/ora]"
- Fonte: "Fonte: Grafico gentilmente concesso da Exante" (link a /Exante.html)

### Scenario 2: Screenshot NON Presente + Ticker Disponibile
```
report/reports/sample-id/chart-snapshot.png ❌ NON ESISTE
header.json → Ticker: "NVDA" ✅ PRESENTE
```
**Risultato:**
- Mostra TradingView LIVE widget
- Sottotitolo: "Chart live - Report generato il [data/ora] | Dati in tempo reale"
- Dati aggiornati in tempo reale

### Scenario 3: Nessun Dato Disponibile
```
chart-snapshot.png ❌ NON ESISTE
header.json → Ticker ❌ NON PRESENTE
```
**Risultato:**
- Widget nascosto (non viene mostrato)

---

## 🎨 Market Context Snapshot

### Comportamento:

**Se `f1b.json` ha `RegimeScore`:**
- Mostra gradient band (risk-off → risk-on)
- Marker posizionato in base al `RegimeScore`
- Colore marker:
  - 🔴 Rosso: `RegimeScore < -0.3` (risk-off)
  - 🟠 Arancione: `-0.3 ≤ RegimeScore ≤ +0.3` (neutro)
  - 🟢 Verde: `RegimeScore > +0.3` (risk-on)

**Se `f1b.json` NON ha `RegimeScore`:**
- Mostra solo gradient band senza marker
- Label: "Market context snapshot — fonte F1B (30d regime)"

---

## 📝 Esempio Completo Funzionante

### Directory Structure:
```
report/reports/example-complete/
  ├── header.json          ← Header con Ticker e timestamp
  ├── f1b.json            ← F1B con RegimeScore
  ├── chart-snapshot.png  ← Screenshot chart (opzionale)
  └── manifest.json       ← Metadata (opzionale)
```

### header.json (Minimo):
```json
{
  "meta": {
    "timestamp": "2025-11-07T16:30:00Z",
    "UpdatedAt": "2025-11-07T16:30:00Z"
  },
  "rows": [
    {
      "parts": [
        {
          "kind": "metric",
          "key": "Ticker",
          "value": "NVDA"
        }
      ]
    }
  ]
}
```

### f1b.json (Minimo):
```json
{
  "regime_and_risk": {
    "RegimeScore": {
      "raw": "+0.60"
    }
  }
}
```

### Risultato:
✅ Header Ticker mostra informazioni su NVDA
✅ Market Context Snapshot mostra gradient band con marker verde (risk-on) a 60%
✅ Chart Widget mostra screenshot (se presente) o TradingView LIVE

---

## 🚀 Quick Start

1. **Crea directory report:**
   ```bash
   mkdir report/reports/my-report-id
   ```

2. **Crea header.json:**
   - Includi `Ticker` in `rows[].parts[]`
   - Includi `timestamp` o `UpdatedAt` in `meta`

3. **Crea f1b.json:**
   - Includi `regime_and_risk.RegimeScore.raw` (valore tra -1 e +1)

4. **Salva screenshot (opzionale):**
   - Salva come `chart-snapshot.png` nella directory del report

5. **Apri report:**
   - Vai a `/report/#/my-report-id`
   - Tutto dovrebbe funzionare automaticamente!

---

## 📚 Riferimenti

- **Header Ticker:** `report/assets/js/components/header-ticker.js`
- **Chart Widget:** `report/assets/js/components/chart-widget.js`
- **Market Context Snapshot:** `report/assets/js/components/market-context-snapshot.js`
- **App Orchestrator:** `report/assets/js/app.js`

---

## ❓ FAQ

### Q: Il chart non si vede, cosa fare?
**A:** Verifica che:
1. `header.json` abbia `Ticker` in `rows[].parts[]`
2. Se vuoi screenshot: salva `chart-snapshot.png` nella directory del report
3. Controlla console browser per errori

### Q: Market Context Snapshot non mostra marker?
**A:** Verifica che:
1. `f1b.json` esista
2. `regime_and_risk.RegimeScore.raw` sia presente
3. Valore sia tra -1 e +1 (es: "+0.60", "-0.30", "0.00")

### Q: Come cambio il simbolo del chart?
**A:** Modifica `header.json` → `rows[].parts[]` → `key: "Ticker"` → `value: "NUOVO_TICKER"`

### Q: Lo screenshot ha priorità sul LIVE?
**A:** Sì! Se esiste `chart-snapshot.png`, viene usato quello. Altrimenti TradingView LIVE.

---

## ✅ Checklist Completa

- [ ] `header.json` con `Ticker` e `timestamp`
- [ ] `f1b.json` con `RegimeScore` (opzionale ma consigliato)
- [ ] `chart-snapshot.png` (opzionale, se vuoi screenshot invece di LIVE)
- [ ] `manifest.json` (opzionale, solo metadata)

---

**Ultimo aggiornamento:** 2025-11-07
**Versione:** 1.0.0

