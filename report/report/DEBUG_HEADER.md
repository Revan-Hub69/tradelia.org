# Debug: Perché l'header non appare

## 🔍 Problema Identificato

L'header potrebbe non apparire per diversi motivi. Ho aggiunto logging dettagliato e gestione degli errori per identificare il problema.

## ✅ Correzioni Applicate

### 1. Logging Dettagliato
Aggiunto logging dettagliato in `app.js` per tracciare:
- Percorso del file header.json
- Stato del caricamento
- Errori specifici in ogni fase

### 2. Gestione Errori Visibile
Aggiunta funzione `showHeaderError()` che mostra un messaggio visibile all'utente se l'header non può essere caricato, invece di fallire silenziosamente.

### 3. Validazione Migliorata
Aggiunti controlli per:
- Verificare che header.json sia caricato correttamente
- Verificare che il componente header-ticker sia importato
- Verificare che il mount() funzioni correttamente

## 🔧 Come Debuggare

### 1. Apri la Console del Browser
Premi F12 e vai alla tab Console.

### 2. Controlla i Log
Cerca questi log:
- `[App] Caricamento header da: /report/reports/sample-id/header.json`
- `[App] Header caricato con successo: ...`
- `[HeaderTicker] Montando header ticker, slot: ...`
- `[HeaderTicker] Header montato con successo`

### 3. Se Vedi Errori
Gli errori ora mostrano:
- Il percorso del file che sta cercando di caricare
- Il tipo di errore (404, parsing, ecc.)
- Lo stack trace completo

### 4. Possibili Cause

#### A. File header.json non trovato (404)
**Errore**: `Fetch error: /report/reports/sample-id/header.json (404)`

**Soluzione**: 
- Verifica che il file esista in `/report/reports/sample-id/header.json`
- Verifica che il reportId nell'URL sia corretto (parametro `?id=...`)
- Se usi un server locale, verifica che serva correttamente i file JSON

#### B. Errore di parsing JSON
**Errore**: `SyntaxError` o `Unexpected token`

**Soluzione**:
- Verifica che header.json sia JSON valido
- Usa un validatore JSON online per verificare la sintassi

#### C. Componente header-ticker non caricato
**Errore**: `ERRORE: headerTicker non esportato correttamente`

**Soluzione**:
- Verifica che il file `/report/assets/js/components/header-ticker.js` esista
- Verifica che esporti correttamente: `export const headerTicker = { mount, update }`

#### D. Slot non trovato nel DOM
**Errore**: `ERRORE CRITICO: slot non trovato nel DOM`

**Soluzione**:
- Verifica che `index.html` contenga: `<div id="header-ticker-slot" class="container"></div>`
- Verifica che il DOM sia caricato prima di chiamare `mountHeaderTicker`

#### E. Dati header non validi
**Errore**: `Header vuoto o non valido`

**Soluzione**:
- Verifica che header.json contenga almeno `rows` o i campi base (Ticker, CompanyName, ecc.)
- Verifica la struttura del JSON confrontandola con `/report/reports/sample-id/header.json`

## 📋 Checklist Debug

- [ ] Console del browser aperta (F12)
- [ ] Log `[App] Caricamento header da:` visibile
- [ ] File header.json esiste nel percorso corretto
- [ ] File header.json è JSON valido
- [ ] reportId nell'URL è corretto (default: `sample-id`)
- [ ] Slot `#header-ticker-slot` esiste nel DOM
- [ ] Componente `header-ticker.js` è caricato correttamente
- [ ] Nessun errore JavaScript nella console

## 🎯 Test Rapido

1. Apri la pagina del report
2. Apri la console (F12)
3. Verifica i log:
   ```
   [App] Caricamento header da: /report/reports/sample-id/header.json
   [App] Header caricato con successo: {...}
   [HeaderTicker] Montando header ticker, slot: <div id="header-ticker-slot">
   [HeaderTicker] Header montato con successo
   ```

4. Se vedi un messaggio di errore rosso nella console, leggi il messaggio specifico

## 🔧 Soluzione Rapida

Se l'header non appare, controlla:

1. **URL corretto**: La pagina deve essere servita da un server web (non aprire direttamente il file HTML)
2. **Percorso corretto**: Il server deve servire i file da `/report/`
3. **CORS**: Se usi un server locale, verifica che non ci siano problemi CORS
4. **Report ID**: Verifica che l'URL contenga `?id=sample-id` o che il default funzioni

## 📝 Esempio URL Corretto

```
http://localhost:8080/report/index.html?id=sample-id
```

o

```
http://localhost:8080/report/index.html
```
(usa il default `sample-id`)

---

*Documento creato il 2025-01-27*

