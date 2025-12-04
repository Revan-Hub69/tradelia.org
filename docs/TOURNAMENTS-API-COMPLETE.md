# Tournaments API - Complete Reference

## Overview
Documentazione completa di tutte le API per il sistema di tornei.

## Base URL
`/api/tournaments`

## Authentication
Tutte le API richiedono autenticazione (tranne GET pubblici). Admin-only endpoints richiedono ruolo `admin`.

---

## Tournament Management

### GET /api/tournaments
Lista tutti i tornei disponibili.

**Query Parameters:**
- `status` (optional): Filtra per status (`draft`, `open_registration`, `in_progress`, `completed`, `cancelled`)
- `format` (optional): Filtra per format (`daily`, `weekly`, `monthly`, `custom`)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Weekly Standard",
    "description": "...",
    "format": "weekly",
    "status": "open_registration",
    "entry_fee_xp": 50,
    "prize_type": "pro_access",
    "prize_pro_access_duration_days": 30,
    ...
  }
]
```

### GET /api/tournaments/[id]
Dettagli completi di un torneo.

**Response:**
```json
{
  "id": "uuid",
  "name": "...",
  "participantsCount": 25,
  "rules": [...],
  ...
}
```

### POST /api/tournaments
Crea nuovo torneo (Admin only).

**Body:**
```json
{
  "name": "My Tournament",
  "description": "...",
  "format": "weekly",
  "templateId": "uuid", // Optional: use template
  "registrationStart": "2024-01-01T00:00:00Z",
  "registrationEnd": "2024-01-07T00:00:00Z",
  "startDate": "2024-01-08T00:00:00Z",
  "endDate": "2024-01-15T00:00:00Z",
  "initialCapital": 10000,
  "entryFeeXP": 50,
  "prizeType": "pro_access",
  "prizeProAccessDays": 30,
  ...
}
```

### PATCH /api/tournaments/[id]
Aggiorna torneo (Admin only).

**Body:** Qualsiasi campo del torneo.

---

## Tournament Templates

### GET /api/tournaments/templates
Lista tutti i template disponibili.

**Query Parameters:**
- `format` (optional): Filtra per format

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Weekly Standard",
    "format": "weekly",
    "default_initial_capital": 10000,
    "default_entry_fee_xp": 50,
    ...
  }
]
```

---

## Tournament Registration

### POST /api/tournaments/[id]/register
Registrati a un torneo (paga entry fee XP se richiesto).

**Response (Success):**
```json
{
  "id": "uuid",
  "tournament_id": "uuid",
  "user_id": "uuid",
  "entry_fee_paid": true,
  ...
}
```

**Response (Insufficient XP):**
```json
{
  "error": "Insufficient XP",
  "required": 50,
  "available": 25
}
```

**Status Codes:**
- `201`: Registrato con successo
- `400`: Già registrato o periodo chiuso
- `402`: XP insufficiente
- `403`: Requisiti non soddisfatti (Pro, level, etc.)

---

## Tournament Trading

### GET /api/tournaments/[id]/positions
Lista posizioni aperte nel torneo (utente corrente).

**Response:**
```json
[
  {
    "id": "uuid",
    "symbol": "AAPL",
    "side": "long",
    "quantity": 10,
    "entry_price": 150.00,
    "current_price": 155.00,
    "unrealized_pnl": 50.00,
    ...
  }
]
```

### POST /api/tournaments/[id]/positions
Apri nuova posizione nel torneo.

**Body:**
```json
{
  "symbol": "AAPL",
  "assetType": "stock",
  "side": "long",
  "quantity": 10,
  "entryPrice": 150.00,
  "currentPrice": 150.00,
  "strategy": "moving-average-crossover"
}
```

**Validation:**
- Verifica position size limit
- Verifica tournament in progress
- Verifica partecipante attivo

### PATCH /api/tournaments/[id]/positions/[positionId]
Aggiorna prezzo corrente di una posizione.

**Body:**
```json
{
  "currentPrice": 155.00
}
```

### DELETE /api/tournaments/[id]/positions/[positionId]
Chiudi posizione (move to history, update stats, update rankings).

**Response:**
```json
{
  "success": true
}
```

**Side Effects:**
- Aggiunge trade a history
- Aggiorna participant stats (P&L, trades, win rate)
- Aggiorna rankings automaticamente

---

## Tournament Stats

### GET /api/tournaments/[id]/stats
Statistiche del partecipante corrente nel torneo.

**Response:**
```json
{
  "id": "uuid",
  "current_rank": 5,
  "score": 1.25,
  "total_return_percent": 12.5,
  "sharpe_ratio": 1.2,
  "total_trades": 15,
  "win_rate": 60.0,
  "openPositions": 3,
  "tournament": {
    "name": "Weekly Standard",
    "scoring_method": "sharpe_ratio"
  }
}
```

---

## Tournament Leaderboard

### GET /api/tournaments/[id]/leaderboard
Classifica del torneo (top N).

**Query Parameters:**
- `limit` (optional): Numero di partecipanti (default: 100)

**Response:**
```json
[
  {
    "id": "uuid",
    "current_rank": 1,
    "score": 1.5,
    "total_return_percent": 25.0,
    "sharpe_ratio": 1.8,
    "user_id": "uuid",
    "user_profiles": {
      "display_name": "Trader123",
      "avatar_url": "..."
    }
  },
  ...
]
```

---

## Admin Management

### POST /api/tournaments/[id]/launch
Lancia torneo (draft → open_registration) - Admin only.

**Response:**
```json
{
  "id": "uuid",
  "status": "open_registration",
  ...
}
```

**Status Codes:**
- `400`: Tournament non in draft status

### POST /api/tournaments/[id]/start
Avvia torneo (open_registration → in_progress) - Admin only.

**Response:**
```json
{
  "id": "uuid",
  "status": "in_progress",
  ...
}
```

**Status Codes:**
- `400`: Tournament non in open_registration o registration period non finito

### POST /api/tournaments/[id]/complete
Completa torneo (in_progress → completed) e distribuisci premi - Admin only.

**Response:**
```json
{
  "id": "uuid",
  "status": "completed",
  "prizesAwarded": true
}
```

**Side Effects:**
- Calcola final rankings
- Distribuisce premi automaticamente:
  - Pro/Desk access
  - XP pool
  - Achievements

---

## Error Responses

Tutte le API ritornano errori standard:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not admin or requirements not met)
- `404`: Not Found
- `402`: Payment Required (insufficient XP)
- `500`: Internal Server Error

---

## Workflow Completo

### Admin Workflow
1. **Create**: `POST /api/tournaments` (con template opzionale)
2. **Launch**: `POST /api/tournaments/[id]/launch`
3. **Start**: `POST /api/tournaments/[id]/start` (quando registration finisce)
4. **Complete**: `POST /api/tournaments/[id]/complete` (quando tournament finisce)

### User Workflow
1. **Browse**: `GET /api/tournaments?status=open_registration`
2. **View**: `GET /api/tournaments/[id]`
3. **Register**: `POST /api/tournaments/[id]/register` (paga XP)
4. **Trade**: 
   - `POST /api/tournaments/[id]/positions` (apri)
   - `PATCH /api/tournaments/[id]/positions/[id]` (aggiorna prezzo)
   - `DELETE /api/tournaments/[id]/positions/[id]` (chiudi)
5. **Check Stats**: `GET /api/tournaments/[id]/stats`
6. **View Leaderboard**: `GET /api/tournaments/[id]/leaderboard`

---

## Database Functions

### update_tournament_rankings(tournament_id)
Aggiorna rankings basati su score corrente.

**Called automatically:**
- Dopo ogni posizione chiusa
- Quando tournament completa

### calculate_tournament_score(tournament_id, participant_id)
Calcola score basato su `scoring_method`:
- `sharpe_ratio`: Sharpe Ratio
- `total_return`: Total Return %
- `calmar_ratio`: Calmar Ratio
- `composite`: Weighted combination

### award_tournament_prizes(tournament_id)
Distribuisce premi automaticamente ai top N.

**Called automatically:**
- Quando tournament status → `completed`

---

## Best Practices

### Error Handling
- Sempre controllare status codes
- Gestire `402` (insufficient XP) con UI chiara
- Mostrare messaggi di errore user-friendly

### Performance
- Cache leaderboard (5-10 secondi)
- Aggiorna stats solo quando necessario
- Usa pagination per leaderboard grandi

### Security
- Verifica sempre autenticazione
- Verifica admin role per management endpoints
- Verifica tournament status per trading endpoints
- Verifica participant ownership per positions

---

## Conclusion

Tutte le API sono complete e pronte per l'implementazione UI. Il sistema supporta:
- ✅ Creazione e gestione tornei (admin)
- ✅ Registrazione con pagamento XP
- ✅ Trading isolato per torneo
- ✅ Stats e leaderboard real-time
- ✅ Distribuzione automatica premi
