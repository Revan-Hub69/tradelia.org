import { MetadataRoute } from 'next';
import { getDictionary } from '@/lib/i18n/dictionaries';

/**
 * Dynamic Sitemap Generator
 * Best Practice 2024-2025: Sitemap completa per migliorare indicizzazione
 * Include tutte le pagine pubbliche con priorità e frequenza di aggiornamento
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tradelia.org';
  const currentDate = new Date().toISOString();

  // Carica traduzioni per URL dinamici
  const dictIt = await getDictionary('it');
  const dictEn = await getDictionary('en');

  // Pagine statiche principali
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: {
          it: baseUrl,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/pricing`,
          en: `${baseUrl}/en/pricing`,
        },
      },
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/glossary`,
          en: `${baseUrl}/en/glossary`,
        },
      },
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: {
        languages: {
          it: `${baseUrl}/reviews`,
          en: `${baseUrl}/en/reviews`,
        },
      },
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          it: `${baseUrl}/faq`,
          en: `${baseUrl}/en/faq`,
        },
      },
    },
    {
      url: `${baseUrl}/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/support`,
          en: `${baseUrl}/en/support`,
        },
      },
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/about`,
          en: `${baseUrl}/en/about`,
        },
      },
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/contact`,
          en: `${baseUrl}/en/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          it: `${baseUrl}/privacy`,
          en: `${baseUrl}/en/privacy`,
        },
      },
    },
    {
      url: `${baseUrl}/cookie`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          it: `${baseUrl}/cookie`,
          en: `${baseUrl}/en/cookie`,
        },
      },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          it: `${baseUrl}/terms`,
          en: `${baseUrl}/en/terms`,
        },
      },
    },
    // Pagine inglesi
    {
      url: `${baseUrl}/en`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: {
          it: baseUrl,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/pricing`,
          en: `${baseUrl}/en/pricing`,
        },
      },
    },
    {
      url: `${baseUrl}/en/glossary`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/glossary`,
          en: `${baseUrl}/en/glossary`,
        },
      },
    },
    {
      url: `${baseUrl}/en/reviews`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: {
        languages: {
          it: `${baseUrl}/reviews`,
          en: `${baseUrl}/en/reviews`,
        },
      },
    },
    {
      url: `${baseUrl}/en/faq`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          it: `${baseUrl}/faq`,
          en: `${baseUrl}/en/faq`,
        },
      },
    },
    {
      url: `${baseUrl}/en/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/support`,
          en: `${baseUrl}/en/support`,
        },
      },
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/about`,
          en: `${baseUrl}/en/about`,
        },
      },
    },
    {
      url: `${baseUrl}/en/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/contact`,
          en: `${baseUrl}/en/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/en/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          it: `${baseUrl}/privacy`,
          en: `${baseUrl}/en/privacy`,
        },
      },
    },
    {
      url: `${baseUrl}/en/cookie`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          it: `${baseUrl}/cookie`,
          en: `${baseUrl}/en/cookie`,
        },
      },
    },
    {
      url: `${baseUrl}/en/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
      alternates: {
        languages: {
          it: `${baseUrl}/terms`,
          en: `${baseUrl}/en/terms`,
        },
      },
    },
    // Dashboard pages
    {
      url: `${baseUrl}/dashboard/analysis`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/dashboard/analysis`,
          en: `${baseUrl}/en/dashboard/analysis`,
        },
      },
    },
    {
      url: `${baseUrl}/en/dashboard/analysis`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          it: `${baseUrl}/dashboard/analysis`,
          en: `${baseUrl}/en/dashboard/analysis`,
        },
      },
    },
    // Widget pages
    {
      url: `${baseUrl}/widgets/crypto-whale`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/widgets/crypto-whale`,
          en: `${baseUrl}/en/widgets/crypto-whale`,
        },
      },
    },
    {
      url: `${baseUrl}/widgets/crypto-depth`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/widgets/crypto-depth`,
          en: `${baseUrl}/en/widgets/crypto-depth`,
        },
      },
    },
    {
      url: `${baseUrl}/widgets/crypto-movers`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/widgets/crypto-movers`,
          en: `${baseUrl}/en/widgets/crypto-movers`,
        },
      },
    },
    {
      url: `${baseUrl}/en/widgets/crypto-whale`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/widgets/crypto-whale`,
          en: `${baseUrl}/en/widgets/crypto-whale`,
        },
      },
    },
    {
      url: `${baseUrl}/en/widgets/crypto-depth`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/widgets/crypto-depth`,
          en: `${baseUrl}/en/widgets/crypto-depth`,
        },
      },
    },
    {
      url: `${baseUrl}/en/widgets/crypto-movers`,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          it: `${baseUrl}/widgets/crypto-movers`,
          en: `${baseUrl}/en/widgets/crypto-movers`,
        },
      },
    },
  ];

  return staticPages;
}
