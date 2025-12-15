# Variabili d'Ambiente Necessarie

## 🔑 API Keys Richieste

### 1. FRED_API_KEY (Federal Reserve) ⭐⭐⭐⭐⭐

**Obbligatorio per**: Economic Indicators, Bond Yields
**Come ottenerla**:

1. Vai su: https://fred.stlouisfed.org/docs/api/api_key.html
2. Clicca "Request API Key"
3. Compila il form (gratis, no credit card)
4. Riceverai la key via email
5. Aggiungi al `.env` o variabili d'ambiente Render/Vercel

**Esempio**:

```bash
FRED_API_KEY=your_fred_api_key_here
```

**Rate Limit**: Illimitato (gratis)

---

### 2. FINNHUB_API_KEY ⭐⭐⭐⭐

**Obbligatorio per**: Stock Market Indexes, Forex Major Pairs
**Come ottenerla**:

1. Vai su: https://finnhub.io/register
2. Crea account gratuito
3. Vai su Dashboard → API Key
4. Copia la key
5. Aggiungi al `.env` o variabili d'ambiente Render/Vercel

**Esempio**:

```bash
FINNHUB_API_KEY=your_finnhub_api_key_here
```

**Rate Limit**: 60 calls/min (free tier)

---

### 3. ALPHA_VANTAGE_API_KEY ⭐⭐⭐⭐

**Obbligatorio per**: Commodities (Gold, Oil, Silver)
**Come ottenerla**:

1. Vai su: https://www.alphavantage.co/support/#api-key
2. Compila il form (gratis, no credit card)
3. Riceverai la key via email immediatamente
4. Aggiungi al `.env` o variabili d'ambiente Render/Vercel

**Esempio**:

```bash
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```

**Rate Limit**: 5 calls/min, 500 calls/day (free tier)

---

### 4. GROQ_API_KEY ⭐⭐⭐⭐⭐

**Obbligatorio per**: Lettura AI di tutti gli indicatori
**Come ottenerla**:

1. Vai su: https://console.groq.com/
2. Crea account (gratis)
3. Vai su API Keys
4. Crea nuova key
5. Aggiungi al `.env` o variabili d'ambiente Render/Vercel

**Esempio**:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

**Rate Limit**: Generoso (free tier)

---

## ✅ API Senza Key (Già Funzionanti)

### CoinGecko

- **Usato per**: Bitcoin Dominance, Total Crypto Market Cap
- **Key richiesta**: ❌ NO
- **Status**: ✅ Funziona già

### Alternative.me

- **Usato per**: Fear & Greed Crypto
- **Key richiesta**: ❌ NO
- **Status**: ✅ Funziona già

### Yahoo Finance

- **Usato per**: VIX
- **Key richiesta**: ❌ NO
- **Status**: ✅ Funziona già (ma non ufficiale)

---

## 📋 Checklist Configurazione

### Variabili Obbligatorie (per tutti gli indicatori):

- [ ] `FRED_API_KEY` - Per Economic Indicators e Bond Yields
- [ ] `FINNHUB_API_KEY` - Per Stock Indexes e Forex
- [ ] `ALPHA_VANTAGE_API_KEY` - Per Commodities
- [ ] `GROQ_API_KEY` - Per lettura AI (tutti gli indicatori)

### Variabili Opzionali:

- Nessuna (tutte le altre API non richiedono key)

---

## 🔧 Come Configurare

### Opzione 1: File `.env.local` (Sviluppo Locale)

Crea file `.env.local` nella root del progetto:

```bash
FRED_API_KEY=your_key_here
FINNHUB_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### Opzione 2: Render/Vercel (Produzione)

1. Vai su Dashboard del tuo servizio
2. Settings → Environment Variables
3. Aggiungi tutte le variabili sopra
4. Redeploy

---

## 📊 Indicatori per API Key

### Con FRED_API_KEY:

- ✅ Economic Indicators (GDP, CPI, Unemployment, Fed Rate)
- ✅ Bond Yields + Yield Curve

### Con FINNHUB_API_KEY:

- ✅ Stock Market Indexes (S&P 500, Dow, NASDAQ)
- ✅ Forex Major Pairs (EUR/USD, GBP/USD, USD/JPY, USD/CHF)

### Con ALPHA_VANTAGE_API_KEY:

- ✅ Commodities (Gold, Oil, Silver)

### Con GROQ_API_KEY:

- ✅ Lettura AI per TUTTI gli indicatori

### Senza Key (già funzionanti):

- ✅ Bitcoin Dominance
- ✅ Total Crypto Market Cap
- ✅ Fear & Greed Crypto
- ✅ VIX

---

## ⚠️ Note Importanti

1. **Tutte le API keys sono GRATIS** - nessun costo
2. **Rate Limits**:
   - FRED: Illimitato
   - Finnhub: 60 calls/min (sufficiente)
   - Alpha Vantage: 5 calls/min (sufficiente con delays)
   - Groq: Generoso (sufficiente)
3. **Sicurezza**:
   - NON committare `.env.local` nel git
   - Usa variabili d'ambiente su Render/Vercel
   - Le keys sono sensibili, proteggile

---

## 🚀 Dopo la Configurazione

Una volta aggiunte tutte le variabili:

1. Gli indicatori funzioneranno automaticamente
2. Se una key manca, l'indicatore mostrerà "Coming soon" con istruzioni
3. Le letture AI funzioneranno solo con `GROQ_API_KEY`

---

## 📝 Template `.env.local`

```bash
# FRED API (Federal Reserve) - Economic Indicators, Bond Yields
FRED_API_KEY=your_fred_key_here

# Finnhub API - Stock Indexes, Forex
FINNHUB_API_KEY=your_finnhub_key_here

# Alpha Vantage API - Commodities
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Groq API - AI Readings (tutti gli indicatori)
GROQ_API_KEY=your_groq_key_here
```
