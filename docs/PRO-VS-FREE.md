# Pro vs Gratuito - Logiche e Permessi

## Panoramica

Questo documento definisce chiaramente cosa è disponibile gratuitamente e cosa richiede un account Pro.

## Account Types

- **Guest/Non registrato**: Accesso limitato, solo visualizzazione
- **Trial/Registrato**: Accesso base con alcune limitazioni
- **Pro**: Accesso completo a tutte le funzionalità
- **Institutional**: Accesso Pro + funzionalità enterprise
- **Admin**: Accesso completo + pannello amministrazione

## Sezioni Dashboard - Accesso

### ✅ GRATUITO (Tutti gli utenti)

1. **Dashboard Overview**
   - Visualizzazione statistiche base
   - Panoramica generale

2. **Quick Links**
   - Glossario (pubblico)
   - Widget (personalizzazione base)
   - Link a Utilities Pro (mostra badge "Pro" se non Pro)

3. **Recent Activity**
   - Visualizzazione attività recenti
   - Filtri base

4. **Favorites**
   - Salvataggio contenuti preferiti
   - Accesso ai preferiti salvati

5. **Progress Tracking**
   - Visualizzazione progresso corsi
   - Achievement sbloccati

6. **Module Grid - Primary**
   - Report Ufficiali (visualizzazione)
   - Percorsi Formativi (visualizzazione)
   - Framework Documentation (visualizzazione)
   - Storico Richieste (visualizzazione proprie richieste)

7. **Module Grid - Secondary**
   - Brokers (confronto e gestione)
   - Notifiche (visualizzazione)
   - Impostazioni (base)
   - Risorse & Supporto

8. **Global Search**
   - Ricerca contenuti pubblici
   - Shortcut Ctrl+K

9. **User Menu**
   - Profilo
   - Notifiche
   - Impostazioni
   - Logout

10. **Help & Support**
    - FAQ
    - Guide
    - Documentazione

### 🔒 PRO ONLY (Richiede account Pro)

1. **Pro Utilities Drawer** (Floating Button)
   - **Portfolio Manager**: Gestione completa portafoglio
   - **Financial Calculator**: Calcoli finanziari avanzati
   - **Alert System**: Sistema alert personalizzati
   - **Download PDF**: Download report in PDF
   - **Request Analysis**: Richiesta analisi personalizzate
   - **Community Proposals**: Proporre e votare analisi

2. **Quick Actions**
   - "Aggiungi Posizione" (solo Pro)
   - "Richiedi Analisi" (disponibile anche per trial, ma limitato)

3. **User Menu**
   - Link "Admin" (solo Admin)

4. **Module Grid**
   - Alcuni report avanzati possono essere Pro-only
   - Corsi avanzati possono richiedere Pro

## Logiche di Accesso

### ProUtilities Component

```typescript
// Il pulsante floating è SEMPRE visibile
// Ma le utilities sono limitate:
- Portfolio, Calculator, Alerts: Solo Pro (mostra banner upgrade)
- Download PDF, Request Analysis: Pro (con limitazioni per trial)
- Community: Pro only
```

### QuickActions Component

```typescript
// Filtraggio basato su isPro:
- request-analysis: Disponibile a tutti (ma limitato)
- add-position: Solo Pro (proOnly: true)
- start-course: Disponibile a tutti
```

### UserMenu Component

```typescript
// Mostra link Admin solo se isAdmin
if (isPro) {
  menuItems.push({ id: 'admin', ... });
}
```

## Tooltip vs Sezioni

### Tooltip (HelpSupport Floating Button)

- **Solo link rapidi**: FAQ, Guide, Documentazione
- **Non contiene funzionalità**: Solo navigazione
- **Sempre disponibile**: Tutti gli utenti

### Sezioni Dashboard

- **Contenuti completi**: Tutte le funzionalità
- **Accesso controllato**: Basato su ruolo utente
- **Interattive**: Azioni, form, visualizzazioni

## Sicurezza

### Controlli Lato Client

- `useIsPro()` hook verifica ruolo utente
- Componenti mostrano/nascondono in base al ruolo
- Banner informativi per upgrade

### Controlli Lato Server (Da implementare)

- API routes devono verificare ruolo
- Database queries filtrate per ruolo
- Rate limiting per utenti non-Pro

## Best Practices

1. **Sempre mostrare opzioni**: Non nascondere, ma disabilitare con messaggio
2. **Banner informativi**: Spiegare perché serve Pro
3. **Link a pricing**: Sempre presente quando serve upgrade
4. **Graceful degradation**: Funzionalità base sempre disponibili

## Note Implementazione

- `useIsPro()` hook: Verifica ruolo da `user_roles` table
- `useBodyScrollLock()`: Blocca scroll quando modali/drawer aperti
- Tutti i componenti Pro devono verificare `isPro` prima di permettere azioni

## Sicurezza

### Validazione Input (Client-side)

Tutti i componenti utilities implementano validazione:

1. **PortfolioManager**:
   - Simbolo: Solo lettere maiuscole, max 10 caratteri, regex `/^[A-Z]{1,10}$/`
   - Quantità/Prezzo: Numeri positivi, arrotondamento a 2 decimali

2. **AlertSystem**:
   - Nome: Max 100 caratteri, sanitizzazione HTML
   - Simbolo: Stessa validazione PortfolioManager
   - Valore: Numero positivo

3. **FinancialCalculator**:
   - Tutti i valori: Numeri positivi, validazione NaN
   - Rate: Può essere 0 o positivo

### Best Practices Sicurezza

- ✅ Sanitizzazione input (rimozione HTML, limitazione caratteri)
- ✅ Validazione numerica (NaN check, range check)
- ✅ Arrotondamento valori monetari (2 decimali)
- ⚠️ TODO: Validazione server-side (da implementare)
- ⚠️ TODO: Rate limiting per utenti non-Pro
- ⚠️ TODO: CSRF protection per azioni Pro

## Design Coerenza

### Palette Colori

- **Accent**: Usato per azioni primarie, link, badge Pro
- **Amber**: Usato per badge Pro, warning, upgrade prompts
- **Blue**: Usato per Help & Support
- **Green**: Usato per success, positive values
- **Red**: Usato per danger actions, negative values

### Spacing

- Padding sezioni: `p-4 md:p-6`
- Gap elementi: `gap-2 md:gap-3` o `gap-3 md:gap-4`
- Margin sezioni: `mb-8` consistente

### Typography

- Titoli sezioni: `text-lg font-semibold`
- Sottotitoli: `text-sm text-text-secondary`
- Labels: `text-xs text-text-tertiary`

### Componenti Pattern

- Cards: `bg-bg-soft border border-border-subtle rounded-xl`
- Buttons: `px-4 py-2 rounded-lg transition-all duration-200`
- Inputs: `bg-bg-soft border border-border-subtle rounded-lg px-4 py-2`
