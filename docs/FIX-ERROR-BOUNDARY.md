# Fix ErrorBoundary Build Error

## Problema

Next.js build a volte fallisce con errore:
```
Error: x Unexpected token `ErrorBoundary`. Expected jsx identifier
```

Questo accade quando si usa una **class component** (`ErrorBoundary`) direttamente in JSX in alcuni contesti di build.

## Soluzione

Creare un **wrapper funzionale** per `ErrorBoundary`:

```tsx
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { type ReactNode } from 'react';

// Wrapper funzionale per ErrorBoundary (class component) per compatibilità Next.js
const ErrorBoundaryWrapper = ({ children }: { children: ReactNode }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

// Usa ErrorBoundaryWrapper invece di ErrorBoundary
return (
  <ErrorBoundaryWrapper>
    {/* contenuto */}
  </ErrorBoundaryWrapper>
);
```

## Script Automatico

Esegui lo script per correggere automaticamente i file:

```bash
npm run fix:error-boundary
```

Oppure direttamente:

```bash
node scripts/fix-error-boundary.mjs
```

## File Corretti

- ✅ `components/dashboard/utilities/StrategyBuilder.tsx`

## Note

- Lo script cerca automaticamente file che usano `<ErrorBoundary>` direttamente
- Crea un wrapper funzionale e sostituisce tutti gli usi
- Non modifica file che hanno già il wrapper
