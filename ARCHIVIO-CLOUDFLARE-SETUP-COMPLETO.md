# 🌐 Guida Completa Setup Cloudflare Pages - Variabili d'Ambiente

## 📋 Checklist Completa

### ✅ **Variabili Essenziali** (5 variabili)

1. ✅ `SUPABASE_URL`
2. ✅ `SUPABASE_ANON_KEY`
3. ✅ `FIREBASE_VAPID_PRIVATE_KEY`
4. ✅ `FIREBASE_SERVICE_ACCOUNT`
5. ✅ `RESEND_API_KEY`

### ⚠️ **Variabili Opzionali** (5 variabili)

6. ⚠️ `PADDLE_VENDOR_ID` (se hai account Paddle)
7. ⚠️ `PADDLE_VENDOR_API_KEY` (se hai account Paddle)
8. ⚠️ `PADDLE_PUBLIC_KEY` (se hai account Paddle - opzionale per frontend)
9. ⚠️ `PADDLE_WEBHOOK_SECRET` (se hai account Paddle)
10. ⚠️ `PUSH_API_KEY` (opzionale - scegli una chiave segreta)

---

## 🚀 Setup Passo-Passo

### **Passo 1: Accedi a Cloudflare Dashboard**
1. Vai su https://dash.cloudflare.com
2. Accedi al tuo account
3. Seleziona il progetto **tradelia.org** (o il nome del tuo progetto)

### **Passo 2: Vai a Environment Variables**
1. Vai su **Pages** → **tradelia.org** (o il nome del tuo progetto)
2. Clicca su **Settings** (nella barra superiore)
3. Scorri fino a **Environment Variables**

### **Passo 3: Aggiungi Variabili Essenziali**

Per ogni variabile:
1. Clicca su **Add variable**
2. Inserisci **Variable name** (nome variabile)
3. Inserisci **Value** (valore - copia da `ARCHIVIO-ENV-VALUES-READY.txt`)
4. Seleziona **Environment**: ✅ Production, ✅ Preview
5. Clicca **Save**

**Aggiungi queste 5 variabili essenziali:**

#### 1. **SUPABASE_URL**
- **Variable name**: `SUPABASE_URL`
- **Value**: `https://higkhlfjfhlecbtfnznx.supabase.co`
- **Environments**: ✅ Production, ✅ Preview

#### 2. **SUPABASE_ANON_KEY**
- **Variable name**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw`
- **Environments**: ✅ Production, ✅ Preview

#### 3. **FIREBASE_VAPID_PRIVATE_KEY**
- **Variable name**: `FIREBASE_VAPID_PRIVATE_KEY`
- **Value**: `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ`
- **Environments**: ✅ Production, ✅ Preview

#### 4. **FIREBASE_SERVICE_ACCOUNT**
- **Variable name**: `FIREBASE_SERVICE_ACCOUNT`
- **Value**: Copia tutto il JSON da `ARCHIVIO-ENV-VALUES-READY.txt` (sezione 4)
- **Environments**: ✅ Production, ✅ Preview

⚠️ **IMPORTANTE**: 
- Copia tutto il JSON come stringa (senza spazi/linee)
- Deve essere una singola riga
- Non aggiungere spazi o linee

#### 5. **RESEND_API_KEY**
- **Variable name**: `RESEND_API_KEY`
- **Value**: `re_hkkZC1CZ_4jT9XipxNg4mN1ffmPTQp61d`
- **Environments**: ✅ Production, ✅ Preview

---

### **Passo 4: Aggiungi Variabili Opzionali** (se necessario)

#### 6. **PADDLE_VENDOR_ID** (opzionale)
- **Variable name**: `PADDLE_VENDOR_ID`
- **Value**: Il tuo Vendor ID da https://paddle.com → Developer Tools → Authentication
- **Environments**: ✅ Production, ✅ Preview
- **Come ottenere**: 
  1. Vai su https://paddle.com
  2. Accedi al tuo account
  3. Vai su Developer Tools → Authentication
  4. Copia il tuo Vendor ID

#### 7. **PADDLE_VENDOR_API_KEY** (opzionale)
- **Variable name**: `PADDLE_VENDOR_API_KEY`
- **Value**: La tua API Key da https://paddle.com → Developer Tools → Authentication
- **Environments**: ✅ Production, ✅ Preview
- **Come ottenere**: 
  1. Vai su https://paddle.com
  2. Accedi al tuo account
  3. Vai su Developer Tools → Authentication
  4. Copia la tua Vendor API Key (formato: `test_xxxxx` o `live_xxxxx`)

#### 8. **PADDLE_PUBLIC_KEY** (opzionale - per frontend)
- **Variable name**: `PADDLE_PUBLIC_KEY`
- **Value**: La tua Public Key da https://paddle.com → Developer Tools → Authentication
- **Environments**: ✅ Production, ✅ Preview
- **Come ottenere**: 
  1. Vai su https://paddle.com
  2. Accedi al tuo account
  3. Vai su Developer Tools → Authentication
  4. Copia la tua Public Key (formato: `test_xxxxx` o `live_xxxxx`)

#### 9. **PADDLE_WEBHOOK_SECRET** (opzionale)
- **Variable name**: `PADDLE_WEBHOOK_SECRET`
- **Value**: Il tuo Webhook Secret da https://paddle.com → Developer Tools → Notifications
- **Environments**: ✅ Production, ✅ Preview
- **Come ottenere**: 
  1. Vai su https://paddle.com
  2. Accedi al tuo account
  3. Vai su Developer Tools → Notifications
  4. Crea un nuovo webhook (se non l'hai già fatto):
     - URL: `https://tuo-dominio.vercel.app/api/webhook-paddle`
     - Events: `subscription.created`, `subscription.updated`, `subscription.cancelled`
  5. Copia il Webhook Secret (formato: `whsec_xxxxx`)

#### 10. **PUSH_API_KEY** (opzionale)
- **Variable name**: `PUSH_API_KEY`
- **Value**: Scegli una chiave segreta a tua scelta (es: `tradelia-push-secret-2024`)
- **Environments**: ✅ Production, ✅ Preview
- **Nota**: Questa chiave protegge l'endpoint `/api/send-push`

---

### **Passo 5: Verifica e Deploy**

1. **Verifica che tutte le variabili siano presenti**:
   - Vai su Cloudflare Dashboard → Pages → Project → Settings → Environment Variables
   - Verifica che tutte le 5 variabili essenziali siano presenti
   - Verifica che siano selezionate per Production e Preview

2. **Fai un nuovo deploy**:
   - Vai su **Deployments**
   - Clicca su **Retry deployment** (o aspetta il prossimo commit)

---

## ✅ Checklist Finale

### **Variabili Essenziali**
- [ ] `SUPABASE_URL` aggiunta
- [ ] `SUPABASE_ANON_KEY` aggiunta
- [ ] `FIREBASE_VAPID_PRIVATE_KEY` aggiunta
- [ ] `FIREBASE_SERVICE_ACCOUNT` aggiunta (JSON come stringa)
- [ ] `RESEND_API_KEY` aggiunta

### **Variabili Opzionali**
- [ ] `PADDLE_VENDOR_ID` aggiunta (se hai account Paddle)
- [ ] `PADDLE_VENDOR_API_KEY` aggiunta (se hai account Paddle)
- [ ] `PADDLE_PUBLIC_KEY` aggiunta (se hai account Paddle - opzionale)
- [ ] `PADDLE_WEBHOOK_SECRET` aggiunta (se hai account Paddle)
- [ ] `PUSH_API_KEY` aggiunta (opzionale)

### **Deploy**
- [ ] Nuovo deploy fatto
- [ ] Verifica che non ci siano errori nei log

---

## 🔍 Verifica Configurazione

### **Test 1: Verifica Variabili**
1. Vai su Cloudflare Dashboard → Pages → Project → Settings → Environment Variables
2. Verifica che tutte le 5 variabili essenziali siano presenti
3. Verifica che siano selezionate per Production e Preview

### **Test 2: Test API dopo Deploy**
1. Test `/api/check-subscription` (richiede Supabase)
2. Test `/api/send-push` (richiede Firebase)
3. Test `/api/send-email` (richiede Resend)
4. Verifica che non ci siano errori "variabile non configurata"

---

## ⚠️ Note Importanti

1. **FIREBASE_SERVICE_ACCOUNT**: Deve essere il JSON completo come stringa (una singola riga)
2. **Deploy**: Dopo aver aggiunto le variabili, fai un nuovo deploy per applicare le modifiche
3. **Sicurezza**: Le variabili private (VAPID Private Key, Service Account) NON devono essere committate nel codice
4. **Ambienti**: Seleziona sempre Production e Preview
5. **Paddle**: Le variabili Paddle sono opzionali - aggiungile solo se hai già configurato l'account (vedi `ARCHIVIO-PADDLE-SETUP.md`)

---

## 📝 File di Riferimento

- **Valori pronti**: `ARCHIVIO-ENV-VALUES-READY.txt`
- **Guida completa**: `ARCHIVIO-ENV-SETUP-GUIDE.md`

---

**Pronto per i test! 🚀**

