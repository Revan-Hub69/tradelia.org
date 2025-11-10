# 📋 Esempio Completo: Header Ticker + Chart + Market Context Snapshot

Questa directory contiene un esempio completo di tutti i file necessari per visualizzare:
- ✅ Header Ticker (FLNC - Fluence Energy, Inc.)
- ✅ Market Context Snapshot (gradient band con RegimeScore)
- ✅ Chart Widget (screenshot Exante con timeframe 1D, volumi reali)

## 📁 File Inclusi

- `header.json` - Header Ticker completo con Ticker FLNC e timestamp
- `f1b.json` - Market Context Snapshot con RegimeScore
- `chart-snapshot.png` - Screenshot chart Exante (timeframe 1D, volumi reali, no proxy CFD)
- `README.md` - Questo file

## 🚀 Come Usare

1. **Visualizza il report di esempio:**
   ```bash
   # Apri nel browser
   /report/#/example-complete
   ```

2. **Copia questa directory per creare un nuovo report:**
   ```bash
   cp -r report/reports/example-complete report/reports/mio-report-id
   ```

3. **Modifica header.json:**
   - Cambia `Ticker` da "FLNC" al tuo ticker
   - Aggiorna `CompanyName`, `Sector`, `Price`, etc.

4. **Modifica f1b.json (opzionale):**
   - Aggiorna `StrategyMode_macro`
   - Aggiorna `RegimeScore` (valore tra -1 e +1)

5. **Sostituisci screenshot (opzionale):**
   - Salva nuovo screenshot come `chart-snapshot.png` in questa directory
   - Se non presente, il sistema userà TradingView LIVE con il Ticker

6. **Apri report:**
   - Vai a `/report/#/mio-report-id`
   - Tutto dovrebbe funzionare!

## 📊 Chart Widget - Informazioni Screenshot

- **Timeframe:** 1D (1 giorno)
- **Volumi:** Mercato reali (no proxy CFD)
- **Fornitore dati:** Exante Broker
- **Ticker:** FLNC.NASDAQ
- **Timestamp:** Snapshot al momento del report

Il chart widget mostra automaticamente:
- Screenshot statico se `chart-snapshot.png` è presente
- TradingView LIVE se screenshot non disponibile
- Informazioni tecniche (timeframe, volumi, fornitore)
- Link alla fonte Exante (`/Exante.html`)

## 📝 Note

- **Chart Widget:** Se non c'è `chart-snapshot.png`, usa TradingView LIVE
- **Market Context Snapshot:** Se non c'è `f1b.json` o `RegimeScore`, mostra solo gradient band senza marker
- **Header Ticker:** Richiede almeno `Ticker` in `rows[].parts[]`

## 🔗 Riferimenti

Vedi `ESEMPIO-COMPLETO-HEADER-CHART.md` per documentazione completa.

