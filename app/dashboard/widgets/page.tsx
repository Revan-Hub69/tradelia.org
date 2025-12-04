import { Metadata } from 'next';
import { WidgetsContent } from '@/components/widgets/WidgetsContent';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';

export const metadata: Metadata = {
  title: 'Widget | Tradelia',
  description: 'Widget e strumenti interattivi per la dashboard',
};

export default function WidgetsPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <WidgetsContent />
    </div>
  );
}

