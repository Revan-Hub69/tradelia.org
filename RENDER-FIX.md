# 🔧 Fix Render - Istruzioni

## Problema
Render sta cercando `server.js` e moduli API vecchi che non esistono più.

## Soluzione

### 1. Verifica Configurazione Render Dashboard

Vai su Render Dashboard → Il tuo servizio → Settings:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```
**NON** `node server.js` ❌

### 2. Verifica Environment Variables

Assicurati che siano configurate:
- `NODE_ENV=production`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PORT` (Render lo assegna automaticamente, ma Next.js lo legge)

### 3. Se Render Non Rileva render.yaml

**Opzione A: Configurazione Manuale**
1. Vai su Settings
2. Imposta manualmente:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Root Directory: `/` (o lascia vuoto)

**Opzione B: Verifica render.yaml**
- Deve essere nella root del repository
- Deve essere committato e pushato

### 4. Clean Deploy

Se il problema persiste:
1. Cancella il servizio su Render
2. Ricrea il servizio
3. Connetti il repository
4. Render rileverà automaticamente `render.yaml`

## Note Importanti

- ✅ Next.js ha il suo server integrato (`next start`)
- ❌ NON serve `server.js` per Next.js
- ✅ Il `render.yaml` è già configurato correttamente
- ✅ `package.json` ha lo script `start` corretto

## Verifica

Dopo il deploy, verifica che:
- Il build completi senza errori
- Il server parta con `npm start`
- L'app sia accessibile su `/`
