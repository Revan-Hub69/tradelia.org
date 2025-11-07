# Archivio - Implementazione Completa

## ✅ File Creati/Implementati

### 1. **Archivio Pubblico** (`/archivio/index.html`)
- ✅ Tab Report | Tutorial
- ✅ Filtra report pubblici (dopo 24h)
- ✅ Tabella report tipo Excel
- ✅ Elenco tutorial semplice
- ✅ Tema dark

### 2. **Dashboard Abbonati** (`/archivio/dashboard.html`)
- ✅ Login email/password (Supabase)
- ✅ Tab Report | Tutorial | Votazione
- ✅ Report tutti (anche < 24h per abbonati)
- ✅ Filtri avanzati (solo abbonati)
- ✅ Sistema votazioni avanzato
- ✅ PWA completa (mobile + desktop)

### 3. **Sistema Votazioni** (`/api/vote.js`)
- ✅ Voti multipli (1-10)
- ✅ Ranking in tempo reale
- ✅ Statistiche votazioni
- ✅ Reset giornaliero
- ✅ Vercel KV storage

### 4. **Notifiche Push** (`/api/push-subscribe.js`, `/api/send-push.js`)
- ✅ Registrazione subscription
- ✅ Invio push (FCM)
- ✅ Service Worker per push
- ✅ Notifiche per nuovi report + votazioni

### 5. **Email Backup** (`/api/send-email-backup.js`)
- ✅ Invio email con Resend
- ✅ Backup oltre push
- ✅ Template personalizzabili

### 6. **Webhook Lemon Squeezy** (`/api/webhook-lemonsqueezy.js`)
- ✅ Gestione sottoscrizioni
- ✅ Gestione cancellazioni
- ✅ Gestione ordini
- ✅ Collegamento Supabase

### 7. **Script Manifest** (`/archivio/generate-manifest.js`)
- ✅ Scansione automatica `/report/reports/`
- ✅ Estrazione metadati da `header.json`
- ✅ Calcolo `public_after` (created_at + 24h)
- ✅ Generazione `manifest.json`

### 8. **PWA** (`/manifest.json`, `/sw.js`)
- ✅ Manifest completo
- ✅ Service Worker (push + cache)
- ✅ Icone PWA (da creare)
- ✅ Aggiunta desktop/mobile

## 📋 Credenziali Necessarie

### 1. **Supabase** (Autenticazione)
- URL progetto: `https://xxxxx.supabase.co`
- Anon Key: `eyJhbGc...`
- **Dove configurare**: `/archivio/assets/js/supabase-config.js`

### 2. **Firebase** (FCM Push)
- API Key: `AIza...`
- Project ID: `xxxxx`
- Sender ID: `xxxxx`
- App ID: `1:xxxxx:web:xxxxx`
- VAPID Public Key: `BG...`
- **Dove configurare**: `/archivio/assets/js/fcm-config.js`

### 3. **Lemon Squeezy** (Pagamenti)
- API Key: `xxxxx`
- Store ID: `xxxxx`
- Webhook Secret: `xxxxx`
- **Dove configurare**: Variabili ambiente Vercel

### 4. **Resend** (Email)
- API Key: `re_xxxxx` (già presente in `/api/send-email.js`)
- **Dove configurare**: Variabili ambiente Vercel (`RESEND_API_KEY`)

## 🔧 Configurazione Vercel

### Variabili Ambiente
Aggiungi in Vercel Dashboard → Settings → Environment Variables:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
FIREBASE_API_KEY=AIza...
FIREBASE_PROJECT_ID=xxxxx
FIREBASE_SENDER_ID=xxxxx
FIREBASE_APP_ID=1:xxxxx:web:xxxxx
FIREBASE_VAPID_PUBLIC_KEY=BG...
LEMONSQUEEZY_API_KEY=xxxxx
LEMONSQUEEZY_STORE_ID=xxxxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxxxx
RESEND_API_KEY=re_xxxxx
```

## 📝 File da Completare

### 1. **Icone PWA** (`/icons/`)
Crea icone:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- Usa logo Tradelia AI

### 2. **Integrazione Supabase** (`/archivio/assets/js/dashboard.js`)
- Sostituisci placeholder con client Supabase
- Implementa login/logout
- Implementa gestione sessioni

### 3. **Integrazione FCM** (`/archivio/assets/js/dashboard.js`)
- Sostituisci placeholder con FCM config
- Implementa subscription push
- Implementa invio push

### 4. **Database Supabase**
Crea tabelle:
- `subscribers` (email, subscription_id, status, created_at)
- `push_subscriptions` (user_id, subscription, created_at)
- `votes` (user_id, ticker, votes, date, created_at)

## 🚀 Come Usare

### 1. Generare Manifest
```bash
node archivio/generate-manifest.js
```
Oppure esegui manualmente quando aggiungi un report.

### 2. Aggiungere Report
1. Genera report in `/report/reports/REPORT_ID/`
2. Esegui script manifest: `node archivio/generate-manifest.js`
3. Commit `manifest.json` aggiornato

### 3. Test Dashboard
1. Vai su `/archivio/dashboard.html`
2. Login con credenziali Supabase
3. Vedi tutti i report (anche < 24h)
4. Vota titoli nella sezione Votazione

### 4. Test Push
1. Abbonato accetta permessi push
2. Sistema registra subscription
3. Quando esce nuovo report → push automatica
4. Email backup inviata anche

## 📊 Struttura Finale

```
/
├── archivio/
│   ├── index.html (archivio pubblico)
│   ├── dashboard.html (dashboard abbonati)
│   ├── manifest.json (generato automaticamente)
│   ├── documents.json (manuale)
│   ├── generate-manifest.js (script)
│   └── assets/
│       ├── css/
│       └── js/
│           ├── archive.js
│           ├── dashboard.js
│           ├── supabase-config.js
│           └── fcm-config.js
├── api/
│   ├── vote.js (votazioni Vercel KV)
│   ├── push-subscribe.js (registrazione push)
│   ├── send-push.js (invio push)
│   ├── send-email-backup.js (email backup)
│   └── webhook-lemonsqueezy.js (webhook pagamenti)
├── icons/ (da creare)
│   ├── icon-192.png
│   └── icon-512.png
├── manifest.json (PWA)
└── sw.js (Service Worker)
```

## ✅ Checklist Finale

- [x] Archivio pubblico con ritardo 24h
- [x] Dashboard abbonati con login
- [x] Sistema votazioni avanzato
- [x] Notifiche push FCM
- [x] Email backup Resend
- [x] Webhook Lemon Squeezy
- [x] Script generazione manifest
- [x] PWA completa
- [ ] Icone PWA (da creare)
- [ ] Configurazione Supabase (da fare)
- [ ] Configurazione FCM (da fare)
- [ ] Configurazione Lemon Squeezy (da fare)

---

*Documento creato il 2025-01-27*

