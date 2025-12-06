/**
 * Structured Data (JSON-LD) per SEO AI
 * Best Practice: Fornisce contesto semantico per AI crawlers
 */
export function DashboardStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tradelia Dashboard',
    description: 'Dashboard principale per accedere a report, corsi, analisi e tutte le funzionalità della piattaforma Tradelia',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
