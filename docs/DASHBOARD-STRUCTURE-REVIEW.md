# Rivedere Struttura Dashboard - Focus Analisi
## Analisi Cosa Tenere e Cosa Aggiungere

**Data:** 2025-01-27  
**Strategia:** Analisi-First (100% focus su analisi professionale)

---

## Riepilogo Rimozioni Completate

### ✅ Rimosso Completamente
- **Tab "Formazione"** da DashboardTabs
- **Modulo "education"** da DEFAULT_MODULES
- **ProgressTracking** componente (solo corsi)
- **Statistica "active-courses"** da OverviewStats
- **Riferimenti course** da RecentActivity
- **Riferimenti course** da DashboardHero
- **Riferimenti course** da HelpAssistant
- **activeCourses** da API stats
- **getUserCourseProgress** da API progress (ora solo achievements)

---

## Sezioni Dashboard Attuali

### ✅ DA TENERE (Core Analisi)

1. **Overview** (`/dashboard`)
   - Panoramica generale
   - Statistiche chiave
   - Attività recenti (solo analisi/report)
   - **Valore:** Entry point principale

2. **Analysis** (`/dashboard/analysis`)
   - Indicatori di mercato accademici
   - Analisi real-time
   - **Valore:** Core product, revenue driver

3. **Reports** (`/dashboard/reports`)
   - Report generati
   - PDF customization
   - **Valore:** Output principale, valore per utenti

4. **Requests** (`/dashboard/requests`)
   - Richieste di analisi
   - Status tracking
   - **Valore:** Workflow principale

5. **Utilities** (`/dashboard/utilities`)
   - Calcolatori finanziari
   - Simulatori
   - **Valore:** Strumenti professionali, differenziazione

6. **Settings** (`/dashboard/settings`)
   - Profilo utente
   - Preferenze
   - **Valore:** Essenziale

7. **Admin** (`/dashboard/admin`) - Solo admin
   - Gestione sistema
   - **Valore:** Operazioni amministrative

### ✅ DA TENERE (Supporto)

8. **Notifications** (`/dashboard/notifications`)
   - Notifiche sistema
   - **Valore:** Engagement, retention

9. **Favorites** (`/dashboard/favorites`)
   - Contenuti salvati
   - **Valore:** UX, accesso rapido

10. **Watchlist** (`/dashboard/watchlist`)
    - Asset monitorati
    - Alert personalizzati
    - **Valore:** Core per analisi, molto utile

11. **Widgets** (`/dashboard/widgets`)
    - Dashboard personalizzabile
    - **Valore:** Engagement, personalizzazione

12. **Billing** (`/dashboard/billing`)
    - Pagamenti, crediti, fatture
    - **Valore:** Revenue management

13. **Voting** (`/dashboard/voting`) - Pro only
    - Community proposals
    - **Valore:** Engagement Pro users

### ❌ DA RIMUOVERE

14. **Education** (`/dashboard/education`)
    - Corsi formativi
    - **Rimosso:** Focus 100% su analisi

15. **Brokers** (`/dashboard/brokers`)
    - Redirect a utilities
    - **Rimosso:** Non più utilizzato

### ❓ DA VALUTARE

16. **Activity** (`/dashboard/activity`)
    - Attività dettagliate
    - **Valore:** Potrebbe essere utile per tracking
    - **Decisione:** Tenere ma rimuovere riferimenti a corsi

17. **Print** (`/dashboard/print`)
    - Stampa/download report
    - **Valore:** Potrebbe essere integrato in Reports
    - **Decisione:** Valutare se unificare con Reports

---

## Cosa Aggiungere (Basato su Strategia Analisi-First)

### 1. **Portfolio Management** (Alta Priorità)
- **Path:** `/dashboard/portfolio`
- **Descrizione:** Gestione portafoglio trading
- **Valore:** Core per professionisti
- **Status:** Esiste già (`app/dashboard` non ha portfolio, ma c'è `app/api/portfolio`)

### 2. **Trading Journal** (Alta Priorità)
- **Path:** `/dashboard/trading-journal`
- **Descrizione:** Diario operazioni
- **Valore:** Essenziale per professionisti
- **Status:** Esiste già (`app/api/trading-journal`)

### 3. **Paper Trading** (Media Priorità)
- **Path:** `/dashboard/paper-trading` (o integrato in utilities)
- **Descrizione:** Simulazione trading
- **Valore:** Training senza rischi
- **Status:** Esiste già (`app/api/paper-trading`)

### 4. **Tournaments** (Bassa Priorità)
- **Path:** `/dashboard/tournaments`
- **Descrizione:** Tornei paper trading
- **Valore:** Gamification, engagement
- **Status:** Esiste già (`app/api/tournaments`)

### 5. **Market Data** (Alta Priorità)
- **Path:** `/dashboard/market-data` o integrato in Analysis
- **Descrizione:** Dati di mercato real-time
- **Valore:** Core per analisi
- **Status:** Parzialmente in Analysis

---

## Struttura Dashboard Finale Consigliata

### Tabs Principali (DashboardTabs)
1. **Panoramica** - Overview generale
2. **Analisi** - Core product (indicatori, analisi)
3. **Utilities** - Strumenti finanziari
4. **Impostazioni** - Configurazione

### Sezioni Secondarie (Accessibili da Overview o Menu)
- **Reports** - Report generati
- **Requests** - Richieste analisi
- **Portfolio** - Gestione portafoglio
- **Trading Journal** - Diario operazioni
- **Watchlist** - Asset monitorati
- **Widgets** - Dashboard personalizzabile
- **Notifications** - Notifiche
- **Favorites** - Preferiti
- **Billing** - Pagamenti
- **Voting** - Community (Pro only)
- **Admin** - Amministrazione (Admin only)

### Sezioni da Integrare/Unificare
- **Print** → Integrare in Reports (sub-sezione)
- **Activity** → Integrare in Overview (già presente)

---

## Priorità Implementazione

### Fase 1 (Immediato)
1. ✅ Rimuovere tutti i riferimenti a education
2. ✅ Rimuovere ProgressTracking (solo corsi)
3. ✅ Pulire RecentActivity (rimuovere course types)
4. ✅ Aggiornare DashboardHero (CTA su analisi)

### Fase 2 (Prossimo)
1. Aggiungere Portfolio alla dashboard (se non presente)
2. Aggiungere Trading Journal alla dashboard (se non presente)
3. Unificare Print con Reports

### Fase 3 (Futuro)
1. Migliorare Market Data in Analysis
2. Integrare Paper Trading (se non già in utilities)
3. Valutare Tournaments (gamification)

---

## Metriche da Monitorare

- **Usage per sezione:** Quali sezioni usano di più?
- **Conversion:** Da quale sezione convertono a Pro?
- **Engagement:** Quali sezioni hanno più engagement?
- **Churn:** Da quale sezione partono gli utenti che churnano?

---

**Documento preparato per:** Ristrutturazione dashboard focus analisi  
**Data:** 2025-01-27  
**Versione:** 1.0
