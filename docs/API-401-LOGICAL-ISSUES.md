# Problemi Logici Identificati

## 🔴 Problema 1: Loop Infinito Potenziale in useApi

**Location**: `lib/hooks/useApi.ts:196-206`

**Problema**:

```typescript
const fetchData = useCallback(async () => {
  // ... usa isAuthenticated e authLoading
}, [url, enabled, shouldRetry, cacheTime, isAuthenticated, authLoading, ...]);

useEffect(() => {
  fetchData(); // fetchData cambia quando isAuthenticated/authLoading cambiano
}, [fetchData]);
```

**Causa**:

- `fetchData` dipende da `isAuthenticated` e `authLoading`
- Quando questi cambiano, `fetchData` viene ricreato
- Questo triggera il `useEffect` che chiama `fetchData`
- Se `fetchData` cambia lo stato, può causare re-render e loop

**Fix Necessario**: Rimuovere `isAuthenticated` e `authLoading` dalle dipendenze di `fetchData`, usare ref invece.

---

## 🔴 Problema 2: Retry Automatico Non Funziona

**Location**: `lib/hooks/useApi.ts:97-107` e `lib/api/fetch-client.ts:69-73`

**Problema**:

1. Se utente non autenticato, `useApi` blocca la richiesta (linea 115)
2. Quindi `authenticatedFetch` non viene mai chiamato
3. Quindi `registerAuthRetry` non viene mai chiamato (solo se 401)
4. Quindi il retry automatico non funziona

**Flusso Attuale (SBAGLIATO)**:

```
useApi → !isAuthenticated → return (blocca) → ❌ authenticatedFetch mai chiamato
```

**Fix Necessario**: Permettere la richiesta anche se non autenticato, lasciare che `authenticatedFetch` gestisca il 401.

---

## 🔴 Problema 3: Reset Auth State Chiamato Troppo Presto

**Location**: `lib/hooks/useAuthState.ts:43-45`

**Problema**:

```typescript
if (user && !error) {
  resetAuthState(); // Chiamato anche all'inizializzazione
}
```

**Causa**: Se l'utente è già autenticato all'avvio, `resetAuthState()` viene chiamato immediatamente, causando retry di richieste che non sono mai fallite.

**Fix Necessario**: Chiamare `resetAuthState()` solo quando c'è un cambio di stato (da non autenticato a autenticato).

---

## 🔴 Problema 4: Race Condition in Retry

**Location**: `lib/api/fetch-client.ts:12-16`

**Problema**:

```typescript
export function resetAuthState() {
  isRedirectingToLogin = false;
  pendingRequests.forEach((retry) => retry()); // Tutti i retry insieme
  pendingRequests = [];
}
```

**Causa**: Tutti i retry vengono eseguiti simultaneamente, potrebbero causare race conditions o sovraccarico del server.

**Fix Necessario**: Eseguire retry con delay o sequenzialmente.

---

## 🔴 Problema 5: useApi Richiede Sempre Auth

**Location**: `lib/hooks/useApi.ts:86`

**Problema**: `useApi` chiama sempre `useAuthState()`, anche per API pubbliche che non richiedono autenticazione.

**Causa**: Non c'è modo di disabilitare il check di autenticazione per API pubbliche.

**Fix Necessario**: Aggiungere opzione `requireAuth?: boolean` per permettere API pubbliche.

---

## 🔴 Problema 6: Dipendenza Circolare Potenziale

**Location**: `lib/hooks/useApi.ts:107`

**Problema**:

```typescript
useEffect(() => {
  if (isAuthenticated && !authLoading && hasFailedRef.current && url) {
    fetchData(); // fetchData dipende da isAuthenticated
  }
}, [isAuthenticated, authLoading, url]); // Ma fetchData non è nelle dipendenze!
```

**Causa**: `fetchData` non è nelle dipendenze ma viene usato. Questo può causare stale closure.

**Fix Necessario**: Aggiungere `fetchData` alle dipendenze o usare ref.

---

## 🔴 Problema 7: Redirect Durante SSR

**Location**: `lib/api/fetch-client.ts:51-53`

**Problema**:

```typescript
if (typeof window !== "undefined") {
  window.location.href = redirectUrl;
}
```

**Causa**: Se chiamato durante SSR, il redirect non funziona. Ma il check è presente, quindi ok. Tuttavia, se `authenticatedFetch` viene chiamato durante SSR, potrebbe causare problemi.

**Fix Necessario**: Assicurarsi che `authenticatedFetch` non venga mai chiamato durante SSR.

---

## 🔴 Problema 8: Multiple useAuthState Instances

**Location**: `lib/hooks/useAuthState.ts`

**Problema**: Ogni componente che usa `useApi` crea una nuova istanza di `useAuthState`, causando multiple subscription a Supabase.

**Causa**: Non c'è Context Provider per condividere lo stato.

**Fix Necessario**: Creare un Context Provider per condividere lo stato di autenticazione.

---

## Priorità Fix

1. **CRITICO**: Problema 1 (Loop infinito)
2. **CRITICO**: Problema 2 (Retry non funziona)
3. **ALTO**: Problema 3 (Reset troppo presto)
4. **MEDIO**: Problema 4 (Race condition)
5. **MEDIO**: Problema 5 (API pubbliche)
6. **BASSO**: Problema 6 (Stale closure)
7. **BASSO**: Problema 7 (SSR)
8. **BASSO**: Problema 8 (Multiple instances)
