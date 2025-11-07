# Gestione Temi - Header e Footer Light

## 📍 Dove Sono Gli Stili Light

### ✅ File CSS Centralizzato (NUOVO)

**`/report/assets/css/header-footer-light.css`** - **File principale per stili light di header e footer**

Questo file contiene **tutti** gli stili per il tema light di:
- Header (`.hdr`)
- Footer (`.site-footer`)

### 📋 Struttura

```css
/* ===== HEADER LIGHT THEME ===== */
:root[data-theme="light"] .hdr { ... }
:root[data-theme="light"] .hdr::after { ... }
:root[data-theme="light"] .brand:hover { ... }

/* ===== FOOTER LIGHT THEME ===== */
:root[data-theme="light"] .site-footer { ... }
:root[data-theme="light"] .site-footer::before { ... }
:root[data-theme="light"] .ftr-head { ... }
```

## 🔗 Dove Viene Caricato

### Report (`/report/index.html`)
```html
<link rel="stylesheet" href="/report/assets/css/header-footer-light.css" />
```

## ⚠️ File Legacy (Da Non Modificare)

Gli stili light sono **anche** presenti in questi file (per retrocompatibilità), ma **NON vanno modificati**:

1. `/report/tutorial-light.css` (linee 337-387)
2. `/tutorial-light.css` (linee 354-404)
3. Template HTML con stili inline

**IMPORTANTE**: Per modificare gli stili light di header/footer, modifica **SOLO** `/report/assets/css/header-footer-light.css`

## 🎯 Componenti JavaScript

I componenti JavaScript **non** hanno varianti per il tema light:

- `/report/assets/js/components/site-header.js` - Componente header unico
- `/report/assets/js/components/site-footer.js` - Componente footer unico

Gli stili light sono applicati automaticamente via CSS quando `data-theme="light"` è presente su `:root`.

## 🔧 Come Funziona

1. Il componente JavaScript genera l'HTML (sempre lo stesso)
2. Il CSS applica gli stili light quando `data-theme="light"` è presente
3. Il tema viene impostato via JavaScript: `document.documentElement.setAttribute('data-theme', 'light')`

## 📝 Note

- Gli stili light sono **solo CSS**, non ci sono componenti JavaScript separati
- Il file `header-footer-light.css` è il **punto unico di modifica** per gli stili light
- Gli altri file con stili light sono legacy e non vanno modificati

---

*Documento creato il 2025-01-27*

