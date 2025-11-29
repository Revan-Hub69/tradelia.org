import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login · Tradelia',
  description: 'Access your Tradelia dashboard to explore training paths, verifiable reports, and documented AI frameworks.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

