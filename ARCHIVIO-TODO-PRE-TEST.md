# 📋 TODO Pre-Test - Cosa Fare Prima di Testare

## 🔴 PRIORITÀ ALTA (Prima dei test)

### 1. **Aggiungere VAPID Private Key in Vercel** ❌
**Problema:** L'API send-push usa `web-push` library che richiede anche la VAPID private key.

**Cosa fare:**
1. Vai su Firebase Console → Cloud Messaging → Settings
2. Trova la **VAPID private key** (se non l'hai, genera una nuova coppia)
3. Aggiungi in Vercel → Environment Variables:
   - **Key**: `FIREBASE_VAPID_PRIVATE_KEY`
   - **Value**: La chiave privata VAPID (inizia con `-----BEGIN PRIVATE KEY-----`)

**Tempo:** ~2 minuti

---

### 2. **Aggiungere Service Account in Vercel** ❌
**Stato:** Non ancora fatto

**Cosa fare:**
1. Vai su Vercel Dashboard → Settings → Environment Variables
2. Aggiungi:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Contenuto completo del JSON Service Account (dall'inizio `{` alla fine `}`)

**Tempo:** ~2 minuti

---

### 3. **Installare Dipendenze** ❌
**Stato:** Da verificare

**Cosa fare:**
1. Verifica se esiste `package.json`
2. Se non esiste, crealo
3. Aggiungi dipendenze:
   ```json
   {
     "dependencies": {
       "@supabase/supabase-js": "^2.x.x",
       "firebase-admin": "^12.x.x",
       "web-push": "^3.6.x"
     }
   }
   ```
4. Esegui `npm install`

**Tempo:** ~3 minuti

---

## 🟡 PRIORITÀ MEDIA (Dopo fix critici)

### 4. **Verificare Service Worker** ⚠️
**Stato:** Da testare

**Cosa verificare:**
- Service Worker registrato
- Push event handler funzionante
- Notification click handler funzionante

**Tempo:** ~5 minuti

---

### 5. **Test Manuali** ⚠️
**Stato:** Da fare dopo fix

**Cosa testare:**
- Login/logout
- Votazioni
- Push notifications

**Tempo:** ~10 minuti

---

## 📋 CHECKLIST COMPLETA

### Configurazione Firebase
- [x] Progetto Firebase creato
- [x] Config Firebase salvato
- [x] VAPID public key salvata
- [ ] **VAPID private key da aggiungere in Vercel** ❌
- [ ] **Service Account da aggiungere in Vercel** ❌

### Configurazione Supabase
- [x] Progetto Supabase creato
- [x] Tabelle create
- [x] RLS policies configurate
- [x] Utente di test creato

### Codice
- [x] API send-push aggiornata (usa web-push)
- [ ] **Dipendenze da installare** ❌
- [ ] **Service Worker da verificare** ⚠️

### Variabili Ambiente Vercel
- [ ] `FIREBASE_SERVICE_ACCOUNT` ❌
- [ ] `FIREBASE_VAPID_PRIVATE_KEY` ❌
- [ ] `PUSH_API_KEY` ⚠️ (opzionale)

### Test
- [ ] Login/logout ⚠️
- [ ] Votazioni ⚠️
- [ ] Push notifications ❌

---

## 🚀 PROSSIMI STEP (Ordine)

1. **🔴 Aggiungere VAPID private key in Vercel** (2 min)
2. **🔴 Aggiungere Service Account in Vercel** (2 min)
3. **🔴 Verificare/creare package.json** (3 min)
4. **🟡 Test login/logout** (5 min)
5. **🟡 Test votazioni** (5 min)
6. **🟡 Test push notifications** (10 min)

---

## 💡 NOTA IMPORTANTE

**VAPID Private Key:** 
- Se non hai la VAPID private key, puoi generarla in Firebase Console → Cloud Messaging → Settings
- Oppure genera una nuova coppia di chiavi VAPID
- La private key è necessaria per `web-push` library

**Service Account:**
- Il JSON completo va in variabile ambiente `FIREBASE_SERVICE_ACCOUNT`
- NON committare il file JSON nel repository!

---

## ✅ STATO ATTUALE

**Completato:**
- ✅ Supabase configurato
- ✅ Votazioni configurate
- ✅ Firebase config salvato
- ✅ API send-push corretta (usa web-push)

**Da fare:**
- ❌ VAPID private key in Vercel
- ❌ Service Account in Vercel
- ❌ Dipendenze installate
- ❌ Test

---

**Raccomandazione:** Completare i 3 step critici prima di testare.

