'use client';

import { GlossaryContent } from '@/components/glossary/GlossaryContent';

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GlossaryContent />
      </div>
    </div>
  );
}
