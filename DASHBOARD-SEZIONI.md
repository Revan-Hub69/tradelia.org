# 📊 Elenco Sezioni Dashboard Tradelia

**Data**: 2025-01-XX  
**Totale Sezioni**: 11 moduli

---

## ✅ Sezioni Dashboard (Ordine di Visualizzazione)

**Totale Sezioni**: 13 moduli (11 pubblici + 2 speciali)

### 1. **Panoramica** (`overview`)

- **ID Modulo**: `overview`
- **File**: `assets/js/dashboard/overview.js`
- **Descrizione**: Statistiche, attività recente e accesso rapido
- **Stato**: ✅ Completo
- **Icona**: Grid/Chart
- **Container**: `#overview-container`

---

### 2. **Report Ufficiali** (`reports`)

- **ID Modulo**: `reports`
- **File**: `assets/js/dashboard/reports.js` / `reports.ts`
- **Descrizione**: Consulta i report pubblici e le analisi disponibili
- **Stato**: ✅ Completo
- **Icona**: Document
- **Container**: `#reports-container`
- **Features**: Ricerca, filtri, statistiche

---

### 3. **Framework Documentation** (`frameworks`)

- **ID Modulo**: `frameworks`
- **File**: `assets/js/dashboard/frameworks.js`
- **Descrizione**: SRD, MTB, PAC e metodologie di analisi
- **Stato**: ✅ Completo
- **Icona**: Book
- **Container**: `#frameworks-container`

---

### 4. **Storico Richieste** (`requests-history`)

- **ID Modulo**: `requests-history`
- **File**: `assets/js/dashboard/requests-history.js`
- **Descrizione**: Visualizza le tue richieste di analisi on-demand
- **Stato**: ✅ Completo
- **Icona**: Activity/Chart
- **Container**: `#requests-history-container`
- **Integrazione**: Supabase `analysis_requests` table

---

### 5. **Notifiche** (`notifications`)

- **ID Modulo**: `notifications`
- **File**: `assets/js/dashboard/notifications.js`
- **Descrizione**: Notifiche di sistema e aggiornamenti
- **Stato**: ✅ Completo
- **Icona**: Bell
- **Container**: `#notifications-container`
- **Integrazione**: Supabase `notifications` table (real-time)

---

### 6. **Impostazioni** (`settings`)

- **ID Modulo**: `settings`
- **File**: `assets/js/dashboard/settings.js`
- **Descrizione**: Preferenze utente e configurazioni
- **Stato**: ✅ Completo
- **Icona**: Settings/Gear
- **Container**: `#settings-container`
- **Features**: Export dati, preferenze, tema

---

### 7. **Risorse & Supporto** (`resources`)

- **ID Modulo**: `resources`
- **File**: `assets/js/dashboard/resources.js`
- **Descrizione**: FAQ, guide e contatti
- **Stato**: ✅ Completo
- **Icona**: Book with plus
- **Container**: `#resources-container`

---

### 8. **Percorsi Formativi** (`education`)

- **ID Modulo**: `education`
- **File**: `assets/js/dashboard/education.js`
- **Descrizione**: Tutorial e corsi educativi
- **Stato**: ⏳ Placeholder (link esterno a `/tutorials.html`)
- **Icona**: Graduation cap
- **Container**: `#education-container`
- **Note**: Da implementare percorsi formativi completi

---

### 9. **Gestione Accesso** (`access`)

- **ID Modulo**: `access`
- **File**: `assets/js/dashboard/access.js`
- **Descrizione**: Token, permessi e account
- **Stato**: ✅ Completo
- **Icona**: Lock
- **Container**: `#access-container`
- **Features**: Validazione token, info account, permessi

---

### 10. **Analisi On-Demand** (`on-demand`)

- **ID Modulo**: `on-demand`
- **File**: `assets/js/dashboard/on-demand.js`
- **Descrizione**: Richiedi analisi personalizzate
- **Stato**: ✅ Completo
- **Icona**: Document with plus
- **Container**: `#on-demand-container`
- **Features**: Form richiesta analisi, validazione token
- **Integrazione**: API `/api/request-analysis.js`

---

### 11. **Community Proposals** (`community`)

- **ID Modulo**: `community`
- **File**: `assets/js/dashboard/community.js`
- **Descrizione**: Proponi e vota analisi (solo Pro users)
- **Stato**: ⏳ Parziale (backend completo, UI da completare)
- **Icona**: Users
- **Container**: `#community-container`
- **Permessi**: Solo utenti Pro (vedi memoria ID: 11237222)
- **Integrazione**:
  - Supabase `asset_proposals` table
  - Supabase `asset_votes` table
  - API `/api/vote.js`

---

### 12. **Broker Regolamentati** (`brokers`)

- **ID Modulo**: `brokers`
- **File**: `assets/js/dashboard/brokers.js`
- **Descrizione**: Lista broker verificati e regolamentati
- **Stato**: ✅ Completo
- **Icona**: Dollar sign
- **Container**: `#brokers-container`
- **Features**: Lista broker con link alle pagine dedicate
- **Link esterno**: `/brokers.html` (pagina completa)

---

### 13. **Amministrazione** (`admin`)

- **ID Modulo**: `admin`
- **File**: `assets/js/dashboard/admin.js`
- **Descrizione**: Gestione utenti, token e report (solo admin)
- **Stato**: ✅ Completo
- **Icona**: Settings/Gear
- **Container**: `#admin-container`
- **Permessi**: Solo amministratori (visibilità controllata)
- **Features**:
  - Link a gestione utenti (`/admin/users.html`)
  - Link a gestione token (`/admin/tokens.html`)
  - Link a gestione report (`/admin/reports.html`)
  - Link a richieste analisi (`/admin/requests.html`)
  - Link a portale admin completo (`/admin/index.html`)
- **Controllo visibilità**: Card nascosta se utente non è admin

---

## 📋 Riepilogo Stato

| Sezione                 | Stato          | Priorità | Note                         |
| ----------------------- | -------------- | -------- | ---------------------------- |
| Panoramica              | ✅ Completo    | -        | -                            |
| Report Ufficiali        | ✅ Completo    | -        | -                            |
| Framework Documentation | ✅ Completo    | -        | -                            |
| Storico Richieste       | ✅ Completo    | -        | -                            |
| Notifiche               | ✅ Completo    | -        | -                            |
| Impostazioni            | ✅ Completo    | -        | -                            |
| Risorse & Supporto      | ✅ Completo    | -        | -                            |
| Percorsi Formativi      | ⏳ Placeholder | 🟡 Media | Link esterno funziona        |
| Gestione Accesso        | ✅ Completo    | -        | -                            |
| Analisi On-Demand       | ✅ Completo    | -        | -                            |
| Community Proposals     | ⏳ Parziale    | 🟡 Media | Backend OK, UI da completare |
| Broker Regolamentati    | ✅ Completo    | -        | Nuovo                        |
| Amministrazione         | ✅ Completo    | -        | Nuovo (solo admin)           |

**Totale**: 13 sezioni

- ✅ **Completate**: 11/13 (85%)
- ⏳ **Da completare**: 2/13 (15%)
- 🔒 **Solo Admin**: 1/13 (Amministrazione)

---

## 🔧 Componenti Aggiuntivi

### Account Banner

- **File**: `assets/js/dashboard/account-banner.js`
- **Descrizione**: Banner che mostra stato account, piano, utilizzo
- **Container**: `#account-banner-slot`
- **Stato**: ✅ Completo

### Toast Notifications

- **File**: `assets/js/dashboard/toast.js`
- **Descrizione**: Sistema notifiche toast per feedback utente
- **Container**: `#dashboard-toast`
- **Stato**: ✅ Completo

### Autenticazione

- **File**: `assets/js/dashboard/auth.js`
- **Descrizione**: Gestione autenticazione e sessioni
- **Stato**: ✅ Completo

### Permessi

- **File**: `assets/js/dashboard/permissions.js`
- **Descrizione**: Gestione permessi e ruoli utente
- **Stato**: ✅ Completo

### Supabase Client

- **File**: `assets/js/dashboard/supabase-client.js`
- **Descrizione**: Client Supabase singleton per tutte le chiamate
- **Stato**: ✅ Completo

---

## 📁 Struttura File

```
assets/js/dashboard/
├── index.js              ✅ Module loader principale
├── app.js                ✅ Entry point applicazione
├── auth.js               ✅ Autenticazione
├── supabase-client.js    ✅ Client Supabase
├── toast.js              ✅ Notifiche toast
├── permissions.js        ✅ Gestione permessi
├── account-banner.js     ✅ Banner account
│
├── overview.js           ✅ Panoramica
├── reports.js            ✅ Report ufficiali
├── frameworks.js         ✅ Framework documentation
├── requests-history.js   ✅ Storico richieste
├── notifications.js      ✅ Notifiche
├── settings.js           ✅ Impostazioni
├── resources.js          ✅ Risorse & supporto
├── access.js             ✅ Gestione accesso
├── on-demand.js          ✅ Analisi on-demand
├── education.js          ⏳ Percorsi formativi (placeholder)
├── community.js          ⏳ Community proposals (parziale)
├── brokers.js            ✅ Broker regolamentati
└── admin.js              ✅ Amministrazione (solo admin)
```

---

## 🎯 Prossimi Passi

1. **Completare Education Module**
   - Implementare percorsi formativi
   - Progress tracking
   - Integrazione con `report/tutorial/`

2. **Completare Community Module**
   - UI lista proposals
   - UI votazioni
   - Form creazione proposal

---

**Ultimo aggiornamento**: 2025-01-XX
