# 🧹 Raccomandazioni Pulizia Progetto

## ✅ STRUTTURA CORRETTA (Mantenere)

### Pagine Prodotto (Coerenti e ben strutturate)
- ✅ `pricing.html` - Overview con link a prodotti specifici
- ✅ `desk.html` - Pagina dedicata Piano Desk (€149)
- ✅ `analisi-su-richiesta.html` - Pagina dedicata Analisi (€49)
- ✅ `accesso.html` - Pagina accesso dashboard
- ✅ `dashboard.html` - Dashboard PWA

### Cartelle Essenziali
- ✅ `archivio/` - **NECESSARIA** (dashboard.html carica report da `/archivio/manifest.json`)
- ✅ `report/` - Report e componenti
- ✅ `api/` - API endpoints
- ✅ `admin/` - Admin panel

---

## ⚠️ FILE DA VERIFICARE/RIMUOVERE

### 1. File Broker Duplicati
- ❓ `AvaTrade.html` vs `AvaTrade2.html` - Verificare quale mantenere
- ❓ Pagine broker con design inconsistente (Pepperstone.html, FPMarkets.html, etc.) - Verificare se ancora utilizzate

### 2. File .md Obsoleti (98 file totali)
**Categorie da verificare:**
- `ARCHIVIO-*.md` - Potrebbero essere obsoleti se archivio/ è ancora attivo
- `FIX-*.md` - Fix completati, probabilmente obsoleti
- `VERIFICA-*.md` - Verifiche completate, probabilmente obsoleti
- `ANALISI-*.md` - Analisi completate, probabilmente obsoleti
- `RIEPILOGO-*.md` - Riepiloghi, probabilmente obsoleti

**File da mantenere:**
- `BEST-PRACTICE-2024-25.md`
- `DESIGN-SYSTEM-ACCADEMICO-2025.md`
- `PWA-ARCHITECTURE-BEST-PRACTICE.md`
- `GUIDA-AGENTE-TRADELIA-AI.md`
- `STATO-PROGETTO.md`

### 3. File Potenzialmente Obsoleti
- ❓ `tutorials.html` - Verificare se ancora utilizzato
- ❓ `checkout-image-generator.html` - Verificare se ancora utilizzato
- ❓ `manifest.json` (root) - Verificare se diverso da `dashboard.webmanifest`

---

## 📋 STRUTTURA PAGINE PRODOTTO (CORRETTA)

### Approccio Attuale: ✅ **CORRETTO**

```
pricing.html (Overview)
├── Link a desk.html
├── Link a analisi-su-richiesta.html
└── Sezioni per ogni prodotto

desk.html (Dedicata)
└── Focus completo su Piano Desk

analisi-su-richiesta.html (Dedicata)
└── Focus completo su Analisi
```

**Vantaggi:**
- ✅ SEO ottimale (pagine dedicate)
- ✅ UX chiara (focus su un prodotto)
- ✅ Link da pricing.html funzionano bene
- ✅ Design coerente

**Raccomandazione:** ✅ **MANTENERE** struttura attuale

---

## 🔍 VERIFICHE NECESSARIE

### 1. File Broker
```bash
# Verificare se pagine broker sono ancora linkate
grep -r "Pepperstone.html\|FPMarkets.html\|AvaTrade" *.html
```

### 2. File .md
```bash
# Contare file per categoria
ls ARCHIVIO-*.md | wc -l
ls FIX-*.md | wc -l
ls VERIFICA-*.md | wc -l
```

### 3. File Obsoleti
- Verificare `tutorials.html` - è ancora linkato?
- Verificare `checkout-image-generator.html` - è ancora utilizzato?
- Verificare `manifest.json` vs `dashboard.webmanifest`

---

## ✅ COERENZA COPY E STRUTTURAZIONE

### Copy: ✅ **COERENTE**
- ✅ "Dashboard PWA" usato consistentemente
- ✅ "Codice di accesso" invece di "token"
- ✅ Terminologia uniforme

### Strutturazione: ✅ **COERENTE**
- ✅ Design system accademico applicato
- ✅ Pagine prodotto ben strutturate
- ✅ Link e navigazione funzionanti

---

## 🎯 AZIONI RACCOMANDATE

1. **Verificare file broker duplicati** (AvaTrade.html vs AvaTrade2.html)
2. **Pulire file .md obsoleti** (mantenere solo quelli attivi)
3. **Verificare pagine broker** - sono ancora utilizzate?
4. **Mantenere struttura pagine prodotto** - è corretta e funzionale

