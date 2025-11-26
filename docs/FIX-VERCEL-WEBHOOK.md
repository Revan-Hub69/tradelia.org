# Fix: Vercel Non Fa Deploy - Webhook Mancanti

## 🔍 Problema Identificato

**Webhook GitHub non configurati** → Vercel non riceve notifiche quando fai push → Nessun deploy automatico

## ✅ Soluzione: Riconnetti Repository su Vercel

### Passo 1: Vai su Vercel Dashboard

1. Apri https://vercel.com/dashboard
2. Seleziona il progetto `tradelia.org` (o il nome del tuo progetto)

### Passo 2: Disconnetti Repository

1. Vai su **Settings** (Impostazioni)
2. Clicca su **Git** nel menu laterale
3. Scorri fino a "Connected Git Repository"
4. Clicca su **"Disconnect"** o **"Disconnetti"**

### Passo 3: Riconnetti Repository

1. Clicca su **"Connect Git Repository"** o **"Connetti Repository Git"**
2. Seleziona **GitHub** come provider
3. Autorizza Vercel ad accedere a GitHub (se richiesto)
4. Seleziona il repository: `Revan-Hub69/tradelia.org`
5. Clicca **"Import"** o **"Importa"**

### Passo 4: Configura Branch Production

1. Durante l'import, o dopo in Settings → Git:
2. Assicurati che **"Production Branch"** sia impostato su **`Tradelia-Main`**
   - NON `main` o `master`
   - Deve essere esattamente `Tradelia-Main`

### Passo 5: Verifica Webhook Creati

1. Vai su GitHub: https://github.com/Revan-Hub69/tradelia.org
2. Clicca su **Settings** (Impostazioni del repository)
3. Nel menu laterale, clicca su **Webhooks**
4. Dovresti vedere un webhook di Vercel:
   - URL: `https://api.vercel.com/v1/integrations/github/...`
   - Status: **Active** (verde)
   - Events: `push`, `pull_request`, etc.

### Passo 6: Test Deploy Automatico

1. Fai un piccolo cambiamento (es. aggiungi un commento)
2. Commit e push:
   ```bash
   git add .
   git commit -m "test: verify webhook"
   git push origin Tradelia-Main
   ```
3. Vai su Vercel Dashboard → Deployments
4. Dovresti vedere un nuovo deploy iniziare automaticamente

## 🎯 Verifica Finale

**Dopo aver riconnesso, verifica:**

✅ **GitHub Webhooks:**

- Vai su GitHub → Repository → Settings → Webhooks
- Dovresti vedere webhook di Vercel attivo

✅ **Vercel Settings:**

- Settings → Git → Connected Repository
- Production Branch = `Tradelia-Main`

✅ **Deploy Automatico:**

- Fai un push
- Vercel dovrebbe triggerare deploy automaticamente

## ⚠️ Se Non Funziona

1. **Verifica Permessi GitHub:**
   - Vercel deve avere accesso al repository
   - GitHub → Settings → Applications → Authorized OAuth Apps
   - Cerca "Vercel" e verifica che abbia accesso

2. **Verifica Branch:**
   - Deve essere esattamente `Tradelia-Main` (case-sensitive)
   - Non `main`, `master`, o `tradelia-main`

3. **Prova Deploy Manuale:**

   ```bash
   vercel --prod
   ```

   Se funziona, il problema è solo nei webhook

4. **Contatta Support:**
   - Se nulla funziona, contatta Vercel support
   - Dashboard → Help → Contact Support

## 📝 Note

- I webhook vengono creati automaticamente quando connetti il repository
- Se non ci sono webhook, significa che il repository non è mai stato connesso o è stato disconnesso
- Riconnettendo, Vercel ricrea tutti i webhook necessari
