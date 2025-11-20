# 📍 Dove Vanno le Richieste - Tradelia.org

## 🎯 Risposta Rapida

**Le richieste vanno in 2 posti:**

1. **📧 Email** → `amministrazione@tradelia.org` (notifica immediata)
2. **💾 Database Supabase** → Tabella `on_demand_requests` (archivio permanente)

---

## 📊 Database Supabase

### Tabella: `on_demand_requests`

**Dove si trova:**
- Database: Supabase (progetto Tradelia)
- Schema: `public`
- Tabella: `on_demand_requests`

**Cosa contiene:**
```sql
- id (uuid) - ID univoco richiesta
- tipo_richiesta ('analisi-su-richiesta' | 'piano-desk')
- nome, email, telefono
- tipologia ('privato' | 'azienda')
- codice_fiscale, ragione_sociale, piva, indirizzo
- tipo_analisi, dettagli (per analisi)
- note (per desk)
- status ('pending' | 'processing' | 'completed' | 'cancelled')
- created_at, updated_at, completed_at
```

**Accesso:**
- ✅ Service role (API) - accesso completo
- ✅ Admin (via `admin_emails`) - accesso in lettura
- ❌ Utenti pubblici - nessun accesso

---

## 📧 Email Admin

**Destinatario:** `amministrazione@tradelia.org`

**Quando viene inviata:**
- ✅ Ogni nuova richiesta analisi
- ✅ Ogni nuova richiesta piano desk
- ✅ Ogni nuovo token gratuito generato
- ✅ Ogni richiesta "ho perso il codice"

**Contenuto email:**
- Dati completi della richiesta
- ID richiesta per riferimento
- Timestamp
- Link per contattare l'utente

---

## 🔍 Come Visualizzare le Richieste

### Opzione 1: Email (Immediato) ✅

**Vantaggi:**
- ✅ Notifica immediata
- ✅ Dati completi nella email
- ✅ Puoi rispondere direttamente

**Svantaggi:**
- ⚠️ Non puoi cambiare lo status
- ⚠️ Non hai una vista d'insieme
- ⚠️ Difficile tracciare lo stato

---

### Opzione 2: Supabase Dashboard (Query Diretta) ✅

**Come accedere:**

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il progetto Tradelia
3. Vai su **Table Editor** → `on_demand_requests`
4. Vedi tutte le richieste in una tabella

**Query SQL utile:**

```sql
-- Vedi tutte le richieste pending
SELECT * FROM on_demand_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Vedi richieste analisi
SELECT * FROM on_demand_requests 
WHERE tipo_richiesta = 'analisi-su-richiesta' 
ORDER BY created_at DESC;

-- Vedi richieste desk
SELECT * FROM on_demand_requests 
WHERE tipo_richiesta = 'piano-desk' 
ORDER BY created_at DESC;

-- Conta richieste per status
SELECT status, COUNT(*) 
FROM on_demand_requests 
GROUP BY status;
```

**Vantaggi:**
- ✅ Vista completa di tutte le richieste
- ✅ Puoi filtrare e ordinare
- ✅ Puoi aggiornare lo status manualmente
- ✅ Puoi esportare i dati

**Svantaggi:**
- ⚠️ Devi accedere a Supabase Dashboard
- ⚠️ Interfaccia non ottimizzata per gestione richieste
- ⚠️ Non puoi rispondere direttamente all'utente

---

### Opzione 3: Dashboard Admin Web (Da Creare) ⏳

**Stato attuale:** ❌ Non esiste ancora

**Cosa servirebbe:**
- Interfaccia web dedicata (`/admin/requests.html`)
- Lista richieste con filtri (status, tipo, data)
- Dettagli richiesta completa
- Cambio status (pending → processing → completed)
- Invio email all'utente
- Statistiche (richieste per giorno/settimana)

**Vantaggi:**
- ✅ Interfaccia ottimizzata
- ✅ Gestione completa workflow
- ✅ Tracciamento stato
- ✅ Statistiche e report

**Svantaggi:**
- ⚠️ Richiede sviluppo
- ⚠️ Richiede autenticazione admin

---

## 📋 Workflow Attuale

### Per l'Admin:

1. **Riceve email** → `amministrazione@tradelia.org`
2. **Legge i dettagli** → Nella email
3. **Contatta utente** → Via email (entro 24h come promesso)
4. **Aggiorna status** → Manualmente in Supabase (se vuole tracciare)

### Status Possibili:

- `pending` - Richiesta ricevuta, in attesa
- `processing` - Richiesta in elaborazione
- `completed` - Richiesta completata
- `cancelled` - Richiesta cancellata

---

## 🔄 Altri Dati Salvati

### Token Gratuiti

**Tabella:** `dashboard_access_tokens`

**Dove visualizzare:**
- Supabase Dashboard → `dashboard_access_tokens`
- Email admin con notifica

**Query utile:**
```sql
-- Token generati oggi
SELECT * FROM dashboard_access_tokens 
WHERE created_at >= CURRENT_DATE 
ORDER BY created_at DESC;

-- Token attivi (non revocati)
SELECT * FROM dashboard_access_tokens 
WHERE revoked = false 
AND valid_until > NOW()
ORDER BY created_at DESC;
```

---

## 🚀 Raccomandazioni

### Per Ora (Soluzione Immediata):

1. ✅ **Usa le email** per notifiche immediate
2. ✅ **Usa Supabase Dashboard** per vedere tutte le richieste
3. ✅ **Aggiorna status manualmente** in Supabase quando necessario

### Per il Futuro (Miglioramento):

1. ⏳ **Crea dashboard admin** (`/admin/requests.html`)
2. ⏳ **Aggiungi API** per gestire richieste (cambio status, note)
3. ⏳ **Aggiungi statistiche** (richieste per giorno, conversioni, ecc.)

---

## 📝 Checklist Accesso

- [x] Email configurata → `amministrazione@tradelia.org`
- [x] Database Supabase → Tabella `on_demand_requests` creata
- [x] RLS configurato → Admin possono vedere le richieste
- [x] Indici creati → Performance ottimizzate
- [ ] Dashboard admin web → Da creare (opzionale)

---

## 🔗 Link Utili

- **Supabase Dashboard:** https://app.supabase.com
- **Email Admin:** `amministrazione@tradelia.org`
- **Support Email:** `support@tradelia.org`

---

## 💡 Nota Importante

**Le richieste sono sempre salvate**, anche se l'email fallisce. Questo garantisce che nessuna richiesta vada persa.

**Priorità:**
1. Database Supabase (sempre salvato)
2. Email admin (notifica, non bloccante)
3. Email utente (conferma, non bloccante)

