import { redirect } from 'next/navigation';
import { defaultLocale, localePaths } from '@/lib/i18n/config';

/**
 * Handle /[locale] routes
 * Redirect to correct locale path (root for IT, /en for EN)
 * Prevents /it URLs that cause Google indexing issues
 */
export default function LocalePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as 'it' | 'en';
  const targetPath = localePaths[locale] || localePaths[defaultLocale];
  
  // Redirect to correct path (root for IT, /en for EN)
  redirect(targetPath);
}
