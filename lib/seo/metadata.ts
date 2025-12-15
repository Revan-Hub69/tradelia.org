import { Metadata } from "next";
import { Locale } from "@/lib/i18n/config";
import { generateOrganizationSchema, generateWebSiteSchema } from './structured-data';

export async function generateMetadata(locale: Locale = "it"): Promise<Metadata> {
  const baseUrl = "https://tradelia.org";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "Tradelia AI · Formazione Finanziaria Gratuita",
      template: "%s · Tradelia AI",
    },
    description: "Formazione finanziaria gratuita basata su framework AI proprietari verificabili",
    keywords: ["formazione finanziaria", "trading", "investimenti", "analisi tecnica", "analisi fondamentale", "MiFID II", "educazione finanziaria"],
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
      locale: "it_IT",
      url: baseUrl,
      siteName: "Tradelia AI",
      title: "Tradelia AI · Formazione Finanziaria Gratuita",
      description: "Formazione finanziaria gratuita basata su framework AI proprietari verificabili",
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
      title: "Tradelia AI · Formazione Finanziaria Gratuita",
      description: "Formazione finanziaria gratuita basata su framework AI proprietari verificabili",
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
      canonical: baseUrl,
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
 * Best Practice 2024-2025: Simplified - Italian only
 */
export async function generatePageMetadata(
  pageKey: 'pricing' | 'checkout' | 'glossary' | 'faq' | 'support' | 'about' | 'contact' | 'privacy' | 'cookie' | 'terms' | 'reviews' | 'utilities',
  locale: Locale = "it"
): Promise<Metadata> {
  const baseUrl = "https://tradelia.org";
  
  // Page metadata - Italian only
  const pageMetadataMap: Record<typeof pageKey, { title: string; description: string }> = {
    pricing: {
      title: "Pricing · Tradelia",
      description: "Scegli il piano perfetto per le tue esigenze",
    },
    checkout: {
      title: "Checkout · Tradelia",
      description: "Completa il tuo acquisto",
    },
    glossary: {
      title: "Glossario · Tradelia",
      description: "Glossario completo dei termini finanziari",
    },
    faq: {
      title: "FAQ · Tradelia",
      description: "Domande frequenti su Tradelia",
    },
    utilities: {
      title: "Strumenti Finanziari · Tradelia",
      description: "Calcolatori e utilities finanziarie professionali",
    },
    support: {
      title: "Supporto · Tradelia",
      description: "Contatta il nostro team di supporto",
    },
    about: {
      title: "Chi Siamo · Tradelia",
      description: "Scopri di più su Tradelia",
    },
    contact: {
      title: "Contatti · Tradelia",
      description: "Contattaci per qualsiasi domanda",
    },
    privacy: {
      title: "Privacy · Tradelia",
      description: "Informativa sulla privacy",
    },
    cookie: {
      title: "Cookie · Tradelia",
      description: "Informativa sui cookie",
    },
    terms: {
      title: "Termini · Tradelia",
      description: "Termini e condizioni d'uso",
    },
    reviews: {
      title: "Recensioni · Tradelia",
      description: "Recensioni verificate dei nostri utenti",
    },
  };
  
  const pageMetadata = pageMetadataMap[pageKey];

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
    keywords: ["formazione finanziaria", "trading", "investimenti", "analisi tecnica", "analisi fondamentale", "MiFID II", "educazione finanziaria"],
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
      locale: "it_IT",
      url: `${baseUrl}/${pagePath}`,
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
      canonical: `${baseUrl}/${pagePath}`,
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
