/**
 * Lighthouse CI Configuration
 * FASE 4: Performance Monitoring
 * Best Practice: Continuous performance monitoring
 */

module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000/dashboard.html"],
      numberOfRuns: 3,
      startServerCommand: "npm run dev",
      startServerReadyPattern: "ready",
      startServerReadyTimeout: 10000,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        // Core Web Vitals
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        // Bundle sizes
        "total-byte-weight": ["error", { maxNumericValue: 500000 }], // 500KB
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
