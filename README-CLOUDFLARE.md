# Compatibilità Vercel + Cloudflare

## ✅ Soluzione Implementata

Il progetto ora funziona **automaticamente** su entrambe le piattaforme:

- **Vercel**: Nessuna modifica necessaria, funziona come prima
- **Cloudflare**: Usa l'adapter layer per wrappare gli handler Vercel

## 📁 Struttura

```
api/
  ├── _lib/
  │   └── adapter.js          # Adapter universale Vercel/Cloudflare
  ├── education.js            # Handler Vercel (standard)
  └── notifications.js        # Handler Vercel (standard)

functions/
  └── api/
      ├── education.js        # Wrapper Cloudflare
      └── notifications.js    # Wrapper Cloudflare
      └── ... (altre API)
```

## 🚀 Come Funziona

1. **Vercel**: Gli handler in `/api/*.js` vengono usati direttamente
2. **Cloudflare**: Le Functions in `/functions/api/*.js` wrappano gli handler usando l'adapter

L'adapter:

- Rileva automaticamente la piattaforma
- Normalizza `req` e `res` tra i due formati
- Inietta le environment variables da Cloudflare in `process.env` per compatibilità

## ⚙️ Setup Cloudflare

### 1. Installazione Wrangler (opzionale, per test locale)

```bash
npm install -D wrangler
```

### 2. Configurazione Environment Variables

Nel dashboard Cloudflare Pages → Settings → Environment Variables, aggiungi:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_SERVICE_ACCOUNT` (JSON string)
- `STRIPE_SECRET_KEY`
- `BREVO_API_KEY`
- Tutte le altre variabili necessarie

### 3. Build Settings (Dashboard Cloudflare)

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (root del progetto)

### 4. Deploy

**Opzione A - Git Integration (Raccomandato)**

1. Connetti il repository GitHub nel dashboard Cloudflare
2. Seleziona il branch (es. `Tradelia-Main`)
3. Cloudflare farà deploy automatico ad ogni push

**Opzione B - CLI**

```bash
npx wrangler pages deploy dist
```

## 📝 Aggiungere Nuove API

Per aggiungere una nuova API route compatibile con entrambe le piattaforme:

1. **Crea l'handler Vercel** in `/api/nuova-api.js`:

```javascript
export default async function handler(req, res) {
  // Il tuo codice qui
}
```

2. **Genera automaticamente il wrapper Cloudflare**:

```bash
node scripts/generate-cloudflare-functions.js
```

Oppure crea manualmente `/functions/api/nuova-api.js`:

```javascript
import { createCloudflareHandler } from "../../api/_lib/adapter.js";
import vercelHandler from "../../api/nuova-api.js";

export const onRequest = createCloudflareHandler(vercelHandler);
```

Fatto! L'API funzionerà su entrambe le piattaforme.

## ⚠️ Limitazioni Note

### Firebase Admin SDK

Firebase Admin SDK potrebbe non funzionare completamente su Cloudflare Workers (limiti Node.js). Se necessario:

1. Usa REST API di Firebase invece di Admin SDK
2. Sposta operazioni Firebase su un backend separato
3. Usa Cloudflare Workers con compatibilità Node.js (se disponibile)

### Timeout

- **Vercel Hobby**: 10s
- **Vercel Pro**: 60s
- **Cloudflare Free**: 30s
- **Cloudflare Paid**: 30s+ (configurabile)

### Notifications API

Le notifiche push potrebbero richiedere configurazione aggiuntiva. Verifica:

- Service Worker registration
- VAPID keys
- Web Push API support

## 🧪 Testing

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

## 🔍 Troubleshooting

### Error 405 su Cloudflare

Verifica che:

1. Le Functions siano in `/functions/api/`
2. Il file esporti `onRequest` (non `default`)
3. L'adapter stia normalizzando correttamente `req` e `res`

### Environment Variables non disponibili

Verifica che:

1. Le variabili siano configurate nel dashboard Cloudflare
2. L'adapter stia iniettando `context.env` in `process.env`

### Handler non funziona su Cloudflare

Controlla i log in Cloudflare Dashboard → Pages → Functions → Logs per vedere gli errori specifici.

## 📊 Complessità

**Difficoltà**: Media (3-4 ore)
**Manutenzione**: Bassa (solo aggiungere wrapper per nuove API)
**Performance**: Nessun overhead significativo

## ✅ Vantaggi

- ✅ Zero modifiche al codice esistente
- ✅ Funziona su entrambe le piattaforme
- ✅ Facile da mantenere
- ✅ Testing locale disponibile per entrambe
