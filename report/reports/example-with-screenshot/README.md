# 📊 Esempio Report con Screenshot Chart

Questa directory contiene un esempio completo di report **con screenshot chart statico**.

## 📁 File Inclusi

- `header.json` - Header Ticker completo con Ticker AAPL e timestamp
- `f1b.json` - Market Context Snapshot con RegimeScore
- `chart-snapshot.png` - **Screenshot chart Exante** (timeframe 1D, volumi reali, no proxy CFD)
- `README.md` - Questo file
- `CHART-SCREENSHOT-INFO.txt` - Informazioni dettagliate sullo screenshot

## 🎯 Comportamento Chart Widget

**Questo esempio mostra lo screenshot statico** perché:
- ✅ `chart-snapshot.png` **ESISTE** nella directory
- ✅ Il sistema rileva automaticamente lo screenshot e lo mostra
- ✅ Sottotitolo: "Snapshot al momento del report"
- ✅ Mostra informazioni tecniche (timeframe, volumi, fornitore)
- ✅ Link alla fonte Exante (`/Exante.html`)

## 🚀 Come Usare

1. **Visualizza il report di esempio:**
   ```bash
   # Apri nel browser
   /report/#/example-with-screenshot
   ```

2. **Copia questa directory per creare un nuovo report:**
   ```bash
   cp -r report/reports/example-with-screenshot report/reports/mio-report-id
   ```

3. **Modifica header.json:**
   - Cambia `Ticker` da "AAPL" al tuo ticker
   - Aggiorna `CompanyName`, `Sector`, `Price`, etc.

4. **Modifica f1b.json (opzionale):**
   - Aggiorna `StrategyMode_macro`
   - Aggiorna `RegimeScore` (valore tra -1 e +1)

5. **Sostituisci screenshot:**
   - Salva nuovo screenshot come `chart-snapshot.png` in questa directory
   - Il sistema userà automaticamente questo screenshot

## 📊 Chart Widget - Informazioni Screenshot

- **Timeframe:** 1D (1 giorno)
- **Volumi:** Mercato reali (no proxy CFD)
- **Fornitore dati:** Exante Broker
- **Ticker:** AAPL.NASDAQ
- **Timestamp:** Snapshot al momento del report

Il chart widget mostra automaticamente:
- ✅ Screenshot statico (perché `chart-snapshot.png` è presente)
- ✅ Informazioni tecniche (timeframe, volumi, fornitore)
- ✅ Link alla fonte Exante (`/Exante.html`)

## 📝 Note

- **Chart Widget:** Mostra screenshot statico perché `chart-snapshot.png` è presente
- **Market Context Snapshot:** Mostra gradient band con marker verde (RegimeScore +0.65 = risk-on)
- **Header Ticker:** Mostra informazioni su AAPL (Apple Inc.)

## 🔗 Riferimenti

Vedi `ESEMPIO-COMPLETO-HEADER-CHART.md` per documentazione completa.

