# 🌐 Cloudflare Pages - Setup Rapido Variabili Ambiente

## 🚀 Guida Veloce

### **Passo 1: Accedi a Cloudflare Dashboard**
1. Vai su https://dash.cloudflare.com
2. Accedi al tuo account
3. Clicca su **Pages** (menu laterale sinistro)
4. Seleziona il progetto **tradelia.org** (o il nome del tuo progetto)

### **Passo 2: Vai a Environment Variables**
1. Clicca su **Settings** (nella barra superiore)
2. Scorri fino a **Environment Variables**
3. Clicca su **Add variable** per ogni variabile

---

## ✅ Variabili Essenziali (5 variabili)

### **1. SUPABASE_URL**
- **Variable name**: `SUPABASE_URL`
- **Value**: `https://higkhlfjfhlecbtfnznx.supabase.co`
- **Environments**: ✅ Production, ✅ Preview
- **Save**

### **2. SUPABASE_ANON_KEY**
- **Variable name**: `SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpZ2tobGZqZmhsZWNidGZuem54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTc5OTksImV4cCI6MjA3ODAzMzk5OX0.qlhVhGkfc0rU7-tUg9Fu40D67HQzHjZhkEdP4mAPqTw`
- **Environments**: ✅ Production, ✅ Preview
- **Save**

### **3. FIREBASE_VAPID_PRIVATE_KEY**
- **Variable name**: `FIREBASE_VAPID_PRIVATE_KEY`
- **Value**: `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ`
- **Environments**: ✅ Production, ✅ Preview
- **Save**

### **4. FIREBASE_SERVICE_ACCOUNT**
- **Variable name**: `FIREBASE_SERVICE_ACCOUNT`
- **Value**: Copia tutto questo JSON come stringa (UNA SINGOLA RIGA, SENZA SPAZI/LINEE):
```
{"type":"service_account","project_id":"tradelia-push","private_key_id":"7c8d2473c6e68f2d504c4c1d61b1ed3e80ebd40b","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSZ9bHioQiMWvp\nsjENbHOTK61Hu0p3vZUknS6oWguWi5/iEm224Xyu886RPeHWFw/gW0d7aHWKbs7T\npUZOAbZt7WNSG9Q8zy5S7ZnL5x0ED7MTERLm32ClycIXnXJCoxPpk3faPi40hLqh\nL9tVU4Oy1hb7AP6nx2iyuA5MQaMHXyWPZxIPYa5eTTpq5boOv3rKrg7HklnlTn+U\nw6r6kjV9HcH6CqnXs0xyitI+NTpYwldvqIQn7kd4BxbfKuwfbbrEOOhwL/2MMS8d\nvraSUp0ezKNWPUvFdYULZT0LudxSKPt3XsKddMv8xiwEQmMfbfiJ3UOOQlm+ZyH0\nxccftwsnAgMBAAECggEAAzt5JZ018aVUuEUpuVneXkQGtQ1mU94whlyrzmywga8p\nCG4Q2J7KLZETrh0g23GE2ut/Q6DgY8oKZcUqOVSPzhlRgOQ29HnL7ZY2c9cPFdrj\nFpRMKz1o3K/zlvoVbhSkEt7v5NIDuU04slufDcaEq9Pbv1HNyuhzVIHwJkrz2DWE\n2aOgIjyw0+jc2R+5cZj1Igyu+MWzAuU53hgCvGrDenZt0N2G0V0oaG6H38q9gWIv\nLXv21DrfF61yolt5/0nJ889wX88p5Xbhpst/HRfnp9yy7XuPnFXSveZYzE+3f0MS\nPhgmZwLExh/Ui/bDN6qYW6sWru3NwVHZFMvcrFwYQQKBgQDwIEY3CHGOKoOCxuZI\nzJ038m1zf4yqwEKQuUrb6YN+XBVmRm1BMcNu8S2Qp/kghaZULM/6gyhCRwXiNVG6\nn/49352gyE4IpyBYtHLfjhkYrt1Wxk+sD30fWtumoF4f2qgU/0SjQtsCKbYcRQ0s\n3uOdVH7NXiRZcQZiOA1AXOd91wKBgQDgUJi5zauBypk2k3opa9V9LDVcxHHA5Oj0\na7mw9DKlHreH67i/R9znX6nd1KESkmZsGuOlXFTjsQUX0+1x414V3NP8eyWQ24LF\ntjN0AYZR8oo0GyT6+DmFmEHovMwsMujEz/rfl7webBT57pOAFcTVFv9GYWxypFZ5\n5zLQI1cTMQKBgF541Ccis0pzf3ocNs29cr1oK5edPwKO0aGOxNzwakN0hxbN7n4P\nzgv/5yVacLFS47WKS+kLYPNybeYphBYgjC5bo/B13f2ZgyhjFi7OASGs6ngRXZcc\nIOYNIQ3VWjK+HBLmu2JgEzounu9QW3aj2nkznQ+/Uh2+UfyigNQpuQnRAoGAAeHr\nRjPpqo8utfyK2+ohwokqcXrckYfaRKLazhdejXAyjht2U3Sg7/gnjssIBwXfgiy/\nmFWsCLUlm8uVhI0p7vkJdmb6K7sL3+jliaWxoOJuMn2/07NdmDds5i0fcYeD2JL+\nQf4eAAtcKbTM3BhSrI8i2U5cAKJMb313ObPyOSECgYEAwGxk5R+ovS5sO+wlZc8x\nch/xs3dqkS7nvbZI6HpAUlngr37LpnCmYF/nVuTBz1p1fSMRtGP7f7uSlrBiG3xA\njGWP4DtxrB8p8Rri+6fPaWUQnS3YbjJmdTnyCw3RVIjd17F0CbTgCjwlGU+HI1Jd\n/E/AcpVIppHZbmBkCsnKqS8=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@tradelia-push.iam.gserviceaccount.com","client_id":"110472068512948127276","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tradelia-push.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```
- **Environments**: ✅ Production, ✅ Preview
- ⚠️ **IMPORTANTE**: Copia tutto il JSON come stringa (senza spazi/linee)
- **Save**

### **5. RESEND_API_KEY**
- **Variable name**: `RESEND_API_KEY`
- **Value**: `re_hkkZC1CZ_4jT9XipxNg4mN1ffmPTQp61d`
- **Environments**: ✅ Production, ✅ Preview
- **Save**

---

## ⚠️ Variabili Opzionali (se hai Paddle configurato)

### **6. PADDLE_VENDOR_ID**
- **Variable name**: `PADDLE_VENDOR_ID`
- **Value**: `12345` (sostituisci con il tuo Vendor ID)
- **Environments**: ✅ Production, ✅ Preview
- **Save**

### **7. PADDLE_VENDOR_API_KEY**
- **Variable name**: `PADDLE_VENDOR_API_KEY`
- **Value**: `test_xxxxx` o `live_xxxxx` (sostituisci con la tua API Key)
- **Environments**: ✅ Production, ✅ Preview
- **Save**

### **8. PADDLE_PUBLIC_KEY** (opzionale per frontend)
- **Variable name**: `PADDLE_PUBLIC_KEY`
- **Value**: `test_xxxxx` o `live_xxxxx` (sostituisci con la tua Public Key)
- **Environments**: ✅ Production, ✅ Preview
- **Save**

### **9. PADDLE_WEBHOOK_SECRET**
- **Variable name**: `PADDLE_WEBHOOK_SECRET`
- **Value**: `whsec_xxxxx` (sostituisci con il tuo Webhook Secret)
- **Environments**: ✅ Production, ✅ Preview
- **Save**

### **10. PUSH_API_KEY** (opzionale)
- **Variable name**: `PUSH_API_KEY`
- **Value**: `tradelia-push-secret-2024` (scegli una chiave segreta)
- **Environments**: ✅ Production, ✅ Preview
- **Save**

---

## ✅ Checklist Finale

### **Variabili Essenziali**
- [ ] `SUPABASE_URL` aggiunta
- [ ] `SUPABASE_ANON_KEY` aggiunta
- [ ] `FIREBASE_VAPID_PRIVATE_KEY` aggiunta
- [ ] `FIREBASE_SERVICE_ACCOUNT` aggiunta (JSON come stringa)
- [ ] `RESEND_API_KEY` aggiunta

### **Variabili Opzionali** (se necessario)
- [ ] `PADDLE_VENDOR_ID` aggiunta
- [ ] `PADDLE_VENDOR_API_KEY` aggiunta
- [ ] `PADDLE_PUBLIC_KEY` aggiunta
- [ ] `PADDLE_WEBHOOK_SECRET` aggiunta
- [ ] `PUSH_API_KEY` aggiunta

### **Deploy**
- [ ] Vai su **Deployments**
- [ ] Clicca su **Retry deployment** (o aspetta il prossimo commit)

---

## 🔍 Verifica

1. Vai su Cloudflare Dashboard → Pages → Project → Settings → Environment Variables
2. Verifica che tutte le 5 variabili essenziali siano presenti
3. Verifica che siano selezionate per Production e Preview
4. Fai un nuovo deploy

---

## ⚠️ Note Importanti

1. **FIREBASE_SERVICE_ACCOUNT**: Deve essere il JSON completo come stringa (una singola riga, senza spazi/linee)
2. **Deploy**: Dopo aver aggiunto le variabili, fai un nuovo deploy per applicare le modifiche
3. **Ambienti**: Seleziona sempre Production e Preview
4. **Sicurezza**: Le variabili private NON devono essere committate nel codice

---

**Pronto per i test! 🚀**

