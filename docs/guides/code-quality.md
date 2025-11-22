# Code Quality - ESLint, Prettier, TypeScript

Questa guida descrive la configurazione di ESLint, Prettier e TypeScript per mantenere alta la qualità del codice nel progetto Tradelia AI.

## Configurazione

### ESLint

ESLint è configurato in `.eslintrc.json` con:

- Regole raccomandate di ESLint
- Supporto TypeScript tramite `@typescript-eslint`
- Integrazione con Prettier per evitare conflitti
- Regole personalizzate per best practice accademiche

**Comandi:**

```bash
npm run lint          # Lint e fix automatico
npm run lint:check    # Solo check (no fix)
```

### Prettier

Prettier è configurato in `.prettierrc.json` per formattazione automatica consistente.

**Comandi:**

```bash
npm run format        # Formatta tutti i file
npm run format:check  # Solo check (no format)
```

### Pre-commit Hooks (Husky + lint-staged)

I pre-commit hooks sono configurati per:

- Eseguire ESLint e Prettier sui file staged
- Generare automaticamente `tokens.css` se `tokens.json` è modificato

**Setup:**

```bash
npm run prepare  # Inizializza Husky (eseguito automaticamente dopo npm install)
```

### TypeScript

TypeScript è configurato in `tsconfig.json` con:

- Strict mode abilitato
- Supporto ES2022
- Gradual migration (allowJs: true)

**Migrazione graduale:**

1. I file JavaScript esistenti continuano a funzionare
2. I nuovi file possono essere scritti in TypeScript
3. I file critici possono essere convertiti progressivamente

## Best Practice

1. **Sempre formattare prima di commitare**: `npm run format`
2. **Verificare linting**: `npm run lint:check`
3. **TypeScript per nuovi moduli**: Usa `.ts` per nuovi file nella dashboard
4. **Fix automatici**: `npm run lint` applica fix automatici quando possibile

## File Esclusi

I seguenti file/cartelle sono esclusi da linting e formatting:

- `node_modules/`
- `dist/`, `build/`
- `archivio/`, `report/`, `docs/`
- File minificati (`*.min.js`)
