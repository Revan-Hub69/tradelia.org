import type { Metadata } from 'next';
import { generateMetadata as genMetadata } from '@/lib/seo/metadata';
import { EnLayoutClient } from './EnLayoutClient';

export async function generateMetadata() {
  return genMetadata('en');
}

export default function EnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnLayoutClient>{children}</EnLayoutClient>;
}
