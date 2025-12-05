import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import WidgetsManager from '@/components/widgets/WidgetsManager';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateWebSiteSchema } from '@/lib/seo/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('utilities', 'en');
}

export default function WidgetsPage() {
  const structuredData = generateWebSiteSchema('en');
  
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="p-6 max-w-7xl mx-auto">
        <StructuredData data={structuredData} id="widgets-structured-data" />
        <WidgetsManager />
      </div>
    </div>
  );
}
