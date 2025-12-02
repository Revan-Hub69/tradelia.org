#!/usr/bin/env node

/**
 * Cleanup Supabase Database
 * Rimuove tutte le tabelle dal database (ATTENZIONE: distruttivo!)
 * 
 * Usage: node scripts/supabase/cleanup-database.mjs [--confirm]
 * 
 * ⚠️  WARNING: This will DELETE ALL TABLES and DATA!
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

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

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function getTables() {
  // This SQL will be executed in Supabase Dashboard
  const sql = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;

  console.log('\n📋 Copy and run this SQL in Supabase Dashboard to get table list:\n');
  console.log(sql);
  console.log('\n💡 Then paste the results here, or use the SQL below to drop all tables:\n');
  
  return null; // We'll provide SQL instead
}

function generateCleanupSQL() {
  return `
-- ⚠️  WARNING: This will DELETE ALL TABLES in public schema!
-- Copy and run this in Supabase Dashboard SQL Editor

DO \$\$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;
    
    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
        RAISE NOTICE 'Dropped sequence: %', r.sequence_name;
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
        RAISE NOTICE 'Dropped function: %', r.routine_name;
    END LOOP;
    
    RAISE NOTICE '✅ Cleanup complete!';
END
\$\$;
  `;
}

async function main() {
  const args = process.argv.slice(2);
  const confirmed = args.includes('--confirm');

  console.log('⚠️  ⚠️  ⚠️  WARNING: DATABASE CLEANUP ⚠️  ⚠️  ⚠️\n');
  console.log('This will DELETE ALL TABLES, SEQUENCES, and FUNCTIONS in the public schema!');
  console.log('This action CANNOT be undone!\n');

  if (!confirmed) {
    const answer = await askQuestion('Type "DELETE ALL" to confirm: ');
    if (answer !== 'DELETE ALL') {
      console.log('\n❌ Cleanup cancelled.');
      process.exit(0);
    }
  }

  console.log('\n📋 SQL Script for Supabase Dashboard:\n');
  console.log('='.repeat(60));
  console.log(generateCleanupSQL());
  console.log('='.repeat(60));
  
  console.log('\n📝 Instructions:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to Supabase Dashboard → SQL Editor');
  console.log('3. Paste and run the SQL');
  console.log('4. All tables will be dropped');
  console.log('5. Then run migrations 001 and 002 to recreate clean tables\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

