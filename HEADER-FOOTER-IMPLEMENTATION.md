# Header e Footer - Implementazione

## ✅ File Modificati

### 1. **index.html** (Light Theme)
- ✅ Aggiunto CSS light theme: `/report/assets/css/header-footer-light.css`
- ✅ Impostato `data-theme="light"` sul tag `<html>`
- ✅ Sostituito header HTML statico con `<div id="site-header-slot"></div>`
- ✅ Sostituito footer HTML statico con `<div id="site-footer-slot"></div>`
- ✅ Aggiunto script per montare componenti JavaScript con tema light

### 2. **brokers.html** (Light Theme)
- ✅ Aggiunto CSS light theme: `/report/assets/css/header-footer-light.css`
- ✅ Impostato `data-theme="light"` sul tag `<html>`
- ✅ Sostituito header HTML statico con `<div id="site-header-slot"></div>`
- ✅ Sostituito footer HTML statico con `<div id="site-footer-slot"></div>`
- ✅ Aggiunto script per montare componenti JavaScript con tema light

### 3. **glossario.html** (Dark Theme)
- ✅ Già aveva slot header: `<div id="site-header-slot"></div>`
- ✅ Aggiunto slot footer: `<div id="site-footer-slot"></div>`
- ✅ Modificata funzione `mountHeaderFooter()` per impostare `data-theme="dark"`
- ✅ Già monta componenti JavaScript (funzione esistente)

## 📋 Struttura

### Light Theme (index.html, brokers.html)
```html
<html lang="it" data-theme="light">
<head>
  <link rel="stylesheet" href="/report/assets/css/header-footer-light.css" />
</head>
<body>
  <div id="site-header-slot"></div>
  <!-- contenuto -->
  <div id="site-footer-slot"></div>
  
  <script type="module">
    document.documentElement.setAttribute('data-theme', 'light');
    import { siteHeader } from '/report/assets/js/components/site-header.js';
    import { siteFooter } from '/report/assets/js/components/site-footer.js';
    siteHeader.mount(document.getElementById('site-header-slot'));
    siteFooter.mount(document.getElementById('site-footer-slot'));
  </script>
</body>
</html>
```

### Dark Theme (glossario.html)
```html
<html lang="it" data-theme="dark">
<body>
  <div id="site-header-slot"></div>
  <!-- contenuto -->
  <div id="site-footer-slot"></div>
  
  <script>
    async function mountHeaderFooter() {
      document.documentElement.setAttribute('data-theme', 'dark');
      // ... monta componenti
    }
  </script>
</body>
</html>
```

## 🎯 Componenti JavaScript

Tutti i file usano gli stessi componenti JavaScript:
- `/report/assets/js/components/site-header.js`
- `/report/assets/js/components/site-footer.js`

Gli stili vengono applicati automaticamente via CSS in base a `data-theme`:
- `data-theme="light"` → applica stili light da `header-footer-light.css`
- `data-theme="dark"` → applica stili dark da `tokens.css` (default)

## 📝 Note

- **Light Theme**: Usa CSS dedicato (`header-footer-light.css`) per header e footer
- **Dark Theme**: Usa stili default da `tokens.css` (non serve CSS aggiuntivo)
- **Componenti**: Gli stessi componenti JavaScript funzionano per entrambi i temi
- **Stili**: Gli stili vengono applicati automaticamente via CSS in base a `data-theme`

---

*Documento creato il 2025-01-27*

