# Integrazione Tooltips Glossario

**Data**: 2025-01-27  
**Status**: Implementazione tooltips collegati al glossario

---

## 📋 OVERVIEW

Sistema di tooltips che si collegano al glossario e aprono un drawer con:
- **Spiegazione Accademica** (`what`)
- **Spiegazione Tradelia AI** (`how`)
- **Fonti Accademiche** (`source`)

---

## 🎯 COMPONENTI CREATI

### 1. GlossaryDrawer
**File**: `components/glossary/GlossaryDrawer.tsx`

**Funzionalità**:
- Drawer laterale (da destra) con animazioni
- 3 sezioni: Accademica, Tradelia AI, Fonti
- Blocca scroll quando aperto
- Gestione ESC key
- Accessibile (ARIA labels, role="dialog")

**Utilizzo**:
```tsx
<GlossaryDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  term={term}
/>
```

### 2. TooltipGlossary
**File**: `components/glossary/TooltipGlossary.tsx`

**Funzionalità**:
- Tooltip cliccabile che apre il drawer
- Icona opzionale
- Accessibile

**Utilizzo**:
```tsx
<TooltipGlossary term={mifidTerm} icon={true}>
  <span>MiFID II</span>
</TooltipGlossary>
```

### 3. Glossary Terms Loader
**File**: `lib/glossary/terms.ts`

**Funzionalità**:
- Carica termini da `/public/glossario.json`
- Funzioni helper: `getGlossaryTerm()`, `searchGlossaryTerms()`
- Fallback per termini comuni

---

## 🔧 INTEGRAZIONE

### DashboardHero
Aggiunto tooltip per "MiFID II" nella descrizione:

```tsx
import { TooltipGlossary } from '@/components/glossary/TooltipGlossary';
import { getGlossaryTerm } from '@/lib/glossary/terms';

// Nel componente
const [mifidTerm, setMifidTerm] = useState<any>(null);

useEffect(() => {
  getGlossaryTerm('HeroDisclaimer').then(term => {
    if (term) setMifidTerm(term);
  });
}, []);

// Nel render
<TooltipGlossary term={mifidTerm} icon={true}>
  <span>conforme MiFID II</span>
</TooltipGlossary>
```

---

## 📍 PUNTI CHIAVE PER INTEGRAZIONE

### Termini da Evidenziare

1. **DashboardHero**
   - ✅ "MiFID II" (già implementato)
   - "framework verificabile"
   - "metodo accademico"

2. **OverviewStats**
   - Termini tecnici nelle statistiche (se presenti)

3. **ModuleGrid**
   - "Framework" nei moduli
   - Termini tecnici nelle descrizioni

4. **Report Pages**
   - Termini tecnici nei report (es. "StrategyMode", "RegimeScore", "VolRegime")

5. **Utilities**
   - "ROI", "Volatilità", "Beta" in PortfolioManager
   - Termini in Trading Journal

---

## 📝 STRUTTURA DATI

### glossario.json
Formato:
```json
{
  "TermKey": {
    "title": "Nome Termine",
    "what": "Spiegazione accademica",
    "how": "Spiegazione Tradelia AI con esempi pratici",
    "source": "Fonte 1 | Fonte 2 | Fonte 3"
  }
}
```

### Esempio
```json
{
  "HeroDisclaimer": {
    "title": "Disclaimer",
    "what": "Materiale informativo/educativo non personalizzato.",
    "how": "Non costituisce consulenza o raccomandazione; non considera obiettivi, conoscenze ed esperienza del lettore.",
    "source": "MiFID II/ESMA – Guidelines on marketing communications & investor protection."
  }
}
```

---

## 🎨 BEST PRACTICES

1. **Accessibilità**:
   - ARIA labels corretti
   - Keyboard navigation (ESC per chiudere)
   - Focus management

2. **UX**:
   - Tooltip visibile ma non invasivo
   - Drawer con animazioni fluide
   - Backdrop scuro per focus

3. **Performance**:
   - Lazy loading termini
   - Cache in-memory
   - Fallback per termini non trovati

---

## 🔄 PROSSIMI PASSI

1. ✅ Drawer creato
2. ✅ Tooltip component creato
3. ✅ Integrazione DashboardHero
4. ⚠️ Aggiungere tooltips in altri punti chiave
5. ⚠️ Caricare glossario.json in public/
6. ⚠️ Testare con dati reali

---

## 📚 RIFERIMENTI

- Material Design Drawer
- WCAG 2.1 - Modal/Dialog
- Norman (2013) - Help Systems
- Nielsen (1994) - Tooltips

---

**Nota**: Il sistema è pronto per l'uso. Aggiungere tooltips progressivamente nei vari componenti della dashboard.

