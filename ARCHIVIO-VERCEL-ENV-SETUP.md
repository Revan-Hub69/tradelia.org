# 🔧 Setup Variabili Ambiente Vercel

## 📋 Guida Step by Step

### STEP 1: Aprire Vercel Dashboard

1. Vai su https://vercel.com
2. Accedi con il tuo account
3. Seleziona il progetto **Tradelia** (o il nome del tuo progetto)

---

### STEP 2: Aprire Environment Variables

1. Vai su **Settings** (Impostazioni)
2. Nel menu laterale, clicca su **Environment Variables** (Variabili d'ambiente)

---

### STEP 3: Aggiungere Variabili

Aggiungi una variabile alla volta cliccando su **"Add New"** (Aggiungi nuova).

#### 3.1: FIREBASE_VAPID_PRIVATE_KEY

1. Clicca su **"Add New"**
2. Compila:
   - **Key** (Chiave): `FIREBASE_VAPID_PRIVATE_KEY`
   - **Value** (Valore): `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ`
   - **Environment** (Ambiente): Seleziona tutte le opzioni:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
3. Clicca su **"Save"** (Salva)

#### 3.2: FIREBASE_VAPID_PUBLIC_KEY (opzionale)

1. Clicca su **"Add New"**
2. Compila:
   - **Key**: `FIREBASE_VAPID_PUBLIC_KEY`
   - **Value**: `BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0`
   - **Environment**: Seleziona tutte (Production, Preview, Development)
3. Clicca su **"Save"**

#### 3.3: FIREBASE_SERVICE_ACCOUNT (da aggiungere dopo)

1. Clicca su **"Add New"**
2. Compila:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Incolla qui il contenuto JSON completo del Service Account
     - **IMPORTANTE**: Se il JSON è su più righe, convertilo in una singola riga
     - Oppure usa il formato JSON string (con escape delle virgolette)
   - **Environment**: Seleziona tutte (Production, Preview, Development)
3. Clicca su **"Save"**

**Nota**: Il Service Account JSON deve essere ottenuto da Firebase Console → ⚙️ → Impostazioni progetto → Service accounts → Generate new private key

#### 3.4: PUSH_API_KEY (opzionale, per proteggere /api/send-push)

1. Clicca su **"Add New"**
2. Compila:
   - **Key**: `PUSH_API_KEY`
   - **Value**: Genera una chiave segreta a tua scelta (es: `tradelia-push-secret-2025`)
   - **Environment**: Seleziona tutte (Production, Preview, Development)
3. Clicca su **"Save"**

#### 3.5: Verificare Supabase (se non presenti)

1. Verifica che esistano:
   - `SUPABASE_URL` = `https://higkhlfjfhlecbtfnznx.supabase.co`
   - `SUPABASE_ANON_KEY` = (la tua anon key)
2. Se non ci sono, aggiungile seguendo lo stesso processo

---

### STEP 4: Riavviare Deploy

Dopo aver aggiunto le variabili ambiente:

1. Vai su **Deployments** (Deploy)
2. Trova l'ultimo deploy
3. Clicca sui **tre puntini** (⋯) → **Redeploy** (Rideploya)
4. Oppure fai un nuovo commit per triggerare un nuovo deploy

**IMPORTANTE**: Le variabili ambiente vengono applicate solo ai nuovi deploy!

---

## ✅ Checklist Variabili Ambiente

Dopo aver aggiunto tutto, verifica che ci siano:

- [ ] `FIREBASE_VAPID_PRIVATE_KEY` = `E6cggtHVRuV6vN3vDkoRDU_oRcgsGid8QFAs0R1n9JQ`
- [ ] `FIREBASE_VAPID_PUBLIC_KEY` = `BGUfdP2IYXrvOwDYEqmRwhZqodiQB1CKeaLd1-oILrVCfgTW7n_mjCe3WQYzYXQw1dqgOtIRTOEfBHu6gj22Uc0`
- [ ] `FIREBASE_SERVICE_ACCOUNT` = (JSON completo del Service Account)
- [ ] `PUSH_API_KEY` = (chiave segreta a tua scelta)
- [ ] `SUPABASE_URL` = `https://higkhlfjfhlecbtfnznx.supabase.co`
- [ ] `SUPABASE_ANON_KEY` = (la tua anon key)

---

## 🐛 Troubleshooting

### Problema: Variabile non funziona dopo il deploy
**Soluzione**: 
- Verifica che la variabile sia presente in tutte le environment (Production, Preview, Development)
- Riavvia il deploy (Redeploy)

### Problema: Errore JSON nel Service Account
**Soluzione**: 
- Verifica che il JSON sia su una singola riga
- Verifica che non ci siano spazi o caratteri speciali
- Usa un tool online per validare il JSON

### Problema: Non vedo le variabili nel codice
**Soluzione**: 
- Le variabili ambiente sono disponibili solo in runtime (non in build time)
- Usa `process.env.VARIABLE_NAME` per accedervi
- Verifica che il deploy sia stato fatto dopo aver aggiunto le variabili

---

## 📝 Formato Service Account JSON

Il Service Account JSON deve essere in questo formato:

```json
{
  "type": "service_account",
  "project_id": "tradelia-push",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**IMPORTANTE**: Quando lo incolli in Vercel, convertilo in una singola riga o usa il formato JSON string.

---

**Nota**: Dopo aver aggiunto tutte le variabili, ricorda di fare un nuovo deploy per applicare le modifiche!

