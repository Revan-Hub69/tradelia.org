# Build System - Vite Configuration

## Overview

Il progetto utilizza **Vite** come build system per:
- Bundling e minificazione
- Asset optimization
- Development server
- Hot Module Replacement (HMR)

## Setup

### Installazione Dipendenze

```bash
npm install -D vite terser
```

### Scripts Disponibili

```bash
npm run build          # Build production
npm run dev            # Development server
npm run preview        # Preview production build
```

## Configurazione

Vedi `vite.config.js` per:
- Entry points
- Output structure
- Asset optimization
- Alias paths

## Output Structure

```
dist/
├── index.html
├── dashboard.html
├── assets/
│   ├── js/
│   │   ├── main-[hash].js
│   │   └── dashboard-[hash].js
│   ├── css/
│   │   └── [name]-[hash].css
│   └── img/
│       └── [name]-[hash].[ext]
```

## Best Practice

1. **Non committare `dist/`** - Aggiunto a `.gitignore`
2. **Build prima di deploy** - Vercel build automatico
3. **Verifica output** - Test locale con `npm run preview`

## Riferimenti

- [Vite Documentation](https://vitejs.dev/)
- [Build Optimization Best Practices 2024](https://web.dev/vite/)

