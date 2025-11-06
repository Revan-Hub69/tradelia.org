# Analisi Errori e Conflitti - Report `/report`

## 🔴 CONFLITTI CRITICI

### 1. **CONFLITTO GRAVE: HeaderTicker Duplicato**

**Problema**: Esistono DUE file diversi che esportano `headerTicker` con API simili ma implementazioni completamente diverse:

- **File 1**: `/report/assets/js/components/header-ticker.js` (477 righe)
  - Versione verbale con metriche inline
  - Esporta: `export const headerTicker = { mount, update, ... }`
  - Usato in: `app.js` (linea 74)

- **File 2**: `/report/assets/js/modules/header.js` (272 righe)
  - Versione semaforo da JSON
  - Esporta: `export const headerTicker = (()=>{ ... })()`
  - Sembra essere una versione più vecchia/non utilizzata

**Impatto**: 
- Potenziale confusione nello sviluppo
- Rischio di importare il file sbagliato
- File duplicato che occupa spazio

**Raccomandazione**: 
- Rimuovere `/report/assets/js/modules/header.js` se non utilizzato
- Verificare che solo un file venga importato
- Unificare le due implementazioni se entrambe servono

---

## 🔴 PROBLEMI CRITICI: DRAWER MOBILE E COLLEGAMENTO METRICHE

### 2. **DRAWER MOBILE: Race Condition e Timeout Ricorsivi Infiniti**

**Problema CRITICO**: Il drawer mobile ha problemi gravi di timing e sincronizzazione:

**A. Timeout ricorsivi senza limite in `navigateToMetricInMobileDrawer`**:
```javascript
// ui-runtime.js:1249-1260
function navigateToMetricInMobileDrawer(metricKey) {
  const drawer = qs('.metrics-drawer-mobile');
  if (!drawer) {
    setTimeout(() => navigateToMetricInMobileDrawer(metricKey), 100); // ⚠️ RICORSIVO SENZA LIMITE!
    return;
  }
  // ...
  if (!drawer1 || !drawer2) {
    setTimeout(() => navigateToMetricInMobileDrawer(metricKey), 100); // ⚠️ RICORSIVO SENZA LIMITE!
    return;
  }
}
```

**Impatto**: 
- Se il drawer non esiste, la funzione si chiama all'infinito
- Possibile memory leak
- CPU usage alto
- Browser potrebbe bloccarsi

**B. Retry eccessivo in `openMobileMetricsDrawer`**:
```javascript
// ui-runtime.js:641-685
let retries = 0;
const maxRetries = 30; // ⚠️ 30 retry = 1500ms di attesa!
const checkPanel = () => {
  retries++;
  // ...
  if (drawer && mobilePanel && ...) {
    setupMobileMetricsDrawer(...);
    resolve();
  } else if (retries < maxRetries) {
    setTimeout(checkPanel, 50); // ⚠️ 50ms * 30 = 1500ms
  }
};
setTimeout(checkPanel, 50);
```

**Impatto**:
- Delay totale fino a 1.5 secondi per aprire drawer
- UX molto lenta
- Comportamento non deterministico

**C. Doppio timeout in `header-ticker.js`**:
```javascript
// header-ticker.js:111-117
ui.openMetricsDrawer(headerData).then(() => {
  setTimeout(() => { // ⚠️ Timeout di 500ms DOPO che la promise si risolve
    if (ui?.navigateToMetricInMobileDrawer) {
      ui.navigateToMetricInMobileDrawer(part.key);
    }
  }, 500);
});
```

**Impatto**:
- Delay totale: ~2000ms (1500ms per drawer + 500ms extra)
- UX estremamente lenta
- L'utente vede il drawer ma non naviga automaticamente alla metrica

---

### 3. **DRAWER DESKTOP: Problemi di Sincronizzazione e Selezione Metrica**

**Problema CRITICO**: Il collegamento metriche-drawer da desktop ha problemi di sincronizzazione:

**A. Timeout ricorsivo senza limite in `selectMetricInDesktopDrawer`**:
```javascript
// ui-runtime.js:1172-1186
const containerData = drawer._metricsData;
if (!containerData) {
  // ...
  if (!currentMetricsData) {
    console.error('[UI Runtime] Nessun dato disponibile');
    return;
  }
  // ...
  setTimeout(() => selectMetricInDesktopDrawer(metricKey), 200); // ⚠️ RICORSIVO SENZA LIMITE!
  return;
}
```

**Impatto**:
- Se `drawer._metricsData` non è impostato, la funzione si chiama all'infinito
- Nessun controllo di limite retry
- Possibile memory leak

**B. Retry multipli sovrapposti in `openMetricsDrawerFromMetric`**:
```javascript
// ui-runtime.js:1136-1151
openMetricsDrawer(headerData).then(() => {
  let retries = 0;
  const trySelect = () => {
    retries++;
    const drawer = qs('.metrics-drawer-desktop');
    if (drawer && drawer._metricsData) {
      selectMetricInDesktopDrawer(metricKey);
    } else if (retries < 10) {
      setTimeout(trySelect, 100); // ⚠️ 10 retry = 1000ms
    }
  };
  setTimeout(trySelect, 200); // ⚠️ Delay iniziale di 200ms
});
```

**Impatto**:
- Delay totale fino a 1200ms (200ms + 1000ms di retry)
- Se `drawer._metricsData` non viene impostato, la selezione fallisce silenziosamente
- UX molto lenta

**C. Setup drawer desktop con timeout multipli**:
```javascript
// ui-runtime.js:772-788
return new Promise((resolve) => {
  setTimeout(() => { // ⚠️ 50ms primo timeout
    const drawer = qs('.metrics-drawer-desktop');
    if (drawer) {
      currentMetricsDrawer = setupDesktopMetricsDrawer(...);
      resolve();
    } else {
      setTimeout(() => { // ⚠️ 100ms fallback
        const drawer2 = qs('.metrics-drawer-desktop');
        // ...
        resolve();
      }, 100);
    }
  }, 50);
});
```

**Impatto**:
- Timing non deterministico
- Setup potrebbe fallire se il DOM non è pronto
- Nessun controllo se setup fallisce

---

### 4. **Problemi di Dati Non Sincronizzati**

**Problema**: `drawer._metricsData` potrebbe non essere impostato quando `selectMetricInDesktopDrawer` viene chiamata:

```javascript
// ui-runtime.js:1172
const containerData = drawer._metricsData; // ⚠️ Potrebbe essere undefined
if (!containerData) {
  // Fallback a currentMetricsData globale
  if (!currentMetricsData) {
    // ⚠️ Nessun dato disponibile, ma fa retry infinito!
  }
}
```

**Impatto**:
- Selezione metrica fallisce silenziosamente
- L'utente clicca ma non succede nulla
- Difficile da debuggare

---

## ⚠️ PROBLEMI DI RACE CONDITION E TIMING

### 5. **Troppi setTimeout con timing arbitrari**

**Problema**: In `ui-runtime.js` ci sono 13+ utilizzi di `setTimeout` con delay arbitrari (0, 50, 100, 200ms) che indicano race condition:

```javascript
// Linea 359: setTimeout(() => bindMetricTabs(modalBody, data.key), 0);
// Linea 664: setTimeout(checkPanel, 50);
// Linea 1146: setTimeout(trySelect, 100);
// Linea 1151: setTimeout(trySelect, 200);
// Linea 1185: setTimeout(() => selectMetricInDesktopDrawer(metricKey), 200);
// Linea 1252: setTimeout(() => navigateToMetricInMobileDrawer(metricKey), 100);
```

**Impatto**: 
- Comportamento non deterministico
- Difficile da debuggare
- Potenziali errori su dispositivi lenti

**Raccomandazione**: 
- Usare `requestAnimationFrame` per operazioni DOM
- Usare `MutationObserver` per attendere inserimento elementi
- Implementare retry con backoff esponenziale invece di delay fissi
- **Aggiungere limite massimo retry per evitare loop infiniti**

### 6. **Problemi di inizializzazione asincrona**

**Problema**: `window.__TradeliaUI` potrebbe non essere disponibile quando i moduli F* vengono caricati:

```javascript
// app.js:168 - Viene chiamato durante mountModules
try { window.__TradeliaUI?.bindMetricInfoButtons?.(wrap); } catch {}
```

**Impatto**: 
- Bindings potrebbero fallire silenziosamente
- Errori nascosti da try-catch vuoti

**Raccomandazione**: 
- Verificare che `ui-runtime.js` sia caricato prima di `app.js`
- Implementare un sistema di eventi per notificare quando `__TradeliaUI` è pronto
- Aggiungere log di warning invece di catch vuoti

---

## 🐛 PROBLEMI DI LOGICA E ERROR HANDLING

### 7. **Try-catch vuoti che nascondono errori**

**Problema**: Molti catch vuoti che nascondono errori:

```javascript
// ui-runtime.js:159
try { UI.bindMetricInfoButtons(desktopBody); UI.bindMetricInfoButtons(mobileBody); } catch(e){}

// app.js:168
try { window.__TradeliaUI?.bindMetricInfoButtons?.(wrap); } catch {}
```

**Impatto**: 
- Errori nascosti difficili da debuggare
- Comportamento non deterministico

**Raccomandazione**: 
- Aggiungere almeno `console.warn` nei catch
- Loggare errori in produzione (con flag)

### 8. **Console.log eccessivi in produzione**

**Problema**: 94+ utilizzi di `console.log`, `console.warn`, `console.error` sparsi nel codice:

- `ui-runtime.js`: 78 console.log
- `header-ticker.js`: 16 console.log
- `app.js`: 4 console.warn

**Impatto**: 
- Performance (logging continuo)
- Clutter nella console
- Potenziali problemi di sicurezza (informazioni esposte)

**Raccomandazione**: 
- Rimuovere o commentare log di debug
- Usare un sistema di logging condizionale (es. `if (DEBUG)`)
- Mantenere solo errori critici

---

## ⚠️ PROBLEMI DI DIPENDENZE

### 9. **Dipendenze globali non verificate**

**Problema**: I moduli F* (f1b.js, f2.js, f3.js, f3o.js) dipendono da `window.__TradeliaUI` ma non verificano sempre la sua esistenza:

```javascript
// f1b.js:219
if (!window.__TradeliaUI || typeof window.__TradeliaUI.openPanel !== "function") {
  console.warn("openPanel non disponibile");
  return;
}
```

**Impatto**: 
- Alcuni moduli verificano, altri no
- Comportamento inconsistente

**Raccomandazione**: 
- Standardizzare i controlli di dipendenza
- Creare un helper function per verificare `__TradeliaUI`
- Documentare l'ordine di caricamento richiesto

### 10. **Variabili globali non documentate**

**Problema**: Uso di variabili globali non documentate:
- `window.__TradeliaUI`
- `window.__headerTickerData`

**Impatto**: 
- Difficile da mantenere
- Rischio di conflitti con altri script
- Naming poco chiaro (prefisso `__`)

**Raccomandazione**: 
- Documentare tutte le variabili globali
- Considerare namespace più specifico (es. `window.Tradelia.UI`)
- Usare WeakMap per storage privato

---

## 🔍 PROBLEMI DI CODICE

### 11. **Inconsistenze nel controllo di null/undefined**

**Problema**: Pattern inconsistenti per verificare null/undefined:

```javascript
// Alcuni usano: if (!data || data === null)
// Altri usano: if (data == null)
// Altri usano: if (data === undefined || data === null)
// Altri usano: if (data?.property)
```

**Impatto**: 
- Codice difficile da leggere
- Possibili bug nascosti

**Raccomandazione**: 
- Standardizzare su `== null` (controlla sia null che undefined)
- Usare optional chaining `?.` dove appropriato
- Documentare pattern preferito

### 12. **Magic numbers e stringhe hardcoded**

**Problema**: Valori magici sparsi nel codice:

```javascript
// ui-runtime.js:127 - width panel
desktopPanel.style.width = panelSize === 'xl' ? 'min(980px,100%)' : 'min(860px,100%)';

// header-ticker.js:164-167 - classi hardcoded
if (row.id === 'company-line' || row.id === 'intro-line') rowEl.classList.add('header-ticker-row--intro');
```

**Raccomandazione**: 
- Estrarre costanti
- Usare enum/oggetti di configurazione
- Documentare significato dei valori

---

## 📋 PROBLEMI DI STRUTTURA

### 13. **Funzioni troppo lunghe**

**Problema**: Alcune funzioni sono molto lunghe (es. `openMobileMetricsDrawer` in ui-runtime.js ~200 righe)

**Raccomandazione**: 
- Suddividere in funzioni più piccole
- Estraggere logica ripetuta

### 14. **Duplicazione di codice**

**Problema**: Pattern simili ripetuti in più file:
- Logica di controllo mobile/desktop
- Gestione di metriche
- Rendering di elementi UI

**Raccomandazione**: 
- Estrarre in utility functions comuni
- Creare componenti riutilizzabili

---

## ✅ RACCOMANDAZIONI PRIORITARIE

1. **🔴 CRITICO URGENTE**: Fixare timeout ricorsivi infiniti in `navigateToMetricInMobileDrawer` e `selectMetricInDesktopDrawer`
   - Aggiungere limite massimo retry
   - Usare MutationObserver invece di setTimeout ricorsivi
   
2. **🔴 CRITICO**: Risolvere problemi drawer mobile (delay fino a 2000ms, navigazione non funziona)
   - Rimuovere timeout di 500ms in `header-ticker.js`
   - Usare Promise.resolve() invece di setTimeout
   - Implementare sistema di eventi per notificare quando drawer è pronto
   
3. **🔴 CRITICO**: Fixare sincronizzazione drawer desktop
   - Garantire che `drawer._metricsData` sia impostato prima di chiamare `selectMetricInDesktopDrawer`
   - Usare MutationObserver per attendere setup
   - Rimuovere timeout ricorsivi senza limite
   
4. **CRITICO**: Risolvere conflitto headerTicker duplicato
5. **ALTO**: Ridurre/sostituire setTimeout con soluzioni più robuste (MutationObserver, requestAnimationFrame)
6. **ALTO**: Standardizzare error handling (rimuovere catch vuoti)
7. **MEDIO**: Rimuovere/condizionare console.log per produzione
8. **MEDIO**: Documentare dipendenze globali e ordine di caricamento
9. **BASSO**: Refactoring per ridurre duplicazione e migliorare struttura

---

## 📊 STATISTICHE

- **File analizzati**: 9 file JS principali
- **Console.log trovati**: 94+
- **setTimeout trovati**: 13+
- **Try-catch vuoti**: 3+
- **Conflitti critici**: 1 (headerTicker duplicato)
- **Dipendenze globali non verificate**: 4+ casi
- **🔴 Problemi CRITICI drawer mobile**: 3 (timeout infiniti, delay eccessivi, navigazione non funziona)
- **🔴 Problemi CRITICI drawer desktop**: 3 (timeout infiniti, sincronizzazione dati, selezione fallisce)

---

*Generato automaticamente dall'analisi del codice - Data: 2025*

