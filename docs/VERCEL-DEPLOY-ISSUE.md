# Problema: Vercel Non Fa Deploy Automatico

## 🔍 Diagnosi

Se Vercel non fa deploy automatico dopo i push, controlla:

### 1. **Branch Collegato a Vercel**

Vercel potrebbe essere collegato al branch sbagliato:

- ✅ Verifica nel dashboard Vercel → Settings → Git → **Production Branch**
- ✅ Dovrebbe essere `Tradelia-Main` (non `main` o `master`)

**Fix:**

1. Vai su https://vercel.com/dashboard
2. Seleziona il progetto `tradelia.org`
3. Settings → Git
4. Cambia "Production Branch" in `Tradelia-Main`
5. Salva

### 2. **Webhook GitHub Non Funzionante**

I webhook potrebbero essere disabilitati o rotti:

**Verifica:**

1. GitHub → Repository → Settings → Webhooks
2. Cerca webhook di Vercel (dovrebbe essere `https://api.vercel.com/v1/integrations/github/...`)
3. Controlla se è "Active" (verde)
4. Controlla "Recent Deliveries" per vedere se i push vengono ricevuti

**Fix:**

1. Se il webhook non esiste o è rotto:
   - Vercel Dashboard → Settings → Git
   - Disconnetti e riconnetti il repository
   - Questo ricrea i webhook

### 3. **Limite Deploy Raggiunto (Hobby Plan)**

Vercel Hobby ha un limite di **100 deploy/mese**.

**Verifica:**

1. Vercel Dashboard → Settings → Billing
2. Controlla "Deployments this month"

**Fix:**

- Aspetta il reset mensile
- O upgrade a Pro per deploy illimitati
- O usa deploy manuale con CLI: `vercel --prod`

### 4. **Deploy Manuale Immediato**

Se hai bisogno di deployare subito:

```bash
# Installa Vercel CLI (una volta)
npm i -g vercel

# Login (una volta)
vercel login

# Deploy manuale in produzione
vercel --prod
```

Questo bypassa i limiti e fa deploy immediato.

### 5. **Build Fails Silently**

A volte Vercel prova a deployare ma fallisce silenziosamente:

**Verifica:**

1. Vercel Dashboard → Deployments
2. Controlla se ci sono deploy "Failed" o "Canceled"
3. Guarda i log per errori

**Fix:**

- Correggi gli errori di build
- Verifica che `npm run build` funzioni localmente

## 🎯 Soluzione Rapida

**Per deployare subito:**

1. **Opzione A - Vercel CLI:**

   ```bash
   vercel --prod
   ```

2. **Opzione B - Dashboard:**
   - Vercel Dashboard → Deployments
   - Clicca "Redeploy" sull'ultimo deploy
   - O "Create Deployment" → seleziona branch `Tradelia-Main`

3. **Opzione C - Fix Webhook:**
   - Vercel Dashboard → Settings → Git
   - Disconnetti repository
   - Riconnetti repository
   - Seleziona branch `Tradelia-Main` come Production

## 📊 Verifica Stato Attuale

**Commit recenti su `Tradelia-Main`:**

- `68f4db8` - revert: remove Cloudflare compatibility code (più recente)
- `9604c06` - fix(cloudflare): resolve build errors
- `af3f026` - feat(cloudflare): add adapter layer
- `18dc460` - feat(education): normalize stats and enforce lesson locks

**Se questi commit non sono su Vercel**, il problema è nella configurazione Git/Webhook.
