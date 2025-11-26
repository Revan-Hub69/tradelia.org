# Come Vedere Limiti Vercel e Perché Non Deploya

## 🔍 DOVE VEDERE I LIMITI VERCEL

### Passo 1: Vai al Dashboard Vercel

1. Apri https://vercel.com/dashboard
2. **Accedi** al tuo account (se non sei già loggato)

### Passo 2: Seleziona il Progetto

1. Clicca sul progetto **`tradelia.org`** (o il nome del tuo progetto)

### Passo 3: Vai alle Impostazioni Billing

1. Clicca su **"Settings"** (Impostazioni) in alto a destra
2. Nel menu laterale sinistro, clicca su **"Billing"** (Fatturazione)

### Passo 4: Vedi i Limiti

Nella sezione **"Usage"** (Utilizzo) vedrai:

- **Deployments this month**: `XX / 100`
  - Se vedi `100 / 100` → **HAI RAGGIUNTO IL LIMITE** ❌
  - Se vedi meno di 100 → hai ancora deploy disponibili ✅

- **Bandwidth**: `XX GB / 100 GB`
- **Serverless Function Execution**: `XX / 100 GB-hours`

## 🚨 SE HAI RAGGIUNTO IL LIMITE (100/100)

**Cosa significa:**

- ✅ I deploy **automatici** si fermano
- ✅ Puoi ancora fare deploy **manuali** (fino a ~1000/mese)
- ✅ Il limite si resetta il **primo del mese**

**Soluzione immediata:**

```bash
# Deploy manuale (bypassa il limite)
vercel --prod
```

## 🔍 PERCHÉ NON DEPLOYA DA 15 ORE

### Controlla Questi Punti:

#### 1. **Limite Raggiunto?**

- Vercel Dashboard → Settings → Billing
- Controlla "Deployments this month"
- Se `100/100` → **LIMITE RAGGIUNTO**

#### 2. **Webhook Configurati?**

- GitHub → Repository → Settings → Webhooks
- Dovresti vedere webhook di Vercel
- Se **NON ci sono webhook** → Vercel non riceve notifiche dei push

**Fix:** Riconnetti repository su Vercel:

- Vercel Dashboard → Settings → Git
- Disconnetti e riconnetti repository

#### 3. **Branch Corretto?**

- Vercel Dashboard → Settings → Git
- Controlla "Production Branch"
- Deve essere **`Tradelia-Main`** (non `main` o `master`)

#### 4. **Ultimo Deploy Fallito?**

- Vercel Dashboard → Deployments
- Controlla l'ultimo deploy
- Se è **"Failed"** o **"Canceled"** → c'è un errore di build

#### 5. **Deploy in Coda?**

- Vercel Dashboard → Deployments
- Controlla se c'è un deploy **"Building"** o **"Queued"**
- Potrebbe essere in attesa

## 📊 CHECKLIST COMPLETA

Usa questa checklist per diagnosticare:

```
□ Vercel Dashboard → Settings → Billing
  → Deployments: XX/100 (se 100/100 = LIMITE)

□ GitHub → Repository → Settings → Webhooks
  → Webhook Vercel presente e attivo? (se NO = problema)

□ Vercel Dashboard → Settings → Git
  → Production Branch = Tradelia-Main? (se NO = problema)

□ Vercel Dashboard → Deployments
  → Ultimo deploy: Success/Failed/Canceled? (se Failed = problema)

□ Git log: ci sono commit recenti?
  → git log --oneline -5 (se SÌ ma non deploya = webhook/branch)
```

## 🎯 SOLUZIONI RAPIDE

### Se Limite Raggiunto (100/100):

```bash
# Deploy manuale immediato
vercel --prod
```

### Se Webhook Mancanti:

1. Vercel Dashboard → Settings → Git
2. Disconnetti repository
3. Riconnetti repository
4. Seleziona branch `Tradelia-Main`

### Se Branch Sbagliato:

1. Vercel Dashboard → Settings → Git
2. Cambia "Production Branch" in `Tradelia-Main`
3. Salva

### Se Deploy Fallito:

1. Vercel Dashboard → Deployments
2. Clicca sul deploy fallito
3. Guarda i log per errori
4. Correggi gli errori
5. Fai nuovo push o redeploy

## 💡 VERIFICA RAPIDA

**Comando per vedere ultimi commit:**

```bash
git log --oneline -5
```

**Se vedi commit recenti ma Vercel non deploya:**

- 99% probabilità: **Limite raggiunto** O **Webhook mancanti**

**Verifica immediata:**

1. Vercel Dashboard → Settings → Billing → "Deployments this month"
2. GitHub → Settings → Webhooks → Webhook Vercel presente?

## 📝 NOTA IMPORTANTE

**Deploy manuali NON contano** verso il limite di 100 automatici!

Quindi anche se hai raggiunto 100/100, puoi fare:

```bash
vercel --prod  # Deploy manuale (funziona sempre)
```
