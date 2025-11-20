# Tradelia AI · Progetto Accademico

Progetto indipendente di analisi sui mercati finanziari con framework AI proprietari.

## 📚 Documentazione

La documentazione è organizzata in `docs/` per categoria:

### `/docs/architecture/`
Architettura, design system, struttura progetto:
- Design System Accademico 2025
- Struttura Progetto
- Build System
- CSS Architecture

### `/docs/guides/`
Guide operative per sviluppo e setup:
- Development Guide
- Deployment Strategy
- Setup vari servizi (Supabase, Stripe, Xolo, etc.)
- Workflow e priorità

### `/docs/analysis/`
Analisi, decisioni, trade-off:
- Analisi complete progetto
- Design decisions
- Area utente, dashboard

### `/docs/fixes/`
Fix implementati e risoluzioni problemi:
- Fix PWA, dashboard, password reset
- Fix area utente

### `/docs/verification/`
Verifiche e compliance:
- Verifica best practice
- GDPR compliance
- Verifica logiche complete

### `/docs/setup/`
Setup e configurazione:
- Environment variables
- Setup token admin
- Configurazione email

### `/docs/business/`
Documentazione business e prodotti:
- Pricing, desk, affiliazioni
- Strategie entrate

### `/docs/compliance/`
Compliance e normative:
- MiFID compliance
- Review normative

## 🚀 Quick Start

```bash
# Installazione
npm install

# Generazione tokens
npm run generate-tokens

# Generazione manifest
npm run generate-manifest
```

## 📖 Documenti Principali

- [Workflow e Priorità](./docs/guides/workflow-priorita.md) - Ordine di lavoro ottimale
- [Development Guide](./docs/guides/development.md) - Setup sviluppo
- [Design Tokens](./docs/architecture/design-tokens.md) - Design system
- [Build System](./docs/architecture/build-system.md) - Configurazione build

## 🏗️ Struttura Progetto

```
tradelia.org-main/
├── docs/              # Documentazione organizzata
├── assets/            # Assets statici (CSS, JS, img)
├── report/            # Report e moduli
├── api/               # API endpoints
├── admin/             # Dashboard admin
├── dashboard.html     # Dashboard principale
└── index.html         # Homepage
```

## 📝 Note

I file `.md` nella root sono stati organizzati in `docs/` per migliorare la navigazione e la manutenzione del progetto.

Per la documentazione completa, consulta `docs/README.md`.

