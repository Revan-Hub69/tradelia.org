'use client';

import dynamic from 'next/dynamic';

// Header principale per pagine /en (non dashboard)
const ConditionalHeader = dynamic(
  () => import('@/components/layout/ConditionalHeader').then(m => ({ default: m.ConditionalHeader })),
  { ssr: false }
);

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
      <ConditionalHeader />
      {children}
      <Footer />
    </>
  );
}
