/**
 * Structured Data (Schema.org) Generator
 * Best Practice 2024-2025: Rich snippets per migliorare CTR e indicizzazione
 * Supporta: Google, Bing, AI Search (Perplexity, ChatGPT), Social Media
 */

import { Locale } from '@/lib/i18n/config';

const baseUrl = 'https://tradelia.org';

/**
 * Organization Schema - Base per tutto il sito
 */
export function generateOrganizationSchema(locale: Locale = 'it') {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${baseUrl}#organization`,
    name: 'Tradelia AI',
    url: baseUrl,
    logo: `${baseUrl}/logos/tradelia-logo.svg`,
    description:
      locale === 'it'
        ? 'Formazione finanziaria gratuita basata su framework AI proprietari verificabili. Materiale conforme agli standard accademici internazionali e alle normative MiFID II.'
        : 'Free financial education based on verifiable proprietary AI frameworks. Material compliant with international academic standards and MiFID II regulations.',
    foundingDate: '2024',
    knowsAbout: [
      'Financial Markets',
      'AI Frameworks',
      'MiFID II Compliance',
      'Risk Management',
      'Market Analysis',
      'Financial Education',
      'Trading Education',
    ],
    areaServed: 'Worldwide',
    sameAs: [
      // Aggiungi quando disponibili
      // 'https://twitter.com/tradelia_ai',
      // 'https://linkedin.com/company/tradelia',
    ],
  };
}

/**
 * WebSite Schema - Per ricerca vocale e rich snippets
 */
export function generateWebSiteSchema(locale: Locale = 'it') {
  const localePath = locale === 'it' ? '' : `/${locale}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}${localePath}#website`,
    url: `${baseUrl}${localePath}`,
    name: 'Tradelia AI',
    description:
      locale === 'it'
        ? 'Formazione finanziaria gratuita basata su framework AI proprietari verificabili'
        : 'Free financial education based on verifiable proprietary AI frameworks',
    publisher: {
      '@id': `${baseUrl}#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}${localePath}/dashboard?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: locale === 'it' ? 'it-IT' : 'en-US',
  };
}

/**
 * BreadcrumbList Schema - Per navigazione e rich snippets
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  locale: Locale = 'it'
) {
  const localePath = locale === 'it' ? '' : `/${locale}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${localePath}${item.url}`,
    })),
  };
}

/**
 * FAQPage Schema - Per rich snippets nelle SERP
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
  locale: Locale = 'it'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Review/AggregateRating Schema - Per recensioni e stelle nelle SERP
 */
export function generateReviewSchema(
  reviews: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>,
  averageRating: number,
  reviewCount: number,
  locale: Locale = 'it'
) {
  const localePath = locale === 'it' ? '' : `/${locale}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}${localePath}#product`,
    name: 'Tradelia AI Platform',
    description:
      locale === 'it'
        ? 'Piattaforma di formazione finanziaria gratuita con framework AI verificabili'
        : 'Free financial education platform with verifiable AI frameworks',
    brand: {
      '@id': `${baseUrl}#organization`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.datePublished,
      reviewBody: review.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    })),
  };
}

/**
 * Article Schema - Per blog posts o contenuti editoriali
 */
export function generateArticleSchema(
  title: string,
  description: string,
  publishedTime: string,
  modifiedTime?: string,
  author?: string,
  image?: string,
  locale: Locale = 'it'
) {
  const localePath = locale === 'it' ? '' : `/${locale}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: image || `${baseUrl}/img/tradelia_og_vC_white_clean.png`,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Organization',
      name: author || 'Tradelia AI',
      url: baseUrl,
    },
    publisher: {
      '@id': `${baseUrl}#organization`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}${localePath}`,
    },
  };
}

/**
 * Course Schema - Per percorsi formativi
 */
export function generateCourseSchema(
  name: string,
  description: string,
  provider: string = 'Tradelia AI',
  locale: Locale = 'it'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
      '@id': `${baseUrl}#organization`,
    },
    educationalLevel: 'Beginner to Advanced',
    inLanguage: locale === 'it' ? 'it-IT' : 'en-US',
  };
}

/**
 * HowTo Schema - Per guide passo-passo
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string }>,
  locale: Locale = 'it'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Service Schema - Per servizi offerti
 */
export function generateServiceSchema(
  name: string,
  description: string,
  serviceType: string,
  areaServed: string = 'Worldwide',
  locale: Locale = 'it'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    provider: {
      '@id': `${baseUrl}#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: areaServed,
    },
  };
}

/**
 * CollectionPage Schema - Per pagine con liste (glossario, recensioni, etc.)
 */
export function generateCollectionPageSchema(
  name: string,
  description: string,
  numberOfItems: number,
  locale: Locale = 'it'
) {
  const localePath = locale === 'it' ? '' : `/${locale}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    numberOfItems,
    mainEntity: {
      '@id': `${baseUrl}${localePath}#website`,
    },
  };
}
