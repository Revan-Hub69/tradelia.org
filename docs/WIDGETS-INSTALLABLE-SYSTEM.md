# Widget Installabili - Sistema Completo

## Overview

Sistema di widget installabili per **telefono (iOS/Android)** e **desktop** che permettono agli utenti di visualizzare informazioni chiave direttamente dalla home screen o come finestre standalone.

## Tipi di Widget

### 1. Portfolio Widget (`/widgets/portfolio`)
- **Descrizione**: Visualizza il portafoglio direttamente sulla home screen
- **Piattaforme**: Android, iOS, Desktop
- **Dati mostrati**: 
  - Valore totale portafoglio
  - Performance giornaliera/settimanale/mensile
  - Top 3-5 posizioni
  - Grafico mini performance

### 2. Watchlist Widget (`/widgets/watchlist`)
- **Descrizione**: Monitora asset preferiti in tempo reale
- **Piattaforme**: Android, iOS, Desktop
- **Dati mostrati**:
  - Lista asset preferiti (max 5-10)
  - Prezzo corrente
  - Variazione 24h
  - Indicatore trend (↑↓)

### 3. Alerts Widget (`/widgets/alerts`)
- **Descrizione**: Vedi alert attivi e quelli triggerati
- **Piattaforme**: Android, iOS, Desktop
- **Dati mostrati**:
  - Numero alert attivi
  - Ultimi alert triggerati (max 3-5)
  - Icona notifica se nuovi alert

## Implementazione Tecnica

### Mobile (iOS/Android)

#### iOS
1. **PWA (Progressive Web App)**:
   - Usa `manifest.json` con `display: "standalone"`
   - Supporta "Add to Home Screen"
   - Widget si apre come app standalone

2. **iOS 14+ Widget Extension** (futuro):
   - Richiede app nativa iOS
   - Widget nativi iOS con SwiftUI
   - Aggiornamento automatico ogni 15 minuti

#### Android
1. **PWA**:
   - `manifest.json` con `display: "standalone"`
   - "Add to Home Screen" supportato
   - Widget come app standalone

2. **Android Widget** (futuro):
   - Richiede app nativa Android
   - Widget nativi Android con App Widgets
   - Aggiornamento automatico configurabile

### Desktop

1. **Standalone Window**:
   - Apertura in finestra separata (400x600px)
   - Resizable, scrollable
   - Può essere minimizzata nella taskbar

2. **Desktop Widget** (futuro - Windows/macOS):
   - Richiede app nativa
   - Widget desktop nativi
   - Sempre visibili sul desktop

## Architettura

```
/app/widgets/
  ├── portfolio/
  │   └── page.tsx          # Widget Portfolio (standalone)
  ├── watchlist/
  │   └── page.tsx          # Widget Watchlist (standalone)
  └── alerts/
      └── page.tsx          # Widget Alerts (standalone)

/components/widgets/
  └── WidgetsContent.tsx    # Pagina gestione widget installabili
```

## Caratteristiche

### ✅ Implementato
- Pagina `/dashboard/widgets` con lista widget disponibili
- Widget standalone (portfolio, watchlist, alerts)
- Istruzioni installazione per iOS/Android
- Apertura standalone su desktop
- Link diretto per installazione

### 🚧 Da Implementare
- Widget nativi iOS (richiede app nativa)
- Widget nativi Android (richiede app nativa)
- Widget desktop nativi (Windows/macOS)
- Aggiornamento automatico dati
- Configurazione widget (dimensioni, refresh rate)

## Best Practices

1. **Performance**:
   - Widget devono caricare velocemente (< 1s)
   - Cache dati per offline viewing
   - Lazy loading per grafici

2. **UX**:
   - Design minimalista (spazio limitato)
   - Informazioni essenziali solo
   - Link "Apri app completa" per dettagli

3. **Privacy/Security**:
   - Autenticazione richiesta per dati sensibili
   - RLS policies applicate
   - No dati sensibili in cache locale

4. **Accessibility**:
   - Supporto screen reader
   - Contrasto colori WCAG AA
   - Testi scalabili

## Note

I widget interattivi a piena pagina nella dashboard web sono **separati** da questo sistema. Quelli sono gestiti da `WidgetsManager` e `ProWidget` per personalizzazione dashboard Pro users.

Questo sistema si concentra su **widget installabili** per mobile/desktop che funzionano come app standalone o widget nativi.
