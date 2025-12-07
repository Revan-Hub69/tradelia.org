# Accessibility Improvements - WCAG 2.1 AA/AAA Compliance

## 🔍 Analisi Contrasti Attuali

### Testo su Background Base (#0a0e1a)
- `--text-primary: #e8edf3` → **Contrast Ratio: ~15.2:1** ✅ AAA
- `--text-secondary: #b8c5d1` → **Contrast Ratio: ~7.8:1** ✅ AAA  
- `--text-tertiary: #8b95a5` → **Contrast Ratio: ~4.2:1** ⚠️ AA (non AAA)
- `--text-muted: #a8b0bc` → **Contrast Ratio: ~5.5:1** ✅ AA

### Testo su Background Surface (#1a1f2e)
- `--text-primary: #e8edf3` → **Contrast Ratio: ~12.1:1** ✅ AAA
- `--text-secondary: #b8c5d1` → **Contrast Ratio: ~6.2:1** ✅ AA
- `--text-tertiary: #8b95a5` → **Contrast Ratio: ~3.3:1** ❌ Non conforme
- `--text-muted: #a8b0bc` → **Contrast Ratio: ~4.4:1** ⚠️ AA (non AAA)

### Accent Colors
- `--accent: #1e40af` su `--bg-base` → **Contrast Ratio: ~3.1:1** ❌ Non conforme
- `--accent: #1e40af` su `--bg-surface` → **Contrast Ratio: ~2.5:1** ❌ Non conforme

## ✅ Correzioni Necessarie

### 1. Migliorare text-tertiary
**Problema:** Contrast ratio troppo basso su surface
**Soluzione:** Cambiare da `#8b95a5` a `#9ca8b8` (contrast ~4.5:1 su surface)

### 2. Migliorare accent su background scuro
**Problema:** Accent blu scuro non ha abbastanza contrasto
**Soluzione:** Usare variante più chiara per testo su background scuro

### 3. Migliorare text-muted su surface
**Problema:** Borderline per AAA
**Soluzione:** Leggermente più chiaro

## 🎯 Target WCAG

- **WCAG AA:** Contrast ratio ≥ 4.5:1 (testo normale), ≥ 3:1 (testo grande)
- **WCAG AAA:** Contrast ratio ≥ 7:1 (testo normale), ≥ 4.5:1 (testo grande)

## 📋 Checklist Accessibilità

- [ ] Contrasti WCAG AA/AAA
- [ ] Focus states visibili
- [ ] Keyboard navigation completa
- [ ] ARIA labels appropriati
- [ ] Alt text per immagini
- [ ] Heading hierarchy corretta
- [ ] Form labels associati
- [ ] Error messages accessibili
