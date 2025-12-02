#!/usr/bin/env node

/**
 * Analyze Required Supabase Tables
 * Analizza il codice per trovare tutte le tabelle Supabase realmente usate
 * 
 * Usage: node scripts/analyze-required-tables.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

// Estrai tutte le tabelle da .from() calls
function extractTables(content) {
  const tables = new Set();
  
  // Pattern per .from("table") o .from('table')
  const fromPattern = /\.from\(['"]([^'"]+)['"]\)/g;
  let match;
  
  while ((match = fromPattern.exec(content)) !== null) {
    tables.add(match[1]);
  }
  
  return Array.from(tables);
}

// Cerca file TypeScript/JavaScript
function findCodeFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    // Skip node_modules, .next, dist, etc.
    if (file.startsWith('.') || file === 'node_modules' || file === '.next' || file === 'dist') {
      continue;
    }
    
    if (stat.isDirectory()) {
      findCodeFiles(filePath, fileList);
    } else if (['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(file))) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Analizza tutti i file
function analyzeCodebase() {
  console.log('🔍 Analyzing Tradelia codebase for Supabase tables...\n');
  
  const codeFiles = findCodeFiles(join(root, 'lib'));
  const appFiles = findCodeFiles(join(root, 'app'));
  const componentFiles = findCodeFiles(join(root, 'components'));
  
  const allFiles = [...codeFiles, ...appFiles, ...componentFiles];
  const allTables = new Set();
  const tableLocations = new Map();
  
  console.log(`📁 Scanning ${allFiles.length} files...\n`);
  
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      const tables = extractTables(content);
      
      for (const table of tables) {
        allTables.add(table);
        
        if (!tableLocations.has(table)) {
          tableLocations.set(table, []);
        }
        tableLocations.get(table).push(file.replace(root + '/', ''));
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  // Ordina tabelle
  const sortedTables = Array.from(allTables).sort();
  
  console.log(`📊 Found ${sortedTables.length} unique tables:\n`);
  
  // Raggruppa per categoria
  const categories = {
    'User Management': [],
    'Reports': [],
    'Education/Courses': [],
    'Payments/Billing': [],
    'Admin': [],
    'Other': [],
  };
  
  for (const table of sortedTables) {
    if (table.includes('user') || table.includes('profile') || table.includes('role')) {
      categories['User Management'].push(table);
    } else if (table.includes('report')) {
      categories['Reports'].push(table);
    } else if (table.includes('course') || table.includes('education') || table.includes('lesson') || table.includes('module') || table.includes('achievement')) {
      categories['Education/Courses'].push(table);
    } else if (table.includes('payment') || table.includes('invoice') || table.includes('order') || table.includes('subscription') || table.includes('credit')) {
      categories['Payments/Billing'].push(table);
    } else if (table.includes('admin')) {
      categories['Admin'].push(table);
    } else {
      categories['Other'].push(table);
    }
  }
  
  // Stampa per categoria
  for (const [category, tables] of Object.entries(categories)) {
    if (tables.length > 0) {
      console.log(`\n📋 ${category} (${tables.length}):`);
      for (const table of tables.sort()) {
        const locations = tableLocations.get(table);
        console.log(`   ✅ ${table}`);
        if (locations && locations.length <= 3) {
          locations.forEach(loc => console.log(`      → ${loc}`));
        } else if (locations) {
          console.log(`      → Used in ${locations.length} files`);
        }
      }
    }
  }
  
  console.log(`\n\n📊 Summary:`);
  console.log(`   Total tables needed: ${sortedTables.length}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Check which tables exist in your Supabase database`);
  console.log(`   2. Create migrations only for missing tables`);
  console.log(`   3. Don't create tables that already exist`);
  
  return sortedTables;
}

analyzeCodebase();

