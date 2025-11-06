# 🔍 Analisi Doppioni e Sovrapposizioni - Moduli

## ❌ Problemi Trovati

### 1. **Stili Inline Duplicati**
Tutti i moduli (F1B, F2, F3, F3O) hanno stili inline identici:

```html
<!-- DUPLICATO in F1B, F2, F3, F3O -->
style="font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;"
style="background:var(--surface-card-alt);border-color:var(--br-card);color:var(--ink);"
style="background:var(--surface-card);border:1px solid var(--br-card);border-radius:var(--radius-card);box-shadow:var(--shadow-card);padding:1rem;"
```

### 2. **Classi CSS Errate**
- F2, F3, F3O usano `f1b-card-container` invece di una classe generica
- Dovrebbero usare `.module-card` unificata

### 3. **Classi Tailwind Non Definite**
Uso di classi Tailwind che non esistono nel CSS:
- `text-[13px]` → dovrebbe essere `font-size: var(--fs-13)`
- `leading-[1.5]` → dovrebbe essere `line-height: var(--lh-15)`
- `flex`, `grid`, `gap-4`, `mb-4`, `mt-1` → non definite nel CSS
- `px-[6px]`, `py-[2px]` → dovrebbero essere padding CSS

### 4. **Struttura HTML Duplicata**
Tutti i moduli hanno la stessa struttura header:
```html
<header class="section-headline mb-4">
  <div class="section-head-left">
    <div class="section-head-topline flex items-center flex-wrap gap-2">
      <span class="section-badge">...</span>
      <span class="text-[10px]...">...</span>
      <span class="module-status-pill...">...</span>
    </div>
    <div class="section-title-main...">...</div>
    <div class="section-desc...">...</div>
  </div>
</header>
```

### 5. **CSS Mancante**
- `.card-compact` usato ma non definito
- `.info-btn` usato ma non definito
- Classi utility Tailwind non definite

## ✅ Soluzione Proposta

### 1. **Classe Unificata `.module-card`**
Sostituire `f1b-card-container`, `f2-card-container`, ecc. con `.module-card`

### 2. **Rimuovere Stili Inline**
Spostare tutti gli stili inline in CSS

### 3. **Rimuovere Classi Tailwind**
Sostituire con classi CSS reali

### 4. **Componente Header Condiviso**
Creare funzione helper per generare header moduli

### 5. **CSS Unificato**
Creare `module-card.css` con tutti gli stili unificati

## 📋 File da Modificare

1. **CSS:**
   - `report/assets/css/report-layout.css` → Aggiungere stili moduli unificati
   - Rimuovere `.f1b-card-container`, `.f2-card-container` specifici

2. **JS Moduli:**
   - `f1b.js` → Rimuovere stili inline, usare `.module-card`
   - `f2.js` → Rimuovere stili inline, usare `.module-card`
   - `f3.js` → Rimuovere stili inline, usare `.module-card`
   - `f3o.js` → Rimuovere stili inline, usare `.module-card`
   - `f1a.js` → Rimuovere stili inline, usare `.module-card`

3. **Helper Component:**
   - Creare `module-header.js` per generare header unificato

## 🎯 Risultato Atteso

- ✅ Zero stili inline
- ✅ Zero classi Tailwind non definite
- ✅ Una sola classe `.module-card` per tutti i moduli
- ✅ Header generato da funzione condivisa
- ✅ CSS unificato e pulito

