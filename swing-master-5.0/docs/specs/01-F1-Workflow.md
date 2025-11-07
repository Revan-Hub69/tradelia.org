# F1 — Workflow Input/Output Revisionato

## 🔍 Cosa può essere cercato automaticamente (Web Search / GPT-5)

### ✅ Dati facilmente disponibili via web search

1. **VIX**
   - CBOE VIX Index
   - Variazione 7 giorni
   - Source: CBOE, Yahoo Finance, Investing.com

2. **Treasury Curve**
   - UST 2Y, 10Y, 30Y yields
   - Spread 2s10s
   - Source: FRED, Treasury.gov, Trading Economics

3. **Credit OAS**
   - Investment Grade OAS
   - High Yield OAS (se disponibile)
   - Source: FRED, Bloomberg Terminal (se accessibile), Trading Economics

4. **FX Majors**
   - DXY (Dollar Index)
   - EUR/USD, USD/JPY (se necessario)
   - Variazione 1W
   - Source: TradingView, Yahoo Finance, Investing.com

5. **Commodities**
   - WTI Crude Oil (futures)
   - Gold (spot)
   - Variazione 1W
   - Source: Investing.com, Trading Economics, Yahoo Finance

6. **Headlines macro**
   - Bloomberg/Reuters headlines recenti (T-1)
   - Sell-side notes (se pubblicamente disponibili)
   - Source: Bloomberg.com, Reuters.com, Financial Times

7. **Calendario economico**
   - Eventi macro imminenti (Fed, CPI, Jobs Report, ecc.)
   - Source: Investing.com, Forex Factory, Trading Economics

---

## 📸 Cosa deve essere fornito dall'utente (Screenshot / GPT-5 / Manuale)

### 🔴 Input richiesti dall'utente (Opzione A: Manuale)

1. **Performance Settori 1D/1W/1M**
   - Screenshot da Finviz Premium (Sector Performance)
   - Oppure output strutturato da GPT-5 che legge Finviz
   - Formato: `{"Technology": 0.08, "Energy": -0.02, ...}`

2. **Size Buckets Performance**
   - MegaCap, Large, Mid, Small, Micro performance
   - Screenshot o dati da ETF/size-specific indices
   - Oppure da GPT-5 che analizza indici size-specific

3. **Futures Board**
   - Movimenti futures principali (S&P, NASDAQ, Russell, ecc.)
   - Screenshot o dati da piattaforma futures
   - Oppure da GPT-5 che legge futures data

4. **Market Internals (opzionale ma utile)**
   - Advance/Decline ratio
   - New Highs/New Lows
   - VIX term structure (se non disponibile via web)

5. **Sell-Side Notes specifiche**
   - Se l'utente ha accesso a report sell-side non pubblici
   - Oppure GPT-5 può cercare report pubblici

---

## ✅ RACCOMANDATO: Opzione B - ETF Proxy (Completamente Automatico)

### 🎯 Soluzione Ottimizzata: Usa ETF come Proxy

**Vantaggi:**
- ✅ Nessuna dipendenza da fonti a pagamento
- ✅ Completamente automatizzabile
- ✅ Dati ufficiali e pubblici
- ✅ Nessun intervento manuale necessario

**Limitazioni:**
- ⚠️ ETF non sono perfetti proxy (pesi diversi, fees)
- ⚠️ Performance leggermente diversa da settori puri
- ✅ **Ma funzionale per uso swing 3-10 giorni**

### Mapping ETF → Settori

| Settore GICS | ETF Proxy | Ticker |
|--------------|-----------|--------|
| Technology | Technology Select Sector SPDR | XLK |
| Communication Services | Communication Services Select Sector SPDR | XLC |
| Consumer Discretionary | Consumer Discretionary Select Sector SPDR | XLY |
| Consumer Staples | Consumer Staples Select Sector SPDR | XLP |
| Energy | Energy Select Sector SPDR | XLE |
| Financials | Financial Select Sector SPDR | XLF |
| Healthcare | Health Care Select Sector SPDR | XLV |
| Industrials | Industrial Select Sector SPDR | XLI |
| Materials | Materials Select Sector SPDR | XLB |
| Real Estate | Real Estate Select Sector SPDR | XLRE |
| Utilities | Utilities Select Sector SPDR | XLU |

### Mapping ETF → Size Buckets

| Size Bucket | ETF Proxy | Ticker |
|-------------|-----------|--------|
| MegaCap | S&P 500 ETF | SPY |
| Large | NASDAQ-100 ETF | QQQ |
| Mid | Mid-Cap ETF | MDY |
| Small | Russell 2000 ETF | IWM |
| Micro | Micro-Cap ETF | IWC |

**Note**: Performance ETF può essere estratta automaticamente via Yahoo Finance API gratuita.

---

## 🤖 Workflow Proposto

### Opzione A: Automatico (Web Search)

```
1. Web Search → VIX, Treasury, Credit, FX, Commodities, Headlines
2. Utente → Screenshot/Dati settori, size buckets, futures
3. Processor → Calcola metriche F1B
4. Output → JSON completo
```

### Opzione B: GPT-5 Assisted

```
1. Utente → "GPT-5, vai su Finviz e dimmi performance settori 1M"
2. GPT-5 → Estrae dati strutturati
3. Web Search → Complementa con dati macro (VIX, Treasury, ecc.)
4. Processor → Calcola metriche F1B
5. Output → JSON completo
```

### Opzione C: Ibrido (Alternativa)

```
1. Web Search Automatico → VIX, Treasury, Credit, FX, Commodities
2. GPT-5 → Estrae dati settori/size da Finviz (screenshot o web)
3. Utente → Fornisce screenshot/calendario economico se necessario
4. Processor → Calcola metriche F1B
5. Output → JSON completo
```

### Opzione D: ETF Proxy Completo (⭐ RACCOMANDATO)

```
1. Web Search Automatico → VIX, Treasury, Credit, FX, Commodities
2. Yahoo Finance API → Performance ETF settoriali (XLK, XLC, XLY, ecc.)
3. Yahoo Finance API → Performance ETF size (SPY, QQQ, IWM, IWC)
4. Processor → Calcola metriche F1B usando ETF come proxy
5. Output → JSON completo
```

**Vantaggi Opzione D:**
- ✅ Completamente automatizzato
- ✅ Nessuna dipendenza manuale
- ✅ Dati ufficiali e pubblici
- ✅ Nessun costo

---

## 📊 Checklist Input per F1B

### Automatico (Web Search)
- [ ] VIX level e variazione 7d
- [ ] UST 2Y, 10Y yields
- [ ] Credit OAS (IG)
- [ ] DXY e FX majors
- [ ] Oil WTI, Gold (variazione 1W)
- [ ] Headlines Bloomberg/Reuters (T-1)
- [ ] Calendario economico (eventi imminenti)

### Richiesto (Opzione A: Manuale/GPT-5)
- [ ] Performance settori 1D/1W/1M (Finviz)
- [ ] Size buckets performance (Mega/Large/Mid/Small/Micro)
- [ ] Futures board (S&P, NASDAQ, Russell)
- [ ] Market internals (opzionale)

### Automatico (Opzione B: ETF Proxy - ⭐ RACCOMANDATO)
- [ ] Performance settori → ETF settoriali SPDR (XLK, XLC, XLY, ecc.) via Yahoo Finance API
- [ ] Size buckets → ETF size (SPY, QQQ, IWM, IWC) via Yahoo Finance API
- [ ] Futures board → Yahoo Finance API (opzionale, già disponibile automaticamente)

---

## 🎯 Priorità

### Critici (senza questi F1B non funziona)
1. VIX
2. Treasury curve (2Y, 10Y)
3. Performance settori 1M
4. Size buckets

### Importanti (dovrebbero essere presenti)
5. Credit OAS
6. Oil/Gold 1W
7. FX regime
8. Headlines T-1

### Opzionali (nice to have)
9. Market internals dettagliati
10. Sell-side notes specifiche

---

## 💡 Raccomandazioni

1. **Usa GPT-5 per estrarre dati da Finviz** - Può leggere screenshot o navigare web per settori/size
2. **Web search per dati macro** - VIX, Treasury, Commodities sono facilmente disponibili
3. **Screenshot come backup** - Se GPT-5 fallisce, l'utente può fornire screenshot
4. **Validazione dati** - Controllare che tutti i dati critici siano presenti prima di processare

