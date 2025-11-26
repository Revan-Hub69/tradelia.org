# 📊 Come Usare Bundle Analyzer - Guida Rapida

## ✅ Passo 1: Verifica Installazione

Controlla se il plugin è installato:

```bash
# In Git Bash o terminale
ls node_modules/rollup-plugin-visualizer
```

Se non esiste, installalo:
```bash
npm install -D rollup-plugin-visualizer
```

## ✅ Passo 2: Esegui Build con Analisi

```bash
npm run build:analyze
```

**Cosa succede**:
1. Vite esegue il build
2. Il plugin analizza tutti i chunk
3. Genera `dist/stats.html`
4. Si apre automaticamente nel browser

## ✅ Passo 3: Se il Browser Non Si Apre

Apri manualmente il file:

**Windows**:
```bash
# In Git Bash
start dist/stats.html

# Oppure naviga a:
# C:\Users\Utente\Downloads\cus\tradelia.org-main\dist\stats.html
```

**Doppio click** sul file `dist/stats.html` nel file explorer.

## 📊 Passo 4: Leggere il Report

### Cosa Vedrai

**Treemap View** (mappa ad albero):
- Ogni **rettangolo** = un chunk/modulo JavaScript
- **Dimensione rettangolo** = dimensione del file
- **Colore** = tipo di chunk (vendor, dashboard, etc.)

### Come Navigare

1. **Zoom**: Scroll del mouse o pinch
2. **Dettagli**: Clic su un rettangolo per vedere:
   - Dimensione originale
   - Dimensione gzip
   - Dimensione brotli
   - Percorso file
   - Dipendenze

3. **Filtri**: Usa i controlli in alto per:
   - Cercare moduli specifici
   - Filtrare per tipo
   - Ordinare per dimensione

## 🎯 Cosa Cercare

### ✅ Buono
- Chunk size: **200-300KB** (target ideale)
- Vendor chunks **separati** (vendor-supabase, vendor-firebase)
- Moduli education in chunk **separati**
- Gzip size < 100KB per chunk critico

### ⚠️ Problemi da Risolvere

1. **Chunk > 500KB**
   - Troppo grande
   - **Soluzione**: Dividere in chunk più piccoli

2. **Dipendenze Duplicate**
   - Stessa libreria in più chunk
   - **Soluzione**: Verificare import, usare shared chunks

3. **Codice Non Usato**
   - Moduli importati ma non utilizzati
   - **Soluzione**: Rimuovere import non usati, verificare tree shaking

4. **Vendor Troppo Grande**
   - Libreria esterna occupa troppo spazio
   - **Soluzione**: Considerare alternative più leggere o lazy loading

## 📋 Esempio di Analisi

### Prima Ottimizzazione
```
❌ vendor.js (800KB) - Troppo grande
❌ dashboard.js (600KB) - Troppo grande
❌ Tutto in un unico chunk
```

### Dopo Ottimizzazione (Target)
```
✅ vendor-supabase.js (150KB)
✅ vendor-firebase.js (200KB)
✅ dashboard-education-core.js (80KB)
✅ dashboard-education.js (200KB)
✅ common-utils.js (30KB)
```

## 🔧 Troubleshooting

### File stats.html non generato

1. **Verifica installazione plugin**:
   ```bash
   npm list rollup-plugin-visualizer
   ```

2. **Verifica build completato**:
   ```bash
   ls dist/
   ```

3. **Controlla errori nel build**:
   ```bash
   npm run build:analyze 2>&1 | tee build.log
   ```

### Browser non si apre

- Apri manualmente: `dist/stats.html`
- Verifica che il file esista
- Prova con browser diverso

### Report vuoto o errore

- Verifica che il build sia completato senza errori
- Controlla console browser per errori JavaScript
- Prova a rigenerare: `npm run build:analyze`

## 📝 Prossimi Passi Dopo Analisi

1. **Identifica chunk grandi** (>500KB)
2. **Cerca duplicazioni** (stessa libreria in più chunk)
3. **Verifica vendor chunks** (sono separati?)
4. **Controlla tree shaking** (codice non usato rimosso?)
5. **Ottimizza import** (usa dynamic imports dove possibile)

---

**Comando Rapido**: `npm run build:analyze`

**File Output**: `dist/stats.html`

**Aprire**: Doppio click sul file o `start dist/stats.html`

