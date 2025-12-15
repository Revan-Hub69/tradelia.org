'use client';

import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { WidgetsContent } from '@/components/widgets/WidgetsContent';

export default function WidgetsPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WidgetsContent />
      </div>
    </div>
  );
}

