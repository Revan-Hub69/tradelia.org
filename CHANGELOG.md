# Changelog

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

## [3.0.0] - 2025-01-XX

### 🔴 BREAKING CHANGES

#### Rimozione Ruolo "Institutional"

- ⚠️ **BREAKING**: Rimosso ruolo "institutional" da tutto il sistema
- Utenti con ruolo "institutional" devono essere migrati a "pro" o "desk"
- Rimosso da: `UserRole` type, `useIsPro()` logic, pricing plans, checkout, admin interface, traduzioni
- **Migration necessaria**: Migrare utenti esistenti a nuovi ruoli

#### Sistema Auth Centralizzato

- ⚠️ **BREAKING**: Nuovo sistema di gestione autenticazione centralizzato
- `useApi` ora usa `authenticatedFetch` di default (comportamento cambiato)
- Componenti con fetch manuale devono migrare a `authenticatedFetch`
- Nuovo hook `useAuthState` per gestione stato auth globale
- Redirect automatico a login su 401 con retry automatico dopo login

#### Migrazione localStorage → Supabase

- ⚠️ **BREAKING**: Favorites migrati da `localStorage` a Supabase
- Favorites ora richiedono autenticazione
- API `/api/dashboard/favorites` ora richiede auth
- **Migration necessaria**: Export/import favorites da localStorage

#### Migrazione Moduli da Hardcoded a Database

- ⚠️ **BREAKING**: Moduli ora caricati da database invece che hardcoded
- Struttura dati moduli cambiata
- API `/api/dashboard/modules` ora richiesta
- **Migration necessaria**: Popolare tabella `modules` in Supabase

### ✨ Aggiunto

#### Sistema Gamification Completo

- Achievement Engine con check automatico condizioni
- XP System con calcolo livelli dinamico
- Streak System per tracking giorni consecutivi
- API routes: `/api/gamification/check-achievements`, `/api/gamification/award-xp`, `/api/gamification/stats`
- UI Components: `AchievementNotification`, `UserStats`

#### Design System Overhaul

- Mobile-first responsive design
- Performance animations ottimizzate con `will-change` e `prefers-reduced-motion`
- WCAG 2.1 AA compliance migliorata
- Virtual scrolling per liste lunghe
- Progressive disclosure per ridurre cognitive load
- Contextual help con tooltips
- Keyboard shortcuts per navigazione rapida
- Score design/UX: 94/100 (Eccellente)

#### Nuove Features Pro

- **Watchlist** con price alerts e multi-provider (Finnhub, Binance, Yahoo Finance)
- **PAC Simulator** (Piano di Accumulo Capitale)
- **Expense Tracker** per gestione spese
- **Portfolio Manager** per monitoraggio portafoglio
- **Financial Calculator** per calcoli finanziari avanzati
- **Alert System** per notifiche personalizzate

#### Sistema Auth Centralizzato

- `lib/api/fetch-client.ts` - Wrapper fetch con gestione 401 globale
- `lib/hooks/useAuthState.ts` - Hook stato autenticazione globale
- Retry automatico richieste fallite dopo login
- Coda sequenziale per evitare race conditions
- Supporto API pubbliche con opzione `requireAuth: false`

#### Migrazione Supabase

- Moduli configurabili dall'admin (tabella `modules`)
- Favorites sincronizzati cross-device (tabella `favorites`)
- Admin interface per gestione Supabase

### 🔧 Modificato

#### Type Safety

- Rimosso tutti i `any` types
- Usato `User` type di Supabase invece di `any`
- Migliorata type safety in `useApi` e `fetch-client`

#### Performance

- Lazy loading componenti non critici
- Virtual scrolling per liste lunghe
- GPU-accelerated animations
- Code splitting ottimizzato

#### Accessibilità

- WCAG 2.1 AA compliance
- ARIA labels completi
- Keyboard navigation
- Screen reader support
- `prefers-reduced-motion` support

### 🐛 Corretto

- Rimosso `console.log` e `console.error` statements
- Migliorata gestione errori con toast notifications
- Sanitizzazione URL per prevenzione XSS
- Fix mobile responsiveness
- Fix color contrast per WCAG compliance
- Fix type errors e linting issues

### 📚 Documentazione

- `docs/VERSION-MAJOR-CHANGES-ANALYSIS.md` - Analisi completa cambiamenti major
- `docs/API-401-HANDLING-IMPLEMENTATION.md` - Documentazione sistema auth
- `docs/DASHBOARD-DESIGN-UX-REVIEW-2025.md` - Review design/UX completo
- `docs/DASHBOARD-CODE-REVIEW-2025.md` - Code review best practices
- `docs/REMOVED-INSTITUTIONAL.md` - Documentazione rimozione institutional
- `docs/GAMIFICATION-IMPLEMENTATION.md` - Guida implementazione gamification
- `docs/MIGRATION-COMPLETE.md` - Documentazione migrazione Supabase

### 🔒 Sicurezza

- Sanitizzazione URL per prevenzione XSS
- Gestione centralizzata errori 401
- Type safety migliorata
- Validazione input migliorata

---

## [2.0.1] - 2025-01-XX

### ✨ Aggiunto

- **SEO completo** con ottimizzazione AI Search (ChatGPT, Perplexity, Claude)
- **Structured Data** (Schema.org) per EducationalOrganization
- **Sitemap dinamico** e robots.txt ottimizzato
- **Sicurezza enterprise-grade** (CSP, HSTS, security headers)
- **Multilingua** (i18n) IT/EN con Next.js
- **Navigazione completa** con menu mobile responsive
- **Footer professionale** con 4 sezioni (Supporto, Legale, Risorse, Azienda)
- **Design system** modulare con Tailwind CSS
- **Componenti UI** riutilizzabili (shadcn/ui style)
- **Animazioni** eleganti con Framer Motion
- **Utilities** per formattazione (date, number, currency)
- **Constants centralizzati** per SEO

### 🔧 Modificato

- Migrazione completa a Next.js 14 App Router
- Conversione a Tailwind CSS puro
- Refactoring componenti in struttura modulare
- Ottimizzazione font loading con fallback
- Miglioramento performance e bundle size

### 🐛 Corretto

- Metadata async in layout.tsx
- ESLint configuration per Next.js 14
- Build errors e type safety

### 🔒 Sicurezza

- Content Security Policy (CSP) completo
- Strict-Transport-Security (HSTS) con preload
- Security headers enterprise-grade
- Permissions-Policy restrittiva

### 📚 Documentazione

- README completo e aggiornato
- Documentazione stack tecnologico
- Best practices e setup guide

---

## [2.0.0] - 2025-01-XX

### 🎉 Rilascio Iniziale

- Progetto pulito e modernizzato
- Infrastruttura Next.js 14
- Design system professionale
- Componenti modulari
