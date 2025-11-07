# 📋 Setup Vercel KV con Upstash - Guida Step by Step

## 🎯 Obiettivo
Configurare Upstash Redis (KV) per il sistema di votazioni.

---

## STEP 1: Creare Database Upstash tramite Marketplace

### Passo 1.1: Selezionare Upstash
1. Nella schermata che vedi, clicca su **"Upstash"** (Serverless DB - Redis, Vector, Queue, Search)
2. Clicca su **"Create"** o **"Add Integration"**

### Passo 1.2: Autorizzare Upstash
1. Se non hai un account Upstash:
   - Clicca su **"Sign up with Upstash"** o **"Create Upstash account"**
   - Crea account (puoi usare GitHub o email)
   - Autorizza Vercel ad accedere a Upstash
2. Se hai già un account:
   - Clicca su **"Connect"** o **"Authorize"**
   - Autorizza Vercel ad accedere a Upstash

### Passo 1.3: Configurare Database
1. **Database Name**: `tradelia-kv` (o altro nome)
2. **Type**: Seleziona **"Redis"** (non Vector, Queue o Search)
3. **Region**: Scegli la regione più vicina:
   - `eu-west-1` (Europa Ovest - Irlanda) - Consigliato per Italia
   - `us-east-1` (US East - Virginia)
   - `us-west-1` (US West - California)
4. **Primary Region**: Seleziona la stessa regione
5. Clicca su **"Create"** o **"Deploy"**

### Passo 1.4: Attendere Creazione
- Attendi qualche secondo (10-30 secondi)
- Vedrai un messaggio di successo quando è pronto

---

## STEP 2: Copiare Credenziali

### Passo 2.1: Aprire Database Upstash
1. Dopo la creazione, vedrai il database nella lista
2. Clicca sul database per aprirlo
3. Vai alla tab **"Details"** o **"Settings"**

### Passo 2.2: Copiare REST API URL
1. Cerca la sezione **"REST API"** o **"Connection"**
2. Trova **"REST API URL"** (es. `https://xxxxx.upstash.io`)
3. **Copia** l'URL completo

### Passo 2.3: Copiare REST API Token
1. Nella stessa sezione, trova **"REST API Token"**
2. Clicca su **"Show"** o **"Reveal"** per vedere il token
3. **Copia** il token completo

**⚠️ IMPORTANTE**: Salva queste credenziali in un posto sicuro!

---

## STEP 3: Aggiungere Variabili Ambiente in Vercel

### Passo 3.1: Aprire Settings Vercel
1. Nel progetto Vercel, vai su **Settings**
2. Clicca su **Environment Variables** nel menu laterale

### Passo 3.2: Aggiungere KV_REST_API_URL
1. Clicca su **"Add New"**
2. Compila:
   - **Key**: `KV_REST_API_URL`
   - **Value**: Incolla l'URL copiato (es. `https://xxxxx.upstash.io`)
   - **Environment**: Seleziona tutte (Production, Preview, Development)
3. Clicca su **"Save"**

### Passo 3.3: Aggiungere KV_REST_API_TOKEN
1. Clicca su **"Add New"** di nuovo
2. Compila:
   - **Key**: `KV_REST_API_TOKEN`
   - **Value**: Incolla il Token copiato
   - **Environment**: Seleziona tutte (Production, Preview, Development)
3. Clicca su **"Save"**

### Passo 3.4: Verificare
Dovresti vedere nella lista:
- ✅ `KV_REST_API_URL`
- ✅ `KV_REST_API_TOKEN`

---

## STEP 4: Verificare Installazione @vercel/kv

### Passo 4.1: Verificare package.json
1. Apri il file `package.json` del progetto
2. Verifica che ci sia:
   ```json
   {
     "dependencies": {
       "@vercel/kv": "^0.2.0"
     }
   }
   ```

### Passo 4.2: Installare se mancante
Se non c'è, installa:
```bash
npm install @vercel/kv
```

Oppure aggiungi manualmente in `package.json`:
```json
{
  "dependencies": {
    "@vercel/kv": "^0.2.0"
  }
}
```

---

## STEP 5: Riavviare Deploy

### Passo 5.1: Trigger Nuovo Deploy
1. Vai su **Deployments** nel progetto Vercel
2. Se c'è un deploy recente:
   - Clicca sui **tre puntini** (⋮)
   - Clicca su **"Redeploy"**
3. Oppure fai un commit/push per triggerare un nuovo deploy

### Passo 5.2: Verificare Deploy
1. Attendi che il deploy finisca
2. Verifica che non ci siano errori
3. Controlla i log per eventuali errori di connessione KV

---

## ✅ VERIFICA FINALE

### Test API Votazioni
Dopo il deploy, testa l'API:

**Test GET (recupera voti):**
```bash
curl https://tuo-dominio.vercel.app/api/vote
```

**Dovresti ricevere:**
```json
{"votes":[]}
```
(Array vuoto se non ci sono voti ancora)

**Test POST (invia voto):**
```bash
curl -X POST https://tuo-dominio.vercel.app/api/vote \
  -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","votes":5,"userId":"test"}'
```

**Dovresti ricevere:**
```json
{"success":true,"vote":{"ticker":"AAPL","votes":5,...}}
```

---

## 🐛 TROUBLESHOOTING

### Errore: "KV connection failed"
**Causa**: Variabili ambiente non configurate o deploy non aggiornato
**Soluzione**:
1. Verifica che le variabili ambiente siano presenti
2. Riavvia il deploy
3. Controlla che i valori siano corretti (senza spazi)

### Errore: "Invalid REST API URL"
**Causa**: URL non corretto
**Soluzione**:
1. Verifica che l'URL sia completo (inizia con `https://`)
2. Controlla che non ci siano spazi o caratteri extra

### Errore: "Unauthorized"
**Causa**: Token non corretto
**Soluzione**:
1. Verifica che il token sia completo
2. Controlla che non ci siano spazi
3. Rigenera il token in Upstash se necessario

---

## 📝 CHECKLIST

- [ ] Database Upstash Redis creato
- [ ] REST API URL copiato
- [ ] REST API Token copiato
- [ ] Variabile `KV_REST_API_URL` aggiunta in Vercel
- [ ] Variabile `KV_REST_API_TOKEN` aggiunta in Vercel
- [ ] `@vercel/kv` installato nel progetto
- [ ] Deploy riavviato
- [ ] API `/api/vote` testata e funzionante

---

## 🎉 COMPLETATO!

Una volta completati tutti gli step, il sistema di votazioni è pronto!

Per testare nella dashboard:
1. Vai su `/archivio/dashboard.html`
2. Fai login
3. Vai al tab **"Votazione"**
4. Inserisci un ticker e vota
5. Verifica che il ranking si aggiorni

