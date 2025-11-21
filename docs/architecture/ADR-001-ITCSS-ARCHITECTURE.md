# ADR-001: ITCSS Architecture per CSS

**Data**: 2025-01-XX  
**Stato**: ✅ Implementato  
**FASE**: 1 - Fondamenta

## Contesto

Il progetto aveva CSS duplicato, inline styles in HTML, e mancanza di struttura scalabile. Era necessario un sistema CSS organizzato e manutenibile.

## Decisione

Implementare **ITCSS (Inverted Triangle CSS)** per organizzare gli stili in layer logici:

```
assets/css/
├── settings/     # Design tokens (CSS variables)
├── generic/      # Reset, base styles
├── elements/     # HTML base elements (typography, links)
├── objects/      # Layout patterns (container)
├── components/   # UI components (dashboard)
└── utilities/    # Helper classes (futuro)
```

## Conseguenze

### Positive

- ✅ Struttura chiara e scalabile
- ✅ Separazione concerns (settings, generic, elements, objects, components)
- ✅ Facile manutenzione e onboarding
- ✅ Design tokens centralizzati
- ✅ CSS inline rimosso da HTML

### Negative

- ⚠️ Richiede disciplina nel seguire la struttura
- ⚠️ Più file da gestire (ma meglio organizzati)

## Alternative Considerate

1. **BEM Methodology**: Rifiutato - troppo verboso, non risolveva il problema di organizzazione
2. **CSS Modules**: Rifiutato - complessità aggiuntiva, non necessario per questo progetto
3. **Utility-first (Tailwind)**: Rifiutato - troppo invasivo, preferiamo controllo completo

## Implementazione

- Design tokens in `design-tokens/tokens.json` → generati in `assets/css/settings/tokens.css`
- Reset CSS in `assets/css/generic/reset.css`
- Elementi base in `assets/css/elements/`
- Componenti in `assets/css/components/dashboard.css`
- Main entry point: `assets/css/main.css` (per build, ma non usato in HTML per compatibilità)

## Riferimenti

- [ITCSS Documentation](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
- Best Practice Accademiche 2024-2025
