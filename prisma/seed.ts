import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create providers
  const binance = await prisma.provider.create({
    data: {
      name: 'Binance',
      type: 'EXCHANGE',
      regions: ['GLOBAL', 'EU'],
      regulatedIn: ['MALTA'],
      products: ['CRYPTO'],
      website: 'https://binance.com',
      description: 'Global cryptocurrency exchange'
    }
  })

  const degiro = await prisma.provider.create({
    data: {
      name: 'DEGIRO',
      type: 'BROKER',
      regions: ['EU'],
      regulatedIn: ['AFM', 'ESMA'],
      products: ['EQUITY', 'ETF', 'BONDS'],
      website: 'https://degiro.eu',
      description: 'European online broker'
    }
  })

  const ig = await prisma.provider.create({
    data: {
      name: 'IG Markets',
      type: 'CFD_PROVIDER',
      regions: ['EU', 'UK'],
      regulatedIn: ['FCA', 'ESMA'],
      products: ['CFD', 'FUTURES'],
      website: 'https://ig.com',
      description: 'CFD and spread betting provider'
    }
  })

  const kraken = await prisma.provider.create({
    data: {
      name: 'Kraken',
      type: 'EXCHANGE',
      regions: ['GLOBAL', 'EU', 'US'],
      regulatedIn: ['FINCEN', 'FCA'],
      products: ['CRYPTO'],
      website: 'https://kraken.com',
      description: 'Regulated cryptocurrency exchange'
    }
  })

  const xtb = await prisma.provider.create({
    data: {
      name: 'XTB',
      type: 'BROKER',
      regions: ['EU'],
      regulatedIn: ['KNF', 'ESMA'],
      products: ['CFD', 'EQUITY', 'ETF'],
      website: 'https://xtb.com',
      description: 'European multi-asset broker'
    }
  })

  // Create fee schedules
  await prisma.feeSchedule.createMany({
    data: [
      // Binance Crypto
      {
        providerId: binance.id,
        product: 'CRYPTO',
        makerFeePct: 0.1,
        takerFeePct: 0.1,
        withdrawalFees: JSON.stringify({ BTC: 0.0005, ETH: 0.005, EUR: 0 }),
        spreadPolicy: 'variable',
        sourceUrl: 'https://binance.com/en/fee/schedule',
        lastVerifiedAt: new Date()
      },
      // Kraken Crypto
      {
        providerId: kraken.id,
        product: 'CRYPTO',
        makerFeePct: 0.16,
        takerFeePct: 0.26,
        withdrawalFees: JSON.stringify({ BTC: 0.00015, ETH: 0.0025, EUR: 0.9 }),
        spreadPolicy: 'variable',
        sourceUrl: 'https://kraken.com/features/fee-schedule',
        lastVerifiedAt: new Date()
      },
      // DEGIRO Equity
      {
        providerId: degiro.id,
        product: 'EQUITY',
        commissionPerTrade: 2.0,
        minCommission: 2.0,
        maxCommission: null,
        fxFeePct: 0.1,
        spreadPolicy: 'unknown',
        sourceUrl: 'https://degiro.eu/data/pdf/it/Listino.pdf',
        lastVerifiedAt: new Date()
      },
      // DEGIRO ETF
      {
        providerId: degiro.id,
        product: 'ETF',
        commissionPerTrade: 2.0,
        minCommission: 2.0,
        fxFeePct: 0.1,
        spreadPolicy: 'unknown',
        sourceUrl: 'https://degiro.eu/data/pdf/it/Listino.pdf',
        lastVerifiedAt: new Date()
      },
      // IG CFD
      {
        providerId: ig.id,
        product: 'CFD',
        commissionPerTrade: null,
        financingRatePolicy: 'LIBOR + 2.5%',
        spreadPolicy: 'variable',
        sourceUrl: 'https://ig.com/it/costi-e-commissioni',
        lastVerifiedAt: new Date(),
        notes: 'Spread-based pricing, overnight financing charges apply'
      },
      // XTB CFD
      {
        providerId: xtb.id,
        product: 'CFD',
        commissionPerTrade: null,
        financingRatePolicy: 'Variable rate',
        spreadPolicy: 'variable',
        sourceUrl: 'https://xtb.com/it/costi-commissioni',
        lastVerifiedAt: new Date()
      },
      // XTB Equity
      {
        providerId: xtb.id,
        product: 'EQUITY',
        commissionPerTrade: 0,
        minCommission: 0,
        fxFeePct: 0.5,
        spreadPolicy: 'unknown',
        sourceUrl: 'https://xtb.com/it/costi-commissioni',
        lastVerifiedAt: new Date(),
        notes: 'Zero commission on real stocks up to €100k monthly volume'
      }
    ]
  })

  console.log('✅ Database seeded successfully')
  console.log(`Created ${await prisma.provider.count()} providers`)
  console.log(`Created ${await prisma.feeSchedule.count()} fee schedules`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })