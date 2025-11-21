# 📊 Analisi Completa: Moduli e Funzionalità Dashboard

**Data**: 2025-01-XX  
**Stato**: 🟡 IN ANALISI

---

## 📋 MODULI DASHBOARD - Stato Attuale

### ✅ Moduli Implementati (7/11)

| Modulo               | File JS                  | Panel HTML                  | Stato       | Funzionalità                  |
| -------------------- | ------------------------ | --------------------------- | ----------- | ----------------------------- |
| **Overview**         | `overview.js` ✅         | `panel-overview` ✅         | ✅ Completo | Statistiche, attività recente |
| **Reports**          | `reports.js` ✅          | `panel-reports` ✅          | ✅ Completo | Lista report, ricerca, filtri |
| **Frameworks**       | `frameworks.js` ✅       | `panel-frameworks` ✅       | ✅ Completo | Documentazione SRD, MTB, PAC  |
| **Requests History** | `requests-history.js` ✅ | `panel-requests-history` ✅ | ✅ Completo | Storico richieste, Supabase   |
| **Notifications**    | `notifications.js` ✅    | `panel-notifications` ✅    | ✅ Completo | Notifiche sistema, Supabase   |
| **Settings**         | `settings.js` ✅         | `panel-settings` ✅         | ✅ Completo | Preferenze, export dati       |
| **Resources**        | `resources.js` ✅        | `panel-resources` ✅        | ✅ Completo | FAQ, guide, supporto          |

### ❌ Moduli Mancanti (4/11)

| Modulo        | File JS | Panel HTML | Priorità | Note                              |
| ------------- | ------- | ---------- | -------- | --------------------------------- |
| **Education** | ❌      | ❌         | 🟡 Media | Percorsi formativi (da fare dopo) |
| **Access**    | ❌      | ❌         | 🔴 Alta  | Gestione accesso/token            |
| **On-Demand** | ❌      | ❌         | 🔴 Alta  | Form richiesta analisi            |
| **Community** | ❌      | ❌         | 🟢 Bassa | Community proposals (solo Pro)    |

---

## 🔐 SISTEMA AUTENTICAZIONE - Analisi

### Situazione Attuale

**Sistema Token-Based:**

- Token salvato in `localStorage.getItem('tradelia-access-token-v1')`
- Validazione via `/api/validate-dashboard-token.js`
- Token contiene: email, planRole, validUntil, userId, etc.
- Pagina `/accesso.html` per login/registrazione

**Problemi Identificati:**

1. ❌ **Nessun header/navbar** con info utente
2. ❌ **Nessun logout** nella dashboard
3. ❌ **Nessuna validazione token** all'apertura dashboard
4. ❌ **Nessun redirect** se token scaduto/invalido
5. ❌ **Nessuna gestione session** (token sempre in localStorage)

---

## 🎯 FUNZIONALITÀ MANCANTI

### 1. **Autenticazione & Session Management** 🔴 CRITICO

**Mancante:**

- [ ] Validazione token all'apertura dashboard
- [ ] Header/Navbar con info utente (email, piano, logout)
- [ ] Logout button e funzionalità
- [ ] Redirect a `/accesso.html` se token mancante/invalido
- [ ] Refresh token automatico (se scaduto)
- [ ] Gestione session timeout

**File da creare:**

- `assets/js/dashboard/auth.js` - Gestione autenticazione
- `assets/js/dashboard/header.js` - Header con user info
- Modificare `app.js` per validazione iniziale

---

### 2. **Modulo Access** 🔴 ALTA PRIORITÀ

**Funzionalità necessarie:**

- [ ] Mostra info token corrente
  - Email associata
  - Piano/Ruolo (Guest, Pro, Desk)
  - Scadenza token
  - Giorni rimanenti
- [ ] Link a `/accesso.html` per gestione completa
- [ ] Rinnovo token (se possibile)
- [ ] Logout diretto

**File da creare:**

- `assets/js/dashboard/access.js`
- Panel HTML `panel-access` in `dashboard.html`

---

### 3. **Modulo On-Demand** 🔴 ALTA PRIORITÀ

**Funzionalità necessarie:**

- [ ] Form richiesta analisi
  - Ticker/Asset (obbligatorio)
  - Tipo analisi (opzionale)
  - Dettagli/Brief (opzionale)
- [ ] Validazione token prima di invio
- [ ] Invio a `/api/request-analysis`
- [ ] Feedback successo/errore
- [ ] Link a Requests History dopo invio

**File da creare:**

- `assets/js/dashboard/on-demand.js`
- Panel HTML `panel-on-demand` in `dashboard.html`

**API esistente:**

- ✅ `/api/request-analysis.js` già implementato
- Richiede: `dashboardToken`, `tipo`, `dettagli`, etc.

---

### 4. **Modulo Community** 🟢 BASSA PRIORITÀ

**Funzionalità necessarie:**

- [ ] Lista proposals community
- [ ] Sistema votazione (solo Pro users)
- [ ] Integrazione Supabase (`asset_proposals`, `asset_votes`)
- [ ] Filtri e ricerca

**Nota**: Secondo memoria, solo Pro users possono votare.

**File da creare:**

- `assets/js/dashboard/community.js`
- Panel HTML `panel-community` in `dashboard.html`

**Logica esistente:**

- ✅ Logica in `user/assets/js/app.js` (da verificare se riutilizzabile)

---

### 5. **Modulo Education** 🟡 MEDIA PRIORITÀ (DA FARE DOPO)

**Nota**: L'utente ha detto "lo vediamo dopo" - quindi placeholder per ora.

**File da creare:**

- `assets/js/dashboard/education.js` (placeholder)
- Panel HTML `panel-education` in `dashboard.html` (placeholder)

---

## 🏗️ ARCHITETTURA LOGIN/LOGOUT

### Opzione A: Token-Based (Attuale) ✅ RACCOMANDATO

**Come funziona:**

```
1. Utente va su /accesso.html
2. Login/Registrazione → Token generato
3. Token salvato in localStorage
4. Dashboard legge token da localStorage
5. Validazione token via API
6. Logout = rimuove token + redirect a /accesso.html
```

**Vantaggi:**

- ✅ Sistema già funzionante
- ✅ Nessuna migrazione necessaria
- ✅ Semplice da mantenere

**Implementazione:**

```javascript
// assets/js/dashboard/auth.js
export async function validateToken() {
  const token = localStorage.getItem("tradelia-access-token-v1");
  if (!token) {
    redirectToAccess();
    return null;
  }

  const response = await fetch("/api/validate-dashboard-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();
  if (!data.ok) {
    redirectToAccess();
    return null;
  }

  return data; // { email, planRole, validUntil, daysLeft, etc. }
}

export function logout() {
  localStorage.removeItem("tradelia-access-token-v1");
  window.location.href = "/accesso.html?reason=logout";
}
```

---

### Opzione B: Supabase Auth (Complesso)

**Come funzionerebbe:**

- Supabase Auth per login/signup
- Session management automatico
- Refresh token automatico
- **Svantaggi**: Migrazione complessa (8-12 ore)

**Raccomandazione**: Mantenere token-based per ora.

---

## 📐 HEADER/NAVBAR - Design

### Componente Header Dashboard

**Elementi necessari:**

```
┌─────────────────────────────────────────────────┐
│ [Logo] Tradelia AI    [User Info] [Logout]      │
└─────────────────────────────────────────────────┘
```

**User Info mostra:**

- Email utente
- Badge piano (Guest/Pro/Desk)
- Scadenza token (se disponibile)

**Posizionamento:**

- Header fisso in alto
- Visibile in tutti i moduli
- Responsive (mobile-friendly)

**File da creare:**

- `assets/js/dashboard/header.js`
- CSS in `assets/css/components/dashboard.css`

---

## 📋 CHECKLIST IMPLEMENTAZIONE

### Fase 1: Autenticazione (PRIORITÀ ALTA)

- [ ] Creare `auth.js` con validazione token
- [ ] Creare `header.js` con user info e logout
- [ ] Integrare validazione in `app.js` (all'avvio)
- [ ] Aggiungere header HTML in `dashboard.html`
- [ ] Test logout e redirect

### Fase 2: Moduli Mancanti (PRIORITÀ ALTA)

- [ ] **Access**: Info token + link gestione
- [ ] **On-Demand**: Form richiesta analisi
- [ ] **Community**: Placeholder o implementazione base
- [ ] **Education**: Placeholder (da fare dopo)

### Fase 3: Miglioramenti (PRIORITÀ MEDIA)

- [ ] Refresh token automatico
- [ ] Session timeout handling
- [ ] Miglioramenti UX header

---

## 🎯 PRIORITÀ FINALI

### 🔴 CRITICO (Fare Subito)

1. **Autenticazione**: Validazione token + header + logout
2. **On-Demand**: Form richiesta analisi
3. **Access**: Modulo info token

### 🟡 IMPORTANTE (Prossime 2 settimane)

4. **Community**: Implementazione base
5. **Education**: Placeholder (da fare dopo)

---

## 📊 Riepilogo Moduli

**Totale Moduli**: 11

- ✅ Completati: 7
- ❌ Mancanti: 4
- ⏳ Placeholder: 4

**Totale Funzionalità Mancanti**: ~15

- Autenticazione: 6
- Moduli: 4
- Header/Navbar: 1
- Miglioramenti: 4

---

## ⏱️ Tempo Stimato

- **Autenticazione completa**: 3-4 ore
- **Modulo Access**: 1-2 ore
- **Modulo On-Demand**: 2-3 ore
- **Modulo Community**: 2-3 ore (base) o 6-8 ore (completo)
- **Modulo Education**: 0.5 ore (placeholder)

**Totale**: ~9-13 ore per completare tutto.

---

## ✅ Prossimo Step

**Decidere:**

1. Sistema autenticazione: Token-based (Opzione A) ✅
2. Header/Navbar: Implementare subito ✅
3. Moduli: Access + On-Demand prima, Community dopo
4. Education: Placeholder per ora

**Implementare:**

1. Autenticazione (auth.js + header.js)
2. Modulo Access
3. Modulo On-Demand
4. Modulo Community (base)
5. Modulo Education (placeholder)
