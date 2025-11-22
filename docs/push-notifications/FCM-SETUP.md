# Firebase Cloud Messaging (FCM) - Setup Completo

## ✅ Hai già tutto configurato!

**NON serve ottenere nuove chiavi** - hai già tutto:

### 1. **FIREBASE_SERVICE_ACCOUNT** (Backend)
- ✅ Già presente in `ARCHIVIO-ENV-VALUES-READY.txt`
- ✅ Deve essere aggiunto in Vercel come variabile ambiente
- ✅ È il JSON completo del service account Firebase

### 2. **Firebase Config** (Frontend)
- ✅ Già presente in `archivio/assets/js/fcm-config.js`
- ✅ Contiene: apiKey, projectId, messagingSenderId, appId
- ✅ VAPID Public Key già configurata

### 3. **VAPID Public Key**
- ✅ Già presente: `BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0`
- ✅ Usata sia da FCM che dal service worker

---

## 📋 Checklist Setup Vercel

### Variabili Ambiente da aggiungere in Vercel:

1. **FIREBASE_SERVICE_ACCOUNT**
   - Copia il JSON completo da `ARCHIVIO-ENV-VALUES-READY.txt`
   - Incolla come stringa (una riga, senza spazi)
   - Formato: `{"type":"service_account","project_id":"tradelia-push",...}`

2. **VAPID_PUBLIC_KEY** (opzionale, già hardcoded)
   - `BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0`

---

## 🔧 Come Funziona FCM

### Frontend (`fcm-notifications.js`)
1. Inizializza Firebase App con config
2. Richiede permesso notifiche
3. Ottiene FCM token
4. Invia token al server (`/api/save-push-subscription.js`)

### Backend (`api/admin.js`)
1. Inizializza Firebase Admin con `FIREBASE_SERVICE_ACCOUNT`
2. Recupera FCM tokens dal database
3. Invia notifiche usando `admin.messaging().send()`

### Service Worker (`firebase-messaging-sw.js`)
1. Gestisce notifiche in background
2. Mostra notifiche quando app è chiusa
3. Gestisce click su notifiche

---

## 🧪 Test

1. **Apri dashboard** → FCM si inizializza automaticamente
2. **Clicca "Abilita Notifiche"** → Richiede permesso e ottiene token
3. **Verifica token salvato** → Controlla `push_subscriptions` in Supabase
4. **Invia notifica test** → Usa admin panel o API

---

## ⚠️ Note Importanti

- **FCM funziona su Opera** (a differenza di VAPID)
- **Service Worker**: FCM richiede `firebase-messaging-sw.js` nella root
- **Token Storage**: I token FCM vengono salvati in `push_subscriptions.subscription` come JSON
- **Backward Compatible**: Il vecchio sistema VAPID può coesistere temporaneamente

---

## 🐛 Troubleshooting

### "Firebase non configurato"
- Verifica che `FIREBASE_SERVICE_ACCOUNT` sia in Vercel
- Controlla che il JSON sia valido (una riga, senza spazi)

### "Token non ottenuto"
- Verifica che `firebase-messaging-sw.js` sia accessibile
- Controlla console browser per errori
- Verifica permessi notifiche nel browser

### "Notifiche non arrivano"
- Verifica token salvato in database
- Controlla che il token sia valido (non scaduto)
- Verifica che Firebase Admin sia inizializzato correttamente

