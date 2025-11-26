# Deploy Manuale Vercel - Guida Completa

## 🚀 Setup Iniziale (Una Volta Sola)

### Passo 1: Installa Vercel CLI

Apri PowerShell o Terminale e esegui:

```bash
npm install -g vercel
```

**Se hai errori di permessi:**

```bash
# Su Windows, potrebbe servire:
npm install -g vercel --force
```

### Passo 2: Login su Vercel

```bash
vercel login
```

Ti aprirà il browser per:

1. Autorizzare Vercel CLI
2. Confermare il login

**Dopo il login, torna al terminale** - dovresti vedere "Success! Logged in as [tuo-username]"

## 📦 Deploy Manuale

### Opzione 1: Deploy in Produzione (Raccomandato)

```bash
vercel --prod
```

Questo:

- ✅ Deploya direttamente in produzione
- ✅ Bypassa il limite di 100 deploy automatici
- ✅ Usa le impostazioni del progetto

### Opzione 2: Deploy Preview (Test)

```bash
vercel
```

Questo:

- ✅ Crea un deploy di preview (non produzione)
- ✅ Utile per testare prima di andare in produzione
- ✅ Non conta verso il limite

## 🎯 Comandi Utili

### Verifica se sei loggato:

```bash
vercel whoami
```

### Vedi informazioni progetto:

```bash
vercel inspect
```

### Lista deploy recenti:

```bash
vercel ls
```

### Vedi log di un deploy:

```bash
vercel logs [deployment-url]
```

## 📝 Processo Completo

### 1. Vai nella directory del progetto:

```bash
cd C:\Users\Utente\Downloads\cus\tradelia.org-main
```

### 2. Verifica che tutto sia committato (opzionale ma consigliato):

```bash
git status
```

### 3. Deploy in produzione:

```bash
vercel --prod
```

### 4. Segui le istruzioni:

- Vercel ti chiederà conferme
- Premi Enter per accettare le impostazioni di default
- Aspetta che il deploy finisca

## ⚠️ Cosa Aspettarsi

Quando esegui `vercel --prod`:

1. **Vercel chiede conferme:**

   ```
   ? Set up and deploy? [Y/n] y
   ? Which scope? [Seleziona il tuo account]
   ? Link to existing project? [Y/n] y
   ? What's your project's name? tradelia.org
   ```

2. **Vercel fa il build:**
   - Installa dipendenze (`npm install`)
   - Esegue build (`npm run build`)
   - Carica i file

3. **Deploy completato:**
   - Ti dà l'URL del deploy
   - Es: `https://tradelia.org-xxx.vercel.app`

## 🔧 Troubleshooting

### Errore: "vercel: command not found"

```bash
# Reinstalla Vercel CLI
npm install -g vercel
```

### Errore: "Not logged in"

```bash
# Fai login
vercel login
```

### Errore: "Project not found"

- Vercel ti chiederà di creare un nuovo progetto
- Oppure collega a progetto esistente con `vercel link`

### Errore di build

- Controlla i log che Vercel mostra
- Verifica che `npm run build` funzioni localmente
- Controlla che tutte le dipendenze siano installate

## 💡 Suggerimenti

1. **Prima volta:** Usa `vercel` (senza --prod) per testare
2. **Produzione:** Usa sempre `vercel --prod` per deploy in produzione
3. **Dopo deploy:** Vai su Vercel Dashboard per vedere il deploy
4. **Monitora:** Controlla i log se qualcosa non funziona

## 🎯 Quick Start (Copia e Incolla)

```bash
# 1. Installa (una volta)
npm install -g vercel

# 2. Login (una volta)
vercel login

# 3. Vai nella directory del progetto
cd C:\Users\Utente\Downloads\cus\tradelia.org-main

# 4. Deploy in produzione
vercel --prod
```

## ✅ Verifica Deploy

Dopo il deploy:

1. Vercel ti darà l'URL del deploy
2. Vai su https://vercel.com/dashboard
3. Clicca sul progetto `tradelia.org`
4. Vai su "Deployments"
5. Dovresti vedere il nuovo deploy in cima

## 🔄 Deploy Automatici

**Nota:** I deploy manuali NON riattivano i deploy automatici.

Per riattivare i deploy automatici:

1. Riconnetti repository (Settings → Git)
2. Aspetta il reset mensile del limite
3. O upgrade a Pro per deploy illimitati
