# 📋 Ordine Script SQL per Setup Token Admin

## ✅ Già eseguito
1. ✅ `add-admin-emails-table.sql` - Tabella admin_emails

## 🔴 DA ESEGUIRE (in questo ordine)

### 1. Crea tabella token (NECESSARIO)
**File:** `supabase/add-dashboard-access-tokens-table.sql`

**Cosa fa:**
- Crea la tabella `dashboard_access_tokens` (dove vengono salvati i token)
- Crea indici per performance
- Configura RLS policies

**⚠️ IMPORTANTE:** Senza questa tabella, il sistema token non funziona!

---

### 2. Inserisci token admin
**File:** `supabase/insert-admin-token.sql`

**Cosa fa:**
- Verifica che `amministrazione@tradelia.org` sia in `admin_emails`
- Revoca token vecchi (se esistono)
- Inserisce il nuovo token admin pre-generato

**Token generato:** `adc51b9d333f47a95fc8a40ae8629401`

---

## 📝 Riepilogo

**Ordine di esecuzione:**
1. ✅ `add-admin-emails-table.sql` (già fatto)
2. 🔴 `add-dashboard-access-tokens-table.sql` (DA FARE)
3. 🔴 `insert-admin-token.sql` (DA FARE)

**Dopo aver eseguito questi 3 script:**
- Vai su `/accesso.html`
- Inserisci token: `adc51b9d333f47a95fc8a40ae8629401`
- Accedi a `/user/admin.html`

---

## ❓ Altri script SQL (opzionali, per altre funzionalità)

Questi NON sono necessari per il token admin, ma servono per altre funzionalità:

- `add-payments-invoices-tables.sql` - Per gestione pagamenti/fatture
- `add-credits-log-table.sql` - Per storico crediti
- `rpc-get-user-emails.sql` - Per RPC function (se usi ancora auth.users)
- Altri script di migrazione - Solo se servono funzionalità specifiche

**Per ora, esegui solo i 2 script sopra indicati!**

