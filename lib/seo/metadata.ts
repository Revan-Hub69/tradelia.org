import { Metadata } from "next";
import { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { generateOrganizationSchema, generateWebSiteSchema } from './structured-data';

export async function generateMetadata(locale: Locale = "it"): Promise<Metadata> {
  const dict = await getDictionary(locale);
  const baseUrl = "https://tradelia.org";
  const localePath = locale === "it" ? "" : `/${locale}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: dict.seo.title,
      template: "%s · Tradelia AI",
    },
    description: dict.seo.description,
    keywords: dict.seo.keywords.split(", "),
    authors: [{ name: "Tradelia AI" }],
    creator: "Tradelia AI",
    publisher: "Tradelia AI",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: locale === "it" ? "it_IT" : "en_US",
      url: `${baseUrl}${localePath}`,
      siteName: "Tradelia AI",
      title: dict.seo.title,
      description: dict.seo.description,
      images: [
        {
          url: `${baseUrl}/img/tradelia_og_vC_white_clean.png`,
          width: 1200,
          height: 630,
          alt: "Tradelia AI - Formazione Finanziaria",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.seo.title,
      description: dict.seo.description,
      images: [`${baseUrl}/img/tradelia_og_vC_white_clean.png`],
      creator: "@tradelia_ai",
      site: "@tradelia_ai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}${localePath}`,
      languages: {
        "it-IT": `${baseUrl}`,
        "en-US": `${baseUrl}/en`,
      },
    },
    // AI Search Optimization (Perplexity, ChatGPT, etc.)
    other: {
      "ai-search-optimized": "true",
      "structured-data": "true",
      "academic-standards": "MiFID II compliant",
      verification: "framework-verifiable",
    },
  };
}

/**
 * Generate page-specific metadata
 * Best Practice 2024-2025: Dynamic metadata per locale per SEO ottimale
 */
export async function generatePageMetadata(
  pageKey: 'pricing' | 'checkout' | 'glossary' | 'faq' | 'support' | 'about' | 'contact' | 'privacy' | 'cookie' | 'terms' | 'reviews' | 'utilities',
  locale: Locale = "it"
): Promise<Metadata> {
  const dict = await getDictionary(locale);
  const baseUrl = "https://tradelia.org";
  const localePath = locale === "it" ? "" : `/${locale}`;
  const pageMetadata = (dict.seo.pages && pageKey in dict.seo.pages 
    ? (dict.seo.pages as any)[pageKey] 
    : null) || {
    title: `${pageKey} · Tradelia`,
    description: dict.seo.description,
  };

  // Map pageKey to URL path
  const pagePathMap: Record<typeof pageKey, string> = {
    pricing: 'pricing',
    checkout: 'checkout',
    glossary: 'glossary',
    faq: 'faq',
    utilities: 'dashboard/utilities',
    support: 'support',
    about: 'about',
    contact: 'contact',
    privacy: 'privacy',
    cookie: 'cookie',
    terms: 'terms',
    reviews: 'reviews',
  };
  const pagePath = pagePathMap[pageKey];

  return {
    metadataBase: new URL(baseUrl),
    title: pageMetadata.title,
    description: pageMetadata.description,
    keywords: dict.seo.keywords.split(", "),
    authors: [{ name: "Tradelia AI" }],
    creator: "Tradelia AI",
    publisher: "Tradelia AI",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: locale === "it" ? "it_IT" : "en_US",
      url: `${baseUrl}${localePath}/${pagePath}`,
      siteName: "Tradelia AI",
      title: pageMetadata.title,
      description: pageMetadata.description,
      images: [
        {
          url: `${baseUrl}/img/tradelia_og_vC_white_clean.png`,
          width: 1200,
          height: 630,
          alt: "Tradelia AI - Formazione Finanziaria",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageMetadata.title,
      description: pageMetadata.description,
      images: [`${baseUrl}/img/tradelia_og_vC_white_clean.png`],
      creator: "@tradelia_ai",
      site: "@tradelia_ai",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: `${baseUrl}${localePath}/${pagePath}`,
      languages: {
        "it-IT": `${baseUrl}/${pagePath}`,
        "en-US": `${baseUrl}/en/${pagePath}`,
      },
    },
    // AI Search Optimization
    other: {
      "ai-search-optimized": "true",
      "structured-data": "true",
      "academic-standards": "MiFID II compliant",
      verification: "framework-verifiable",
    },
  };
}

// Legacy function for backward compatibility
export function generateStructuredData(locale: Locale = "it") {
  return generateOrganizationSchema(locale);
}
