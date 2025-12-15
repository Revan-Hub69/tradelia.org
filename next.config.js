/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Best Practice: Abilita strict mode per rilevare problemi e migliorare performance

  // Security Headers - Enterprise Grade
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Content Security
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer & Privacy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Security Headers
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          // SEO Headers
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
          // Content Security Policy - Enhanced Security
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://api.binance.com https://fapi.binance.com https://api.coingecko.com https://api.whale-alert.io https://api.finnhub.io https://api.alphavantage.co https://api.tradingeconomics.com https://api.santiment.net https://api.reddit.com https://api.github.com https://api.groq.com https://api.openai.com https://api.fred.stlouisfed.org https://api.cboe.com https://newsapi.org https://api.glassnode.com wss://stream.binance.com wss://fstream.binance.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-src 'none'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      // Widget-specific CSP (more permissive for standalone widgets)
      {
        source: "/widgets/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://api.binance.com https://api.coingecko.com https://api.whale-alert.io",
              "frame-ancestors 'self'", // Allow embedding in own domain for PWA
              "base-uri 'self'",
              "form-action 'self'",
              "frame-src 'none'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN", // Allow same-origin embedding for PWA
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          // Cross-Origin-Opener-Policy for security
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // Cross-Origin-Embedder-Policy (optional, can break some integrations)
          // {
          //   key: "Cross-Origin-Embedder-Policy",
          //   value: "require-corp",
          // },
        ],
      },
    ];
  },

  // Immagini - configurazione ottimizzata
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Performance - Target modern browsers (ES2022+)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optimize for modern browsers - reduce polyfills
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@supabase/supabase-js",
      "chart.js",
      "react-chartjs-2",
      "recharts",
    ],
    // Note: optimizeCss richiede critters package, rimosso per evitare errori build
  },

  // Note: SWC minification è abilitato di default in Next.js 15, non serve specificarlo
  // Typed routes configuration (moved from experimental in Next.js 15)
  typedRoutes: false,

  // Note: Next.js SWC automatically uses browserslist from .browserslistrc
  // Polyfills are added by dependencies, not by Next.js itself
  // See next.config.polyfills.js for documentation on which polyfills can be excluded

  // Reduce JavaScript bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Target modern browsers - reduce polyfills
      config.resolve.alias = {
        ...config.resolve.alias,
      };

      // Exclude unnecessary polyfills for modern browsers
      // These are already supported in our target browsers (last 2 versions)
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Exclude polyfills that are natively supported in modern browsers
      };

      // Optimize for large files - increase parser limits
      config.module = {
        ...config.module,
        parser: {
          ...config.module?.parser,
          javascript: {
            ...config.module?.parser?.javascript,
            // Increase limits for large files
            dynamicImportMode: "lazy",
          },
        },
      };

      // Remove polyfills from dependencies that target modern browsers
      // This prevents bundling polyfills for Array.at, Array.flat, Object.fromEntries, etc.
      config.optimization = {
        ...config.optimization,
        minimize: true,
        // Better tree shaking to remove unused code
        usedExports: true,
        sideEffects: false,
        // Split chunks more aggressively to reduce initial bundle
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: "all",
          minSize: 20000, // Ridotto da default per chunk più piccoli
          maxSize: 244000, // Limite massimo per chunk (244KB)
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate Supabase into its own chunk for lazy loading
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: "supabase",
              chunks: "async", // Load only when needed
              priority: 10,
            },
            // Separate chart libraries (pesanti)
            charts: {
              test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
              name: "charts",
              chunks: "async",
              priority: 15,
            },
            // Separate framer-motion (usato solo per animazioni)
            animations: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: "animations",
              chunks: "async",
              priority: 12,
            },
            // Separate polyfills (if any remain) into separate chunk
            polyfills: {
              test: /[\\/]node_modules[\\/](core-js|regenerator-runtime|@babel[\\/]runtime)[\\/]/,
              name: "polyfills",
              chunks: "async",
              priority: 20,
            },
            // Default vendor chunk (più piccolo)
            default: {
              minChunks: 2,
              priority: -10,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // Exclude polyfills for modern JavaScript features
      // These are natively supported in our target browsers (last 2 versions)
      if (config.resolve.alias) {
        // Prevent bundling polyfills for features already in modern browsers
        config.resolve.alias = {
          ...config.resolve.alias,
        };
      }
    }
    return config;
  },

  // Compress output
  compress: true,

  // Production source maps (optional, can disable for smaller bundles)
  productionBrowserSourceMaps: false,

  // Output standalone per Render deployment - disabilitato per problemi con file statici
  // output: 'standalone',

  // TypeScript e ESLint
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: "./tsconfig.json",
  },

  eslint: {
    ignoreDuringBuilds: true, // Temporaneo per fix config
  },
};

export default nextConfig;
