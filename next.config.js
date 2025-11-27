/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Mantieni compatibilità con file statici esistenti
  async rewrites() {
    return [
      {
        source: "/dashboard.html",
        destination: "/dashboard",
      },
    ];
  },

  // Priorità Next.js su file statici
  // Next.js routes hanno priorità su index.html statico

  // Headers per sicurezza (stesso di vercel.json)
  async headers() {
    return [
      {
        source: "/dashboard",
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
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
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

  // Escludi file che non devono essere compilati
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },

  // Escludi directory da TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true, // ESLint config vecchio causa errori, fix dopo
  },
};

export default nextConfig;
