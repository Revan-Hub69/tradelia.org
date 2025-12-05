import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crypto Top Movers Widget | Tradelia',
  description: 'Top gainers, losers e high volume crypto. Widget installabile per mobile e desktop.',
  keywords: ['crypto movers', 'top gainers', 'top losers', 'high volume', 'trading widget'],
  openGraph: {
    title: 'Crypto Top Movers Widget | Tradelia',
    description: 'Top gainers, losers e high volume crypto',
    type: 'website',
    url: 'https://tradelia.org/widgets/crypto-movers',
  },
  twitter: {
    card: 'summary',
    title: 'Crypto Top Movers Widget | Tradelia',
    description: 'Top gainers, losers e high volume crypto',
  },
  alternates: {
    canonical: 'https://tradelia.org/widgets/crypto-movers',
    languages: {
      'it': 'https://tradelia.org/widgets/crypto-movers',
      'en': 'https://tradelia.org/en/widgets/crypto-movers',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CryptoMoversWidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
