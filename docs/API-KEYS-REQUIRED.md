# API Keys Richieste - Guida Completa

## 📋 RIEPILOGO API

### ✅ API PUBBLICHE (Nessuna Key Richiesta)
- ✅ **Binance Public API** - Order book, trades, klines, ticker
- ✅ **OKX Public API** - Order book, ticker
- ✅ **Bybit Public API** - Order book, ticker
- ✅ **CoinGecko Public API** - Market cap, prices, top crypto list

### ⚠️ API CON KEY (Gratuite ma Richiedono Registrazione)
- ⚠️ **Groq AI** - Richiede API key (GRATUITA con limite generoso)

### 💰 API A PAGAMENTO (Opzionali - Sistema Funziona Senza)
- 💰 **Whale Alert** (Opzionale) - Richiede API key a pagamento (sistema usa fallback gratuito)

### 💰 API A PAGAMENTO (Da Implementare Dopo)
- 💰 **Glassnode** - On-chain metrics ($29-799/mese)
- 💰 **CryptoQuant** - Exchange flows ($29-499/mese)
- 💰 **Santiment** - Social sentiment ($49-449/mese)
- 💰 **LunarCrush** - Social sentiment ($49-299/mese)

---

## 🔑 API KEYS RICHIESTE ORA

### 1. **Groq AI API Key** ⚠️ OBBLIGATORIA

**Per cosa**: AI Assistant per analisi intelligente dati

**Come ottenerla**:
1. Vai su https://console.groq.com/
2. Crea account (gratuito)
3. Vai su "API Keys"
4. Crea nuova API key
5. Copia la key

**Costo**: **GRATUITO** (limite generoso: 30 req/min, 14,400 req/giorno)

**Dove aggiungerla**:
```env
GROQ_API_KEY=your_groq_api_key_here
```

**File che la usa**:
- `lib/ai/groq-assistant.ts`
- `app/api/ai/analyze/route.ts`

**Cosa succede senza**: AI Assistant non funziona, resto del sistema OK al 100%

---

### 2. **Whale Alert API Key** 💰 OPZIONALE (A PAGAMENTO)

**Per cosa**: Whale tracking accurato (grandi transazioni)

**Come ottenerla**:
1. Vai su https://whale-alert.io/
2. Crea account
3. Sottoscrivi piano a pagamento
4. Vai su "API Keys"
5. Copia la key

**Costo**: **A PAGAMENTO** (piani da $29/mese)

**Dove aggiungerla**:
```env
WHALE_ALERT_API_KEY=your_whale_alert_api_key_here
```

**File che la usa**:
- `lib/crypto/whale-tracker.ts`

**Cosa succede senza**: ✅ Sistema usa fallback gratuito (calcola da Binance trades), funziona perfettamente

---

## ✅ API PUBBLICHE (Nessuna Key)

### 1. **Binance Public API** ✅

**URL Base**: `https://api.binance.com/api/v3/`

**Endpoints usati**:
- `/ticker/price` - Prezzo corrente
- `/klines` - Candlestick data
- `/depth` - Order book
- `/trades` - Recent trades
- `/ticker/24hr` - 24h statistics

**Rate Limit**: 1200 req/min (pubblico)

**Costo**: **GRATUITO**

**File che la usa**:
- `lib/price-apis/binance-futures.ts`
- `lib/price-apis/binance.ts`
- `app/api/crypto/*` (varie route)

---

### 2. **Binance Futures API** ✅

**URL Base**: `https://fapi.binance.com/fapi/v1/`

**Endpoints usati**:
- `/premiumIndex` - Funding rate
- `/openInterest` - Open interest
- `/globalLongShortAccountRatio` - Long/Short ratio
- `/liquidationOrders` - Liquidations

**Rate Limit**: 1200 req/min (pubblico)

**Costo**: **GRATUITO**

**File che la usa**:
- `lib/price-apis/binance-futures.ts`

---

### 3. **OKX Public API** ✅

**URL Base**: `https://www.okx.com/api/v5/`

**Endpoints usati**:
- `/market/books` - Order book
- `/public/funding-rate` - Funding rate
- `/public/open-interest` - Open interest
- `/account/v3/position` - Long/Short ratio (pubblico)

**Rate Limit**: 20 req/2s (pubblico)

**Costo**: **GRATUITO**

**File che la usa**:
- `lib/price-apis/okx-futures.ts`

---

### 4. **Bybit Public API** ✅

**URL Base**: `https://api.bybit.com/v5/`

**Endpoints usati**:
- `/market/orderbook` - Order book
- `/market/tickers` - Ticker data
- `/market/funding/history` - Funding rate
- `/market/open-interest` - Open interest

**Rate Limit**: 120 req/min (pubblico)

**Costo**: **GRATUITO**

**File che la usa**:
- `lib/price-apis/bybit-futures.ts`

---

### 5. **CoinGecko Public API** ✅

**URL Base**: `https://api.coingecko.com/api/v3/`

**Endpoints usati**:
- `/coins/markets` - Market cap, prices
- `/coins/list` - Lista crypto
- `/simple/price` - Prezzi semplici

**Rate Limit**: 10-50 req/min (pubblico, generoso)

**Costo**: **GRATUITO**

**File che la usa**:
- `lib/crypto/top-crypto-list.ts`
- `app/api/crypto/market-cap/route.ts`

---

## 💰 API A PAGAMENTO (Da Implementare Dopo)

### 1. **Glassnode** 💰

**Costo**: $29-799/mese
**Tier Consigliato**: Professional ($99/mese)

**Metriche**:
- Active addresses
- MVRV ratio
- NVT ratio
- Exchange reserves
- Whale wallet tracking

**Quando**: Dopo sistema gratuito stabile

---

### 2. **CryptoQuant** 💰

**Costo**: $29-499/mese
**Tier Consigliato**: Professional ($99/mese)

**Metriche**:
- Exchange flows (accurate)
- Exchange reserves
- On-chain metrics

**Quando**: Dopo Glassnode

---

### 3. **Santiment** 💰

**Costo**: $49-449/mese
**Tier Consigliato**: Professional ($149/mese)

**Metriche**:
- Social sentiment
- Developer activity
- On-chain + sentiment

**Quando**: Dopo on-chain metrics

---

### 4. **LunarCrush** 💰

**Costo**: $49-299/mese
**Tier Consigliato**: Professional ($99/mese)

**Metriche**:
- Twitter sentiment
- Reddit sentiment
- News sentiment
- Social volume

**Quando**: Dopo Santiment

---

## 📝 SETUP ENVIRONMENT VARIABLES

### File `.env.local` (Crea se non esiste)

```env
# ============================================
# API KEYS OBBLIGATORIE
# ============================================

# Groq AI (GRATUITO - Richiede registrazione)
# Ottieni da: https://console.groq.com/
GROQ_API_KEY=your_groq_api_key_here

# ============================================
# API KEYS OPZIONALI (A PAGAMENTO)
# ============================================

# Whale Alert (A PAGAMENTO - $29+/mese)
# Ottieni da: https://whale-alert.io/
# Costo: $29+/mese (piano ALERTS)
# Nota: Sistema funziona perfettamente senza (usa fallback gratuito da Binance trades)
# WHALE_ALERT_API_KEY=your_whale_alert_api_key_here

# ============================================
# API A PAGAMENTO (Da aggiungere dopo)
# ============================================

# Glassnode (A PAGAMENTO - $99/mese)
# GLASSNODE_API_KEY=your_glassnode_api_key_here

# CryptoQuant (A PAGAMENTO - $99/mese)
# CRYPTOQUANT_API_KEY=your_cryptoquant_api_key_here

# Santiment (A PAGAMENTO - $149/mese)
# SANTIMENT_API_KEY=your_santiment_api_key_here

# LunarCrush (A PAGAMENTO - $99/mese)
# LUNARCRUSH_API_KEY=your_lunarcrush_api_key_here
```

---

## ✅ CHECKLIST SETUP

### CONSIGLIATO (Sistema funziona ma senza AI)
- [ ] **Groq API Key** - Ottieni da https://console.groq.com/
  - Aggiungi a `.env.local`: `GROQ_API_KEY=...`
  - **Costo**: GRATUITO
  - **Tempo**: 2 minuti
  - **Nota**: Sistema funziona al 100% anche senza (solo AI Assistant non disponibile)

### OPZIONALE (A PAGAMENTO - Sistema funziona senza)
- [ ] **Whale Alert API Key** - Ottieni da https://whale-alert.io/
  - Aggiungi a `.env.local`: `WHALE_ALERT_API_KEY=...`
  - **Costo**: $29+/mese (a pagamento)
  - **Tempo**: 5 minuti (registrazione + pagamento)
  - **Nota**: ✅ Sistema funziona perfettamente senza (usa fallback gratuito da Binance trades)

### DA IMPLEMENTARE DOPO (A Pagamento)
- [ ] Glassnode API Key ($99/mese)
- [ ] CryptoQuant API Key ($99/mese)
- [ ] Santiment API Key ($149/mese)
- [ ] LunarCrush API Key ($99/mese)

---

## 🎯 RACCOMANDAZIONE

### Setup Minimo (Sistema Funzionante)
1. ✅ **Nessuna API key** - Sistema funziona al 100% con API pubbliche
2. ⚠️ **Groq API Key** - Aggiungi per AI Assistant (GRATUITO, 2 minuti)

### Setup Completo (Sistema Ottimale)
1. ✅ **Groq API Key** - AI Assistant (GRATUITO)
2. 💰 **Whale Alert API Key** - Whale tracking accurato (A PAGAMENTO, opzionale - sistema funziona senza)

### Setup Premium (Dopo)
1. 💰 **Glassnode** - On-chain metrics ($99/mese)
2. 💰 **CryptoQuant** - Exchange flows ($99/mese)
3. 💰 **Santiment/LunarCrush** - Social sentiment ($99-149/mese)

---

## 📊 COSTI TOTALI

### Setup Minimo
- **Costo**: $0/mese
- **API Keys**: 0 (tutto pubblico)

### Setup Completo (Gratuito)
- **Costo**: $0/mese
- **API Keys**: 1 (Groq consigliato, gratuito)

### Setup Premium (A Pagamento)
- **Costo**: $277-475/mese
- **API Keys**: 5-6 (Groq gratuito + Whale Alert + 3-4 a pagamento)

---

## ✅ CONCLUSIONE

**Per far funzionare il sistema ORA**:
- ✅ **Nessuna API key richiesta** - Tutto pubblico
- ⚠️ **Groq API Key consigliata** - Per AI Assistant (GRATUITO)

**Per sistema ottimale**:
- ✅ **Nessuna API key aggiuntiva** - Sistema già completo con fallback gratuito

**Per sistema premium** (dopo):
- 💰 **Whale Alert** - Whale tracking accurato ($29+/mese, opzionale)
- 💰 **API a pagamento** - On-chain, sentiment, etc. ($248-446/mese)

---

**Versione**: 2.5.0
**Status**: ✅ Sistema funziona con API pubbliche
**API Keys Richieste**: 0 (obbligatorie), 1 (consigliata - Groq gratuito)
**Costo**: $0/mese (setup minimo)
**Whale Alert**: 💰 A pagamento ($29+/mese) - Opzionale, sistema funziona senza

