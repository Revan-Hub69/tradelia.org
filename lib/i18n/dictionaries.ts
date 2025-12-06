import { Locale } from './config';

/**
 * Simplified dictionary loader - Always returns empty object
 * 
 * Maintained for API compatibility and future migration to external libraries
 * 
 * TODO: Replace with next-intl or similar library when ready
 */
export const getDictionary = async (locale: Locale) => {
  // Always return empty object (translations are now hardcoded)
  return {};
};
