import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crypto Depth Widget | Tradelia',
  description: 'Profondità di mercato aggregata multi-exchange. Widget installabile per mobile e desktop.',
  keywords: ['crypto depth', 'order book', 'market depth', 'liquidity analysis', 'trading widget'],
  openGraph: {
    title: 'Crypto Depth Widget | Tradelia',
    description: 'Profondità di mercato aggregata multi-exchange',
    type: 'website',
    url: 'https://tradelia.org/widgets/crypto-depth',
  },
  twitter: {
    card: 'summary',
    title: 'Crypto Depth Widget | Tradelia',
    description: 'Profondità di mercato aggregata multi-exchange',
  },
  alternates: {
    canonical: 'https://tradelia.org/widgets/crypto-depth',
    languages: {
      'it': 'https://tradelia.org/widgets/crypto-depth',
      'en': 'https://tradelia.org/en/widgets/crypto-depth',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CryptoDepthWidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
