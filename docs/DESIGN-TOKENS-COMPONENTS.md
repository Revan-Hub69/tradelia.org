# Tradelia — Design Tokens & Component Spec (Best Practice 2025)

Versione: v1.0 (baseline)  
Obiettivo: UI sobria "istituzionale", dark-first, accessibile, performante, micro-interazioni funzionali, scalabile.

---

## 0) Principi non negoziabili

- **Dark mode default**, light disponibile.
- **Accessibilità**: focus visibile, contrasto AA (meglio AAA su testo).
- **Motion**: solo funzionale; supporto `prefers-reduced-motion`.
- **Coerenza**: stessi token ovunque; nessun colore/ombra "random" nei componenti.
- **2 font max**: Sans + Mono.
- **Progressive disclosure**: tooltip breve; drawer per approfondimento.
- **No "crypto hype UI"**: niente neon, gradienti aggressivi, glow eccessivi.

---

## 1) Design Tokens (CSS Variables)

> Nota: i valori sono "baseline" (non servono numeri perfetti ora).  
> L'importante è **la tassonomia**: ti consente scalabilità e manutenzione.

### 1.1 Colori — Core

```css
:root {
  /* Surfaces */
  --bg:           oklch(0.12 0.02 260);
  --bg-2:         oklch(0.15 0.02 260);
  --card:         oklch(0.17 0.02 260);
  --card-2:       oklch(0.20 0.02 260);

  /* Text */
  --ink:          oklch(0.92 0.02 260);
  --muted:        oklch(0.74 0.02 260);
  --faint:        oklch(0.62 0.02 260);

  /* Borders */
  --br:           oklch(0.28 0.02 260);
  --br-2:         oklch(0.34 0.02 260);

  /* Brand */
  --brand-500:    oklch(0.72 0.10 250);
  --brand-600:    oklch(0.66 0.12 250);
  --brand-700:    oklch(0.60 0.12 250);

  /* Links */
  --link:         var(--brand-500);
  --link-hover:   var(--brand-600);

  /* Overlays */
  --backdrop:     color-mix(in oklab, black 70%, transparent);
}
```

### 1.2 Colori — Rischio (desaturati, informativi)

```css
:root {
  --risk-low:     oklch(0.70 0.08 145);
  --risk-mid:     oklch(0.76 0.08  95);
  --risk-high:    oklch(0.70 0.10  40);
  --risk-extreme: oklch(0.60 0.10  20);

  /* Background tints (per pill/badge, leggeri) */
  --risk-low-bg:     color-mix(in oklab, var(--risk-low) 18%, var(--card));
  --risk-mid-bg:     color-mix(in oklab, var(--risk-mid) 18%, var(--card));
  --risk-high-bg:    color-mix(in oklab, var(--risk-high) 18%, var(--card));
  --risk-extreme-bg: color-mix(in oklab, var(--risk-extreme) 18%, var(--card));
}
```

### 1.3 Tipografia

```css
:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Inter", "IBM Plex Sans", Arial, sans-serif;
  --font-mono: ui-monospace, "IBM Plex Mono", "JetBrains Mono", SFMono-Regular, Menlo, monospace;

  --text-xs:  0.8125rem;
  --text-sm:  0.875rem;
  --text-md:  1rem;
  --text-lg:  1.125rem;
  --text-xl:  1.375rem;
  --text-2xl: 1.75rem;
  --text-3xl: 2.25rem;

  --lh-tight: 1.15;
  --lh-base:  1.55;
  --lh-loose: 1.7;

  --tracking-tight: -0.01em;
  --tracking-base:   0;
}
```

### 1.4 Spaziatura (8pt system)

```css
:root {
  --s-1:  0.25rem;  /* 4px  */
  --s-2:  0.5rem;   /* 8px  */
  --s-3:  0.75rem;  /* 12px */
  --s-4:  1rem;     /* 16px */
  --s-5:  1.25rem;  /* 20px */
  --s-6:  1.5rem;   /* 24px */
  --s-8:  2rem;     /* 32px */
  --s-10: 2.5rem;   /* 40px */
  --s-12: 3rem;     /* 48px */
}
```

### 1.5 Radius & Ombre (sobrie)

```css
:root {
  --r-sm:  0.75rem;
  --r-md:  1rem;
  --r-lg:  1.25rem;
  --r-xl:  1.5rem;

  --shadow-sm: 0 1px 0 rgba(0,0,0,.20), 0 8px 20px rgba(0,0,0,.18);
  --shadow-md: 0 1px 0 rgba(0,0,0,.22), 0 12px 32px rgba(0,0,0,.20);
  --shadow-lg: 0 1px 0 rgba(0,0,0,.24), 0 18px 48px rgba(0,0,0,.22);
}
```

### 1.6 Motion (durate & easing) + reduced motion

```css
:root {
  --dur-1: 120ms;
  --dur-2: 180ms;
  --dur-3: 240ms;

  --ease-out: cubic-bezier(.2,.9,.2,1);
  --ease-in:  cubic-bezier(.4,0,1,1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-1: 0ms;
    --dur-2: 0ms;
    --dur-3: 0ms;
  }
}
```

### 1.7 Focus ring (obbligatorio)

```css
:root {
  --focus: color-mix(in oklab, var(--brand-500) 70%, white);
  --focus-ring: 0 0 0 3px color-mix(in oklab, var(--focus) 45%, transparent);
}
```

---

## 2) Component Spec (UI + UX + A11y + Stati)

Ogni componente definisce:

scopo

varianti

stati

accessibilità

motion

responsive

### 2.1 Button

**Scopo**: azioni. CTA sobrie (no aggressività).

**Varianti**
- primary (solo 1 per view)
- secondary
- ghost
- outline
- danger (rarissimo, solo azioni distruttive interne)

**Stati**
- default / hover / focus-visible / active / disabled / loading

**A11y**
- button nativo
- aria-busy="true" durante loading
- focus ring sempre visibile con tastiera

**Motion**
- hover: leggero change di background + elevazione minima
- active: compressione leggera (transform: scale(0.98))

### 2.2 Link

**Scopo**: navigazione + fonti.

**Regole**
- underline sempre o almeno on-hover + on-focus
- colore link distinto dal testo
- su fonti: mostra dominio in piccolo (anti-scam, trasparenza)

**A11y**
- focus ring
- target=_blank solo su fonti esterne + rel="noopener noreferrer"

### 2.3 Card

**Scopo**: contenitori informativi (percorsi, profili, blocchi metodo).

**Varianti**
- default
- compact
- interactive (cliccabile)

**Stati**
- interactive hover: elevazione minima + bordo highlight
- focus-visible: ring + bordo brand

**Regola**
- la card "interactive" deve avere un elemento cliccabile chiaro (link o button), non solo onClick.

### 2.4 Badge / Pill (Risk)

**Scopo**: etichette rischio o stato (non decorative).

**Varianti**
- risk-low, risk-mid, risk-high, risk-extreme
- neutral

**Regole**
- testo breve (1–2 parole)
- colore desaturato + background tint
- mai usare solo colore: includere testo "Rischio contenuto / elevato..."

### 2.5 RiskScale (componente chiave homepage)

**Scopo**: orientamento per rischio in <60s.

**Layout**
- Desktop: orizzontale (4 step)
- Mobile: verticale (stack) con CTA per ogni step

**Contenuto per step**
- label rischio (badge)
- 1 frase "per chi"
- CTA "Vedi percorso"

**A11y**
- usare ol/li per step (semantica)
- focus navigabile
- niente informazioni solo via colore

### 2.6 Tooltip (definizione breve)

**Scopo**: 1–2 frasi di definizione.

**Trigger**
- icona ? (button) sempre cliccabile
- desktop: click (non hover-only)
- mobile: click → modal piccolo o popover centrato

**A11y**
- aria-expanded
- aria-controls
- esc chiude
- click outside chiude
- focus ritorna al trigger

**Contenuto**
- title
- what (breve)
- link "Approfondisci" → apre Drawer (non dentro tooltip)

### 2.7 Drawer / Panel (approfondimento Metodo Tradelia)

**Scopo**: progressive disclosure: Ricerca → Spiegazione → Rischio → Fonti.

**Comportamento**
- desktop: side panel (right) con scroll interno
- mobile: fullscreen o bottom-sheet (a scelta, ma coerente)

**A11y**
- focus trap
- ESC chiude
- ritorno focus al trigger
- role: dialog + aria-modal="true"
- titolo (h2) collegato via aria-labelledby

**Sezioni standard drawer**
- Cosa dice la ricerca
- Spiegazione Tradelia
- Rischi reali (tecnico/operativo/comportamentale)
- Errori ricorrenti
- Fonti

### 2.8 Accordion (microlearning)

**Scopo**: chunk informativi senza scroll infinito.

**Regole**
- massimo 5 item per pagina (home: 0–2)
- un item aperto alla volta (exclusive) nelle sezioni educative
- aria-expanded, aria-controls

### 2.9 Tabs (solo dove serve)

**Scopo**: organizzazione, non compressione.

**Regole**
- non usare tabs per nascondere contenuti essenziali su homepage
- mobile: tab bar scrollabile

**A11y**
- ruolo tablist + keyboard support (freccette)
- focus navigabile

### 2.10 Header / Nav

**Obiettivo**: minimalismo + fiducia.

**Elementi**
- Brand (logo SVG serio)
- Link: Home, Metodo, Glossario, Fonti
- Language switcher
- Theme toggle

**Stati**
- sticky con blur leggero
- progress bar (opzionale) per pagine lunghe, non in home

### 2.11 Footer

**Obiettivo**: istituzionale, affidabile.

**Sezioni**
- Metodo & Fonti
- Legal: Privacy, Cookie essenziali, Disclaimer educativo
- Contatti (mail)
- Social solo se "istituzionali" (no spam)

---

## 3) Layout, grid, responsive

### 3.1 Grid

- desktop: 12 col, max-width ~1100–1200px
- tablet: 8 col
- mobile: 4 col

### 3.2 Spacing

- home: grandi whitespace; contenuto leggibile
- evitare densità "dashboard trading"

### 3.3 Breakpoints (concettuali)

- <640 mobile
- 640–1024 tablet
- 1024 desktop

---

## 4) Micro-interazioni (spec)

### 4.1 Cosa è ammesso

- hover elevazione minima card interactive
- focus ring robusto
- feedback "copiato" per link/fonti
- transizione drawer (fade + slide)
- skeleton sobrio per caricamenti (ma contenuti statici preferiti)

### 4.2 Cosa è vietato

- glow neon
- bounce/cartoon
- animazioni che muovono layout (CLS)
- hover-only per contenuti importanti

---

## 5) Iconografia & grafica

- SVG lineari coerenti (stesso stroke, rounded caps moderati)
- max 1 set di icone (no mix)
- zero emoji come UI
- elementi grafici: solo supporto (RiskScale), niente illustrazioni "infantili"

---

## 6) "Done Definition" UI/UX (QA)

- contrasto AA su testo e controlli
- focus visible ovunque
- keyboard navigation completa
- tooltip/drawer funzionano su mobile
- prefers-reduced-motion rispettato
- no layout shift con hover/animazioni
- bundle home minimale
- semantic HTML corretto (ol/li per scale, nav, main, footer)

---

## 7) Implementazione pratica (ordine consigliato)

1. **Tokens CSS** (dark + light)
2. **Button, Link, Card, Badge**
3. **Tooltip + Drawer** (a11y completo)
4. **RiskScale** (home)
5. **Header + Footer**
6. **i18n wiring + hreflang**
7. **PWA + icons proprietarie**
8. **QA (a11y + perf) + refinements**

---

Ora possiamo iniziare con l'implementazione dei design tokens e componenti seguendo questa specifica.
