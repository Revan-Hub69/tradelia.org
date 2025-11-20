# Design Tokens - Sistema Centralizzato

## Overview

I design tokens sono definiti in `design-tokens/tokens.json` e generati automaticamente in CSS tramite `npm run generate-tokens`.

## Struttura

```
design-tokens/
├── tokens.json      # Source of truth (JSON)
├── tokens.css       # Generato automaticamente
└── tokens.js        # Per runtime JS (futuro)
```

## Utilizzo

### CSS
```css
/* Usa le variabili generate */
.my-component {
  color: var(--brand-600);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
}
```

### JavaScript (futuro)
```javascript
import tokens from './design-tokens/tokens.js';
const brandColor = tokens.colors.brand['600'];
```

## Generazione

```bash
npm run generate-tokens
```

Il comando legge `tokens.json` e genera `tokens.css` con tutte le variabili CSS.

## Best Practice

1. **Non modificare `tokens.css` manualmente** - È generato automaticamente
2. **Modifica solo `tokens.json`** - Source of truth
3. **Esegui `generate-tokens` prima di commit** - Hook pre-commit configurato

## Riferimenti

- [W3C Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- [Design Tokens Best Practices 2024](https://design-tokens.github.io/community-group/format/)

