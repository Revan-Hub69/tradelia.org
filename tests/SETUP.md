# 🧪 Setup Testing Framework - FASE 3

## 📦 Installazione Dipendenze

**Nota**: Se PowerShell ha problemi con execution policy, usa CMD o esegui manualmente:

```bash
# Opzione 1: CMD
cmd /c npm install --save-dev vitest @vitest/ui jsdom @testing-library/dom @testing-library/jest-dom

# Opzione 2: PowerShell (se execution policy permette)
npm install --save-dev vitest @vitest/ui jsdom @testing-library/dom @testing-library/jest-dom

# Opzione 3: Manualmente - le dipendenze sono già in package.json
# Esegui npm install normalmente
```

## ✅ Verifica Installazione

```bash
npm test
```

Dovresti vedere:
```
✓ tests/unit/generate-tokens.test.js
✓ tests/unit/dashboard-state.test.js
✓ tests/integration/module-loader.test.js
```

## 🚀 Comandi Disponibili

```bash
# Esegui tutti i test
npm test

# Test in watch mode (rileva cambiamenti)
npm run test:watch

# Test con UI interattiva
npm run test:ui

# Test con coverage report
npm run test:coverage
```

## 📁 Struttura Test

```
tests/
├── setup.js                    # Config Vitest globale
├── unit/                       # Test unitari
│   ├── generate-tokens.test.js
│   └── dashboard-state.test.js
├── integration/                # Test integrazione
│   └── module-loader.test.js
├── utils/                      # Helper
│   └── test-helpers.js
└── README.md
```

## 🎯 Prossimi Passi

1. ✅ Setup Vitest - FATTO
2. ✅ Test utilities critiche - FATTO
3. ⏳ Test componenti dashboard completi
4. ⏳ E2E tests (Playwright) - FASE 3.2

