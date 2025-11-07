# 🔑 Setup Service Account Firebase - Guida Step by Step

## 🎯 Obiettivo
Configurare Firebase Service Account per inviare push notifications dal server.

---

## STEP 1: Generare Service Account Key

### Passo 1.1: Aprire Service Accounts
1. Nel dashboard Firebase, vai su **⚙️ Impostazioni progetto**
2. Vai alla tab **"Service accounts"**
3. Sezione **"Firebase Admin SDK"**

### Passo 1.2: Generare Private Key
1. Clicca su **"Generate new private key"** (o **"Genera nuova chiave privata"**)
2. Nella finestra di conferma, clicca su **"Generate key"**
3. Si scaricherà un file JSON (es. `tradelia-push-xxxxx-firebase-adminsdk-xxxxx-xxxxx.json`)

### Passo 1.3: Salvare File
- **IMPORTANTE**: Salva il file in un posto sicuro
- **NON** committare il file nel repository!
- Aggiungi il file a `.gitignore` se non c'è già

---

## STEP 2: Aggiungere Variabile Ambiente Vercel

### Passo 2.1: Aprire File JSON
1. Apri il file JSON scaricato con un editor di testo
2. **Copia tutto il contenuto** del file (dall'inizio `{` alla fine `}`)

### Passo 2.2: Aggiungere in Vercel
1. Vai su **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Clicca su **"Add New"**
3. Compila:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Incolla tutto il contenuto del file JSON (come stringa)
   - **Environment**: Seleziona tutte (Production, Preview, Development)
4. Clicca su **"Save"**

### Passo 2.3: Aggiungere API Key (Opzionale)
Per proteggere l'endpoint `/api/send-push`, aggiungi anche:
- **Key**: `PUSH_API_KEY`
- **Value**: Una chiave segreta a tua scelta (es. `your-secret-api-key-123`)
- **Environment**: Seleziona tutte

---

## STEP 3: Verificare Dipendenze

### Passo 3.1: Installare Firebase Admin SDK
Assicurati che `firebase-admin` sia installato:

```bash
npm install firebase-admin
```

Oppure verifica in `package.json`:
```json
{
  "dependencies": {
    "firebase-admin": "^12.x.x"
  }
}
```

### Passo 3.2: Installare Supabase Client
Assicurati che `@supabase/supabase-js` sia installato:

```bash
npm install @supabase/supabase-js
```

---

## STEP 4: Testare API

### Passo 4.1: Riavviare Deploy
1. Vai su **Vercel Dashboard** → **Deployments**
2. Riavvia l'ultimo deploy (o fai un nuovo commit per triggerare un nuovo deploy)

### Passo 4.2: Testare Invio Push
Dopo il deploy, testa l'API:

```bash
curl -X POST https://tuo-dominio.vercel.app/api/send-push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-api-key" \
  -d '{
    "title": "Test Push",
    "body": "Questa è una notifica di test",
    "data": {
      "url": "/archivio/dashboard.html"
    }
  }'
```

**Dovresti ricevere:**
```json
{
  "success": true,
  "sent": 1,
  "total": 1
}
```

---

## ✅ VERIFICA FINALE

### Checklist:
- [ ] Service Account key generato
- [ ] File JSON salvato (non committato)
- [ ] Variabile ambiente `FIREBASE_SERVICE_ACCOUNT` aggiunta in Vercel
- [ ] Variabile ambiente `PUSH_API_KEY` aggiunta in Vercel (opzionale)
- [ ] `firebase-admin` installato
- [ ] `@supabase/supabase-js` installato
- [ ] Deploy riavviato
- [ ] API testata e funzionante

---

## 🐛 TROUBLESHOOTING

### Errore: "FIREBASE_SERVICE_ACCOUNT non configurato"
**Causa**: Variabile ambiente non configurata
**Soluzione**: Verifica che `FIREBASE_SERVICE_ACCOUNT` sia presente in Vercel

### Errore: "Invalid service account"
**Causa**: JSON non valido
**Soluzione**: Verifica che il contenuto del file JSON sia copiato correttamente (inclusi `{` e `}`)

### Errore: "Unauthorized"
**Causa**: API key non corretta
**Soluzione**: Verifica che `PUSH_API_KEY` corrisponda al token nell'header Authorization

---

## 🎉 COMPLETATO!

Una volta completati tutti gli step, le push notifications sono completamente configurate!

**Prossimi step:**
1. Testare push notifications dalla dashboard
2. Verificare che le subscriptions vengano salvate in Supabase
3. Testare invio push manuale

