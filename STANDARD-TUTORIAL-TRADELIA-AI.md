# 📘 STANDARD TUTORIAL TRADELIA AI

**Versione:** 1.0  
**Data:** Gennaio 2025  
**Obiettivo:** Definire standard di qualità e coerenza per tutti i tutorial

---

## 🎯 REQUISITI OBBLIGATORI

### 1. Struttura JSON Coerente

**Formato Base:**
```json
{
  "title": "[Titolo] - Guida Completa Tradelia AI",
  "meta": {
    "published": "Gennaio 2025",
    "category": "[Categoria]",
    "difficulty": "[Principiante|Intermedio|Avanzato]"
  },
  "tags": ["tag1", "tag2", ...],
  "glossaryTerms": {
    "termine1": "CreditRiskBlock",
    ...
  },
  "sections": [
    {
      "id": "sezione-id",
      "title": "Titolo Sezione",
      "content": [
        {
          "type": "paragraph",
          "text": "..."
        },
        {
          "type": "pill",
          "text": "**Pillola Educativa:** ..."
        }
      ]
    }
  ]
}
```

### 2. Contenuto di Qualità

#### Pillole Educative
- **Obbligatorie:** Almeno 1 per sezione principale
- **Formato:** `**Pillola Educativa:** [Riferimento accademico] [Spiegazione]`
- **Riferimenti:** Studi accademici con autori e anni (es. "Lo studio di Fama & French (1992)")
- **Esempio:**
```json
{
  "type": "pill",
  "text": "**Pillola Educativa:** Lo studio di Fama & French (1992) ha dimostrato che i multipli settoriali spiegano una porzione significativa della variazione dei rendimenti azionari. Questo conferma l'importanza di confrontare sempre un titolo con i suoi peer di settore."
}
```

#### Esempi Pratici
- **Obbligatori:** Almeno 1 esempio concreto per sezione operativa
- **Formato:** Casi reali o simulati con numeri concreti
- **Esempio:** "Supponiamo di valutare un titolo tech con P/E 28, ROE 22%..."

#### Spiegazioni Tradelia AI
- **Obbligatorie:** Menzione metodo Tradelia AI quando rilevante
- **Formato:** Collegamento ai 12 blocchi quando applicabile
- **Esempio:** "Nel metodo Tradelia AI, questo concetto fa parte del Blocco 8 (Tecnica & Correlazioni)..."

### 3. Spiegazioni Accessibili

#### Principi
- **Concetti Accademici:** Spiegati in modo comprensibile
- **Terminologia Tecnica:** Definiti nel glossario
- **Linguaggio:** Chiaro, diretto, senza gergo eccessivo
- **Esempi:** Sempre accompagnati da spiegazioni pratiche

#### Struttura
- **Paragrafi:** Max 4-5 frasi, ben strutturati
- **Heading:** Gerarchia chiara (h2 per sezioni, h3 per sottosezioni)
- **Liste:** Per concetti complessi o step operativi
- **Pillole:** Evidenziate per attirare attenzione

### 4. Coerenza Sistema Tradelia AI

#### Menzioni Obbligatorie
- **Titolo:** Deve contenere "Tradelia AI"
- **Introduzione:** Deve menzionare Tradelia AI e metodo quando applicabile
- **Collegamenti:** Riferimenti ai 12 blocchi quando rilevante

#### Metodo 12 Blocchi
Quando il tutorial tratta argomenti correlati, menzionare il blocco corrispondente:
- **Blocco 1:** Identificativi & Contesto
- **Blocco 2:** Multipli & Valutazione
- **Blocco 3:** Fondamentali Aziendali
- **Blocco 4:** Dividendi & Buyback
- **Blocco 5:** Performance & Rischio
- **Blocco 6:** Microstruttura & Market
- **Blocco 7:** Derivati & Opzioni
- **Blocco 8:** Tecnica & Correlazioni
- **Blocco 9:** Proprietà, ESG & Governance
- **Blocco 10:** Cluster Strategico AI
- **Blocco 11:** Eventi & Macro
- **Blocco 12:** Dati Alternativi & Retail

---

## ✅ CHECKLIST QUALITÀ

### Struttura JSON
- [ ] `title` contiene "Tradelia AI"
- [ ] `meta` completo (published, category, difficulty)
- [ ] `tags` presente e rilevanti
- [ ] `glossaryTerms` presente
- [ ] `sections` presente e non vuoto
- [ ] Validità sintassi JSON (nessun errore)

### Contenuto
- [ ] Almeno 1 pillola educativa per sezione principale
- [ ] Riferimenti accademici nelle pillole (autore, anno)
- [ ] Almeno 1 esempio pratico per sezione operativa
- [ ] Menzione metodo Tradelia AI quando rilevante
- [ ] Collegamenti ai 12 blocchi quando applicabile

### Spiegazioni
- [ ] Concetti accademici spiegati in modo accessibile
- [ ] Terminologia tecnica definita nel glossario
- [ ] Paragrafi ben strutturati (max 4-5 frasi)
- [ ] Heading gerarchici (h2, h3)
- [ ] Liste per concetti complessi

### Coerenza Sistema
- [ ] Stile educativo (non consulenza)
- [ ] Disclaimer presente
- [ ] Linguaggio coerente con identità Tradelia AI
- [ ] Palette design coerente (light theme per tutorial)

---

## 📋 TEMPLATE SEZIONE

### Sezione Standard
```json
{
  "id": "sezione-id",
  "title": "Titolo Sezione",
  "content": [
    {
      "type": "paragraph",
      "text": "Introduzione concetto principale. Spiegazione accessibile del concetto accademico."
    },
    {
      "type": "heading",
      "level": 3,
      "text": "Sottosezione"
    },
    {
      "type": "paragraph",
      "text": "Spiegazione dettagliata con esempi pratici."
    },
    {
      "type": "list",
      "items": [
        "**Punto 1:** Spiegazione",
        "**Punto 2:** Spiegazione",
        "**Punto 3:** Spiegazione"
      ]
    },
    {
      "type": "pill",
      "text": "**Pillola Educativa:** Lo studio di [Autore] ([Anno]) ha [risultato]. La ricerca evidenzia che [implicazione]."
    }
  ]
}
```

---

## 🎨 DESIGN E LEGGIBILITÀ

### Palette Tutorial (Light Theme)
- **Background:** Bianco (#ffffff)
- **Testo:** Nero/Grigio scuro (#0f0f0f)
- **Accenti:** Blu istituzionale (#2563eb)
- **Pillole:** Background grigio chiaro con bordo
- **Link:** Blu, sottolineati al hover

### Tipografia
- **Font:** Inter (system font fallback)
- **Dimensioni:** 
  - Titolo: clamp(24px, 3vw, 32px)
  - Heading h2: clamp(20px, 2.2vw, 26px)
  - Heading h3: clamp(16px, 1.6vw, 20px)
  - Paragrafo: 15px (--fs-15)
- **Line-height:** 1.7 (--lh-17)

### Spaziatura
- **Paragrafi:** Margin bottom var(--sp-4)
- **Sezioni:** Margin bottom var(--sp-10)
- **Pillole:** Margin top/bottom var(--sp-4)

---

## 🔍 VERIFICA AUTOMATICA

### Script di Verifica
```bash
# Verifica sintassi JSON
node scripts/verify-tutorials.js

# Verifica presenza pillole
grep -r "type.*pill" report/tutorial/data/

# Verifica riferimenti Tradelia AI
grep -r "Tradelia AI\|metodo Tradelia\|12 blocchi" report/tutorial/data/
```

---

## 📊 STATO ATTUALE

### Tutorial Verificati
- ✅ `valutare-azioni.json` - PERFETTO (riferimenti Tradelia AI presenti)
- ✅ `Analisi-Tecnica-Introduzione.json` - CORRETTO (sintassi fixata, riferimenti aggiunti)
- ✅ `Opzioni-Vanilla.json` - MIGLIORATO (riferimenti aggiunti)
- ✅ `CFD-guida-completa.json` - MIGLIORATO (pillola aggiunta, riferimenti aggiunti)
- ✅ `valutare-etf.json` - MIGLIORATO (riferimenti aggiunti)
- ⚠️ Altri 42 tutorial - DA VERIFICARE

---

## 🚀 PROSSIMI PASSI

1. **Verificare tutti i 47 tutorial**
2. **Correggere errori sintassi** (se presenti)
3. **Aggiungere riferimenti Tradelia AI** (dove mancano)
4. **Aggiungere pillole educative** (dove mancano)
5. **Standardizzare struttura** (uniformare formato)
6. **Verificare leggibilità** (palette, tipografia, spaziatura)

---

**Standard aggiornato:** Gennaio 2025

