# 🚀 Setup Render per Tradelia

## Perché Render?

- ✅ **Node.js nativo** - Zero problemi con `firebase-admin`
- ✅ **100GB bandwidth/mese** gratuito
- ✅ **750 ore runtime/mese** gratuito
- ✅ **Deploy automatico** da Git
- ✅ **SSL automatico**
- ✅ **Nessun limite** di deploy giornaliero

## File Creati

1. ✅ `render.yaml` - Configurazione Render
2. ✅ `server.js` - Server Express per static + API
3. ✅ Questa guida

## Step 1: Prepara il Progetto

### Verifica Dipendenze

Assicurati che `package.json` includa:

- `express` (per il server)
- Tutte le altre dipendenze già presenti

Se manca `express`, aggiungilo:

```bash
npm install express
```

## Step 2: Deploy su Render

### Opzione A: Via Dashboard (CONSIGLIATA)

1. **Vai su [Render](https://render.com)**
   - Crea account se non ce l'hai (gratis)
   - Puoi usare GitHub per login

2. **New + Web Service**
   - Clicca "New +" → "Web Service"
   - Connetti GitHub repository
   - Autorizza Render

3. **Seleziona Repository**
   - Cerca `tradelia.org-main` (o il nome del tuo repo)
   - Clicca "Connect"

4. **Configurazione** (Render dovrebbe auto-rilevare da `render.yaml`)
   - **Name**: `tradelia` (o come preferisci)
   - **Region**: `Frankfurt` (o più vicino a te)
   - **Branch**: `main` (o il tuo branch principale)
   - **Root Directory**: `.` (root del progetto)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
   - **Plan**: `Free` (o `Starter` se vuoi)

5. **Environment Variables**
   - Clicca "Advanced" → "Add Environment Variable"
   - Copia **TUTTE** le variabili da Vercel:
     ```
     SUPABASE_URL=...
     SUPABASE_ANON_KEY=...
     SUPABASE_SERVICE_ROLE_KEY=...
     FIREBASE_SERVICE_ACCOUNT=...
     STRIPE_SECRET_KEY=...
     XOLO_API_KEY=...
     NODE_ENV=production
     PORT=10000
     ```
     (Aggiungi tutte le altre che hai su Vercel)

6. **Deploy!**
   - Clicca "Create Web Service"
   - Aspetta il build (5-10 minuti)
   - ✅ Fatto!

### Opzione B: Via `render.yaml` (Auto-detect)

Se hai già pushato `render.yaml`:

1. Render rileva automaticamente il file
2. Clicca "New +" → "Blueprint"
3. Seleziona il repository
4. Render caricherà la configurazione da `render.yaml`
5. Aggiungi solo le environment variables
6. Deploy!

## Step 3: Verifica Deploy

1. **Visita il sito**: Render ti darà un URL tipo `tradelia.onrender.com`
2. **Testa le API**:
   - `https://tradelia.onrender.com/api/health`
   - `https://tradelia.onrender.com/api/user`
3. **Controlla i log**: Dashboard → Clicca sul service → "Logs"

## Step 4: Configura Domain (OPZIONALE)

1. **Render Dashboard** → Il tuo service → **Settings**
2. **Custom Domains** → **Add**
3. Inserisci `tradelia.org`
4. Render ti darà i DNS records:
   - **CNAME**: `tradelia.org` → `tradelia.onrender.com`
   - Oppure **A Record** (se preferisci)
5. Aggiorna i DNS sul tuo registrar
6. SSL sarà automatico (Let's Encrypt)

## Step 5: Auto-Deploy (GIÀ CONFIGURATO)

- ✅ `autoDeploy: true` in `render.yaml`
- Ogni push su `main` triggera un nuovo deploy
- Puoi disabilitare in Settings se preferisci

## Troubleshooting

### Build Fallisce

**Errore: "express not found"**

```bash
# Aggiungi express a package.json
npm install express
git add package.json package-lock.json
git commit -m "Add express dependency"
git push
```

**Errore: "Cannot find module"**

- Verifica che tutte le dipendenze siano in `package.json`
- Controlla i log del build in Render Dashboard

### API Non Funzionano

**Errore 404 su `/api/*`**

- Verifica che `server.js` sia nella root
- Controlla i log: Dashboard → Logs
- Verifica che gli handler API siano in formato corretto

**Errore: "firebase-admin not found"**

- Verifica che `firebase-admin` sia in `package.json` (già c'è ✅)
- Controlla che le environment variables siano configurate

### Server Non Parte

**Errore: "Port already in use"**

- Verifica che `PORT` environment variable sia configurata
- Render usa automaticamente `PORT` se configurato

**Errore: "Cannot start server"**

- Controlla i log completi in Render Dashboard
- Verifica che `server.js` sia eseguibile

### Static Files Non Serviti

**Errore 404 su pagine HTML**

- Verifica che `npm run build` generi la cartella `dist/`
- Controlla che `dist/` contenga i file HTML
- Verifica i log per vedere da dove serve i file

## Vantaggi vs Vercel

| Feature            | Vercel       | Render            |
| ------------------ | ------------ | ----------------- |
| **Deploy/giorno**  | 100 (limite) | Illimitato        |
| **Build time**     | 45 min max   | Illimitato (free) |
| **Bandwidth**      | 100GB/mese   | 100GB/mese        |
| **Runtime**        | Serverless   | Web Service       |
| **firebase-admin** | ✅           | ✅                |
| **Node.js nativo** | ✅           | ✅                |
| **Auto-deploy**    | ✅           | ✅                |

## Costi

- **Free**: 100GB bandwidth, 750 ore runtime/mese
- **Starter ($7/mese)**: 400GB bandwidth, runtime illimitato
- **Standard ($25/mese)**: 1TB bandwidth, runtime illimitato, più risorse

## Prossimi Passi

1. ✅ Deploy su Render
2. ✅ Testa tutto (frontend + API)
3. ✅ Configura domain (opzionale)
4. ⏳ Aspetta che Vercel si sblocchi (6 ore)
5. 🔄 Mantieni entrambi come backup

## Supporto

- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status](https://status.render.com/)

## Note Importanti

- **Cold Start**: Render free tier ha cold start (~30 secondi dopo inattività)
- **Upgrade**: Se hai traffico costante, considera Starter plan ($7/mese)
- **Backup**: Mantieni Vercel come backup finché non verifichi che tutto funzioni
