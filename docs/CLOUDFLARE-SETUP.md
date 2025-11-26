# Configurazione Cloudflare Pages

Questo documento spiega come configurare il progetto per funzionare sia su Vercel che su Cloudflare Pages.

## Architettura

Il progetto usa un **adapter layer** che rileva automaticamente la piattaforma e adatta gli handler API di conseguenza.

### Struttura

```
api/
  ├── _lib/
  │   └── adapter.js          # Adapter per Vercel/Cloudflare
  ├── education.js            # Handler Vercel (standard)
  └── notifications.js        # Handler Vercel (standard)

functions/
  └── api/
      ├── education.js        # Wrapper Cloudflare
      └── notifications.js    # Wrapper Cloudflare
```

## Come Funziona

1. **Vercel**: Gli handler in `/api/*.js` vengono usati direttamente (formato standard Vercel)
2. **Cloudflare**: Le Functions in `/functions/api/*.js` wrappano gli handler Vercel usando l'adapter

L'adapter:

- Rileva la piattaforma automaticamente
- Normalizza `req` e `res` tra i due formati
- Gestisce le differenze nelle environment variables

## Setup Cloudflare

### 1. Installazione

```bash
npm install -D wrangler
```

### 2. Configurazione Environment Variables

Nel dashboard Cloudflare Pages, aggiungi tutte le variabili d'ambiente:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_SERVICE_ACCOUNT` (JSON string)
- `STRIPE_SECRET_KEY`
- `BREVO_API_KEY`
- etc.

### 3. Build Settings

Nel dashboard Cloudflare Pages:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (root del progetto)

### 4. Deploy

```bash
# Via CLI
npx wrangler pages deploy dist

# O tramite Git integration nel dashboard Cloudflare
```

## Limitazioni e Differenze

### API Routes

- **Vercel**: Serverless functions con timeout 10s (Hobby) o 60s (Pro)
- **Cloudflare**: Workers con timeout 30s (Free) o 30s+ (Paid)

### Environment Variables

- **Vercel**: Accessibili via `process.env.*`
- **Cloudflare**: Accessibili via `context.env.*` (l'adapter normalizza questo)

### Firebase Admin

Firebase Admin SDK potrebbe avere limitazioni su Cloudflare Workers. Se necessario, considera:

1. Usare REST API di Firebase invece di Admin SDK
2. Usare un backend separato per operazioni Firebase
3. Usare Cloudflare Workers con compatibilità Node.js (se disponibile)

### Notifications API

Le notifiche push potrebbero richiedere configurazione aggiuntiva su Cloudflare. Verifica:

- Service Worker registration
- VAPID keys configuration
- Web Push API support

## Testing

### Test Locale Vercel

```bash
npm run dev
# O
vercel dev
```

### Test Locale Cloudflare

```bash
npx wrangler pages dev dist
```

## Troubleshooting

### Error 405 su Cloudflare

Se vedi errori 405, verifica che:

1. Le Functions siano nella cartella `/functions/api/`
2. Il file esporti `onRequest` (non `default`)
3. L'adapter stia normalizzando correttamente `req` e `res`

### Environment Variables non disponibili

Verifica che:

1. Le variabili siano configurate nel dashboard Cloudflare
2. L'adapter stia iniettando `context.env` in `req.env`

### Firebase Admin non funziona

Considera di:

1. Usare REST API invece di Admin SDK
2. Spostare operazioni Firebase su un backend separato
3. Usare Cloudflare Workers con compatibilità Node.js

## Migrazione Graduale

Se vuoi migrare gradualmente:

1. Inizia con le API più semplici (es. `health.js`)
2. Testa su Cloudflare Pages
3. Aggiungi le altre API una alla volta
4. Verifica che tutto funzioni su entrambe le piattaforme

## Note

- Il progetto funziona **senza modifiche** su Vercel
- Cloudflare richiede solo i wrapper in `/functions/`
- L'adapter gestisce automaticamente le differenze
- Nessuna modifica necessaria al codice esistente
