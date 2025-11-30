# Supabase Admin Interface

## 📋 OVERVIEW

Interfaccia admin completa per gestire direttamente i dati in Supabase dalla dashboard admin.

## 🎯 FUNZIONALITÀ

### 1. **Visualizzazione Tabelle**
- Lista tutte le tabelle disponibili in Supabase
- Ricerca tabelle per nome
- Selezione tabella per visualizzare dati

### 2. **Visualizzazione Dati**
- Tabella interattiva con tutti i record
- Paginazione (50 record per pagina)
- Ricerca nei dati
- Visualizzazione formattata per JSON/oggetti

### 3. **Gestione Record**
- ✅ **Aggiungi**: Crea nuovi record tramite modal JSON
- ✅ **Modifica**: Modifica record esistenti tramite modal JSON
- ✅ **Elimina**: Cancella record con conferma

## 🔐 SICUREZZA

### Controlli Accesso
- ✅ Solo utenti admin possono accedere
- ✅ Verifica tramite `admin_emails` table
- ✅ Validazione nome tabella (prevenzione SQL injection)
- ✅ Service role key solo server-side

### Validazioni
- ✅ Nome tabella: solo caratteri alfanumerici e underscore
- ✅ ID record: validazione prima di eliminare/modificare
- ✅ JSON parsing: validazione prima di inserire/modificare

## 📡 API ENDPOINTS

### `GET /api/admin/supabase/tables`
Lista tutte le tabelle disponibili.

**Response:**
```json
{
  "tables": ["user_profiles", "user_roles", "reports", ...]
}
```

### `GET /api/admin/supabase/data?table=table_name&limit=50&offset=0`
Ottiene i dati di una tabella.

**Query Parameters:**
- `table`: Nome tabella (required)
- `limit`: Numero record per pagina (default: 100)
- `offset`: Offset per paginazione (default: 0)
- `orderBy`: Campo per ordinamento (default: created_at)
- `order`: Direzione ordinamento (asc/desc, default: desc)

**Response:**
```json
{
  "data": [...],
  "count": 150,
  "limit": 50,
  "offset": 0
}
```

### `DELETE /api/admin/supabase/data?table=table_name&id=record_id`
Cancella un record.

**Query Parameters:**
- `table`: Nome tabella (required)
- `id`: ID record da eliminare (required)

**Response:**
```json
{
  "success": true,
  "message": "Record eliminato con successo"
}
```

### `POST /api/admin/supabase/data`
Aggiunge un nuovo record.

**Body:**
```json
{
  "table": "user_profiles",
  "data": {
    "user_id": "...",
    "display_name": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### `PATCH /api/admin/supabase/data`
Modifica un record esistente.

**Body:**
```json
{
  "table": "user_profiles",
  "id": "...",
  "data": {
    "display_name": "Nuovo nome"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

## 🎨 INTERFACCIA

### Layout
- **Sidebar sinistra**: Lista tabelle con ricerca
- **Area principale**: Dati tabella selezionata
- **Modal**: Aggiungi/Modifica record (JSON editor)

### Features UI
- ✅ Ricerca tabelle
- ✅ Ricerca nei dati
- ✅ Paginazione
- ✅ Loading states
- ✅ Error states
- ✅ Toast notifications
- ✅ Conferma eliminazione

## 📊 TABELLE SUPPORTATE

Lista hardcoded delle tabelle conosciute (fallback se query fallisce):
- `user_profiles`
- `user_roles`
- `reports`
- `report_modules`
- `courses`
- `course_progress`
- `notifications`
- `push_subscriptions`
- `user_notification_preferences`
- `favorites`
- `user_activities`
- `achievements`
- `user_achievements`
- `gamification_xp`
- `gamification_streaks`
- `modules`
- `admin_emails`
- `payments`
- `invoices`
- `one_time_services`
- `analysis_requests`
- `asset_proposals`
- `asset_votes`

## ⚠️ LIMITAZIONI

1. **ID Column**: Alcune tabelle potrebbero non avere campo `id` standard. Il sistema prova automaticamente con:
   - `id`
   - `user_id`
   - `report_id`
   - `course_id`
   - `module_id`

2. **JSON Editor**: Richiede JSON valido. Errori di parsing vengono ignorati durante la digitazione.

3. **Performance**: Per tabelle molto grandi (>1000 record), usare filtri o limit appropriati.

## 🚀 USO

1. Accedi come admin a `/dashboard/admin`
2. Clicca sul tab "Supabase"
3. Seleziona una tabella dalla lista
4. Visualizza, modifica o elimina record
5. Usa "Aggiungi Record" per creare nuovi record

## 🔧 TROUBLESHOOTING

### Errore "Nome tabella non valido"
- Verifica che il nome tabella contenga solo lettere minuscole, numeri e underscore
- Non usare caratteri speciali o spazi

### Errore "Impossibile eliminare"
- Verifica che l'ID del record sia corretto
- Alcune tabelle potrebbero richiedere eliminazione tramite foreign key cascade

### Errore "Impossibile caricare tabelle"
- Verifica che `SUPABASE_SERVICE_ROLE_KEY` sia configurato
- Verifica che l'utente sia admin (in `admin_emails` table)

