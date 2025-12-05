/**
 * Dynamic Content Translation Utilities
 * Best Practice: Handle multilingual content from database/API
 * Supports content with multiple language fields or JSON structure
 */

import { type Locale } from './config';

export interface MultilingualContent {
  title?: string;
  title_it?: string;
  title_en?: string;
  description?: string;
  description_it?: string;
  description_en?: string;
  name?: string;
  name_it?: string;
  name_en?: string;
  content?: string;
  content_it?: string;
  content_en?: string;
  [key: string]: unknown;
}

/**
 * Get localized field from multilingual content
 * Priority: 1. Locale-specific field, 2. Generic field, 3. Fallback
 */
export function getLocalizedField<T = string>(
  content: MultilingualContent,
  field: string,
  locale: Locale,
  fallback?: T
): T | undefined {
  // Try locale-specific field first (e.g., title_it, title_en)
  const localeField = `${field}_${locale}` as keyof MultilingualContent;
  if (content[localeField] !== undefined && content[localeField] !== null) {
    return content[localeField] as T;
  }
  
  // Try generic field (e.g., title)
  if (content[field] !== undefined && content[field] !== null) {
    return content[field] as T;
  }
  
  // Try default locale (Italian) as fallback
  if (locale !== 'it') {
    const defaultField = `${field}_it` as keyof MultilingualContent;
    if (content[defaultField] !== undefined && content[defaultField] !== null) {
      return content[defaultField] as T;
    }
  }
  
  // Return provided fallback or undefined
  return fallback;
}

/**
 * Get localized title from content
 */
export function getLocalizedTitle(
  content: MultilingualContent,
  locale: Locale,
  fallback = ''
): string {
  return getLocalizedField(content, 'title', locale, fallback) || fallback;
}

/**
 * Get localized description from content
 */
export function getLocalizedDescription(
  content: MultilingualContent,
  locale: Locale,
  fallback = ''
): string {
  return getLocalizedField(content, 'description', locale, fallback) || fallback;
}

/**
 * Get localized name from content
 */
export function getLocalizedName(
  content: MultilingualContent,
  locale: Locale,
  fallback = ''
): string {
  return getLocalizedField(content, 'name', locale, fallback) || fallback;
}

/**
 * Transform array of multilingual content to localized content
 */
export function localizeContentArray<T extends MultilingualContent>(
  items: T[],
  locale: Locale
): Array<Omit<T, 'title_it' | 'title_en' | 'description_it' | 'description_en' | 'name_it' | 'name_en' | 'content_it' | 'content_en'> & {
  title: string;
  description?: string;
  name?: string;
  content?: string;
}> {
  return items.map(item => ({
    ...item,
    title: getLocalizedTitle(item, locale, ''),
    description: getLocalizedDescription(item, locale),
    name: getLocalizedName(item, locale),
    content: getLocalizedField(item, 'content', locale),
  }));
}

/**
 * Check if content has multilingual fields
 */
export function hasMultilingualFields(content: MultilingualContent): boolean {
  return !!(
    content.title_it || content.title_en ||
    content.description_it || content.description_en ||
    content.name_it || content.name_en ||
    content.content_it || content.content_en
  );
}
