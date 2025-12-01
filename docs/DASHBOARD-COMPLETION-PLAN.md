# Dashboard Completion Plan
## Completamento Funzionalità Dashboard Prima di Testing

**Data**: 2025-01-27  
**Priorità**: ALTA - Completare tutte le funzionalità prima di testing/ottimizzazioni

---

## 📋 STATO ATTUALE

### ✅ Funzionalità Complete
1. **Portfolio Manager** - CRUD completo, API, export
2. **Alert System** - CRUD completo, API, export
3. **Trading Journal** - Schema, API, UI completa
4. **Course System** - Completo (detail, lessons, quizzes, progress)
5. **Form Components** - Tutti i componenti base
6. **Data Visualization** - Charts completi
7. **Settings** - Base funzionante
8. **Watchlist** - Base funzionante

### ⚠️ Funzionalità Parziali (da completare)

#### 1. Reports Page (`/dashboard/reports`)
- [x] Lista report
- [x] Search e filtri
- [ ] **TODO**: Download PDF button funzionante
- [ ] **TODO**: Modal dettaglio report
- [ ] **TODO**: Preview report inline
- [ ] **TODO**: Condivisione report

#### 2. Requests Page (`/dashboard/requests`)
- [x] Lista richieste
- [x] Filtri e search
- [ ] **TODO**: Modal nuova richiesta (funzionale)
- [ ] **TODO**: Dettaglio richiesta completo
- [ ] **TODO**: Download risultati completati

#### 3. Voting Page (`/dashboard/voting`)
- [x] Lista proposte
- [x] Votazione funzionante
- [ ] **TODO**: Modal proposta nuovo asset
- [ ] **TODO**: Dettaglio proposta
- [ ] **TODO**: Commenti/discussioni

#### 4. Widgets Page (`/dashboard/widgets`)
- [ ] **TODO**: Sistema widget completo
- [ ] **TODO**: Drag & drop layout
- [ ] **TODO**: Personalizzazione widget
- [ ] **TODO**: Salvataggio layout

#### 5. Pro Utilities - Funzionalità Mancanti
- [ ] **TODO**: Download PDF Modal (per report)
- [ ] **TODO**: Request Analysis Modal (funzionale)
- [ ] **TODO**: Community Proposals Modal

#### 6. Utilities Pro - Funzionalità Parziali
- [x] Portfolio Manager ✅
- [x] Alert System ✅
- [x] Trading Journal ✅
- [ ] **TODO**: Financial Calculator - Salvataggio calcoli
- [ ] **TODO**: PAC Simulator - Salvataggio simulazioni
- [ ] **TODO**: Expense Tracker - Modal add/edit, grafici

---

## 🎯 PIANO DI COMPLETAMENTO

### Fase 1: Reports System (Priorità ALTA)
**Obiettivo**: Completare funzionalità report

1. **Download PDF Funzionale**
   - Fix button download PDF in reports page
   - Integrazione con API `/api/reports/[id]/export`
   - Progress indicator
   - Error handling

2. **Modal Dettaglio Report**
   - Component `ReportDetailModal`
   - Preview completo report
   - Download options (PDF, Excel, CSV)
   - Condivisione link

3. **Preview Inline**
   - Preview report senza aprire modal
   - Expand/collapse sections
   - Print-friendly view

### Fase 2: Requests System (Priorità ALTA)
**Obiettivo**: Completare sistema richieste analisi

1. **Modal Nuova Richiesta**
   - Component `RequestAnalysisModal`
   - Form con validazione Zod
   - Selezione asset (autocomplete)
   - Note opzionali
   - Priority selection
   - Submit e feedback

2. **Dettaglio Richiesta**
   - Page `/dashboard/requests/[id]`
   - Status tracking
   - Timeline richiesta
   - Download risultati (se completata)

### Fase 3: Voting System (Priorità MEDIA)
**Obiettivo**: Completare sistema votazioni community

1. **Modal Proposta Asset**
   - Component `ProposeAssetModal`
   - Form con validazione
   - Asset symbol/name
   - Description
   - Submit e feedback

2. **Dettaglio Proposta**
   - Page `/dashboard/voting/[id]`
   - Info proposta completa
   - Votazione inline
   - Commenti (opzionale)

### Fase 4: Widgets System (Priorità MEDIA)
**Obiettivo**: Sistema widget personalizzabile

1. **Widget Components**
   - Portfolio widget
   - Watchlist widget
   - Recent activity widget
   - Stats widget

2. **Layout System**
   - Drag & drop (react-grid-layout o simile)
   - Salvataggio layout in Supabase
   - Reset layout

### Fase 5: Utilities Completion (Priorità MEDIA)
**Obiettivo**: Completare utilities parziali

1. **Financial Calculator**
   - Salvataggio calcoli in Supabase
   - Storia calcoli
   - Export risultati

2. **PAC Simulator**
   - Salvataggio simulazioni
   - Confronto scenari
   - Export PDF

3. **Expense Tracker**
   - Modal add/edit expense
   - Filtri avanzati
   - Grafici spese (usando chart components)
   - Export CSV/PDF

---

## 📝 CHECKLIST COMPLETAMENTO

### Reports System
- [ ] Download PDF button funzionante
- [ ] Modal dettaglio report
- [ ] Preview inline report
- [ ] Condivisione report

### Requests System
- [ ] Modal nuova richiesta funzionale
- [ ] Dettaglio richiesta completo
- [ ] Download risultati

### Voting System
- [ ] Modal proposta asset
- [ ] Dettaglio proposta
- [ ] Commenti (opzionale)

### Widgets System
- [ ] Widget components base
- [ ] Drag & drop layout
- [ ] Salvataggio layout

### Utilities Completion
- [ ] Financial Calculator - salvataggio
- [ ] PAC Simulator - salvataggio
- [ ] Expense Tracker - modal, grafici, export

---

## 🚀 ORDINE DI IMPLEMENTAZIONE

1. **Reports System** (Fase 1) - Priorità ALTA
2. **Requests System** (Fase 2) - Priorità ALTA
3. **Voting System** (Fase 3) - Priorità MEDIA
4. **Widgets System** (Fase 4) - Priorità MEDIA
5. **Utilities Completion** (Fase 5) - Priorità MEDIA

---

**Nota**: Dopo completamento di tutte le funzionalità dashboard, procedere con:
- Testing (Steps 21-30)
- Performance Optimization (Steps 16-20)
- Security Audit (Steps 11-15)

