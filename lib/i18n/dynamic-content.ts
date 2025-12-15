/**
 * Dynamic Content Translation Utilities - Simplified (always Italian)
 * 
 * Maintained for API compatibility and future migration to external libraries
 * Strategy: Strangler Fig Pattern - allows gradual removal without breaking changes
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
 * Get localized field - Always returns Italian version
 * Priority: 1. title_it/description_it/etc, 2. Generic field (title/description/etc), 3. Fallback
 */
export function getLocalizedField<T = string>(
  content: MultilingualContent,
  field: string,
  locale: Locale = 'it',
  fallback?: T
): T | undefined {
  // Always prefer Italian-specific field
  const italianField = `${field}_it` as keyof MultilingualContent;
  if (content[italianField] !== undefined && content[italianField] !== null) {
    return content[italianField] as T;
  }
  
  // Try generic field
  if (content[field] !== undefined && content[field] !== null) {
    return content[field] as T;
  }
  
  // Return fallback
  return fallback;
}

/**
 * Get localized title - Always returns Italian
 */
export function getLocalizedTitle(
  content: MultilingualContent,
  locale: Locale = 'it',
  fallback = ''
): string {
  return getLocalizedField(content, 'title', locale, fallback) || fallback;
}

/**
 * Get localized description - Always returns Italian
 */
export function getLocalizedDescription(
  content: MultilingualContent,
  locale: Locale = 'it',
  fallback = ''
): string {
  return getLocalizedField(content, 'description', locale, fallback) || fallback;
}

/**
 * Get localized name - Always returns Italian
 */
export function getLocalizedName(
  content: MultilingualContent,
  locale: Locale = 'it',
  fallback = ''
): string {
  return getLocalizedField(content, 'name', locale, fallback) || fallback;
}

/**
 * Transform array of multilingual content to localized content - Always Italian
 */
export function localizeContentArray<T extends MultilingualContent>(
  items: T[],
  locale: Locale = 'it'
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
