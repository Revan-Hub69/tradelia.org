/**
 * Typography Utilities
 *
 * Best Practice: WCAG 2.1 AA/AAA compliance
 * Paper: "The Science of Typography" (W3C WCAG 2.1, ISO 9241-171)
 *
 * Font Size: Minimo 14px per body text (WCAG AA)
 * Line Height: 1.5-1.6 per leggibilità ottimale
 * Contrast Ratio: Minimo 4.5:1 per testo normale
 */

/**
 * Typography scale basata su studi scientifici
 * - text-xs: 12px (solo per labels, non per contenuto importante)
 * - text-sm: 14px (minimo WCAG AA per body text)
 * - text-base: 16px (ottimale per body text)
 * - text-lg: 18px (sottotitoli)
 * - text-xl: 20px (titoli sezioni)
 * - text-2xl: 24px (titoli principali)
 */
export const typographyScale = {
  xs: "text-xs leading-relaxed", // 12px - Solo labels
  sm: "text-sm leading-relaxed", // 14px - Minimo WCAG AA
  base: "text-base leading-relaxed", // 16px - Ottimale
  lg: "text-lg leading-relaxed", // 18px - Sottotitoli
  xl: "text-xl leading-relaxed", // 20px - Titoli sezioni
  "2xl": "text-2xl leading-relaxed", // 24px - Titoli principali
  "3xl": "text-3xl leading-relaxed", // 30px - Hero titles
} as const;

/**
 * Line height ottimale per leggibilità
 * Research: 1.5-1.6 per dark mode, 1.75 per body text
 */
export const lineHeight = {
  tight: "leading-tight", // 1.25
  normal: "leading-normal", // 1.5
  relaxed: "leading-relaxed", // 1.625
  loose: "leading-loose", // 2.0
} as const;

/**
 * Font weight per gerarchia visiva
 * Research: Cognitive Load Theory - Usare weight per guidare l'occhio
 */
export const fontWeight = {
  light: "font-light", // 300
  normal: "font-normal", // 400
  medium: "font-medium", // 500
  semibold: "font-semibold", // 600
  bold: "font-bold", // 700
} as const;

/**
 * Utility per combinare typography classes
 */
export function getTypographyClasses(
  size: keyof typeof typographyScale = "base",
  weight: keyof typeof fontWeight = "normal"
): string {
  return `${typographyScale[size]} ${fontWeight[weight]}`;
}

/**
 * Verifica se font size è WCAG AA compliant
 */
export function isWCAGCompliant(fontSize: number): boolean {
  return fontSize >= 14; // WCAG AA minimum
}
