# Status Tooltips Glossario - Cosa Manca

**Data**: 2025-01-27  
**Status**: Verifica completamento

---

## ✅ COMPLETATO

### 1. Componenti Base
- ✅ `GlossaryDrawer.tsx` - Drawer con 3 sezioni (Accademica, Tradelia AI, Fonti)
- ✅ `TooltipGlossary.tsx` - Componente tooltip cliccabile
- ✅ `lib/glossary/terms.ts` - Loader termini con fallback

### 2. Integrazioni
- ✅ `DashboardHero.tsx` - MiFID II, Framework verificabili, chips
- ✅ `PortfolioManager.tsx` - Portfolio
- ✅ `QuickLinks.tsx` - Watchlist

### 3. Traduzioni
- ✅ IT: `glossary.drawer.*`, `dashboard.hero.mifidLink`
- ✅ EN: `glossary.drawer.*`, `dashboard.hero.mifidLink`

### 4. File Dati
- ✅ `public/glossario.json` - File copiato correttamente

---

## ⚠️ DA VERIFICARE/COMPLETARE

### 1. Traduzione "common.close"
**Problema**: `GlossaryDrawer.tsx` usa `t('common.close')` ma potrebbe non esistere

**Soluzione**: Verificare se esiste, altrimenti aggiungere o usare fallback

### 2. Altri Punti per Tooltips
**Componenti da verificare**:
- `AlertSystem.tsx` - Termini: "Alert", "Volume", "Price"
- `TradingJournal` (se esiste) - Termini: "P&L", "Equity", "Drawdown"
- `OverviewStats.tsx` - Termini tecnici nelle statistiche
- `ModuleGrid.tsx` - "Framework" nelle descrizioni moduli
- Report pages - Termini come "StrategyMode", "RegimeScore", "VolRegime"

### 3. Fallback Terms
**Termini mancanti nel fallback**:
- `Watchlist` - ✅ Aggiunto
- `Alert` - ❌ Mancante
- `Volume` - ❌ Mancante
- `P&L` / `Profit & Loss` - ❌ Mancante
- `Equity` - ❌ Mancante
- `Drawdown` - ❌ Mancante

### 4. Test Funzionalità
- ⚠️ Testare caricamento da `/glossario.json`
- ⚠️ Testare fallback se file non disponibile
- ⚠️ Testare drawer su mobile
- ⚠️ Testare accessibilità (keyboard, screen reader)

### 5. Performance
- ⚠️ Cache termini (già implementato ma da testare)
- ⚠️ Lazy loading drawer (già implementato)

---

## 🔧 AZIONI IMMEDIATE

1. **Aggiungere traduzione `common.close`** se mancante
2. **Aggiungere fallback terms** mancanti
3. **Testare funzionalità** completa
4. **Aggiungere tooltips** in altri componenti se necessario

---

## 📝 NOTE

- Il sistema è funzionale ma potrebbe beneficiare di:
  - Più tooltips in altri componenti
  - Più termini nel fallback
  - Test completi

