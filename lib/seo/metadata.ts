import { Metadata } from "next";
import { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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

// Structured Data for AI Search
export function generateStructuredData(locale: Locale = "it") {
  const baseUrl = "https://tradelia.org";

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Tradelia AI",
    url: baseUrl,
    description:
      locale === "it"
        ? "Formazione finanziaria gratuita basata su framework AI proprietari verificabili"
        : "Free financial education based on verifiable proprietary AI frameworks",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: locale === "it" ? "Percorsi Formativi" : "Training Paths",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Course",
            name: locale === "it" ? "Formazione Finanziaria" : "Financial Education",
            description:
              locale === "it"
                ? "Percorsi formativi completi sui mercati finanziari"
                : "Complete training paths on financial markets",
          },
        },
      ],
    },
    // AI Search specific - valid properties for EducationalOrganization
    knowsAbout: [
      "Financial Markets",
      "AI Frameworks",
      "MiFID II Compliance",
      "Risk Management",
      "Market Analysis",
    ],
    // Use hasCredential instead of accreditation (valid property)
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Professional Certification",
      name:
        locale === "it"
          ? "Certificato di Formazione Finanziaria"
          : "Financial Education Certificate",
    },
  };
}
