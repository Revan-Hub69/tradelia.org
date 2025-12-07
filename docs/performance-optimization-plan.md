# Performance Optimization Plan - Target: 90%+

**Problema attuale:** Performance score ~60%  
**Target:** 90%+  
**Priorità:** Alta

## 🔍 Analisi Problemi Principali

### 1. **Font Loading (LCP Impact)**
- Font Inter caricato con tutti i pesi
- Nessun font-display ottimizzato
- Preload non configurato correttamente

### 2. **JavaScript Bundle Size**
- Supabase client caricato troppo presto
- Framer Motion incluso nel bundle iniziale
- Chart.js e recharts entrambi inclusi
- Troppi componenti non lazy-loaded

### 3. **CSS Non Ottimizzato**
- CSS critico potrebbe essere più piccolo
- Tailwind genera CSS non utilizzato
- CSS esterno potrebbe bloccare rendering

### 4. **Total Blocking Time (TBT)**
- Troppo JavaScript eseguito durante rendering
- Componenti pesanti caricati sincronamente
- Event listeners aggiunti troppo presto

### 5. **Largest Contentful Paint (LCP)**
- Immagini non preloadate
- Font non ottimizzato
- Hero section non ottimizzata

## ✅ Soluzioni da Implementare

### Priorità 1: Font Optimization (Impact: +10-15%)
- [x] Usare `font-display: swap` (già fatto)
- [ ] Ridurre subset font (solo caratteri necessari)
- [ ] Preload font con `<link rel="preload">`
- [ ] Usare `size-adjust` per evitare layout shift

### Priorità 2: JavaScript Bundle Optimization (Impact: +15-20%)
- [ ] Lazy load Supabase client (solo quando necessario)
- [ ] Code splitting più aggressivo per Supabase
- [ ] Rimuovere duplicati (chart.js vs recharts)
- [ ] Lazy load Framer Motion (solo animazioni)
- [ ] Dynamic import per componenti pesanti

### Priorità 3: CSS Optimization (Impact: +5-10%)
- [ ] Ridurre CSS critico inline
- [ ] Purge CSS non utilizzato
- [ ] Inline solo CSS veramente critico
- [ ] Defer CSS non critico

### Priorità 4: Component Optimization (Impact: +10-15%)
- [ ] Lazy load tutti i componenti non critici
- [ ] Implementare virtual scrolling per liste lunghe
- [ ] Ottimizzare re-render con React.memo
- [ ] Code splitting per route

### Priorità 5: Resource Loading (Impact: +5-10%)
- [ ] Preload risorse critiche (logo, hero image)
- [ ] Prefetch route importanti
- [ ] Ottimizzare immagini (WebP, AVIF)
- [ ] Implementare resource hints

## 📊 Metriche Target

| Metrica | Attuale (stimato) | Target | Priorità |
|---------|------------------|--------|----------|
| Performance Score | ~60% | 90%+ | 🔴 Alta |
| LCP | >2.5s | <2.5s | 🔴 Alta |
| FID | >100ms | <100ms | 🟡 Media |
| CLS | <0.1 | <0.1 | 🟢 OK |
| TBT | >300ms | <300ms | 🔴 Alta |
| Bundle Size | >500KB | <300KB | 🔴 Alta |

## 🚀 Implementazione

### Step 1: Font Optimization
```typescript
// app/layout.tsx
const inter = Inter({ 
  subsets: ['latin'], // Ridotto a solo latino
  display: 'swap', // Già fatto
  preload: true, // Abilita preload
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
  weight: ['400', '600', '700'], // Solo pesi necessari
});
```

### Step 2: Supabase Lazy Loading
```typescript
// Lazy load Supabase client solo quando necessario
const supabaseClient = lazy(() => import('@/lib/supabase/client'));
```

### Step 3: Component Lazy Loading
```typescript
// Lazy load componenti pesanti
const ChartComponent = lazy(() => import('./ChartComponent'));
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Step 4: CSS Optimization
- Ridurre CSS critico inline
- Usare CSS modules per code splitting
- Purge CSS non utilizzato

### Step 5: Bundle Analysis
```bash
npm run build -- --analyze
# Analizzare chunk più grandi
# Ottimizzare import
```

## 📈 Monitoring

Dopo ogni ottimizzazione:
1. Eseguire Lighthouse CI
2. Verificare metriche Core Web Vitals
3. Analizzare bundle size
4. Testare su connessioni lente (3G)

## 🎯 Risultati Attesi

Dopo implementazione completa:
- **Performance Score:** 60% → 90%+
- **LCP:** >2.5s → <2.5s
- **TBT:** >300ms → <300ms
- **Bundle Size:** >500KB → <300KB
