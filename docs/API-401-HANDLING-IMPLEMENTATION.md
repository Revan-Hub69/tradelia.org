# Implementazione: Gestione Centralizzata Errori 401

## Architettura Implementata

### 1. Wrapper Fetch Centralizzato (`lib/api/fetch-client.ts`)

**Funzionalità:**

- Intercetta tutte le richieste HTTP
- Gestisce 401 globalmente con redirect automatico al login
- Mantiene una coda di richieste fallite per retry automatico dopo login
- Previene redirect multipli con flag `isRedirectingToLogin`

**API:**

```typescript
authenticatedFetch(url, options); // Wrapper fetch con gestione 401
resetAuthState(); // Reset stato dopo login
registerAuthRetry(callback); // Registra callback per retry dopo login
isRedirecting(); // Check se stiamo reindirizzando
```

### 2. Hook Stato Autenticazione (`lib/hooks/useAuthState.ts`)

**Funzionalità:**

- Integrazione con Supabase auth state
- Ascolta cambiamenti di autenticazione in tempo reale
- Fornisce stato globale `isAuthenticated`, `isLoading`, `user`
- Reset automatico dello stato fetch dopo login

**API:**

```typescript
useAuthState(); // Hook completo con stato auth
useIsAuthenticated(); // Hook semplificato (solo boolean)
```

### 3. Integrazione in `useApi`

**Miglioramenti:**

- Usa `authenticatedFetch` invece di `fetch` nativo
- Integra con `useAuthState` per retry automatico
- Blocca richieste quando utente non autenticato (dopo che auth state è determinato)
- Retry automatico quando utente si autentica

**Comportamento:**

1. Richiesta fallisce con 401 → `authenticatedFetch` intercetta
2. Redirect automatico a `/login?redirect=/current-path`
3. Richiesta registrata per retry automatico
4. Dopo login → `resetAuthState()` chiamato
5. Tutte le richieste fallite vengono automaticamente riprovate

## Flusso Completo

```
User Request → useApi → authenticatedFetch → API Route
                                    ↓
                            [401 Unauthorized]
                                    ↓
                    authenticatedFetch intercetta
                                    ↓
                    Redirect a /login?redirect=...
                                    ↓
                    Registra callback per retry
                                    ↓
                    [User fa login]
                                    ↓
                    useAuthState rileva SIGNED_IN
                                    ↓
                    resetAuthState() chiamato
                                    ↓
                    Tutte le richieste fallite vengono riprovate
```

## Vantaggi

✅ **Gestione Centralizzata**: Un solo punto per gestire 401
✅ **Redirect Automatico**: Nessun codice duplicato nei componenti
✅ **Retry Automatico**: Richieste fallite vengono riprovate dopo login
✅ **Integrazione Supabase**: Ascolta cambiamenti auth in tempo reale
✅ **Prevenzione Loop**: Flag globale previene redirect multipli
✅ **Best Practice**: Segue pattern industry standard

## Esempi d'Uso

### Uso Base (Nessun Cambiamento Necessario)

```typescript
// I componenti esistenti continuano a funzionare
const { data, loading, error } = useApi("/api/dashboard/stats");
```

### Controllo Stato Auth

```typescript
import { useAuthState } from '@/lib/hooks/useAuthState';

function MyComponent() {
  const { isAuthenticated, isLoading, user } = useAuthState();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <LoginPrompt />;

  return <Dashboard user={user} />;
}
```

### Fetch Manuale con Gestione 401

```typescript
import { authenticatedFetch } from "@/lib/api/fetch-client";

async function fetchData() {
  try {
    const response = await authenticatedFetch("/api/data");
    const data = await response.json();
    return data;
  } catch (error) {
    // 401 gestito automaticamente (redirect)
    // Altri errori gestiti normalmente
  }
}
```

## Testing

### Test Scenario 1: Richiesta Non Autenticata

1. Utente non autenticato fa richiesta
2. API ritorna 401
3. `authenticatedFetch` intercetta
4. Redirect a `/login?redirect=/dashboard`
5. ✅ Verificato

### Test Scenario 2: Login e Retry Automatico

1. Utente non autenticato fa richiesta → 401
2. Utente fa login
3. `useAuthState` rileva `SIGNED_IN`
4. `resetAuthState()` chiamato
5. Richiesta originale viene riprovata automaticamente
6. ✅ Verificato

### Test Scenario 3: Prevenzione Loop

1. Multiple richieste simultanee → tutte 401
2. Solo un redirect viene eseguito
3. Flag `isRedirectingToLogin` previene redirect multipli
4. ✅ Verificato

## Note Tecniche

- **Thread Safety**: Flag globale `isRedirectingToLogin` previene race conditions
- **Memory Management**: Callback retry vengono puliti dopo uso
- **Performance**: Nessun overhead significativo, solo wrapper fetch
- **Compatibilità**: Funziona con tutti i componenti esistenti senza modifiche

## Migrazione

**Nessuna migrazione necessaria!** I componenti esistenti continuano a funzionare senza modifiche. La gestione 401 è completamente trasparente.

## Prossimi Passi (Opzionali)

1. **Toast Notification**: Mostrare notifica quando redirect a login
2. **Retry con Backoff**: Aggiungere backoff esponenziale per retry automatici
3. **Analytics**: Tracciare 401 errors per monitoring
4. **Custom Redirect**: Permettere redirect personalizzati per route specifiche
