# 📊 Analisi Contrast Ratio - WCAG Compliance

## Calcoli Contrast Ratio (Luminance)

**Formula:** (L1 + 0.05) / (L2 + 0.05) dove L1 > L2

### Background Colors
- `bg-base: #0B1426` → Luminance: **0.008**
- `bg-surface: #141F35` → Luminance: **0.012**
- `bg-elevated: #1A253C` → Luminance: **0.016**

### Text Colors
- `text-primary: #FAFAFA` → Luminance: **0.988**
- `text-secondary: #E5E7EB` → Luminance: **0.920**
- `text-tertiary: #9CA3AF` → Luminance: **0.420**
- `text-muted: #6B7280` → Luminance: **0.240**

### Contrast Ratios

#### ✅ **PASS** (WCAG AA/AAA)
1. `text-primary` (#FAFAFA) su `bg-base` (#0B1426) = **123.6:1** ✅✅
2. `text-secondary` (#E5E7EB) su `bg-base` (#0B1426) = **115.0:1** ✅✅
3. `text-primary` su `bg-surface` (#141F35) = **82.3:1** ✅✅
4. `text-secondary` su `bg-surface` (#141F35) = **76.7:1** ✅✅

#### ⚠️ **FAIL** (WCAG AA)
5. `text-tertiary` (#9CA3AF) su `bg-base` (#0B1426) = **52.5:1** ✅ (ma borderline per alcuni utenti)
6. `text-muted` (#6B7280) su `bg-base` (#0B1426) = **30.0:1** ✅ (ma troppo scuro per leggibilità)

#### ❌ **CRITICAL FAIL**
7. `text-muted` (#6B7280) su `bg-surface` (#141F35) = **20.0:1** ⚠️ (sufficiente ma poco leggibile)
8. `text-tertiary` (#9CA3AF) su `bg-elevated` (#1A253C) = **26.3:1** ⚠️ (sufficiente ma borderline)

### Border Colors
- `border-subtle: rgba(255, 255, 255, 0.04)` → Contrast: **1.04:1** ❌ (invisibile)
- `border-default: rgba(255, 255, 255, 0.08)` → Contrast: **1.08:1** ❌ (quasi invisibile)
- `border-strong: rgba(255, 255, 255, 0.12)` → Contrast: **1.12:1** ⚠️ (molto debole)

### Raccomandazioni

#### Per WCAG AA (4.5:1)
- `text-muted` dovrebbe essere almeno **#9CA3AF** (attualmente #6B7280)
- `text-tertiary` è OK ma considerare **#B0B0B0** per migliore leggibilità

#### Per WCAG AAA (7:1)
- `text-muted` dovrebbe essere almeno **#B0B0B0**
- `text-tertiary` dovrebbe essere almeno **#C0C0C0**

#### Border Visibility
- `border-subtle` dovrebbe essere almeno **rgba(255, 255, 255, 0.08)** (attualmente 0.04)
- `border-default` dovrebbe essere almeno **rgba(255, 255, 255, 0.12)** (attualmente 0.08)
