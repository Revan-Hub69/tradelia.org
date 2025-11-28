# 🌐 API Routes - Deployment Notes

## ✅ Funzionamento su Vercel e Render

Le API routes Next.js (`/app/api/*`) funzionano **sia su Vercel che su Render** perché:

1. **Next.js gestisce le API routes automaticamente** - Non serve configurazione speciale
2. **Il `server.js` per Render usa `app.getRequestHandler()`** - Questo gestisce TUTTE le routes Next.js, incluse le API
3. **Le API sono parte integrante di Next.js** - Funzionano ovunque Next.js è in esecuzione

---

## 🔧 Configurazione Richiesta

### **Variabili Ambiente**

Entrambe le piattaforme richiedono:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Solo per admin API
```

### **Vercel**

- Configurazione automatica tramite dashboard Vercel
- Le variabili si sincronizzano da `.env.local` in sviluppo
- Le API routes sono serverless functions

### **Render**

- Configurazione manuale nel dashboard Render (`render.yaml` già configurato)
- Le variabili devono essere impostate nel dashboard Render
- Le API routes sono gestite dal server Node.js (`server.js`)

---

## 🔄 Differenze tra Vercel e Render

### **Vercel (Serverless)**

- ✅ Cold start più veloce
- ✅ Scaling automatico per richiesta
- ✅ Timeout: 10s (Hobby), 60s (Pro)
- ✅ Edge Functions disponibili (opzionale)

### **Render (Server Node.js)**

- ✅ Server sempre attivo (no cold start dopo primo avvio)
- ✅ Timeout: 30s (Starter), illimitato (Pro)
- ✅ Più controllo sul processo
- ⚠️ Potrebbe avere cold start iniziale più lento

---

## 🧪 Test API Routes

### **Sviluppo Locale**

```bash
npm run dev
# API disponibili su: http://localhost:3000/api/admin/reports
```

### **Vercel**

```bash
# Deploy automatico su push
# API disponibili su: https://your-app.vercel.app/api/admin/reports
```

### **Render**

```bash
# Deploy automatico su push
# API disponibili su: https://your-app.onrender.com/api/admin/reports
```

---

## 📝 Verifica Funzionamento

### **Test API Admin Reports**

```bash
curl -X GET https://your-domain.com/api/admin/reports \
  -H "Authorization: Bearer admin@tradelia.org"
```

### **Test API Admin Users**

```bash
curl -X GET https://your-domain.com/api/admin/users \
  -H "Authorization: Bearer admin@tradelia.org"
```

---

## ⚠️ Note Importanti

1. **Autenticazione Temporanea**: Attualmente le API usano email nel Bearer token. Questo è temporaneo e va sostituito con JWT.

2. **Service Role Key**: Le API admin richiedono `SUPABASE_SERVICE_ROLE_KEY` che bypassa RLS. Assicurarsi che:
   - Sia configurata solo su server (non esporre al client)
   - Sia presente sia su Vercel che Render

3. **CORS**: Se le API sono chiamate da domini diversi, potrebbe essere necessario configurare CORS headers.

4. **Rate Limiting**: Considerare rate limiting per produzione (Vercel lo fa automaticamente, Render no).

---

## 🚀 Best Practices

1. **Environment Variables**: Usare sempre variabili ambiente, mai valori hardcoded
2. **Error Handling**: Tutte le API gestiscono errori e ritornano status codes appropriati
3. **Logging**: Loggare errori per debugging (non in produzione con dati sensibili)
4. **Validation**: Validare input lato server (le API lo fanno già)
5. **Security**: Implementare autenticazione JWT completa prima di produzione

---

## 📚 Riferimenti

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Render Web Services](https://render.com/docs/web-services)

---

**Status:** ✅ API funzionano su entrambe le piattaforme  
**Ultimo Aggiornamento:** 2025-01-27
