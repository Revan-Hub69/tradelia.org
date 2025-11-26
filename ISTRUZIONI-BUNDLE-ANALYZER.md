# 📊 Istruzioni Bundle Analyzer - Passo Passo

## ✅ Situazione Attuale

Il plugin `rollup-plugin-visualizer` è già in `package.json` (versione 5.14.0).

## 🚀 Come Eseguire l'Analisi

### Opzione 1: Git Bash (Consigliato)

Apri **Git Bash** e esegui:

```bash
# 1. Vai nella directory del progetto
cd /c/Users/Utente/Downloads/cus/tradelia.org-main

# 2. Installa il plugin (se non già installato)
npm install -D rollup-plugin-visualizer

# 3. Esegui build con analisi
npm run build:analyze
```

### Opzione 2: PowerShell (se hai problemi)

```powershell
# 1. Cambia execution policy temporaneamente
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 2. Installa plugin
npm install -D rollup-plugin-visualizer

# 3. Esegui build
npm run build:analyze
```

## 📁 Dove Trovare il Report

Dopo il build, il file sarà in:
```
dist/stats.html
```

**Percorso completo**:
```
C:\Users\Utente\Downloads\cus\tradelia.org-main\dist\stats.html
```

## 🖥️ Come Aprire il Report

### Metodo 1: Doppio Click
1. Apri **File Explorer**
2. Vai a `C:\Users\Utente\Downloads\cus\tradelia.org-main\dist\`
3. Cerca `stats.html`
4. **Doppio click** per aprirlo nel browser

### Metodo 2: Da Terminale (Git Bash)
```bash
# Apri il file nel browser predefinito
start dist/stats.html
```

### Metodo 3: Da PowerShell
```powershell
Start-Process dist\stats.html
```

## 📊 Cosa Vedrai nel Report

### Visualizzazione Treemap

- **Rettangoli grandi** = Chunk/moduli grandi
- **Rettangoli piccoli** = Chunk/moduli piccoli
- **Colori diversi** = Tipi diversi (vendor, dashboard, etc.)

### Informazioni per Ogni Chunk

Cliccando su un rettangolo vedrai:
- **Size**: Dimensione originale (es: 200KB)
- **Gzip**: Dimensione compressa gzip (es: 60KB)
- **Brotli**: Dimensione compressa brotli (es: 55KB)
- **Path**: Percorso del file
- **Dependencies**: Cosa importa questo modulo

## 🎯 Cosa Cercare

### ✅ Buono (Target)
- Chunk size: **200-300KB**
- Vendor chunks **separati** (vendor-supabase, vendor-firebase)
- Gzip < 100KB per chunk critico

### ⚠️ Da Ottimizzare
- Chunk > **500KB**: Troppo grande, dividere
- Stessa libreria in più chunk: Duplicazione
- Codice non usato: Tree shaking non funziona

## 🔍 Esempio di Cosa Vedrai

```
📦 vendor-supabase.js
   └── 150KB (gzip: 45KB)

📦 dashboard-education.js
   ├── education-gamification.js (50KB)
   ├── education-spaced-repetition.js (40KB)
   └── ...

📦 common-utils.js
   └── 30KB (gzip: 10KB)
```

## ❓ Se Non Funziona

### File stats.html non generato

1. **Verifica che il build sia completato**:
   ```bash
   ls dist/
   ```

2. **Controlla errori**:
   ```bash
   npm run build:analyze 2>&1 | tee build.log
   ```

3. **Verifica installazione plugin**:
   ```bash
   npm list rollup-plugin-visualizer
   ```

### Build fallisce

- Controlla errori nella console
- Verifica che tutte le dipendenze siano installate: `npm install`
- Prova build normale prima: `npm run build`

---

**Comando da Eseguire**: `npm run build:analyze`

**File da Aprire**: `dist/stats.html`

