# Push Notifications - Come Funzionano

## 🔄 FLOW COMPLETO

### 1. **Registrazione Service Worker**
```
Utente visita sito
  ↓
Service Worker si registra (`/service-worker.js`)
  ↓
Chiede permesso notifiche (`Notification.requestPermission()`)
  ↓
Crea subscription (endpoint + keys VAPID)
  ↓
Salva subscription in database (`push_subscriptions`)
```

### 2. **Invio Notifica**
```
Admin/System chiama `/api/notifications/send`
  ↓
API crea record in `notifications` table
  ↓
Recupera subscriptions utente da database
  ↓
Per ogni subscription:
  - Crea payload JSON con dati notifica
  - Usa `web-push` per inviare a endpoint (Google/Chrome)
  ↓
Google/Chrome invia notifica al dispositivo
  ↓
Service Worker riceve evento `push`
  ↓
Mostra notifica con `showNotification()`
```

### 3. **Click Notifica**
```
Utente clicca notifica
  ↓
Service Worker riceve evento `notificationclick`
  ↓
Se azione = "dismiss": ignora
  ↓
Se azione = "open" o default:
  - Cerca finestra esistente
  - Se trovata: focusa e naviga
  - Se non trovata: apre nuova finestra
```

---

## 📦 FORMATO PAYLOAD

### Payload Inviato (JSON)
```json
{
  "title": "Analisi Completata",
  "body": "La tua analisi è pronta",
  "url": "/dashboard#analysis-123",
  "icon": "/favicon.png",
  "badge": "/favicon-32x32.png",
  "tag": "analysis-123",
  "id": "notification-id",
  "type": "analysis_completed",
  "actions": [
    { "action": "open", "title": "Vedi Analisi" },
    { "action": "dismiss", "title": "Ignora" }
  ],
  "vibrate": [200, 100, 200],
  "timestamp": 1234567890,
  "requireInteraction": false,
  "renotify": true,
  "silent": false,
  "dir": "ltr",
  "lang": "it"
}
```

### Opzioni Notifica (Service Worker)
```javascript
{
  body: "Messaggio",
  icon: "/favicon.png",
  badge: "/favicon-32x32.png",
  tag: "analysis-123", // Raggruppa notifiche
  data: {
    url: "/dashboard#analysis-123",
    id: "notification-id",
    type: "analysis_completed"
  },
  actions: [
    { action: "open", title: "Apri" },
    { action: "dismiss", title: "Ignora" }
  ],
  vibrate: [200, 100, 200],
  timestamp: 1234567890,
  requireInteraction: false,
  renotify: true,
  silent: false,
  dir: "ltr",
  lang: "it"
}
```

---

## 🔐 SICUREZZA

### VAPID Keys
- **Public Key**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Usata client-side
- **Private Key**: `VAPID_PRIVATE_KEY` - Usata server-side (NON esporre)
- **Subject**: Email del server (es. `mailto:support@tradelia.org`)

### Subscription
- Ogni utente può avere multiple subscriptions (diversi dispositivi)
- Subscription contiene:
  - `endpoint`: URL unico per dispositivo
  - `keys.p256dh`: Chiave pubblica per crittografia
  - `keys.auth`: Token autenticazione

---

## 🎯 BEST PRACTICES IMPLEMENTATE

### ✅ Raggruppamento (Tag)
- Notifiche con stesso `tag` si raggruppano
- `renotify: true` suona di nuovo se tag duplicato

### ✅ Azioni Rapide
- "Apri" - Apre notifica
- "Ignora" - Dismiss notifica

### ✅ Feedback Tattile
- `vibrate` per notifiche importanti (mobile)

### ✅ Gestione Click
- Cerca finestra esistente prima di aprirne nuova
- Focusa finestra se già aperta

### ✅ Tipi Notifiche
- `analysis_completed`: Analisi pronta
- `plan_expiring`: Piano in scadenza
- `credits_low`: Crediti bassi
- `system`: Notifiche sistema

---

## 📊 STATISTICHE

- **Push Sent**: Numero notifiche inviate con successo
- **Push Errors**: Numero errori (subscription invalida, etc)
- **SMS Sent**: Numero SMS inviati
- **WhatsApp Sent**: Numero WhatsApp inviati

---

## 🐛 GESTIONE ERRORI

### Subscription Invalida (410)
- Rimuove automaticamente subscription dal database
- Non blocca invio ad altre subscriptions

### Network Error
- Log errore ma non fallisce
- Continua con altre subscriptions

### VAPID Keys Mancanti
- Push notifications disabilitate
- Notifiche salvate comunque in database

