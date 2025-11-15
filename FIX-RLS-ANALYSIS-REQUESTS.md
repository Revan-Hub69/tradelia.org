# ⚠️ Fix RLS Policy per analysis_requests

## 🔍 PROBLEMA IDENTIFICATO

**Policy attuale:**
```sql
-- Policy: Utenti institutional possono creare richieste
create policy "Institutional users can create requests"
  on public.analysis_requests for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'institutional'
    )
    and user_id = auth.uid()
  );
```

**Codice JavaScript:**
```javascript
// RIMOSSO: Tutti i lock rimossi - tutti possono richiedere analisi
// I limiti verranno applicati lato backend quando necessario
```

**Conflitto:** Il codice permette a tutti di richiedere analisi, ma la RLS policy blocca solo gli utenti "institutional".

---

## ✅ SOLUZIONE

### Opzione 1: Permettere a tutti gli utenti autenticati (CONSIGLIATO)

Aggiorna la policy per permettere a tutti gli utenti autenticati di creare richieste:

```sql
-- Rimuovi policy vecchia
drop policy if exists "Institutional users can create requests" on public.analysis_requests;

-- Nuova policy: Tutti gli utenti autenticati possono creare richieste
create policy "Authenticated users can create requests"
  on public.analysis_requests for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );
```

**Vantaggi:**
- ✅ Permette a tutti gli utenti autenticati di creare richieste
- ✅ I limiti vengono applicati lato backend (crediti, rate limiting)
- ✅ Più flessibile per future modifiche

---

### Opzione 2: Mantenere solo institutional (ALTERNATIVA)

Se vuoi mantenere il limite solo per institutional, aggiorna il codice JavaScript per verificare il ruolo prima di permettere la richiesta.

**Non consigliato** perché il codice attuale è già configurato per permettere a tutti.

---

## 🚀 SCRIPT SQL DA ESEGUIRE

Esegui questo script in Supabase Dashboard → SQL Editor:

```sql
-- ============================================
-- FIX: RLS Policy analysis_requests
-- ============================================
-- Permette a tutti gli utenti autenticati di creare richieste
-- I limiti vengono applicati lato backend (crediti, rate limiting)
-- ============================================

-- Rimuovi policy vecchia
drop policy if exists "Institutional users can create requests" on public.analysis_requests;

-- Nuova policy: Tutti gli utenti autenticati possono creare richieste
create policy "Authenticated users can create requests"
  on public.analysis_requests for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

-- Verifica policy
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'analysis_requests'
order by policyname;
```

---

## ✅ DOPO IL FIX

Dopo aver eseguito lo script:
- ✅ Tutti gli utenti autenticati possono creare richieste
- ✅ I limiti vengono applicati lato backend (crediti, rate limiting)
- ✅ La sicurezza è mantenuta (solo i propri dati)

---

## 📋 VERIFICA FINALE

Dopo il fix, verifica che:
1. ✅ Utenti autenticati possono creare richieste
2. ✅ Utenti vedono solo le proprie richieste
3. ✅ I limiti di crediti funzionano correttamente
4. ✅ Rate limiting funziona correttamente

