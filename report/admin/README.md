# 📊 Admin Dashboard - Upload Chart Screenshot

Dashboard per caricare screenshot chart Exante nei report.

## 🚀 Come Usare

### 1. Avvia il Server

```bash
node report/admin/upload-chart-server.js
```

Il server si avvierà su `http://localhost:3001`

### 2. Apri la Dashboard

**Dashboard Completa (consigliata):**
```
http://localhost:3001/report/admin/dashboard.html
```

La dashboard completa mostra:
- ✅ Lista di tutti i report disponibili
- ✅ Indicatore se ogni report ha screenshot o no
- ✅ Preview dello screenshot esistente
- ✅ Click su un report per caricare/sostituire lo screenshot
- ✅ Ricerca report per nome o ticker
- ✅ Link per visualizzare il report

**Dashboard Semplice:**
```
http://localhost:3001/report/admin/upload-chart.html
```

La dashboard semplice permette di:
- ✅ Inserire manualmente il Report ID
- ✅ Caricare screenshot per un report specifico

### 3. Carica Screenshot

**Con Dashboard Completa:**
1. **Sfoglia i report**: Vedi tutti i report disponibili nella griglia
2. **Cerca report**: Usa la barra di ricerca per trovare un report specifico
3. **Click su "Carica" o "Sostituisci"**: Apre il modal di upload
4. **Seleziona File**: Clicca o trascina l'immagine (PNG, JPG)
5. **Preview**: Verifica l'anteprima
6. **Salva**: Clicca "Salva Screenshot"

**Con Dashboard Semplice:**
1. **Inserisci Report ID**: Es. `example-complete`, `20251107-1630`
2. **Seleziona File**: Clicca o trascina l'immagine (PNG, JPG)
3. **Preview**: Verifica l'anteprima
4. **Salva**: Clicca "Salva Screenshot"

### 4. Verifica

Lo screenshot sarà salvato in:
```
report/reports/{reportId}/chart-snapshot.png
```

## 📋 Requisiti

- Node.js (v14+)
- File system scrivibile
- Immagine PNG o JPG (max 10MB)

## 🔧 Configurazione

- **Porta**: Modifica `PORT` in `upload-chart-server.js` (default: 3001)
- **Directory Reports**: Modifica `REPORTS_DIR` in `upload-chart-server.js`

## 🎯 Caratteristiche

**Dashboard Completa:**
- ✅ Lista di tutti i report disponibili
- ✅ Indicatore visivo se screenshot presente o mancante
- ✅ Preview dello screenshot esistente
- ✅ Ricerca report per nome o ticker
- ✅ Click su report per caricare/sostituire screenshot
- ✅ Link per visualizzare il report nel browser
- ✅ Aggiornamento automatico dopo upload

**Dashboard Semplice:**
- ✅ Drag & Drop
- ✅ Preview immagine
- ✅ Validazione file
- ✅ Report recenti (click rapido)
- ✅ Feedback visivo
- ✅ Salvataggio automatico in directory corretta

## 📝 Note

- Lo screenshot viene sempre salvato come `chart-snapshot.png`
- Se il report non esiste, la directory viene creata automaticamente
- Il file sostituisce eventuali screenshot precedenti
- **Push automatico su GitHub**: Dopo ogni upload, lo screenshot viene automaticamente committato e pushato su GitHub
  - Il commit viene creato con messaggio: `chore: aggiorna screenshot chart per report {reportId}`
  - Il push viene fatto sul branch corrente del repository
  - Se il push fallisce, lo screenshot viene comunque salvato localmente

## 🔒 Sicurezza

- Validazione Report ID (solo caratteri alfanumerici, underscore, trattino)
- Limite dimensione file (10MB)
- Validazione tipo file (solo immagini)
- Push GitHub automatico (configurabile in `upload-chart-server.js`)

## ⚙️ Configurazione Push GitHub

Per abilitare/disabilitare il push automatico su GitHub, modifica in `upload-chart-server.js`:

```javascript
const AUTO_PUSH_TO_GITHUB = true; // true = abilitato, false = disabilitato
```

**Requisiti per push automatico:**
- Repository Git inizializzato
- Remote GitHub configurato (`git remote add origin ...`)
- Credenziali GitHub configurate
- Branch corrente valido

## 🚨 Troubleshooting

**Errore: "Cannot find module"**
- Assicurati di essere nella directory root del progetto
- Installa le dipendenze: `npm install` (se necessario)

**Errore: "Permission denied"**
- Verifica i permessi di scrittura sulla directory `report/reports/`

**Porta già in uso**
- Cambia la porta in `upload-chart-server.js`
- Oppure chiudi il processo che usa la porta 3001

