# Storage Strategy - Best Practice 2025

## Analisi Completa Dati Salvati

### 1. **Chat AI Messages** (`tradelia-ai-chat-messages`)
- **Dati**: Conversazioni utente con AI
- **Dimensione**: Grande (potenzialmente molti messaggi)
- **Best Practice**: 
  - ✅ **IndexedDB** (local-first, performance)
  - ⚠️ **Supabase sync opzionale** (solo per utenti loggati, per backup/continuity)
  - ❌ **NON localStorage** (troppo grande)

### 2. **Favorites** (`tradelia_favorites`)
- **Dati**: Report, corsi, moduli preferiti
- **Dimensione**: Media
- **Best Practice**: 
  - ✅ **IndexedDB** (local-first)
  - ✅ **Supabase sync OBBLIGATORIO** (dati utente, devono essere su server per multi-device)
  - ❌ **NON solo localStorage** (perdita dati tra dispositivi)

### 3. **Analytics Consent** (`analytics_consent`)
- **Dati**: Consenso GDPR per analytics
- **Dimensione**: Piccolo (stringa)
- **Best Practice**: 
  - ✅ **localStorage** (locale OK, GDPR compliance)
  - ⚠️ **Supabase sync opzionale** (per audit trail se utente loggato)
  - ✅ **NO IndexedDB** (overkill per stringa)

### 4. **Locale Preference** (`oslo_locale`)
- **Dati**: Lingua preferita utente
- **Dimensione**: Piccolo (stringa)
- **Best Practice**: 
  - ✅ **localStorage** (locale, fast access)
  - ✅ **Supabase user preferences** (se loggato, per multi-device)
  - ✅ **NO IndexedDB** (overkill)

### 5. **Currency Preference** (`tradelia-currency`)
- **Dati**: Valuta preferita (EUR/USD)
- **Dimensione**: Piccolo (stringa)
- **Best Practice**: 
  - ✅ **localStorage** (locale, fast access)
  - ✅ **Supabase user preferences** (se loggato, per multi-device)
  - ✅ **NO IndexedDB** (overkill)

### 6. **Exchange Rate Cache** (`tradelia_exchange_rate`)
- **Dati**: Cache tasso cambio API
- **Dimensione**: Piccolo (oggetto con rate + timestamp)
- **Best Practice**: 
  - ✅ **localStorage** (cache temporanea, locale OK)
  - ❌ **NO Supabase** (cache non è dato utente)
  - ❌ **NO IndexedDB** (overkill)

### 7. **Daily Login Check** (`gamification-daily-check`)
- **Dati**: Data ultimo check giornaliero
- **Dimensione**: Piccolo (stringa data)
- **Best Practice**: 
  - ✅ **localStorage** (locale, fast check)
  - ✅ **Supabase sync** (per gamification stats, se loggato)
  - ✅ **NO IndexedDB** (overkill)

### 8. **Account Banner Dismissed** (`account-banner-dismissed`)
- **Dati**: UI state (banner nascosto)
- **Dimensione**: Piccolo (boolean)
- **Best Practice**: 
  - ✅ **localStorage** (locale UI state, OK)
  - ❌ **NO Supabase** (UI state non è dato utente)
  - ❌ **NO IndexedDB** (overkill)

### 9. **PWA Install Dismissed** (`pwa-install-dismissed`)
- **Dati**: UI state (PWA prompt nascosto)
- **Dimensione**: Piccolo (timestamp)
- **Best Practice**: 
  - ✅ **localStorage** (locale UI state, OK)
  - ❌ **NO Supabase** (UI state non è dato utente)
  - ❌ **NO IndexedDB** (overkill)

### 10. **Welcome Tour Completed** (`welcome-tour-completed`)
- **Dati**: UI state (tour completato)
- **Dimensione**: Piccolo (boolean)
- **Best Practice**: 
  - ✅ **localStorage** (locale UI state)
  - ⚠️ **Supabase user preferences** (opzionale, se loggato)
  - ✅ **NO IndexedDB** (overkill)

### 11. **Legal Consent** (`tradelia-legal-consent`)
- **Dati**: Consenso legale GDPR
- **Dimensione**: Piccolo (stringa)
- **Best Practice**: 
  - ✅ **localStorage** (locale, GDPR compliance)
  - ✅ **Supabase sync OBBLIGATORIO** (per audit trail legale)
  - ✅ **NO IndexedDB** (overkill)

### 12. **Chat State** (`tradelia-ai-chat-state`)
- **Dati**: UI state (chat aperta/chiusa)
- **Dimensione**: Piccolo (stringa)
- **Best Practice**: 
  - ✅ **sessionStorage** (temporaneo, solo sessione)
  - ❌ **NO localStorage** (non serve persistenza)
  - ❌ **NO Supabase** (UI state)

---

## Strategia Unificata

### Regole di Decisione

1. **IndexedDB** → Dati grandi (>1KB) o strutturati complessi
   - Chat messages
   - Favorites (con sync Supabase)
   - Portfolio data
   - Watchlist data

2. **localStorage** → Dati piccoli (<1KB), preferenze, UI state
   - Consensi (analytics, legal)
   - Preferenze (locale, currency)
   - UI state (banner dismissed, tour completed)
   - Cache temporanea (exchange rate)

3. **sessionStorage** → Dati temporanei solo per sessione
   - Chat state (aperta/chiusa)
   - Form drafts temporanei

4. **Supabase** → Dati utente che devono essere sincronizzati
   - **OBBLIGATORIO**: Favorites, Legal Consent, User Preferences
   - **OPZIONALE**: Chat messages (backup), Daily login (gamification)

---

## Implementazione

### Sistema Unificato (`lib/storage/storage.ts`)

```typescript
// Automaticamente sceglie IndexedDB o localStorage
await setItem('tradelia-ai-chat-messages', messages); // → IndexedDB
await setItem('analytics_consent', 'true'); // → localStorage
```

### Sync Supabase (`lib/storage/sync.ts`)

```typescript
// Sync automatico per dati utente
await syncToSupabase('favorites', favorites); // OBBLIGATORIO
await syncToSupabase('legal-consent', consent); // OBBLIGATORIO
await syncToSupabase('chat-messages', messages); // OPZIONALE
```

---

## Checklist Migrazione

- [x] Sistema storage unificato creato
- [ ] Chat AI usa IndexedDB ✅
- [ ] Favorites: IndexedDB + Supabase sync (TODO)
- [ ] Legal Consent: localStorage + Supabase sync (TODO)
- [ ] User Preferences: localStorage + Supabase sync (TODO)
- [ ] Tutti gli altri: localStorage (già OK)

---

## Best Practice Finale

1. **Local-First**: Tutti i dati partono da storage locale per UX
2. **Sync Strategico**: Solo dati utente importanti su Supabase
3. **Performance**: IndexedDB per grandi dati, localStorage per piccoli
4. **Privacy**: Consensi sempre locali (GDPR), sync opzionale per audit
5. **UX**: Nessun delay, sync in background
