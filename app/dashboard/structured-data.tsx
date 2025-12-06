/**
 * Structured Data (JSON-LD) per SEO AI
 * Best Practice: Fornisce contesto semantico per AI crawlers e motori di ricerca
 */
export function DashboardStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tradelia Dashboard',
    description: 'Dashboard principale per accedere a report, corsi, analisi e tutte le funzionalità della piattaforma Tradelia',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: 'https://tradelia.org/dashboard',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'Report finanziari verificabili',
      'Corsi formativi',
      'Analisi di mercato',
      'Paper Trading',
      'Utilities Pro',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
  };

  // BreadcrumbList per SEO (Best Practice: Navigation structure)
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://tradelia.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Dashboard',
        item: 'https://tradelia.org/dashboard',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
    </>
  );
}
