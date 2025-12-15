import { Metadata } from 'next';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateWebSiteSchema } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Preferiti | Tradelia';
  const description = 'I tuoi contenuti preferiti: indicatori, report, analisi salvati';
  const url = 'https://tradelia.org/dashboard/favorites';
  const image = 'https://tradelia.org/og-favorites.png';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tradelia',
      images: [{ url: image, width: 1200, height: 630, alt: 'Tradelia Favorites' }],
      locale: 'it_IT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@tradelia',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default function FavoritesPage() {
  const structuredData = generateWebSiteSchema('it');
  
  return (
    <>
      <StructuredData data={structuredData} id="favorites-structured-data" />
      <DashboardTabs />
      <DashboardShell />
    </>
  );
}
