# 📋 Esempio Completo: Header Ticker + Chart

Questa directory contiene un esempio completo di tutti i file necessari per visualizzare:
- ✅ Header Ticker
- ✅ Market Context Snapshot
- ✅ Chart Widget (screenshot o TradingView LIVE)

## 📁 File Inclusi

- `header.json` - Header Ticker completo con Ticker e timestamp
- `f1b.json` - Market Context Snapshot con RegimeScore
- `README.md` - Questo file

## 🚀 Come Usare

1. **Copia questa directory:**
   ```bash
   cp -r report/reports/example-complete report/reports/mio-report-id
   ```

2. **Modifica header.json:**
   - Cambia `Ticker` da "NVDA" al tuo ticker
   - Aggiorna `timestamp` e `UpdatedAt`

3. **Modifica f1b.json (opzionale):**
   - Aggiorna `RegimeScore` (valore tra -1 e +1)

4. **Aggiungi screenshot (opzionale):**
   - Salva screenshot come `chart-snapshot.png` in questa directory
   - Se presente, verrà usato invece del TradingView LIVE

5. **Apri report:**
   - Vai a `/report/#/mio-report-id`
   - Tutto dovrebbe funzionare!

## 📝 Note

- **Chart Widget:** Se non c'è `chart-snapshot.png`, usa TradingView LIVE
- **Market Context Snapshot:** Se non c'è `f1b.json` o `RegimeScore`, mostra solo gradient band senza marker
- **Header Ticker:** Richiede almeno `Ticker` in `rows[].parts[]`

## 🔗 Riferimenti

Vedi `ESEMPIO-COMPLETO-HEADER-CHART.md` per documentazione completa.

