'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/use-translations';
import { buildLocalePath } from '@/lib/i18n/paths';
import { getInternalLinks, type InternalLink } from '@/lib/seo/internal-linking';
import { prefetchOnHover } from '@/lib/utils/prefetch';
import { usePathname } from 'next/navigation';

/**
 * Internal Links Component
 * Best Practice 2024-2025: Link interni strategici per SEO e UX
 * Migliora: PageRank distribution, crawlability, user navigation
 */
export function InternalLinks() {
  const { locale } = useTranslations();
  const pathname = usePathname();
  
  // Normalizza pathname (rimuovi /en se presente)
  const normalizedPath = pathname?.replace(/^\/en/, '') || '/';
  const links = getInternalLinks(normalizedPath);

  if (links.length === 0) {
    return null;
  }

  return (
    <nav
      className="mt-12 pt-8 border-t border-border-subtle"
      aria-label="Link correlati"
    >
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
        Pagine Correlate
      </h3>
      <ul className="flex flex-wrap gap-4">
        {links.map((link, index) => {
          const href = buildLocalePath(locale, link.url);
          return (
            <li key={index}>
              <Link
                href={href}
                onMouseEnter={() => prefetchOnHover(href)}
                className="text-sm text-text-primary hover:text-text-primary underline-selection transition-colors"
              >
                {link.anchor}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
