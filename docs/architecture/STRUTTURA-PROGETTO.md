# 📋 Struttura Progetto Tradelia AI

## 🎯 Strategia Ibrida (Attuale)

### **Desktop**
- ✅ PWA installabile (Electron in futuro)
- ✅ Web app responsive
- ✅ Dashboard terminal-style

### **Mobile**
- ✅ Web app responsive (priorità)
- ⚠️ PWA opzionale (limitazioni iOS)
- 🔜 App native in futuro (se necessario)

### **iOS**
- ✅ Web app responsive (unica opzione pratica)
- ❌ App nativa richiede App Store

---

## 🖥️ Dashboard Terminal-Style

### **Design**
- Font monospace (Courier, Monaco, 'Courier New')
- Sfondo nero (#000000 / #0a0a0a)
- Testo verde/cyan (#00ff00 / #00ffff)
- Prompt stile CLI (`$ tradelia >`)
- Cursor blinking
- Output formattato come terminale
- Comandi testuali interattivi

### **Funzionalità**
- Lista report come output terminale
- Comandi: `list`, `open <id>`, `filter <term>`, `help`
- Navigazione da tastiera (arrow keys, Enter)
- Output formattato con colori semantici

### **Compatibilità**
- ✅ Desktop (PWA + web)
- ✅ Mobile (web responsive)
- ✅ Accessibile sempre (nessun blocco)

---

## 🔜 Roadmap App Native

### **Fase 1: Desktop (Electron)**
- Setup Electron
- Build .exe/.dmg/.deb
- Distribuzione diretta (download sito)

### **Fase 2: Android (APK)**
- Setup Cordova/Capacitor
- Build APK
- Distribuzione sideloading

### **Fase 3: iOS**
- Valutare App Store (se necessario)
- O mantenere PWA (limite Apple)

---

## 📁 Struttura File

```
tradelia.org-main/
├── dashboard.html          # Dashboard terminal-style (ibrida)
├── dashboard.webmanifest   # PWA manifest
├── sw.js                   # Service Worker
├── assets/
│   ├── js/
│   │   └── pwa-dashboard-handler.js  # Handler PWA
│   └── css/
│       └── terminal-dashboard.css      # Stile terminale
└── [future]
    ├── electron/          # App desktop Electron
    └── android/            # App Android
```

---

## ✅ Stato Attuale

- ✅ Dashboard ibrida (PWA + web)
- ✅ Accessibile sempre (nessun blocco)
- ✅ Token opzionale
- 🔄 In corso: Design terminal-style

