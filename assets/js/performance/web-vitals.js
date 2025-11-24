/**
 * Web Vitals Performance Monitoring
 * FASE 4: Performance Monitoring
 * Best Practice: Track Core Web Vitals per ottimizzazione continua
 */

/**
 * Track Core Web Vitals
 * @see https://web.dev/vitals/
 */
export function initWebVitals() {
  // Solo in production o se esplicitamente abilitato
  if (
    typeof window === "undefined" ||
    (window.location.hostname === "localhost" && !window.location.search.includes("vitals=true"))
  ) {
    return;
  }

  // Lazy load web-vitals library (se disponibile)
  // Per ora usiamo Performance API nativa

  // Largest Contentful Paint (LCP)
  trackLCP();

  // First Input Delay (FID)
  trackFID();

  // Cumulative Layout Shift (CLS)
  trackCLS();

  // First Contentful Paint (FCP)
  trackFCP();

  // Time to Interactive (TTI)
  trackTTI();
}

/**
 * Track Largest Contentful Paint
 */
function trackLCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];

      // Log to console in dev, send to analytics in prod
      if (window.location.hostname === "localhost") {
        console.log("[Web Vitals] LCP:", lastEntry.renderTime || lastEntry.loadTime);
      } else {
        // Invia a analytics (es. Google Analytics, custom endpoint)
        sendToAnalytics("LCP", lastEntry.renderTime || lastEntry.loadTime);
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (e) {
    // PerformanceObserver non supportato
  }
}

/**
 * Track First Input Delay
 */
function trackFID() {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime;

        if (window.location.hostname === "localhost") {
          console.log("[Web Vitals] FID:", fid);
        } else {
          sendToAnalytics("FID", fid);
        }
      }
    });

    observer.observe({ entryTypes: ["first-input"] });
  } catch (e) {
    // PerformanceObserver non supportato
  }
}

/**
 * Track Cumulative Layout Shift
 */
function trackCLS() {
  try {
    let clsValue = 0;
    const clsEntries = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }

      // Log quando la pagina è completamente caricata
      if (document.readyState === "complete") {
        if (window.location.hostname === "localhost") {
          console.log("[Web Vitals] CLS:", clsValue);
        } else {
          sendToAnalytics("CLS", clsValue);
        }
      }
    });

    observer.observe({ entryTypes: ["layout-shift"] });
  } catch (e) {
    // PerformanceObserver non supportato
  }
}

/**
 * Track First Contentful Paint
 */
function trackFCP() {
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          const fcp = entry.startTime;

          if (window.location.hostname === "localhost") {
            console.log("[Web Vitals] FCP:", fcp);
          } else {
            sendToAnalytics("FCP", fcp);
          }
        }
      }
    });

    observer.observe({ entryTypes: ["paint"] });
  } catch (e) {
    // PerformanceObserver non supportato
  }
}

/**
 * Track Time to Interactive (approssimato)
 */
function trackTTI() {
  if (document.readyState === "complete") {
    const perfData = performance.getEntriesByType("navigation")[0];
    if (perfData) {
      const tti = perfData.domInteractive - perfData.fetchStart;

      if (window.location.hostname === "localhost") {
        console.log("[Web Vitals] TTI (approx):", tti);
      } else {
        sendToAnalytics("TTI", tti);
      }
    }
  } else {
    window.addEventListener("load", () => {
      const perfData = performance.getEntriesByType("navigation")[0];
      if (perfData) {
        const tti = perfData.domInteractive - perfData.fetchStart;

        if (window.location.hostname === "localhost") {
          console.log("[Web Vitals] TTI (approx):", tti);
        } else {
          sendToAnalytics("TTI", tti);
        }
      }
    });
  }
}

/**
 * Send metrics to analytics
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 */
function sendToAnalytics(metric, value) {
  // Placeholder per integrazione analytics
  // Esempio: Google Analytics, custom endpoint, etc.

  // Per ora log in console (in production si invia a endpoint)
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", metric, {
      event_category: "Web Vitals",
      value: Math.round(value),
      non_interaction: true,
    });
  }

  // Custom endpoint (esempio)
  // fetch('/api/analytics/vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ metric, value, timestamp: Date.now() })
  // }).catch(() => {});
}

// Auto-initialize se script è caricato
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWebVitals);
  } else {
    initWebVitals();
  }
}
