# F1B - Guida Spiegazioni Pezzo per Pezzo

## 🎯 Sistema di Spiegazioni

Ogni metrica F1B ha spiegazioni complete che vengono mostrate quando l'utente clicca sulla metrica (come nell'header ticker).

---

## 📋 Metriche con Spiegazioni

### Regime State
- **StrategyMode_macro** - Regime tattico (Momentum/Pullback)
- **RegimeScore** - Appetito rischio sintetico
- **VolRegime** - Regime volatilità

### Breadth & Rotation
- **Breadth_1M** - Ampiezza settoriale
- **RiskTilt_1M** - Preferenza rischio
- **SmallCapPressure_1W** - Pressure small cap
- **LeadersMultiTF** - Leadership multi-timeframe
- **SizeBias** - Preferenza capitalizzazione
- **StressMicroCap** - Stress micro cap

### Market Microstructure
- **CreditRiskBlock** - Stress creditizio
- **FX_Regime** - Regime dollaro
- **LiquidityRegimeScore** - Score liquidità
- **RiskWindow** - Window rischio 3-10 giorni

### Output Speciale
- **FinvizQuery** - Query generata dinamicamente

---

## 🔍 Formato Spiegazioni

Ogni spiegazione include:

1. **nomeTecnico** - Nome completo della metrica
2. **what** - Cosa è (definizione)
3. **how** - Come viene calcolata
4. **fonte** - Fonte accademica
5. **esempio** - Esempio pratico

---

## 📊 Output Formattato

L'output include:

### `formattedRows`
Array di righe formattate per header-ticker, dove ogni metrica è cliccabile:

```javascript
{
  id: 'strategy-mode-line',
  parts: [
    { kind: 'text', text: 'StrategyMode: ' },
    { 
      kind: 'metric', 
      key: 'StrategyMode_macro', 
      value: 'Momentum',
      label: 'StrategyMode',
      tone: 'ok'
    }
  ]
}
```

### `metricsPanel`
Array di metriche con spiegazioni complete per popup:

```javascript
{
  key: 'StrategyMode_macro',
  label: 'StrategyMode (Regime Tattico)',
  value: 'Momentum',
  what: 'Classificazione del regime...',
  how: 'StrategyMode viene calcolato...',
  source: 'Carhart, M.M. (1997)...',
  esempio: 'Se VIX < 20...'
}
```

---

## 🎨 Integrazione con UI

### Header Ticker System

```javascript
import { processF1BComplete } from './modules/f1b-enhanced-complete.js';
import { headerTicker } from './components/header-ticker.js';

// Processa F1B
const f1bData = await processF1BComplete();

// Mount header ticker
const tickerNode = headerTicker.mount(container);

// Update con dati formattati
headerTicker.update(tickerNode, {
  rows: f1bData.formattedRows,
  metricsPanel: f1bData.metricsPanel,
  meta: f1bData.meta
});
```

### Metric Popup

Quando l'utente clicca su una metrica, il popup mostra:
- **Valore** corrente
- **Cosa** è (definizione)
- **Come** viene calcolata
- **Fonte** accademica
- **Esempio** pratico

---

## 📝 Esempio Output

```json
{
  "f1bSnapshot": {
    "regime_state": {
      "StrategyMode_macro": "Momentum-light",
      "RegimeScore": 0.25
    }
  },
  "formattedRows": [
    {
      "id": "strategy-mode-line",
      "parts": [
        { "kind": "text", "text": "StrategyMode: " },
        { 
          "kind": "metric", 
          "key": "StrategyMode_macro", 
          "value": "Momentum-light",
          "label": "StrategyMode",
          "tone": "warn"
        }
      ]
    }
  ],
  "metricsPanel": [
    {
      "key": "StrategyMode_macro",
      "label": "StrategyMode (Regime Tattico)",
      "value": "Momentum-light",
      "what": "Classificazione del regime...",
      "how": "StrategyMode viene calcolato...",
      "source": "Carhart, M.M. (1997)...",
      "esempio": "Se VIX < 20..."
    }
  ]
}
```

---

## ✅ Checklist

- [x] Spiegazioni per tutte le metriche F1B
- [x] Formato compatibile con header-ticker
- [x] Formato compatibile con metric-popup
- [x] Fonti accademiche per ogni metrica
- [x] Esempi pratici per ogni metrica
- [x] Formatter che genera rows cliccabili

---

## 🚀 Prossimi Passi

1. Integrare con UI esistente
2. Testare popup spiegazioni
3. Aggiungere più metriche se necessario
4. Validare esempi pratici

