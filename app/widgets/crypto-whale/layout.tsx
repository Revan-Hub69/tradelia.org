import { Metadata } from 'next';

/**
 * SEO Metadata for Crypto Whale Widget
 * Best Practice 2025: Complete metadata for discoverability
 */
export const metadata: Metadata = {
  title: 'Crypto Whale Widget | Tradelia',
  description: 'Monitora transazioni whale e flussi exchange in tempo reale. Widget installabile per mobile e desktop.',
  keywords: ['crypto whale', 'whale transactions', 'cryptocurrency analysis', 'blockchain analytics', 'trading widget'],
  openGraph: {
    title: 'Crypto Whale Widget | Tradelia',
    description: 'Monitora transazioni whale e flussi exchange in tempo reale',
    type: 'website',
    url: 'https://tradelia.org/widgets/crypto-whale',
  },
  twitter: {
    card: 'summary',
    title: 'Crypto Whale Widget | Tradelia',
    description: 'Monitora transazioni whale e flussi exchange in tempo reale',
  },
  alternates: {
    canonical: 'https://tradelia.org/widgets/crypto-whale',
    languages: {
      'it': 'https://tradelia.org/widgets/crypto-whale',
      'en': 'https://tradelia.org/en/widgets/crypto-whale',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CryptoWhaleWidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
