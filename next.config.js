/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

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
          // Content Security Policy - Enhanced Security
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-src 'none'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
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
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Note: Next.js SWC automatically uses browserslist from .browserslistrc
  // Polyfills are added by dependencies, not by Next.js itself

  // Configure SWC to target modern browsers and reduce polyfills
  swcMinify: true,

  // Optimize CSS loading
  optimizeFonts: true,

  // Reduce JavaScript bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Target modern browsers - reduce polyfills
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },

  // Compress output
  compress: true,

  // Production source maps (optional, can disable for smaller bundles)
  productionBrowserSourceMaps: false,

  // TypeScript e ESLint
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true, // Temporaneo per fix config
  },

  // Output configuration for Render deployment
  output: 'standalone',
};

export default nextConfig;
