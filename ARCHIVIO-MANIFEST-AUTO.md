# Automazione Generazione Manifest

## 📋 Descrizione

Il file `archivio/manifest.json` viene generato automaticamente per includere tutti i report disponibili nella directory `report/reports/`.

## 🔄 Automazione

### Git Hooks (Raccomandato)

Sono stati configurati due git hooks per automatizzare la generazione:

1. **pre-commit**: Genera automaticamente il manifest prima di ogni commit
2. **post-merge**: Rigenera il manifest dopo un merge/pull

### Esecuzione Manuale

Puoi generare il manifest manualmente eseguendo:

```bash
npm run generate-manifest
```

Oppure direttamente:

```bash
node archivio/generate-manifest.js
```

## 📝 Come Funziona

Lo script `archivio/generate-manifest.js`:
1. Scansiona la directory `report/reports/`
2. Legge i file `header.json` di ogni report
3. Estrae metadati (ticker, company, versione, data, etc.)
4. Genera il file `archivio/manifest.json` con tutti i report

## 🚀 Installazione Hooks (Windows)

Se i hook non sono già installati, copia manualmente:

```powershell
# Pre-commit hook
Copy-Item .git/hooks/pre-commit.example .git/hooks/pre-commit -ErrorAction SilentlyContinue

# Post-merge hook  
Copy-Item .git/hooks/post-merge.example .git/hooks/post-merge -ErrorAction SilentlyContinue
```

## 📌 Note

- Il manifest viene generato automaticamente ad ogni commit
- Se aggiungi un nuovo report, ricordati di eseguire `npm run generate-manifest` prima del commit
- Il manifest include tutti i report, anche quelli non ancora pubblici (< 24h)

