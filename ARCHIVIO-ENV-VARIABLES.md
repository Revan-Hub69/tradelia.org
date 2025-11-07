# 🔐 Variabili d'Ambiente - Configurazione Completa

## 📋 Situazione Attuale

### ✅ Chiavi Hardcoded (per browser)
- **Supabase**: `archivio/assets/js/supabase-config.js` (URL + Anon Key)
- **Firebase/FCM**: `archivio/assets/js/fcm-config.js` (API Key, Project ID, VAPID Public Key)

### ⚠️ Variabili d'Ambiente (per server/API)
Le API usano `process.env` ma **NON sono configurate** in Vercel/Cloudflare Pages.

---

## 🔧 Variabili Necessarie

### 1. **Supabase** (per API server-side)

**Variabili:**
- `SUPABASE_URL` - URL progetto Supabase
- `SUPABASE_ANON_KEY` - Anon Key Supabase

**Dove serve:**
- `/api/webhook-lemonsqueezy.js`
- `/api/check-subscription.js`
- `/api/send-push.js`
- `/api/vote.js`

**Valori attuali (hardcoded):**
```
SUPABASE_URL=https://higkhlfjfhlecbtfnznx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw
```

---

### 2. **Firebase/FCM** (per API server-side)

**Variabili:**
- `FIREBASE_VAPID_PRIVATE_KEY` - VAPID Private Key
- `FIREBASE_SERVICE_ACCOUNT` - Service Account JSON (come stringa)

**Dove serve:**
- `/api/send-push.js`

**Valori attuali (da `archivio/firebase-private-config.local.js`):**
```
FIREBASE_VAPID_PRIVATE_KEY=E6cggtHVRuV6v3vDkoRDU_oRcgsGid8QFAs0R1n9JQ
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"tradelia-push",...}
```

**Nota**: `FIREBASE_SERVICE_ACCOUNT` deve essere il JSON completo come stringa (non un file).

---

### 3. **Resend** (per email backup)

**Variabili:**
- `RESEND_API_KEY` - API Key Resend

**Dove serve:**
- `/api/send-email-backup.js`
- `/api/send-email.js`

**Formato:**
```
RESEND_API_KEY=re_xxxxx
```

---

### 4. **Lemon Squeezy** (per pagamenti)

**Variabili:**
- `LEMONSQUEEZY_API_KEY` - API Key Lemon Squeezy
- `LEMONSQUEEZY_STORE_ID` - Store ID Lemon Squeezy
- `LEMONSQUEEZY_WEBHOOK_SECRET` - Webhook Secret Lemon Squeezy

**Dove serve:**
- `/api/webhook-lemonsqueezy.js`

**Formato:**
```
LEMONSQUEEZY_API_KEY=xxxxx
LEMONSQUEEZY_STORE_ID=xxxxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxxxx
```

---

### 5. **Push API Key** (opzionale, per sicurezza)

**Variabili:**
- `PUSH_API_KEY` - API Key per proteggere `/api/send-push`

**Dove serve:**
- `/api/send-push.js` (verifica autorizzazione)

**Formato:**
```
PUSH_API_KEY=your-secret-api-key-here
```

---

## 🚀 Come Configurare

### **Opzione 1: Vercel**

1. Vai su **Vercel Dashboard** → **Project** → **Settings** → **Environment Variables**
2. Aggiungi tutte le variabili sopra
3. Seleziona **Environment**: Production, Preview, Development (o tutte)
4. Clicca **Save**

**URL**: `https://vercel.com/[project]/settings/environment-variables`

---

### **Opzione 2: Cloudflare Pages**

1. Vai su **Cloudflare Dashboard** → **Pages** → **Project** → **Settings** → **Environment Variables**
2. Aggiungi tutte le variabili sopra
3. Seleziona **Environment**: Production, Preview (o entrambe)
4. Clicca **Save**

**URL**: `https://dash.cloudflare.com/[account]/pages/[project]/settings/environment-variables`

---

## 📝 Checklist Completa

### **Variabili Essenziali (per funzionamento base)**
- [ ] `SUPABASE_URL` - Aggiunta in Vercel/Cloudflare Pages
- [ ] `SUPABASE_ANON_KEY` - Aggiunta in Vercel/Cloudflare Pages
- [ ] `FIREBASE_VAPID_PRIVATE_KEY` - Aggiunta in Vercel/Cloudflare Pages
- [ ] `FIREBASE_SERVICE_ACCOUNT` - Aggiunta in Vercel/Cloudflare Pages (JSON come stringa)

### **Variabili Opzionali (per funzionalità avanzate)**
- [ ] `RESEND_API_KEY` - Aggiunta in Vercel/Cloudflare Pages (per email backup)
- [ ] `LEMONSQUEEZY_API_KEY` - Aggiunta in Vercel/Cloudflare Pages (per pagamenti)
- [ ] `LEMONSQUEEZY_STORE_ID` - Aggiunta in Vercel/Cloudflare Pages (per pagamenti)
- [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` - Aggiunta in Vercel/Cloudflare Pages (per pagamenti)
- [ ] `PUSH_API_KEY` - Aggiunta in Vercel/Cloudflare Pages (per sicurezza API push)

---

## ⚠️ Note Importanti

### **1. FIREBASE_SERVICE_ACCOUNT**
- Deve essere il JSON completo come **stringa** (non un file)
- Formato: `{"type":"service_account","project_id":"...",...}`
- Puoi copiarlo da `archivio/firebase-private-config.local.js`

### **2. Chiavi Hardcoded vs Variabili d'Ambiente**
- **Browser** (frontend): Chiavi hardcoded in `supabase-config.js` e `fcm-config.js` (OK, sono pubbliche)
- **Server** (API): Usa variabili d'ambiente (NECESSARIO per sicurezza)

### **3. Variabili Pubbliche vs Private**
- **Pubbliche** (OK hardcoded): Supabase Anon Key, Firebase API Key, VAPID Public Key
- **Private** (NECESSARIO env vars): VAPID Private Key, Service Account, API Keys

---

## 🔍 Verifica Configurazione

### **Test 1: Verifica Variabili in Vercel**
1. Vai su Vercel Dashboard → Project → Settings → Environment Variables
2. Verifica che tutte le variabili essenziali siano presenti
3. Verifica che siano selezionate per l'ambiente corretto (Production/Preview)

### **Test 2: Verifica Variabili in Cloudflare Pages**
1. Vai su Cloudflare Dashboard → Pages → Project → Settings → Environment Variables
2. Verifica che tutte le variabili essenziali siano presenti
3. Verifica che siano selezionate per l'ambiente corretto (Production/Preview)

### **Test 3: Test API**
1. Test `/api/check-subscription` (richiede Supabase)
2. Test `/api/send-push` (richiede Firebase)
3. Test `/api/webhook-lemonsqueezy` (richiede Lemon Squeezy)

---

## 📚 Riferimenti

- **Supabase**: https://supabase.com/docs/guides/api
- **Firebase**: https://firebase.google.com/docs/cloud-messaging
- **Resend**: https://resend.com/docs/api-reference
- **Lemon Squeezy**: https://docs.lemonsqueezy.com/api

---

**Nota**: Dopo aver aggiunto le variabili d'ambiente, **ricorda di fare un nuovo deploy** per applicare le modifiche!

