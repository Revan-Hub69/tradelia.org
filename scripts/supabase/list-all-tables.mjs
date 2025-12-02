#!/usr/bin/env node

/**
 * List All Tables in Supabase
 * Elenca tutte le tabelle esistenti nel database
 * 
 * Usage: node scripts/supabase/list-all-tables.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '../..');

// Load env vars
dotenv.config({ path: join(root, '.env.local') });
dotenv.config({ path: join(root, '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listAllTables() {
  console.log('🔍 Scanning Supabase database...\n');

  try {
    // Try to get tables via RPC or direct query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          table_name,
          table_schema,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = t.table_schema AND table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    });

    if (error) {
      // Fallback: try to query known tables
      console.warn('⚠️  Could not query information_schema directly');
      console.log('💡 Try running this SQL in Supabase Dashboard SQL Editor:\n');
      console.log(`
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
      `);
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 No tables found in public schema');
      return;
    }

    console.log(`📊 Found ${data.length} table(s) in public schema:\n`);

    // Group by potential duplicates (similar names)
    const tables = data.map(row => ({
      name: row.table_name,
      columns: row.column_count || 0,
    }));

    // Check for duplicates/similar names
    const duplicates = [];
    const seen = new Set();
    
    tables.forEach(table => {
      const baseName = table.name.toLowerCase().replace(/[_-]/g, '');
      if (seen.has(baseName)) {
        duplicates.push(table.name);
      } else {
        seen.add(baseName);
      }
    });

    // Display all tables
    tables.forEach((table, index) => {
      const isDuplicate = duplicates.includes(table.name);
      const marker = isDuplicate ? '⚠️  ' : '  ';
      console.log(`${marker}${(index + 1).toString().padStart(3)}. ${table.name.padEnd(40)} (${table.columns} columns)`);
    });

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} potential duplicate(s):`);
      duplicates.forEach(name => console.log(`   - ${name}`));
    }

    console.log(`\n📋 Summary:`);
    console.log(`   Total tables: ${tables.length}`);
    console.log(`   Potential duplicates: ${duplicates.length}`);
    console.log(`\n💡 To clean up, use: node scripts/supabase/cleanup-database.mjs`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listAllTables();

