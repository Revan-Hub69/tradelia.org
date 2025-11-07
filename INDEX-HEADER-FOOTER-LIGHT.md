# Index.html - Header e Footer Light Theme

## ✅ Modifiche Implementate

### 1. **CSS Light Theme Aggiunto**
```html
<link rel="stylesheet" href="/report/assets/css/header-footer-light.css" />
```

### 2. **Tema Light Impostato**
```html
<html lang="it" data-theme="light">
```

### 3. **Header e Footer Sostituiti con Slot**
```html
<!-- Header slot -->
<div id="site-header-slot"></div>

<!-- Footer slot -->
<div id="site-footer-slot"></div>
```

### 4. **Script per Montare Componenti**
```javascript
<script type="module">
  // Imposta tema light
  document.documentElement.setAttribute('data-theme', 'light');
  
  // Importa componenti
  import { siteHeader } from '/report/assets/js/components/site-header.js';
  import { siteFooter } from '/report/assets/js/components/site-footer.js';
  
  // Monta header
  const headerSlot = document.getElementById('site-header-slot');
  if (headerSlot) {
    siteHeader.mount(headerSlot);
  }
  
  // Monta footer
  const footerSlot = document.getElementById('site-footer-slot');
  if (footerSlot) {
    siteFooter.mount(footerSlot);
  }
</script>
```

## 📋 Come Funziona

1. **Tema Light**: Il tag `<html>` ha `data-theme="light"` che attiva gli stili light
2. **CSS**: Il file `header-footer-light.css` contiene gli stili per header e footer in tema light
3. **Componenti JS**: I componenti `site-header.js` e `site-footer.js` vengono montati negli slot
4. **Stili Applicati**: Gli stili light vengono applicati automaticamente via CSS quando `data-theme="light"` è presente

## 🎯 Risultato

- ✅ Header montato via JavaScript con tema light
- ✅ Footer montato via JavaScript con tema light
- ✅ Stili light centralizzati in `/report/assets/css/header-footer-light.css`
- ✅ Componenti riutilizzabili da `/report/assets/js/components/`

## 📝 Note

- Gli stili light sono **solo CSS**, non ci sono componenti JavaScript separati
- Il tema light viene applicato automaticamente quando `data-theme="light"` è presente
- I componenti JavaScript sono gli stessi usati nel report, ma con stili light applicati via CSS

---

*Documento creato il 2025-01-27*

