/**
 * Structured Data for Indicators - Best Practice 2026
 * 
 * Genera structured data (Schema.org) per ogni indicatore:
 * - Dataset schema per dati di mercato
 * - FAQPage schema per FAQ
 * - HowTo schema per interpretazione
 * - BreadcrumbList schema per navigazione
 */

import { INDICATOR_TOOLTIPS } from '@/lib/data/indicator-tooltips';
import { generateIndicatorFAQ } from './ai-seo-content';

const baseUrl = 'https://tradelia.org';

/**
 * Generate Dataset Schema for indicator
 */
export function generateIndicatorDatasetSchema(indicatorId: string, data: any) {
  const tooltip = INDICATOR_TOOLTIPS[indicatorId];
  if (!tooltip) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${baseUrl}/dashboard/market-data#${indicatorId}`,
    name: tooltip.name,
    description: tooltip.description,
    url: `${baseUrl}/dashboard/market-data?indicator=${indicatorId}`,
    keywords: [
      tooltip.name,
      indicatorId,
      'indicatori di mercato',
      'analisi finanziaria',
      'Tradelia',
      ...(tooltip.academicReferences?.map(ref => ref.authors) || []),
    ],
    creator: {
      '@type': 'Organization',
      name: 'Tradelia',
      url: baseUrl,
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    license: 'https://tradelia.org/terms',
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${baseUrl}/api/market-indicators/${indicatorId}`,
    },
    measurementTechnique: tooltip.academicReferences?.map(ref => ref.title).join(', ') || '',
    variableMeasured: tooltip.name,
  };
}

/**
 * Generate FAQPage Schema for indicator
 */
export async function generateIndicatorFAQSchema(indicatorId: string) {
  const tooltip = INDICATOR_TOOLTIPS[indicatorId];
  if (!tooltip) return null;

  const faqs = await generateIndicatorFAQ(indicatorId, tooltip.name ?? indicatorId);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
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
 * Generate HowTo Schema for indicator interpretation
 */
export function generateIndicatorHowToSchema(indicatorId: string) {
  const tooltip = INDICATOR_TOOLTIPS[indicatorId];
  if (!tooltip) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Come interpretare ${tooltip.name}`,
    description: tooltip.howToUse,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Leggere il valore',
        text: tooltip.description,
      },
      {
        '@type': 'HowToStep',
        name: 'Interpretare il segnale',
        text: `Segnale positivo: ${tooltip.interpretation?.positive ?? ''}. Segnale negativo: ${tooltip.interpretation?.negative ?? ''}.`,
      },
      {
        '@type': 'HowToStep',
        name: 'Riferimenti accademici',
        text: tooltip.academicReferences?.map(ref => `${ref.authors} (${ref.year}): ${ref.title}`).join('. ') || '',
      },
    ],
  };
}

/**
 * Generate BreadcrumbList Schema for indicator navigation
 */
export function generateIndicatorBreadcrumbSchema(indicatorId: string, category: string) {
  const tooltip = INDICATOR_TOOLTIPS[indicatorId];
  const categoryLabels: Record<string, string> = {
    stock: 'Stock & Market',
    economic: 'Economic & Macro',
    crypto: 'Crypto',
    forex: 'Forex',
    commodity: 'Commodity',
    market: 'Market Data & Events',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Dashboard',
        item: `${baseUrl}/dashboard`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Market Data',
        item: `${baseUrl}/dashboard/market-data`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: categoryLabels[category] || category,
        item: `${baseUrl}/dashboard/market-data?category=${category}`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: tooltip?.name || indicatorId,
        item: `${baseUrl}/dashboard/market-data?indicator=${indicatorId}`,
      },
    ],
  };
}

/**
 * Generate complete structured data for indicator page
 */
export async function generateIndicatorStructuredData(
  indicatorId: string,
  category: string,
  data?: any
) {
  const [dataset, faq, howTo, breadcrumb] = await Promise.all([
    Promise.resolve(generateIndicatorDatasetSchema(indicatorId, data)),
    generateIndicatorFAQSchema(indicatorId),
    Promise.resolve(generateIndicatorHowToSchema(indicatorId)),
    Promise.resolve(generateIndicatorBreadcrumbSchema(indicatorId, category)),
  ]);

  return {
    dataset,
    faq,
    howTo,
    breadcrumb,
  };
}
