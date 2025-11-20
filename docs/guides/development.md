# Development Guide

## Setup Locale

### Prerequisiti
- Node.js 18+
- npm o yarn

### Installazione

```bash
npm install
```

### Scripts Disponibili

```bash
# Generazione
npm run generate-tokens    # Genera CSS da tokens.json
npm run generate-manifest  # Genera manifest.json

# Build (quando configurato)
npm run build             # Build production
npm run dev               # Development server

# Testing (quando configurato)
npm test                  # Run tests
npm run test:watch        # Watch mode
```

## Workflow

### 1. Modificare Design Tokens

```bash
# 1. Modifica design-tokens/tokens.json
# 2. Genera CSS
npm run generate-tokens
# 3. Verifica design-tokens/tokens.css
```

### 2. Sviluppare Componenti

1. Crea componente in `assets/js/components/` o `report/assets/js/components/`
2. Aggiungi CSS corrispondente
3. Usa design tokens: `var(--brand-600)`
4. Testa responsive

### 3. Commit

```bash
# Pre-commit hook genera automaticamente:
# - manifest.json
# - tokens.css
git add .
git commit -m "feat: descrizione"
```

## Best Practice

1. **Usa ES Modules** - `import/export`
2. **Design tokens** - Non valori hardcoded
3. **Accessibility** - aria-labels, keyboard nav
4. **Performance** - Lazy loading, code splitting

## Riferimenti

- [Design Tokens Guide](../architecture/design-tokens.md)
- [Build System Guide](../architecture/build-system.md)

