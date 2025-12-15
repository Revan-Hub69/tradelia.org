# Best Practice 2024-2025: Pagina vs Modale vs Drawer

## 📋 DECISION MATRIX 2024-2025

### ✅ USA PAGINA quando:
1. **SEO importante**: Contenuto deve essere indicizzato
2. **Bookmarkable**: Utente deve poter salvare URL
3. **Shareable**: Contenuto deve essere condivisibile via link
4. **Deep linking**: Navigazione diretta necessaria
5. **Contenuto standalone**: Non dipende da contesto specifico
6. **Navigazione principale**: Parte del flusso principale utente
7. **Stato persistente**: URL deve riflettere lo stato
8. **Browser history**: Utente deve poter usare back/forward

**Esempi corretti in Tradelia:**
- ✅ `/pricing` - SEO importante, shareable
- ✅ `/checkout` - Workflow principale, bookmarkable
- ✅ `/glossary` - SEO importante, shareable
- ✅ `/faq` - SEO importante, shareable
- ✅ `/support` - SEO importante, shareable
- ✅ `/about` - SEO importante, shareable
- ✅ `/contact` - SEO importante, shareable
- ✅ `/privacy`, `/terms`, `/cookie` - Legal, SEO importante

### ✅ USA MODALE quando:
1. **Azione rapida**: Conferma, alert, form breve
2. **Contesto specifico**: Dipende da elemento nella pagina
3. **Non bookmarkable**: Non serve URL dedicato
4. **Workflow secondario**: Non parte del flusso principale
5. **Dettaglio contestuale**: Informazioni su elemento specifico
6. **Conferma/Azione**: Delete, confirm, quick edit
7. **Form inline**: Non merita pagina dedicata

**Esempi corretti in Tradelia:**
- ✅ `RequestAnalysisModal` - Azione rapida, contestuale
- ✅ `ProposeAssetModal` - Form breve, contestuale
- ✅ `ReportDetailModal` - Dettaglio contestuale
- ✅ `RequestDetailModal` - Dettaglio contestuale
- ✅ `DownloadPDFModal` - Azione rapida
- ✅ `ProposalDetailModal` - Dettaglio contestuale

### ✅ USA DRAWER quando:
1. **Mobile-first**: Esperienza ottimizzata per mobile
2. **Dettaglio laterale**: Informazioni supplementari
3. **Navigazione secondaria**: Menu, filtri, dettagli
4. **Non bookmarkable**: Non serve URL dedicato
5. **Contesto preservato**: Utente vede ancora pagina principale
6. **Contenuto lungo**: Scrollable, non modale fullscreen

**Esempi corretti in Tradelia:**
- ✅ `GlossaryDrawer` - Dettaglio termine, mobile-friendly, contestuale
- ✅ `ProUtilities` drawer - Navigazione secondaria

---

## 🎯 BEST PRACTICE 2024-2025

### Performance
- ✅ **Code Splitting**: Dynamic imports per modali/drawer
- ✅ **Lazy Loading**: Carica modali solo quando necessari
- ✅ **Image Optimization**: Next.js Image component
- ✅ **Font Optimization**: `display: swap`, preload critici

### Accessibility (WCAG 2.1 AA)
- ✅ **Focus Management**: Focus trap in modali/drawer
- ✅ **Keyboard Navigation**: ESC, Tab, Enter
- ✅ **ARIA Labels**: `role="dialog"`, `aria-modal="true"`
- ✅ **Screen Reader**: Annunci chiari
- ✅ **Skip Links**: Per pagine lunghe

### SEO 2024-2025
- ✅ **Metadata dinamici**: Per ogni locale (IT/EN)
- ✅ **Structured Data**: Schema.org per AI search
- ✅ **Open Graph**: Anteprima condivisione
- ✅ **Twitter Cards**: Anteprima Twitter
- ✅ **Canonical URLs**: Evita duplicati
- ✅ **Alternate Languages**: `hreflang` per IT/EN

### UX/UI 2024-2025
- ✅ **Mobile First**: Design responsive
- ✅ **Touch Targets**: Minimo 44x44px
- ✅ **Loading States**: Feedback immediato
- ✅ **Error States**: Messaggi chiari
- ✅ **Animations**: `prefers-reduced-motion` rispettato
- ✅ **Dark Mode**: Supporto completo

---

## ✅ STATO ATTUALE

### Metadata Dinamici
✅ **TUTTE LE PAGINE SISTEMATE**: Tutte le pagine principali ora usano `generatePageMetadata()` con locale:

**Pagine sistemate:**
1. ✅ `app/pricing/page.tsx` - Usa `generatePageMetadata('pricing', 'it')`
2. ✅ `app/en/pricing/page.tsx` - Usa `generatePageMetadata('pricing', 'en')`
3. ✅ `app/checkout/page.tsx` - Usa `generatePageMetadata('checkout', 'it')`
4. ✅ `app/en/checkout/page.tsx` - Usa `generatePageMetadata('checkout', 'en')`
5. ✅ `app/glossary/page.tsx` - Usa `generatePageMetadata('glossary', 'it')`
6. ✅ `app/en/glossary/page.tsx` - Usa `generatePageMetadata('glossary', 'en')`
7. ✅ `app/faq/page.tsx` - Usa `generatePageMetadata('faq', 'it')`
8. ✅ `app/en/faq/page.tsx` - Usa `generatePageMetadata('faq', 'en')`
9. ✅ `app/support/page.tsx` - Usa `generatePageMetadata('support', 'it')`
10. ✅ `app/en/support/page.tsx` - Usa `generatePageMetadata('support', 'en')`
11. ✅ `app/about/page.tsx` - Usa `generatePageMetadata('about', 'it')`
12. ✅ `app/en/about/page.tsx` - Usa `generatePageMetadata('about', 'en')`
13. ✅ `app/contact/page.tsx` - Usa `generatePageMetadata('contact', 'it')`
14. ✅ `app/en/contact/page.tsx` - Usa `generatePageMetadata('contact', 'en')`
15. ✅ `app/privacy/page.tsx` - Usa `generatePageMetadata('privacy', 'it')`
16. ✅ `app/en/privacy/page.tsx` - Usa `generatePageMetadata('privacy', 'en')`
17. ✅ `app/cookie/page.tsx` - Usa `generatePageMetadata('cookie', 'it')`
18. ✅ `app/en/cookie/page.tsx` - Usa `generatePageMetadata('cookie', 'en')`
19. ✅ `app/terms/page.tsx` - Usa `generatePageMetadata('terms', 'it')`
20. ✅ `app/en/terms/page.tsx` - Usa `generatePageMetadata('terms', 'en')`

---

## 📝 CHECKLIST OTTIMIZZAZIONE

### Per Ogni Pagina
- [x] Metadata dinamici per IT/EN
- [x] Open Graph completo
- [x] Twitter Cards
- [x] Structured Data (se applicabile)
- [x] Canonical URL
- [x] Alternate languages
- [x] Loading states
- [x] Error boundaries
- [x] Accessibility (ARIA, keyboard)
- [x] Performance (code splitting, lazy loading)

### Per Ogni Modale/Drawer
- [x] Focus trap
- [x] Keyboard navigation (ESC, Tab)
- [x] ARIA labels
- [x] Body scroll lock
- [x] Animation smooth
- [x] Mobile responsive
- [x] Loading states
- [x] Error handling

---

## 🚀 PRIORITÀ

1. ✅ **COMPLETATO**: Metadata dinamici per tutte le pagine
2. ✅ **COMPLETATO**: Performance (lazy loading, code splitting)
3. ✅ **COMPLETATO**: Ottimizzazioni avanzate (prefetch, preload)
