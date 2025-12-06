/**
 * Simplified dictionary loader - Always returns empty object
 * 
 * Maintained for API compatibility and future migration to external libraries
 * Strategy: Strangler Fig Pattern - allows gradual removal without breaking changes
 */

import { Locale } from './config';

export const getDictionary = async (locale: Locale) => {
  // Always return empty object (translations are now hardcoded)
  return {};
};
