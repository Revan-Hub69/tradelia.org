# 📋 Archivio - TODO Completo

## 🔑 1. CREDENZIALI DA FORNIRE

### Supabase (Autenticazione)
- [ ] **URL Progetto**: `https://xxxxx.supabase.co`
- [ ] **Anon Key**: `eyJhbGc...`
- [ ] **Dove**: Aggiornare `/archivio/assets/js/supabase-config.js`

### Firebase/FCM (Push Notifications)
- [ ] **API Key**: `AIza...`
- [ ] **Project ID**: `xxxxx`
- [ ] **Sender ID**: `xxxxx`
- [ ] **App ID**: `1:xxxxx:web:xxxxx`
- [ ] **VAPID Public Key**: `BG...`
- [ ] **Dove**: Aggiornare `/archivio/assets/js/fcm-config.js`

### Vercel KV (Votazioni)
- [ ] **URL**: `https://xxxxx.upstash.io`
- [ ] **Token**: `xxxxx`
- [ ] **Dove**: Variabili ambiente Vercel

### Lemon Squeezy (Pagamenti)
- [ ] **API Key**: `xxxxx`
- [ ] **Store ID**: `xxxxx`
- [ ] **Webhook Secret**: `xxxxx`
- [ ] **Dove**: Variabili ambiente Vercel

### Resend (Email)
- [ ] **API Key**: `re_xxxxx` (già presente in `/api/send-email.js`)
- [ ] **Dove**: Variabile ambiente Vercel `RESEND_API_KEY`

---

## 📁 2. FILE DA CONFIGURARE

### `/archivio/assets/js/supabase-config.js`
- [ ] Sostituire `YOUR_SUPABASE_URL` con URL reale
- [ ] Sostituire `YOUR_SUPABASE_ANON_KEY` con Anon Key reale
- [ ] Decommentare import Supabase client

### `/archivio/assets/js/fcm-config.js`
- [ ] Sostituire `YOUR_FIREBASE_API_KEY` con API Key reale
- [ ] Sostituire `YOUR_FIREBASE_PROJECT_ID` con Project ID reale
- [ ] Sostituire `YOUR_FIREBASE_SENDER_ID` con Sender ID reale
- [ ] Sostituire `YOUR_FIREBASE_APP_ID` con App ID reale
- [ ] Sostituire `YOUR_VAPID_PUBLIC_KEY` con VAPID Public Key reale

### `/archivio/assets/js/dashboard.js`
- [ ] Decommentare import Supabase client (linea 15-16)
- [ ] Decommentare codice login Supabase (linea ~200-210)
- [ ] Decommentare codice logout Supabase (linea ~220-230)
- [ ] Decommentare codice checkAuth Supabase (linea ~150-160)

---

## 🗄️ 3. DATABASE - SCRIPT SQL DA ESEGUIRE

### Supabase - Crea Tabelle

Eseguire in Supabase Dashboard → SQL Editor:

```sql
-- Tabella abbonati
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscription_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabella push subscriptions
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indice per ricerca rapida
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
```

---

## 📦 4. DIPENDENZE NPM DA INSTALLARE

Creare `package.json` nella root del progetto (se non esiste):

```json
{
  "name": "tradelia-org",
  "version": "1.0.0",
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@vercel/kv": "^0.2.0",
    "firebase-admin": "^12.0.0"
  }
}
```

Poi eseguire:
```bash
npm install
```

**Oppure installare singolarmente:**
```bash
npm install @supabase/supabase-js
npm install @vercel/kv
npm install firebase-admin
```

---

## 💻 5. CODICE DA IMPLEMENTARE

### `/api/push-subscribe.js`
- [ ] Implementare salvataggio subscription in Supabase o Vercel KV
- [ ] Aggiungere logica per associare subscription a userId

### `/api/send-push.js`
- [ ] Implementare recupero subscriptions da database
- [ ] Implementare invio push via FCM API
- [ ] Aggiungere gestione errori e retry
- [ ] Configurare Firebase Admin SDK

### `/api/vote.js`
- [ ] Verificare che Vercel KV sia configurato correttamente
- [ ] Testare funzionalità di voto

### `/api/webhook-lemonsqueezy.js`
- [ ] Verificare webhook secret
- [ ] Testare gestione eventi pagamento

---

## 🎨 6. ICONE PWA DA CREARE

### File da creare:
- [ ] `/icons/icon-192.png` (192x192 pixel)
- [ ] `/icons/icon-512.png` (512x512 pixel)

### Strumenti consigliati:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

### Note:
- Usare logo Tradelia come base
- Formato PNG
- Sfondo trasparente o nero (#0f0f0f)

---

## 🔐 7. VARIABILI AMBIENTE VERCEL

Aggiungere in Vercel Dashboard → Settings → Environment Variables:

```
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...

# Firebase
FIREBASE_API_KEY=AIza...
FIREBASE_PROJECT_ID=xxxxx
FIREBASE_SENDER_ID=xxxxx
FIREBASE_APP_ID=1:xxxxx:web:xxxxx
FIREBASE_VAPID_PUBLIC_KEY=BG...
FIREBASE_SERVICE_ACCOUNT_KEY={...}  # Per Firebase Admin SDK

# Vercel KV
KV_REST_API_URL=https://xxxxx.upstash.io
KV_REST_API_TOKEN=xxxxx

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=xxxxx
LEMONSQUEEZY_STORE_ID=xxxxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxxxx

# Resend
RESEND_API_KEY=re_xxxxx
```

---

## 🧪 8. TEST DA ESEGUIRE

### Test Autenticazione
- [ ] Test login con email/password
- [ ] Test logout
- [ ] Test sessione persistente
- [ ] Test verifica abbonamento

### Test Push Notifications
- [ ] Test registrazione subscription
- [ ] Test invio push manuale
- [ ] Test ricezione push su mobile
- [ ] Test ricezione push su desktop

### Test Votazioni
- [ ] Test invio voto
- [ ] Test recupero ranking
- [ ] Test reset giornaliero voti

### Test Pagamenti
- [ ] Test webhook Lemon Squeezy
- [ ] Test creazione abbonamento
- [ ] Test cancellazione abbonamento

### Test Dashboard
- [ ] Test visualizzazione report (pubblici)
- [ ] Test visualizzazione report (abbonati, < 24h)
- [ ] Test filtri avanzati
- [ ] Test ordinamento

---

## 📝 9. DOCUMENTAZIONE DA AGGIORNARE

- [ ] Aggiornare `/ARCHIVIO-SETUP.md` con eventuali modifiche
- [ ] Documentare eventuali personalizzazioni
- [ ] Creare guida per utenti finali (opzionale)

---

## 🚀 10. DEPLOY

- [ ] Verificare che tutte le variabili ambiente siano configurate
- [ ] Testare in ambiente di staging
- [ ] Deploy in produzione
- [ ] Verificare funzionamento post-deploy

---

## ✅ CHECKLIST FINALE

- [ ] Tutte le credenziali fornite
- [ ] Tutti i file configurati
- [ ] Database creato e popolato
- [ ] Dipendenze installate
- [ ] Codice implementato
- [ ] Icone PWA create
- [ ] Variabili ambiente Vercel aggiunte
- [ ] Test completati
- [ ] Deploy completato

---

*Ultimo aggiornamento: 2025-01-27*

