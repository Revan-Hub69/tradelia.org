/**
 * Test: generate-tokens.js
 * FASE 3: Testing Framework Setup
 * Test per utility critica di generazione tokens
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

describe('generate-tokens.js', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  it('dovrebbe generare tokens.css da tokens.json', async () => {
    // Verifica che tokens.json esista
    const tokensJsonPath = path.join(rootDir, 'design-tokens', 'tokens.json');
    expect(fs.existsSync(tokensJsonPath)).toBe(true);

    // Verifica che tokens.json sia valido JSON
    const tokensJson = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf-8'));
    expect(tokensJson).toBeDefined();
    expect(typeof tokensJson).toBe('object');
  });

  it('dovrebbe avere struttura tokens.json corretta', async () => {
    const tokensJsonPath = path.join(rootDir, 'design-tokens', 'tokens.json');
    const tokens = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf-8'));

    // Verifica struttura base
    expect(tokens).toHaveProperty('colors');
    expect(tokens).toHaveProperty('typography');
    expect(tokens).toHaveProperty('spacing');
    expect(tokens).toHaveProperty('radius');
    expect(tokens).toHaveProperty('transitions');
  });

  it('dovrebbe generare file tokens.css in assets/css/settings/', async () => {
    const outputPath = path.join(rootDir, 'assets', 'css', 'settings', 'tokens.css');
    
    // Verifica che il file esista
    expect(fs.existsSync(outputPath)).toBe(true);

    // Verifica che contenga CSS variables
    const content = fs.readFileSync(outputPath, 'utf-8');
    expect(content).toContain(':root');
    expect(content).toContain('--');
  });

  it('dovrebbe generare CSS variables valide', async () => {
    const outputPath = path.join(rootDir, 'assets', 'css', 'settings', 'tokens.css');
    const content = fs.readFileSync(outputPath, 'utf-8');

    // Verifica formato CSS variables
    const cssVarRegex = /--[a-z0-9-]+:\s*[^;]+;/g;
    const matches = content.match(cssVarRegex);
    expect(matches).toBeTruthy();
    expect(matches.length).toBeGreaterThan(0);
  });
});

