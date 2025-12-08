import { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generator
 * Best Practice 2024-2025: Sitemap completa per migliorare indicizzazione
 * Include tutte le pagine pubbliche con priorità e frequenza di aggiornamento
 * System simplified: Italian only
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tradelia.org';
  const currentDate = new Date().toISOString();

  // Pagine statiche principali
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookie`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    // Dashboard pages
    {
      url: `${baseUrl}/dashboard/market-data`, // Analysis è integrato in market-data
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    // Widget pages
    {
      url: `${baseUrl}/widgets/crypto-whale`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/widgets/crypto-depth`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/widgets/crypto-movers`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
    },
  ];

  return staticPages;
}
