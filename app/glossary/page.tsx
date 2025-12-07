'use client';

import dynamic from 'next/dynamic';
import { GlossaryContent } from '@/components/glossary/GlossaryContent';
import { Breadcrumb } from '@/components/ui/Breadcrumb';

// Header principale (non dashboard header)
const ConditionalHeader = dynamic(
  () => import('@/components/layout/ConditionalHeader').then(m => ({ default: m.ConditionalHeader })),
  { ssr: false }
);

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <ConditionalHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '90px' }}>
        <Breadcrumb className="mb-6" />
        <GlossaryContent />
      </div>
    </div>
  );
}
