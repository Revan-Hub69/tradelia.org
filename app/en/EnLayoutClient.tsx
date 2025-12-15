'use client';

import dynamic from 'next/dynamic';

// CRITICAL: Non renderizzare ConditionalHeader qui - viene già renderizzato dal root layout (app/layout.tsx)
// Renderizzarlo qui causerebbe doppio header quando si switcha in inglese
// Il root layout gestisce già ConditionalHeader per tutte le route non-dashboard

const Footer = dynamic(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })), {
  ssr: false,
});

export function EnLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header è gestito dal root layout - non renderizzarlo qui */}
      {children}
      <Footer />
    </>
  );
}
