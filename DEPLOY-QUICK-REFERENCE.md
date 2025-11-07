# 📦 Deploy Quick Reference

## ✅ DEPLOY (Frontend + Reports)

### Cartella `report/` → Deploy Completo

```
report/
├── index.html                    ← Entry point
├── assets/                       ← Tutti i file CSS/JS
│   ├── css/
│   ├── js/
│   │   ├── app.js
│   │   ├── components/
│   │   ├── modules/
│   │   └── utils/
│   └── glossary.json
└── reports/                      ← Report JSON
    ├── sample-id/               ← Report esempio
    └── 20251107-1630/           ← Report AAPL ✨
        ├── header.json
        ├── manifest.json
        └── f1b.json
```

**URL di accesso:**
```
https://tradelia.org/report/index.html?id=20251107-1630
```

---

## ❌ NON DEPLOY (Solo Sviluppo Interno)

### Cartella `swing-master-5.0/` → NON Deployare

```
swing-master-5.0/
├── modules/          ← Generazione report (offline)
├── examples/         ← Esempi codice
├── test/             ← Test
└── docs/             ← Documentazione
```

**Questi file servono solo per:**
- Generare nuovi report localmente
- Sviluppare nuovi moduli
- Testare

---

## 🎯 Workflow

1. **Genera Report (locale)**
   ```bash
   # Usa swing-master-5.0/modules/orchestrator.js
   # Genera report/reports/{reportId}/
   ```

2. **Deploy Report**
   ```bash
   # Upload solo report/reports/{reportId}/
   ```

3. **Accesso Utente**
   ```
   https://tradelia.org/report/index.html?id={reportId}
   ```

---

## 📝 File Essenziali per Report AAPL

Per visualizzare il report `20251107-1630`:

### ✅ Deploy Necessari:
- `report/reports/20251107-1630/header.json`
- `report/reports/20251107-1630/f1b.json`
- `report/reports/20251107-1630/manifest.json`
- `report/assets/js/modules/f1b.js` (già presente)
- `report/assets/js/components/header-ticker.js` (già presente)
- `report/index.html` (già presente)

### ❌ NON Necessari:
- Tutti i file in `swing-master-5.0/` (solo sviluppo)

---

## ✅ Conclusione

**Deploy:**
- ✅ `report/` (tutto)

**NON Deploy:**
- ❌ `swing-master-5.0/` (solo sviluppo interno)

**Il frontend è 100% statico, nessun build step necessario!**

