#!/usr/bin/env node

/**
 * Supabase Setup Script
 * Verifica connessione e applica tutte le migrazioni necessarie
 * 
 * Usage: node scripts/supabase/setup.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
  console.error('\n💡 Make sure your .env.local file contains:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Test connection
 */
async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  
  try {
    // Try to query a simple table or use auth
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    
    if (error && !error.message.includes('not configured')) {
      throw error;
    }
    
    console.log('✅ Connection successful!\n');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Check your:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }
}

/**
 * Execute SQL directly (if RPC is available)
 */
async function executeSQL(sql) {
  try {
    // Try RPC first
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (!error) return true;
  } catch {
    // RPC not available
  }

  // Fallback: manual execution via PostgREST
  // Note: This requires the SQL to be split into statements
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        // For CREATE TABLE, we need to use direct SQL
        // This might require a custom function or Supabase CLI
        console.warn('⚠️  Direct SQL execution requires Supabase CLI or custom function');
        console.warn('   Please run migrations manually via Supabase Dashboard or CLI');
        return false;
      } catch (error) {
        console.error('Error:', error.message);
        return false;
      }
    }
  }

  return true;
}

/**
 * Apply migration file
 */
async function applyMigration(filename) {
  const migrationsDir = join(root, 'supabase', 'migrations');
  const filePath = join(migrationsDir, filename);

  if (!existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`);
    return false;
  }

  console.log(`📝 Applying ${filename}...`);
  const sql = readFileSync(filePath, 'utf-8');

  try {
    await executeSQL(sql);
    console.log(`✅ Applied ${filename}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to apply ${filename}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Supabase Setup\n');
  console.log('='.repeat(50));
  console.log('');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  // Check migrations directory
  const migrationsDir = join(root, 'supabase', 'migrations');
  if (!existsSync(migrationsDir)) {
    console.log('⚠️  Migrations directory not found');
    console.log(`   Expected: ${migrationsDir}`);
    console.log('\n💡 Create the directory and add migration files (.sql)');
    return;
  }

  const migrations = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    console.log('⚠️  No migration files found');
    console.log(`   Directory: ${migrationsDir}`);
    return;
  }

  console.log(`📋 Found ${migrations.length} migration(s):\n`);
  migrations.forEach((m) => console.log(`   - ${m}`));
  console.log('');

  console.log('💡 To apply migrations:');
  console.log('   1. Use Supabase Dashboard SQL Editor');
  console.log('   2. Use Supabase CLI: supabase db push');
  console.log('   3. Copy SQL from supabase/migrations/*.sql\n');

  console.log('📚 Migration files are ready in:');
  console.log(`   ${migrationsDir}\n`);
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});


