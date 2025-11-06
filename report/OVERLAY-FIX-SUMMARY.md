# 🔧 Fix Overlay/Drawer - Riepilogo Modifiche

## Problemi Risolti

### 1. ✅ Sistema di Stack Overlay Unificato
- **Creato**: `overlay-manager.js` - Gestione centralizzata di tutti gli overlay
- **Funzionalità**:
  - Stack dinamico con z-index automatici
  - Gestione overflow body centralizzata
  - ESC key handler unificato
  - Prevenzione duplicati

### 2. ✅ Z-Index Dinamici
- **Prima**: Z-index fissi e conflittuali (1000, 9998, 10000)
- **Dopo**: Z-index dinamici basati sullo stack (1000, 1010, 1020...)
- **Drawer**: Z-index = overlay + 2 (sempre sopra)

### 3. ✅ Overflow Body Centralizzato
- **Prima**: Ogni drawer/popup gestiva `document.body.style.overflow` separatamente
- **Dopo**: Gestito centralmente da `overlay-manager.js`
- **Risultato**: Overflow corretto anche con overlay multipli

### 4. ✅ ESC Key Handler Unificato
- **Prima**: Listener ESC duplicati in ogni componente
- **Dopo**: Un solo listener globale che chiude l'overlay in cima allo stack
- **Rimosso**: Listener ESC da `module-header.js`, `metrics-drawer.js`, `metric-popup.js`

### 5. ✅ Prevenzione Binding Multipli
- **Aggiunto**: Flag `data-bound` in `module-header.js`
- **Risultato**: Evita listener duplicati se `bindModuleTabs` viene chiamato più volte

### 6. ✅ Glossario Embedded
- **Rimosso**: Listener ESC duplicato da `glossary-embedded.js`
- **Rimosso**: Gestione overflow (gestita dal popup parent)
- **Risultato**: Nessun conflitto quando il glossario è aperto dentro il popup

## File Modificati

### Nuovi File
- `report/assets/js/utils/overlay-manager.js` - Sistema di gestione overlay

### File Modificati
- `report/assets/js/components/module-header.js` - Integrato overlay-manager
- `report/assets/js/components/metric-popup.js` - Integrato overlay-manager
- `report/assets/js/components/metrics-drawer.js` - Integrato overlay-manager
- `report/assets/js/components/glossary-embedded.js` - Rimosso ESC listener duplicato
- `report/assets/css/module-card.css` - Z-index commentati (gestiti dinamicamente)
- `report/assets/css/tokens.css` - Z-index commentati (gestiti dinamicamente)

## Come Funziona

1. **Registrazione Overlay**: Quando un drawer/popup si apre, chiama `registerOverlay(id, type, overlayEl, drawerEl)`
2. **Z-Index Automatico**: L'overlay manager assegna z-index basati sulla posizione nello stack
3. **Overflow Body**: Gestito automaticamente (hidden se stack > 0, '' se stack = 0)
4. **ESC Key**: Un solo listener globale chiude l'overlay in cima allo stack
5. **Rimozione**: Quando si chiude, chiama `unregisterOverlay(id)` e ricalcola z-index

## Test Consigliati

1. Aprire drawer F1B → verificare z-index corretto
2. Aprire popup metrica → verificare z-index sopra drawer
3. Aprire glossario dentro popup → verificare nessun conflitto
4. Premere ESC → verificare chiude solo l'overlay in cima
5. Aprire più overlay → verificare stack corretto
6. Chiudere overlay → verificare overflow body corretto

## Note

- Il glossario embedded viene ancora montato dentro il popup (non è un drawer separato)
- Se necessario, si può creare un drawer separato per il glossario in futuro
- `window.__TradeliaUI.openPanel` non è ancora implementato (usato da F2, F3, F3O)

