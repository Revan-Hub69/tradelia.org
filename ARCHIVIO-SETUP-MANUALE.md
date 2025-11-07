# 📋 Setup Manuale Dashboard - Tradelia Archivio

Questa guida contiene **tutti i passaggi manuali** necessari per configurare la dashboard abbonati.

---

## ✅ 1. SUPABASE - Database e Autenticazione

### 1.1 Verifica/Crea Progetto Supabase

1. Vai su https://supabase.com e accedi
2. Se non hai un progetto, creane uno nuovo
3. Copia:
   - **URL Progetto**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (Settings → API → Project API keys → anon public)

### 1.2 Esegui Script SQL

1. Nel dashboard Supabase, vai a **SQL Editor**
2. Apri il file `/archivio/setup-supabase.sql`
3. **Copia e incolla tutto lo script** nell'editor SQL
4. Clicca **Run** (o F5)
5. Verifica che non ci siano errori

**Cosa crea lo script:**
- ✅ Tabelle: `subscribers`, `push_subscriptions`
- ✅ Indici per performance
- ✅ Trigger per `updated_at`
- ✅ Row Level Security (RLS) policies
- ✅ Colonna `auth_user_id` per collegare auth.users a subscribers

### 1.3 Verifica Tabelle Create

1. Vai a **Table Editor** nel dashboard Supabase
2. Dovresti vedere:
   - ✅ `subscribers` (con colonna `auth_user_id`)
   - ✅ `push_subscriptions`

### 1.4 Verifica RLS Policies

1. Vai a **Authentication** → **Policies**
2. Verifica che le policies siano attive:
   - ✅ `subscribers`: "Users can view own data", "Users can insert own data", "Users can update own data"
   - ✅ `push_subscriptions`: "Users can view own subscriptions", "Users can insert own subscriptions", ecc.

### 1.5 Configura Autenticazione Email/Password

1. Vai a **Authentication** → **Providers**
2. Assicurati che **Email** sia abilitato
3. Configura (opzionale):
   - Email templates
   - Redirect URLs
   - Rate limiting

### 1.6 Crea Primo Utente di Test

**Opzione A: Via Dashboard Supabase**
1. Vai a **Authentication** → **Users**
2. Clicca **Add user** → **Create new user**
3. Inserisci email e password
4. **IMPORTANTE**: Dopo la creazione, l'utente deve fare login almeno una volta per creare il record in `subscribers` automaticamente

**Opzione B: Via Dashboard Web**
1. Vai su `/archivio/dashboard.html`
2. Clicca **Sign up** (se implementato) oppure crea utente manualmente in Supabase
3. Fai login con email/password

---

## ✅ 2. VERCEL KV - Database per Votazioni

### 2.1 Crea Database KV

1. Vai su https://vercel.com e accedi
2. Seleziona il tuo progetto (o creane uno)
3. Vai a **Storage** → **Create Database**
4. Seleziona **KV** (Key-Value)
5. Scegli un nome (es. `tradelia-kv`)
6. Seleziona regione (es. `iad1` - US East)
7. Clicca **Create**

### 2.2 Configura Variabili d'Ambiente

1. Nel progetto Vercel, vai a **Settings** → **Environment Variables**
2. Aggiungi queste variabili (se non esistono già):
   - `KV_REST_API_URL` → Copia da Storage → KV → API → REST API URL
   - `KV_REST_API_TOKEN` → Copia da Storage → KV → API → REST API Token
   - `KV_REST_API_READ_ONLY_TOKEN` → (Opzionale, per read-only)

### 2.3 Verifica Configurazione

1. Dopo il deploy, testa l'API:
   ```bash
   curl https://tuo-dominio.vercel.app/api/vote
   ```
2. Dovresti ricevere: `{"votes":[]}` (vuoto se non ci sono voti)

---

## ✅ 3. FIREBASE CLOUD MESSAGING (FCM) - Push Notifications

> **Nota**: Le push notifications sono opzionali. Se non le usi, puoi saltare questo step.

### 3.1 Crea Progetto Firebase

1. Vai su https://console.firebase.google.com
2. Clicca **Add project** (o seleziona progetto esistente)
3. Inserisci nome progetto (es. `tradelia-push`)
4. Segui la procedura guidata

### 3.2 Configura Web App

1. Nel progetto Firebase, vai a **Project Settings** (⚙️)
2. Scorri fino a **Your apps**
3. Clicca **Web** (</> icon)
4. Inserisci nome app (es. `Tradelia Dashboard`)
5. **Non** selezionare "Also set up Firebase Hosting"
6. Clicca **Register app**
7. **Copia le credenziali**:
   ```javascript
   apiKey: "AIza...",
   authDomain: "xxxxx.firebaseapp.com",
   projectId: "xxxxx",
   messagingSenderId: "123456789",
   appId: "1:123456789:web:xxxxx"
   ```

### 3.3 Configura Cloud Messaging

1. Nel progetto Firebase, vai a **Cloud Messaging**
2. Vai a **Cloud Messaging API (V1)** → **Settings**
3. Genera **VAPID key pair**:
   - Clicca **Generate key pair**
   - **Copia la chiave pubblica** (inizia con `BM...`)

### 3.4 Aggiorna Configurazione

1. Apri `/archivio/assets/js/fcm-config.js`
2. Sostituisci i placeholder con le credenziali Firebase:
   ```javascript
   export const FCM_CONFIG = {
     apiKey: 'AIza...', // Da Firebase config
     projectId: 'xxxxx', // Da Firebase config
     messagingSenderId: '123456789', // Da Firebase config
     appId: '1:123456789:web:xxxxx', // Da Firebase config
     vapidPublicKey: 'BM...' // VAPID public key
   };
   ```

### 3.5 Configura Service Account (per API Server)

1. In Firebase, vai a **Project Settings** → **Service accounts**
2. Clicca **Generate new private key**
3. Scarica il file JSON
4. **IMPORTANTE**: Non committare questo file! Aggiungilo a `.gitignore`
5. In Vercel, aggiungi variabile d'ambiente:
   - `FIREBASE_SERVICE_ACCOUNT` → Contenuto del file JSON (come stringa)

---

## ✅ 4. VERCEL - Configurazione API Endpoints

### 4.1 Verifica Deploy

1. Assicurati che il progetto sia deployato su Vercel
2. Verifica che le API routes siano accessibili:
   - `/api/vote` (GET e POST)
   - `/api/push-subscribe` (POST)
   - `/api/send-push` (POST, richiede auth)

### 4.2 Configura CORS (se necessario)

Le API hanno già CORS configurato, ma se hai problemi:

1. In Vercel, vai a **Settings** → **Functions**
2. Verifica che le regioni siano configurate correttamente

### 4.3 Test API Endpoints

**Test Votazioni:**
```bash
# GET voti
curl https://tuo-dominio.vercel.app/api/vote

# POST voto
curl -X POST https://tuo-dominio.vercel.app/api/vote \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","votes":5,"userId":"test"}'
```

**Test Push Subscribe:**
```bash
curl -X POST https://tuo-dominio.vercel.app/api/push-subscribe \
  -H "Content-Type: application/json" \
  -d '{"subscription":{"endpoint":"test"},"userId":"test"}'
```

---

## ✅ 5. VERIFICA FINALE

### 5.1 Test Login Dashboard

1. Vai su `/archivio/dashboard.html`
2. Prova a fare login con un utente creato in Supabase
3. Verifica che:
   - ✅ Login funziona
   - ✅ Dashboard si carica
   - ✅ Tab Report mostra i report
   - ✅ Tab Tutorial mostra i tutorial
   - ✅ Tab Votazione funziona

### 5.2 Test Votazioni

1. Nella dashboard, vai al tab **Votazione**
2. Inserisci un ticker (es. `AAPL`) e voti (1-10)
3. Clicca **Vota**
4. Verifica che:
   - ✅ Il voto viene salvato
   - ✅ Il ranking si aggiorna
   - ✅ Le statistiche si aggiornano

### 5.3 Test Push Notifications (se configurato)

1. Fai login nella dashboard
2. Accetta i permessi per le notifiche
3. Verifica che:
   - ✅ La subscription viene salvata in Supabase (`push_subscriptions` table)
   - ✅ Le notifiche funzionano (test manuale)

---

## 🔧 TROUBLESHOOTING

### Errore: "Failed to fetch" su API

**Causa**: CORS o endpoint non configurato
**Soluzione**: 
- Verifica che le API routes siano deployate su Vercel
- Controlla la console del browser per errori CORS

### Errore: "Row Level Security policy violation"

**Causa**: RLS policies non configurate correttamente
**Soluzione**:
- Verifica che lo script SQL sia stato eseguito completamente
- Controlla che `auth_user_id` sia popolato correttamente
- Verifica le policies in Supabase Dashboard

### Errore: "KV connection failed"

**Causa**: Vercel KV non configurato
**Soluzione**:
- Verifica che il database KV sia creato
- Controlla le variabili d'ambiente `KV_REST_API_URL` e `KV_REST_API_TOKEN`
- Riavvia il deploy su Vercel

### Errore: "Firebase not initialized"

**Causa**: FCM non configurato (opzionale)
**Soluzione**:
- Se non usi push notifications, puoi ignorare questo errore
- Altrimenti, completa la configurazione FCM (sezione 3)

---

## 📝 CHECKLIST FINALE

- [ ] Supabase progetto creato e configurato
- [ ] Script SQL eseguito (tabelle, RLS, policies)
- [ ] Primo utente creato e testato
- [ ] Vercel KV database creato
- [ ] Variabili d'ambiente Vercel configurate
- [ ] API endpoints testate e funzionanti
- [ ] Dashboard login funziona
- [ ] Votazioni funzionano
- [ ] (Opzionale) FCM configurato per push notifications

---

## 🎉 COMPLETATO!

Una volta completati tutti gli step, la dashboard è pronta per l'uso!

Per domande o problemi, controlla i log:
- **Browser Console**: Errori JavaScript
- **Vercel Logs**: Errori API server-side
- **Supabase Logs**: Errori database e autenticazione

