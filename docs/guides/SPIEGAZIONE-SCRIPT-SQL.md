# 📋 Spiegazione Script SQL: fix-rls-analysis-requests-all-users.sql

## 🎯 COSA FA LO SCRIPT

Lo script aggiorna la **RLS Policy** (Row Level Security) per la tabella `analysis_requests` in Supabase.

### Prima (Policy Attuale):
```sql
-- Solo utenti "institutional" possono creare richieste
create policy "Institutional users can create requests"
  on public.analysis_requests for insert
  with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'institutional'  -- ⚠️ SOLO INSTITUTIONAL
    )
    and user_id = auth.uid()
  );
```

### Dopo (Nuova Policy):
```sql
-- Tutti gli utenti autenticati possono creare richieste
create policy "Authenticated users can create requests"
  on public.analysis_requests for insert
  with check (
    auth.uid() is not null  -- ✅ Basta essere autenticato
    and user_id = auth.uid()
  );
```

---

## ⚠️ PERCHÉ È NECESSARIO

### Problema Attuale:

1. **Codice JavaScript** (`user/assets/js/app.js`):
   ```javascript
   // RIMOSSO: Tutti i lock rimossi - tutti possono richiedere analisi
   // I limiti verranno applicati lato backend quando necessario
   // For all users: allow on-demand requests (backend will enforce limits)
   if (state.role === 'institutional' || state.role === 'trial' || state.role === 'pro' || !state.role) {
     // Permette a TUTTI di creare richieste
   }
   ```

2. **RLS Policy Supabase** (attuale):
   - Permette SOLO agli utenti con ruolo `institutional`
   - Blocca tutti gli altri (trial, pro, guest)

3. **Conflitto:**
   - Il codice JavaScript permette a tutti di creare richieste
   - La RLS policy blocca tutti tranne gli institutional
   - **Risultato:** Gli utenti non-institutional riceveranno errore "permission denied" quando provano a creare una richiesta

---

## 🔍 COSA SUCCEDE SE NON LO ESEGUI

### Scenario 1: Utente Trial/Pro prova a creare richiesta
- ✅ Il codice JavaScript permette la richiesta
- ❌ Supabase RLS blocca con errore: `new row violates row-level security policy`
- ❌ L'utente vede errore "Errore durante l'invio della richiesta"
- ❌ La richiesta NON viene creata nel database

### Scenario 2: Utente Institutional
- ✅ Il codice JavaScript permette la richiesta
- ✅ Supabase RLS permette la richiesta
- ✅ Funziona correttamente

---

## ✅ COSA SUCCEDE DOPO L'ESECUZIONE

### Dopo aver eseguito lo script:

1. **Tutti gli utenti autenticati** possono creare richieste
2. **I limiti vengono applicati lato backend:**
   - Controllo crediti (per institutional)
   - Rate limiting (max 3 richieste pending)
   - Validazione ticker
3. **Sicurezza mantenuta:**
   - Gli utenti vedono solo le proprie richieste
   - Gli utenti possono aggiornare solo le proprie richieste pending
   - Admins possono gestire tutto

---

## 🚀 COME ESEGUIRE LO SCRIPT

### Metodo 1: Supabase Dashboard (CONSIGLIATO)

1. Vai su [Supabase Dashboard](https://app.supabase.com/)
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Clicca su **New Query**
5. Copia e incolla tutto il contenuto di `supabase/fix-rls-analysis-requests-all-users.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)
7. Verifica che non ci siano errori
8. Controlla l'output della query di verifica (dovrebbe mostrare le policy aggiornate)

### Metodo 2: Supabase CLI (se configurato)

```bash
supabase db execute --file supabase/fix-rls-analysis-requests-all-users.sql
```

---

## ✅ VERIFICA DOPO L'ESECUZIONE

Dopo aver eseguito lo script, verifica che:

1. ✅ La policy vecchia "Institutional users can create requests" è stata rimossa
2. ✅ La nuova policy "Authenticated users can create requests" è stata creata
3. ✅ Gli utenti trial/pro possono creare richieste senza errori
4. ✅ Gli utenti vedono solo le proprie richieste (altre policy funzionano)

---

## 📋 CHECKLIST

- [ ] Script eseguito in Supabase Dashboard
- [ ] Nessun errore durante l'esecuzione
- [ ] Policy verificata con query di controllo
- [ ] Test con utente trial/pro (dovrebbe funzionare)
- [ ] Test con utente institutional (dovrebbe funzionare)

---

## 🎯 CONCLUSIONE

**Lo script è NECESSARIO** per allineare la RLS policy con il codice JavaScript.

**Senza lo script:**
- ❌ Gli utenti trial/pro non possono creare richieste
- ❌ Errore "permission denied" in console
- ❌ Funzionalità non utilizzabile

**Con lo script:**
- ✅ Tutti gli utenti autenticati possono creare richieste
- ✅ I limiti vengono applicati lato backend
- ✅ Funzionalità completamente operativa

**Esegui lo script prima di testare l'area utente! 🚀**

