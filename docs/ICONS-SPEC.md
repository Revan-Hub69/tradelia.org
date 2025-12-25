# Tradelia — Icon Set Specification (Best Practice 2025)

## 1) DNA visivo Tradelia per le icone

**Obiettivo**: sembrare "research/standard" (affidabilità) + "innovazione" (contemporaneo), senza vibe da exchange/trading app.

**Parole chiave**:
- Precisione (forme pulite, geometria coerente)
- Sobrietà (niente effetti cheap)
- Leggibilità (14–20px funzionali)
- Coerenza (stesso stroke, angoli, spazi)
- Semantica (icone che spiegano, non decorano)

## 2) Specifica tecnica del set (non negoziabile)

### 2.1 Grid & dimensioni
- Artboard base: 24×24 (standard)
- Variante micro: 16×16 (solo se serve)
- Snap to grid: usa griglia 1px + "pixel hinting" leggero quando esporti le 24px.

### 2.2 Stroke (stile 2025 "pro")
Scegli UNA di queste due strade e non mischiare:

**A) Line icons istituzionali**
- stroke-width: 1.75 (24px)
- stroke-linecap: round
- stroke-linejoin: round

**B) Line icons più "technical"**
- stroke-width: 1.5 (24px)
- stroke-linecap: butt o round (scegline uno)
- stroke-linejoin: miter con limit moderato

*Per Tradelia consigliamo A: "serio ma moderno".*

### 2.3 Corner radius
Angoli: coerenti (es. r=2 o r=3 in griglia 24)
Evita mix di angoli super tondeggianti e spigoli vivi.

### 2.4 Riempimenti
- Default: outline only (no fill).
- Unica eccezione: piccoli "accent fills" (5–10% area) per iconcine chiave, ma raramente.

### 2.5 Negative space
Regola: vuoto leggibile, non forme ammassate.
Distanze minime tra stroke: ≥ 2px nel 24×24.

## 3) Linguaggio grafico: come essere "innovativi" senza essere gimmick

Innovazione 2025 "professionale" = astrazione intelligente, non effetti.

**Tecniche "Tradelia-compatible"**:

- **Dual-layer meaning**: Un'icona comunica due concetti: es. "Trasparenza + Rischio" usando un ledger + un indicatore.
- **Micro-motivi strutturali**: Pattern minimali che richiamano: griglia, check, audit, "ledger blocks".
- **Metafore non inflazionate**: Evita: razzi, monete, sacchi di soldi, tori/orsi cartoon.
- **Segni "editoriali"**: Frecce sottili, bracket, evidenziatori lineari, marker, puntini di nota.

## 4) Set semantico Tradelia (icone che ti servono davvero)

Set iniziale di 16 icone (sufficienti per homepage + percorsi + metodo):

**Core**
- tradelia-mark (logo-mark astratto)
- risk-scale
- path-low
- path-mid
- path-high
- path-extreme

**Metodo (drawer/tooltip)**
- research (paper / reference)
- interpretation (lens / bracket)
- risk (shield / caution)
- common-errors (loop / warning)
- sources (link / citation)

**Sistema**
- glossary
- language
- theme
- privacy
- audit

*Regola: un'icona = un concetto stabile. Niente "icone carine" senza funzione.*

## 5) Pipeline pratica per crearle (Figma → SVG pulito)

### 5.1 In Figma (o Illustrator)
- Crea un file "Tradelia Icons".
- Imposta: frame 24×24, griglia 1px, stroke global style (1.75 round)
- Crea componenti con naming: ico/risk-scale, ico/research, …

### 5.2 Prima di esportare
- Converti stroke in outline solo se necessario (di solito NO).
- Assicurati che tutte le linee siano su coordinate intere o .5 quando serve.
- Niente layer nascosti, niente mask inutili.

### 5.3 Export SVG
- Export come SVG "minify".
- Poi passa sempre da SVGO (o plugin Figma SVGO).

## 6) Spec SVG "pulito" (da imporre)

Ogni SVG deve rispettare:
- viewBox="0 0 24 24"
- no width/height hardcoded (li gestisci in CSS)
- no fill di default (se outline)
- stroke ereditabile: stroke="currentColor"
- opzionale: stroke-width="1.75" (o in CSS)
- role="img" e aria-hidden="true" se decorativa

**Esempio template**:
```svg
<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
  <path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M..."/>
</svg>
```

## 7) Integrazione nel design system (Next.js)

### 7.1 Regole CSS
- icone come testo: color controlla stroke
- dimensioni via classi:
  ```css
  .ico-16 { width:16px; height:16px }
  .ico-20 { width:20px; height:20px }
  .ico-24 { width:24px; height:24px }
  ```

### 7.2 States
- hover: cambia solo color o opacità (non ricolorare con gradienti)
- in "risk badges": icona può ereditare colore rischio

## 8) Coerenza e controllo qualità (QA per icone)

Checklist per ogni icona:
- [ ] leggibile a 16px
- [ ] coerente stroke e cap/join
- [ ] nessun dettaglio sotto 2px
- [ ] riconoscibile in dark mode
- [ ] semantica chiara (test "5 secondi": capisco cosa fa?)
- [ ] SVG pulito (svgo), niente metadata
- [ ] allineamenti centrati e ottica corretta (non solo geometrica)

## 9) "Firma" Tradelia: un dettaglio distintivo (senza gimmick)

Per rendere il set "nostro" senza risultare infantile, scegli UNA firma discreta:

**Opzioni consigliate**:
- bracket corner (tipo parentesi editoriali) ricorrente in 3–4 icone
- micro-notch (taglio minuscolo) su alcune forme
- dot marker (punto di annotazione) usato nei concetti "metodo/fonti"

Deve essere invisibile a livello casual, ma coerente a livello design.

## 10) Mini-brief per icone Tradelia (da dare al designer)

"Crea icone outline 24×24, stroke 1.75 round, look istituzionale/accademico, no trading-hype.
Ogni icona deve essere leggibile a 16px, con negative space >2px e semantica univoca.
Usa currentColor, niente fill (salvo micro accent), esporta con SVGO e naming stabile."
