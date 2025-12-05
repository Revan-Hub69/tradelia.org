# Analisi API Pubbliche/Free Tier Disponibili

## ✅ API Attualmente Usate (Solide)

### 1. CoinGecko (Crypto)

- **Status**: ✅ Già implementato
- **Free Tier**: 50 calls/min, no API key required
- **Uso**: Top 400 crypto, prezzi, market cap
- **Solidità**: ⭐⭐⭐⭐⭐ Molto stabile, API pubblica ufficiale

### 2. Alternative.me (Crypto Fear & Greed)

- **Status**: ✅ Già implementato
- **Free Tier**: No rate limit documentato, no API key
- **Uso**: Fear & Greed Index per crypto
- **Solidità**: ⭐⭐⭐⭐⭐ API pubblica stabile

### 3. Yahoo Finance (via yahoo-finance2 package)

- **Status**: ⚠️ Già nel package.json, usato per VIX
- **Free Tier**: No limit, no API key
- **Uso**: VIX, prezzi stock, dati di mercato
- **Solidità**: ⭐⭐⭐⭐ Non ufficiale ma ampiamente usato e stabile
- **Nota**: Package `yahoo-finance2` è più affidabile del fetch diretto

## 🔍 API Free Tier Disponibili (Non Ancora Usate)

### 4. Alpha Vantage

- **Free Tier**: 5 calls/min, 500 calls/day, API key richiesta (gratis)
- **Cosa offre**:
  - Stock prices (real-time & historical)
  - VIX data
  - Economic indicators
  - Forex
  - Crypto
- **Solidità**: ⭐⭐⭐⭐ API ufficiale, limiti chiari
- **Link**: https://www.alphavantage.co/support/#api-key

### 5. FRED (Federal Reserve Economic Data)

- **Free Tier**: Illimitato, API key richiesta (gratis)
- **Cosa offre**:
  - Economic indicators (GDP, inflation, unemployment, etc.)
  - Interest rates
  - Dati storici completi
- **Solidità**: ⭐⭐⭐⭐⭐ API ufficiale governativa, molto stabile
- **Link**: https://fred.stlouisfed.org/docs/api/api_key.html

### 6. Finnhub

- **Free Tier**: 60 calls/min, API key richiesta (gratis)
- **Cosa offre**:
  - Stock prices (real-time & historical)
  - Forex
  - Crypto
  - Economic indicators
  - News
- **Solidità**: ⭐⭐⭐⭐ API ufficiale, buoni limiti
- **Link**: https://finnhub.io/register

### 7. Polygon.io

- **Free Tier**: 5 calls/min, API key richiesta (gratis)
- **Cosa offre**:
  - Stock prices (real-time & historical)
  - Options data
  - Market data
- **Solidità**: ⭐⭐⭐⭐ API ufficiale, limiti stretti
- **Link**: https://polygon.io/pricing

## 📊 Cosa Possiamo Implementare SUBITO (Solido)

### Indicatori Attuali - Status

1. **Fear & Greed Crypto** ✅
   - API: Alternative.me
   - Status: Funziona perfettamente

2. **VIX** ⚠️
   - API: Yahoo Finance (non ufficiale)
   - Status: Funziona ma non ufficiale
   - **Alternativa solida**: Alpha Vantage (free tier) - ha VIX

3. **Term Structure** ❌
   - API: Nessuna (dati mock)
   - Status: Non funziona
   - **Problema**: Futures richiedono API a pagamento (CME Group)
   - **Soluzione**: Rimuovere o usare dati spot/futures da Yahoo Finance (non ideale)

### Indicatori Aggiuntivi Possibili (Solido)

1. **Economic Indicators** (FRED)
   - GDP, Inflation, Unemployment
   - Interest Rates (Fed Funds Rate)
   - Molto solido, API governativa

2. **Stock Market Indicators** (Alpha Vantage o Finnhub)
   - S&P 500, Dow Jones, NASDAQ
   - Real-time prices
   - Historical data

3. **Forex** (Finnhub o Alpha Vantage)
   - Major pairs (EUR/USD, GBP/USD, etc.)
   - Real-time rates

4. **VIX Alternativo** (Alpha Vantage)
   - API ufficiale invece di Yahoo Finance
   - Limiti: 5 calls/min (ok per aggiornamenti ogni 5 minuti)

## 🎯 Raccomandazioni Immediate

### Priorità Alta (Solido, Free, Subito)

1. **Sostituire VIX con Alpha Vantage**
   - API ufficiale
   - Free tier sufficiente (5 calls/min = 1 ogni 12 secondi)
   - Più solido di Yahoo Finance

2. **Aggiungere Economic Indicators (FRED)**
   - API governativa, molto solida
   - Dati economici importanti
   - No rate limits pratici

3. **Aggiungere Stock Market Indexes (Alpha Vantage o Finnhub)**
   - S&P 500, Dow, NASDAQ
   - Real-time data
   - Utile per dashboard

### Priorità Media

4. **Term Structure**: Rimuovere o sostituire con indicatore alternativo
   - Futures richiedono API a pagamento
   - Meglio rimuovere se non possiamo farlo solido

5. **Forex Indicators** (Finnhub)
   - 60 calls/min è buono
   - Major pairs utili

### Da Evitare

- Scraping diretto (CNN, etc.)
- Dati mock
- API non documentate

## 📝 Piano di Implementazione

1. **Alpha Vantage VIX** (sostituisce Yahoo Finance)
2. **FRED Economic Indicators** (nuovo, molto solido)
3. **Stock Market Indexes** (Alpha Vantage o Finnhub)
4. **Rimuovere Term Structure** (o sostituire con alternativa solida)
