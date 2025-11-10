# 📊 Esempio Report senza Screenshot Chart

Questa directory contiene un esempio completo di report **senza screenshot chart** (usa TradingView LIVE).

## 📁 File Inclusi

- `header.json` - Header Ticker completo con Ticker MSFT e timestamp
- `f1b.json` - Market Context Snapshot con RegimeScore
- `README.md` - Questo file
- `CHART-SCREENSHOT-INFO.txt` - Informazioni sul comportamento senza screenshot

## 🎯 Comportamento Chart Widget

**Questo esempio mostra TradingView LIVE widget** perché:
- ❌ `chart-snapshot.png` **NON ESISTE** nella directory
- ✅ Il sistema rileva automaticamente l'assenza dello screenshot
- ✅ Fallback automatico a TradingView LIVE widget
- ✅ Sottotitolo: "Chart live - Report generato il [data/ora] | Dati in tempo reale"
- ✅ Dati aggiornati in tempo reale

## 🚀 Come Usare

1. **Visualizza il report di esempio:**
   ```bash
   # Apri nel browser
   /report/#/example-without-screenshot
   ```

2. **Copia questa directory per creare un nuovo report:**
   ```bash
   cp -r report/reports/example-without-screenshot report/reports/mio-report-id
   ```

3. **Modifica header.json:**
   - Cambia `Ticker` da "MSFT" al tuo ticker
   - Aggiorna `CompanyName`, `Sector`, `Price`, etc.

4. **Modifica f1b.json (opzionale):**
   - Aggiorna `StrategyMode_macro`
   - Aggiorna `RegimeScore` (valore tra -1 e +1)

5. **Aggiungi screenshot (opzionale):**
   - Se vuoi usare screenshot invece di LIVE, salva come `chart-snapshot.png`
   - Il sistema userà automaticamente lo screenshot se presente

## 📊 Chart Widget - TradingView LIVE

- **Timeframe:** 1D (1 giorno) - configurabile nel widget
- **Dati:** In tempo reale da TradingView
- **Ticker:** MSFT.NASDAQ (Microsoft Corporation)
- **Timestamp:** Report generato il [data/ora] | Dati in tempo reale

Il chart widget mostra automaticamente:
- ✅ TradingView LIVE widget (perché `chart-snapshot.png` non è presente)
- ✅ Dati aggiornati in tempo reale
- ✅ Sottotitolo con timestamp del report

## 📝 Note

- **Chart Widget:** Mostra TradingView LIVE perché `chart-snapshot.png` non è presente
- **Market Context Snapshot:** Mostra gradient band con marker verde (RegimeScore +0.45 = risk-on moderato)
- **Header Ticker:** Mostra informazioni su MSFT (Microsoft Corporation)

## 🔄 Come Passare a Screenshot

Se vuoi usare screenshot invece di TradingView LIVE:

1. Salva screenshot come `chart-snapshot.png` in questa directory
2. Il sistema rileva automaticamente lo screenshot
3. Il chart widget passerà da TradingView LIVE a screenshot statico

## 🔗 Riferimenti

Vedi `ESEMPIO-COMPLETO-HEADER-CHART.md` per documentazione completa.

