# 📋 Setup Firebase FCM - Push Notifications - Guida Step by Step

## 🎯 Obiettivo
Configurare Firebase Cloud Messaging (FCM) per inviare push notifications agli abbonati.

---

## STEP 1: Creare Progetto Firebase

### Passo 1.1: Aprire Firebase Console
1. Vai su https://console.firebase.google.com
2. Accedi con Google (o crea account se non ce l'hai)

### Passo 1.2: Creare Nuovo Progetto
1. Clicca su **"Add project"** (o **"Create a project"**)
2. **Nome progetto**: `tradelia-push` (o altro nome)
3. Clicca su **"Continue"**

### Passo 1.3: Configurare Google Analytics (Opzionale)
1. Puoi **disabilitare** Google Analytics se non lo usi
2. Oppure **abilitalo** se vuoi tracking
3. Clicca su **"Create project"**

### Passo 1.4: Attendere Creazione
- Attendi qualche secondo (10-30 secondi)
- Vedrai **"Your project is ready"**
- Clicca su **"Continue"**

---

## STEP 2: Configurare Web App

### Passo 2.1: Aggiungere Web App
1. Nel dashboard Firebase, vedrai **"Get started by adding Firebase to your app"**
2. Clicca sull'icona **Web** (`</>`)
3. Se non vedi l'icona, vai su **Project Settings** (⚙️) → **Your apps** → **Add app** → **Web**

### Passo 2.2: Configurare App
1. **App nickname**: `Tradelia Dashboard` (o altro nome)
2. **Non selezionare** "Also set up Firebase Hosting" (non serve)
3. Clicca su **"Register app"**

### Passo 2.3: Copiare Configurazione
1. Vedrai il codice di configurazione Firebase
2. **Copia queste credenziali** (ti serviranno dopo):
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "xxxxx.firebaseapp.com",
     projectId: "xxxxx",
     storageBucket: "xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```
3. **Salva queste credenziali** in un posto sicuro
4. Clicca su **"Continue to console"**

---

## STEP 3: Configurare Cloud Messaging

### Passo 3.1: Abilitare Cloud Messaging
1. Nel menu laterale Firebase, vai su **"Build"** → **"Cloud Messaging"**
2. Se è la prima volta, vedrai **"Get started"**
3. Clicca su **"Get started"**

### Passo 3.2: Configurare Web Push Certificates
1. Vai su **"Cloud Messaging API (V1)"** → **"Settings"** (⚙️)
2. Scorri fino a **"Web configuration"**
3. Clicca su **"Generate key pair"** (o **"Add key pair"**)
4. **Copia la chiave pubblica** (inizia con `BM...`)
5. **Salva questa chiave** (è la VAPID public key)

---

## STEP 4: Aggiornare Configurazione

### Passo 4.1: Aggiornare fcm-config.js
1. Apri il file `/archivio/assets/js/fcm-config.js`
2. Sostituisci i placeholder con le credenziali Firebase:

```javascript
export const FCM_CONFIG = {
  apiKey: 'AIza...', // Da firebaseConfig
  projectId: 'xxxxx', // Da firebaseConfig
  messagingSenderId: '123456789', // Da firebaseConfig
  appId: '1:123456789:web:xxxxx', // Da firebaseConfig
  vapidPublicKey: 'BM...' // VAPID public key generata
};
```

### Passo 4.2: Verificare Configurazione
Assicurati che tutte le credenziali siano corrette:
- ✅ `apiKey` - Da firebaseConfig
- ✅ `projectId` - Da firebaseConfig
- ✅ `messagingSenderId` - Da firebaseConfig
- ✅ `appId` - Da firebaseConfig
- ✅ `vapidPublicKey` - VAPID public key generata

---

## STEP 5: Configurare Service Account (per API Server)

### Passo 5.1: Generare Service Account Key
1. Nel dashboard Firebase, vai su **Project Settings** (⚙️)
2. Vai alla tab **"Service accounts"**
3. Clicca su **"Generate new private key"**
4. Clicca su **"Generate key"** nella finestra di conferma
5. **Scarica il file JSON** (es. `tradelia-push-xxxxx.json`)

### Passo 5.2: Aggiungere Variabile Ambiente Vercel
1. Vai su Vercel Dashboard → **Settings** → **Environment Variables**
2. Aggiungi nuova variabile:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Apri il file JSON scaricato, copia tutto il contenuto e incollalo qui (come stringa)
   - **Environment**: Seleziona tutte (Production, Preview, Development)
3. Clicca su **"Save"**

**⚠️ IMPORTANTE**: Non committare il file JSON! Aggiungilo a `.gitignore` se non c'è già.

---

## STEP 6: Aggiornare API Send Push

### Passo 6.1: Verificare API
Il file `/api/send-push.js` deve essere aggiornato per usare Firebase Admin SDK.

### Passo 6.2: Installare Firebase Admin SDK
Assicurati che `firebase-admin` sia installato:

```bash
npm install firebase-admin
```

Oppure aggiungi in `package.json`:
```json
{
  "dependencies": {
    "firebase-admin": "^12.x.x"
  }
}
```

---

## ✅ VERIFICA FINALE

### Checklist:
- [ ] Progetto Firebase creato
- [ ] Web app configurata
- [ ] Cloud Messaging abilitato
- [ ] VAPID key pair generato
- [ ] Credenziali copiate
- [ ] `/archivio/assets/js/fcm-config.js` aggiornato
- [ ] Service Account key generato
- [ ] Variabile ambiente `FIREBASE_SERVICE_ACCOUNT` aggiunta in Vercel
- [ ] `firebase-admin` installato
- [ ] Deploy su Vercel completato

---

## 🐛 TROUBLESHOOTING

### Errore: "Firebase not initialized"
**Causa**: Credenziali non configurate correttamente
**Soluzione**: Verifica che tutte le credenziali in `fcm-config.js` siano corrette

### Errore: "VAPID key not found"
**Causa**: VAPID public key non configurata
**Soluzione**: Verifica che `vapidPublicKey` sia presente in `fcm-config.js`

### Errore: "Service account not found"
**Causa**: Variabile ambiente non configurata
**Soluzione**: Verifica che `FIREBASE_SERVICE_ACCOUNT` sia presente in Vercel

---

## 🎉 COMPLETATO!

Una volta completati tutti gli step, le push notifications sono pronte!

**Prossimi step:**
1. Testare push notifications dalla dashboard
2. Verificare che le subscriptions vengano salvate in Supabase
3. Testare invio push manuale

