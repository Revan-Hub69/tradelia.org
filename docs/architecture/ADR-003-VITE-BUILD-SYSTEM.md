# ADR-003: Vite Build System

**Data**: 2025-01-XX  
**Stato**: ✅ Implementato  
**FASE**: 4 - Performance

## Contesto

Il progetto non aveva un build system completo. Era necessario ottimizzare asset, code splitting, e minificazione per production.

## Decisione

Implementare **Vite** come build tool con configurazione ottimizzata:

- **Minificazione**: esbuild (incluso, no dipendenze aggiuntive)
- **Code splitting**: Manuale per moduli dashboard
- **CSS**: Code splitting abilitato
- **Target**: ES2020+ (browsers moderni)

## Conseguenze

### Positive

- ✅ Build veloce (esbuild)
- ✅ Code splitting automatico
- ✅ Minificazione ottimizzata
- ✅ Asset optimization
- ✅ No dipendenze aggiuntive (esbuild incluso)

### Negative

- ⚠️ Richiede configurazione iniziale
- ⚠️ Build step necessario per production

## Configurazione Chiave

```javascript
// vite.config.js
build: {
  minify: 'esbuild', // Incluso in Vite
  cssCodeSplit: true,
  target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // Dashboard modules separati
        if (id.includes('assets/js/dashboard/')) {
          return `dashboard-${moduleName}`;
        }
        // Vendor chunks
        if (id.includes('node_modules')) {
          return 'vendor';
        }
      }
    }
  }
}
```

## Alternative Considerate

1. **Webpack**: Rifiutato - più lento, configurazione complessa
2. **Parcel**: Rifiutato - meno controllo, meno flessibile
3. **Rollup diretto**: Rifiutato - Vite include Rollup con DX migliore
4. **Terser**: Considerato ma rifiutato - richiede dipendenza aggiuntiva

## Implementazione

- `vite.config.js` configurato
- Code splitting per moduli dashboard
- Vendor chunks separati
- CSS code splitting
- Performance budgets configurati

## Riferimenti

- [Vite Documentation](https://vitejs.dev/)
- [esbuild](https://esbuild.github.io/)
