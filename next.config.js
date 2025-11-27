/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Headers per sicurezza
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Immagini - configurazione per immagini locali
  images: {
    formats: ["image/avif", "image/webp"],
    // Non serve domains per immagini locali (/logos/...)
    // Se in futuro servono immagini remote, aggiungere:
    // remotePatterns: [{ protocol: 'https', hostname: 'tradelia.org' }]
  },

  // TypeScript e ESLint
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
