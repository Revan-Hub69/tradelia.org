# Piano di Pulizia i18n - Approccio Incrementale e Sicuro

## 🎯 Obiettivo
Rimuovere il sistema i18n complesso mantenendo il codice funzionante durante tutto il processo, senza errori ricorsivi.

## 📋 Strategia: "Strangler Fig Pattern"

### Fase 1: Analisi e Preparazione ✅
1. **Analisi completa** - Identificare tutti i file che usano i18n
2. **Categorizzazione** - Raggruppare per layer e dipendenze
3. **Prioritizzazione** - Ordinare per complessità e dipendenze

### Fase 2: Creazione Wrapper Minimalista (Mantiene Compatibilità)
**Approccio**: Invece di rimuovere subito, creiamo wrapper minimalisti che:
- Mantengono la stessa API
- Restituiscono sempre italiano
- Permettono migrazione graduale

**File da modificare in questa fase:**
```
lib/i18n/use-translations.ts     → Wrapper minimalista
lib/i18n/dictionaries.ts         → Restituisce sempre {}
lib/i18n/paths.ts                → Rimuove /en prefix
lib/i18n/api-messages.ts          → Sempre italiano
lib/i18n/dynamic-content.ts      → Sempre italiano
```

**Vantaggi:**
- ✅ Il codice continua a compilare
- ✅ Nessun errore TypeScript
- ✅ Possiamo correggere file per file senza cascata

### Fase 3: Rimozione Incrementale per Layer

#### Layer 1: Componenti UI (Più isolati)
**Ordine suggerito:**
1. `components/layout/LanguageToggle.tsx` - Rimuovere completamente
2. `components/layout/HtmlLang.tsx` - Rimuovere
3. `components/layout/HreflangTags.tsx` - Rimuovere
4. `components/layout/InitialLanguageSelector.tsx` - Rimuovere
5. `components/ui/LanguageSwitch.tsx` - Rimuovere

**Test dopo ogni rimozione:**
```bash
npm run build
```

#### Layer 2: Routes App (Dipendenze medie)
**Ordine suggerito:**
1. `app/layout.tsx` - Rimuovere import componenti i18n
2. `app/[locale]/page.tsx` - Semplificare redirect
3. `app/sitemap.ts` - Rimuovere alternates
4. `app/rss.xml/route.ts` - Hardcode italiano
5. `app/*/page.tsx` - Sostituire `getDictionary` con hardcode

**Test dopo ogni 2-3 file:**
```bash
npm run build
```

#### Layer 3: Componenti Business Logic (Più complessi)
**Ordine suggerito:**
1. `components/checkout/*` - Sostituire `localePrefix` e `t()`
2. `components/reviews/*` - Sostituire `localePrefix` e `t()`
3. `components/pricing/*` - Sostituire `localePrefix` e `t()`
4. `components/home/*` - Sostituire `localePrefix` e `t()`

**Test dopo ogni componente:**
```bash
npm run build
```

#### Layer 4: API Routes (Dipendenze basse)
**Ordine suggerito:**
1. `app/api/*/route.ts` - Sostituire `getLocaleFromRequest` con `'it'`
2. Rimuovere logica di rilevamento locale

**Test dopo ogni route:**
```bash
npm run build
```

### Fase 4: Rimozione File i18n
**Solo dopo che tutti i riferimenti sono stati rimossi:**
1. Rimuovere `lib/i18n/*.ts` (tranne config.ts se serve)
2. Rimuovere `lib/i18n/it.json` e `lib/i18n/en.json`
3. Rimuovere cartella `app/en/` se non serve più

## 🛡️ Best Practices

### 1. Commit Atomici
```bash
# Un commit per ogni file/layer
git add lib/i18n/use-translations.ts
git commit -m "Simplify use-translations: always return Italian"

git add components/layout/LanguageToggle.tsx
git commit -m "Remove LanguageToggle component"
```

### 2. Test Incrementali
```bash
# Dopo ogni modifica
npm run build
npm run lint
```

### 3. Rollback Facile
```bash
# Se qualcosa va storto
git reset --hard HEAD~1
```

### 4. Verifica Pattern
```bash
# Prima di ogni fase, verifica cosa rimane
node scripts/analyze-i18n-usage.mjs
```

## 📊 Checklist Progresso

### Preparazione
- [ ] Eseguire `analyze-i18n-usage.mjs`
- [ ] Creare branch `cleanup/i18n-incremental`
- [ ] Backup commit corrente

### Fase 2: Wrapper Minimalista
- [ ] `lib/i18n/use-translations.ts` - Wrapper minimalista
- [ ] `lib/i18n/dictionaries.ts` - Restituisce {}
- [ ] `lib/i18n/paths.ts` - Rimuove /en
- [ ] `lib/i18n/api-messages.ts` - Sempre italiano
- [ ] `lib/i18n/dynamic-content.ts` - Sempre italiano
- [ ] Test build ✅

### Fase 3: Rimozione Componenti UI
- [ ] `components/layout/LanguageToggle.tsx`
- [ ] `components/layout/HtmlLang.tsx`
- [ ] `components/layout/HreflangTags.tsx`
- [ ] `components/layout/InitialLanguageSelector.tsx`
- [ ] `components/ui/LanguageSwitch.tsx`
- [ ] Test build ✅

### Fase 4: Rimozione Routes
- [ ] `app/layout.tsx`
- [ ] `app/[locale]/page.tsx`
- [ ] `app/sitemap.ts`
- [ ] `app/rss.xml/route.ts`
- [ ] `app/*/page.tsx` (tutti)
- [ ] Test build ✅

### Fase 5: Rimozione Componenti Business
- [ ] `components/checkout/*`
- [ ] `components/reviews/*`
- [ ] `components/pricing/*`
- [ ] `components/home/*`
- [ ] Test build ✅

### Fase 6: Rimozione API
- [ ] `app/api/*/route.ts`
- [ ] Test build ✅

### Fase 7: Pulizia Finale
- [ ] Rimuovere `lib/i18n/*.ts`
- [ ] Rimuovere `lib/i18n/*.json`
- [ ] Rimuovere `app/en/`
- [ ] Test build finale ✅

## 🚨 Regole d'Oro

1. **Mai modificare più di 5 file alla volta**
2. **Sempre testare dopo ogni layer**
3. **Mantenere compatibilità API durante transizione**
4. **Commit frequenti e atomici**
5. **Rollback immediato se build fallisce**

## 📝 Note

- Il wrapper minimalista permette di correggere file per file senza errori a cascata
- Ogni fase è indipendente e testabile
- Possiamo fermarci in qualsiasi momento senza rompere il sistema
