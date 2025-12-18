/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // Conditional configuration for Vercel vs Cloudflare
  ...(process.env.NEXT_EXPORT === 'true' 
    ? {
        // Cloudflare Pages static export
        output: 'export',
        trailingSlash: true,
        images: {
          unoptimized: true
        },
        experimental: {
          optimizeCss: true
        }
      }
    : {
        // Vercel dynamic with edge optimization
        experimental: {
          optimizeCss: true,
          serverComponentsExternalPackages: [],
          optimizePackageImports: ['lucide-react']
        },
        // Vercel edge functions
        async rewrites() {
          return [
            {
              source: '/sitemap.xml',
              destination: '/api/sitemap'
            }
          ]
        }
      }
  )
}

export default nextConfig