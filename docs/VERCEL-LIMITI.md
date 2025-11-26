# Vercel Limiti Deploy - Soluzioni

## 📊 Limiti Vercel Hobby

**Vercel Hobby Plan:**

- ✅ 100 deploy/mese (gratis)
- ✅ Deploy automatici da Git
- ❌ Quando raggiungi 100, i deploy automatici si fermano

**Vercel Pro Plan:**

- ✅ Deploy illimitati
- ✅ Altri vantaggi (bandwidth, team, etc.)

## 🔍 Come Verificare Se Hai Raggiunto Il Limite

1. Vai su https://vercel.com/dashboard
2. Clicca sul tuo progetto `tradelia.org`
3. Settings → **Billing**
4. Cerca "Deployments this month"
5. Se vedi **100/100**, hai raggiunto il limite

## ✅ Soluzioni

### Opzione 1: Deploy Manuale (Immediato)

Usa Vercel CLI per deployare manualmente (bypassa il limite):

```bash
# Installa Vercel CLI (una volta)
npm i -g vercel

# Login (una volta)
vercel login

# Deploy manuale in produzione
vercel --prod
```

**Oppure usa lo script:**

```bash
node scripts/deploy-vercel.js
```

### Opzione 2: Aspetta Reset Mensile

Il limite si resetta ogni mese (primo del mese).

**Quando si resetta:**

- Primo giorno del mese successivo
- Esempio: se raggiungi 100 il 26 novembre, si resetta il 1 dicembre

### Opzione 3: Upgrade a Pro

Se hai bisogno di deploy illimitati:

1. Vercel Dashboard → Settings → Billing
2. Upgrade a Pro Plan
3. Deploy illimitati + altri vantaggi

## 🎯 Quando Usare Deploy Manuale

Usa deploy manuale quando:

- ✅ Hai raggiunto il limite (100/100)
- ✅ Hai bisogno di deployare subito
- ✅ Vuoi bypassare il limite temporaneamente

**Nota:** I deploy manuali **non** contano verso il limite mensile, ma sono limitati anche loro (circa 1000/mese su Hobby).

## 📝 Best Practice

1. **Monitora i deploy:**
   - Controlla mensilmente quanti deploy hai usato
   - Vercel Dashboard → Billing → Deployments this month

2. **Raggruppa i commit:**
   - Invece di fare 10 commit piccoli, fai 1 commit grande
   - Ogni push = 1 deploy (se abilitato)

3. **Usa deploy manuale quando serve:**
   - Per fix urgenti quando hai raggiunto il limite
   - Per test prima del reset mensile

4. **Considera upgrade se:**
   - Superi spesso i 100 deploy/mese
   - Hai bisogno di più funzionalità

## 🔄 Reset Automatico

Il limite si resetta automaticamente:

- **Quando:** Primo giorno del mese
- **Cosa:** Torna a 0/100
- **Deploy automatici:** Riprendono automaticamente

## 💡 Suggerimenti

- **Deploy manuali non contano** verso il limite di 100 automatici
- **Puoi fare deploy manuali** anche quando hai raggiunto il limite
- **Il limite si resetta** ogni mese automaticamente
- **Monitora l'uso** per evitare sorprese
