# I18n System - Simplified for Future Migration

## Current State

This i18n system has been **simplified** to always return Italian text. The API is maintained for compatibility and future migration to external libraries.

## Structure

- `use-translations.ts` - Simplified hook that always returns Italian locale
- `config.ts` - Minimal config (only Italian locale)
- `paths.ts` - Path builder (removes `/en` prefix, always returns clean path)
- `dictionaries.ts` - Empty dictionary loader (translations are hardcoded)

## Migration Path

When ready to add translations with an external library (e.g., `next-intl`):

1. **Install library**: `npm install next-intl`
2. **Replace `use-translations.ts`**: Use library's hook
3. **Replace `config.ts`**: Use library's config
4. **Replace `paths.ts`**: Use library's routing
5. **Add translation files**: Create JSON/YAML files for each language
6. **Update components**: Replace hardcoded Italian strings with `t()` calls

## Current Usage

```tsx
// Components can still use useTranslations() - it returns Italian
const { t, locale } = useTranslations();
// locale is always 'it'
// t() returns fallback or empty string (use fallback for Italian text)

// Example:
const title = t('dashboard.title', 'Dashboard'); // Returns 'Dashboard'
```

## Best Practice

- **Use fallback strings**: Always provide Italian text as fallback
- **Gradually migrate**: Replace `t()` calls with hardcoded Italian strings
- **Keep API compatible**: Maintain same function signatures for easy migration
