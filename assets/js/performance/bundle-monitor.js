/**
 * Bundle Size Monitor
 * FASE 4: Performance Monitoring
 * Monitora dimensioni bundle e avvisa se superano threshold
 */

/**
 * Monitor bundle sizes
 */
export function monitorBundleSizes() {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return;
  }

  // Ottieni tutte le risorse caricate
  const resources = performance.getEntriesByType('resource');

  // Filtra solo script e CSS
  const assets = resources.filter(
    (r) => r.initiatorType === 'script' || r.initiatorType === 'link'
  );

  // Calcola dimensioni totali
  let totalSize = 0;
  const assetSizes = {};

  assets.forEach((asset) => {
    const size = asset.transferSize || 0;
    totalSize += size;
    
    if (asset.name) {
      assetSizes[asset.name] = {
        size,
        sizeKB: (size / 1024).toFixed(2),
        duration: asset.duration
      };
    }
  });

  // Performance budgets (in KB)
  const BUDGETS = {
    total: 500, // 500KB totale
    js: 300,    // 300KB JavaScript
    css: 100,   // 100KB CSS
    single: 200 // 200KB per singolo file
  };

  // Verifica budgets
  const totalKB = totalSize / 1024;
  const jsSize = assets
    .filter((a) => a.initiatorType === 'script')
    .reduce((sum, a) => sum + (a.transferSize || 0), 0) / 1024;
  const cssSize = assets
    .filter((a) => a.initiatorType === 'link')
    .reduce((sum, a) => sum + (a.transferSize || 0), 0) / 1024;

  const warnings = [];

  if (totalKB > BUDGETS.total) {
    warnings.push(`Total bundle size (${totalKB.toFixed(2)}KB) exceeds budget (${BUDGETS.total}KB)`);
  }

  if (jsSize > BUDGETS.js) {
    warnings.push(`JavaScript size (${jsSize.toFixed(2)}KB) exceeds budget (${BUDGETS.js}KB)`);
  }

  if (cssSize > BUDGETS.css) {
    warnings.push(`CSS size (${cssSize.toFixed(2)}KB) exceeds budget (${BUDGETS.css}KB)`);
  }

  // Verifica file singoli troppo grandi
  Object.entries(assetSizes).forEach(([name, data]) => {
    if (data.sizeKB > BUDGETS.single) {
      warnings.push(`Large asset: ${name} (${data.sizeKB}KB)`);
    }
  });

  // Log warnings in development
  if (warnings.length > 0 && window.location.hostname === 'localhost') {
    console.warn('[Bundle Monitor] Performance Budget Warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }

  // Invia a analytics in production
  if (warnings.length > 0 && window.location.hostname !== 'localhost') {
    sendBudgetViolations(warnings, {
      total: totalKB,
      js: jsSize,
      css: cssSize,
      assets: assetSizes
    });
  }

  return {
    total: totalKB,
    js: jsSize,
    css: cssSize,
    assets: assetSizes,
    warnings
  };
}

/**
 * Send budget violations to analytics
 */
function sendBudgetViolations(warnings, data) {
  // Placeholder per integrazione analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'bundle_budget_violation', {
      event_category: 'Performance',
      warnings: warnings.length,
      total_size: Math.round(data.total)
    });
  }
}

// Auto-monitor dopo load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    window.addEventListener('load', () => {
      setTimeout(monitorBundleSizes, 1000); // Aspetta 1s dopo load
    });
  } else {
    setTimeout(monitorBundleSizes, 1000);
  }
}

