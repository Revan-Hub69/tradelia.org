# 📊 Guida: rollup-plugin-visualizer

## Cos'è?

**rollup-plugin-visualizer** è uno strumento che analizza il tuo bundle JavaScript e genera una visualizzazione interattiva HTML che mostra:

- 📦 **Dimensioni dei chunks**: Quanto spazio occupa ogni modulo
- 🔗 **Dipendenze**: Come i moduli sono collegati tra loro
- 📈 **Dimensioni compresse**: Gzip e Brotli sizes
- 🎯 **Problemi**: Chunk troppo grandi, duplicazioni, dipendenze pesanti

## Installazione

```bash
npm install -D rollup-plugin-visualizer
```

## Come Usarlo

### 1. Build con Analisi

```bash
npm run build:analyze
```

Questo comando:
- Esegue il build normale
- Attiva il plugin visualizer
- Genera `dist/stats.html`
- Apre automaticamente nel browser

### 2. Visualizza il Report

Apri `dist/stats.html` nel browser. Vedrai:

#### **Treemap View** (default)
- Ogni rettangolo = un chunk/modulo
- Dimensione rettangolo = dimensione file
- Colore = tipo (vendor, dashboard, etc.)
- **Clic** su un rettangolo per vedere dettagli

#### **Informazioni Mostrate**
- **Size**: Dimensione originale
- **Gzip**: Dimensione compressa gzip
- **Brotli**: Dimensione compressa brotli
- **Path**: Percorso del file
- **Dependencies**: Dipendenze del modulo

## Cosa Cercare nel Report

### ✅ Buono
- Chunk size: 200-300KB (target)
- Vendor chunks separati
- Moduli education in chunk separati
- Gzip size < 100KB per chunk critico

### ⚠️ Da Ottimizzare
- Chunk > 500KB: Troppo grande, dividere
- Dipendenze duplicate: Stessa libreria in più chunk
- Codice non usato: Moduli importati ma non utilizzati
- Vendor troppo grande: Considerare alternative

## Esempio di Analisi

### Prima Ottimizzazione
```
📦 vendor.js (800KB) ❌ Troppo grande
📦 dashboard.js (600KB) ❌ Troppo grande
```

### Dopo Ottimizzazione
```
📦 vendor-supabase.js (150KB) ✅
📦 vendor-firebase.js (200KB) ✅
📦 dashboard-education-core.js (80KB) ✅
📦 dashboard-education.js (200KB) ✅
📦 common-utils.js (30KB) ✅
```

## Configurazione Attuale

Nel tuo `vite.config.js`:

```javascript
visualizer({
  open: true,                    // Apre automaticamente
  filename: "dist/stats.html",    // File output
  gzipSize: true,                 // Mostra gzip
  brotliSize: true,               // Mostra brotli
  template: "treemap",            // Visualizzazione
})
```

## Template Disponibili

Cambia `template` in `vite.config.js`:

- **`treemap`** (default): Mappa ad albero, ottima per dimensioni
- **`sunburst`**: Diagramma a raggi, mostra gerarchia
- **`network`**: Grafo dipendenze, mostra relazioni
- **`list`**: Lista semplice, facile da leggere

## Troubleshooting

### Plugin non trovato
```bash
npm install -D rollup-plugin-visualizer
```

### File stats.html non generato
- Verifica che il build sia completato
- Controlla che `mode === "analyze"` in vite.config.js
- Verifica console per errori

### Browser non si apre
- Apri manualmente `dist/stats.html`
- Verifica che il file sia stato generato

## Prossimi Passi Dopo Analisi

1. **Identifica chunk grandi** (>500KB)
2. **Cerca duplicazioni** (stessa libreria in più chunk)
3. **Ottimizza vendor chunks** (separali meglio)
4. **Verifica tree shaking** (codice non usato rimosso?)
5. **Ottimizza import** (usa dynamic imports dove possibile)

---

**Comando Rapido**: `npm run build:analyze`

