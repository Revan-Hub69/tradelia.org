# Creare Pull Request: notifications-system → Tradelia-Main

## Stato Attuale
✅ Branch `notifications-system` pushato su GitHub con commit:
- `feat: Sistema completo notifiche push e centro notifiche`

## Opzione 1: Via GitHub Web Interface (Più Semplice)

1. Vai su: https://github.com/Revan-Hub69/tradelia.org
2. Vedrai un banner giallo che dice "notifications-system had recent pushes"
3. Clicca su **"Compare & pull request"**
4. Oppure vai direttamente a:
   https://github.com/Revan-Hub69/tradelia.org/compare/Tradelia-Main...notifications-system

5. Compila la PR:
   - **Title**: `feat: Sistema completo notifiche push e centro notifiche`
   - **Description**:
   ```markdown
   ## Sistema Notifiche Push e Centro Notifiche

   ### Implementato
   - ✅ Service Worker con supporto push notifications
   - ✅ API unificata per subscriptions e preferences
   - ✅ Endpoint invio push notifications con web-push
   - ✅ Centro notifiche con feed storico
   - ✅ Badge dinamico con conteggio non lette
   - ✅ UI completa per gestione preferenze (push, email, SMS, WhatsApp)

   ### File Aggiunti
   - `hooks/useServiceWorker.ts` - Hook per registrazione SW
   - `app/api/notifications/*` - API endpoints
   - `components/notifications/*` - Componenti UI
   - `app/dashboard/notifications/page.tsx` - Pagina notifiche

   ### Dipendenze
   - `web-push` - Per invio push notifications
   - `date-fns` - Per formattazione date

   ### Note
   - Rispetta limite 12 serverless functions Vercel
   - Auto-rimozione subscription invalide (410)
   - Polling ogni 30s per conteggio notifiche non lette
   ```

6. Clicca **"Create pull request"**

## Opzione 2: Via GitHub CLI (se installato)

```bash
gh pr create --base Tradelia-Main --head notifications-system --title "feat: Sistema completo notifiche push e centro notifiche" --body "Vedi descrizione sopra"
```

## Opzione 3: Merge Diretto (se hai permessi)

Se preferisci merge diretto senza PR:
```bash
git checkout Tradelia-Main
git merge notifications-system
git push origin Tradelia-Main
```

