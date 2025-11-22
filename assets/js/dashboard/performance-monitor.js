/**
 * Performance Monitoring & Web Vitals Tracking
 * Best Practice: Core Web Vitals (LCP, FID, CLS) + Performance API
 * Paper Accademico: "Performance Budgets & Web Vitals" - Google (2024)
 */

const PERFORMANCE_STATE = {
  vitals: {
    lcp: null, // Largest Contentful Paint
    fid: null, // First Input Delay
    cls: null, // Cumulative Layout Shift
  },
  metrics: {
    ttfb: null, // Time to First Byte
    fcp: null, // First Contentful Paint
    domContentLoaded: null,
    loadComplete: null,
  },
  resources: [],
  navigation: null,
};

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  // Load saved performance data
  loadPerformanceData();

  // Monitor Web Vitals
  monitorWebVitals();

  // Monitor Performance API metrics
  monitorPerformanceMetrics();

  // Monitor resource timing
  monitorResourceTiming();

  // Report performance data periodically
  reportPerformanceData();
}

/**
 * Monitor Core Web Vitals
 */
function monitorWebVitals() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return;
  }

  try {
    // LCP - Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      PERFORMANCE_STATE.vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;

      // Log LCP
      logVital('LCP', PERFORMANCE_STATE.vitals.lcp, {
        good: 2500,
        needsImprovement: 4000,
      });

      // Save to localStorage
      savePerformanceVital('lcp', PERFORMANCE_STATE.vitals.lcp);
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('[PerformanceMonitor] LCP not supported:', e);
    }

    // FID - First Input Delay (replaced by INP in future)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        PERFORMANCE_STATE.vitals.fid = entry.processingStart - entry.startTime;

        // Log FID
        logVital('FID', PERFORMANCE_STATE.vitals.fid, {
          good: 100,
          needsImprovement: 300,
        });

        // Save to localStorage
        savePerformanceVital('fid', PERFORMANCE_STATE.vitals.fid);
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('[PerformanceMonitor] FID not supported:', e);
    }

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      PERFORMANCE_STATE.vitals.cls = clsValue;

      // Log CLS
      logVital('CLS', PERFORMANCE_STATE.vitals.cls, {
        good: 0.1,
        needsImprovement: 0.25,
      });

      // Save to localStorage
      savePerformanceVital('cls', clsValue);
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('[PerformanceMonitor] CLS not supported:', e);
    }
  } catch (error) {
    console.error('[PerformanceMonitor] Error monitoring vitals:', error);
  }
}

/**
 * Monitor Performance API metrics
 */
function monitorPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance || !window.performance.timing) {
    return;
  }

  // Wait for page load
  if (document.readyState === 'complete') {
    collectPerformanceMetrics();
  } else {
    window.addEventListener('load', () => {
      setTimeout(collectPerformanceMetrics, 0);
    });
  }
}

/**
 * Collect performance metrics
 */
function collectPerformanceMetrics() {
  const timing = window.performance.timing;
  const navigation = window.performance.navigation;

  // Time to First Byte
  PERFORMANCE_STATE.metrics.ttfb = timing.responseStart - timing.requestStart;

  // First Contentful Paint (if available)
  const paintEntries = window.performance.getEntriesByType('paint');
  const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
  if (fcpEntry) {
    PERFORMANCE_STATE.metrics.fcp = fcpEntry.startTime;
  }

  // DOM Content Loaded
  PERFORMANCE_STATE.metrics.domContentLoaded =
    timing.domContentLoadedEventEnd - timing.navigationStart;

  // Load Complete
  PERFORMANCE_STATE.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;

  // Navigation timing
  PERFORMANCE_STATE.navigation = {
    type: navigation.type,
    redirectCount: navigation.redirectCount,
  };

  // Log metrics
  console.log('[PerformanceMonitor] Metrics:', PERFORMANCE_STATE.metrics);

  // Save to localStorage
  savePerformanceMetrics();
}

/**
 * Monitor resource timing
 */
function monitorResourceTiming() {
  if (typeof window === 'undefined' || !window.performance || !window.performance.getEntriesByType) {
    return;
  }

  // Wait for resources to load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const resources = window.performance.getEntriesByType('resource');

      PERFORMANCE_STATE.resources = resources.map((resource) => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: resource.initiatorType,
        startTime: resource.startTime,
      }));

      // Log slow resources
      const slowResources = PERFORMANCE_STATE.resources.filter(
        (r) => r.duration > 1000 || r.size > 500000
      );

      if (slowResources.length > 0) {
        console.warn('[PerformanceMonitor] Slow resources:', slowResources);
      }

      // Save to localStorage
      saveResourceTiming();
    }, 2000);
  });
}

/**
 * Log vital metric with thresholds
 */
function logVital(name, value, thresholds) {
  let status = 'good';
  if (value > thresholds.needsImprovement) {
    status = 'poor';
  } else if (value > thresholds.good) {
    status = 'needs-improvement';
  }

  console.log(`[PerformanceMonitor] ${name}: ${value.toFixed(2)}ms (${status})`);

  // Send to analytics if available
  if (window.gtag) {
    window.gtag('event', name.toLowerCase(), {
      value: Math.round(value),
      event_category: 'Web Vitals',
      event_label: status,
      non_interaction: true,
    });
  }

  // Show warning if poor
  if (status === 'poor' && window.showToast) {
    window.showToast(
      `Performance ${name}: ${status === 'poor' ? 'Da migliorare' : 'Buona'}`,
      status === 'poor' ? 'warning' : 'info',
      5000
    );
  }
}

/**
 * Report performance data
 */
function reportPerformanceData() {
  // Report to server every 5 minutes (if enabled)
  setInterval(() => {
    if (PERFORMANCE_STATE.vitals.lcp || PERFORMANCE_STATE.vitals.fid || PERFORMANCE_STATE.vitals.cls) {
      sendPerformanceReport();
    }
  }, 5 * 60 * 1000);
}

/**
 * Send performance report to server
 */
async function sendPerformanceReport() {
  try {
    const token = localStorage.getItem('tradelia-access-token-v1');
    if (!token) return;

    const report = {
      vitals: PERFORMANCE_STATE.vitals,
      metrics: PERFORMANCE_STATE.metrics,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    await fetch('/api/health?action=performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(report),
    });
  } catch (error) {
    console.error('[PerformanceMonitor] Error sending report:', error);
  }
}

/**
 * Save performance vital to localStorage
 */
function savePerformanceVital(name, value) {
  try {
    const key = `performance-vital-${name}`;
    const data = {
      value,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[PerformanceMonitor] Error saving vital:', e);
  }
}

/**
 * Save performance metrics to localStorage
 */
function savePerformanceMetrics() {
  try {
    localStorage.setItem('performance-metrics', JSON.stringify(PERFORMANCE_STATE.metrics));
  } catch (e) {
    console.warn('[PerformanceMonitor] Error saving metrics:', e);
  }
}

/**
 * Save resource timing to localStorage
 */
function saveResourceTiming() {
  try {
    localStorage.setItem('performance-resources', JSON.stringify(PERFORMANCE_STATE.resources));
  } catch (e) {
    console.warn('[PerformanceMonitor] Error saving resources:', e);
  }
}

/**
 * Load performance data from localStorage
 */
function loadPerformanceData() {
  try {
    // Load vitals
    ['lcp', 'fid', 'cls'].forEach((name) => {
      const saved = localStorage.getItem(`performance-vital-${name}`);
      if (saved) {
        const data = JSON.parse(saved);
        PERFORMANCE_STATE.vitals[name] = data.value;
      }
    });

    // Load metrics
    const savedMetrics = localStorage.getItem('performance-metrics');
    if (savedMetrics) {
      Object.assign(PERFORMANCE_STATE.metrics, JSON.parse(savedMetrics));
    }

    // Load resources
    const savedResources = localStorage.getItem('performance-resources');
    if (savedResources) {
      PERFORMANCE_STATE.resources = JSON.parse(savedResources);
    }
  } catch (e) {
    console.warn('[PerformanceMonitor] Error loading data:', e);
  }
}

/**
 * Get current performance vitals
 */
export function getPerformanceVitals() {
  return {
    ...PERFORMANCE_STATE.vitals,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  return {
    ...PERFORMANCE_STATE.metrics,
    ...PERFORMANCE_STATE.navigation,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get performance resources
 */
export function getPerformanceResources() {
  return [...PERFORMANCE_STATE.resources];
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  return {
    vitals: getPerformanceVitals(),
    metrics: getPerformanceMetrics(),
    resources: getPerformanceResources(),
    timestamp: new Date().toISOString(),
  };
}

// Initialize on module load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPerformanceMonitoring();
    });
  } else {
    initPerformanceMonitoring();
  }
}

