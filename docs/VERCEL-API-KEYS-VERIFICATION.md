# Verifica API Keys per Vercel e Fee Tier Analysis

## 📋 Riepilogo API Keys Necessarie

### ✅ API Keys OBBLIGATORIE per gli Indicatori

#### 1. **FRED_API_KEY** ⭐⭐⭐⭐⭐
- **Utilizzo**: Economic Indicators, Bond Yields, Yield Curve
- **Provider**: Federal Reserve Economic Data (FRED)
- **Ottieni qui**: https://fred.stlouisfed.org/docs/api/api_key.html
- **Costo**: GRATIS
- **Rate Limit**: ILLIMITATO (free tier)
- **Indicatori che la usano**:
  - `/api/market-indicators/economic` (4 chiamate per indicatore)
  - `/api/market-indicators/bond-yields` (2 chiamate)
  - `/api/market-indicators/yield-curve` (8 chiamate per tutte le scadenze)
- **Totale chiamate per refresh completo**: ~14 chiamate
- **Frequenza refresh**: Ogni 1 ora (cache: 3600s)
- **✅ RIENTRA NEL FEE TIER**: Sì, illimitato

#### 2. **FINNHUB_API_KEY** ⭐⭐⭐⭐
- **Utilizzo**: Stock Indexes, Forex Major Pairs
- **Provider**: Finnhub
- **Ottieni qui**: https://finnhub.io/register
- **Costo**: GRATIS
- **Rate Limit**: 60 calls/minuto (free tier)
- **Indicatori che la usano**:
  - `/api/market-indicators/stock-indexes` (3 chiamate: S&P 500, Dow, NASDAQ)
  - `/api/market-indicators/forex` (4 chiamate: EUR/USD, GBP/USD, USD/JPY, USD/CHF)
- **Totale chiamate per refresh completo**: 7 chiamate
- **Frequenza refresh**: Ogni 5 minuti (cache: 300s)
- **Calcolo utilizzo**:
  - Refresh ogni 5 minuti = 12 refresh/ora
  - 7 chiamate × 12 = 84 chiamate/ora
  - 84 chiamate/ora × 24 = 2,016 chiamate/giorno
  - **✅ RIENTRA NEL FEE TIER**: Sì, 2,016 < 3,600 (60/min × 60 min)

#### 3. **ALPHA_VANTAGE_API_KEY** ⭐⭐⭐⭐
- **Utilizzo**: Commodities (Gold, Oil, Silver)
- **Provider**: Alpha Vantage
- **Ottieni qui**: https://www.alphavantage.co/support/#api-key
- **Costo**: GRATIS
- **Rate Limit**: 5 calls/minuto, 500 calls/giorno (free tier)
- **Indicatori che la usano**:
  - `/api/market-indicators/commodities` (3 chiamate sequenziali con delay di 12 secondi)
- **Totale chiamate per refresh completo**: 3 chiamate
- **Frequenza refresh**: Ogni 5 minuti (cache: 300s)
- **Calcolo utilizzo**:
  - Refresh ogni 5 minuti = 12 refresh/ora
  - 3 chiamate × 12 = 36 chiamate/ora
  - 36 chiamate/ora × 24 = 864 chiamate/giorno
  - **⚠️ PROBLEMA**: 864 > 500 (limite giornaliero)
  - **✅ SOLUZIONE**: Aumentare cache a 10 minuti → 6 refresh/ora → 432 chiamate/giorno ✅

#### 4. **GROQ_API_KEY** ⭐⭐⭐⭐⭐
- **Utilizzo**: AI Readings per TUTTI gli indicatori
- **Provider**: Groq
- **Ottieni qui**: https://console.groq.com/
- **Costo**: GRATIS
- **Rate Limit**: Generoso (free tier: ~30 RPM, 14.4k TPM)
- **Indicatori che la usano**:
  - Tutti gli indicatori (1 chiamata per indicatore per refresh)
- **Totale chiamate per refresh completo**: ~13 chiamate (tutti gli indicatori)
- **Frequenza refresh**: Ogni 5 minuti (cache: 300s)
- **Calcolo utilizzo**:
  - Refresh ogni 5 minuti = 12 refresh/ora
  - 13 chiamate × 12 = 156 chiamate/ora
  - 156 chiamate/ora × 24 = 3,744 chiamate/giorno
  - **✅ RIENTRA NEL FEE TIER**: Sì, 3,744 < 14,400 TPM (tokens per minuto)

---

### ✅ API Keys OPCZIONALI (non necessarie per gli indicatori base)

#### 5. **GLASSNODE_API_KEY** (Opzionale)
- **Utilizzo**: Exchange Flows (crypto)
- **Provider**: Glassnode
- **Costo**: GRATIS (free tier: 1 call/sec)
- **Rate Limit**: 1 call/secondo (free tier)
- **Status**: Opzionale, ha fallback a mock data
- **✅ RIENTRA NEL FEE TIER**: Sì, se usato con moderazione

#### 6. **SANTIMENT_API_KEY** (Opzionale)
- **Utilizzo**: Social Sentiment (crypto)
- **Provider**: Santiment
- **Costo**: GRATIS (free tier: 100 calls/day)
- **Rate Limit**: 100 chiamate/giorno (free tier)
- **Status**: Opzionale, ha fallback a Reddit
- **⚠️ ATTENZIONE**: Limite molto basso (100/giorno)

#### 7. **WHALE_ALERT_API_KEY** (Opzionale)
- **Utilizzo**: Whale Analysis (crypto)
- **Provider**: Whale Alert
- **Costo**: GRATIS (free tier: 100 calls/day)
- **Rate Limit**: 100 chiamate/giorno (free tier)
- **Status**: Opzionale, ha fallback a mock data
- **⚠️ ATTENZIONE**: Limite molto basso (100/giorno)

---

### ✅ API SENZA KEY (già funzionanti)

#### CoinGecko
- **Utilizzo**: Bitcoin Dominance, Crypto Market Cap
- **Key richiesta**: ❌ NO
- **Rate Limit**: 50 calls/minuto (free tier)
- **Status**: ✅ Funziona già

#### Alternative.me
- **Utilizzo**: Fear & Greed Crypto Index
- **Key richiesta**: ❌ NO
- **Rate Limit**: Non specificato (apparentemente illimitato)
- **Status**: ✅ Funziona già

#### Yahoo Finance
- **Utilizzo**: VIX (Volatility Index)
- **Key richiesta**: ❌ NO
- **Rate Limit**: Non ufficiale (apparentemente illimitato)
- **Status**: ✅ Funziona già (non ufficiale ma stabile)

---

### 🔧 API Keys per Funzionalità Aggiuntive (non indicatori)

#### 8. **TWILIO_ACCOUNT_SID** (Opzionale)
- **Utilizzo**: SMS/WhatsApp notifications
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

#### 9. **TWILIO_AUTH_TOKEN** (Opzionale)
- **Utilizzo**: SMS/WhatsApp notifications
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

#### 10. **TWILIO_PHONE_NUMBER** (Opzionale)
- **Utilizzo**: SMS notifications
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

#### 11. **TWILIO_WHATSAPP_NUMBER** (Opzionale)
- **Utilizzo**: WhatsApp notifications
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

#### 12. **VAPID_PUBLIC_KEY** (Opzionale)
- **Utilizzo**: Push notifications (browser)
- **Costo**: GRATIS
- **Status**: Opzionale, per push notifications

#### 13. **VAPID_PRIVATE_KEY** (Opzionale)
- **Utilizzo**: Push notifications (browser)
- **Costo**: GRATIS
- **Status**: Opzionale, per push notifications

#### 14. **VAPID_SUBJECT** (Opzionale)
- **Utilizzo**: Push notifications (browser)
- **Costo**: GRATIS
- **Status**: Opzionale, per push notifications

#### 15. **MIGRATION_SECRET_KEY** (Opzionale)
- **Utilizzo**: Protezione endpoint migrazioni Supabase
- **Costo**: GRATIS
- **Status**: Opzionale, sicurezza

#### 16. **CRON_SECRET** (Opzionale)
- **Utilizzo**: Autenticazione cron jobs
- **Costo**: GRATIS
- **Status**: Opzionale, sicurezza

#### 17. **NEXT_PUBLIC_SENTRY_DSN** (Opzionale)
- **Utilizzo**: Error tracking (Sentry)
- **Costo**: GRATIS (free tier disponibile)
- **Status**: Opzionale, monitoring

---

## 📊 Analisi Fee Tier per gli Indicatori

### ✅ Indicatori che RIENTRANO nel Fee Tier

| Indicatore | API Key | Rate Limit | Utilizzo/Giorno | Status |
|------------|---------|-------------|-----------------|--------|
| Economic Indicators | FRED_API_KEY | Illimitato | ~336 chiamate | ✅ OK |
| Bond Yields | FRED_API_KEY | Illimitato | ~48 chiamate | ✅ OK |
| Yield Curve | FRED_API_KEY | Illimitato | ~192 chiamate | ✅ OK |
| Stock Indexes | FINNHUB_API_KEY | 60/min | 2,016 chiamate | ✅ OK |
| Forex | FINNHUB_API_KEY | 60/min | 2,016 chiamate | ✅ OK |
| Commodities | ALPHA_VANTAGE_API_KEY | 5/min, 500/giorno | 864 chiamate | ⚠️ DA AGGIUSTARE |
| Bitcoin Dominance | Nessuna | 50/min | ~1,440 chiamate | ✅ OK |
| Fear & Greed | Nessuna | Illimitato | ~288 chiamate | ✅ OK |
| VIX | Nessuna | Illimitato | ~288 chiamate | ✅ OK |
| AI Readings (tutti) | GROQ_API_KEY | 30 RPM, 14.4k TPM | 3,744 chiamate | ✅ OK |

### ⚠️ Problema Identificato: ALPHA_VANTAGE_API_KEY

**Problema**: 
- Limite giornaliero: 500 chiamate/giorno
- Utilizzo attuale: 864 chiamate/giorno (refresh ogni 5 minuti)
- **SOVRAPPASSO**: 864 > 500 ❌

**Soluzione**:
1. **Aumentare cache a 10 minuti** (consigliato):
   - Refresh ogni 10 minuti = 6 refresh/ora
   - 3 chiamate × 6 = 18 chiamate/ora
   - 18 chiamate/ora × 24 = 432 chiamate/giorno ✅

2. **Alternativa: Ridurre chiamate**:
   - Fetchare solo 2 commodities invece di 3 (es. Gold e Oil)
   - 2 chiamate × 12 refresh/ora = 24 chiamate/ora
   - 24 chiamate/ora × 24 = 576 chiamate/giorno ❌ (ancora troppo)

3. **Alternativa: Cache più lunga per commodities**:
   - Cache a 15 minuti = 4 refresh/ora
   - 3 chiamate × 4 = 12 chiamate/ora
   - 12 chiamate/ora × 24 = 288 chiamate/giorno ✅

**Raccomandazione**: Implementare cache di 10-15 minuti per commodities.

---

## 🎯 Checklist Variabili Vercel

### Variabili OBBLIGATORIE (per indicatori funzionanti):

```bash
# Economic Indicators & Bond Yields
FRED_API_KEY=your_fred_api_key_here

# Stock Indexes & Forex
FINNHUB_API_KEY=your_finnhub_api_key_here

# Commodities (con cache aumentata)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here

# AI Readings (tutti gli indicatori)
GROQ_API_KEY=your_groq_api_key_here
```

### Variabili OPCZIONALI (funzionalità aggiuntive):

```bash
# Crypto Analytics (opzionali)
GLASSNODE_API_KEY=your_glassnode_api_key_here
SANTIMENT_API_KEY=your_santiment_api_key_here
WHALE_ALERT_API_KEY=your_whale_alert_api_key_here

# Notifications (opzionali)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:support@tradelia.org

# SMS/WhatsApp (opzionali, a pagamento)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Security (opzionali)
MIGRATION_SECRET_KEY=your_migration_secret_key
CRON_SECRET=your_cron_secret

# Monitoring (opzionale)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

---

## 📝 Raccomandazioni Finali

### ✅ Da Implementare Subito:

1. **Aumentare cache per ALPHA_VANTAGE_API_KEY**:
   - Modificare `app/api/market-indicators/commodities/route.ts`
   - Cambiare `next: { revalidate: 300 }` a `next: { revalidate: 600 }` (10 minuti)
   - Oppure `next: { revalidate: 900 }` (15 minuti)

2. **Verificare rate limiting**:
   - Implementare rate limiting lato server per proteggere le API
   - Monitorare utilizzo giornaliero

3. **Aggiungere monitoring**:
   - Tracciare chiamate API per identificare eventuali problemi
   - Alert se si avvicina al limite

### ✅ Tutte le altre API keys rientrano nel fee tier:

- **FRED_API_KEY**: ✅ Illimitato
- **FINNHUB_API_KEY**: ✅ 2,016 < 3,600 (limite orario)
- **GROQ_API_KEY**: ✅ 3,744 < 14,400 (limite TPM)
- **CoinGecko**: ✅ Nessuna key, 50/min sufficiente
- **Alternative.me**: ✅ Nessuna key, illimitato
- **Yahoo Finance**: ✅ Nessuna key, apparentemente illimitato

---

## 🚀 Conclusione

**Tutte le API keys necessarie per gli indicatori rientrano nel fee tier**, con l'unica eccezione di **ALPHA_VANTAGE_API_KEY** che richiede un aumento della cache da 5 a 10-15 minuti per rispettare il limite di 500 chiamate/giorno.

**Totale API keys obbligatorie per Vercel**: 4
- FRED_API_KEY
- FINNHUB_API_KEY
- ALPHA_VANTAGE_API_KEY
- GROQ_API_KEY

**Tutte gratuite e disponibili nel free tier** (con l'aggiustamento della cache per Alpha Vantage).
