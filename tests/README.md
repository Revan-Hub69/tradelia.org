# Testing Structure

Struttura base per testing del progetto.

## Organizzazione

```
tests/
├── unit/              # Unit tests
│   ├── utils/         # Test utilities
│   └── components/    # Test componenti
├── integration/       # Integration tests
└── e2e/              # E2E tests
    └── dashboard.spec.js
```

## Setup Futuro

Quando configurato, utilizzeremo:
- **Vitest** per unit/integration tests
- **Playwright** per E2E tests

## Scripts

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests only
```

## Best Practice

1. Test per ogni utility function
2. Test per componenti critici
3. E2E per critical paths (login, dashboard navigation)

