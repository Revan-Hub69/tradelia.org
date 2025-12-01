# Widget Installabili Mobile & Desktop
## Guida Completa all'Installazione

**Data**: 2025-01-27  
**Versione**: 1.0

---

## 📱 WIDGET MOBILE

### Android (Android 12+)

I widget web sono supportati nativamente su Android 12+ tramite Chrome.

#### Metodo 1: Installazione Automatica (Chrome)
1. Apri il widget in Chrome (es: `/widgets/portfolio`)
2. Tocca il menu (3 punti in alto a destra)
3. Seleziona **"Aggiungi alla schermata home"**
4. Se disponibile, seleziona **"Aggiungi widget"**
5. Il widget verrà aggiunto alla home screen

#### Metodo 2: Installazione Manuale
1. Apri il widget in Chrome
2. Menu → **"Installa app"** (se disponibile)
3. Dopo l'installazione, tieni premuto l'icona dell'app
4. Seleziona **"Widget"** dal menu
5. Scegli la dimensione del widget
6. Posiziona sulla home screen

### iOS (iOS 14+)

iOS supporta widget tramite Shortcuts o Web Clips.

#### Metodo 1: Web Clip (Safari)
1. Apri il widget in Safari
2. Tocca il pulsante **Condividi** (box con freccia)
3. Seleziona **"Aggiungi alla schermata Home"**
4. Personalizza il nome e l'icona
5. Tocca **"Aggiungi"**

#### Metodo 2: Shortcuts App (iOS 14+)
1. Apri l'app **Shortcuts**
2. Crea un nuovo shortcut
3. Aggiungi azione **"Apri URL"**
4. Inserisci l'URL del widget (es: `https://tradelia.org/widgets/portfolio`)
5. Aggiungi al widget della home screen
6. Configura il widget per aprire lo shortcut

---

## 💻 WIDGET DESKTOP

### Windows 11

Windows 11 supporta widget nativi, ma per PWA web possiamo usare finestre standalone.

#### Metodo 1: Finestra Standalone
1. Vai alla pagina Widgets (`/dashboard/widgets`)
2. Clicca su **"Apri in Finestra Standalone"**
3. La finestra si aprirà in modalità standalone
4. Puoi ridimensionare e posizionare la finestra

#### Metodo 2: Desktop Shortcut
1. Apri il widget in una finestra standalone
2. Clicca con il tasto destro sulla barra del titolo
3. Seleziona **"Crea collegamento"**
4. Salva sul desktop

#### Metodo 3: Windows Widgets (Windows 11)
1. Installa la PWA Tradelia
2. Apri il menu Start
3. Cerca "Tradelia Widgets"
4. Aggiungi al pannello widget di Windows

### macOS

#### Metodo 1: Finestra Standalone
1. Vai alla pagina Widgets (`/dashboard/widgets`)
2. Clicca su **"Apri in Finestra Standalone"**
3. La finestra si aprirà in modalità standalone

#### Metodo 2: Desktop Shortcut
1. Apri il widget in Safari
2. Menu → **"File"** → **"Aggiungi alla schermata Home"**
3. Oppure trascina l'URL sul desktop

#### Metodo 3: macOS Widgets (macOS Big Sur+)
1. Installa la PWA Tradelia
2. Apri **"Centro notifiche"**
3. Scorri fino a **"Modifica widget"**
4. Aggiungi widget Tradelia (se disponibile)

### Linux

#### Metodo 1: Finestra Standalone
1. Vai alla pagina Widgets (`/dashboard/widgets`)
2. Clicca su **"Apri in Finestra Standalone"**
3. La finestra si aprirà in modalità standalone

#### Metodo 2: Desktop Entry
1. Crea un file `.desktop` nella cartella `~/.local/share/applications/`
2. Configura con l'URL del widget
3. Aggiungi al desktop o al menu applicazioni

---

## 🔧 WIDGET DISPONIBILI

### 1. Portfolio Widget
- **URL**: `/widgets/portfolio`
- **Descrizione**: Visualizza il tuo portafoglio con posizioni, valori e variazioni
- **Aggiornamento**: Automatico ogni 5 minuti
- **Pull-to-refresh**: Supportato su mobile

### 2. Watchlist Widget
- **URL**: `/widgets/watchlist`
- **Descrizione**: Monitora i tuoi asset preferiti con prezzi in tempo reale
- **Aggiornamento**: Automatico ogni 5 minuti
- **Pull-to-refresh**: Supportato su mobile

### 3. Alerts Widget
- **URL**: `/widgets/alerts`
- **Descrizione**: Vedi i tuoi alert attivi e quelli triggerati
- **Aggiornamento**: Automatico ogni 5 minuti
- **Pull-to-refresh**: Supportato su mobile

---

## 📋 CARATTERISTICHE

### Funzionalità Comuni
- ✅ **Auto-refresh**: Aggiornamento automatico ogni 5 minuti
- ✅ **Pull-to-refresh**: Trascina verso il basso per aggiornare (mobile)
- ✅ **Responsive**: Ottimizzato per mobile e desktop
- ✅ **Offline Support**: Funziona con cache quando offline
- ✅ **Dark Mode**: Supporto tema scuro automatico

### Requisiti
- **Mobile**: Android 12+ o iOS 14+
- **Desktop**: Windows 11, macOS Big Sur+, o Linux moderno
- **Browser**: Chrome (Android), Safari (iOS), Chrome/Edge/Firefox (Desktop)
- **Account**: Pro per alcune funzionalità

---

## 🐛 TROUBLESHOOTING

### Widget non si aggiorna
- Verifica la connessione internet
- Controlla che il service worker sia attivo
- Prova pull-to-refresh (mobile)

### Widget non si installa
- Verifica che il browser supporti PWA
- Controlla le impostazioni del browser
- Prova in modalità incognito

### Finestra standalone non si apre
- Abilita popup per il sito
- Controlla le impostazioni del browser
- Prova un browser diverso

---

## 📚 RIFERIMENTI

- [PWA Widgets - MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Android Web Widgets](https://developer.android.com/develop/ui/views/appwidgets)
- [iOS Web Clips](https://developer.apple.com/documentation/webkit/web_clips)
- [Windows 11 Widgets](https://docs.microsoft.com/en-us/windows/apps/design/widgets/)

