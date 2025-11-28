# 🎬 Infrastruttura Animazioni - Documentazione

## 📁 Struttura

```
lib/
├── animations/
│   ├── variants.ts      # Varianti Framer Motion centralizzate
│   ├── constants.ts     # Costanti (durata, easing, transform)
│   └── index.ts         # Export centralizzati
└── hooks/
    └── useReducedMotion.ts  # Hook per prefers-reduced-motion
```

---

## 🎯 Hook: `useReducedMotion`

**File:** `lib/hooks/useReducedMotion.ts`

Hook centralizzato per rilevare le preferenze di movimento dell'utente (WCAG 2.3.3).

**Utilizzo:**
```tsx
import { useReducedMotion } from '@/lib/animations';

function MyComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
    />
  );
}
```

**Caratteristiche:**
- ✅ Supporto SSR (controlla `window`)
- ✅ Fallback per browser vecchi
- ✅ Listener automatico per cambiamenti

---

## 🎨 Varianti: `variants.ts`

**File:** `lib/animations/variants.ts`

Varianti Framer Motion centralizzate e riutilizzabili.

### Varianti Disponibili

#### 1. `createContainerVariants(prefersReducedMotion)`
Container per animazioni staggerate.

```tsx
const containerVariants = createContainerVariants(prefersReducedMotion);

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {/* Children con stagger */}
</motion.div>
```

#### 2. `createItemVariants(prefersReducedMotion)`
Item per fade-in-up.

```tsx
const itemVariants = createItemVariants(prefersReducedMotion);

<motion.div variants={itemVariants}>
  {/* Fade in from bottom */}
</motion.div>
```

#### 3. `createSlideInVariants(prefersReducedMotion)`
Slide-in da sinistra.

```tsx
const slideVariants = createSlideInVariants(prefersReducedMotion);
```

#### 4. `createScaleVariants(prefersReducedMotion)`
Scale per microinteractions.

```tsx
const scaleVariants = createScaleVariants(prefersReducedMotion);
```

#### 5. `createFloatVariants(prefersReducedMotion)`
Float per elementi decorativi.

```tsx
const floatVariants = createFloatVariants(prefersReducedMotion);

<motion.div animate={floatVariants.animate}>
  {/* Floating element */}
</motion.div>
```

#### 6. `createGradientPulse(prefersReducedMotion)`
Pulse per gradient backgrounds.

```tsx
const pulse = createGradientPulse(prefersReducedMotion);

<motion.div animate={pulse}>
  {/* Pulsing gradient */}
</motion.div>
```

#### 7. `createHoverVariants(prefersReducedMotion)`
Hover states per elementi interattivi.

```tsx
const hoverVariants = createHoverVariants(prefersReducedMotion);

<motion.div
  variants={hoverVariants}
  whileHover="hover"
  whileTap="tap"
>
  {/* Interactive element */}
</motion.div>
```

---

## 📐 Costanti: `constants.ts`

**File:** `lib/animations/constants.ts`

Costanti centralizzate per durate, easing e transform.

### Durate
```tsx
import { DURATION } from '@/lib/animations';

DURATION.INSTANT  // 0.15s (150ms) - perceived as instant
DURATION.FAST     // 0.2s (200ms) - microinteractions
DURATION.NORMAL   // 0.3s (300ms) - microinteractions
DURATION.MEDIUM   // 0.5s (500ms) - page transitions
DURATION.SLOW     // 0.8s (800ms) - complex animations
```

### Easing
```tsx
import { EASING } from '@/lib/animations';

EASING.STANDARD      // [0.4, 0, 0.2, 1] - Material Design
EASING.EASE_OUT_QUAD // [0.25, 0.46, 0.45, 0.94] - Microinteractions
EASING.SPRING        // [0.22, 1, 0.36, 1] - Spring-like
EASING.BOUNCE        // [0.68, -0.55, 0.265, 1.55] - Bounce
```

### Transform
```tsx
import { TRANSFORM } from '@/lib/animations';

TRANSFORM.LIFT.SMALL   // -1px
TRANSFORM.LIFT.MEDIUM  // -2px (research optimal)
TRANSFORM.LIFT.LARGE   // -4px

TRANSFORM.SCALE.MICRO  // 1.01 (1%)
TRANSFORM.SCALE.SMALL  // 1.02 (2% - research optimal)
TRANSFORM.SCALE.MEDIUM // 1.05 (5%)
TRANSFORM.SCALE.LARGE  // 1.1 (10%)
```

### Stagger
```tsx
import { STAGGER } from '@/lib/animations';

STAGGER.FAST   // 0.05s
STAGGER.NORMAL // 0.1s
STAGGER.SLOW   // 0.15s
```

---

## 💡 Esempi di Utilizzo

### Esempio 1: Hero Section
```tsx
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
  createGradientPulse,
} from '@/lib/animations';

function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  const gradientPulse = createGradientPulse(prefersReducedMotion);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.h1 variants={itemVariants}>Title</motion.h1>
      <motion.div animate={gradientPulse}>Background</motion.div>
    </motion.div>
  );
}
```

### Esempio 2: Card con Hover
```tsx
import { useReducedMotion, createHoverVariants } from '@/lib/animations';

function Card() {
  const prefersReducedMotion = useReducedMotion();
  const hoverVariants = createHoverVariants(prefersReducedMotion);

  return (
    <motion.div
      variants={hoverVariants}
      whileHover="hover"
      whileTap="tap"
    >
      Card content
    </motion.div>
  );
}
```

### Esempio 3: Lista con Stagger
```tsx
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
} from '@/lib/animations';

function List() {
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);

  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

---

## ✅ Vantaggi

1. **Consistenza:** Tutte le animazioni seguono gli stessi principi
2. **Accessibilità:** Rispetta `prefers-reduced-motion` automaticamente
3. **Manutenibilità:** Modifiche centralizzate
4. **Performance:** Ottimizzazioni basate su ricerche
5. **Type Safety:** TypeScript completo

---

## 🔬 Basato su Ricerche

- **Material Design 3** - Motion Design Principles
- **Framer Motion Research** - Optimal Animation Durations
- **Google Research** - Perceived Performance
- **WCAG 2.3.3** - Animation from Interactions

---

**Status:** ✅ Implementato e documentato
