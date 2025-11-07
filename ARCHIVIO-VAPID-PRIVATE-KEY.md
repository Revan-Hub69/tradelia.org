# 🔑 Come Trovare VAPID Private Key - Guida Step by Step

## 🎯 Obiettivo
Trovare la VAPID private key in Firebase Console per configurare `web-push` library.

---

## STEP 1: Aprire Firebase Console

### Passo 1.1: Accedere
1. Vai su https://console.firebase.google.com
2. Accedi con il tuo account Google
3. Seleziona il progetto **`tradelia-push`**

---

## STEP 2: Trovare Cloud Messaging Settings

### Passo 2.1: Aprire Impostazioni Progetto
1. In alto a destra, clicca sull'icona **⚙️** (Impostazioni)
2. Vai su **"Impostazioni progetto"** (Project Settings)

### Passo 2.2: Tab Cloud Messaging
1. Nelle impostazioni del progetto, cerca le **tab** in alto
2. Clicca sulla tab **"Cloud Messaging"** (o "Messaging")

### Passo 2.3: Sezione Web Configuration
1. Nella tab Cloud Messaging, scorri in basso
2. Cerca la sezione **"Web configuration"** (Configurazione Web)
3. Oppure cerca **"Web Push Certificates"** (Certificati Web Push)

---

## STEP 3: Trovare VAPID Keys

### Passo 3.1: Se Vedi le Chiavi
Se vedi una sezione con:
- **"Key pair"** (Coppia di chiavi)
- **"Public key"** (Chiave pubblica) - già la abbiamo
- **"Private key"** (Chiave privata) - questa ci serve

**Cosa fare:**
1. Clicca su **"Show"** o **"Reveal"** accanto a "Private key"
2. **Copia** la chiave privata (inizia con `-----BEGIN PRIVATE KEY-----`)
3. **Salva** questa chiave

---

### Passo 3.2: Se NON Vedi le Chiavi
Se non vedi le chiavi o vedi solo la public key:

**Opzione A: Genera Nuova Coppia**
1. Cerca un pulsante **"Generate key pair"** (Genera coppia di chiavi)
2. Clicca su **"Generate key pair"**
3. **IMPORTANTE**: Quando generi una nuova coppia, devi aggiornare anche la public key nel file `fcm-config.js`
4. Copia sia la **public key** che la **private key**

**Opzione B: Usa la Public Key Esistente**
Se hai già la public key salvata (`BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0`), cerca la private key corrispondente.

---

## STEP 4: Alternativa - Generare VAPID Keys Programmaticamente

Se non trovi la private key in Firebase Console, possiamo generarla programmaticamente:

### Usando Node.js:
```bash
npm install web-push
```

```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

**IMPORTANTE**: Se generi nuove chiavi:
1. Aggiorna la **public key** in `/archivio/assets/js/fcm-config.js`
2. Aggiorna la **public key** in Firebase Console → Cloud Messaging → Settings
3. Usa la **private key** in variabile ambiente Vercel

---

## STEP 5: Aggiungere in Vercel

### Passo 5.1: Aprire Vercel Dashboard
1. Vai su https://vercel.com
2. Seleziona il progetto Tradelia

### Passo 5.2: Aggiungere Variabile Ambiente
1. Vai su **Settings** → **Environment Variables**
2. Clicca su **"Add New"**
3. Compila:
   - **Key**: `FIREBASE_VAPID_PRIVATE_KEY`
   - **Value**: Incolla la VAPID private key (tutto il contenuto, dall'inizio `-----BEGIN PRIVATE KEY-----` alla fine `-----END PRIVATE KEY-----`)
   - **Environment**: Seleziona tutte (Production, Preview, Development)
4. Clicca su **"Save"**

---

## 📋 FORMATO VAPID PRIVATE KEY

La VAPID private key ha questo formato:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCk1diNgKSBdLGo
...
(più righe)
...
-----END PRIVATE KEY-----
```

**IMPORTANTE**: Copia TUTTO, incluse le righe `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`

---

## 🐛 TROUBLESHOOTING

### Problema: Non Vedo "Web Push Certificates"
**Soluzione:**
1. Verifica di essere nella tab corretta (Cloud Messaging)
2. Scorri in basso nella pagina
3. Cerca "Web configuration" o "Web Push"
4. Se non la trovi, prova a generare una nuova coppia

### Problema: Vedo Solo Public Key
**Soluzione:**
1. Clicca su "Show" o "Reveal" per vedere la private key
2. Se non c'è, genera una nuova coppia
3. Aggiorna la public key nel file `fcm-config.js`

### Problema: Non Trovo Cloud Messaging
**Soluzione:**
1. Vai su ⚙️ → Impostazioni progetto
2. Cerca la tab "Cloud Messaging"
3. Se non la vedi, abilita Cloud Messaging API prima

---

## ✅ VERIFICA

Dopo aver aggiunto la VAPID private key in Vercel:
- [ ] Variabile `FIREBASE_VAPID_PRIVATE_KEY` presente in Vercel
- [ ] Valore contiene `-----BEGIN PRIVATE KEY-----`
- [ ] Valore contiene `-----END PRIVATE KEY-----`
- [ ] Deploy riavviato

---

## 🎯 PROSSIMI STEP

1. ✅ Trovare/copiare VAPID private key
2. ✅ Aggiungere in Vercel come `FIREBASE_VAPID_PRIVATE_KEY`
3. ✅ Aggiungere Service Account in Vercel come `FIREBASE_SERVICE_ACCOUNT`
4. ✅ Installare dipendenze (`npm install`)
5. ✅ Testare push notifications

---

**Nota:** Se non trovi la VAPID private key, possiamo generarla programmaticamente. Dimmi se preferisci questa opzione.

