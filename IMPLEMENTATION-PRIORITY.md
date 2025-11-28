# 🎯 Piano di Implementazione - Correzioni Accademiche

## Fase 1: CRITICO (WCAG Violations) - 1-2 giorni

### 1.1 Motion Sensitivity (`prefers-reduced-motion`)
**File:** `app/globals.css`, tutti i componenti con `framer-motion`

**Implementazione:**
```css
/* app/globals.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Componenti da modificare:**
- `components/home/Hero.tsx` - Disabilitare animazioni infinite
- `components/home/Features.tsx` - Disabilitare stagger animations
- `components/home/Methods.tsx` - Disabilitare pattern animations
- `components/home/Values.tsx` - Disabilitare gradient animations
- `components/layout/Header.tsx` - Disabilitare slide-in
- `components/layout/Footer.tsx` - Disabilitare fade-in

**Framer Motion:**
```tsx
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  animate={shouldReduceMotion ? {} : { scale: [1, 1.1, 1] }}
  transition={shouldReduceMotion ? {} : { duration: 25, repeat: Infinity }}
/>
```

---

### 1.2 Contrast Ratio Fixes
**File:** `app/globals.css`, `tailwind.config.ts`

**Modifiche:**
```css
/* app/globals.css */
:root {
  --text-muted: #9CA3AF; /* da #6B7280 - contrast 4.5:1+ */
  --text-tertiary: #B0B0B0; /* da #9CA3AF - miglior leggibilità */
  --border-subtle: rgba(255, 255, 255, 0.08); /* da 0.04 */
  --border-default: rgba(255, 255, 255, 0.12); /* da 0.08 */
}
```

**Tailwind:**
```ts
text: {
  muted: '#9CA3AF', // WCAG AA compliant
  tertiary: '#B0B0B0', // Miglior leggibilità
}
```

---

### 1.3 Skip Link
**File:** `app/layout.tsx`

**Implementazione:**
```tsx
<body className={inter.className}>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-lg"
  >
    Skip to main content
  </a>
  <div className="min-h-screen flex flex-col">
    <Header />
    <main id="main-content" className="flex-1">{children}</main>
    <Footer />
  </div>
</body>
```

**CSS:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

### 1.4 Focus Trap (Mobile Menu)
**File:** `components/layout/Navigation.tsx`

**Implementazione:**
```tsx
import { useEffect, useRef } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const focusableElements = menu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    menu.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      menu.removeEventListener('keydown', handleTabKey);
    };
  }, [mobileMenuOpen]);

  return (
    <nav ref={menuRef} aria-label="Main navigation">
      {/* ... */}
    </nav>
  );
}
```

---

## Fase 2: ALTO (Best Practices) - 2-3 giorni

### 2.1 ARIA Labels Completi
**File:** Tutti i componenti

**Modifiche:**
- Aggiungere `aria-hidden="true"` a icone decorative
- Aggiungere `aria-label` a tutti i link icon-only
- Implementare `aria-live` regions per contenuti dinamici
- Verificare heading hierarchy (un solo h1 per pagina)

### 2.2 Typography Ottimizzazione
**File:** `tailwind.config.ts`, `app/globals.css`

**Modifiche:**
- Line-height body: 1.75-1.8
- Letter-spacing uppercase: 0.12em
- Font scaling utility

### 2.3 Color Accessibility
**File:** `tailwind.config.ts`, componenti

**Modifiche:**
- Aggiungere indicatori non-cromatici
- Testare con simulatori daltonismo
- High-contrast mode utility

---

## Fase 3: MEDIO (Ottimizzazioni) - 3-5 giorni

### 3.1 Cognitive Load
- Ridurre elementi Hero
- Aggiungere breadcrumb
- Ottimizzare gerarchia visiva

### 3.2 Performance
- Lazy load immagini
- Ottimizzare animazioni
- Font loading ottimizzato

### 3.3 HCI Feedback
- Loading states
- Error states
- Active states migliorati

---

## Testing Checklist

### Accessibilità
- [ ] Screen reader test (NVDA, JAWS, VoiceOver)
- [ ] Keyboard navigation completa
- [ ] Contrast ratio verificato (WebAIM)
- [ ] Daltonismo test (Coblis)

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] No layout shifts (CLS)
- [ ] Fast First Contentful Paint

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## Timeline Stimata

- **Fase 1 (Critico):** 1-2 giorni
- **Fase 2 (Alto):** 2-3 giorni
- **Fase 3 (Medio):** 3-5 giorni
- **Testing:** 2-3 giorni

**Totale:** 8-13 giorni lavorativi
