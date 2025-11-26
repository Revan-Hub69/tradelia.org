# Testing Locale - Verifica Cambiamenti

Quando Vercel ha raggiunto il limite di deploy, puoi testare i cambiamenti localmente.

## 🚀 Opzione 1: Development Server (Raccomandato)

Avvia il server di sviluppo locale:

```bash
npm run dev
```

Questo avvia Vite dev server su `http://localhost:3000` (o porta disponibile).

**Vantaggi:**

- ✅ Hot reload automatico
- ✅ Veloce per vedere i cambiamenti
- ✅ Non richiede build completo

**Limitazioni:**

- ⚠️ Le API routes (`/api/*`) non funzionano in dev mode (sono serverless su Vercel)
- ⚠️ Alcune funzionalità potrebbero richiedere variabili d'ambiente

## 🏗️ Opzione 2: Build + Preview Locale

Simula l'ambiente di produzione:

```bash
# 1. Build del progetto
npm run build

# 2. Preview del build
npm run preview
```

Questo:

- Costruisce il progetto come in produzione
- Avvia un server locale per testare il build
- Simula meglio l'ambiente Vercel

**Vantaggi:**

- ✅ Testa il build di produzione
- ✅ Verifica che tutto compili correttamente
- ✅ Simula l'ambiente Vercel

**Limitazioni:**

- ⚠️ Le API routes non funzionano (sono serverless)
- ⚠️ Richiede rebuild ad ogni modifica

## 🔧 Opzione 3: Vercel CLI (Deploy Manuale)

Se hai Vercel CLI installato, puoi fare deploy manuale:

```bash
# Installa Vercel CLI (una volta)
npm i -g vercel

# Login (una volta)
vercel login

# Deploy manuale
vercel

# O deploy in produzione
vercel --prod
```

**Vantaggi:**

- ✅ Testa su Vercel reale
- ✅ Le API routes funzionano
- ✅ Bypassa il limite di deploy automatici

**Limitazioni:**

- ⚠️ Richiede installazione CLI
- ⚠️ Deploy manuale ogni volta

## 📊 Opzione 4: Verifica Git

Verifica i cambiamenti nel codice senza eseguire:

```bash
# Vedi le modifiche recenti
git log --oneline -10

# Vedi le differenze
git diff HEAD~1

# Vedi cosa è stato cambiato in un commit specifico
git show <commit-hash>
```

## 🎯 Cosa Testare

Quando testi localmente, verifica:

1. **Build funziona**: `npm run build` non deve dare errori
2. **Linting**: `npm run lint:check` deve passare
3. **UI**: Apri `http://localhost:3000` e naviga il sito
4. **Console**: Apri DevTools e verifica che non ci siano errori JS
5. **Responsive**: Testa su diverse dimensioni schermo

## ⚠️ Limitazioni Testing Locale

**Cosa NON funziona localmente:**

- ❌ API routes (`/api/*`) - sono serverless su Vercel
- ❌ Environment variables di produzione
- ❌ Integrazioni con servizi esterni (se richiedono URL pubblici)

**Cosa funziona:**

- ✅ Frontend completo
- ✅ Routing e navigazione
- ✅ Stili e layout
- ✅ JavaScript client-side
- ✅ Build e compilazione

## 💡 Suggerimenti

1. **Per testare API**: Usa Vercel CLI o aspetta il prossimo deploy automatico
2. **Per testare UI**: `npm run dev` è perfetto
3. **Per verificare build**: `npm run build && npm run preview`
4. **Per deploy urgente**: Usa Vercel CLI (`vercel --prod`)

## 🔄 Reset Limite Vercel

Il limite di deploy su Vercel Hobby si resetta:

- **Mensilmente** (ogni mese)
- **O upgrade a Pro** per deploy illimitati
