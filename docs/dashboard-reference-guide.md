# Dashboard Reference Guide - Tradelia AI

## Guida Completa File e Linee Guida per Revisione Dashboard

> **Scopo**: Questo documento contiene tutti i file rilevanti per la dashboard e le linee guida per la revisione continua.  
> **Aggiornamento**: Mantenere aggiornato ad ogni modifica significativa.

---

## 📚 Documenti di Riferimento

### Linee Guida e Audit:

- `docs/dashboard-design-guidelines.md` - Linee guida basate su ricerca accademica 2019-2024
- `docs/dashboard-audit-revision-plan.md` - Piano di revisione sistematico (7 fasi)
- `docs/dashboard-audit-results.md` - Risultati audit con violazioni identificate

### Altri Documenti:

- `docs/twilio-whatsapp-setup.md` - Setup Twilio per SMS/WhatsApp

---

## 🎨 File Design System e Styling

### CSS Core (Design System):

```
assets/css/settings/tokens.css          # Design tokens (colori, spacing, typography)
assets/css/generic/reset.css            # CSS reset
assets/css/elements/typography.css      # Tipografia base
assets/css/elements/links.css           # Stili link
assets/css/objects/container.css       # Container e layout
assets/css/components/dashboard.css     # Componenti dashboard principali
assets/css/components/dashboard-theme-overrides.css  # Override tema dashboard
assets/css/site-coherence-2025.css     # Coerenza scrollbar e stili globali
assets/css/mifid-banner.css            # Banner MiFID compliance
```

### CSS Specifici Dashboard:

```
assets/css/components/dashboard.css     # ⭐ PRINCIPALE - Tutti gli stili dashboard
```

**Note**:

- `dashboard.css` contiene tutti gli stili per moduli, cards, banner, footer
- Usa design tokens da `tokens.css`
- Seguire ITCSS architecture

---

## 📄 File HTML Dashboard

### HTML Principale:

```
dashboard.html                          # ⭐ ENTRY POINT - Dashboard principale
```

**Struttura**:

- Header minimale con brand
- Account banner slot
- Main content con moduli grid
- 3 categorie moduli: Principale, Analisi & Servizi, Account & Impostazioni
- 12 moduli totali (⚠️ VIOLAZIONE: troppi, max 5-7)

### Altri HTML:

```
archivio/dashboard.html                 # Dashboard archivio (legacy?)
```

---

## 🔧 File JavaScript Dashboard

### Entry Point e Core:

```
assets/js/dashboard/app.js              # ⭐ ENTRY POINT - Inizializzazione dashboard
assets/js/dashboard/index.js            # ⭐ MODULE LOADER - Carica moduli dinamici
assets/js/dashboard/auth.js             # Autenticazione e ruoli utente
assets/js/dashboard/session.js          # Gestione sessione e token
```

### Moduli Dashboard (12 moduli):

```
assets/js/dashboard/overview.js         # Modulo: Panoramica (statistiche, attività)
assets/js/dashboard/reports.js         # Modulo: Report ufficiali
assets/js/dashboard/frameworks.js       # Modulo: Framework Documentation (FDM, MLT, PAC)
assets/js/dashboard/education.js        # Modulo: Percorsi formativi
assets/js/dashboard/on-demand.js       # Modulo: Analisi on-demand
assets/js/dashboard/requests-history.js # Modulo: Storico richieste
assets/js/dashboard/community.js       # Modulo: Community proposals (votazioni)
assets/js/dashboard/resources.js       # Modulo: Risorse educative
assets/js/dashboard/settings.js        # Modulo: Impostazioni utente
assets/js/dashboard/access.js          # Modulo: Gestione accesso
assets/js/dashboard/notifications.js   # Modulo: Notifiche
assets/js/dashboard/brokers.js         # Modulo: Informazioni broker
```

### Componenti UI:

```
assets/js/dashboard/account-banner.js  # ⭐ Banner account (stato, notifiche SMS/WhatsApp)
assets/js/dashboard/footer.js          # Footer dashboard con info tecniche
assets/js/dashboard/toast.js           # Sistema notifiche toast
```

### Admin e Altri:

```
assets/js/dashboard/admin.js           # Modulo admin (solo admin)
assets/js/dashboard/permissions.js    # Gestione permessi
assets/js/dashboard/billing-form.js   # Form fatturazione
```

### Supabase Client:

```
assets/js/dashboard/supabase-client.js # Client Supabase per frontend
```

---

## 🔌 API Endpoints

### API Principali:

```
api/user.js                            # ⭐ Router unificato utente (validate, plan, notification-preferences)
api/orders.js                          # ⭐ Router unificato ordini (create, activate, save-billing)
api/admin.js                           # ⭐ Router unificato admin (users, requests, notifications)
api/send-email.js                      # Invio email tramite Brevo
api/send-sms.js                        # Invio SMS tramite Twilio
api/send-whatsapp.js                   # Invio WhatsApp tramite Twilio
api/save-notification-preferences.js   # Salva preferenze notifiche (SMS/WhatsApp/Email)
api/request-analysis.js                # Richiesta analisi on-demand
api/vote.js                            # Votazione community proposals
api/request-dashboard-token.js        # Richiesta token dashboard
```

### API Helpers:

```
api/_lib/supabase.js                   # Client Supabase service role
api/_lib/adminAuth.js                  # Autenticazione admin e token validation
api/_lib/http.js                       # Helpers HTTP (sendJSON, HttpError, handleRouteError)
api/_lib/fetch.js                      # Runtime fetch (named export, non default)
api/_lib/notifications.js              # ⭐ Helper notifiche (SMS/WhatsApp/Email con fallback)
api/_lib/xolo.js                       # Integrazione Xolo (fatturazione)
```

---

## 🗄️ Database Schema

### Schema Supabase:

```
supabase/dashboard-complete-schema.sql              # Schema completo dashboard
supabase/user-notification-preferences-schema.sql   # ⭐ Schema preferenze notifiche
supabase/push-subscriptions-schema.sql             # Schema push subscriptions (deprecato?)
supabase/one-time-services-schema.sql              # Schema servizi one-time
```

### Tabelle Rilevanti:

- `dashboard_access_tokens` - Token accesso dashboard
- `user_plans` - Piani utente (Pro/Desk)
- `plan_usage` - Utilizzo piani
- `user_notification_preferences` - ⭐ Preferenze notifiche (SMS/WhatsApp/Email)
- `orders` - Ordini servizi
- `service_deliveries` - Consegna servizi
- `analysis_requests` - Richieste analisi
- `asset_proposals` - Proposte community (solo Pro)
- `asset_votes` - Voti community

---

## 📋 Checklist File per Revisione

### Prima di Modificare Qualsiasi File:

- [ ] Consultare `docs/dashboard-design-guidelines.md`
- [ ] Verificare `docs/dashboard-audit-results.md` per violazioni note
- [ ] Controllare `docs/dashboard-audit-revision-plan.md` per priorità

### File da Modificare per Information Overload:

- [ ] `dashboard.html` - Ridurre moduli visibili (12 → 5-7)
- [ ] `assets/css/components/dashboard.css` - Stili per toggle "Mostra tutti"
- [ ] `assets/js/dashboard/index.js` - Logica caricamento moduli condizionale

### File da Modificare per Indicatori Predittivi:

- [ ] `assets/js/dashboard/overview.js` - Aggiungere sezione Trend & Forecast
- [ ] `dashboard.html` - Struttura HTML per leading indicators
- [ ] `assets/css/components/dashboard.css` - Stili per grafici predittivi

### File da Modificare per Drill-Down:

- [ ] `assets/js/dashboard/overview.js` - Implementare drill-down KPI
- [ ] `assets/js/dashboard/reports.js` - Drill-down report
- [ ] `assets/css/components/dashboard.css` - Stili per vista dettaglio

### File da Modificare per Export:

- [ ] `assets/js/dashboard/overview.js` - Export CSV/PDF overview
- [ ] `assets/js/dashboard/reports.js` - Export CSV lista reports
- [ ] `api/export.js` (da creare) - API per export dati

### File da Modificare per Qualità Dati:

- [ ] `assets/js/dashboard/overview.js` - Timestamp preciso, badge fonte
- [ ] `assets/js/dashboard/reports.js` - Metadata report visibili
- [ ] `assets/css/components/dashboard.css` - Stili per badge qualità dati

---

## 🎯 Priorità Revisione (da `dashboard-audit-results.md`)

### 🔴 PRIORITÀ CRITICA:

1. **Information Overload - Moduli**
   - File: `dashboard.html`, `assets/css/components/dashboard.css`, `assets/js/dashboard/index.js`
   - Task: Ridurre moduli visibili a 5-7 (default), toggle "Mostra tutti"

2. **Overview - Indicatori Predittivi**
   - File: `assets/js/dashboard/overview.js`, `dashboard.html`
   - Task: Aggiungere sezione Trend & Forecast, leading indicators

3. **Reports - Paginazione**
   - File: `assets/js/dashboard/reports.js`
   - Task: Implementare paginazione, virtual scrolling

### 🟡 PRIORITÀ ALTA:

4. **Drill-Down Interattivo**
   - File: `assets/js/dashboard/overview.js`, `assets/js/dashboard/reports.js`
   - Task: Implementare drill-down, filtri avanzati

5. **Export Dati**
   - File: `assets/js/dashboard/overview.js`, `assets/js/dashboard/reports.js`
   - Task: Export CSV/PDF

6. **Qualità Dati Trasparente**
   - File: Tutti i moduli dashboard
   - Task: Timestamp preciso, badge fonte, indicatori qualità

### 🟢 PRIORITÀ MEDIA:

7. **Onboarding e Help**
   - File: Nuovi file da creare (`assets/js/dashboard/onboarding.js`, `assets/js/dashboard/help.js`)
   - Task: Tutorial interattivo, help context-aware

8. **Personalizzazione**
   - File: `dashboard.html`, `assets/js/dashboard/index.js`, `assets/css/components/dashboard.css`
   - Task: Drag-and-drop moduli, salvataggio layout

---

## 📖 Linee Guida Principali (Sintesi)

### 1. **Information Overload**

- ❌ Max 5-7 moduli visibili contemporaneamente
- ❌ Max 5-7 KPI per modulo
- ✅ Priorità visiva: moduli principali più grandi
- ✅ Toggle "Mostra tutto" / "Solo principali"

### 2. **Indicatori Predittivi**

- ✅ Aggiungere leading indicators (non solo lagging)
- ✅ Alert proattivi per trend negativi
- ✅ Forecasting e trend analysis

### 3. **Esplorazione Dati**

- ✅ Drill-down interattivo (click per dettaglio)
- ✅ Filtri avanzati (data, tipo, categoria)
- ✅ Export CSV/PDF per tutti i dati

### 4. **Qualità Dati**

- ✅ Timestamp preciso su tutti i dati
- ✅ Badge fonte dati
- ✅ Indicatori qualità (affidabilità, completezza)
- ✅ Feedback visivo caricamento

### 5. **Personalizzazione**

- ✅ Drag-and-drop per riordinare moduli
- ✅ Salvataggio layout preferito
- ✅ Nascondere/mostrare moduli
- ✅ Personalizzazione visualizzazioni

### 6. **Onboarding e Help**

- ✅ Tutorial interattivo per nuovi utenti
- ✅ Help context-aware (help button per sezione)
- ✅ Tooltip esplicativi su ogni elemento
- ✅ Onboarding guidato step-by-step

### 7. **Performance**

- ✅ Virtual scrolling per liste lunghe
- ✅ Paginazione per dataset grandi
- ✅ Query database ottimizzate
- ✅ Monitoring Core Web Vitals

---

## 🔄 Processo Lavoro

### Prima di Iniziare:

1. Leggere `docs/dashboard-design-guidelines.md`
2. Consultare `docs/dashboard-audit-results.md` per violazioni note
3. Verificare `docs/dashboard-audit-revision-plan.md` per priorità

### Durante Sviluppo:

1. Verificare checklist file rilevanti (sezione sopra)
2. Testare compliance linee guida
3. Verificare performance (Lighthouse)
4. Testare usabilità (user testing se possibile)

### Dopo Sviluppo:

1. Aggiornare `docs/dashboard-audit-results.md` con correzioni
2. Aggiornare questo documento se aggiunti nuovi file
3. Commit con messaggio descrittivo
4. Push su GitHub

---

## 🎨 Design System Compliance

### Verificare Sempre:

- [ ] Usa solo token da `tokens.css` (non valori hardcoded)
- [ ] Spacing: usa solo spacing tokens
- [ ] Colors: usa solo color tokens
- [ ] Typography: usa solo typography tokens
- [ ] Components: usa solo componenti design system
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] Responsive: Mobile-first approach

### File Design System:

```
assets/css/settings/tokens.css         # ⭐ Tutti i token (colori, spacing, typography)
assets/css/components/dashboard.css     # Componenti dashboard
```

---

## 📊 Metriche da Monitorare

### Performance:

- Core Web Vitals: LCP, FID, CLS
- Lighthouse Score: Performance, Accessibility, Best Practices
- Tempo caricamento dashboard
- Tempo caricamento moduli

### Usabilità:

- Tempo completamento task principali
- Error rate utenti
- Tasso adozione feature
- User satisfaction score

### Baseline (da misurare):

- [ ] Core Web Vitals attuali
- [ ] Lighthouse Score attuale
- [ ] Tempo task utente
- [ ] Error rate attuale

### Target (dopo revisione):

- Core Web Vitals: Miglioramento 20%+
- Lighthouse Score: 90+ in tutte le categorie
- Tempo task: Riduzione 30%
- Error rate: Riduzione 50%

---

## 🔗 Riferimenti Esterni

### Paper Accademici (2019-2024):

- DataLens Project (2024): Automazione e interattività per qualità dati
- Tableau Research (2021): Best practices dashboard design
- PubMed Studies (2019-2024): Integrazione dimensioni multiple
- ERIC Education (2020-2024): Coinvolgimento utenti e co-design

### Documentazione:

- Design System: `docs/architecture/DESIGN-SYSTEM-ACCADEMICO-2025.md`
- Supabase: `supabase/README.md`

---

## 📝 Note Importanti

### ⚠️ Violazioni Critiche Attuali:

1. **12 moduli visibili** (max raccomandato: 5-7) - 🔴 ALTA PRIORITÀ
2. **Mancanza indicatori predittivi** - 🔴 ALTA PRIORITÀ
3. **Nessun drill-down** - 🟡 ALTA PRIORITÀ
4. **Nessun export dati** - 🟡 ALTA PRIORITÀ
5. **Qualità dati non trasparente** - 🟡 ALTA PRIORITÀ

### ✅ Punti di Forza Attuali:

1. Design system consolidato
2. Personalizzazione notifiche (SMS/WhatsApp/Email) - ✅ IMPLEMENTATO
3. Service Worker per cache - ✅ IMPLEMENTATO
4. Lazy loading componenti - ✅ IMPLEMENTATO
5. Ruoli utente (Guest/Pro/Desk) - ✅ IMPLEMENTATO

---

## 🔄 Aggiornamenti Documento

- **Creato**: 2025-01-XX
- **Ultimo aggiornamento**: 2025-01-XX
- **Prossima revisione**: Dopo ogni modifica significativa

**Quando aggiornare**:

- Aggiunta nuovo file dashboard
- Modifica struttura moduli
- Aggiunta nuova feature
- Cambio architettura

---

**Questo documento deve essere consultato PRIMA di ogni modifica alla dashboard.**
