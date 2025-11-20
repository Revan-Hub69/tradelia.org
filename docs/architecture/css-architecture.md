# CSS Architecture - ITCSS Methodology

## Overview

Il progetto segue principi **ITCSS** (Inverted Triangle CSS) per organizzazione scalabile.

## Struttura ITCSS

```
styles/
├── settings/          # Variables, tokens (design-tokens/)
├── tools/            # Mixins, functions (futuro)
├── generic/          # Reset, normalize (tokens.css)
├── elements/         # Base HTML elements (tokens.css)
├── objects/          # Layout patterns (futuro)
├── components/       # UI components (report/assets/css/)
└── utilities/        # Utility classes (futuro)
```

## Organizzazione Attuale

### Design Tokens
- `design-tokens/tokens.json` - Source of truth
- `design-tokens/tokens.css` - Generato automaticamente
- `report/assets/css/tokens.css` - Tokens esistenti (da migrare)

### Componenti
- `report/assets/css/design-system-academico-2025.css` - Componenti base
- `report/assets/css/module-card.css` - Componenti moduli
- `assets/css/global-header.css` - Header component

### Utilities
- `report/assets/css/ui-enhancements-2025.css` - Utilities
- `report/assets/css/responsive-2025.css` - Responsive utilities

## Best Practice

1. **Usa design tokens** - Non valori hardcoded
2. **BEM naming** - `.component__element--modifier`
3. **Mobile-first** - Media queries min-width
4. **Modularità** - Un file CSS per componente

## Migrazione Futura

Piano di migrazione completa a ITCSS:
1. Consolidare tokens in `design-tokens/`
2. Creare `styles/tools/` per mixins
3. Organizzare componenti in `styles/components/`
4. Utilities in `styles/utilities/`

## Riferimenti

- [ITCSS Architecture](https://www.creativebloq.com/web-design/manage-large-css-projects-itcss-101517528)
- [BEM Methodology](http://getbem.com/)

