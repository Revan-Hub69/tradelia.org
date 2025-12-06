import type { Metadata } from 'next';
import { generateMetadata as genMetadata } from '@/lib/seo/metadata';
import dynamic from 'next/dynamic';

// Header principale per pagine /en (non dashboard)
const ConditionalHeader = dynamic(
  () => import('@/components/layout/ConditionalHeader').then(m => ({ default: m.ConditionalHeader })),
  { ssr: false }
);

const Footer = dynamic(() => import('@/components/layout/Footer').then(m => ({ default: m.Footer })), {
  ssr: false,
});

export async function generateMetadata() {
  return genMetadata('en');
}

export default function EnLayout({
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
