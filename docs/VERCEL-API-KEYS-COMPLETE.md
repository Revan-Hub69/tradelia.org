# Verifica Completa API Keys e Variabili d'Ambiente per Vercel

## 📋 Riepilogo Completo

### ✅ Variabili OBBLIGATORIE (Core System)

#### 1. **Supabase Configuration** ⭐⭐⭐⭐⭐ (CRITICHE)

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (pubblica, sicura per client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Service Role Key (privata, solo server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

- **Utilizzo**: Database, autenticazione, storage, real-time
- **Ottieni qui**: https://supabase.com/dashboard → Project Settings → API
- **Costo**: GRATIS (free tier: 500MB database, 1GB storage, 2GB bandwidth)
- **Status**: ✅ OBBLIGATORIE - L'app non funziona senza
- **Note**: 
  - `NEXT_PUBLIC_*` sono esposte al client (sicure per anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` è privata, mai esporre al client

---

### ✅ API Keys per Market Indicators (4 obbligatorie)

#### 2. **FRED_API_KEY** ⭐⭐⭐⭐⭐
- **Utilizzo**: Economic Indicators, Bond Yields, Yield Curve
- **Provider**: Federal Reserve Economic Data (FRED)
- **Ottieni qui**: https://fred.stlouisfed.org/docs/api/api_key.html
- **Costo**: GRATIS
- **Rate Limit**: ILLIMITATO (free tier)
- **✅ RIENTRA NEL FEE TIER**: Sì, illimitato

#### 3. **FINNHUB_API_KEY** ⭐⭐⭐⭐
- **Utilizzo**: Stock Indexes, Forex Major Pairs
- **Provider**: Finnhub
- **Ottieni qui**: https://finnhub.io/register
- **Costo**: GRATIS
- **Rate Limit**: 60 calls/minuto (free tier)
- **Utilizzo stimato**: 2,016 chiamate/giorno
- **✅ RIENTRA NEL FEE TIER**: Sì, 2,016 < 3,600 (limite orario)

#### 4. **ALPHA_VANTAGE_API_KEY** ⭐⭐⭐⭐
- **Utilizzo**: Commodities (Gold, Oil, Silver)
- **Provider**: Alpha Vantage
- **Ottieni qui**: https://www.alphavantage.co/support/#api-key
- **Costo**: GRATIS
- **Rate Limit**: 5 calls/minuto, 500 calls/giorno (free tier)
- **Utilizzo stimato**: 432 chiamate/giorno (con cache 10 minuti)
- **✅ RIENTRA NEL FEE TIER**: Sì, 432 < 500 (dopo correzione cache)

#### 5. **GROQ_API_KEY** ⭐⭐⭐⭐⭐
- **Utilizzo**: AI Readings per TUTTI gli indicatori
- **Provider**: Groq
- **Ottieni qui**: https://console.groq.com/
- **Costo**: GRATIS
- **Rate Limit**: 30 RPM, 14.4k TPM (free tier)
- **Utilizzo stimato**: 3,744 chiamate/giorno
- **✅ RIENTRA NEL FEE TIER**: Sì, 3,744 < 14,400 TPM

---

### ✅ Variabili per Email Service (Opzionali ma Consigliate)

#### 6. **BREVO_API_KEY** ⭐⭐⭐⭐
- **Utilizzo**: Invio email (notifiche, password reset, checkout)
- **Provider**: Brevo (ex SendinBlue)
- **Ottieni qui**: https://www.brevo.com/ → Settings → API Keys
- **Costo**: GRATIS (free tier: 300 email/giorno)
- **Status**: Opzionale ma consigliato per email transazionali
- **Note**: Alternative: SendGrid, Resend, AWS SES

#### 7. **BREVO_FROM_EMAIL** (Opzionale)
- **Utilizzo**: Email mittente per Brevo
- **Default**: `noreply@tradelia.org`
- **Status**: Opzionale (usa default se non specificato)

#### 8. **BREVO_FROM_NAME** (Opzionale)
- **Utilizzo**: Nome mittente per Brevo
- **Default**: `Tradelia`
- **Status**: Opzionale (usa default se non specificato)

---

### ✅ Variabili per App Configuration

#### 9. **NEXT_PUBLIC_APP_URL** ⭐⭐⭐⭐
- **Utilizzo**: URL base dell'applicazione (per link email, redirect, etc.)
- **Esempio**: `https://tradelia.org` o `https://app.tradelia.org`
- **Status**: Opzionale ma consigliato (default: `http://localhost:3000`)
- **Note**: Usato in email, cron jobs, webhooks

---

### ✅ Variabili per Analytics (Opzionali)

#### 10. **NEXT_PUBLIC_GA_ID** (Opzionale)
- **Utilizzo**: Google Analytics Tracking ID
- **Formato**: `G-XXXXXXXXXX`
- **Ottieni qui**: https://analytics.google.com/
- **Costo**: GRATIS
- **Status**: Opzionale, per analytics

#### 11. **NEXT_PUBLIC_ANALYTICS_ENDPOINT** (Opzionale)
- **Utilizzo**: Endpoint personalizzato per analytics
- **Status**: Opzionale, per analytics custom

---

### ✅ Variabili per Notifications (Opzionali)

#### 12. **VAPID_PUBLIC_KEY** (Opzionale)
- **Utilizzo**: Push notifications (browser)
- **Ottieni qui**: Genera con `web-push generate-vapid-keys`
- **Costo**: GRATIS
- **Status**: Opzionale, per push notifications

#### 13. **VAPID_PRIVATE_KEY** (Opzionale)
- **Utilizzo**: Push notifications (browser)
- **Ottieni qui**: Genera con `web-push generate-vapid-keys`
- **Costo**: GRATIS
- **Status**: Opzionale, per push notifications

#### 14. **VAPID_SUBJECT** (Opzionale)
- **Utilizzo**: Push notifications (browser)
- **Default**: `mailto:support@tradelia.org`
- **Status**: Opzionale

---

### ✅ Variabili per SMS/WhatsApp (Opzionali, Premium)

#### 15. **TWILIO_ACCOUNT_SID** (Opzionale)
- **Utilizzo**: SMS/WhatsApp notifications
- **Provider**: Twilio
- **Ottieni qui**: https://www.twilio.com/
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

#### 16. **TWILIO_AUTH_TOKEN** (Opzionale)
- **Utilizzo**: SMS/WhatsApp notifications
- **Provider**: Twilio
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

#### 17. **TWILIO_PHONE_NUMBER** (Opzionale)
- **Utilizzo**: Numero Twilio per SMS
- **Provider**: Twilio
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

#### 18. **TWILIO_WHATSAPP_NUMBER** (Opzionale)
- **Utilizzo**: Numero Twilio per WhatsApp
- **Provider**: Twilio
- **Formato**: `whatsapp:+14155238886`
- **Costo**: A pagamento (non free tier)
- **Status**: Opzionale, funzionalità premium

---

### ✅ Variabili per Payment/Checkout (Opzionali)

#### 19. **NEXT_PUBLIC_XOLO_PAYMENT_LINK** (Opzionale)
- **Utilizzo**: Link pagamento Xolo Go
- **Default**: `https://pay.xolo.io`
- **Status**: Opzionale, per checkout

#### 20. **NEXT_PUBLIC_XOLO_IBAN** (Opzionale)
- **Utilizzo**: IBAN per pagamenti Xolo Go
- **Status**: Opzionale, per checkout

---

### ✅ Variabili per Security (Opzionali ma Consigliate)

#### 21. **MIGRATION_SECRET_KEY** (Opzionale)
- **Utilizzo**: Protezione endpoint migrazioni Supabase
- **Formato**: Stringa segreta casuale
- **Genera**: `openssl rand -hex 32`
- **Status**: Opzionale ma consigliato per sicurezza

#### 22. **CRON_SECRET** (Opzionale)
- **Utilizzo**: Autenticazione cron jobs
- **Formato**: Stringa segreta casuale
- **Genera**: `openssl rand -hex 32`
- **Status**: Opzionale ma consigliato per sicurezza

---

### ✅ Variabili per Monitoring (Opzionali)

#### 23. **NEXT_PUBLIC_SENTRY_DSN** (Opzionale)
- **Utilizzo**: Error tracking (Sentry)
- **Provider**: Sentry
- **Ottieni qui**: https://sentry.io/
- **Costo**: GRATIS (free tier disponibile)
- **Status**: Opzionale, per error tracking

---

### ✅ API Keys Opzionali per Crypto Analytics

#### 24. **GLASSNODE_API_KEY** (Opzionale)
- **Utilizzo**: Exchange Flows (crypto)
- **Provider**: Glassnode
- **Costo**: GRATIS (free tier: 1 call/sec)
- **Status**: Opzionale, ha fallback a mock data

#### 25. **SANTIMENT_API_KEY** (Opzionale)
- **Utilizzo**: Social Sentiment (crypto)
- **Provider**: Santiment
- **Costo**: GRATIS (free tier: 100 calls/day)
- **Status**: Opzionale, ha fallback a Reddit
- **⚠️ ATTENZIONE**: Limite molto basso (100/giorno)

#### 26. **WHALE_ALERT_API_KEY** (Opzionale)
- **Utilizzo**: Whale Analysis (crypto)
- **Provider**: Whale Alert
- **Costo**: GRATIS (free tier: 100 calls/day)
- **Status**: Opzionale, ha fallback a mock data
- **⚠️ ATTENZIONE**: Limite molto basso (100/giorno)

---

## 📊 Checklist Completa per Vercel

### 🔴 OBBLIGATORIE (L'app non funziona senza):

```bash
# Supabase (CRITICHE)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Market Indicators (per funzionalità indicatori)
FRED_API_KEY=your_fred_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

**Totale obbligatorie**: 7 variabili

---

### 🟡 CONSIGLIATE (Funzionalità importanti):

```bash
# Email Service
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@tradelia.org
BREVO_FROM_NAME=Tradelia

# App Configuration
NEXT_PUBLIC_APP_URL=https://tradelia.org

# Security
MIGRATION_SECRET_KEY=your_secret_key_here
CRON_SECRET=your_cron_secret_here
```

**Totale consigliate**: 6 variabili

---

### 🟢 OPCZIONALI (Funzionalità aggiuntive):

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:support@tradelia.org

# SMS/WhatsApp (Premium, a pagamento)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Payment/Checkout
NEXT_PUBLIC_XOLO_PAYMENT_LINK=https://pay.xolo.io
NEXT_PUBLIC_XOLO_IBAN=IT60 X054 2811 1010 0000 0123 4567

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Crypto Analytics (Opzionali)
GLASSNODE_API_KEY=your_glassnode_api_key
SANTIMENT_API_KEY=your_santiment_api_key
WHALE_ALERT_API_KEY=your_whale_alert_api_key
```

**Totale opzionali**: 15 variabili

---

## 🎯 Riepilogo Finale

### Totale Variabili d'Ambiente:

- **🔴 Obbligatorie**: 7 variabili
- **🟡 Consigliate**: 6 variabili
- **🟢 Opzionali**: 15 variabili
- **📊 TOTALE**: 28 variabili possibili

### Per un Setup Minimo Funzionante:

**7 variabili obbligatorie**:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `FRED_API_KEY`
5. `FINNHUB_API_KEY`
6. `ALPHA_VANTAGE_API_KEY`
7. `GROQ_API_KEY`

### Per un Setup Completo (Consigliato):

**13 variabili** (7 obbligatorie + 6 consigliate):
- Tutte le 7 obbligatorie
- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL`
- `BREVO_FROM_NAME`
- `NEXT_PUBLIC_APP_URL`
- `MIGRATION_SECRET_KEY`
- `CRON_SECRET`

---

## ✅ Verifica Fee Tier

### Tutte le API keys rientrano nel fee tier gratuito:

| API Key | Rate Limit | Utilizzo/Giorno | Status |
|---------|------------|-----------------|--------|
| FRED_API_KEY | Illimitato | ~336 chiamate | ✅ OK |
| FINNHUB_API_KEY | 60/min | 2,016 chiamate | ✅ OK |
| ALPHA_VANTAGE_API_KEY | 500/giorno | 432 chiamate | ✅ OK (dopo fix cache) |
| GROQ_API_KEY | 14.4k TPM | 3,744 chiamate | ✅ OK |
| BREVO_API_KEY | 300/giorno | < 300 | ✅ OK |
| GLASSNODE_API_KEY | 1/sec | < 86,400 | ✅ OK |
| SANTIMENT_API_KEY | 100/giorno | < 100 | ⚠️ Limitato |
| WHALE_ALERT_API_KEY | 100/giorno | < 100 | ⚠️ Limitato |

**Conclusione**: Tutte le API obbligatorie rientrano nel fee tier gratuito. Le opzionali (Santiment, Whale Alert) hanno limiti bassi ma hanno fallback a mock data.

---

## 🚀 Setup Vercel - Quick Start

### 1. Variabili Obbligatorie (7):

Vai su Vercel Dashboard → Project → Settings → Environment Variables e aggiungi:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRED_API_KEY=your_fred_api_key
FINNHUB_API_KEY=your_finnhub_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
GROQ_API_KEY=your_groq_api_key
```

### 2. Variabili Consigliate (6):

```bash
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@tradelia.org
BREVO_FROM_NAME=Tradelia
NEXT_PUBLIC_APP_URL=https://tradelia.org
MIGRATION_SECRET_KEY=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)
```

### 3. Redeploy

Dopo aver aggiunto le variabili, fai redeploy del progetto.

---

## 📝 Note Importanti

1. **Supabase Keys**: Le più critiche - senza queste l'app non funziona
2. **API Keys Market Indicators**: Tutte gratuite e nel free tier
3. **Email Service**: Brevo è gratuito (300 email/giorno) - sufficiente per iniziare
4. **Security Keys**: Genera con `openssl rand -hex 32` per sicurezza
5. **Opzionali**: Le funzionalità opzionali hanno fallback, l'app funziona anche senza

---

## ✅ Conclusione

**Totale variabili obbligatorie per Vercel**: **7**
- 3 Supabase (CRITICHE)
- 4 Market Indicators API

**Tutte gratuite e nel free tier** ✅

Il documento precedente era incompleto - mancavano le variabili Supabase che sono le più critiche!
