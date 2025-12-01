# Inventario Completo Moduli, Componenti, Drawer, Popup
## Tutto ciò che deve essere creato/completato per Production-Ready

---

## 📦 MODULI UTILITIES PRO (Drawer ProUtilities)

### ✅ Implementati (ma con TODO)
1. **PortfolioManager** ✅
   - [x] UI base completa
   - [ ] TODO: Error handling (riga 55, 63)
   - [ ] TODO: Persistenza Supabase (ora solo state locale)
   - [ ] TODO: API `/api/portfolio` per CRUD
   - [ ] TODO: Real-time price updates
   - [ ] TODO: Grafici performance
   - [ ] TODO: Export PDF/CSV

2. **FinancialCalculator** ✅
   - [x] UI completa
   - [x] Calcoli funzionanti
   - [ ] TODO: Salvataggio calcoli
   - [ ] TODO: Storia calcoli
   - [ ] TODO: Export risultati

3. **AlertSystem** ✅
   - [x] UI base completa
   - [ ] TODO: Error handling (riga 62, 70, 78)
   - [ ] TODO: Migrazione da localStorage a Supabase
   - [ ] TODO: API `/api/alerts` per CRUD
   - [ ] TODO: Integrazione con watchlist
   - [ ] TODO: Notifiche push quando alert trigger

4. **PACSimulator** ✅
   - [x] UI completa
   - [x] Calcoli funzionanti
   - [ ] TODO: Salvataggio simulazioni
   - [ ] TODO: Confronto scenari
   - [ ] TODO: Export PDF

5. **ExpenseTracker** ✅
   - [x] UI completa
   - [x] API `/api/expenses` esistente
   - [ ] TODO: Modal add/edit expense
   - [ ] TODO: Filtri avanzati
   - [ ] TODO: Grafici spese
   - [ ] TODO: Export CSV/PDF

### ❌ Non Implementati (TODO in ProUtilities.tsx)
6. **Download PDF** ❌
   - [ ] Component `DownloadPDFModal`
   - [ ] API `/api/reports/[id]/pdf`
   - [ ] Generazione PDF server-side
   - [ ] Selezione report da lista
   - [ ] Progress indicator

7. **Request Analysis** ❌
   - [ ] Component `RequestAnalysisModal`
   - [ ] Form con validazione
   - [ ] API `/api/dashboard/analysis-requests` (POST)
   - [ ] Selezione asset
   - [ ] Note opzionali
   - [ ] Confirmation dialog

8. **Community Proposals** ⚠️ Parziale
   - [x] Navigazione a `/dashboard/voting`
   - [ ] TODO: Modal per proporre nuovo asset (riga 117 voting page)

---

## 📄 PAGINE DASHBOARD

### ✅ Implementate (Base)
1. **Reports Page** ✅
   - [x] Lista report
   - [x] Search e filtri
   - [ ] TODO: Download PDF button (riga 149) - non funziona
   - [ ] TODO: Modal dettaglio report
   - [ ] TODO: Preview report inline
   - [ ] TODO: Condivisione report

2. **Education/Courses Page** ✅
   - [x] Lista corsi
   - [ ] TODO: Dettaglio corso completo
   - [ ] TODO: Player lezioni
   - [ ] TODO: Progress tracking dettagliato
   - [ ] TODO: Quiz e certificazioni
   - [ ] TODO: Note personali
   - [ ] TODO: Discussioni/forum

3. **Requests Page** ✅
   - [x] Lista richieste
   - [x] Filtri e search
   - [ ] TODO: Modal nuova richiesta (apre ProUtilities ma non funziona)
   - [ ] TODO: Dettaglio richiesta
   - [ ] TODO: Download risultati completati

4. **Voting Page** ✅
   - [x] Lista proposte
   - [x] Votazione funzionante
   - [ ] TODO: Modal proposta nuovo asset (riga 117)
   - [ ] TODO: Dettaglio proposta
   - [ ] TODO: Commenti proposte

5. **Settings Page** ⚠️
   - [ ] TODO: Verificare implementazione completa
   - [ ] TODO: Form profilo utente
   - [ ] TODO: Gestione password
   - [ ] TODO: Preferenze notifiche
   - [ ] TODO: API Keys (Pro)
   - [ ] TODO: Export dati (GDPR)
   - [ ] TODO: Delete account

6. **Activity Page** ✅
   - [x] Lista attività
   - [ ] TODO: Filtri avanzati
   - [ ] TODO: Export attività
   - [ ] TODO: Dettaglio attività

7. **Watchlist Page** ✅
   - [x] Lista watchlist
   - [x] Alert system
   - [ ] TODO: Modal add/edit asset
   - [ ] TODO: Grafici price history
   - [ ] TODO: Notifiche push

---

## 🎓 SEZIONE CORSI (Education) - Dettaglio Completo

### Componenti Necessari
1. **CourseList** ✅ (esistente ma base)
   - [ ] TODO: Card corso con progress bar
   - [ ] TODO: Badge completamento
   - [ ] TODO: Durata stimata
   - [ ] TODO: Difficoltà
   - [ ] TODO: Rating/recensioni

2. **CourseDetail** ❌ (da creare)
   - [ ] Page `/dashboard/education/[courseId]`
   - [ ] Header con info corso
   - [ ] Lista lezioni con progress
   - [ ] Prerequisiti
   - [ ] Obiettivi apprendimento
   - [ ] Materiali scaricabili

3. **LessonPlayer** ❌ (da creare)
   - [ ] Video player o content viewer
   - [ ] Navigation prev/next
   - [ ] Progress tracking
   - [ ] Note personali
   - [ ] Quiz inline
   - [ ] Completion tracking

4. **CourseProgress** ⚠️ (parziale)
   - [x] Progress tracking base
   - [ ] TODO: Grafici progress dettagliati
   - [ ] TODO: Timeline completamento
   - [ ] TODO: Achievement per corsi

5. **QuizSystem** ❌ (da creare)
   - [ ] Component Quiz
   - [ ] Multiple choice
   - [ ] True/False
   - [ ] Scoring
   - [ ] Feedback immediato
   - [ ] Retry logic

6. **Certification** ❌ (da creare)
   - [ ] Generazione certificato
   - [ ] Download PDF certificato
   - [ ] Verifica certificato
   - [ ] Badge system

---

## 📊 SEZIONE REPORT - Dettaglio Completo

### Componenti Necessari
1. **ReportList** ✅ (esistente)
   - [x] Lista base
   - [ ] TODO: Card migliorate con preview
   - [ ] TODO: Categorie/tag
   - [ ] TODO: Sort avanzato
   - [ ] TODO: Pagination

2. **ReportDetail** ❌ (da creare)
   - [ ] Page `/reports/[slug]`
   - [ ] Header con metadata
   - [ ] Content viewer
   - [ ] Grafici interattivi
   - [ ] Tabelle dati
   - [ ] Download options
   - [ ] Condivisione

3. **ReportPreview** ❌ (da creare)
   - [ ] Modal/Drawer preview
   - [ ] Thumbnail generation
   - [ ] Quick view
   - [ ] Actions (download, share, favorite)

4. **ReportDownload** ❌ (da creare)
   - [ ] Modal selezione formato
   - [ ] PDF generation
   - [ ] Excel/CSV export
   - [ ] Progress indicator
   - [ ] Download manager

5. **ReportSharing** ❌ (da creare)
   - [ ] Modal condivisione
   - [ ] Link generation
   - [ ] Social sharing
   - [ ] Email sharing
   - [ ] Permissions

---

## 🔧 MODAL/DRAWER/POPUP Necessari

### Modal
1. **RequestAnalysisModal** ❌
   - Form asset selection
   - Note field
   - Priority selection
   - Confirmation
   - Success feedback

2. **ProposeAssetModal** ❌
   - Form asset proposal
   - Description field
   - Validation
   - Success feedback

3. **DownloadPDFModal** ❌
   - Report selection
   - Format options
   - Customization
   - Progress
   - Download link

4. **ConfirmDialog** ⚠️ (da verificare)
   - Generic confirmation
   - Customizable message
   - Actions

5. **EditExpenseModal** ❌
   - Form edit expense
   - Validation
   - Delete option

6. **AddPositionModal** ❌
   - Form add position
   - Asset search
   - Price validation
   - Real-time price fetch

7. **EditAlertModal** ❌
   - Form edit alert
   - Condition editor
   - Test alert

8. **SettingsModal** ⚠️
   - Various settings forms
   - Tab navigation
   - Save/cancel

### Drawer
1. **ProUtilities Drawer** ✅ (esistente)
   - [x] Base funzionante
   - [ ] TODO: Animazioni migliorate
   - [ ] TODO: Keyboard navigation
   - [ ] TODO: History navigation

2. **NotificationDrawer** ⚠️ (da verificare)
   - Lista notifiche
   - Mark as read
   - Actions

3. **SearchDrawer** ⚠️ (GlobalSearch esiste)
   - [ ] TODO: Migliorare UI
   - [ ] TODO: Recent searches
   - [ ] TODO: Filters

### Popup
1. **Tooltip** ✅ (esistente)
2. **Toast** ✅ (esistente)
3. **ContextualHelp** ✅ (esistente)
4. **AchievementNotification** ✅ (esistente)

---

## 🗄️ DATABASE SCHEMA - Tabelle Mancanti

1. **trading_journal** ❌
   - Schema proposto in PROPOSED-SERVICES.md
   - [ ] Creare migration
   - [ ] RLS policies
   - [ ] Indexes

2. **portfolio_positions** ❌
   - [ ] Schema per PortfolioManager
   - [ ] RLS policies
   - [ ] Indexes

3. **user_alerts** ❌
   - [ ] Schema per AlertSystem
   - [ ] RLS policies
   - [ ] Indexes

4. **course_progress** ⚠️
   - [ ] Verificare se esiste
   - [ ] Completare se mancante

5. **quiz_results** ❌
   - [ ] Schema per QuizSystem
   - [ ] RLS policies

6. **certifications** ❌
   - [ ] Schema per certificazioni
   - [ ] RLS policies

---

## 🔌 API ENDPOINTS Mancanti

1. **Portfolio API** ❌
   - `GET /api/portfolio` - Lista posizioni
   - `POST /api/portfolio` - Aggiungi posizione
   - `PATCH /api/portfolio/[id]` - Modifica posizione
   - `DELETE /api/portfolio/[id]` - Rimuovi posizione
   - `GET /api/portfolio/stats` - Statistiche

2. **Alerts API** ❌
   - `GET /api/alerts` - Lista alert
   - `POST /api/alerts` - Crea alert
   - `PATCH /api/alerts/[id]` - Modifica alert
   - `DELETE /api/alerts/[id]` - Rimuovi alert
   - `POST /api/alerts/[id]/test` - Test alert

3. **PDF Generation API** ❌
   - `GET /api/reports/[id]/pdf` - Genera PDF
   - `POST /api/reports/export` - Export multipli

4. **Analysis Request API** ⚠️
   - `GET /api/dashboard/analysis-requests` ✅ (esiste)
   - `POST /api/dashboard/analysis-requests` ❌ (manca)
   - `GET /api/dashboard/analysis-requests/[id]` ❌ (manca)
   - `GET /api/dashboard/analysis-requests/[id]/results` ❌ (manca)

5. **Voting API** ⚠️
   - `GET /api/dashboard/voting` ✅ (esiste)
   - `POST /api/dashboard/voting/vote` ✅ (esiste)
   - `POST /api/dashboard/voting/propose` ❌ (manca)

6. **Courses API** ⚠️
   - `GET /api/dashboard/courses` ✅ (esiste)
   - `GET /api/dashboard/courses/[id]` ❌ (manca)
   - `GET /api/dashboard/courses/[id]/lessons` ❌ (manca)
   - `POST /api/dashboard/courses/[id]/complete` ❌ (manca)
   - `POST /api/dashboard/courses/[id]/quiz` ❌ (manca)

7. **Reports API** ⚠️
   - `GET /api/dashboard/reports` ✅ (esiste)
   - `GET /api/reports/[slug]` ❌ (manca)
   - `GET /api/reports/[id]/pdf` ❌ (manca)

8. **Settings API** ❌
   - `GET /api/settings` - Get settings
   - `PATCH /api/settings` - Update settings
   - `POST /api/settings/password` - Change password
   - `POST /api/settings/export-data` - Export data (GDPR)
   - `DELETE /api/settings/account` - Delete account

---

## 🎨 UI COMPONENTS Mancanti

1. **Modal Component** ❌
   - Base modal reusable
   - Backdrop
   - Close button
   - Focus trap
   - Keyboard navigation

2. **Dialog Component** ❌
   - Confirmation dialog
   - Alert dialog
   - Form dialog

3. **Form Components** ⚠️
   - [ ] Input con validazione
   - [ ] Select avanzato
   - [ ] Date picker
   - [ ] File upload
   - [ ] Rich text editor (per note)

4. **Data Table** ❌
   - Sortable columns
   - Pagination
   - Filters
   - Export

5. **Chart Components** ❌
   - Line chart
   - Bar chart
   - Pie chart
   - Area chart
   - Candlestick chart

6. **Video Player** ❌
   - Per lezioni
   - Progress tracking
   - Speed control
   - Subtitles

---

## 📝 LOGICHE INTERNE Mancanti

### PortfolioManager
- [ ] Calcolo P&L real-time
- [ ] Aggiornamento prezzi automatico
- [ ] Notifiche variazioni significative
- [ ] Grafici performance
- [ ] Export portfolio

### AlertSystem
- [ ] Check alert conditions (cron job)
- [ ] Trigger notifications
- [ ] Alert history
- [ ] Alert templates

### FinancialCalculator
- [ ] Salvataggio calcoli
- [ ] Storia calcoli
- [ ] Confronto scenari
- [ ] Export risultati

### PACSimulator
- [ ] Salvataggio simulazioni
- [ ] Confronto scenari
- [ ] Export PDF

### ExpenseTracker
- [ ] Budget management
- [ ] Alert superamento budget
- [ ] Grafici spese
- [ ] Export CSV/PDF

### Trading Journal (da implementare)
- [ ] Form registrazione trade
- [ ] Calcolo P&L automatico
- [ ] Statistiche performance
- [ ] Grafici equity curve
- [ ] Export PDF/Excel

---

## ✅ CHECKLIST PRODUCTION-READY

### Corsi (Education)
- [ ] Course detail page completa
- [ ] Lesson player funzionante
- [ ] Progress tracking dettagliato
- [ ] Quiz system completo
- [ ] Certificazioni
- [ ] Materiali scaricabili
- [ ] Note personali
- [ ] Discussioni/forum

### Report
- [ ] Report detail page
- [ ] PDF generation funzionante
- [ ] Download manager
- [ ] Preview modal
- [ ] Sharing funzionante
- [ ] Grafici interattivi
- [ ] Export multipli formati

### Utilities Pro
- [ ] Tutti i TODO risolti
- [ ] Error handling completo
- [ ] Persistenza Supabase
- [ ] Real-time updates
- [ ] Export funzionanti

### Modals/Drawers
- [ ] Tutti i modal creati
- [ ] Focus management
- [ ] Keyboard navigation
- [ ] Accessibility completa

### API
- [ ] Tutti gli endpoint implementati
- [ ] Error handling
- [ ] Rate limiting
- [ ] Validation
- [ ] Documentation

### Database
- [ ] Tutte le tabelle create
- [ ] RLS policies
- [ ] Indexes ottimizzati
- [ ] Migrations testate

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### P0 (Critical - Prima del Launch)
1. Error handling in tutti i moduli
2. Modal/Dialog base component
3. Request Analysis form completo
4. Download PDF funzionante
5. Propose Asset modal
6. Settings page completa

### P1 (High - Pre-Launch)
7. Course detail e lesson player
8. Report detail page
9. Trading Journal MVP
10. Portfolio API completa
11. Alerts API completa

### P2 (Medium - Post-Launch)
12. Quiz system
13. Certificazioni
14. Grafici avanzati
15. Export multipli formati
16. Sharing avanzato

---

**TOTALE COMPONENTI DA CREARE/COMPLETARE: ~50+**

