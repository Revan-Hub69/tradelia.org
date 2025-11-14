# 🚀 Strategia Deployment: Vercel (Pubblico) + Cloudflare (Completo)

## 📋 Panoramica

Abbiamo **22 Serverless Functions** totali, ma Vercel Hobby permette solo **12 funzioni**. 

**Soluzione**: Separare funzioni pubbliche (Vercel) da funzioni private (Cloudflare).

---

## 🌐 Vercel (Pubblico) - Max 12 Funzioni

### Funzioni Pubbliche Necessarie (7 funzioni)

1. **`/api/webhook-lemonsqueezy.js`** ✅
   - Webhook pubblico per Lemon Squeezy
   - Gestisce pagamenti e abbonamenti

2. **`/api/webhook-stripe.js`** ✅
   - Webhook pubblico per Stripe
   - Gestisce pagamenti Stripe

3. **`/api/webhook-paddle.js`** ✅ (opzionale, se usato)
   - Webhook pubblico per Paddle
   - Alternativa a Lemon Squeezy

4. **`/api/create-checkout-session.js`** ✅
   - Crea sessioni checkout Stripe
   - Pubblico per utenti che acquistano

5. **`/api/check-subscription.js`** ✅
   - Verifica status abbonamento
   - Pubblico per frontend

6. **`/api/vote.js`** ✅
   - Gestione voti community
   - Pubblico per utenti autenticati

7. **`/pages/api/azioniblocco1.ts`** ✅ (se necessario)
   - Funzione pubblica specifica

**Totale Vercel: 7 funzioni** (sotto il limite di 12) ✅

---

## 🔒 Cloudflare (Completo) - Tutte le Funzioni

### Funzioni Private/Admin (15 funzioni)

#### Admin Functions (7 funzioni)
- `/pages/api/admin/create-report.ts`
- `/pages/api/admin/reports.ts`
- `/pages/api/admin/report-files.ts`
- `/pages/api/admin/regenerate-manifest.ts`
- `/pages/api/admin/upload-chart-screenshot.ts`
- `/pages/api/admin/upload-module-json.ts`
- `/pages/api/admin/upload-module-screenshot.ts`

#### Email & Push (4 funzioni)
- `/api/send-email.js`
- `/api/send-email-backup.js`
- `/api/send-push.js`
- `/api/push-subscribe.js`

#### Subscription Management (2 funzioni)
- `/api/cancel-subscription.js`
- `/api/webhook-stripe-xolo.js` (opzionale)

#### Utils/Helpers (2 funzioni)
- `/api/webhook-role-sync.js` (helper, usato da altre funzioni)
- `/pages/api/admin/_utils.ts`

**Totale Cloudflare: 22 funzioni** (versione completa)

---

## ⚙️ Configurazione

### Vercel

Il file `.vercelignore` e `vercel.json` escludono automaticamente le funzioni private.

**File esclusi da Vercel:**
- Tutto in `pages/api/admin/`
- `api/send-email-backup.js`
- `api/send-email.js`
- `api/send-push.js`
- `api/push-subscribe.js`
- `api/cancel-subscription.js`
- `api/webhook-stripe-xolo.js`

### Cloudflare Pages

Cloudflare Pages deploya **tutte le funzioni** senza limiti.

**Configurazione Cloudflare:**
1. Vai su Cloudflare Dashboard → Pages
2. Connetti repository GitHub
3. Build settings:
   - **Build command**: (vuoto o `npm run build` se necessario)
   - **Build output directory**: `/` (root)
   - **Root directory**: `/`

---

## 🔄 Workflow

### Deploy Pubblico (Vercel)
```bash
# Vercel deploya automaticamente solo funzioni pubbliche
# Le funzioni private sono ignorate tramite .vercelignore
vercel --prod
```

### Deploy Completo (Cloudflare)
```bash
# Cloudflare deploya tutto
# Push su branch dedicato o main
git push origin main
```

---

## 📝 URL Endpoints

### Vercel (Pubblico)
- `https://tradelia.org/api/webhook-lemonsqueezy`
- `https://tradelia.org/api/webhook-stripe`
- `https://tradelia.org/api/create-checkout-session`
- `https://tradelia.org/api/check-subscription`
- `https://tradelia.org/api/vote`

### Cloudflare (Completo - Interno)
- `https://admin.tradelia.org/api/admin/*` (tutte le funzioni admin)
- `https://admin.tradelia.org/api/send-email`
- `https://admin.tradelia.org/api/send-push`
- `https://admin.tradelia.org/api/cancel-subscription`
- ... tutte le altre funzioni

---

## ✅ Checklist Setup

### Vercel
- [x] `.vercelignore` creato
- [x] `vercel.json` configurato con ignore
- [ ] Verificare che solo 7 funzioni vengano deployate
- [ ] Testare webhook pubblici

### Cloudflare
- [ ] Creare progetto Cloudflare Pages
- [ ] Connettersi a repository GitHub
- [ ] Configurare environment variables
- [ ] Deploy completo
- [ ] Testare tutte le funzioni

---

## 🔐 Environment Variables

### Vercel (Pubbliche)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Cloudflare (Complete)
- Tutte le variabili Vercel +
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_VAPID_PRIVATE_KEY`
- `FIREBASE_SERVICE_ACCOUNT`
- `RESEND_API_KEY`
- `PUSH_API_KEY`

---

## 📊 Conteggio Funzioni

| Piattaforma | Funzioni | Limite | Status |
|------------|----------|--------|--------|
| **Vercel** | 7 | 12 | ✅ OK |
| **Cloudflare** | 22 | Illimitato | ✅ OK |

---

## 🎯 Vantaggi

1. **Vercel**: Deployment pubblico veloce, solo funzioni essenziali
2. **Cloudflare**: Versione completa per uso interno/admin
3. **Costi**: Vercel Hobby gratuito, Cloudflare Pages gratuito
4. **Flessibilità**: Funzioni private non esposte pubblicamente
5. **Sicurezza**: Admin functions solo su Cloudflare

---

## 📚 Note

- Le funzioni pubbliche su Vercel sono accessibili a tutti
- Le funzioni private su Cloudflare richiedono autenticazione
- I webhook pubblici devono essere su Vercel (URL pubblici)
- Le funzioni admin possono essere su Cloudflare (URL privati)

