# Best Practices i18n - Rilevamento Lingua

## 📚 Standard W3C e Best Practices

### Rilevamento Lingua Browser (Accept-Language Header)

**SÌ, è BEST PRACTICE** secondo:
- **W3C Internationalization Best Practices**: https://www.w3.org/International/techniques/developing-specs
- **RFC 7231 (HTTP/1.1)**: Accept-Language header è lo standard per rilevare lingua preferita
- **Google i18n Guidelines**: Raccomandano uso di Accept-Language per prima visita

### Priorità di Rilevamento (Best Practice)

1. **User Explicit Choice** (priorità massima)
   - Query parameter: `?locale=en`
   - localStorage: `tradelia_locale`
   - URL path: `/en/...`

2. **Browser Preference** (Accept-Language header)
   - Riflette le preferenze del browser dell'utente
   - Supporta quality values (q=0.9, q=0.8, etc.)
   - Best practice W3C per prima visita

3. **Default** (fallback)
   - Sempre italiano (`it`) se non c'è preferenza

### Implementazione Corretta

```typescript
// ✅ CORRETTO: Usa Accept-Language con quality values
export function getLocaleFromRequest(request: Request): Locale {
  // 1. Query param (user explicit)
  const localeParam = url.searchParams.get('locale');
  if (localeParam === 'it' || localeParam === 'en') {
    return localeParam;
  }
  
  // 2. URL path (user explicit)
  if (url.pathname.startsWith('/en')) {
    return 'en';
  }
  
  // 3. Accept-Language header (browser preference - BEST PRACTICE)
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse con quality values
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, qValue] = lang.split(';');
        return {
          code: code.trim().toLowerCase(),
          quality: qValue ? parseFloat(qValue.replace('q=', '')) : 1.0,
        };
      })
      .sort((a, b) => b.quality - a.quality);
    
    // Cerca inglese o italiano in ordine di preferenza
    for (const lang of languages) {
      if (lang.code.startsWith('en')) return 'en';
      if (lang.code.startsWith('it')) return 'it';
    }
  }
  
  // 4. Default: italiano
  return 'it';
}
```

### Perché Accept-Language è Best Practice?

1. **Prima Visita**: Se utente non ha mai visitato il sito, il browser invia la sua lingua preferita
2. **User Experience**: L'utente vede subito la lingua corretta senza dover cambiare manualmente
3. **Standard W3C**: È lo standard raccomandato per rilevamento automatico
4. **Accessibilità**: Utenti con browser configurato in inglese vedono subito inglese

### Quando NON usare Accept-Language?

- Se l'utente ha già scelto una lingua esplicitamente (localStorage/query param)
- Se l'utente è su un path con locale (`/en/...`)
- In questi casi, la preferenza esplicita ha priorità

## ✅ Implementazione Attuale

Il sistema attuale implementa correttamente:
- ✅ Priorità: Query param → Path → Accept-Language → Default
- ✅ Quality values supportati per Accept-Language
- ✅ Default sempre italiano
- ✅ localStorage per persistenza

## 📖 Riferimenti

- W3C i18n: https://www.w3.org/International/
- RFC 7231: https://tools.ietf.org/html/rfc7231#section-5.3.5
- Google i18n: https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites
