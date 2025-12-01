# PDF Template Structure - Template Completo
## Struttura Report PDF con Logo Tradelia

**Riferimenti**: Few (2006), Tufte (2001), WCAG 2.1, PDF/A Standard

---

## 📄 Struttura Pagine

### 1. Cover Page (Pagina Copertina)

```
┌─────────────────────────────────────┐
│ [Logo Tradelia]    Report Analisi   │ ← Header
│                     [Data]           │
├─────────────────────────────────────┤
│                                     │
│         [TITOLO REPORT]            │ ← Title (32px, bold)
│                                     │
│    [Descrizione opzionale]         │ ← Description
│                                     │
│      [Badge Report Type]           │ ← Type badge
│                                     │
├─────────────────────────────────────┤
│ Generato da Tradelia    Pagina 1   │ ← Footer
└─────────────────────────────────────┘
```

### 2. Content Pages (Pagine Contenuto)

Ogni pagina contiene:

```
┌─────────────────────────────────────┐
│ [Logo]    [Titolo Report]           │ ← Header (ogni pagina)
│           [Data]                     │
├─────────────────────────────────────┤
│                                     │
│ ## Sezione Title                    │ ← Section Title (16px)
│ ### Subtitle                        │ ← Subtitle (12px)
│                                     │
│ [Contenuto sezione]                 │
│ - Testo                             │
│ - Tabelle                           │
│ - Chart                             │
│ - Statistiche                       │
│                                     │
├─────────────────────────────────────┤
│ [Autore]              Pagina N      │ ← Footer
└─────────────────────────────────────┘
```

---

## 🎨 Sezioni Supportate

### 1. Text Section
- **Type**: `text`
- **Content**: Paragrafo di testo
- **Styling**: Justify, line-height 1.6, font 10px

### 2. Statistics Section
- **Type**: `stats`
- **Data**: Array di `{label, value}`
- **Layout**: Container orizzontale con stat items
- **Styling**: Value prominente (20px, bold, accent), label (9px)

### 3. Table Section
- **Type**: `table`
- **Data**: Array di oggetti (rows)
- **Layout**: Header + rows con bordi
- **Styling**: Header con background soft, celle con padding 8px

### 4. Chart Section
- **Type**: `chart`
- **Data**: `{imageUrl, caption}`
- **Layout**: Immagine centrata + caption
- **Styling**: Max-width 100%, caption italic centrato

### 5. List Section
- **Type**: `list`
- **Data**: Array di stringhe
- **Layout**: Bullet points
- **Styling**: Margin-left 15px, bullet (•)

---

## 📊 Struttura Content JSON

Il parser supporta questa struttura:

```json
{
  "executiveSummary": "Testo riepilogo...",
  
  "metrics": [
    { "label": "Metrica 1", "value": "100" },
    { "label": "Metrica 2", "value": "200" }
  ],
  
  "sections": [
    {
      "id": "section-1",
      "title": "Titolo Sezione",
      "subtitle": "Sottotitolo",
      "content": "Contenuto testo...",
      "type": "text"
    }
  ],
  
  "analysis": [
    {
      "title": "Analisi 1",
      "content": "Testo analisi...",
      "type": "text"
    }
  ],
  
  "tables": [
    {
      "title": "Tabella 1",
      "data": [
        { "col1": "val1", "col2": "val2" },
        { "col1": "val3", "col2": "val4" }
      ]
    }
  ],
  
  "charts": [
    {
      "title": "Grafico 1",
      "imageUrl": "data:image/png;base64,...",
      "caption": "Descrizione grafico"
    }
  ],
  
  "conclusions": "Testo conclusioni...",
  
  "recommendations": [
    "Raccomandazione 1",
    "Raccomandazione 2"
  ]
}
```

---

## 🔧 Funzionalità Implementate

### Logo Tradelia
- ✅ Caricamento automatico da `/public/logos/tradelia-logo.svg`
- ✅ Conversione SVG → base64
- ✅ Fallback a SVG inline se file non trovato
- ✅ Presente in header di ogni pagina

### Chart Support
- ✅ Conversione URL → base64
- ✅ Supporto SVG nativo
- ✅ Placeholder se chart non disponibile
- ✅ Caption descrittivi (Tufte 2001)

### Content Parsing
- ✅ Parsing JSON intelligente
- ✅ Estrazione automatica sezioni
- ✅ Preservazione ordine originale
- ✅ Supporto nested structures

### Quality Options
- ✅ **Standard**: Qualità base, file più piccolo
- ✅ **High**: Qualità alta, chart ad alta risoluzione

### Include Charts Option
- ✅ **true**: Include tutti i chart
- ✅ **false**: Salta chart, solo testo/tabelle

---

## 📐 Principi Accademici Applicati

### Few (2006) - Information Dashboard Design

1. **Visual Hierarchy** ✅
   - Titoli gerarchici (32px → 16px → 12px → 10px)
   - Accent color per elementi importanti
   - Spacing appropriato

2. **Information Density** ✅
   - Balance informazioni/spazio bianco
   - Margini generosi (40px)
   - Sezioni ben separate

3. **Contextual Information** ✅
   - Metadata in header
   - Caption per chart
   - Footer con info pagina

4. **Consistency** ✅
   - Stile uniforme
   - Spacing consistente
   - Typography scale

### Tufte (2001) - Visual Display

1. **Chart Quality** ✅
   - Appropriate sizing
   - Caption descrittivi
   - High resolution (se quality=high)

2. **Data Presentation** ✅
   - Tables con header chiari
   - Alignment corretto
   - Minimal chartjunk

### WCAG 2.1

1. **PDF Metadata** ✅
   - Title, Author, Subject
   - Keywords
   - Creator/Producer

2. **Structure** ✅
   - Headings gerarchici
   - Logical reading order
   - Alt text (via caption)

---

## ✅ Checklist Completa

- [x] Logo Tradelia in ogni pagina
- [x] Cover page professionale
- [x] Header con metadata
- [x] Footer con info pagina
- [x] Sezioni in ordine logico
- [x] Chart con caption
- [x] Tables strutturate
- [x] Statistics prominenti
- [x] Lists formattate
- [x] Typography scale
- [x] Margini appropriati
- [x] PDF metadata completi
- [x] Quality options
- [x] Include charts option
- [x] Error handling
- [x] Fallback per chart
- [x] Base64 conversion
- [x] Logo loading automatico

**Status**: ✅ PRODUCTION-READY - Template Accademico Completo

