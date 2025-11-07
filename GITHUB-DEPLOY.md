# 🐙 GitHub Deploy - Come Funziona

## ✅ Sì, Sostituisce i File Vecchi

Quando carichi la cartella `report/` in GitHub, **i file esistenti vengono sostituiti** se hanno lo stesso nome/path.

---

## 📋 Metodi di Deploy

### 1️⃣ **Git Push (Consigliato)**

```bash
# Naviga nella cartella del progetto
cd tradelia.org-main

# Aggiungi solo la cartella report/
git add report/

# Commit
git commit -m "Deploy report AAPL 20251107-1630"

# Push
git push origin main
```

**Cosa succede:**
- ✅ File esistenti in `report/` → **SOSTITUITI** con nuovi
- ✅ File nuovi → **AGGIUNTI**
- ✅ File rimossi localmente → **RIMOSSI** da GitHub (se fai `git rm`)

---

### 2️⃣ **GitHub Web Interface (Upload Manuale)**

1. Vai su GitHub → Repository
2. Naviga in `report/`
3. Click "Upload files"
4. Trascina la cartella `report/`

**Cosa succede:**
- ✅ File esistenti → **SOSTITUITI**
- ✅ File nuovi → **AGGIUNTI**
- ⚠️ File che non carichi → **RESTANO** (non vengono rimossi)

---

### 3️⃣ **GitHub Desktop / VS Code Git**

Stesso comportamento di `git push`:
- ✅ File modificati → **SOSTITUITI**
- ✅ File nuovi → **AGGIUNTI**
- ✅ File rimossi → **RIMOSSI** (se li hai rimossi localmente)

---

## ⚠️ Attenzione

### 1. **Backup Prima del Deploy**
Se hai modifiche importanti su GitHub che non vuoi perdere:

```bash
# Pull prima di push
git pull origin main

# Risolvi conflitti se necessario
# Poi push
git push origin main
```

### 2. **File Che Non Vuoi Sostituire**
Se hai file in `report/` su GitHub che **NON vuoi sostituire**:
- Non includerli nella cartella locale
- Oppure usa `.gitignore` per escluderli

### 3. **Report Vecchi**
Se hai report vecchi in `report/reports/` su GitHub:
- **Vengono mantenuti** se non li tocchi
- **Vengono sostituiti** solo quelli con stesso `reportId`

---

## 🎯 Scenario Pratico

### Situazione Attuale:
```
GitHub: report/reports/sample-id/header.json (vecchio)
GitHub: report/reports/sample-id/f1b.json (vecchio)
```

### Cosa Carichi:
```
Locale: report/reports/20251107-1630/header.json (nuovo)
Locale: report/reports/20251107-1630/f1b.json (nuovo)
Locale: report/index.html (modificato)
```

### Risultato:
```
GitHub: report/reports/sample-id/header.json (rimane)
GitHub: report/reports/sample-id/f1b.json (rimane)
GitHub: report/reports/20251107-1630/header.json (NUOVO)
GitHub: report/reports/20251107-1630/f1b.json (NUOVO)
GitHub: report/index.html (SOSTITUITO)
```

---

## ✅ Best Practice

### 1. **Deploy Solo Report Specifico**
Se vuoi deployare solo il nuovo report senza toccare altro:

```bash
# Aggiungi solo il nuovo report
git add report/reports/20251107-1630/

# Commit
git commit -m "Add report AAPL 20251107-1630"

# Push
git push origin main
```

### 2. **Deploy Completo (Sostituisce Tutto)**
Se vuoi sostituire tutta la cartella `report/`:

```bash
# Aggiungi tutto
git add report/

# Commit
git commit -m "Update report frontend and add AAPL report"

# Push
git push origin main
```

### 3. **Verifica Prima del Push**
```bash
# Vedi cosa verrà cambiato
git status

# Vedi le differenze
git diff report/
```

---

## 🔄 Workflow Consigliato

### Per Ogni Nuovo Report:

```bash
# 1. Genera report localmente (swing-master-5.0/)
# 2. Aggiungi solo il nuovo report
git add report/reports/{reportId}/

# 3. Commit
git commit -m "Add report {TICKER} {reportId}"

# 4. Push
git push origin main
```

### Per Aggiornamenti Frontend:

```bash
# 1. Modifica file in report/assets/
# 2. Aggiungi file modificati
git add report/assets/

# 3. Commit
git commit -m "Update frontend components"

# 4. Push
git push origin main
```

---

## 📝 Nota Importante

**GitHub NON è un server web!**

Se il tuo sito è deployato su un server web (es. Netlify, Vercel, hosting tradizionale):
1. GitHub serve come **repository** (backup/collaborazione)
2. Il deploy sul server web va fatto **separatamente**
3. Alcuni servizi (Netlify, Vercel) fanno auto-deploy da GitHub

---

## ✅ Conclusione

**Sì, sostituisce i file vecchi** con lo stesso nome/path.

**Per sicurezza:**
- ✅ Fai `git pull` prima di `git push`
- ✅ Usa `git status` per vedere cosa cambi
- ✅ Fai commit frequenti e piccoli
- ✅ Non deployare `swing-master-5.0/` (è solo sviluppo)

