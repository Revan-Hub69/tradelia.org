# 📋 Checklist Pre-Test - Cosa Manca Prima di Testare

## ✅ COSA È STATO FATTO

### 1. **Supabase** ✅
- [x] Progetto creato
- [x] Credenziali configurate
- [x] Tabelle create (`subscribers`, `push_subscriptions`, `votes`)
- [x] RLS policies configurate
- [x] Utente di test creato

### 2. **Votazioni** ✅
- [x] Tabella `votes` creata
- [x] API `/api/vote.js` aggiornata per Supabase
- [x] Dashboard pronta per votazioni

### 3. **Firebase FCM** ⚠️ Parzialmente
- [x] Progetto Firebase creato
- [x] Credenziali Firebase salvate
- [x] VAPID key salvata
- [ ] **Service Account da aggiungere in Vercel** ⚠️
- [ ] **API send-push da correggere** ⚠️ (problema formato subscription)

---

## ❌ COSA MANCA ANCORA

### 1. **Variabili Ambiente Vercel** ❌
**PRIORITÀ ALTA**

Da aggiungere in Vercel Dashboard → Settings → Environment Variables:

- [ ] `FIREBASE_SERVICE_ACCOUNT` - JSON completo del Service Account
- [ ] `PUSH_API_KEY` - Chiave segreta per proteggere API (opzionale ma consigliato)
- [ ] `SUPABASE_URL` - Opzionale (già in codice come fallback)
- [ ] `SUPABASE_ANON_KEY` - Opzionale (già in codice come fallback)

**Tempo:** ~5 minuti

---

### 2. **Correggere API Send Push** ❌
**PRIORITÀ ALTA**

**Problema:** L'API usa `admin.messaging().send()` con `token`, ma le Web Push subscriptions usano un formato diverso (endpoint, keys).

**Da fare:**
- [ ] Usare `web-push` library invece di `admin.messaging().send()`
- [ ] Oppure convertire Web Push subscriptions in formato FCM token
- [ ] Testare invio push

**Tempo:** ~10 minuti

---

### 3. **Verificare Dipendenze** ❌
**PRIORITÀ MEDIA**

Da verificare/installare:

- [ ] `@supabase/supabase-js` - Per Supabase client
- [ ] `firebase-admin` - Per Firebase Admin SDK
- [ ] `web-push` - Per Web Push notifications (se necessario)
- [ ] `@vercel/kv` - NON necessario (usiamo Supabase)

**Tempo:** ~2 minuti

---

### 4. **Verificare Service Worker** ⚠️
**PRIORITÀ MEDIA**

- [ ] Service Worker registrato correttamente
- [ ] Push event handler funzionante
- [ ] Notification click handler funzionante

**Tempo:** ~5 minuti

---

### 5. **Test Manuali** ⚠️
**PRIORITÀ ALTA**

- [ ] Test login/logout
- [ ] Test votazioni
- [ ] Test push notifications (dopo fix)

**Tempo:** ~10 minuti

---

## 🔴 PROBLEMI CRITICI DA RISOLVERE

### Problema 1: API Send Push
**Stato:** ❌ Non funziona correttamente

**Causa:** 
- Le Web Push subscriptions hanno formato: `{ endpoint, keys: { p256dh, auth } }`
- `admin.messaging().send()` si aspetta un FCM token
- Serve convertire o usare `web-push` library

**Soluzione:** Usare `web-push` library per Web Push notifications

---

### Problema 2: Service Account
**Stato:** ⚠️ Non ancora aggiunto in Vercel

**Causa:** Serve aggiungere variabile ambiente

**Soluzione:** Aggiungere `FIREBASE_SERVICE_ACCOUNT` in Vercel

---

## 📋 PRIORITÀ

### 🔴 ALTA (Prima dei test)
1. **Correggere API send-push** - Fix formato subscription
2. **Aggiungere Service Account in Vercel** - Variabile ambiente
3. **Verificare dipendenze** - package.json

### 🟡 MEDIA (Dopo i test base)
4. **Verificare Service Worker** - Test push notifications
5. **Test manuali** - Login, votazioni, push

---

## 🚀 PROSSIMI STEP

### Step 1: Correggere API Send Push (10 min)
- Installare `web-push`
- Aggiornare `/api/send-push.js` per usare `web-push`
- Testare formato subscription

### Step 2: Aggiungere Variabili Ambiente Vercel (5 min)
- Aggiungere `FIREBASE_SERVICE_ACCOUNT`
- Aggiungere `PUSH_API_KEY` (opzionale)

### Step 3: Verificare Dipendenze (2 min)
- Creare/verificare `package.json`
- Installare dipendenze necessarie

### Step 4: Test (10 min)
- Test login/logout
- Test votazioni
- Test push notifications

---

## ✅ CHECKLIST FINALE

### Configurazione
- [ ] Supabase configurato ✅
- [ ] Firebase configurato ⚠️ (manca Service Account in Vercel)
- [ ] Votazioni configurate ✅

### Codice
- [ ] API send-push corretta ❌ (da fixare)
- [ ] Service Worker funzionante ⚠️ (da verificare)
- [ ] Dipendenze installate ❌ (da verificare)

### Variabili Ambiente
- [ ] `FIREBASE_SERVICE_ACCOUNT` ❌
- [ ] `PUSH_API_KEY` ❌ (opzionale)
- [ ] `SUPABASE_URL` ⚠️ (opzionale, già in codice)

### Test
- [ ] Login/logout ⚠️
- [ ] Votazioni ⚠️
- [ ] Push notifications ❌

---

## 💡 RACCOMANDAZIONE

**Prima di testare:**
1. 🔴 Correggere API send-push
2. 🔴 Aggiungere Service Account in Vercel
3. 🔴 Verificare dipendenze
4. 🟡 Poi testare tutto

**Ordine di priorità:**
1. Fix API send-push (critico)
2. Variabili ambiente Vercel (necessario)
3. Dipendenze (necessario)
4. Test (dopo fix)

---

**Stato:** ⚠️ **Non pronto per test** - Servono fix critici prima

