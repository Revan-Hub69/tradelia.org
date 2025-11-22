# Dashboard Reference Guide - Elenco File Rilevanti

**Versione**: 1.0  
**Data**: 2025-01-XX  
**Scopo**: Guida rapida per trovare file rilevanti per la revisione dashboard

---

## 📁 Organizzazione File per Categoria

### 🎨 **Design System & Styling**

#### CSS Principali
- `assets/css/components/dashboard.css` - **File principale stili dashboard** (3000+ linee)
- `assets/css/components/dashboard-theme-overrides.css` - Override tema dashboard
- `assets/css/settings/tokens.css` - Design tokens base
- `assets/css/generic/reset.css` - CSS reset
- `assets/css/elements/typography.css` - Tipografia base
- `assets/css/elements/links.css` - Stili link base

#### CSS Report (Riferimento)
- `report/assets/css/tokens.css` - **Tokens report (ha reduced motion support)**
- `report/assets/css/module-card.css` - Stili card moduli

---

### 📄 **HTML Principali**

- `dashboard.html` - **File principale dashboard** (1186 linee)
  - Struttura HTML completa
  - Panel views per ogni modulo
  - Toast notification container
  - Footer slot

---

### 🔧 **JavaScript - Entry Point**

#### Entry Point Dashboard
- `assets/js/dashboard/app.js` - **Entry point principale** (240 linee)
  - Inizializzazione dashboard
  - Gestione navigazione
  - Autenticazione
  - Session management

- `assets/js/dashboard/index.js` - **Module loader** (48 linee)
  - Registry moduli
  - Funzione `loadModule()`

---

### 📦 **JavaScript - Moduli Dashboard**

#### Moduli Principali (13 totali)

1. **Overview**
   - `assets/js/dashboard/overview.js` - Panoramica dashboard

2. **Reports**
   - `assets/js/dashboard/reports.js` - Report ufficiali

3. **Frameworks**
   - `assets/js/dashboard/frameworks.js` - Documentazione framework

4. **Requests History**
   - `assets/js/dashboard/requests-history.js` - Storico richieste

5. **Notifications**
   - `assets/js/dashboard/notifications.js` - Sistema notifiche

6. **Settings**
   - `assets/js/dashboard/settings.js` - Impostazioni utente

7. **Resources**
   - `assets/js/dashboard/resources.js` - Risorse & supporto

8. **Access**
   - `assets/js/dashboard/access.js` - Gestione accesso

9. **On-Demand**
   - `assets/js/dashboard/on-demand.js` - Analisi on-demand

10. **Community**
    - `assets/js/dashboard/community.js` - Community proposals

11. **Education**
    - `assets/js/dashboard/education.js` - Percorsi formativi (placeholder)

12. **Brokers**
    - `assets/js/dashboard/brokers.js` - Broker regolamentati

13. **Admin**
    - `assets/js/dashboard/admin.js` - Amministrazione (solo admin)

---

### 🛠️ **JavaScript - Utility & Support**

#### Autenticazione & Permessi
- `assets/js/dashboard/auth.js` - Gestione autenticazione
- `assets/js/dashboard/permissions.js` - Gestione permessi
- `assets/js/dashboard/session.js` - Session management

#### Componenti UI
- `assets/js/dashboard/toast.js` - **Sistema toast notifications**
- `assets/js/dashboard/account-banner.js` - Banner account utente
- `assets/js/dashboard/footer.js` - Footer dashboard

#### Database & API
- `assets/js/dashboard/supabase-client.js` - Client Supabase

#### Performance
- `assets/js/performance/web-vitals.js` - Web Vitals tracking
- `assets/js/performance/bundle-monitor.js` - Bundle size monitoring

---

### 📚 **Documentazione Dashboard**

#### Linee Guida
- `docs/dashboard-design-guidelines.md` - **Linee guida design** (creato)
- `docs/dashboard-audit-revision-plan.md` - **Piano revisione** (creato)
- `docs/dashboard-audit-results.md` - **Risultati audit** (creato)
- `docs/dashboard-reference-guide.md` - **Questa guida** (creato)

#### Analisi & Decisioni
- `docs/analysis/ANALISI-SEZIONI-DASHBOARD.md` - Analisi sezioni
- `docs/analysis/ANALISI-DASHBOARD-ADMIN.md` - Analisi dashboard admin
- `docs/analysis/ANALISI-LACUNE-ACCADEMICHE-2025.md` - Lacune best practices
- `docs/architecture/ARCHITETTURA-DASHBOARD-MODULARE.md` - Architettura modulare
- `docs/architecture/MODULI-DASHBOARD-DECISIONI.md` - Decisioni moduli

#### Database & Setup
- `docs/database/DASHBOARD-DATABASE-SETUP.md` - Schema database dashboard

#### Reference Generale
- `DASHBOARD-SEZIONI.md` - Elenco completo sezioni dashboard (root)

---

### 🔍 **Checklist File per Revisione**

#### Priorità Alta (Critici)
- [ ] `dashboard.html` - Verificare metadata SEO, aria-live regions
- [ ] `assets/css/components/dashboard.css` - Aggiungere reduced motion support
- [ ] `assets/js/dashboard/app.js` - Aggiungere focus trap, keyboard nav
- [ ] `assets/js/dashboard/toast.js` - Verificare utilizzo in tutti i moduli
- [ ] Tutti i moduli (`*.js` in `assets/js/dashboard/`) - Verificare loading states, error handling

#### Priorità Media (Importanti)
- [ ] `assets/js/dashboard/settings.js` - Aggiungere toggle reduced motion
- [ ] `assets/js/dashboard/overview.js` - Aggiungere skeleton loading
- [ ] `assets/js/performance/web-vitals.js` - Verificare implementazione

#### Priorità Bassa (Miglioramenti)
- [ ] `assets/css/components/dashboard-theme-overrides.css` - Review stili
- [ ] Tutti i moduli - Standardizzare error handling

---

## 🎯 **Processo di Lavoro Consigliato**

### 1. **Revisione Design System**
1. Leggere `docs/dashboard-design-guidelines.md`
2. Verificare conformità in `assets/css/components/dashboard.css`
3. Confrontare con `report/assets/css/tokens.css` (reference)

### 2. **Revisione Moduli**
1. Leggere `docs/dashboard-audit-results.md` per violazioni
2. Per ogni modulo in `assets/js/dashboard/`:
   - Verificare loading states
   - Verificare error handling
   - Verificare utilizzo toast
   - Verificare keyboard navigation

### 3. **Implementazione**
1. Seguire `docs/dashboard-audit-revision-plan.md` (7 fasi)
2. Implementare una fase alla volta
3. Testare dopo ogni modifica
4. Aggiornare `docs/dashboard-audit-results.md` con progress

### 4. **Testing**
1. Test accessibilità (axe-core, WAVE)
2. Test keyboard navigation
3. Test screen reader
4. Test performance (Lighthouse)
5. Test con `prefers-reduced-motion` attivo

---

## 📝 **Note Importanti**

### File da NON Modificare (senza review)
- `assets/css/settings/tokens.css` - Design tokens base (modificare solo se necessario)
- `assets/js/dashboard/supabase-client.js` - Client Supabase (stabile)

### File da Modificare Prima
1. `assets/css/components/dashboard.css` - Aggiungere reduced motion
2. `assets/js/dashboard/app.js` - Aggiungere focus trap
3. `dashboard.html` - Aggiungere metadata SEO

### File da Creare (se necessario)
- `assets/js/dashboard/error-boundary.js` - Error boundaries
- `assets/js/dashboard/keyboard-nav.js` - Keyboard navigation utility
- `assets/js/dashboard/loading-skeleton.js` - Skeleton loading utility

---

## 🔗 **Riferimenti Esterni**

### Documentazione
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Schema.org Documentation](https://schema.org/)

### Strumenti
- [axe DevTools](https://www.deque.com/axe/devtools/) - Accessibilità testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance testing

---

**Ultimo aggiornamento**: 2025-01-XX  
**Mantieni aggiornato**: Aggiungi nuovi file rilevanti qui quando creati

