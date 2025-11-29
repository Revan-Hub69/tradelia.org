# Istruzioni per Push su Tradelia-Main

Il sistema notifiche è stato completato e committato sul branch `notifications-system`.

## Stato Attuale
- ✅ Branch `notifications-system` pushato su GitHub
- ✅ Merge locale completato in `Tradelia-Main`
- ⏳ Push su `Tradelia-Main` da completare

## Opzioni per Completare il Push

### Opzione 1: Usa lo script batch
Esegui `push-to-main.bat` dalla directory del progetto.

### Opzione 2: Comandi Git manuali
```bash
cd "C:\Users\Utente\.cursor\worktrees\tradelia.org-main\pjt"
git checkout Tradelia-Main
git push origin Tradelia-Main
```

### Opzione 3: Da GitHub
1. Vai su https://github.com/Revan-Hub69/tradelia.org
2. Crea una Pull Request da `notifications-system` a `Tradelia-Main`
3. Fai merge della PR

## File Modificati/Aggiunti

### Nuovi File
- `hooks/useServiceWorker.ts` - Hook per service worker
- `app/api/notifications/route.ts` - API unificata notifiche
- `app/api/notifications/send/route.ts` - Endpoint invio push
- `app/api/notifications/list/route.ts` - Endpoint lista notifiche
- `app/api/notifications/read/route.ts` - Endpoint marca lette
- `components/notifications/NotificationSettings.tsx` - UI impostazioni
- `components/notifications/NotificationCenter.tsx` - Centro notifiche
- `components/notifications/NotificationBell.tsx` - Badge notifiche
- `components/notifications/ServiceWorkerProvider.tsx` - Provider SW
- `app/dashboard/notifications/page.tsx` - Pagina notifiche

### File Modificati
- `package.json` - Aggiunto web-push e date-fns
- `app/dashboard/layout.tsx` - Integrato ServiceWorkerProvider
- `components/layout/Header.tsx` - Aggiunto NotificationBell
- `components/dashboard/ModuleGrid.tsx` - Link corretto a /dashboard/notifications

## Dipendenze da Installare
Dopo il push, esegui:
```bash
npm install
```

## Variabili d'Ambiente Richieste
Assicurati di avere configurato:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Chiave pubblica VAPID
- `VAPID_PRIVATE_KEY` - Chiave privata VAPID
- `VAPID_SUBJECT` - Subject VAPID (es. mailto:support@tradelia.org)

