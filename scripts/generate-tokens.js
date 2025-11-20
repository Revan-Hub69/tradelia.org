/**
 * Generate CSS from Design Tokens JSON
 * Converts design-tokens/tokens.json to CSS custom properties
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const tokensPath = path.join(rootDir, 'design-tokens', 'tokens.json');
const outputPath = path.join(rootDir, 'design-tokens', 'tokens.css');

function flattenTokens(obj, prefix = '') {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}-${key}` : key;
    
    if (value.value !== undefined) {
      result[newKey] = value.value;
    } else if (typeof value === 'object') {
      Object.assign(result, flattenTokens(value, newKey));
    }
  }
  
  return result;
}

function generateCSS(tokens) {
  const flat = flattenTokens(tokens);
  const cssVars = [];
  
  // Generate CSS custom properties
  cssVars.push('/* Design Tokens - Auto-generated from tokens.json */');
  cssVars.push('/* DO NOT EDIT MANUALLY - Run: npm run generate-tokens */');
  cssVars.push('');
  cssVars.push(':root {');
  
  for (const [key, value] of Object.entries(flat)) {
    const cssKey = `--${key.replace(/_/g, '-')}`;
    cssVars.push(`  ${cssKey}: ${value};`);
  }
  
  cssVars.push('}');
  cssVars.push('');
  
  return cssVars.join('\n');
}

try {
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const css = generateCSS(tokens);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, css, 'utf8');
  console.log('✅ Design tokens CSS generated:', outputPath);
} catch (error) {
  console.error('❌ Error generating tokens:', error);
  process.exit(1);
}

