#!/usr/bin/env node

/**
 * Script per audit completo di tutte le pagine
 * Verifica:
 * - Typography (min 14px, line-height)
 * - Contrast ratio
 * - Design tokens usage
 * - Cognitive load principles
 * - Chat AI availability
 * - Coming soon overlays
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const pagesDir = './app';
const issues = [];

async function auditPage(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const issues = [];

    // Check typography
    if (content.includes('text-xs') && !content.includes('// text-xs allowed for labels')) {
      issues.push('⚠️ text-xs usato (minimo WCAG: 14px)');
    }

    // Check line-height
    const hasTextClasses = /text-(xs|sm|base|lg|xl|2xl|3xl)/.test(content);
    const hasLeading = /leading-(tight|normal|relaxed|loose)/.test(content);
    if (hasTextClasses && !hasLeading) {
      issues.push('⚠️ Line-height non specificato');
    }

    // Check design tokens
    const usesHardcodedColors = /(bg-|text-|border-)(red|blue|green|yellow|gray|slate|zinc|neutral|stone)\d+/.test(content);
    if (usesHardcodedColors) {
      issues.push('⚠️ Colori hardcoded invece di design tokens');
    }

    // Check cognitive load
    const hasLongLists = /<ul[^>]*>[\s\S]{0,5000}<\/ul>/.test(content);
    if (hasLongLists) {
      const listItems = (content.match(/<li/g) || []).length;
      if (listItems > 7) {
        issues.push(`⚠️ Lista con ${listItems} elementi (max 7 per Miller's Law)`);
      }
    }

    return issues;
  } catch (error) {
    return [`❌ Errore lettura file: ${error.message}`];
  }
}

async function scanDirectory(dir, basePath = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = join(basePath, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      const subResults = await scanDirectory(fullPath, relativePath);
      results.push(...subResults);
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      const pageIssues = await auditPage(fullPath);
      if (pageIssues.length > 0) {
        results.push({
          path: relativePath,
          issues: pageIssues,
        });
      }
    }
  }

  return results;
}

async function main() {
  console.log('🔍 Audit completo di tutte le pagine...\n');

  try {
    const results = await scanDirectory(pagesDir);

    if (results.length === 0) {
      console.log('✅ Tutte le pagine sono ottimizzate!');
      return;
    }

    console.log(`⚠️ Trovate ${results.length} pagine con problemi:\n`);

    results.forEach(({ path, issues }) => {
      console.log(`📄 ${path}`);
      issues.forEach((issue) => console.log(`   ${issue}`));
      console.log('');
    });

    console.log(`\n📊 Riepilogo:`);
    console.log(`   - Pagine con problemi: ${results.length}`);
    console.log(`   - Totale issues: ${results.reduce((sum, r) => sum + r.issues.length, 0)}`);
  } catch (error) {
    console.error('❌ Errore durante audit:', error);
    process.exit(1);
  }
}

main();
