# 🎨 Specifiche Immagine Checkout Stripe - Tradelia AI

## 📐 Dimensioni e Formato

**Dimensioni:**
- **800x800px** (quadrato, formato consigliato Stripe)
- **1200x1200px** (alta risoluzione, opzionale)

**Formato:**
- PNG con trasparenza (preferito)
- JPG (se PNG non disponibile)

**Peso file:**
- Massimo 2MB (Stripe limita a 2MB)

---

## 🎨 Stile Visivo Tradelia AI

### Colori Brand

**Primari:**
- **Blu istituzionale:** `#2563eb` (--brand-600)
- **Blu hover:** `#3b82f6` (--brand-500)
- **Blu light:** `#60a5fa` (--brand-400)

**Sfondo:**
- **Dark:** `#0f0f0f` (--surface-page)
- **Card:** `rgba(15, 23, 42, 0.6)` (--surface-card)

**Testo:**
- **Principale:** `#ffffff` o `rgba(255, 255, 255, 0.95)`
- **Secondario:** `rgba(255, 255, 255, 0.75)`

**Accenti:**
- **Bordo:** `rgba(37, 99, 235, 0.3)` (blu trasparente)

---

### Tipografia

**Font:**
- **Inter** (font principale Tradelia AI)
- **Weight:** 600-700 per titoli, 400 per testo

**Stile:**
- Sobrio, istituzionale, accademico
- Letter-spacing: -0.01em (leggermente stretto)
- Line-height: 1.2-1.4

---

## 🖼️ Composizione Immagine

### Layout (800x800px)

**Struttura:**
```
┌─────────────────────────┐
│                         │
│   [LOGO/ICONA CENTRALE] │  ← 200x200px, centrato
│                         │
│   TRADELIA AI           │  ← Titolo brand, 32-36px
│                         │
│   Framework AI          │  ← Sottotitolo, 18-20px
│   per analisi mercati   │
│                         │
│   [ELEMENTI DECORATIVI] │  ← Linee/griglie sottili
│                         │
└─────────────────────────┘
```

---

### Elementi da Includere

**1. Logo/Icona Centrale:**
- Logo Tradelia AI (se disponibile)
- O icona stilizzata: grafico/candele minimaliste
- Dimensione: 200x200px
- Colore: blu brand (#3b82f6) con gradiente leggero
- Posizione: centro verticale e orizzontale

**2. Testo Brand:**
- "TRADELIA AI"
- Font: Inter, 700, 32-36px
- Colore: bianco (#ffffff)
- Letter-spacing: -0.02em
- Posizione: sotto logo, centrato

**3. Sottotitolo:**
- "Framework AI per analisi mercati"
- Font: Inter, 400, 18-20px
- Colore: rgba(255, 255, 255, 0.75)
- Posizione: sotto titolo, centrato

**4. Elementi Decorativi (Opzionali):**
- Linee sottili orizzontali (griglia)
- Punti/grid pattern molto sottile
- Colore: rgba(37, 99, 235, 0.15)
- Opacità: 10-15%

---

## 🎨 Varianti da Creare

### Variante 1: Minimalista (Consigliata)

**Sfondo:**
- Gradiente scuro: `#0f0f0f` → `#1a1f2e`
- Nessun pattern, pulito

**Elementi:**
- Logo/icona centrale (200x200px)
- Testo "TRADELIA AI" sotto
- Sottotitolo opzionale
- Bordo sottile blu (opzionale)

**Stile:** Pulito, professionale, istituzionale

---

### Variante 2: Con Pattern

**Sfondo:**
- `#0f0f0f` solido
- Grid pattern molto sottile (opacità 10%)
- Linee orizzontali/verticali blu trasparenti

**Elementi:**
- Logo/icona centrale
- Testo brand
- Pattern come texture di sfondo

**Stile:** Più visivamente ricco, mantiene sobrietà

---

### Variante 3: Con Accenti

**Sfondo:**
- `#0f0f0f` con gradiente blu leggero ai bordi
- Accenti blu agli angoli (opzionale)

**Elementi:**
- Logo/icona con glow blu leggero
- Testo con ombra leggera
- Bordo blu trasparente

**Stile:** Più dinamico, mantiene professionalità

---

## 📋 Specifiche Tecniche Dettagliate

### Sfondo

**Opzione A (Minimalista):**
```css
background: linear-gradient(180deg, #0f0f0f 0%, #1a1f2e 100%);
```

**Opzione B (Solido):**
```css
background: #0f0f0f;
```

**Opzione C (Con Pattern):**
```css
background: #0f0f0f;
background-image: 
  linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px);
background-size: 40px 40px;
```

---

### Logo/Icona

**Se hai logo:**
- Usa `/img/tradelia_og_vC_white_clean.png` (ridimensionato a 200x200px)
- Posiziona al centro
- Mantieni proporzioni

**Se crei icona:**
- Grafico/candele stilizzate
- Colore: gradiente `#3b82f6` → `#60a5fa`
- Stile: minimalista, linee sottili
- Dimensione: 200x200px

---

### Testo

**Titolo "TRADELIA AI":**
```css
font-family: 'Inter', sans-serif;
font-weight: 700;
font-size: 36px;
letter-spacing: -0.02em;
color: #ffffff;
text-align: center;
margin-top: 24px;
```

**Sottotitolo:**
```css
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 18px;
letter-spacing: 0;
color: rgba(255, 255, 255, 0.75);
text-align: center;
margin-top: 12px;
```

---

## 🛠️ Come Creare l'Immagine

### Opzione 1: Figma/Adobe Illustrator

1. Crea canvas 800x800px
2. Imposta sfondo: `#0f0f0f`
3. Aggiungi logo/icona centrale (200x200px)
4. Aggiungi testo "TRADELIA AI" (36px, Inter, bianco)
5. Aggiungi sottotitolo (18px, Inter, grigio chiaro)
6. Esporta come PNG (trasparenza se serve)

---

### Opzione 2: Canva/Design Tool Online

1. Template 800x800px
2. Sfondo scuro (#0f0f0f)
3. Aggiungi elementi testo
4. Esporta PNG

---

### Opzione 3: CSS/HTML (Poi Screenshot)

Crea file HTML con CSS, poi fai screenshot:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      width: 800px;
      height: 800px;
      margin: 0;
      background: linear-gradient(180deg, #0f0f0f 0%, #1a1f2e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Inter', sans-serif;
    }
    .logo {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
      border-radius: 24px;
      margin-bottom: 32px;
    }
    .title {
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .subtitle {
      font-size: 18px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.75);
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <div class="logo"></div>
  <h1 class="title">TRADELIA AI</h1>
  <p class="subtitle">Framework AI per analisi mercati</p>
</body>
</html>
```

Poi fai screenshot a 800x800px.

---

## ✅ Checklist Finale

**Immagine Pronta:**
- [ ] Dimensioni: 800x800px (o 1200x1200px)
- [ ] Formato: PNG (o JPG)
- [ ] Peso: < 2MB
- [ ] Sfondo: #0f0f0f o gradiente scuro
- [ ] Logo/icona centrale (200x200px)
- [ ] Testo "TRADELIA AI" (36px, bianco)
- [ ] Sottotitolo opzionale (18px, grigio)
- [ ] Stile: sobrio, istituzionale, accademico
- [ ] Colori brand: blu #2563eb, #3b82f6, #60a5fa

**Upload Stripe:**
- [ ] Vai su Stripe Dashboard → Products
- [ ] Seleziona prodotto
- [ ] Clicca "Add image"
- [ ] Upload immagine
- [ ] Verifica anteprima checkout

---

## 📝 Note Aggiuntive

**Per Checkout Stripe:**
- L'immagine appare durante il pagamento
- Dovrebbe essere riconoscibile e professionale
- Non deve essere troppo complessa (distrae)
- Deve funzionare su sfondo bianco (Stripe checkout)

**Alternative:**
- Se non hai logo, usa solo testo stilizzato
- Se vuoi più dinamismo, aggiungi pattern sottile
- Mantieni sempre sobrietà istituzionale

