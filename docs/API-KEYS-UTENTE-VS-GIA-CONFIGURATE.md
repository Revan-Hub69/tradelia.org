# 🔑 API KEYS - COSA DEVI PRENDERE TU vs COSA È GIÀ CONFIGURATO

## 🎯 GUIDA COMPLETA: Quali API key devi prendere e quali sono già disponibili

---

## ✅ **API KEYS GIÀ CONFIGURATE NEL PROGETTO**

### 🟢 **Queste sono già nel codice, devi solo inserire i valori in Vercel:**

#### 1. **FRED_API_KEY** ⭐⭐⭐⭐⭐ **OBBLIGATORIA**
- **Dove**: `.env.example` già presente
- **Cosa fa**: Economic Indicators, Bond Yields, Yield Curve, Credit Spreads, Leading Indicators, Business Cycle, Financial Stress, PMI (USA), DXY, Real Estate
- **Come ottenerla**: 
  - Vai su: https://fred.stlouisfed.org/docs/api/api_key.html
  - Clicca "Request API Key"
  - Inserisci nome, email, scopo (educational/research)
  - Ricevi key via email (immediato, GRATIS)
- **Limite**: 120 calls/min, illimitato giornaliero
- **Status**: ✅ **DA INSERIRE IN VERCEL**

---

#### 2. **FINNHUB_API_KEY** ⭐⭐⭐⭐⭐ **OBBLIGATORIA**
- **Dove**: `.env.example` già presente
- **Cosa fa**: Stock Indexes, Market Breadth, McClellan, TRIN, European/Asian/Emerging Indexes, Stocks Globali, Forex, ETF, VWAP, OBV, A/D, MFI, Chaikin, EOM, Short Interest, IPO Calendar, Corporate Events, Economic Calendar
- **Come ottenerla**:
  - Vai su: https://finnhub.io/register
  - Registrati (email, password)
  - Vai su Dashboard → API Keys
  - Copia la Free API Key (GRATIS)
  - Limite: 60 calls/min
- **Status**: ✅ **DA INSERIRE IN VERCEL**

---

#### 3. **ALPHA_VANTAGE_API_KEY** ⭐⭐⭐⭐ **OBBLIGATORIA**
- **Dove**: `.env.example` già presente
- **Cosa fa**: Commodities (Gold, Oil, Silver), Commodity Rotation
- **Come ottenerla**:
  - Vai su: https://www.alphavantage.co/support/#api-key
  - Inserisci nome, email, scopo
  - Ricevi key via email (immediato, GRATIS)
  - Limite: 5 calls/min, 500 calls/day
- **Status**: ✅ **DA INSERIRE IN VERCEL**

---

#### 4. **GROQ_API_KEY** ⭐⭐⭐⭐⭐ **OBBLIGATORIA**
- **Dove**: `.env.example` già presente
- **Cosa fa**: AI Readings per tutti gli indicatori
- **Come ottenerla**:
  - Vai su: https://console.groq.com/
  - Registrati/Login (Google/GitHub)
  - Vai su API Keys → Create API Key
  - Copia la key (GRATIS)
  - Limite: 30 requests/min
- **Status**: ✅ **DA INSERIRE IN VERCEL**

---

#### 5. **NEXT_PUBLIC_SUPABASE_URL** ⭐⭐⭐⭐⭐ **OBBLIGATORIA**
- **Dove**: Già configurato (Supabase project)
- **Cosa fa**: Database, Auth, Storage
- **Come ottenerla**:
  - Vai su: https://supabase.com/dashboard
  - Seleziona il tuo progetto
  - Vai su Settings → API
  - Copia "Project URL"
- **Status**: ✅ **DA INSERIRE IN VERCEL** (se non già fatto)

---

#### 6. **NEXT_PUBLIC_SUPABASE_ANON_KEY** ⭐⭐⭐⭐⭐ **OBBLIGATORIA**
- **Dove**: Già configurato (Supabase project)
- **Cosa fa**: Database, Auth, Storage (client-side)
- **Come ottenerla**:
  - Vai su: https://supabase.com/dashboard
  - Seleziona il tuo progetto
  - Vai su Settings → API
  - Copia "anon public" key
- **Status**: ✅ **DA INSERIRE IN VERCEL** (se non già fatto)

---

#### 7. **SUPABASE_SERVICE_ROLE_KEY** ⭐⭐⭐⭐⭐ **OBBLIGATORIA**
- **Dove**: Già configurato (Supabase project)
- **Cosa fa**: Database, Auth, Storage (server-side)
- **Come ottenerla**:
  - Vai su: https://supabase.com/dashboard
  - Seleziona il tuo progetto
  - Vai su Settings → API
  - Copia "service_role" key (⚠️ SECRET, non esporre al client!)
- **Status**: ✅ **DA INSERIRE IN VERCEL** (se non già fatto)

---

## 🟡 **API KEYS OPZIONALI (Solo per funzionalità PRO)**

### 8. **TRADING_ECONOMICS_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: Non ancora nel codice (da aggiungere)
- **Cosa fa**: PMI Globale (Europa, Asia, Emergenti)
- **Come ottenerla**:
  - Vai su: https://tradingeconomics.com/api
  - Registrati (FREE tier)
  - Vai su API Keys
  - Copia la key
  - Limite FREE: 2 calls/min
- **Status**: ⚠️ **OPZIONALE** - Solo se vuoi PMI globale (altrimenti solo USA via FRED)

---

### 9. **POLYGON_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: Non ancora nel codice (da aggiungere)
- **Cosa fa**: Options Flow (indicatore PRO)
- **Come ottenerla**:
  - Vai su: https://polygon.io/
  - Registrati (FREE tier)
  - Vai su Dashboard → API Keys
  - Copia la key
  - Limite FREE: 5 calls/min
- **Status**: ⚠️ **OPZIONALE** - Solo se vuoi Options Flow

---

### 10. **IEX_CLOUD_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: Non ancora nel codice (da aggiungere)
- **Cosa fa**: Options Flow (alternativa a Polygon.io)
- **Come ottenerla**:
  - Vai su: https://iexcloud.io/
  - Registrati (FREE tier)
  - Vai su Console → API Tokens
  - Copia la key
  - Limite FREE: 50,000 messages/mese
- **Status**: ⚠️ **OPZIONALE** - Solo se vuoi Options Flow (alternativa a Polygon.io)

---

## 🟢 **API SENZA KEY (Pubbliche, no key richiesta)**

### ✅ **Queste NON richiedono API key:**

1. **CoinGecko** - Crypto data (no key, rate limit generoso)
2. **Binance Public API** - Crypto order book (no key, rate limit generoso)
3. **Coinbase Public API** - Crypto order book (no key, rate limit generoso)
4. **Yahoo Finance** - VIX, Put/Call Ratio (no key, non ufficiale)
5. **Alternative.me** - Fear & Greed Index (no key)
6. **CFTC** - COT Reports (no key, pubblico)
7. **ECB** - European economic data (no key, API pubblica)
8. **Eurostat** - European statistics (no key, API pubblica)
9. **World Bank** - Global economic data (no key, API pubblica)
10. **IMF** - Global economic data (no key, API pubblica)
11. **SEC EDGAR** - IPO data, Insider Trading (no key, parsing complesso)

---

## 📋 **RIEPILOGO COMPLETO**

### ✅ **OBBLIGATORIE** (7 API keys):
1. ✅ **FRED_API_KEY** - Economic data
2. ✅ **FINNHUB_API_KEY** - Stock indexes, forex, stocks, ETFs, calendars
3. ✅ **ALPHA_VANTAGE_API_KEY** - Commodities
4. ✅ **GROQ_API_KEY** - AI readings
5. ✅ **NEXT_PUBLIC_SUPABASE_URL** - Database
6. ✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Database (client)
7. ✅ **SUPABASE_SERVICE_ROLE_KEY** - Database (server)

### ⚠️ **OPZIONALI** (3 API keys):
8. ⚠️ **TRADING_ECONOMICS_API_KEY** - PMI globale (opzionale)
9. ⚠️ **POLYGON_API_KEY** - Options Flow (opzionale)
10. ⚠️ **IEX_CLOUD_API_KEY** - Options Flow alternativa (opzionale)

---

## 🚀 **ISTRUZIONI VERCEL**

### **Come inserire le API keys in Vercel:**

1. Vai su: https://vercel.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi ogni variabile:
   - **Name**: `FRED_API_KEY`
   - **Value**: (incolla la key)
   - **Environment**: Production, Preview, Development (seleziona tutti)
5. Ripeti per tutte le 7 API keys obbligatorie

---

## 📊 **CHECKLIST COMPLETA**

### ✅ **API Keys da Inserire in Vercel:**

- [ ] **FRED_API_KEY** - https://fred.stlouisfed.org/docs/api/api_key.html
- [ ] **FINNHUB_API_KEY** - https://finnhub.io/register
- [ ] **ALPHA_VANTAGE_API_KEY** - https://www.alphavantage.co/support/#api-key
- [ ] **GROQ_API_KEY** - https://console.groq.com/
- [ ] **NEXT_PUBLIC_SUPABASE_URL** - https://supabase.com/dashboard → Settings → API
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY** - https://supabase.com/dashboard → Settings → API
- [ ] **SUPABASE_SERVICE_ROLE_KEY** - https://supabase.com/dashboard → Settings → API

### ⚠️ **API Keys Opzionali (solo se vuoi funzionalità PRO):**

- [ ] **TRADING_ECONOMICS_API_KEY** - https://tradingeconomics.com/api (PMI globale)
- [ ] **POLYGON_API_KEY** - https://polygon.io/ (Options Flow)
- [ ] **IEX_CLOUD_API_KEY** - https://iexcloud.io/ (Options Flow alternativa)

---

## ✅ **CONCLUSIONE**

### **DEVI PRENDERE** (7 obbligatorie):
1. FRED_API_KEY
2. FINNHUB_API_KEY
3. ALPHA_VANTAGE_API_KEY
4. GROQ_API_KEY
5. NEXT_PUBLIC_SUPABASE_URL (se non già fatto)
6. NEXT_PUBLIC_SUPABASE_ANON_KEY (se non già fatto)
7. SUPABASE_SERVICE_ROLE_KEY (se non già fatto)

### **GIÀ NEL CODICE** (non devi fare nulla):
- ✅ Tutte le API pubbliche (CoinGecko, Binance, Coinbase, Yahoo Finance, etc.)
- ✅ Tutte le API governative (CFTC, ECB, Eurostat, World Bank, IMF, SEC)

### **TUTTE GRATIS**:
- ✅ Tutte le 7 API keys obbligatorie sono FREE tier
- ✅ Tutte le 3 API keys opzionali sono FREE tier

**Tempo totale per ottenere tutte le keys: ~15-20 minuti** ⏱️
