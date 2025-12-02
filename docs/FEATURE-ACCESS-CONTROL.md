# Feature Access Control - Sistema di Controllo Accesso

## 📋 Panoramica

Sistema di controllo accesso basato su ruoli per gestire le funzionalità disponibili a diversi livelli di utenti.

## 🔐 Livelli di Accesso

### 1. **Guest** (Non autenticato)

- Accesso pubblico
- Nessuna autenticazione richiesta
- Funzionalità limitate

### 2. **Verified** (Account verificato)

- Email verificata
- Account attivo
- Funzionalità base

### 3. **Pro** (Subscription Pro)

- Account Pro attivo
- Accesso a funzionalità avanzate
- Reports, Analytics, Community

### 4. **Desk** (Subscription Desk)

- Account Desk attivo
- Tutte le funzionalità Pro
- **Personalizzazione PDF** (esclusiva Desk)
- Template avanzati
- Branding personalizzato

### 5. **Admin** (Amministratore)

- Solo amministratori
- Accesso completo al sistema
- Gestione utenti, reports, pagamenti

## 📊 Classificazione Funzionalità

### Guest (Accesso Pubblico)

- ✅ `glossary.view` - Visualizza glossario
- ✅ `glossary.search` - Cerca nel glossario
- ✅ `watchlist.view` - Visualizza watchlist (limitata)
- ✅ `education.view` - Visualizza contenuti educativi base

### Verified (Account Verificato)

- ✅ `dashboard.view` - Dashboard principale
- ✅ `dashboard.activity` - Attività utente
- ✅ `dashboard.notifications` - Notifiche
- ✅ `dashboard.settings` - Impostazioni
- ✅ `watchlist.create` - Crea watchlist
- ✅ `watchlist.edit` - Modifica watchlist
- ✅ `portfolio.view` - Visualizza portfolio
- ✅ `portfolio.track` - Traccia posizioni
- ✅ `billing.view` - Visualizza fatturazione
- ✅ `billing.subscribe` - Sottoscrivi subscription
- ✅ `billing.invoices` - Visualizza fatture

### Pro (Subscription Pro)

- ✅ `reports.view` - Visualizza reports
- ✅ `reports.create` - Crea reports
- ✅ `reports.download` - Scarica reports
- ✅ `reports.share` - Condividi reports
- ✅ `portfolio.analytics` - Analytics portfolio avanzate
- ✅ `journal.view` - Trading Journal
- ✅ `journal.create` - Crea entry journal
- ✅ `journal.analytics` - Analytics journal
- ✅ `education.courses` - Corsi avanzati
- ✅ `education.certificates` - Certificati
- ✅ `utilities.view` - Utilities
- ✅ `utilities.calculators` - Calcolatori
- ✅ `utilities.analyzers` - Analizzatori
- ✅ `community.proposals` - Proposte community
- ✅ `community.voting` - Votazioni community
- ✅ `community.discussions` - Discussioni community
- ✅ `requests.view` - Visualizza richieste
- ✅ `requests.create` - Crea richieste
- ✅ `widgets.view` - Widgets
- ✅ `widgets.create` - Crea widgets
- ✅ `widgets.share` - Condividi widgets
- ✅ `print.view` - Stampa reports
- ✅ `analytics.view` - Analytics base

### Desk (Subscription Desk)

- ✅ **Tutte le funzionalità Pro**
- ✅ `reports.pdf.customize` - **Personalizza PDF** (esclusiva)
- ✅ `reports.pdf.templates` - **Template PDF avanzati** (esclusiva)
- ✅ `reports.pdf.branding` - **Branding personalizzato PDF** (esclusiva)
- ✅ `print.customize` - **Personalizza stampa** (esclusiva)
- ✅ `analytics.advanced` - **Analytics avanzate** (esclusiva)

### Admin (Solo Amministratori)

- ✅ `admin.view` - Dashboard admin
- ✅ `admin.users` - Gestione utenti
- ✅ `admin.reports` - Gestione reports
- ✅ `admin.notifications` - Gestione notifiche
- ✅ `admin.payments` - Gestione pagamenti
- ✅ `admin.supabase` - Gestione database

## 🛠️ Utilizzo

### Hook `useFeatureAccess`

```typescript
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';

function MyComponent() {
  const { hasAccess, requiredLevel, isLoading } = useFeatureAccess('reports.create');

  if (isLoading) return <Loading />;

  if (!hasAccess) {
    return <UpgradePrompt requiredLevel={requiredLevel} />;
  }

  return <ReportsCreator />;
}
```

### Hook `useAvailableFeatures`

```typescript
import { useAvailableFeatures } from '@/lib/hooks/useFeatureAccess';

function FeaturesList() {
  const { features, isLoading } = useAvailableFeatures();

  return (
    <ul>
      {features.map(feature => (
        <li key={feature}>{feature}</li>
      ))}
    </ul>
  );
}
```

### Verifica Manuale

```typescript
import { hasAccess } from '@/lib/features/access-control';
import { useUserRole } from '@/lib/hooks/useUserRole';

function MyComponent() {
  const { role } = useUserRole();
  const canCreateReports = hasAccess(role, isEmailVerified, 'reports.create');

  return canCreateReports ? <ReportsCreator /> : <UpgradePrompt />;
}
```

## 🔒 Protezione Route

### Esempio: Proteggere route admin

```typescript
// app/dashboard/admin/page.tsx
import { useIsAdmin } from '@/lib/hooks/useIsAdmin';

export default function AdminPage() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <AdminDashboard />;
}
```

### Esempio: Proteggere feature Pro

```typescript
// app/dashboard/reports/page.tsx
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess';

export default function ReportsPage() {
  const { hasAccess } = useFeatureAccess('reports.view');

  if (!hasAccess) {
    return <UpgradeToProPrompt />;
  }

  return <ReportsList />;
}
```

## 📝 Aggiungere Nuove Funzionalità

1. Aggiungi la feature in `lib/features/access-control.ts`:

```typescript
export const FEATURE_ACCESS: Record<string, AccessLevel> = {
  // ... esistenti
  "nuova.feature": "pro", // o "guest", "verified", "desk", "admin"
};
```

2. Usa la feature nel componente:

```typescript
const { hasAccess } = useFeatureAccess("nuova.feature");
```

## 🎯 Best Practices

1. **Principio del minimo privilegio**: Assegna il livello più basso possibile
2. **Verifica sempre**: Non assumere che l'utente abbia accesso
3. **Feedback chiaro**: Mostra messaggi chiari quando l'accesso è negato
4. **Upgrade prompts**: Offri upgrade quando appropriato
5. **Server-side validation**: Verifica anche lato server (API routes)

## 🔄 Migrazione da `useIsPro`

**Prima:**

```typescript
const isPro = useIsPro();
if (isPro) {
  // Mostra feature Pro
}
```

**Dopo:**

```typescript
const { hasAccess } = useFeatureAccess("reports.create");
if (hasAccess) {
  // Mostra feature Pro
}
```

## 📊 Statistiche Accesso

- **Guest**: 4 funzionalità
- **Verified**: 12 funzionalità
- **Pro**: 25+ funzionalità
- **Desk**: 30+ funzionalità (include esclusive PDF)
- **Admin**: 5 funzionalità admin

## 🔐 Sicurezza

- ✅ Controllo client-side (UX)
- ✅ Controllo server-side (API routes) - **IMPORTANTE**
- ✅ Verifica email per livello "verified"
- ✅ Verifica subscription per "pro" e "desk"
- ✅ Doppio controllo per admin (ruolo + email)

## 📚 Riferimenti

- `lib/features/access-control.ts` - Definizione feature e accessi
- `lib/hooks/useFeatureAccess.ts` - Hook per verificare accesso
- `lib/hooks/useIsAdmin.ts` - Hook per verificare admin
- `lib/hooks/useUserRole.ts` - Hook per ruolo utente
