# 🧭 Navigazione Admin - Tradelia.org

## ✅ Completato

Sistema di navigazione completo per le dashboard admin, con link visibili dopo il login.

---

## 🎯 Come Funziona

### 1. **Login Admin** (`/accesso.html`)

**Flusso:**
1. Admin inserisce il codice di accesso
2. Sistema verifica il token
3. Sistema verifica se l'email è in `admin_emails` (Supabase)
4. **Se è admin** → Mostra bottone **"Portale Admin"**
5. Clic su "Portale Admin" → Vai a `/admin/index.html`

**Link visibile:**
- ✅ **"Portale Admin"** - Appare solo se l'utente è admin
- ✅ Link a `/admin/index.html` (portale centrale)

---

### 2. **Portale Admin Centrale** (`/admin/index.html`)

**Card disponibili:**

1. **📊 Report Studio**
   - Link: `/admin/reports.html`
   - Descrizione: Editor modulare per creare, duplicare e pubblicare deck ricercativi

2. **👥 Utenti & Billing**
   - Link: `/admin/users.html`
   - Descrizione: Panoramica piani attivi, gestione ruoli e crediti Desk, pagamenti manuali

3. **📋 Richieste Analisi & Desk** ⭐ NUOVO
   - Link: `/admin/requests.html`
   - Descrizione: Gestisci tutte le richieste analisi su richiesta e piano desk

**Layout:**
- Grid responsive (3 colonne su desktop, 1 colonna su mobile)
- Card con descrizione e link
- Design coerente con il resto del sito

---

### 3. **Navigazione tra Dashboard**

Ogni dashboard admin ha una **barra di navigazione** in alto con link a:

**In `/admin/users.html`:**
- 🏠 Portale Admin → `/admin/index.html`
- 📊 Report Studio → `/admin/reports.html`
- 📋 Richieste → `/admin/requests.html`
- 📈 Dashboard pubblica → `/dashboard.html`

**In `/admin/requests.html`:**
- Utenti → `/admin/users.html`
- Richieste → `/admin/requests.html` (attivo)
- Report → `/admin/reports.html`

**In `/admin/reports.html`:**
- (da verificare se ha la stessa nav bar)

---

## 📍 Struttura File

```
/admin/
├── index.html          # Portale centrale (hub)
├── users.html          # Dashboard Utenti & Billing
├── requests.html       # Dashboard Richieste ⭐ NUOVO
└── reports.html        # Dashboard Report Studio
```

---

## 🔗 Link e Collegamenti

### Dopo Login (`/accesso.html`)

**Se admin:**
- ✅ Bottone **"Portale Admin"** → `/admin/index.html`
- ✅ Bottone **"Vai alla dashboard"** → `/dashboard.html` (pubblica)
- ✅ Bottone **"Crea report"** → `/report/admin/dashboard.html` (se disponibile)

### Portale Admin (`/admin/index.html`)

**Card:**
- 📊 Report Studio → `/admin/reports.html`
- 👥 Utenti & Billing → `/admin/users.html`
- 📋 Richieste Analisi & Desk → `/admin/requests.html` ⭐

### Dashboard Utenti (`/admin/users.html`)

**Header navigation:**
- 🏠 Portale Admin → `/admin/index.html`
- 📊 Report Studio → `/admin/reports.html`
- 📋 Richieste → `/admin/requests.html` ⭐
- 📈 Dashboard pubblica → `/dashboard.html`

### Dashboard Richieste (`/admin/requests.html`)

**Nav bar:**
- Utenti → `/admin/users.html`
- Richieste → `/admin/requests.html` (attivo)
- Report → `/admin/reports.html`

---

## 🎨 Design

**Portale Admin (`/admin/index.html`):**
- Dark theme
- Card con glassmorphism
- Grid responsive (3 colonne desktop, 1 mobile)
- Bottoni con gradient

**Dashboard Admin:**
- Light theme (coerente con design system)
- Nav bar in alto con link
- Statistiche in card
- Tabelle responsive

---

## ✅ Checklist

- [x] Link "Portale Admin" in `/accesso.html` dopo login admin
- [x] Portale centrale `/admin/index.html` con tutte le card
- [x] Card "Richieste Analisi & Desk" aggiunta
- [x] Nav bar in `/admin/users.html` con link a Richieste
- [x] Nav bar in `/admin/requests.html` con link a Utenti e Report
- [x] Grid responsive (3 colonne desktop)
- [x] Design coerente

---

## 🚀 Come Usare

1. **Login** → Vai su `/accesso.html` e inserisci codice admin
2. **Vedi "Portale Admin"** → Se sei admin, appare il bottone
3. **Clic "Portale Admin"** → Vai a `/admin/index.html`
4. **Scegli dashboard** → Clic su una delle 3 card:
   - Report Studio
   - Utenti & Billing
   - Richieste Analisi & Desk ⭐
5. **Naviga** → Usa la nav bar in alto per spostarti tra dashboard

---

## 📝 Note

- Il link "Portale Admin" appare **solo se l'utente è admin** (verifica tramite `admin_emails` in Supabase)
- Il portale centrale mostra **tutte le dashboard disponibili** in modo chiaro
- Ogni dashboard ha una **nav bar** per navigare facilmente
- Il design è **coerente** con il resto del sito

