/**
 * Generate CSS from Design Tokens JSON
 * Converts design-tokens/tokens.json to CSS custom properties
 * FASE 1: Design System Consolidato - Production Ready
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const tokensPath = path.join(rootDir, "design-tokens", "tokens.json");
const outputPathDesignTokens = path.join(rootDir, "design-tokens", "tokens.css");
const outputPathSettings = path.join(rootDir, "assets", "css", "settings", "tokens.css");

function flattenTokens(obj, prefix = "") {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (value.value !== undefined) {
      result[newKey] = value.value;
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenTokens(value, newKey));
    }
  }

  return result;
}

function generateCSS(tokens) {
  const flat = flattenTokens(tokens);
  const cssVars = [];

  // Header
  cssVars.push("/* Design Tokens - Auto-generated from tokens.json */");
  cssVars.push("/* DO NOT EDIT MANUALLY - Run: npm run generate-tokens */");
  cssVars.push("/* FASE 1: Design System Consolidato - Production Ready */");
  cssVars.push("");

  // Base tokens in :root
  cssVars.push(":root {");

  // Typography
  cssVars.push("  /* Typography */");
  if (flat["typography-fontFamily-sans"]) {
    cssVars.push(`  --ff-sans: ${flat["typography-fontFamily-sans"]};`);
  }
  if (flat["typography-fontFamily-mono"]) {
    cssVars.push(`  --ff-mono: ${flat["typography-fontFamily-mono"]};`);
  }

  // Font sizes
  for (let i = 11; i <= 22; i++) {
    if (i === 17 || i === 19 || i === 21) {
      continue;
    } // Skip non-existent sizes
    const key = `typography-fontSize-${i}`;
    if (flat[key]) {
      cssVars.push(`  --fs-${i}: ${flat[key]};`);
    }
  }

  // Line heights
  for (const lh of ["1", "12", "13", "14", "15", "16", "17"]) {
    const key = `typography-lineHeight-${lh}`;
    if (flat[key]) {
      cssVars.push(`  --lh-${lh}: ${flat[key]};`);
    }
  }

  cssVars.push("");
  cssVars.push("  /* Spacing */");
  for (const sp of ["1", "1_5", "2", "3", "4", "5", "6", "7", "8", "10", "12", "16"]) {
    const key = `spacing-${sp}`;
    if (flat[key]) {
      const cssKey = sp.replace("_", "-");
      cssVars.push(`  --sp-${cssKey}: ${flat[key]};`);
    }
  }

  cssVars.push("");
  cssVars.push("  /* Border Radius */");
  for (const br of ["sm", "md", "lg", "xl", "pill", "card", "card-sm"]) {
    const key = `borderRadius-${br}`;
    if (flat[key]) {
      const cssKey = br.replace("-", "-");
      cssVars.push(`  --radius-${cssKey}: ${flat[key]};`);
    }
  }

  cssVars.push("");
  cssVars.push("  /* Shadows */");
  for (const sh of ["sm", "md", "lg", "xl", "card"]) {
    const key = `shadow-${sh}`;
    if (flat[key]) {
      cssVars.push(`  --shadow-${sh}: ${flat[key]};`);
    }
  }

  cssVars.push("");
  cssVars.push("  /* Container */");
  if (flat["container-max"]) {
    cssVars.push(`  --container-max: ${flat["container-max"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Breakpoints */");
  for (const bp of ["sm", "md", "lg", "xl", "2xl"]) {
    const key = `breakpoint-${bp}`;
    if (flat[key]) {
      cssVars.push(`  --breakpoint-${bp}: ${flat[key]};`);
    }
  }

  cssVars.push("");
  cssVars.push("  /* Transitions */");
  for (const tr of ["fast", "base", "slow"]) {
    const key = `transition-${tr}`;
    if (flat[key]) {
      cssVars.push(`  --transition-${tr}: ${flat[key]};`);
    }
  }

  cssVars.push("}");
  cssVars.push("");

  // Dark theme colors
  cssVars.push("/* ===== DARK MODE ISTITUZIONALE FINANZIARIO ===== */");
  cssVars.push(':root[data-theme="dark"] {');
  cssVars.push("  /* Colori Testo */");
  if (flat["colors-text-ink"]) {
    cssVars.push(`  --ink: ${flat["colors-text-ink"]};`);
  }
  if (flat["colors-text-ink-soft"]) {
    cssVars.push(`  --ink-soft: ${flat["colors-text-ink-soft"]};`);
  }
  if (flat["colors-text-muted"]) {
    cssVars.push(`  --muted: ${flat["colors-text-muted"]};`);
  }
  if (flat["colors-text-muted-strong"]) {
    cssVars.push(`  --muted-strong: ${flat["colors-text-muted-strong"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Superfici */");
  if (flat["colors-surface-page"]) {
    cssVars.push(`  --surface-page: ${flat["colors-surface-page"]};`);
  }
  if (flat["colors-surface-card"]) {
    cssVars.push(`  --surface-card: ${flat["colors-surface-card"]};`);
  }
  if (flat["colors-surface-elev"]) {
    cssVars.push(`  --surface-elev: ${flat["colors-surface-elev"]};`);
  }
  if (flat["colors-surface-hover"]) {
    cssVars.push(`  --surface-hover: ${flat["colors-surface-hover"]};`);
  }
  if (flat["colors-surface-card-alt"]) {
    cssVars.push(`  --surface-card-alt: ${flat["colors-surface-card-alt"]};`);
  }
  if (flat["colors-surface-panel-head"]) {
    cssVars.push(`  --surface-panel-head: ${flat["colors-surface-panel-head"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Bordi */");
  if (flat["colors-border-soft"]) {
    cssVars.push(`  --br-soft: ${flat["colors-border-soft"]};`);
  }
  if (flat["colors-border-card"]) {
    cssVars.push(`  --br-card: ${flat["colors-border-card"]};`);
  }
  if (flat["colors-border-strong"]) {
    cssVars.push(`  --br-strong: ${flat["colors-border-strong"]};`);
  }
  if (flat["colors-border-panel-divider"]) {
    cssVars.push(`  --br-panel-divider: ${flat["colors-border-panel-divider"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Footer */");
  if (flat["colors-footer-bg"]) {
    cssVars.push(`  --footer-bg: ${flat["colors-footer-bg"]};`);
  }
  if (flat["colors-footer-br"]) {
    cssVars.push(`  --footer-br: ${flat["colors-footer-br"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Brand */");
  if (flat["colors-brand-600"]) {
    cssVars.push(`  --brand-600: ${flat["colors-brand-600"]};`);
  }
  if (flat["colors-brand-500"]) {
    cssVars.push(`  --brand-500: ${flat["colors-brand-500"]};`);
  }
  if (flat["colors-brand-400"]) {
    cssVars.push(`  --brand-400: ${flat["colors-brand-400"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Stati */");
  if (flat["colors-status-ok"]) {
    cssVars.push(`  --ok: ${flat["colors-status-ok"]};`);
  }
  if (flat["colors-status-warn"]) {
    cssVars.push(`  --warn: ${flat["colors-status-warn"]};`);
  }
  if (flat["colors-status-err"]) {
    cssVars.push(`  --err: ${flat["colors-status-err"]};`);
  }
  if (flat["colors-status-neutral"]) {
    cssVars.push(`  --neutral: ${flat["colors-status-neutral"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Tone Colors */");
  if (flat["colors-tone-pos-fg"]) {
    cssVars.push(`  --tone-pos-fg: ${flat["colors-tone-pos-fg"]};`);
  }
  if (flat["colors-tone-neg-fg"]) {
    cssVars.push(`  --tone-neg-fg: ${flat["colors-tone-neg-fg"]};`);
  }
  if (flat["colors-tone-warn-fg"]) {
    cssVars.push(`  --tone-warn-fg: ${flat["colors-tone-warn-fg"]};`);
  }
  if (flat["colors-tone-neu-fg"]) {
    cssVars.push(`  --tone-neu-fg: ${flat["colors-tone-neu-fg"]};`);
  }

  cssVars.push("");
  cssVars.push("  /* Background e Text Color */");
  cssVars.push("  background: var(--surface-page);");
  cssVars.push("  color: var(--ink);");
  cssVars.push("}");
  cssVars.push("");

  // Light theme (usa stessi valori dark)
  cssVars.push("/* ===== LIGHT THEME - USA STESSI STILI DARK ===== */");
  cssVars.push(':root[data-theme="light"] {');
  cssVars.push("  /* Colori Testo - Stesso del dark */");
  cssVars.push("  --ink: var(--ink);");
  cssVars.push("  --ink-soft: var(--ink-soft);");
  cssVars.push("  --muted: var(--muted);");
  cssVars.push("  --muted-strong: var(--muted-strong);");
  cssVars.push("");
  cssVars.push("  /* Superfici - Stesso del dark */");
  cssVars.push("  --surface-page: var(--surface-page);");
  cssVars.push("  --surface-card: var(--surface-card);");
  cssVars.push("  --surface-elev: var(--surface-elev);");
  cssVars.push("  --surface-hover: var(--surface-hover);");
  cssVars.push("  --surface-card-alt: var(--surface-card-alt);");
  cssVars.push("  --surface-panel-head: var(--surface-panel-head);");
  cssVars.push("");
  cssVars.push("  /* Bordi - Stesso del dark */");
  cssVars.push("  --br-soft: var(--br-soft);");
  cssVars.push("  --br-card: var(--br-card);");
  cssVars.push("  --br-strong: var(--br-strong);");
  cssVars.push("  --br-panel-divider: var(--br-panel-divider);");
  cssVars.push("");
  cssVars.push("  /* Footer - Stesso del dark */");
  cssVars.push("  --footer-bg: var(--footer-bg);");
  cssVars.push("  --footer-br: var(--footer-br);");
  cssVars.push("");
  cssVars.push("  /* Brand - Stesso del dark */");
  cssVars.push("  --brand-600: var(--brand-600);");
  cssVars.push("  --brand-500: var(--brand-500);");
  cssVars.push("  --brand-400: var(--brand-400);");
  cssVars.push("");
  cssVars.push("  /* Stati - Stesso del dark */");
  cssVars.push("  --ok: var(--ok);");
  cssVars.push("  --warn: var(--warn);");
  cssVars.push("  --err: var(--err);");
  cssVars.push("  --neutral: var(--neutral);");
  cssVars.push("");
  cssVars.push("  /* Tone Colors - Stesso del dark */");
  cssVars.push("  --tone-pos-fg: var(--tone-pos-fg);");
  cssVars.push("  --tone-neg-fg: var(--tone-neg-fg);");
  cssVars.push("  --tone-warn-fg: var(--tone-warn-fg);");
  cssVars.push("  --tone-neu-fg: var(--tone-neu-fg);");
  cssVars.push("");
  cssVars.push("  /* Background e Text Color - Stesso del dark */");
  cssVars.push("  background: var(--surface-page);");
  cssVars.push("  color: var(--ink);");
  cssVars.push("}");
  cssVars.push("");

  // Reduced motion support
  cssVars.push("/* Supporto prefers-reduced-motion */");
  cssVars.push("@media (prefers-reduced-motion: reduce) {");
  cssVars.push("  :root {");
  cssVars.push("    --transition-fast: 0.01s;");
  cssVars.push("    --transition-base: 0.01s;");
  cssVars.push("    --transition-slow: 0.01s;");
  cssVars.push("  }");
  cssVars.push("");
  cssVars.push("  *,");
  cssVars.push("  *::before,");
  cssVars.push("  *::after {");
  cssVars.push("    animation-duration: 0.01s !important;");
  cssVars.push("    animation-iteration-count: 1 !important;");
  cssVars.push("    transition-duration: 0.01s !important;");
  cssVars.push("  }");
  cssVars.push("}");

  return cssVars.join("\n");
}

try {
  const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));
  const css = generateCSS(tokens);

  // Write to design-tokens/tokens.css
  const outputDirDesignTokens = path.dirname(outputPathDesignTokens);
  if (!fs.existsSync(outputDirDesignTokens)) {
    fs.mkdirSync(outputDirDesignTokens, { recursive: true });
  }
  fs.writeFileSync(outputPathDesignTokens, css, "utf8");
  console.log("✅ Design tokens CSS generated:", outputPathDesignTokens);

  // Write to assets/css/settings/tokens.css (ITCSS Settings layer)
  const outputDirSettings = path.dirname(outputPathSettings);
  if (!fs.existsSync(outputDirSettings)) {
    fs.mkdirSync(outputDirSettings, { recursive: true });
  }

  const settingsCSS = `/* ITCSS: Settings Layer
 * Design Tokens - Auto-generated from tokens.json
 * DO NOT EDIT MANUALLY - Run: npm run generate-tokens
 */

${css}`;

  fs.writeFileSync(outputPathSettings, settingsCSS, "utf8");
  console.log("✅ Settings tokens CSS generated:", outputPathSettings);
  console.log("✅ FASE 1.1: Design System Consolidato - Tokens migrati e generati");
} catch (error) {
  console.error("❌ Error generating tokens:", error);
  process.exit(1);
}
