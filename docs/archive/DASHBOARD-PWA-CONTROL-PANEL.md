# Dashboard PWA - Control Panel Design
## Best Practice Accademica 2024-25

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (Fixed)                                          │
│ [Tradelia AI] [Pass Status] [Admin] [PWA] [Logout]     │
├──────────┬──────────────────────────────────────────────┤
│ NAV      │ MAIN CONTENT AREA                            │
│ RAIL     │                                               │
│          │ ┌─────────────────────────────────────────┐ │
│ [📊]     │ │ PANEL: Report Ufficiali                  │ │
│ Report   │ │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐        │ │
│          │ │ │Card │ │Card │ │Card │ │Card │        │ │
│ [🎓]     │ │ └─────┘ └─────┘ └─────┘ └─────┘        │ │
│ Educaz.  │ │ [Search] [Filters] [Sort]                │ │
│          │ └─────────────────────────────────────────┘ │
│ [🔑]     │                                               │
│ Accesso  │ ┌─────────────────────────────────────────┐ │
│          │ │ PANEL: Gestione Accesso                  │ │
│ [📋]     │ │ [Pass Status Card] [Token Actions]      │ │
│ On-demand│ └─────────────────────────────────────────┘ │
│          │                                               │
│ [💬]     │ ┌─────────────────────────────────────────┐ │
│ Community│ │ PANEL: Community Proposals (Pro/Admin)   │ │
│          │ └─────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────┘
```

### Sezioni Modulari

#### 1. Navigation Rail (Left Sidebar)
- **Desktop**: Fixed sidebar 240px, icons + labels
- **Mobile**: Bottom tab bar, icons only
- **Sections**:
  - 📊 Report Ufficiali (default)
  - 🎓 Percorsi Formativi
  - 🔑 Gestione Accesso
  - 📋 Analisi On-Demand
  - 💬 Community Proposals (solo Pro/Admin)

#### 2. Panel: Report Ufficiali
- **Layout**: Grid responsive (3 cols desktop, 1 mobile)
- **Cards**: Ticker, Company, Framework, Date, Download
- **Actions**: Search, Filter by Framework, Sort
- **KPI**: Count badge in header

#### 3. Panel: Percorsi Formativi
- **Layout**: List/Grid of course cards
- **Cards**: Title, Progress, Duration, CTA
- **Actions**: Start/Resume, View Materials

#### 4. Panel: Gestione Accesso
- **Status Card**: Pass attivo, scadenza, ruolo
- **Actions**: Rigenera token, Revoca, Estendi
- **History**: Lista token emessi (solo admin)

#### 5. Panel: Analisi On-Demand
- **Request Form**: Inline, non modale
- **Billing Toggle**: Checkbox "Attiva fatturazione"
- **B2C Form**: Expand quando toggle attivo
- **B2B Form**: Expand quando toggle attivo
- **Request History**: Lista richieste con status

#### 6. Panel: Community Proposals
- **Visibility**: Solo Pro/Admin
- **List**: Proposte con voti, status
- **Actions**: Vota, Commenta, Approva (admin)

### Responsive Breakpoints

- **Mobile** (< 768px): Bottom tab bar, single column panels
- **Tablet** (768-1024px): Collapsible sidebar, 2-column grids
- **Desktop** (> 1024px): Fixed sidebar, 3-column grids

### Componenti Riutilizzabili

1. **Panel Container**: Wrapper con header, actions, content
2. **Card Component**: Base per Report, Course, Token, etc.
3. **Status Badge**: Pass attivo, scaduto, pending
4. **Action Button**: Primary, Secondary, Danger variants
5. **Form Inline**: Expandable sections, no modals

### State Management

- **Active Section**: URL hash o state (es. `#reports`, `#education`)
- **Token State**: localStorage + API validation
- **Panel State**: Collapsed/Expanded per mobile
- **Form State**: Dirty tracking, validation

### PWA Considerations

- **Offline**: Cache panel templates, show cached data
- **Install Prompt**: Banner in header quando disponibile
- **Update Check**: Badge su nav rail quando update disponibile
- **Push Notifications**: Badge count su Community/On-demand

