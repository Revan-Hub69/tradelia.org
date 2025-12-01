# Real-Time Integration - Documentazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Sistema completo per aggiornamenti real-time di prezzi, alert checking, notifiche push e sincronizzazione progress corsi.

---

## 🔄 PRICE UPDATES

### Hook: `usePriceUpdates`

**File**: `lib/hooks/usePriceUpdates.ts`

**Features**:
- Polling intelligente ogni 30 secondi
- Cache locale per evitare chiamate duplicate
- Exponential backoff su errori
- Cleanup automatico su unmount
- Supporto per multiple symbols

**Usage**:
```typescript
const { prices, pricesMap, loading, error, refetch } = usePriceUpdates({
  symbols: ['AAPL', 'TSLA', 'BTC-USD'],
  interval: 30000, // 30 secondi
  enabled: true,
  onUpdate: (updates) => {
    console.log('Price updates:', updates);
  },
  onError: (error) => {
    console.error('Price update error:', error);
  },
});
```

**API Endpoint**: `GET /api/prices?symbols=AAPL,TSLA,BTC-USD`

**Response**:
```json
{
  "AAPL": {
    "price": 150.25,
    "change": 2.5,
    "changePercent": 1.69
  },
  "TSLA": {
    "price": 250.50,
    "change": -5.0,
    "changePercent": -1.96
  }
}
```

**Best Practices**:
- Polling ogni 30s per balance tra real-time e rate limits
- Cache locale per evitare chiamate duplicate (5s cooldown per symbol)
- Exponential backoff: 30s, 60s, 120s, max 300s
- Max 50 symbols per richiesta

---

## 🔔 ALERT CHECKING

### Endpoint: `POST /api/watchlist/check-alerts`

**File**: `app/api/watchlist/check-alerts/route.ts`

**Features**:
- Controlla tutti gli alert attivi non ancora triggerati
- Batch processing (max 50 asset per batch)
- Multi-provider con fallback (Finnhub, Binance, Yahoo Finance)
- Rate limiting rispettato (Finnhub: 60/min, Binance: 1200/min)

**Cron Job Endpoint**: `POST /api/cron/check-alerts`

**Setup Cron**:
1. **Vercel Cron** (vercel.json):
```json
{
  "crons": [{
    "path": "/api/cron/check-alerts",
    "schedule": "*/5 * * * *"
  }]
}
```

2. **Supabase Edge Function**:
```typescript
// Supabase Edge Function che chiama l'endpoint ogni 5 minuti
```

3. **External Cron Service** (cron-job.org, etc.):
- URL: `https://your-domain.com/api/cron/check-alerts`
- Schedule: Every 5 minutes
- Headers: `Authorization: Bearer ${CRON_SECRET}`

**Environment Variables**:
- `CRON_SECRET`: Secret per autenticare chiamate cron

**Flow**:
1. Cron job chiama `/api/cron/check-alerts` ogni 5 minuti
2. Endpoint chiama `/api/watchlist/check-alerts`
3. Sistema controlla alert attivi
4. Se condizione soddisfatta, triggera alert
5. Invia notifiche (push, email, SMS) se configurate

---

## 📱 NOTIFICATION SYSTEM

### Push Notifications

**Trigger**: Quando un alert viene triggerato

**File**: `app/api/watchlist/check-alerts/route.ts` (funzione `triggerAlert`)

**Channels**:
- Push notifications (via `/api/notifications/send`)
- Email notifications
- SMS notifications (se configurato)

**Message Format**:
```
Alert: {symbol}
{symbol} ha raggiunto ${price} (target: ${target})
```

**History**: Salvato in `watchlist_alert_history` table

---

## 📚 PROGRESS SYNC

### Course Progress

**API Endpoint**: `POST /api/courses/[slug]/lessons/[lessonId]/complete`

**File**: `app/api/courses/[slug]/lessons/[lessonId]/complete/route.ts`

**Features**:
- Auto-sync progress quando lezione completata
- Aggiorna `education_user_progress` table
- Calcola `progress_percentage` automaticamente
- Trigger per badge/achievements

**Real-time Updates**:
- Progress aggiornato immediatamente dopo completamento
- UI aggiornata via SWR revalidation
- Notifiche push per milestone (es. "Corso completato!")

---

## 🎯 ACTIVITY FEED

### Real-time Activity Updates

**API Endpoint**: `GET /api/dashboard/activities`

**Features**:
- Aggiornamenti attività utente
- Completamento corsi, trade aggiunti, alert triggerati
- Real-time via SWR polling (ogni 30s)

**Future Enhancement**:
- WebSocket per true real-time (se necessario)
- Supabase Realtime subscriptions

---

## 🔧 CONFIGURATION

### Environment Variables

```env
# Cron Secret
CRON_SECRET=your-secret-key-here

# App URL (per cron job)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Price API Keys (già configurati)
FINNHUB_API_KEY=...
BINANCE_API_KEY=...
```

### Polling Intervals

- **Price Updates**: 30 secondi (configurabile)
- **Alert Checking**: 5 minuti (cron job)
- **Activity Feed**: 30 secondi (SWR polling)

---

## 📊 PERFORMANCE

### Rate Limiting

- **Price API**: 
  - Finnhub: 60 calls/min
  - Binance: 1200 calls/min
  - Yahoo Finance: Illimitato (fallback)

- **Batch Processing**:
  - Max 50 asset per batch
  - Raggruppamento per symbol per ridurre chiamate

### Caching

- **Price Cache**: 5 secondi cooldown per symbol
- **API Cache**: 30 secondi (SWR default)
- **Local Cache**: Map-based per evitare re-render

---

## ✅ CHECKLIST COMPLETAMENTO

### Price Updates
- [x] Hook `usePriceUpdates` ✅
- [x] API endpoint `/api/prices` ✅
- [x] Integrazione PortfolioManager ✅
- [x] Cache intelligente ✅
- [x] Exponential backoff ✅

### Alert Checking
- [x] Endpoint `/api/watchlist/check-alerts` ✅
- [x] Cron job endpoint `/api/cron/check-alerts` ✅
- [x] Multi-provider support ✅
- [x] Batch processing ✅

### Notification System
- [x] Push notifications su alert trigger ✅
- [x] Email notifications (se configurate) ✅
- [x] Alert history tracking ✅

### Progress Sync
- [x] Auto-sync course progress ✅
- [x] Real-time UI updates ✅

### Activity Feed
- [x] API endpoint `/api/dashboard/activities` ✅
- [x] SWR polling ✅

---

## 🚀 DEPLOYMENT

### 1. Setup Cron Job

**Vercel**:
Aggiungi `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/check-alerts",
    "schedule": "*/5 * * * *"
  }]
}
```

**Supabase Edge Function**:
Crea Edge Function che chiama l'endpoint ogni 5 minuti.

**External Service**:
Configura cron-job.org o simile con:
- URL: `https://your-domain.com/api/cron/check-alerts`
- Headers: `Authorization: Bearer ${CRON_SECRET}`
- Schedule: Every 5 minutes

### 2. Environment Variables

Aggiungi a `.env`:
```env
CRON_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Test

```bash
# Test price updates
curl http://localhost:3000/api/prices?symbols=AAPL,TSLA

# Test alert checking (richiede auth)
curl -X POST http://localhost:3000/api/watchlist/check-alerts

# Test cron endpoint
curl -X POST http://localhost:3000/api/cron/check-alerts \
  -H "Authorization: Bearer your-secret-key-here"
```

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

