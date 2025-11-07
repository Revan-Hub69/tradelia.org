# 🚀 Guida Setup Variabili d'Ambiente - Vercel & Cloudflare Pages

## 📋 Valori Pronti da Copiare

### ✅ **Variabili Essenziali** (per funzionamento base)

#### 1. **SUPABASE_URL**
```
https://higkhlfjfhlecbtfnznx.supabase.co
```

#### 2. **SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw
```

#### 3. **FIREBASE_VAPID_PRIVATE_KEY**
```
E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ
```

#### 4. **FIREBASE_SERVICE_ACCOUNT** (JSON come stringa)
⚠️ **IMPORTANTE**: Copia tutto questo JSON come stringa (senza spazi/linee)

```
{"type":"service_account","project_id":"tradelia-push","private_key_id":"7c8d2473c6e68f2d504c4c1d61b1ed3e80ebd40b","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSZ9bHioQiMWvp\nsjENbHOTK61Hu0p3vZUknS6oWguWi5/iEm224Xyu886RPeHWFw/gW0d7aHWKbs7T\npUZOAbZt7WNSG9Q8zy5S7ZnL5x0ED7MTERLm32ClycIXnXJCoxPpk3faPi40hLqh\nL9tVU4Oy1hb7AP6nx2iyuA5MQaMHXyWPZxIPYa5eTTpq5boOv3rKrg7HklnlTn+U\nw6r6kjV9HcH6CqnXs0xyitI+NTpYwldvqIQn7kd4BxbfKuwfbbrEOOhwL/2MMS8d\nvraSUp0ezKNWPUvFdYULZT0LudxSKPt3XsKddMv8xiwEQmMfbfiJ3UOOQlm+ZyH0\nxccftwsnAgMBAAECggEAAzt5JZ018aVUuEUpuVneXkQGtQ1mU94whlyrzmywga8p\nCG4Q2J7KLZETrh0g23GE2ut/Q6DgY8oKZcUqOVSPzhlRgOQ29HnL7ZY2c9cPFdrj\nFpRMKz1o3K/zlvoVbhSkEt7v5NIDuU04slufDcaEq9Pbv1HNyuhzVIHwJkrz2DWE\n2aOgIjyw0+jc2R+5cZj1Igyu+MWzAuU53hgCvGrDenZt0N2G0V0oaG6H38q9gWIv\nLXv21DrfF61yolt5/0nJ889wX88p5Xbhpst/HRfnp9yy7XuPnFXSveZYzE+3f0MS\nPhgmZwLExh/Ui/bDN6qYW6sWru3NwVHZFMvcrFwYQQKBgQDwIEY3CHGOKoOCxuZI\nzJ038m1zf4yqwEKQuUrb6YN+XBVmRm1BMcNu8S2Qp/kghaZULM/6gyhCRwXiNVG6\nn/49352gyE4IpyBYtHLfjhkYrt1Wxk+sD30fWtumoF4f2qgU/0SjQtsCKbYcRQ0s\n3uOdVH7NXiRZcQZiOA1AXOd91wKBgQDgUJi5zauBypk2k3opa9V9LDVcxHHA5Oj0\na7mw9DKlHreH67i/R9znX6nd1KESkmZsGuOlXFTjsQUX0+1x414V3NP8eyWQ24LF\ntjN0AYZR8oo0GyT6+DmFmEHovMwsMujEz/rfl7webBT57pOAFcTVFv9GYWxypFZ5\n5zLQI1cTMQKBgF541Ccis0pzf3ocNs29cr1oK5edPwKO0aGOxNzwakN0hxbN7n4P\nzgv/5yVacLFS47WKS+kLYPNybeYphBYgjC5bo/B13f2ZgyhjFi7OASGs6ngRXZcc\nIOYNIQ3VWjK+HBLmu2JgEzounu9QW3aj2nkznQ+/Uh2+UfyigNQpuQnRAoGAAeHr\nRjPpqo8utfyK2+ohwokqcXrckYfaRKLazhdejXAyjht2U3Sg7/gnjssIBwXfgiy/\nmFWsCLUlm8uVhI0p7vkJdmb6K7sL3+jliaWxoOJuMn2/07NdmDds5i0fcYeD2JL+\nQf4eAAtcKbTM3BhSrI8i2U5cAKJMb313ObPyOSECgYEAwGxk5R+ovS5sO+wlZc8x\nch/xs3dqkS7nvbZI6HpAUlngr37LpnCmYF/nVuTBz1p1fSMRtGP7f7uSlrBiG3xA\njGWP4DtxrB8p8Rri+6fPaWUQnS3YbjJmdTnyCw3RVIjd17F0CbTgCjwlGU+HI1Jd\n/E/AcpVIppHZbmBkCsnKqS8=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@tradelia-push.iam.gserviceaccount.com","client_id":"110472068512948127276","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tradelia-push.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

---

### ⚠️ **Variabili Opzionali** (per funzionalità avanzate)

#### 5. **RESEND_API_KEY** (opzionale - per email backup)
```
re_hkkZC1CZ_4jT9XipxNg4mN1ffmPTQp61d
```
**Nota**: Chiave trovata nella versione deployata su Vercel

#### 6. **LEMONSQUEEZY_API_KEY** (opzionale - per pagamenti)
```
xxxxx
```
**Nota**: Sostituisci `xxxxx` con la tua API Key da Lemon Squeezy

#### 7. **LEMONSQUEEZY_STORE_ID** (opzionale - per pagamenti)
```
xxxxx
```
**Nota**: Sostituisci `xxxxx` con il tuo Store ID da Lemon Squeezy

#### 8. **LEMONSQUEEZY_WEBHOOK_SECRET** (opzionale - per pagamenti)
```
xxxxx
```
**Nota**: Sostituisci `xxxxx` con il tuo Webhook Secret da Lemon Squeezy

#### 9. **PUSH_API_KEY** (opzionale - per sicurezza API push)
```
your-secret-api-key-here
```
**Nota**: Scegli una chiave segreta a tua scelta per proteggere `/api/send-push`

---

## 🚀 Setup Vercel

### **Passo 1: Accedi a Vercel Dashboard**
1. Vai su https://vercel.com
2. Accedi al tuo account
3. Seleziona il progetto **tradelia.org** (o il nome del tuo progetto)

### **Passo 2: Vai a Environment Variables**
1. Clicca su **Settings** (nella barra superiore)
2. Clicca su **Environment Variables** (menu laterale sinistro)

### **Passo 3: Aggiungi Variabili Essenziali**

Per ogni variabile:
1. Clicca su **Add New**
2. Inserisci **Key** (nome variabile)
3. Inserisci **Value** (valore - copia da sopra)
4. Seleziona **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Clicca **Save**

**Aggiungi queste 4 variabili essenziali:**

| Key | Value | Environments |
|-----|-------|--------------|
| `SUPABASE_URL` | `https://higkhlfjfhlecbtfnznx.supabase.co` | All |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | All |
| `FIREBASE_VAPID_PRIVATE_KEY` | `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ` | All |
| `FIREBASE_SERVICE_ACCOUNT` | `{"type":"service_account",...}` | All |

⚠️ **IMPORTANTE per FIREBASE_SERVICE_ACCOUNT**:
- Copia tutto il JSON come stringa (senza spazi/linee)
- Deve essere una singola riga
- Non aggiungere spazi o linee

### **Passo 4: Aggiungi Variabili Opzionali** (se necessario)

Aggiungi solo se hai già configurato i servizi:
- `RESEND_API_KEY` (se hai account Resend)
- `LEMONSQUEEZY_API_KEY` (se hai account Lemon Squeezy)
- `LEMONSQUEEZY_STORE_ID` (se hai account Lemon Squeezy)
- `LEMONSQUEEZY_WEBHOOK_SECRET` (se hai account Lemon Squeezy)
- `PUSH_API_KEY` (scegli una chiave segreta)

### **Passo 5: Verifica e Deploy**
1. Verifica che tutte le variabili siano presenti
2. Vai su **Deployments**
3. Fai un nuovo **Redeploy** (o aspetta il prossimo commit)

---

## 🌐 Setup Cloudflare Pages

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

| Variable name | Value | Environments |
|---------------|-------|--------------|
| `SUPABASE_URL` | `https://higkhlfjfhlecbtfnznx.supabase.co` | Production, Preview |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw` | Production, Preview |
| `FIREBASE_VAPID_PRIVATE_KEY` | `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ` | Production, Preview |
| `FIREBASE_SERVICE_ACCOUNT` | `{"type":"service_account",...}` (vedi sotto) | Production, Preview |
| `RESEND_API_KEY` | `re_hkkZC1CZ_4jT9XipxNg4mN1ffmPTQp61d` | Production, Preview |

⚠️ **IMPORTANTE per FIREBASE_SERVICE_ACCOUNT**:
- Copia tutto il JSON da `ARCHIVIO-ENV-VALUES-READY.txt` (sezione 4)
- Deve essere una singola riga (senza spazi/linee)
- Non aggiungere spazi o linee

### **Passo 4: Aggiungi Variabili Opzionali** (se necessario)

Aggiungi solo se hai già configurato i servizi:

**Lemon Squeezy** (per pagamenti):
- `LEMONSQUEEZY_API_KEY` - API Key da https://lemonsqueezy.com → Settings → API
- `LEMONSQUEEZY_STORE_ID` - Store ID da https://lemonsqueezy.com → Settings → Stores
- `LEMONSQUEEZY_WEBHOOK_SECRET` - Webhook Secret da https://lemonsqueezy.com → Settings → Webhooks

**Push Notifications**:
- `PUSH_API_KEY` - Scegli una chiave segreta a tua scelta (es: `tradelia-push-secret-2024`)

### **Passo 5: Verifica e Deploy**
1. Verifica che tutte le variabili siano presenti
2. Vai su **Deployments**
3. Fai un nuovo **Retry deployment** (o aspetta il prossimo commit)

---

## ✅ Checklist Finale

### **Vercel**
- [ ] `SUPABASE_URL` aggiunta
- [ ] `SUPABASE_ANON_KEY` aggiunta
- [ ] `FIREBASE_VAPID_PRIVATE_KEY` aggiunta
- [ ] `FIREBASE_SERVICE_ACCOUNT` aggiunta (JSON come stringa)
- [ ] `RESEND_API_KEY` aggiunta
- [ ] Variabili opzionali aggiunte (se necessario)
  - [ ] `LEMONSQUEEZY_API_KEY` (se hai account Lemon Squeezy)
  - [ ] `LEMONSQUEEZY_STORE_ID` (se hai account Lemon Squeezy)
  - [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` (se hai account Lemon Squeezy)
  - [ ] `PUSH_API_KEY` (opzionale)
- [ ] Nuovo deploy fatto

### **Cloudflare Pages**
- [ ] `SUPABASE_URL` aggiunta
- [ ] `SUPABASE_ANON_KEY` aggiunta
- [ ] `FIREBASE_VAPID_PRIVATE_KEY` aggiunta
- [ ] `FIREBASE_SERVICE_ACCOUNT` aggiunta (JSON come stringa)
- [ ] `RESEND_API_KEY` aggiunta
- [ ] Variabili opzionali aggiunte (se necessario)
  - [ ] `LEMONSQUEEZY_API_KEY` (se hai account Lemon Squeezy)
  - [ ] `LEMONSQUEEZY_STORE_ID` (se hai account Lemon Squeezy)
  - [ ] `LEMONSQUEEZY_WEBHOOK_SECRET` (se hai account Lemon Squeezy)
  - [ ] `PUSH_API_KEY` (opzionale)
- [ ] Nuovo deploy fatto

---

## 🔍 Verifica Configurazione

### **Test 1: Verifica Variabili in Vercel**
1. Vai su Vercel Dashboard → Project → Settings → Environment Variables
2. Verifica che tutte le 4 variabili essenziali siano presenti
3. Verifica che siano selezionate per Production, Preview, Development

### **Test 2: Verifica Variabili in Cloudflare Pages**
1. Vai su Cloudflare Dashboard → Pages → Project → Settings → Environment Variables
2. Verifica che tutte le 4 variabili essenziali siano presenti
3. Verifica che siano selezionate per Production, Preview

### **Test 3: Test API dopo Deploy**
1. Test `/api/check-subscription` (richiede Supabase)
2. Test `/api/send-push` (richiede Firebase)
3. Verifica che non ci siano errori "variabile non configurata"

---

## ⚠️ Note Importanti

1. **FIREBASE_SERVICE_ACCOUNT**: Deve essere il JSON completo come stringa (una singola riga)
2. **Deploy**: Dopo aver aggiunto le variabili, fai un nuovo deploy per applicare le modifiche
3. **Sicurezza**: Le variabili private (VAPID Private Key, Service Account) NON devono essere committate nel codice
4. **Ambienti**: Seleziona sempre Production, Preview (e Development per Vercel)

---

**Pronto per i test! 🚀**

