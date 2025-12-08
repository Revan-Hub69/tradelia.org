# 🔑 API KEYS - LISTA DEFINITIVA COMPLETA

## 🎯 TUTTE LE API KEYS NECESSARIE - NIENTE ESCLUSO

**Lista completa e definitiva di TUTTE le API keys usate nel progetto.**

---

## 🔴 **OBBLIGATORIE** (7) - L'app non funziona senza

### 1. **NEXT_PUBLIC_SUPABASE_URL** ⭐⭐⭐⭐⭐
- **Dove**: Supabase Dashboard
- **Link**: https://supabase.com/dashboard → Project Settings → API
- **Cosa fa**: Database, Auth, Storage
- **Tempo**: 2 minuti (copia da dashboard)
- **Costo**: GRATIS

### 2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** ⭐⭐⭐⭐⭐
- **Dove**: Supabase Dashboard
- **Link**: https://supabase.com/dashboard → Project Settings → API
- **Cosa fa**: Database, Auth, Storage (client-side)
- **Tempo**: 2 minuti (copia da dashboard)
- **Costo**: GRATIS

### 3. **SUPABASE_SERVICE_ROLE_KEY** ⭐⭐⭐⭐⭐
- **Dove**: Supabase Dashboard
- **Link**: https://supabase.com/dashboard → Project Settings → API
- **Cosa fa**: Database, Auth, Storage (server-side)
- **Tempo**: 2 minuti (copia da dashboard)
- **Costo**: GRATIS
- **⚠️ SECRET**: Non esporre al client!

### 4. **FRED_API_KEY** ⭐⭐⭐⭐⭐
- **Dove**: FRED API
- **Link**: https://fred.stlouisfed.org/docs/api/api_key.html
- **Cosa fa**: Economic Indicators, Bond Yields, Yield Curve, Credit Spreads, Leading Indicators, Business Cycle, Financial Stress, PMI (USA), DXY, Real Estate
- **Tempo**: 2 minuti (registrazione + email)
- **Costo**: GRATIS
- **Rate Limit**: 120 calls/min, illimitato giornaliero

### 5. **FINNHUB_API_KEY** ⭐⭐⭐⭐⭐
- **Dove**: Finnhub
- **Link**: https://finnhub.io/register
- **Cosa fa**: Stock Indexes, Market Breadth, McClellan, TRIN, European/Asian/Emerging Indexes, Stocks Globali, Forex, ETF, VWAP, OBV, A/D, MFI, Chaikin, EOM, Short Interest, IPO Calendar, Corporate Events, Economic Calendar
- **Tempo**: 3 minuti (registrazione + dashboard)
- **Costo**: GRATIS
- **Rate Limit**: 60 calls/min

### 6. **ALPHA_VANTAGE_API_KEY** ⭐⭐⭐⭐⭐
- **Dove**: Alpha Vantage
- **Link**: https://www.alphavantage.co/support/#api-key
- **Cosa fa**: Commodities (Gold, Oil, Silver), Commodity Rotation
- **Tempo**: 2 minuti (form + email)
- **Costo**: GRATIS
- **Rate Limit**: 5 calls/min, 500 calls/day

### 7. **GROQ_API_KEY** ⭐⭐⭐⭐⭐
- **Dove**: Groq Console
- **Link**: https://console.groq.com/
- **Cosa fa**: AI Readings per TUTTI gli indicatori
- **Tempo**: 3 minuti (registrazione + dashboard)
- **Costo**: GRATIS
- **Rate Limit**: 30 requests/min

---

## 🟡 **CONSIGLIATE** (6) - Funzionalità importanti

### 8. **BREVO_API_KEY** ⭐⭐⭐⭐
- **Dove**: Brevo (ex SendinBlue)
- **Link**: https://www.brevo.com/ → Settings → API Keys
- **Cosa fa**: Invio email (notifiche, password reset, checkout)
- **Tempo**: 5 minuti (registrazione + verifica email)
- **Costo**: GRATIS (300 email/giorno)
- **Rate Limit**: 300 email/giorno

### 9. **BREVO_FROM_EMAIL** (Opzionale)
- **Default**: `noreply@tradelia.org`
- **Cosa fa**: Email mittente per Brevo
- **Tempo**: 0 (usa default)

### 10. **BREVO_FROM_NAME** (Opzionale)
- **Default**: `Tradelia`
- **Cosa fa**: Nome mittente per Brevo
- **Tempo**: 0 (usa default)

### 11. **NEXT_PUBLIC_APP_URL** ⭐⭐⭐⭐
- **Esempio**: `https://tradelia.org` o `https://app.tradelia.org`
- **Cosa fa**: URL base dell'app (per link email, redirect, cron jobs)
- **Tempo**: 0 (inserisci il tuo URL)
- **Costo**: GRATIS

### 12. **MIGRATION_SECRET_KEY** ⭐⭐⭐⭐
- **Genera**: `openssl rand -hex 32`
- **Cosa fa**: Protezione endpoint migrazioni Supabase
- **Tempo**: 1 minuto (genera secret)
- **Costo**: GRATIS

### 13. **CRON_SECRET** ⭐⭐⭐⭐
- **Genera**: `openssl rand -hex 32`
- **Cosa fa**: Autenticazione cron jobs
- **Tempo**: 1 minuto (genera secret)
- **Costo**: GRATIS

---

## 🟢 **OPZIONALI - CRYPTO ANALYTICS** (3)

### 14. **WHALE_ALERT_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: Whale Alert
- **Link**: https://whale-alert.io/ → API → Get API Key
- **Cosa fa**: Whale Analysis (transazioni whale crypto)
- **Tempo**: 5 minuti (registrazione + verifica)
- **Costo**: GRATIS
- **Rate Limit**: 100 calls/day
- **Status**: ⚠️ **OPZIONALE** - Ha fallback a mock data se non configurato
- **File**: `app/api/crypto/whale-analysis/route.ts`

### 15. **SANTIMENT_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: Santiment
- **Link**: https://santiment.net/ → API → Get API Key
- **Cosa fa**: Social Sentiment (crypto), Market Sentiment
- **Tempo**: 5 minuti (registrazione + verifica)
- **Costo**: GRATIS
- **Rate Limit**: 100 calls/day
- **Status**: ⚠️ **OPZIONALE** - Ha fallback a Reddit se non configurato
- **File**: `app/api/market/sentiment/route.ts`, `app/api/crypto/social-sentiment/route.ts`

### 16. **GLASSNODE_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: Glassnode
- **Link**: https://glassnode.com/ → API → Get API Key
- **Cosa fa**: Exchange Flows (crypto)
- **Tempo**: 5 minuti (registrazione + verifica)
- **Costo**: GRATIS (free tier: 1 call/sec)
- **Rate Limit**: 1 call/sec
- **Status**: ⚠️ **OPZIONALE** - Ha fallback a mock data se non configurato
- **File**: `app/api/crypto/exchange-flows/route.ts`

---

## 🟢 **OPZIONALI - PUSH NOTIFICATIONS** (3)

### 17. **NEXT_PUBLIC_VAPID_PUBLIC_KEY** ⚠️ **OPZIONALE**
- **Genera**: `npx web-push generate-vapid-keys`
- **Cosa fa**: Push notifications (browser) - Oslo
- **Tempo**: 2 minuti (genera keys)
- **Costo**: GRATIS
- **Status**: ⚠️ **OPZIONALE** - Push notifications non funzionano senza
- **File**: `app/api/notifications/send/route.ts`, `app/api/oslo/notifications/push-all/route.ts`

### 18. **VAPID_PRIVATE_KEY** ⚠️ **OPZIONALE**
- **Genera**: `npx web-push generate-vapid-keys`
- **Cosa fa**: Push notifications (browser) - Oslo
- **Tempo**: 2 minuti (genera keys)
- **Costo**: GRATIS
- **⚠️ SECRET**: Non esporre al client!
- **Status**: ⚠️ **OPZIONALE** - Push notifications non funzionano senza

### 19. **VAPID_SUBJECT** (Opzionale)
- **Default**: `mailto:support@tradelia.org`
- **Cosa fa**: Push notifications (browser) - Oslo
- **Tempo**: 0 (usa default o inserisci email)

---

## 🟢 **OPZIONALI - SMS/WHATSAPP** (4) - Premium, a pagamento

### 20. **TWILIO_ACCOUNT_SID** ⚠️ **OPZIONALE**
- **Dove**: Twilio
- **Link**: https://www.twilio.com/ → Console → Account SID
- **Cosa fa**: SMS/WhatsApp notifications
- **Tempo**: 10 minuti (registrazione + verifica telefono)
- **Costo**: 💰 **A PAGAMENTO** (non free tier)
- **Status**: ⚠️ **OPZIONALE** - SMS/WhatsApp non funzionano senza
- **File**: `app/api/notifications/send/route.ts`

### 21. **TWILIO_AUTH_TOKEN** ⚠️ **OPZIONALE**
- **Dove**: Twilio
- **Link**: https://www.twilio.com/ → Console → Auth Token
- **Cosa fa**: SMS/WhatsApp notifications
- **Tempo**: 2 minuti (copia da dashboard)
- **Costo**: 💰 **A PAGAMENTO** (non free tier)
- **⚠️ SECRET**: Non esporre al client!
- **Status**: ⚠️ **OPZIONALE** - SMS/WhatsApp non funzionano senza

### 22. **TWILIO_PHONE_NUMBER** (Opzionale)
- **Dove**: Twilio
- **Link**: https://www.twilio.com/ → Phone Numbers → Buy Number
- **Cosa fa**: Numero Twilio per SMS
- **Tempo**: 5 minuti (acquista numero)
- **Costo**: 💰 **A PAGAMENTO** (~$1/mese + costi SMS)

### 23. **TWILIO_WHATSAPP_NUMBER** (Opzionale)
- **Dove**: Twilio
- **Link**: https://www.twilio.com/ → WhatsApp → Setup
- **Cosa fa**: Numero Twilio per WhatsApp
- **Formato**: `whatsapp:+14155238886`
- **Tempo**: 10 minuti (setup WhatsApp)
- **Costo**: 💰 **A PAGAMENTO**

---

## 🟢 **OPZIONALI - ECONOMIC CALENDAR** (2)

### 24. **TRADING_ECONOMICS_CLIENT_KEY** ⚠️ **OPZIONALE**
- **Dove**: Trading Economics
- **Link**: https://tradingeconomics.com/api → Register
- **Cosa fa**: Economic Calendar (eventi economici globali)
- **Tempo**: 5 minuti (registrazione + verifica)
- **Costo**: GRATIS (free tier: 2 calls/min)
- **Rate Limit**: 2 calls/min
- **Status**: ⚠️ **OPZIONALE** - Economic Calendar ha fallback se non configurato
- **File**: `app/api/economic/calendar/route.ts`

### 25. **TRADING_ECONOMICS_CLIENT_SECRET** ⚠️ **OPZIONALE**
- **Dove**: Trading Economics
- **Link**: https://tradingeconomics.com/api → Register
- **Cosa fa**: Economic Calendar (eventi economici globali)
- **Tempo**: 5 minuti (registrazione + verifica)
- **Costo**: GRATIS (free tier: 2 calls/min)
- **⚠️ SECRET**: Non esporre al client!
- **Status**: ⚠️ **OPZIONALE** - Economic Calendar ha fallback se non configurato

---

## 🟢 **OPZIONALI - OPTIONS FLOW** (2)

### 26. **POLYGON_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: Polygon.io
- **Link**: https://polygon.io/ → Register → API Keys
- **Cosa fa**: Options Flow (indicatore PRO)
- **Tempo**: 5 minuti (registrazione + dashboard)
- **Costo**: GRATIS (free tier: 5 calls/min)
- **Rate Limit**: 5 calls/min
- **Status**: ⚠️ **OPZIONALE** - Solo per Options Flow (indicatore PRO)

### 27. **IEX_CLOUD_API_KEY** ⚠️ **OPZIONALE**
- **Dove**: IEX Cloud
- **Link**: https://iexcloud.io/ → Register → API Tokens
- **Cosa fa**: Options Flow (alternativa a Polygon.io)
- **Tempo**: 5 minuti (registrazione + dashboard)
- **Costo**: GRATIS (free tier: 50,000 messages/mese)
- **Rate Limit**: 50,000 messages/mese
- **Status**: ⚠️ **OPZIONALE** - Solo per Options Flow (alternativa a Polygon.io)

---

## 🟢 **OPZIONALI - ANALYTICS & MONITORING** (3)

### 28. **NEXT_PUBLIC_GA_ID** (Opzionale)
- **Dove**: Google Analytics
- **Link**: https://analytics.google.com/ → Create Property
- **Cosa fa**: Google Analytics tracking
- **Formato**: `G-XXXXXXXXXX`
- **Tempo**: 10 minuti (setup GA)
- **Costo**: GRATIS

### 29. **NEXT_PUBLIC_SENTRY_DSN** (Opzionale)
- **Dove**: Sentry
- **Link**: https://sentry.io/ → Create Project
- **Cosa fa**: Error tracking
- **Tempo**: 10 minuti (setup Sentry)
- **Costo**: GRATIS (free tier disponibile)

### 30. **ADMIN_EMAIL** (Opzionale)
- **Default**: `admin@tradelia.org`
- **Cosa fa**: Email admin per notifiche
- **Tempo**: 0 (inserisci email admin)
- **File**: `app/api/checkout/submit/route.ts`

---

## 🟢 **OPZIONALI - PAYMENT/CHECKOUT** (2)

### 31. **NEXT_PUBLIC_XOLO_PAYMENT_LINK** (Opzionale)
- **Default**: `https://pay.xolo.io`
- **Cosa fa**: Link pagamento Xolo Go
- **Tempo**: 0 (usa default o inserisci link)
- **File**: `app/api/checkout/create/route.ts`

### 32. **NEXT_PUBLIC_XOLO_IBAN** (Opzionale)
- **Cosa fa**: IBAN per pagamenti Xolo Go
- **Tempo**: 0 (inserisci IBAN)
- **File**: `app/api/checkout/xolo/route.ts`

---

## 📊 **RIEPILOGO COMPLETO**

### 🔴 **OBBLIGATORIE** (7):
1. NEXT_PUBLIC_SUPABASE_URL
2. NEXT_PUBLIC_SUPABASE_ANON_KEY
3. SUPABASE_SERVICE_ROLE_KEY
4. FRED_API_KEY
5. FINNHUB_API_KEY
6. ALPHA_VANTAGE_API_KEY
7. GROQ_API_KEY

### 🟡 **CONSIGLIATE** (6):
8. BREVO_API_KEY
9. BREVO_FROM_EMAIL (opzionale, ha default)
10. BREVO_FROM_NAME (opzionale, ha default)
11. NEXT_PUBLIC_APP_URL
12. MIGRATION_SECRET_KEY
13. CRON_SECRET

### 🟢 **OPZIONALI - CRYPTO** (3):
14. WHALE_ALERT_API_KEY (fallback a mock)
15. SANTIMENT_API_KEY (fallback a Reddit)
16. GLASSNODE_API_KEY (fallback a mock)

### 🟢 **OPZIONALI - PUSH NOTIFICATIONS** (3):
17. NEXT_PUBLIC_VAPID_PUBLIC_KEY
18. VAPID_PRIVATE_KEY
19. VAPID_SUBJECT (opzionale, ha default)

### 🟢 **OPZIONALI - SMS/WHATSAPP** (4) - 💰 A PAGAMENTO:
20. TWILIO_ACCOUNT_SID
21. TWILIO_AUTH_TOKEN
22. TWILIO_PHONE_NUMBER
23. TWILIO_WHATSAPP_NUMBER

### 🟢 **OPZIONALI - ECONOMIC CALENDAR** (2):
24. TRADING_ECONOMICS_CLIENT_KEY (fallback disponibile)
25. TRADING_ECONOMICS_CLIENT_SECRET (fallback disponibile)

### 🟢 **OPZIONALI - OPTIONS FLOW** (2):
26. POLYGON_API_KEY
27. IEX_CLOUD_API_KEY

### 🟢 **OPZIONALI - ANALYTICS & MONITORING** (3):
28. NEXT_PUBLIC_GA_ID
29. NEXT_PUBLIC_SENTRY_DSN
30. ADMIN_EMAIL (opzionale, ha default)

### 🟢 **OPZIONALI - PAYMENT** (2):
31. NEXT_PUBLIC_XOLO_PAYMENT_LINK (opzionale, ha default)
32. NEXT_PUBLIC_XOLO_IBAN

---

## ✅ **TOTALE: 32 VARIABILI**

- 🔴 **OBBLIGATORIE**: 7
- 🟡 **CONSIGLIATE**: 6
- 🟢 **OPZIONALI**: 19

---

## 🚀 **CHECKLIST VERCEL - SETUP MINIMO**

### **OBBLIGATORIE** (7):
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] FRED_API_KEY
- [ ] FINNHUB_API_KEY
- [ ] ALPHA_VANTAGE_API_KEY
- [ ] GROQ_API_KEY

### **CONSIGLIATE** (6):
- [ ] BREVO_API_KEY
- [ ] BREVO_FROM_EMAIL (opzionale)
- [ ] BREVO_FROM_NAME (opzionale)
- [ ] NEXT_PUBLIC_APP_URL
- [ ] MIGRATION_SECRET_KEY
- [ ] CRON_SECRET

### **OPZIONALI - Se vuoi funzionalità specifiche**:
- [ ] WHALE_ALERT_API_KEY (Whale Analysis)
- [ ] SANTIMENT_API_KEY (Social Sentiment)
- [ ] GLASSNODE_API_KEY (Exchange Flows)
- [ ] NEXT_PUBLIC_VAPID_PUBLIC_KEY (Push Notifications)
- [ ] VAPID_PRIVATE_KEY (Push Notifications)
- [ ] TRADING_ECONOMICS_CLIENT_KEY (Economic Calendar globale)
- [ ] TRADING_ECONOMICS_CLIENT_SECRET (Economic Calendar globale)
- [ ] POLYGON_API_KEY (Options Flow)
- [ ] IEX_CLOUD_API_KEY (Options Flow alternativa)
- [ ] TWILIO_ACCOUNT_SID (SMS/WhatsApp - 💰 a pagamento)
- [ ] TWILIO_AUTH_TOKEN (SMS/WhatsApp - 💰 a pagamento)
- [ ] NEXT_PUBLIC_GA_ID (Google Analytics)
- [ ] NEXT_PUBLIC_SENTRY_DSN (Error Tracking)

---

## ✅ **CONCLUSIONE**

### **SETUP MINIMO** (7 obbligatorie):
- L'app funziona con solo queste 7
- Tutte GRATIS

### **SETUP CONSIGLIATO** (13 = 7 obbligatorie + 6 consigliate):
- Funzionalità complete (email, security, URL base)
- Tutte GRATIS

### **SETUP COMPLETO** (32 totali):
- Tutte le funzionalità (crypto analytics, push notifications, SMS, analytics, etc.)
- Alcune a pagamento (Twilio per SMS/WhatsApp)

**Tempo totale per setup minimo: ~15-20 minuti** ⏱️
