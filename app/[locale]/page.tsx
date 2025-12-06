import { redirect } from 'next/navigation';
import { defaultLocale, localePaths } from '@/lib/i18n/config';

/**
 * Handle /[locale] routes
 * Always redirect to root (Italian only - system simplified)
 */
export default function LocalePage({ params }: { params: { locale: string } }) {
  // Always redirect to root (Italian only)
  redirect(localePaths[defaultLocale]);
}
