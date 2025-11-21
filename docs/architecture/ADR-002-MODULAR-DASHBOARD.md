# ADR-002: Architettura Modulare Dashboard

**Data**: 2025-01-XX  
**Stato**: ✅ Implementato  
**FASE**: 2 - Qualità Codice

## Contesto

Il dashboard aveva tutto il JavaScript inline in `dashboard.html`, rendendo difficile manutenzione, testing e collaborazione.

## Decisione

Separare la logica in **moduli ES6** con pattern modulare:

```
assets/js/dashboard/
├── index.js              # Module loader
├── app.js                # Application entry point
├── toast.js              # Toast notification system
├── supabase-client.js    # Supabase singleton
├── overview.js            # Overview module
├── reports.js            # Reports module
├── frameworks.js         # Frameworks module
├── requests-history.js   # Requests history module
├── notifications.js      # Notifications module
├── settings.js           # Settings module
└── resources.js          # Resources module
```

## Conseguenze

### Positive

- ✅ Separazione concerns (HTML, CSS, JS)
- ✅ Moduli testabili isolatamente
- ✅ Facile aggiungere/modificare sezioni
- ✅ Collaborazione facilitata (file separati)
- ✅ Lazy loading possibile (futuro)

### Negative

- ⚠️ Più file da gestire
- ⚠️ Richiede disciplina nell'organizzazione

## Pattern Implementato

```javascript
// dashboard.html
import { initDashboard } from "/assets/js/dashboard/app.js";

// app.js
import { loadModule } from "./index.js";

// index.js
import { loadReports } from "./reports.js";
const MODULE_LOADERS = {
  reports: loadReports,
  // ...
};
```

## Alternative Considerate

1. **Framework completo (React/Vue)**: Rifiutato - overkill per questo progetto, preferiamo vanilla JS
2. **Web Components**: Rifiutato - supporto browser limitato, complessità aggiuntiva
3. **Monolitico**: Rifiutato - già presente, difficile da mantenere

## Implementazione

- JavaScript estratto da `dashboard.html` in moduli separati
- State management centralizzato (`STATE` exportato)
- Module loader con registry pattern
- Toast system riutilizzabile

## Riferimenti

- ES6 Modules: [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- Clean Architecture (Robert C. Martin)
