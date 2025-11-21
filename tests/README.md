# 🧪 Test Suite - Tradelia Dashboard

**FASE 3: Testing Framework Setup**

## 📋 Struttura Test

```
tests/
├── setup.js                    # Configurazione globale Vitest
├── unit/                       # Test unitari
│   ├── generate-tokens.test.js
│   └── dashboard-state.test.js
├── integration/                # Test integrazione
│   └── module-loader.test.js
├── utils/                      # Helper per test
│   └── test-helpers.js
└── README.md                   # Questo file
```

## 🚀 Comandi

```bash
# Esegui tutti i test
npm test

# Esegui test in watch mode
npm run test:watch

# Esegui test con UI
npm run test:ui

# Esegui test con coverage
npm run test:coverage
```

## 📝 Convenzioni

- **File test**: `*.test.js` o `*.spec.js`
- **Naming**: `describe('Feature', () => { it('should...', () => {}) })`
- **Setup**: Usa `beforeEach` per reset state
- **Helpers**: Usa `tests/utils/test-helpers.js` per utility comuni

## ✅ Best Practice

1. **Test isolati**: Ogni test deve essere indipendente
2. **Cleanup**: Usa `afterEach` per pulire DOM/mocks
3. **Assertions chiare**: Usa matchers descrittivi
4. **Coverage**: Obiettivo 80%+ per utilities critiche

## 🎯 Priorità Test

### ✅ Fatto
- [x] Setup Vitest
- [x] Test generate-tokens
- [x] Test state management
- [x] Test module loader base

### ⏳ Da Fare
- [ ] Test componenti dashboard completi
- [ ] Test API integration
- [ ] Test error handling
- [ ] E2E tests (Playwright) - FASE 3.2
