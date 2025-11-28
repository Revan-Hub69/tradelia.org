# 🚀 Setup Render per Tradelia AI

## Configurazione Render

### File Necessari
- ✅ `render.yaml` - Configurazione servizio
- ✅ `package.json` - Scripts e dipendenze
- ✅ `next.config.js` - Configurazione Next.js

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Variabili d'Ambiente Richieste
- `NODE_ENV=production`
- `NEXT_PUBLIC_SUPABASE_URL` (da configurare in Render)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (da configurare in Render)
- `SUPABASE_SERVICE_ROLE_KEY` (opzionale, per operazioni admin)

### Note Importanti
- **Non serve `server.js`**: Next.js ha il suo server integrato
- **Port**: Render assegna automaticamente la porta via `PORT` env var
- **Health Check**: Configurato su `/`
- **Plan**: Starter (modificabile in Render dashboard)

## Deploy su Render

1. Connetti repository GitHub a Render
2. Seleziona branch `Tradelia-Main`
3. Render rileverà automaticamente `render.yaml`
4. Configura le variabili d'ambiente
5. Deploy automatico

## Troubleshooting

### Se Render cerca ancora `server.js`
- Verifica che `startCommand` sia `npm start` (non `node server.js`)
- Verifica che `render.yaml` sia presente nella root

### Build Errors
- Verifica Node.js version (>=18)
- Verifica che tutte le dipendenze siano in `package.json`
