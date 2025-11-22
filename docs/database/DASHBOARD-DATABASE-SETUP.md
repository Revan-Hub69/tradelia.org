# Database Setup - Dashboard Tradelia

## 📋 Panoramica

Questo documento descrive lo schema database completo per la dashboard Tradelia, incluse tutte le tabelle, funzioni RPC e policy RLS necessarie.

## 🗄️ Schema Database

### File SQL Principali

1. **`supabase/schema_v2.sql`** - Schema base (eseguire PRIMA)
   - Tabelle: `user_profiles`, `user_roles`, `subscriptions`, `dashboard_access_tokens`, `reports`, `asset_proposals`, `asset_votes`, `analysis_requests`, ecc.

2. **`supabase/dashboard-complete-schema.sql`** - Completamento schema dashboard (eseguire DOPO)
   - Tabelle mancanti: `notifications`, `user_plans`, `plan_usage`, `payment_orders`
   - Funzioni RPC per dashboard
   - RLS policies complete
   - Indici per performance

3. **`supabase/add-payments-invoices-tables.sql`** - Tabelle pagamenti/fatture
4. **`supabase/add-business-fields.sql`** - Campi business per Xolo
5. **`supabase/function-notify-analysis-completed.sql`** - Trigger notifiche

## 📊 Tabelle Dashboard

### 1. `notifications`

Notifiche sistema per utenti dashboard.

**Campi:**

- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `user_token` (text) - Per compatibilità con dashboard tokens
- `type` (text) - info, success, warning, error, analysis_completed, ecc.
- `title` (text)
- `message` (text)
- `link` (text, nullable)
- `is_read` (boolean, default false)
- `created_at`, `updated_at` (timestamptz)

**Indici:**

- `idx_notifications_user` (user_id, created_at desc)
- `idx_notifications_token` (user_token, created_at desc)
- `idx_notifications_unread` (user_id, is_read) WHERE is_read = false

### 2. `user_plans`

Piani utente (Pro/Desk) con gestione scadenze e pagamenti.

**Campi:**

- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `plan_type` (text) - 'pro' o 'desk'
- `status` (text) - active, pending_payment, pending_manual, cancelled, expired
- `started_at` (timestamptz)
- `expires_at` (timestamptz, nullable) - Solo per Desk
- `xolo_payment_status` (text, nullable)
- `xolo_payment_due_date` (timestamptz, nullable)
- `email` (text, nullable)
- `metadata` (jsonb)

**Indici:**

- `idx_user_plans_user` (user_id, started_at desc)
- `idx_user_plans_status` (status)
- `idx_user_plans_type` (plan_type)

### 3. `plan_usage`

Tracciamento utilizzo analisi per piano (Pro/Desk).

**Campi:**

- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `plan_id` (uuid, FK → user_plans)
- `month_year` (text) - Formato: 'YYYY-MM'
- `pro_included_used` (integer, default 0)
- `pro_extra_used` (integer, default 0)
- `desk_included_used` (integer, default 0)
- `desk_extra_used` (integer, default 0)
- `created_at`, `updated_at` (timestamptz)

**Unique constraint:** (user_id, plan_id, month_year)

**Indici:**

- `idx_plan_usage_user_month` (user_id, month_year)
- `idx_plan_usage_plan` (plan_id)

### 4. `payment_orders`

Ordini di pagamento per analisi extra.

**Campi:**

- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `plan_id` (uuid, FK → user_plans, nullable)
- `amount` (numeric(10,2))
- `currency` (text, default 'EUR')
- `status` (text) - pending_manual, paid, cancelled, refunded
- `invoice_date` (timestamptz)
- `due_date` (timestamptz, nullable)
- `description` (text, nullable)
- `xolo_invoice_id` (text, nullable)
- `metadata` (jsonb)

**Indici:**

- `idx_payment_orders_user` (user_id, created_at desc)
- `idx_payment_orders_status` (status)

### 5. `analysis_requests` (aggiornata)

Campi aggiunti per integrazione plan/usage:

- `user_id` (uuid, FK → auth.users)
- `access_token` (text) - Per compatibilità
- `plan_type` (text) - 'pro' o 'desk'
- `cost` (numeric(10,2))
- `payment_order_id` (uuid, FK → payment_orders)
- `included_in_plan` (boolean)
- `request_type` (text) - included, extra_pro, extra_desk, standalone
- `report_slug` (text, nullable)
- `report_id` (uuid, nullable)

## 🔧 Funzioni RPC

### `get_user_plan_data(p_user_id uuid) → jsonb`

Restituisce piano, usage e crediti per utente.

**Ritorna:**

```json
{
  "plan": {
    "type": "pro",
    "status": "active",
    "startedAt": "...",
    "expiresAt": null,
    "xoloPaymentStatus": null,
    "xoloPaymentDueDate": null,
    "desk": null,
    "credits": 0
  },
  "usage": {
    "month": "2025-01",
    "proIncludedUsed": 0,
    "proExtraUsed": 0,
    "proExtraRemaining": 1,
    "deskIncludedUsed": 0,
    "deskExtraUsed": 0,
    "deskIncludedRemaining": 0
  }
}
```

### `create_notification(p_user_id, p_type, p_title, p_message, p_link) → uuid`

Crea notifica per utente.

### `mark_notification_read(p_notification_id) → boolean`

Marca notifica come letta.

## 🔒 Row Level Security (RLS)

Tutte le tabelle hanno RLS abilitato con policy:

1. **Users view own data** - Utenti vedono solo i propri dati
2. **Service role manages all** - Service role può gestire tutto

### Policy Esempio (notifications):

```sql
-- Users view own notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR user_token IN (...));

-- Service role manages notifications
CREATE POLICY "Service role manages notifications"
  ON public.notifications FOR ALL
  USING (auth.role() = 'service_role');
```

## 📝 Setup Steps

1. **Eseguire schema base:**

   ```sql
   -- In Supabase Dashboard → SQL Editor
   -- Incolla contenuto di supabase/schema_v2.sql
   ```

2. **Eseguire completamento dashboard:**

   ```sql
   -- Incolla contenuto di supabase/dashboard-complete-schema.sql
   ```

3. **Eseguire tabelle pagamenti:**

   ```sql
   -- Incolla contenuto di supabase/add-payments-invoices-tables.sql
   ```

4. **Eseguire campi business:**

   ```sql
   -- Incolla contenuto di supabase/add-business-fields.sql
   ```

5. **Eseguire trigger notifiche:**

   ```sql
   -- Incolla contenuto di supabase/function-notify-analysis-completed.sql
   ```

6. **Verificare schema:**
   ```sql
   -- Esegui supabase/verify-schema.sql per verificare che tutto sia OK
   ```

## 🔍 Query Frontend

### Caricare richieste analisi:

```javascript
const { data, error } = await supabase
  .from("analysis_requests")
  .select("*")
  .eq("user_id", userId) // o .eq('access_token', token)
  .order("created_at", { ascending: false });
```

### Caricare notifiche:

```javascript
const { data, error } = await supabase
  .from("notifications")
  .select("*")
  .eq("user_id", userId) // o .eq('user_token', token)
  .eq("is_read", false)
  .order("created_at", { ascending: false })
  .limit(50);
```

### Caricare piano utente:

```javascript
// Via API endpoint (consigliato)
const response = await fetch("/api/get-user-plan.js", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token: dashboardToken }),
});

// O via RPC (se autenticato)
const { data, error } = await supabase.rpc("get_user_plan_data", { p_user_id: userId });
```

## ⚠️ Note Importanti

1. **Ordine esecuzione:** Eseguire gli script SQL nell'ordine indicato
2. **RLS:** Tutte le tabelle hanno RLS abilitato - testare con utenti reali
3. **Indici:** Gli indici sono ottimizzati per query frequenti della dashboard
4. **Compatibilità:** Le tabelle supportano sia `user_id` (auth.users) che `user_token` (dashboard tokens)
5. **Service Role:** Solo il service role può inserire/aggiornare dati - usare API endpoints

## 🧪 Testing

Dopo il setup, testare:

1. ✅ Creazione notifica
2. ✅ Lettura notifiche utente
3. ✅ Creazione richiesta analisi
4. ✅ Aggiornamento usage
5. ✅ Creazione payment order
6. ✅ Query piano utente

## 📚 Riferimenti

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Functions](https://supabase.com/docs/guides/database/functions)
- Schema completo: `supabase/schema_v2.sql` + `supabase/dashboard-complete-schema.sql`
