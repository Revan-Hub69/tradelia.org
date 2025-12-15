# 🎨 DESIGN SYSTEM INDICATORI - BEST PRACTICE

## 📐 **DIMENSIONI E LAYOUT**

### **Card Sizes**
- **Compact**: `min-h-[400px]` - Per dashboard con molti indicatori
- **Standard**: `min-h-[600px]` - Default, bilanciato
- **Expanded**: `min-h-[800px]` - Per analisi dettagliate

### **Grid Layout**
```tsx
// Mobile: 1 colonna
grid-cols-1

// Tablet: 2 colonne
md:grid-cols-2

// Desktop: 3 colonne
lg:grid-cols-3

// Large Desktop: 4 colonne (solo per compact)
xl:grid-cols-4
```

### **Chart Heights**
- **Compact**: 200px
- **Standard**: 280px
- **Expanded**: 360px

---

## 🎯 **COMPONENTI UI**

### **1. IndicatorCardEnhanced**
- ✅ Hero section con valore grande
- ✅ Status badge colorato
- ✅ Chart integrato
- ✅ AI Reading con gradiente
- ✅ Academic Reference compatto
- ✅ Quick actions (Drawer, Methodology)
- ✅ Hover effects

### **2. Drawer (Dettagli Completi)**
- ✅ Side: Right (default)
- ✅ Size: Large (w-[40rem])
- ✅ Contenuto:
  - Value summary grande
  - Chart full-size
  - AI Reading completo
  - Academic Reference dettagliato
  - Methodology completa

### **3. MethodologyPopup**
- ✅ Modal overlay
- ✅ Sezioni:
  - Description
  - Academic Reference
  - Methodology/Calculation
  - Limitations

---

## 📊 **STRUTTURA DATI**

### **AcademicReference**
```typescript
{
  paper: string;        // Nome paper
  authors: string;     // Autori
  year: number;        // Anno pubblicazione
  theory: string;      // Teoria accademica
  validity: 'very-high' | 'high' | 'medium' | 'medium-low' | 'low';
}
```

### **Methodology**
```typescript
{
  description: string;        // Descrizione indicatore
  calculation?: string;       // Come viene calcolato
  dataSource?: string;        // Fonte dati
  updateFrequency?: string;   // Frequenza aggiornamento
  limitations?: string;       // Limitazioni
}
```

### **IndicatorInterpretation**
```typescript
{
  level: 'low' | 'normal' | 'elevated' | 'high';
  meaning: string;           // Significato in italiano
  color: string;             // Colore (green-400, blue-400, etc.)
  variant: 'success' | 'warning' | 'error' | 'info';
}
```

---

## 🎨 **COLORI E VARIANTI**

### **Status Colors**
- **Success** (Green): `bg-green-500/10 text-green-400 border-green-500/30`
- **Info** (Blue): `bg-blue-500/10 text-blue-400 border-blue-500/30`
- **Warning** (Yellow): `bg-yellow-500/10 text-yellow-400 border-yellow-500/30`
- **Error** (Red): `bg-red-500/10 text-red-400 border-red-500/30`

### **Academic Validity**
- **Very High**: ⭐⭐⭐⭐⭐ (Green)
- **High**: ⭐⭐⭐⭐ (Blue)
- **Medium**: ⭐⭐⭐ (Yellow)
- **Medium-Low**: ⭐⭐ (Orange)
- **Low**: ⭐ (Red)

---

## 📝 **SPIEGAZIONI AI - BEST PRACTICE**

### **Struttura AI Reading**
1. **Contesto Attuale** (1 frase)
   - Valore corrente e posizione nel range
   
2. **Interpretazione Accademica** (2-3 frasi)
   - Cosa significa il valore secondo la teoria
   - Confronto con range storici
   
3. **Implicazioni** (1-2 frasi)
   - Cosa suggerisce per il mercato
   - Attenzione: NO predizioni, solo lettura dati

### **Esempio VIX**
```
Il VIX si trova attualmente a 18.5, posizionato nel range di volatilità normale (12-20).

Secondo la teoria di Whaley (1993), valori tra 12-20 indicano un mercato in equilibrio, con volatilità fisiologica. Il VIX misura le aspettative di volatilità implicita per i prossimi 30 giorni, calcolato dalle opzioni S&P 500.

Un VIX a 18.5 suggerisce che il mercato non mostra segni di paura estrema né di complacenza eccessiva. Richiede monitoraggio continuo e contesto di altri indicatori (yield curve, economic indicators) per interpretazione completa.
```

---

## 🔄 **REFRESH E LOADING**

### **Refresh Intervals**
- **VIX**: 60 secondi (real-time)
- **Yield Curve**: 3600 secondi (1 ora)
- **Stock Indexes**: 300 secondi (5 minuti)
- **Forex**: 300 secondi (5 minuti)
- **Commodities**: 600 secondi (10 minuti)

### **Loading States**
- Skeleton con altezza minima della card
- Rounded corners per coerenza design
- Animazione fade-in quando dati pronti

---

## ♿ **ACCESSIBILITÀ**

### **WCAG 2.1 Compliance**
- ✅ Focus management nei drawer
- ✅ Keyboard navigation (Escape per chiudere)
- ✅ ARIA labels su tutti i bottoni
- ✅ Screen reader friendly
- ✅ Color contrast ratio > 4.5:1
- ✅ Non-chromatic indicators (shape + color)

### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Touch-friendly (min 44x44px per bottoni)
- ✅ Scroll ottimizzato per mobile
- ✅ Text scaling supportato

---

## 🚀 **PERFORMANCE**

### **Code Splitting**
- ✅ Lazy loading dei drawer
- ✅ Dynamic imports per chart
- ✅ Componenti indicatori separati

### **Caching**
- ✅ API responses cached (revalidate)
- ✅ Chart data memoized
- ✅ Static assets cached (1 year)

---

## ✅ **CHECKLIST IMPLEMENTAZIONE**

- [x] IndicatorCardEnhanced creato
- [x] Drawer integrato
- [x] MethodologyPopup integrato
- [x] VIXIndicatorEnhanced creato
- [ ] YieldCurveIndicatorEnhanced
- [ ] StockIndexesIndicatorEnhanced
- [ ] ForexIndicatorEnhanced
- [ ] CommoditiesIndicatorEnhanced
- [ ] BitcoinDominanceIndicatorEnhanced
- [ ] Layout responsive ottimizzato
- [ ] AI Readings migliorati
- [ ] Methodology notes complete
