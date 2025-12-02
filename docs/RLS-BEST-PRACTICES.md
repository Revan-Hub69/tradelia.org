# RLS (Row Level Security) Best Practices - Tradelia

## 📚 Principi Accademici per RLS Policies

### 1. **Principio del Minimo Privilegio**

- ✅ Concedere solo i permessi necessari
- ✅ Separare SELECT, INSERT, UPDATE, DELETE
- ✅ Usare policies specifiche per operazione

### 2. **Sicurezza per Default**

- ✅ RLS abilitato su TUTTE le tabelle
- ✅ Nessuna policy = nessun accesso
- ✅ Testare sempre con utente non-admin

### 3. **Performance**

- ✅ Policies semplici e veloci
- ✅ Evitare subquery complesse quando possibile
- ✅ Usare indici per colonne usate in policies

### 4. **Manutenibilità**

- ✅ Nomi policies descrittivi
- ✅ Commenti SQL per documentazione
- ✅ Policies idempotenti (DROP IF EXISTS)

---

## 🏗️ Pattern RLS per Tradelia

### Pattern 1: **Own Data Access** (Dati Propri)

```sql
-- Utente può leggere/modificare solo i propri dati
CREATE POLICY "Users can manage own data"
    ON table_name FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

**Quando usare:**

- `user_activities`
- `user_achievements`
- `user_stats`
- `portfolio_positions`
- `trading_journal`
- `watchlist`
- `expenses`

---

### Pattern 2: **Public Read, Own Write** (Lettura Pubblica, Scrittura Propria)

```sql
-- Tutti possono leggere, solo owner può modificare
CREATE POLICY "Public read access"
    ON table_name FOR SELECT
    USING (true);

CREATE POLICY "Users can update own data"
    ON table_name FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

**Quando usare:**

- `profiles` (per social features)
- `courses` (corsi pubblici)
- `achievements` (achievement pubblici)

---

### Pattern 3: **Role-Based Access** (Accesso Basato su Ruolo)

```sql
-- Solo utenti con ruolo specifico possono accedere
CREATE POLICY "Pro users can access"
    ON table_name FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('pro', 'desk', 'admin')
            AND (valid_until IS NULL OR valid_until > NOW())
        )
    );
```

**Quando usare:**

- `asset_proposals` (solo Pro)
- `asset_votes` (solo Pro)
- Features premium

---

### Pattern 4: **Admin Only** (Solo Admin)

```sql
-- Solo admin possono accedere
CREATE POLICY "Admins only"
    ON table_name FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );
```

**Quando usare:**

- `admin_emails`
- `admin_users`
- `report_audit_log` (lettura)
- Tabelle di sistema

---

### Pattern 5: **System/Service Access** (Accesso Sistema)

```sql
-- Solo sistema può inserire (per webhooks, cron, etc.)
CREATE POLICY "System can insert"
    ON table_name FOR INSERT
    WITH CHECK (true);
```

**Quando usare:**

- `notifications` (sistema inserisce, utente legge)
- `event_notifications`
- `credits_log`
- `xp_transactions`

---

## ✅ Checklist RLS per Ogni Tabella

Per ogni tabella, verifica:

- [ ] RLS abilitato: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- [ ] Policy per SELECT (lettura)
- [ ] Policy per INSERT (creazione)
- [ ] Policy per UPDATE (modifica)
- [ ] Policy per DELETE (eliminazione)
- [ ] Policies idempotenti (`DROP POLICY IF EXISTS`)
- [ ] Test con utente normale
- [ ] Test con admin
- [ ] Test con utente non autenticato

---

## 🔒 Sicurezza Funzioni

### Funzioni SECURITY DEFINER

```sql
-- SEMPRE usare SET search_path per sicurezza
CREATE OR REPLACE FUNCTION function_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- O '' per massima sicurezza
AS $$
BEGIN
    -- codice
END;
$$;
```

**Best Practice:**

- ✅ `SET search_path = public` per funzioni che usano tabelle pubbliche
- ✅ `SET search_path = ''` per funzioni che non usano tabelle
- ❌ Mai lasciare `search_path` non specificato

---

## 🎯 Esempi Pratici

### Esempio 1: User Activities

```sql
-- Lettura: solo propri dati
CREATE POLICY "Users can read own activities"
    ON user_activities FOR SELECT
    USING (auth.uid() = user_id);

-- Scrittura: solo propri dati
CREATE POLICY "Users can insert own activities"
    ON user_activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### Esempio 2: Reports

```sql
-- Lettura: propri report + admin può vedere tutti
CREATE POLICY "Users can read own reports"
    ON reports FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM admin_emails
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Scrittura: solo propri report
CREATE POLICY "Users can create own reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### Esempio 3: Notifications

```sql
-- Lettura: solo proprie notifiche
CREATE POLICY "Users can read own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Scrittura: sistema può inserire (per webhooks)
CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);
```

---

## ⚠️ Errori Comuni da Evitare

### ❌ Errore 1: RLS non abilitato

```sql
-- SBAGLIATO: RLS non abilitato
CREATE TABLE users (...);
-- Nessuna policy = nessun accesso!
```

### ❌ Errore 2: Policy troppo permissiva

```sql
-- SBAGLIATO: tutti possono modificare tutto
CREATE POLICY "Everyone can do everything"
    ON table_name FOR ALL
    USING (true);
```

### ❌ Errore 3: Subquery circolare

```sql
-- SBAGLIATO: policy su admin_emails che usa admin_emails
CREATE POLICY "Admins can read"
    ON admin_emails FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_emails  -- ⚠️ Circolare!
            WHERE email = ...
        )
    );
```

**Soluzione:** Usare funzione SECURITY DEFINER o logica diversa

### ❌ Errore 4: search_path non specificato

```sql
-- SBAGLIATO: vulnerabile a search_path hijacking
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- ⚠️ search_path non specificato!
AS $$ ... $$;
```

---

## 📊 Verifica RLS

### Query per verificare RLS

```sql
-- Verifica RLS abilitato
SELECT
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as rls_status
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY tablename;

-- Lista policies per tabella
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🎯 Conclusione

**Regole d'oro:**

1. ✅ RLS sempre abilitato
2. ✅ Policies specifiche per operazione
3. ✅ Principio del minimo privilegio
4. ✅ Test sempre con utente non-admin
5. ✅ `search_path` sempre specificato nelle funzioni
6. ✅ Policies idempotenti
