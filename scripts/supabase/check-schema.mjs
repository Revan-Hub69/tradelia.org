#!/usr/bin/env node

/**
 * Supabase Schema Checker
 * Verifica lo stato attuale delle tabelle in Supabase
 * 
 * Usage: node scripts/supabase/check-schema.mjs
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
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get all tables from information_schema
 */
async function getTables() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          table_name,
          table_schema
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    });

    if (error) {
      // Fallback: try direct query
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');

      if (tablesError) {
        // Try listing known tables
        return await checkKnownTables();
      }

      return tables?.map((t) => t.table_name) || [];
    }

    return data?.map((row) => row.table_name) || [];
  } catch (error) {
    console.warn('⚠️  Could not query information_schema, checking known tables...');
    return await checkKnownTables();
  }
}

/**
 * Check known tables by trying to query them
 */
async function checkKnownTables() {
  const knownTables = [
    'user_roles',
    'admin_emails',
    'pdf_customizations',
    'asset_proposals',
    'asset_votes',
    'notifications',
    'user_profiles',
    'subscriptions',
  ];

  const existing = [];

  for (const table of knownTables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error || error.code === 'PGRST116') {
        // PGRST116 = no rows, but table exists
        existing.push(table);
      }
    } catch {
      // Table doesn't exist
    }
  }

  return existing;
}

/**
 * Get columns for a table
 */
async function getTableColumns(tableName) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `,
    });

    if (error) {
      // Try to infer from a sample query
      const { data: sample } = await supabase.from(tableName).select('*').limit(1);
      if (sample && sample.length > 0) {
        return Object.keys(sample[0]).map((key) => ({
          column_name: key,
          data_type: 'unknown',
          is_nullable: 'YES',
        }));
      }
      return [];
    }

    return data || [];
  } catch {
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Checking Supabase Schema...\n');

  const tables = await getTables();

  if (tables.length === 0) {
    console.log('⚠️  No tables found or unable to query schema');
    console.log('   This might mean:');
    console.log('   - Database is empty');
    console.log('   - No permissions to query information_schema');
    console.log('   - Connection issue\n');
    return;
  }

  console.log(`✅ Found ${tables.length} table(s):\n`);

  for (const table of tables) {
    console.log(`📊 ${table}`);
    const columns = await getTableColumns(table);
    if (columns.length > 0) {
      columns.forEach((col) => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`   - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      });
    } else {
      console.log('   (Unable to get column details)');
    }
    console.log('');
  }

  // Check required tables
  console.log('\n📋 Required Tables Check:\n');
  const requiredTables = {
    'user_roles': 'User roles and subscriptions',
    'admin_emails': 'Admin email whitelist',
    'pdf_customizations': 'PDF customization settings (Desk)',
    'asset_proposals': 'Community proposals (Pro)',
    'asset_votes': 'Community votes (Pro)',
  };

  for (const [table, description] of Object.entries(requiredTables)) {
    const exists = tables.includes(table);
    console.log(`${exists ? '✅' : '❌'} ${table}`);
    console.log(`   ${description}`);
    if (!exists) {
      console.log(`   ⚠️  Missing - run migrations to create`);
    }
    console.log('');
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});


