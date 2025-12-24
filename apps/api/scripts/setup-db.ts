#!/usr/bin/env tsx

/**
 * Database Setup Script
 *
 * This script ensures the database is properly initialized with:
 * 1. Applied migrations
 * 2. Generated Prisma client
 * 3. Basic seed data if needed
 */

import { execSync } from 'child_process'
import { env } from '../src/config/env'

async function main() {
  console.log('🚀 Starting TRADelia Database Setup...')

  try {
    // Check database connection
    console.log('📊 Checking database connection...')
    console.log(`Database URL: ${env.DATABASE_URL ? '[CONFIGURED]' : '[MISSING]'}`)

    if (!env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not configured')
      process.exit(1)
    }

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...')
    execSync('pnpm run db:generate', {
      stdio: 'inherit',
      cwd: process.cwd()
    })

    // Apply migrations
    console.log('📦 Applying database migrations...')
    try {
      execSync('pnpm run db:migrate', {
        stdio: 'inherit',
        cwd: process.cwd()
      })
      console.log('✅ Migrations applied successfully')
    } catch (error) {
      console.log('⚠️  Migrations may already be applied or database needs setup')
      console.log('Error details:', (error as Error).message)
    }

    // Verify database tables
    console.log('🔍 Verifying database tables...')
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Test key tables exist
      await prisma.screenerRun.findFirst({ take: 1 })
      await prisma.orderRecord.findFirst({ take: 1 })
      console.log('✅ Database tables verified')
    } catch (error) {
      console.error('❌ Database tables missing. Migration may have failed.')
      console.error('Error:', (error as Error).message)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }

    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Ensure your .env file has correct DATABASE_URL')
    console.log('2. Run: pnpm --filter @tradelia/api run dev')
    console.log('3. The system should now start with full trading capabilities')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

main()
