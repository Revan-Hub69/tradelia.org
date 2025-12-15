# Lista API Keys per Vercel - VERSIONE SEMPLICE

## 🎯 API Keys OBBLIGATORIE (7 totali)

**Senza queste, l'app NON funziona.**

### 1. Supabase (3 keys - CRITICHE)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Dove trovarle**: 
- Vai su https://supabase.com/dashboard
- Seleziona il tuo progetto
- Settings → API
- Copia URL, anon key e service_role key

**Costo**: GRATIS (free tier)

---

### 2. Market Indicators (4 keys - per gli indicatori)

```bash
FRED_API_KEY=your_fred_api_key
FINNHUB_API_KEY=your_finnhub_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
GROQ_API_KEY=your_groq_api_key
```

**Dove trovarle**:

1. **FRED_API_KEY** (Economic Indicators, Bond Yields)
   - https://fred.stlouisfed.org/docs/api/api_key.html
   - Clicca "Request API Key"
   - Gratis, illimitato

2. **FINNHUB_API_KEY** (Stock Indexes, Forex)
   - https://finnhub.io/register
   - Crea account gratuito
   - Dashboard → API Key
   - Gratis, 60 calls/min

3. **ALPHA_VANTAGE_API_KEY** (Commodities)
   - https://www.alphavantage.co/support/#api-key
   - Compila form
   - Ricevi key via email
   - Gratis, 500 calls/day

4. **GROQ_API_KEY** (AI Readings)
   - https://console.groq.com/
   - Crea account
   - API Keys → Create Key
   - Gratis, generoso

**Costo**: TUTTE GRATIS (free tier)

---

## ✅ Totale API Keys OBBLIGATORIE: 7

```bash
# Supabase (3)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Market Indicators (4)
FRED_API_KEY=...
FINNHUB_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
GROQ_API_KEY=...
```

---

## 🟡 API Keys OPCZIONALI (solo se vuoi queste funzionalità)

### Email (per inviare email)

```bash
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@tradelia.org
BREVO_FROM_NAME=Tradelia
```

**Dove trovarla**: https://www.brevo.com/ → Settings → API Keys
**Costo**: GRATIS (300 email/giorno)

**Nota**: Se non la configuri, le email non funzioneranno, ma l'app funziona comunque.

---

### App URL (per link email e redirect)

```bash
NEXT_PUBLIC_APP_URL=https://tradelia.org
```

**Nota**: Se non la configuri, usa `http://localhost:3000` come default.

---

### Security (consigliate ma opzionali)

```bash
MIGRATION_SECRET_KEY=genera_con_openssl_rand_hex_32
CRON_SECRET=genera_con_openssl_rand_hex_32
```

**Genera con**: `openssl rand -hex 32`

---

## 📋 Checklist Vercel

### Step 1: Vai su Vercel Dashboard
1. Apri il tuo progetto
2. Settings → Environment Variables

### Step 2: Aggiungi le 7 API Keys OBBLIGATORIE

Clicca "Add" e inserisci una per una:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FRED_API_KEY = abc123def456...
FINNHUB_API_KEY = cdef456ghi789...
ALPHA_VANTAGE_API_KEY = ghi789jkl012...
GROQ_API_KEY = gsk_abc123def456...
```

### Step 3: (Opzionale) Aggiungi le opzionali

Se vuoi email, aggiungi:
```
BREVO_API_KEY = x-send-abc123...
BREVO_FROM_EMAIL = noreply@tradelia.org
BREVO_FROM_NAME = Tradelia
NEXT_PUBLIC_APP_URL = https://tradelia.org
```

### Step 4: Redeploy

Dopo aver aggiunto tutte le variabili, fai redeploy del progetto.

---

## ❓ FAQ

### Q: Devo inserire tutte le 7 API keys?
**A**: Sì, sono tutte obbligatorie. Senza Supabase l'app non funziona. Senza le 4 API keys degli indicatori, gli indicatori non funzioneranno.

### Q: E le opzionali?
**A**: Solo se vuoi quelle funzionalità. L'app funziona anche senza.

### Q: Quanto costano?
**A**: TUTTE GRATIS nel free tier. Nessun costo.

### Q: Cosa succede se non inserisco una key?
**A**: 
- Se manca Supabase → App non funziona ❌
- Se manca FRED/FINNHUB/ALPHA_VANTAGE → Quell'indicatore non funziona ⚠️
- Se manca GROQ → Gli indicatori funzionano ma senza AI reading ⚠️
- Se manca BREVO → Email non funzionano, ma resto OK ⚠️

### Q: Dove trovo le keys di Supabase?
**A**: 
1. Vai su https://supabase.com/dashboard
2. Seleziona progetto (o creane uno nuovo)
3. Settings (icona ingranaggio) → API
4. Trovi:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ SECRET, non esporre al client)

---

## ✅ Riepilogo Finale

**API Keys da inserire in Vercel**: **7 obbligatorie**

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `FRED_API_KEY`
5. `FINNHUB_API_KEY`
6. `ALPHA_VANTAGE_API_KEY`
7. `GROQ_API_KEY`

**Tutte gratuite, tutte nel free tier** ✅

---

## 🚀 Quick Start

1. **Ottieni le 7 API keys** (link sopra)
2. **Vai su Vercel** → Project → Settings → Environment Variables
3. **Aggiungi le 7 variabili** (copia-incolla)
4. **Redeploy**
5. **Fatto!** ✅
