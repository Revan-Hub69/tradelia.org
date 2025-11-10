# 📊 Admin Dashboard - Upload Chart Screenshot

Dashboard per caricare screenshot chart Exante nei report.

## 🚀 Come Usare

### 1. Avvia il Server

```bash
node report/admin/upload-chart-server.js
```

Il server si avvierà su `http://localhost:3001`

### 2. Apri la Dashboard

Apri nel browser:
```
http://localhost:3001/report/admin/upload-chart.html
```

### 3. Carica Screenshot

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

## 🔒 Sicurezza

- Validazione Report ID (solo caratteri alfanumerici, underscore, trattino)
- Limite dimensione file (10MB)
- Validazione tipo file (solo immagini)

## 🚨 Troubleshooting

**Errore: "Cannot find module"**
- Assicurati di essere nella directory root del progetto
- Installa le dipendenze: `npm install` (se necessario)

**Errore: "Permission denied"**
- Verifica i permessi di scrittura sulla directory `report/reports/`

**Porta già in uso**
- Cambia la porta in `upload-chart-server.js`
- Oppure chiudi il processo che usa la porta 3001

