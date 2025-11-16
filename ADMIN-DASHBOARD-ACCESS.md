# Dashboard Admin - Accesso e Setup

## 🔐 Come accedere

La dashboard admin è disponibile all'indirizzo: **`/user/admin.html`**

**URL completo**: `https://tradelia.org/user/admin.html` (o il tuo dominio Vercel)

## ✅ Requisiti

1. **Devi essere loggato** in Supabase Auth
2. **Il tuo user_id deve essere nella tabella `admin_users`** in Supabase

## 🛠️ Setup iniziale

### 1. Aggiungi il tuo utente come admin

Vai su **Supabase Dashboard → Table Editor → `admin_users`** e inserisci:

```sql
INSERT INTO public.admin_users (user_id)
VALUES ('TUO_USER_ID_QUI');
```

**Come trovare il tuo user_id:**
- Vai su Supabase Dashboard → Authentication → Users
- Trova il tuo utente e copia l'UUID

### 2. Esegui la RPC function (se non già fatto)

Vai su **Supabase Dashboard → SQL Editor** e esegui:

```sql
-- File: supabase/rpc-get-user-emails.sql
```

Questa funzione permette all'admin di vedere le email degli utenti.

## 📋 Funzionalità disponibili

### Tab "Utenti"
- **Statistiche**: Utenti totali, piani attivi, scaduti, crediti totali
- **Filtri**: Cerca per email/nome, filtra per ruolo, filtra per stato
- **Tabella utenti** con colonne:
  - Email
  - Nome
  - Ruolo (Trial/Pro/Desk)
  - Scadenza
  - Crediti
  - Azioni (Modifica, Crediti, Pagamenti)

### Azioni disponibili

1. **Modifica Utente**:
   - Cambia nome display
   - Cambia ruolo (Trial/Pro/Desk)
   - Modifica scadenza abbonamento (`valid_until`)

2. **Gestisci Crediti**:
   - Visualizza crediti attuali
   - Aggiungi/rimuovi crediti (per utenti Desk)

3. **Registra Pagamento** (Xolo/manuale):
   - Importo (EUR)
   - Stato (Riscosso/In attesa/Rimborsato)
   - Numero fattura Xolo
   - URL PDF fattura
   - Descrizione
   - **Automatico**: Aggiorna `user_roles` a Desk, estende scadenza, genera token dashboard

### Tab "Report Desk"
- Embed della dashboard report esistente (`/report/admin/dashboard.html`)
- Gestione report e assegnazione a utenti

## 🔒 Sicurezza

- Solo utenti in `admin_users` possono accedere
- Se non sei admin, vieni rediretto a `/dashboard.html`
- Le RPC functions verificano che tu sia admin prima di restituire dati sensibili

## 🐛 Troubleshooting

### "Access denied" o redirect a dashboard
- Verifica che il tuo `user_id` sia in `admin_users`
- Verifica di essere loggato in Supabase Auth

### "RPC function error" quando carichi utenti
- Esegui lo script `supabase/rpc-get-user-emails.sql` in Supabase SQL Editor
- Verifica che la funzione esista: `SELECT * FROM pg_proc WHERE proname = 'get_user_emails_for_admin';`

### Non vedi email degli utenti
- Verifica che la RPC function `get_user_emails_for_admin()` sia stata eseguita
- Controlla i log della console browser per errori

## 📝 Note

- La dashboard admin è **solo per utenti admin** (non pubblica)
- Non c'è un link pubblico per accedervi (per sicurezza)
- Devi accedere direttamente digitando `/user/admin.html` dopo il login

