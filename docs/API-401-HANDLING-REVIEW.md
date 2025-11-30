# Review: Gestione Errori 401 - Best Practices

## Problema Identificato

Gli errori 401 (Unauthorized) causavano loop infiniti di richieste perché `useApi` continuava a riprovare anche dopo errori di autenticazione.

## Soluzione Implementata

### Approccio Attuale

- **Flag locale per istanza**: Ogni hook `useApi` mantiene un flag `isUnauthorizedRef` che blocca ulteriori richieste dopo un 401
- **Reset automatico**: Il flag viene resettato quando:
  - L'URL cambia
  - L'utente fa retry manuale
  - L'utente fa refetch manuale

### Limiti dell'Approccio Attuale

❌ **Non è una best practice completa** perché:

1. **Gestione isolata**: Ogni hook gestisce il 401 in modo isolato, non c'è coordinamento tra componenti
2. **Nessun redirect centralizzato**: Non c'è un sistema per reindirizzare l'utente al login
3. **Nessuna integrazione con auth state**: Non si integra con lo stato globale di autenticazione Supabase
4. **Nessun retry automatico dopo login**: Se l'utente si autentica, le richieste non vengono automaticamente riprovate

## Best Practices Raccomandate

### 1. Interceptor HTTP Centralizzato

```typescript
// lib/api/fetch-client.ts
let isRedirectingToLogin = false;

export async function authenticatedFetch(url: string, options?: RequestInit): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401 && !isRedirectingToLogin) {
    isRedirectingToLogin = true;
    // Redirect to login
    window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
    throw new Error("Unauthorized");
  }

  return response;
}
```

### 2. Sistema di Stato Globale per Auth

```typescript
// lib/auth/auth-context.tsx
export const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
}>({ isAuthenticated: false, isLoading: true });

// In useApi, controllare lo stato globale
const { isAuthenticated } = useContext(AuthContext);
if (!isAuthenticated) {
  // Non fare richieste
  return;
}
```

### 3. Integrazione con Supabase Auth State

```typescript
// lib/hooks/useAuthState.ts
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Check initial state
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return isAuthenticated;
}
```

### 4. Retry Automatico Dopo Login

```typescript
// In useApi, ascoltare i cambiamenti di auth
useEffect(() => {
  if (isAuthenticated && isUnauthorizedRef.current) {
    // User just logged in, retry the request
    isUnauthorizedRef.current = false;
    fetchData();
  }
}, [isAuthenticated]);
```

## Soluzione Migliorata (Raccomandata)

### Opzione A: Wrapper Fetch Centralizzato

- Creare un wrapper `authenticatedFetch` che gestisce 401 globalmente
- Usare questo wrapper in `useApi` invece di `fetch` nativo
- Redirect centralizzato al login

### Opzione B: React Query / SWR

- Usare una libreria matura come React Query o SWR
- Hanno già gestione built-in per errori di autenticazione
- Supporto per retry automatico e gestione stato globale

### Opzione C: Middleware Next.js

- Usare middleware per proteggere le route API
- Redirect automatico a livello di middleware
- Meno controllo lato client

## Conclusione

La soluzione attuale **risolve il problema immediato** (loop infiniti) ma **non è una best practice completa**.

### Pro

✅ Ferma i loop infiniti
✅ Semplice da implementare
✅ Funziona subito

### Contro

❌ Gestione isolata per componente
❌ Nessun redirect centralizzato
❌ Nessuna integrazione con auth state globale
❌ Nessun retry automatico dopo login

### Raccomandazione

Per una soluzione production-ready, implementare:

1. Wrapper fetch centralizzato con interceptor 401
2. Sistema di stato globale per autenticazione
3. Redirect automatico al login
4. Retry automatico dopo autenticazione
