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

  // Immagini
  images: {
    domains: ["tradelia.org"],
    formats: ["image/avif", "image/webp"],
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
    ignoreDuringBuilds: false,
    dirs: ["app", "components", "lib"],
  },
};

export default nextConfig;
