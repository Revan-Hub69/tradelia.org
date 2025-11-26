# Vercel Settings - Spiegazione

## 🔍 Cosa Significa Questo Messaggio

Vercel ti sta dicendo che:

- **Project Settings** = Impostazioni globali del progetto (definite in `vercel.json` o dashboard)
- **Production Overrides** = Impostazioni specifiche per il deployment in produzione (potrebbero essere diverse)

## ⚠️ Perché Succede

Questo può accadere quando:

1. Le impostazioni sono state cambiate manualmente in un deployment specifico
2. C'è un `vercel.json` che override alcune impostazioni
3. Le impostazioni sono state modificate nel dashboard per un deployment specifico

## ✅ Cosa Fare

### Opzione 1: Allinea Production al Project Settings (Raccomandato)

1. Vai su Vercel Dashboard → Il tuo progetto
2. Settings → **General** o **Build & Development Settings**
3. Controlla le impostazioni:
   - **Framework Preset**: Dovrebbe essere "Vite" (o auto-detect)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (o lascia vuoto)
   - **Root Directory**: `/` (root del progetto)

4. Vai su **Deployments**
5. Trova il deployment in produzione (quello con override)
6. Clicca sui **3 puntini** → **View Settings**
7. Se ci sono override, clicca **"Use Project Settings"** o **"Remove Overrides"**

### Opzione 2: Verifica vercel.json

Controlla che `vercel.json` sia corretto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

Se c'è, queste impostazioni dovrebbero essere allineate.

### Opzione 3: Sincronizza Manualmente

1. Vai su Settings → **Build & Development Settings**
2. Assicurati che siano:
   - **Framework Preset**: Vite (o Other)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: (vuoto o `npm install`)
   - **Root Directory**: (vuoto o `/`)

3. Salva
4. Vai su Deployments → Trova il deployment con override
5. Clicca **"Redeploy"** → Questo userà le nuove impostazioni

## 🎯 Impostazioni Corrette per Questo Progetto

Basandoti su `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Nel Dashboard Vercel dovresti avere:**

- Framework: **Vite** (o Other se non disponibile)
- Build Command: **`npm run build`**
- Output Directory: **`dist`**
- Install Command: **(vuoto)** o **`npm install`**
- Root Directory: **(vuoto)** o **`/`**

## ⚠️ Attenzione

- **Non cambiare** le impostazioni se tutto funziona
- Se il deployment in produzione funziona, gli override potrebbero essere intenzionali
- **Sincronizza** solo se ci sono problemi o vuoi standardizzare

## 🔄 Dopo Aver Sincronizzato

1. Fai un nuovo deploy (push o manuale)
2. Verifica che funzioni correttamente
3. Il messaggio dovrebbe scomparire se tutto è allineato

## 💡 Suggerimento

Se non sei sicuro:

1. **Lascia stare** se tutto funziona
2. **Sincronizza** solo se ci sono problemi di build o deploy
3. Le impostazioni in `vercel.json` hanno la priorità
