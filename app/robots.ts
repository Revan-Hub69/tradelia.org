import { MetadataRoute } from 'next';

/**
 * Dynamic Robots.txt Generator
 * Best Practice 2024-2025: Robots.txt dinamico per SEO ottimale
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://tradelia.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/admin/',
          '/_next/',
          '/checkout/',
          '/auth/',
          '/dashboard/settings/',
        ],
      },
      // AI Search Bots - Allow everything for better AI indexing
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web', 'PerplexityBot', 'Google-Extended'],
        allow: '/',
        disallow: ['/api/', '/dashboard/admin/'],
      },
      // Google Bot - Full access
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/admin/', '/_next/'],
      },
      // Bing Bot
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/dashboard/admin/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
