# Standard Tradelia AI

## Overview

Lo standard Tradelia AI definisce come presentare le **Analisi Avanzate Pro** nella piattaforma. Questo standard garantisce coerenza, chiarezza accademica e UX professionale.

## Componenti Standard

### 1. ProAnalysisTabs
**File**: `components/dashboard/analysis/ProAnalysisTabs.tsx`

Tabs collassabili per analisi avanzate Pro. Ogni tab include:
- **Nome**: Titolo chiaro e descrittivo
- **Descrizione**: Breve spiegazione della feature
- **Icona**: Emoji o icona rappresentativa
- **Componente**: Componente React che implementa l'analisi
- **Note Metodologiche**: Popup con informazioni accademiche

**Caratteristiche**:
- Tabs collassabili (expand/collapse)
- Overlay "Sblocca Pro" automatico se utente non è Pro
- Popup note metodologiche su ogni tab
- Navigazione tra tabs
- Design responsive

### 2. ProUnlockOverlay
**File**: `components/ui/ProUnlockOverlay.tsx`

Overlay riutilizzabile per sbloccare feature Pro. Mostra:
- Nome della feature
- Descrizione
- Pulsante "Sblocca Pro" che reindirizza a `/pricing`

**Uso**:
```tsx
<ProUnlockOverlay
  featureName="Crypto Whale Analysis"
  featureDescription="Analisi movimenti whale su top 400 crypto"
  onUnlock={() => window.location.href = '/pricing'}
/>
```

### 3. MethodologyPopup
**File**: `components/ui/MethodologyPopup.tsx`

Popup con note metodologiche accademiche. Include:
- **Titolo**: Nome dell'indicatore/feature
- **Descrizione**: Spiegazione generale
- **Riferimento Accademico**: Paper o teoria di riferimento
- **Metodologia**: Come viene calcolato/analizzato
- **Limitazioni**: Avvertenze e limiti dell'indicatore

**Uso**:
```tsx
<MethodologyPopup
  notes={{
    title: "Crypto Whale Analysis",
    description: "Analisi dei movimenti whale...",
    academicReference: "Market Microstructure Theory",
    methodology: "Analisi aggregata di transazioni >$1M...",
    limitations: "I dati whale possono essere influenzati..."
  }}
/>
```

## Schema Standard per Tab Pro

Ogni tab Pro deve seguire questo schema:

```typescript
interface ProAnalysisTab {
  id: string;                    // ID univoco
  name: string;                  // Nome (i18n)
  description: string;           // Descrizione breve (i18n)
  icon: string;                  // Emoji o icona
  component: React.ComponentType<{ isPro: boolean }>;  // Componente
  methodologyNotes: {
    title: string;
    description: string;
    academicReference?: string;
    methodology?: string;
    limitations?: string;
  };
}
```

## Esempio Completo

```tsx
{
  id: 'crypto-whale',
  name: locale === 'it' ? 'Crypto Whale Analysis' : 'Crypto Whale Analysis',
  description: locale === 'it'
    ? 'Analisi movimenti whale su top 400 crypto con AI reading'
    : 'Whale movement analysis on top 400 crypto with AI reading',
  icon: '🐋',
  component: CryptoWhaleAnalysis,
  methodologyNotes: {
    title: 'Crypto Whale Analysis',
    description: 'Analisi dei movimenti di grandi volumi...',
    academicReference: 'Market Microstructure Theory',
    methodology: 'Analisi aggregata di transazioni >$1M...',
    limitations: 'I dati whale possono essere influenzati...',
  },
}
```

## Componenti Pro Esistenti

Tutti i componenti Pro devono:
1. Accettare prop `isPro: boolean`
2. Mostrare dati reali solo se `isPro === true`
3. Mostrare placeholder/anteprima se `isPro === false` (gestito da overlay)

**Componenti Pro attuali**:
- `CryptoWhaleAnalysis`
- `CryptoDepthAggregated`
- `CryptoTopMovers`
- `FuturesAnalysis`
- `OptionsAnalysis`
- `ForexAnalysis`

## Integrazione in AnalysisDashboard

Il componente `ProAnalysisTabs` viene integrato automaticamente in `AnalysisDashboard.tsx`:

```tsx
import ProAnalysisTabs from './ProAnalysisTabs';

// Nel render:
<ProAnalysisTabs />
```

Il componente gestisce automaticamente:
- Visibilità per Pro/Non-Pro
- Overlay "Sblocca Pro"
- Note metodologiche
- Tabs collassabili

## Best Practices

1. **Naming**: Usa nomi chiari e descrittivi
2. **i18n**: Tutti i testi devono supportare italiano/inglese
3. **Academic Rigor**: Ogni feature deve avere note metodologiche complete
4. **UX**: Overlay e popup devono essere non invasivi ma chiari
5. **Performance**: Componenti Pro devono essere lazy-loaded se possibile
6. **Accessibility**: Tutti i componenti devono essere accessibili (ARIA labels, keyboard navigation)

## Note Metodologiche - Template

Ogni tab Pro deve includere note metodologiche complete:

```typescript
methodologyNotes: {
  title: string;                    // Nome feature
  description: string;              // Descrizione generale
  academicReference?: string;      // Paper/teoria (opzionale ma consigliato)
  methodology?: string;            // Come viene calcolato (opzionale ma consigliato)
  limitations?: string;            // Limitazioni (opzionale ma consigliato)
}
```

## Esempi di Note Metodologiche

### Crypto Whale Analysis
- **Academic Reference**: Market Microstructure Theory - Large Trader Impact
- **Methodology**: Analisi aggregata di transazioni >$1M su top 400 crypto
- **Limitations**: Dati influenzati da exchange-specific factors

### Depth Aggregated
- **Academic Reference**: Market Microstructure - Order Book Analysis
- **Methodology**: Aggregazione order book L400 da Binance, Coinbase, Kraken
- **Limitations**: Order book depth è exchange-specific

### Futures Analysis
- **Academic Reference**: Fama & French (1987) - "Commodity Futures Prices"
- **Methodology**: Analisi differenza tra futures e spot price
- **Limitations**: Term structure può essere influenzata da fattori tecnici

## Checklist per Nuove Feature Pro

- [ ] Componente accetta prop `isPro: boolean`
- [ ] Tab definito in `ProAnalysisTabs.tsx` con schema completo
- [ ] Note metodologiche complete (title, description, reference, methodology, limitations)
- [ ] i18n supportato (italiano/inglese)
- [ ] Testato con utente Pro e Non-Pro
- [ ] Overlay "Sblocca Pro" funzionante
- [ ] Popup note metodologiche funzionante
- [ ] Design responsive (mobile/desktop)
- [ ] Accessibilità (ARIA labels, keyboard nav)

## Conclusione

Lo standard Tradelia AI garantisce che tutte le analisi avanzate Pro siano:
- **Chiare**: Nome, descrizione, note metodologiche
- **Accademiche**: Riferimenti e metodologia documentati
- **Accessibili**: Overlay e popup per utenti non-Pro
- **Coerenti**: Stesso schema per tutte le feature Pro
