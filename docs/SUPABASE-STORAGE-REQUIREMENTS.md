# Supabase Storage Requirements - Analisi Completa

## ✅ Tabelle Esistenti in Supabase

### 1. **favorites** (010_system_tables.sql)
- ✅ **ESISTE** - Tabella completa
- **Campi**: id, user_id, item_id, item_type, title, description, href, icon, added_at
- **RLS**: ✅ Configurato
- **Status**: ✅ Pronta per sync

### 2. **profiles** (001_initial_schema.sql)
- ✅ **ESISTE** - Tabella completa
- **Campi**: id, email, full_name, language, timezone, etc.
- **Language**: ✅ Campo `language` presente (VARCHAR(10) DEFAULT 'it')
- **Currency**: ⚠️ **MANCA** - Da aggiungere
- **RLS**: ✅ Configurato

### 3. **user_notification_preferences** (003_user_management_complete.sql)
- ✅ **ESISTE** - Tabella completa
- **Campi**: email_enabled, push_enabled, etc.
- **RLS**: ✅ Configurato

### 4. **user_stats** (003_user_management_complete.sql)
- ✅ **ESISTE** - Per gamification
- **Campi**: total_xp, current_streak, etc.
- **RLS**: ✅ Configurato

---

## ❌ Tabelle MANCANTI - Da Creare

### 1. **legal_consents** ⚠️ **OBBLIGATORIO**
- **Scopo**: Audit trail GDPR/Legal compliance
- **Campi necessari**:
  - user_id (nullable per guest)
  - consent_type ('legal', 'analytics', 'marketing', 'cookies')
  - consent_value ('accepted', 'rejected', 'pending')
  - ip_address, user_agent (per audit)
  - consent_date, updated_at
- **RLS**: Users own, Admins read all
- **Priorità**: 🔴 **ALTA** (compliance legale)

### 2. **ai_chat_messages** ⚠️ **OPZIONALE**
- **Scopo**: Backup chat AI per utenti loggati (multi-device)
- **Campi necessari**:
  - user_id
  - conversation_id
  - role ('user', 'assistant')
  - content
  - metadata (JSONB)
  - created_at
- **RLS**: Users own only
- **Priorità**: 🟡 **MEDIA** (nice to have, non critico)

### 3. **user_preferences** ⚠️ **OPZIONALE**
- **Scopo**: Preferenze estese oltre profiles
- **Campi necessari**:
  - user_id (UNIQUE)
  - theme, reduced_motion
  - show_welcome_tour, show_tooltips
  - dashboard_layout, widgets_order
  - other_preferences (JSONB)
- **RLS**: Users own only
- **Priorità**: 🟡 **MEDIA** (può essere in profiles JSONB)

---

## 📋 Modifiche Necessarie

### 1. **Aggiungere `currency` a `profiles`**
```sql
ALTER TABLE profiles 
ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR' 
CHECK (currency IN ('EUR', 'USD'));
```

### 2. **Creare `legal_consents` table**
- Audit trail completo
- Supporta guest users (user_id nullable)
- IP address e user agent per compliance

### 3. **Creare `ai_chat_messages` table** (opzionale)
- Backup per utenti loggati
- Supporta conversazioni multiple
- Metadata flessibile

### 4. **Creare `user_preferences` table** (opzionale)
- OPPURE aggiungere JSONB a profiles
- Preferenze UI estese

---

## 🎯 Strategia Finale

### Dati che DEVONO andare su Supabase:

1. **✅ Favorites** → `favorites` table (già esiste)
2. **✅ Legal Consent** → `legal_consents` table (da creare) 🔴
3. **✅ User Language** → `profiles.language` (già esiste)
4. **⚠️ User Currency** → `profiles.currency` (da aggiungere)

### Dati che POSSONO andare su Supabase (opzionale):

1. **🟡 Chat Messages** → `ai_chat_messages` (backup per utenti loggati)
2. **🟡 User Preferences** → `user_preferences` o `profiles.other_preferences` (JSONB)
3. **🟡 Daily Login Check** → `user_stats.last_activity_at` (già esiste)

### Dati che NON vanno su Supabase:

1. **❌ Analytics Consent** → localStorage (GDPR, locale OK)
2. **❌ Exchange Rate Cache** → localStorage (cache temporanea)
3. **❌ UI States** → localStorage/sessionStorage (banner dismissed, etc.)
4. **❌ Chat State** → sessionStorage (solo sessione)

---

## 📝 Migration Creata

**File**: `supabase/migrations/020_user_preferences_and_legal.sql`

**Contenuto**:
- ✅ Aggiunge `currency` a `profiles`
- ✅ Crea `legal_consents` table (OBBLIGATORIO)
- ✅ Crea `ai_chat_messages` table (opzionale)
- ✅ Crea `user_preferences` table (opzionale)

---

## ✅ Checklist Implementazione

- [x] Analisi completa storage locale
- [x] Verifica tabelle Supabase esistenti
- [x] Identificazione tabelle mancanti
- [x] Creazione migration 020
- [ ] Eseguire migration su Supabase
- [ ] Aggiornare sync.ts per usare nuove tabelle
- [ ] Test sync favorites (già funziona)
- [ ] Test sync legal_consents
- [ ] Test sync user preferences

---

## 🚀 Prossimi Passi

1. **Eseguire migration 020** su Supabase
2. **Aggiornare `lib/storage/sync.ts`** per implementare:
   - `syncLegalConsent()` → usa `legal_consents` table
   - `syncUserPreferences()` → usa `profiles.currency` e `user_preferences`
   - `syncChatMessages()` → usa `ai_chat_messages` (opzionale)
3. **Test completo** di sync per tutti i dati utente
