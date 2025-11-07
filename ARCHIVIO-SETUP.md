# Archivio - Setup e Configurazione

## 📋 Riepilogo Implementazione

Tutti i file sono stati creati e implementati. Ora serve configurare i servizi esterni.

## ✅ File Creati

### Archivio
- ✅ `/archivio/index.html` - Archivio pubblico
- ✅ `/archivio/dashboard.html` - Dashboard abbonati
- ✅ `/archivio/manifest.json` - Manifest report (generato automaticamente)
- ✅ `/archivio/documents.json` - Documenti tutorial
- ✅ `/archivio/generate-manifest.js` - Script generazione manifest

### API
- ✅ `/api/vote.js` - Votazioni (Vercel KV)
- ✅ `/api/push-subscribe.js` - Registrazione push
- ✅ `/api/send-push.js` - Invio push
- ✅ `/api/send-email-backup.js` - Email backup
- ✅ `/api/webhook-lemonsqueezy.js` - Webhook pagamenti

### Configurazione
- ✅ `/archivio/assets/js/supabase-config.js` - Config Supabase
- ✅ `/archivio/assets/js/fcm-config.js` - Config FCM

### PWA
- ✅ `/manifest.json` - PWA manifest
- ✅ `/sw.js` - Service Worker

## 🔧 Configurazione Necessaria

### 1. Supabase (Autenticazione)

**Crea account**: https://supabase.com

**Crea progetto**:
1. Nuovo progetto
2. Copia URL e Anon Key
3. Aggiorna `/archivio/assets/js/supabase-config.js`:
   ```javascript
   export const SUPABASE_CONFIG = {
     url: 'https://xxxxx.supabase.co',
     anonKey: 'eyJhbGc...'
   };
   ```

**Crea tabelle**:
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
  user_id UUID REFERENCES subscribers(id),
  subscription JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella voti (opzionale, se non usi Vercel KV)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES subscribers(id),
  ticker TEXT NOT NULL,
  votes INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Installa Supabase client**:
```bash
npm install @supabase/supabase-js
```

**Aggiorna `/archivio/assets/js/dashboard.js`**:
- Decommenta import Supabase
- Decommenta codice login/logout Supabase

### 2. Firebase (FCM Push)

**Crea account**: https://firebase.google.com

**Crea progetto**:
1. Nuovo progetto
2. Abilita Cloud Messaging
3. Genera VAPID keys
4. Copia configurazione
5. Aggiorna `/archivio/assets/js/fcm-config.js`:
   ```javascript
   export const FCM_CONFIG = {
     apiKey: 'AIza...',
     projectId: 'xxxxx',
     messagingSenderId: 'xxxxx',
     appId: '1:xxxxx:web:xxxxx',
     vapidPublicKey: 'BG...'
   };
   ```

**Configura FCM in `/api/send-push.js`**:
- Installa Firebase Admin SDK
- Configura credenziali Firebase

### 3. Vercel KV (Votazioni)

**Setup Vercel KV**:
1. Vercel Dashboard → Storage → Create KV Database
2. Copia URL e Token
3. Aggiungi variabili ambiente Vercel:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

**Installa Vercel KV**:
```bash
npm install @vercel/kv
```

### 4. Lemon Squeezy (Pagamenti)

**Crea account**: https://lemonsqueezy.com

**Configura webhook**:
1. Dashboard → Settings → Webhooks
2. Aggiungi webhook: `https://tuo-dominio.vercel.app/api/webhook-lemonsqueezy`
3. Copia Webhook Secret
4. Aggiungi variabili ambiente Vercel:
   - `LEMONSQUEEZY_API_KEY`
   - `LEMONSQUEEZY_STORE_ID`
   - `LEMONSQUEEZY_WEBHOOK_SECRET`

### 5. Resend (Email)

**API Key già presente** in `/api/send-email.js`

**Aggiungi variabile ambiente Vercel**:
- `RESEND_API_KEY=re_xxxxx`

## 📝 Variabili Ambiente Vercel

Aggiungi tutte queste in Vercel Dashboard → Settings → Environment Variables:

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

## 🎨 Icone PWA

**Crea icone**:
- `/icons/icon-192.png` (192x192)
- `/icons/icon-512.png` (512x512)

**Strumenti**:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## 🚀 Come Usare

### 1. Generare Manifest
```bash
node archivio/generate-manifest.js
```
Esegui dopo ogni nuovo report aggiunto.

### 2. Test Dashboard
1. Vai su `/archivio/dashboard.html`
2. Login (quando Supabase è configurato)
3. Vedi tutti i report (anche < 24h)
4. Vota titoli

### 3. Test Push
1. Abbonato accetta permessi push
2. Sistema registra subscription
3. Quando esce nuovo report → push automatica

## 📊 Checklist Finale

- [ ] Account Supabase creato
- [ ] Tabelle Supabase create
- [ ] Config Supabase aggiornata
- [ ] Account Firebase creato
- [ ] Config FCM aggiornata
- [ ] Vercel KV configurato
- [ ] Account Lemon Squeezy creato
- [ ] Webhook Lemon Squeezy configurato
- [ ] Variabili ambiente Vercel aggiunte
- [ ] Icone PWA create
- [ ] Test dashboard
- [ ] Test push
- [ ] Test votazioni

---

*Documento creato il 2025-01-27*

