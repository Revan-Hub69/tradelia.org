import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login · Tradelia',
  description: 'Accedi alla dashboard Tradelia per esplorare percorsi formativi, report verificabili e framework AI.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

