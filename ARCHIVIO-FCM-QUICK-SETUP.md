# ⚡ Setup FCM Rapido - Checklist Essenziale

## 🎯 Passaggi Essenziali (10 minuti)

### 1. Firebase Console (3 min)
- [ ] Vai su https://console.firebase.google.com
- [ ] Crea nuovo progetto: `tradelia-push`
- [ ] Aggiungi Web app (icona `</>`)
- [ ] Copia configurazione Firebase

### 2. Cloud Messaging (2 min)
- [ ] Vai su Build → Cloud Messaging
- [ ] Genera VAPID key pair
- [ ] Copia VAPID public key

### 3. Aggiorna Config (2 min)
- [ ] Apri `/archivio/assets/js/fcm-config.js`
- [ ] Sostituisci placeholder con credenziali Firebase
- [ ] Aggiungi VAPID public key

### 4. Service Account (3 min)
- [ ] Project Settings → Service accounts
- [ ] Genera new private key
- [ ] Scarica file JSON
- [ ] Aggiungi variabile ambiente Vercel: `FIREBASE_SERVICE_ACCOUNT`

---

## 📋 Credenziali da Copiare

### Da Firebase Config:
```javascript
apiKey: "AIza..."
projectId: "xxxxx"
messagingSenderId: "123456789"
appId: "1:123456789:web:xxxxx"
```

### Da Cloud Messaging:
```javascript
vapidPublicKey: "BM..."
```

---

## ✅ Verifica Rapida

**Config Firebase:**
- [ ] Tutte le credenziali copiate
- [ ] `fcm-config.js` aggiornato

**Service Account:**
- [ ] File JSON scaricato
- [ ] Variabile ambiente Vercel aggiunta

**Deploy:**
- [ ] Deploy su Vercel completato
- [ ] Nessun errore nei log

---

Per dettagli completi, vedi: `ARCHIVIO-FCM-SETUP.md`

