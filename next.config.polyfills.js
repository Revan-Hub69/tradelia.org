/**
 * Polyfill exclusion configuration
 * 
 * This file documents which polyfills can be safely excluded for modern browsers.
 * The features listed below are natively supported in our target browsers
 * (last 2 versions of Chrome, Firefox, Safari, Edge).
 * 
 * Features that don't need polyfills:
 * - Array.prototype.at (Chrome 92+, Firefox 90+, Safari 15.4+)
 * - Array.prototype.flat (Chrome 69+, Firefox 62+, Safari 12+)
 * - Array.prototype.flatMap (Chrome 69+, Firefox 62+, Safari 12+)
 * - Object.fromEntries (Chrome 73+, Firefox 63+, Safari 12.1+)
 * - Object.hasOwn (Chrome 93+, Firefox 92+, Safari 15.4+)
 * - String.prototype.trimEnd (Chrome 66+, Firefox 61+, Safari 12+)
 * - String.prototype.trimStart (Chrome 66+, Firefox 61+, Safari 12+)
 * 
 * Note: These polyfills are often bundled by dependencies like @supabase/supabase-js.
 * Webpack configuration in next.config.js should handle tree-shaking to remove unused code.
 */

module.exports = {
  // This is a documentation file
  // Actual configuration is in next.config.js webpack section
};
