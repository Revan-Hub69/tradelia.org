# 🔧 Fix PWA Installation su Mobile

## Problema
La PWA non si installa su telefonino.

## Requisiti PWA per Installazione Mobile

### ✅ Requisiti Obbligatori:
1. **HTTPS** (o localhost per sviluppo)
2. **Manifest** valido con:
   - `name` e `short_name`
   - `start_url`
   - `display: "standalone"` o `"fullscreen"`
   - **Icone PNG** (192x192 e 512x512) - NON SVG
3. **Service Worker** registrato
4. **Meta tags** corretti:
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="theme-color" content="#0f0f0f">`

### ❌ Problema Trovato:
- `dashboard.webmanifest` usava **SVG** invece di **PNG** per le icone
- Le icone PNG esistono ma non erano referenziate nel manifest

### ✅ Fix Applicato:
- Manifest aggiornato per usare icone PNG (`icon-192.png` e `icon-512.png`)

## Browser Supportati per Installazione PWA

### Android:
- ✅ Chrome (Android)
- ✅ Edge (Android)
- ✅ Samsung Internet
- ✅ Firefox (Android) - limitato

### iOS:
- ⚠️ Safari iOS - NON supporta `beforeinstallprompt`
- ✅ Richiede installazione manuale: "Aggiungi alla schermata Home"
- ✅ Funziona ma senza prompt automatico

### Desktop:
- ✅ Chrome
- ✅ Edge
- ✅ Firefox (limitato)

## Verifica Installazione

1. **Apri il sito su mobile** (HTTPS richiesto)
2. **Attendi qualche secondo** - il browser valuta i requisiti
3. **Clicca su "Installa la dashboard PWA"**
4. **Se il browser supporta** → appare prompt nativo
5. **Se non supporta** → apri dashboard normalmente

## Note iOS

iOS Safari NON supporta `beforeinstallprompt`, quindi:
- Il prompt automatico NON appare
- L'utente deve usare "Aggiungi alla schermata Home" manualmente
- Questo è un limite di iOS, non del nostro codice

## Test

Per testare l'installazione:
1. Apri su Chrome Android (o Edge Android)
2. Vai su una pagina con link "Installa PWA"
3. Clicca sul link
4. Dovrebbe apparire il prompt nativo del browser

