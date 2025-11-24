# Design System - Sistema Educativo Tradelia

## 🎨 Principi Fondamentali

### 1. Clarity (Chiarezza)

**Principio**: Ogni elemento deve essere chiaro nel suo scopo e funzione.

**Implementazione:**

- Testi descrittivi
- Icone intuitive
- Feedback visivo immediato
- Gerarchia visiva chiara

### 2. Consistency (Coerenza)

**Principio**: Pattern e componenti riutilizzabili in tutto il sistema.

**Implementazione:**

- Design tokens centralizzati
- Componenti riutilizzabili
- Pattern UI consistenti
- Naming conventions

### 3. Accessibility (Accessibilità)

**Principio**: Accessibile a tutti, WCAG 2.2 AA minimo.

**Implementazione:**

- Color contrast 4.5:1+
- Keyboard navigation
- Screen reader support
- Touch targets 44px+

### 4. Performance (Performance)

**Principio**: Velocità e fluidità sono parte dell'UX.

**Implementazione:**

- Animazioni 60fps
- Lazy loading
- Optimistic updates
- Skeleton screens

## 🎨 Design Tokens

### Colors

```css
/* Primary Palette */
--color-primary: #2563eb; /* Trust, Knowledge */
--color-primary-dark: #1e40af;
--color-primary-light: #3b82f6;

/* Success */
--color-success: #10b981;
--color-success-dark: #059669;
--color-success-light: #34d399;

/* Warning */
--color-warning: #f59e0b;
--color-warning-dark: #d97706;
--color-warning-light: #fbbf24;

/* Error */
--color-error: #ef4444;
--color-error-dark: #dc2626;
--color-error-light: #f87171;

/* Neutral */
--color-neutral-50: #f9fafb;
--color-neutral-100: #f3f4f6;
--color-neutral-200: #e5e7eb;
--color-neutral-300: #d1d5db;
--color-neutral-400: #9ca3af;
--color-neutral-500: #6b7280;
--color-neutral-600: #4b5563;
--color-neutral-700: #374151;
--color-neutral-800: #1f2937;
--color-neutral-900: #111827;
```

### Typography

```css
/* Font Families */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;
--font-mono: "SF Mono", "Monaco", "Cascadia Code", monospace;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;

/* Font Weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

### Spacing (8px Grid)

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

### Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.5rem; /* 8px */
--radius-lg: 0.75rem; /* 12px */
--radius-xl: 1rem; /* 16px */
--radius-full: 9999px; /* Circle */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Transitions

```css
--transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
--transition-medium: 300ms cubic-bezier(0.16, 1, 0.3, 1);
--transition-slow: 500ms cubic-bezier(0.16, 1, 0.3, 1);
```

## 🧩 Component Library

### 1. Button

**Variants:**

- `primary`: Azione principale
- `secondary`: Azione secondaria
- `outline`: Azione terziaria
- `ghost`: Azione minimale
- `danger`: Azione distruttiva

**Sizes:**

- `sm`: 32px height
- `md`: 40px height (default)
- `lg`: 48px height

**States:**

- Default
- Hover
- Active
- Disabled
- Loading

### 2. Card

**Variants:**

- `default`: Card standard
- `elevated`: Card con shadow
- `outlined`: Card con border
- `interactive`: Card cliccabile

### 3. Input

**Variants:**

- `text`: Input testo
- `email`: Input email
- `password`: Input password
- `number`: Input numerico
- `textarea`: Textarea

**States:**

- Default
- Focus
- Error
- Disabled

### 4. Modal

**Variants:**

- `default`: Modal centrato
- `bottom-sheet`: Modal da bottom (mobile)
- `fullscreen`: Modal fullscreen

**Features:**

- Focus trap
- Backdrop blur
- Close on Escape
- Close on backdrop click (opzionale)

### 5. Progress

**Variants:**

- `linear`: Progress bar lineare
- `circular`: Progress circolare
- `steps`: Progress a step

### 6. Badge

**Variants:**

- `default`: Badge standard
- `success`: Badge successo
- `warning`: Badge warning
- `error`: Badge errore
- `info`: Badge informazione

### 7. Toast

**Variants:**

- `success`: Toast successo
- `error`: Toast errore
- `warning`: Toast warning
- `info`: Toast informazione

**Features:**

- Auto-dismiss (5s)
- Manual dismiss
- Stack multiple toasts
- Animation in/out

## 📱 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) {
  /* sm */
}
@media (min-width: 768px) {
  /* md */
}
@media (min-width: 1024px) {
  /* lg */
}
@media (min-width: 1280px) {
  /* xl */
}
@media (min-width: 1536px) {
  /* 2xl */
}
```

## ♿ Accessibility

### Keyboard Navigation

- **Tab**: Naviga elementi interattivi
- **Enter/Space**: Attiva elemento
- **Esc**: Chiudi modal/menu
- **Arrow Keys**: Naviga liste/opzioni

### ARIA

- `aria-label`: Etichette descrittive
- `aria-describedby`: Descrizioni aggiuntive
- `aria-live`: Annunci cambiamenti
- `aria-hidden`: Nascondi elementi decorativi

### Focus Management

- Focus visible sempre
- Focus trap in modal
- Focus restoration dopo chiusura
- Skip links per navigazione rapida

## 🎬 Animation Guidelines

### Principles

1. **Purpose**: Ogni animazione ha uno scopo
2. **Performance**: 60fps sempre
3. **Accessibility**: Rispetta `prefers-reduced-motion`

### Timing

- **Fast**: 150ms (hover, click)
- **Medium**: 300ms (transitions)
- **Slow**: 500ms (page transitions)

### Easing

- **Ease-out**: Entrate (elementi appaiono)
- **Ease-in**: Uscite (elementi scompaiono)
- **Ease-in-out**: Transizioni bidirezionali

## 📊 Data Visualization

### Charts

- **Line Chart**: Progresso nel tempo
- **Bar Chart**: Confronti
- **Pie/Donut Chart**: Distribuzioni
- **Heatmap**: Attività giornaliera

### Colors

- **Sequential**: Per dati ordinati
- **Diverging**: Per dati con centro
- **Categorical**: Per categorie distinte

**Paper:**

> Munzner (2014): "Visualization Analysis & Design"

## 🚀 Performance

### Loading States

- **Skeleton Screens**: Durante caricamento
- **Progress Indicators**: Per operazioni lunghe
- **Optimistic Updates**: Aggiorna UI immediatamente

### Optimization

- **Lazy Loading**: Carica solo quando necessario
- **Code Splitting**: Split per route/moduli
- **Image Optimization**: WebP, lazy loading
- **Font Loading**: Async, `font-display: swap`

## 📋 Component Checklist

Ogni componente deve avere:

- [ ] Design tokens applicati
- [ ] Responsive design
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus management
- [ ] Loading states
- [ ] Error states
- [ ] Animations (se applicabile)
- [ ] Documentation

## 📖 Riferimenti

- **Material Design (2024)**: Design System
- **Apple HIG (2024)**: Human Interface Guidelines
- **WCAG 2.2**: Web Content Accessibility Guidelines
- **Nielsen (1994)**: "10 Usability Heuristics"
- **Norman (2013)**: "The Design of Everyday Things"
