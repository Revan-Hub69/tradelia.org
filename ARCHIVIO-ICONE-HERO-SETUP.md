# 🎨 Icone PWA e Immagine Hero - Setup

## ✅ File Creati

### 1. **Icone PWA SVG** ✅
- ✅ `/icons/icon-192.svg` - Icona 192x192 (SVG)
- ✅ `/icons/icon-512.svg` - Icona 512x512 (SVG)

### 2. **Immagine Hero SVG** ✅
- ✅ `/img/hero-homepage.svg` - Immagine hero 1920x1080 (SVG)

### 3. **Script Generazione** ✅
- ✅ `/scripts/generate-pwa-icons.js` - Genera PNG da SVG per icone PWA
- ✅ `/scripts/generate-hero-image.js` - Genera PNG/JPG da SVG per hero

---

## 📋 Come Generare le Immagini

### Step 1: Installare Dipendenze

```bash
npm install
```

Questo installerà `sharp` (libreria per processare immagini).

### Step 2: Generare Icone PWA

```bash
npm run generate-icons
```

Questo genererà:
- `/icons/icon-192.png` (192x192)
- `/icons/icon-512.png` (512x512)

### Step 3: Generare Immagine Hero

```bash
npm run generate-hero
```

Questo genererà:
- `/img/hero-homepage.png` (1920x1080)
- `/img/hero-homepage.jpg` (1920x1080, ottimizzato)

### Step 4: Generare Tutto

```bash
npm run generate-all
```

Genera sia le icone che l'immagine hero.

---

## 🎨 Design Icone PWA

### Icona 192x192 e 512x512
- **Background**: Nero (#0f0f0f) con bordi arrotondati
- **Logo**: "TRADELIA" in bianco, font Inter, bold
- **Badge AI**: Cerchio blu (#2563eb) con "AI" in bianco
- **Accent**: Punto blu sotto il logo

### Stile
- **Tema**: Dark, moderno, professionale
- **Colori**: Nero, bianco, blu (#2563eb)
- **Font**: Inter (sans-serif)

---

## 🎨 Design Immagine Hero

### Dimensioni
- **Larghezza**: 1920px
- **Altezza**: 1080px
- **Formato**: SVG (può essere convertito in PNG/JPG)

### Elementi
- **Background**: Gradiente scuro (nero → blu scuro)
- **Pattern**: Griglia sottile blu
- **Glow Effects**: Effetti luminosi blu
- **Logo**: "TRADELIA AI" centrato
- **Tagline**: "Trading Intelligence Powered by AI"
- **Accent**: Linea blu decorativa

### Stile
- **Tema**: Dark, futuristico, professionale
- **Colori**: Nero, blu scuro, blu (#2563eb), bianco
- **Font**: Inter (sans-serif)

---

## 📝 Aggiornare index.html

Dopo aver generato l'immagine hero, aggiorna `index.html`:

```html
<!-- Sostituisci -->
<div class="parallax bg-cover bg-center rounded-lg shadow-lg border border-slate-200 h-64 sm:h-80 lg:h-96" style="background-image:url('/img/hero-institutional.jpg')"></div>

<!-- Con -->
<div class="parallax bg-cover bg-center rounded-lg shadow-lg border border-slate-200 h-64 sm:h-80 lg:h-96" style="background-image:url('/img/hero-homepage.jpg')"></div>
```

---

## ✅ Checklist

- [x] SVG icone PWA creati (`icon-192.svg`, `icon-512.svg`)
- [x] SVG immagine hero creato (`hero-homepage.svg`)
- [x] Script generazione icone creato
- [x] Script generazione hero creato
- [x] Dipendenza `sharp` aggiunta a `package.json`
- [x] Scripts npm aggiunti (`generate-icons`, `generate-hero`, `generate-all`)
- [ ] **Eseguire `npm install`** per installare `sharp`
- [ ] **Eseguire `npm run generate-all`** per generare PNG/JPG
- [ ] **Verificare** che le icone siano state generate
- [ ] **Verificare** che l'immagine hero sia stata generata
- [ ] **Aggiornare** `index.html` per usare `hero-homepage.jpg`

---

## 🐛 Troubleshooting

### Problema: `sharp` non installato
**Soluzione**: 
```bash
npm install sharp
```

### Problema: Errore generazione immagini
**Soluzione**: 
- Verifica che i file SVG esistano
- Verifica che `sharp` sia installato
- Controlla i log per errori specifici

### Problema: Immagini non generate
**Soluzione**: 
- Verifica che la directory `/icons/` e `/img/` esistano
- Verifica i permessi di scrittura
- Esegui gli script manualmente: `node scripts/generate-pwa-icons.js`

---

## 🎯 Prossimi Step

1. ✅ SVG creati
2. ✅ Script generazione creati
3. ⏳ **Eseguire `npm install`** per installare `sharp`
4. ⏳ **Eseguire `npm run generate-all`** per generare immagini
5. ⏳ **Verificare** che tutto sia stato generato correttamente
6. ⏳ **Aggiornare** `index.html` per usare nuova immagine hero

---

**Nota**: Le immagini SVG sono pronte! Esegui `npm install` e poi `npm run generate-all` per generare le versioni PNG/JPG.

