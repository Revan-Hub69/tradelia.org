# Guida Deploy - Swing Master 5.0

## 📦 File da Deployare (Frontend + Reports)

### ✅ **Deploy Completo: Cartella `report/`**

Tutti i file in `report/` devono essere deployati:

```
report/
├── index.html                    ✅ DEPLOY (entry point)
├── assets/                       ✅ DEPLOY (tutti i file)
│   ├── css/
│   │   ├── tokens.css
│   │   └── drawer-mobile-fix.css
│   ├── js/
│   │   ├── app.js
│   │   ├── components/          ✅ DEPLOY (tutti i componenti)
│   │   │   ├── glossary-embedded.js
│   │   │   ├── header-ticker.js
│   │   │   ├── metric-popup.js
│   │   │   ├── metrics-drawer.js
│   │   │   ├── share.js
│   │   │   ├── site-footer.js
│   │   │   └── site-header.js
│   │   ├── modules/             ✅ DEPLOY (moduli rendering)
│   │   │   ├── _placeholder.js
│   │   │   ├── f1b.js
│   │   │   ├── f1b-processor.js
│   │   │   ├── f2.js
│   │   │   ├── f3.js
│   │   │   └── f3o.js
│   │   └── utils/
│   │       └── logger.js
│   └── glossary.json
├── reports/                      ✅ DEPLOY (tutti i report JSON)
│   ├── sample-id/               ✅ DEPLOY (report esempio)
│   │   ├── header.json
│   │   ├── manifest.json
│   │   ├── f1b.json
│   │   └── ...
│   └── 20251107-1630/           ✅ DEPLOY (nuovo report AAPL)
│       ├── header.json
│       ├── manifest.json
│       └── f1b.json
├── tutorial/                    ✅ DEPLOY (opzionale, se vuoi mantenere)
└── macro/                       ✅ DEPLOY (opzionale)
```

### 📋 **Struttura Path nel Deploy**

Il server deve servire i file con questi path:

```
https://tradelia.org/report/
├── index.html
├── assets/css/tokens.css
├── assets/js/app.js
├── assets/js/components/header-ticker.js
├── assets/js/modules/f1b.js
└── reports/{reportId}/
    ├── header.json
    ├── manifest.json
    └── f1b.json
```

### 🔗 **URL di Accesso**

```
https://tradelia.org/report/index.html?id=20251107-1630
```

---

## 🔧 File Interni (NON Deployare)

### ❌ **NON Deployare: Cartella `swing-master-5.0/`**

Tutti i file in `swing-master-5.0/` sono **solo per sviluppo interno**:

```
swing-master-5.0/
├── modules/                      ❌ INTERNO
│   ├── orchestrator.js          (genera report)
│   ├── f1b-data-collector.js    (raccoglie dati)
│   ├── f1b-processor-enhanced.js (processa dati)
│   ├── f1b-explanations.js      (spiegazioni)
│   ├── f1b-output-formatter.js  (formatta output)
│   └── f1b-enhanced-complete.js (workflow completo)
├── examples/                     ❌ INTERNO
├── test/                         ❌ INTERNO
├── docs/                         ❌ INTERNO
└── *.md                          ❌ INTERNO (documentazione)
```

**Questi file NON servono al frontend**, sono solo per:
- Generare nuovi report (orchestrator)
- Sviluppare nuovi moduli
- Testare
- Documentazione

---

## 🎯 Checklist Deploy

### Step 1: Verifica Report
- [ ] `report/reports/20251107-1630/header.json` esiste
- [ ] `report/reports/20251107-1630/f1b.json` esiste
- [ ] `report/reports/20251107-1630/manifest.json` esiste

### Step 2: Verifica Frontend
- [ ] `report/index.html` esiste
- [ ] `report/assets/js/app.js` esiste
- [ ] `report/assets/js/components/header-ticker.js` esiste
- [ ] `report/assets/js/modules/f1b.js` esiste
- [ ] `report/assets/css/tokens.css` esiste

### Step 3: Deploy
- [ ] Upload cartella `report/` completa
- [ ] Verifica path `/report/` sul server
- [ ] Test accesso: `https://tradelia.org/report/index.html?id=20251107-1630`

### Step 4: Test
- [ ] Header ticker appare correttamente
- [ ] F1B card viene renderizzata
- [ ] Metriche sono cliccabili
- [ ] Popup spiegazioni funziona

---

## 📝 Note Importanti

### 1. **Report JSON sono Statici**
I file JSON in `reports/` sono **generati offline** e deployati come file statici.
- **Non serve** Node.js sul server
- **Non serve** eseguire orchestrator sul server
- I report sono **pre-generati** e deployati

### 2. **Generazione Report (Offline)**
Per generare nuovi report:
1. Esegui `swing-master-5.0/modules/orchestrator.js` **localmente**
2. Genera i file JSON in `report/reports/{reportId}/`
3. Deploya solo i nuovi file JSON

### 3. **Frontend è Statico**
Il frontend è **100% statico**:
- Solo HTML, CSS, JavaScript vanilla
- Nessun build step necessario
- Compatibile con qualsiasi server web statico

---

## 🚀 Esempio Deploy

### Con Git (se usi Git)
```bash
# Deploy solo report/
git add report/
git commit -m "Deploy report AAPL"
git push origin main
```

### Con FTP/SFTP
```bash
# Upload solo cartella report/
# NON uploadare swing-master-5.0/
```

### Con rsync
```bash
rsync -av report/ user@server:/path/to/tradelia.org/report/
# NON syncare swing-master-5.0/
```

---

## ✅ Conclusione

**Deploy:**
- ✅ `report/` (tutto)

**NON Deploy:**
- ❌ `swing-master-5.0/` (solo sviluppo interno)

**Workflow:**
1. Genera report localmente con `swing-master-5.0/`
2. Deploya `report/reports/{reportId}/` sul server
3. Il frontend carica automaticamente i JSON

