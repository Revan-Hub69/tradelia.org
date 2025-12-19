import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const providerSeed = [
  {
    name: 'Orion Desk',
    type: 'CFD_PROVIDER',
    regions: ['EU', 'UK'],
    regulatedIn: ['ESMA'],
    products: ['CFD', 'FUTURES'],
    website: 'https://example.com/orion-desk',
    description: 'Provider multi-asset con focus su CFD e futures.'
  },
  {
    name: 'BlueCove Exchange',
    type: 'EXCHANGE',
    regions: ['GLOBAL'],
    regulatedIn: ['VASP'],
    products: ['CRYPTO'],
    website: 'https://example.com/bluecove',
    description: 'Exchange crypto con liquidità simulata.'
  },
  {
    name: 'Summit Flow',
    type: 'BROKER',
    regions: ['EU'],
    regulatedIn: ['ESMA'],
    products: ['EQUITY_ETF', 'BONDS'],
    website: 'https://example.com/summit-flow',
    description: 'Broker EU focalizzato su azioni e obbligazioni.'
  },
  {
    name: 'NovaBridge Markets',
    type: 'BROKER',
    regions: ['GLOBAL'],
    regulatedIn: ['ASIC'],
    products: ['EQUITY_ETF', 'FUTURES'],
    website: 'https://example.com/novabridge',
    description: 'Copertura globale per equity e futures.'
  },
  {
    name: 'DeltaHarbor',
    type: 'EXCHANGE',
    regions: ['EU', 'GLOBAL'],
    regulatedIn: ['VASP'],
    products: ['CRYPTO', 'CFD'],
    website: 'https://example.com/deltaharbor',
    description: 'Hub digitale con focus su crypto e CFD sintetici.'
  },
  {
    name: 'Axis Lane',
    type: 'BROKER',
    regions: ['EU'],
    regulatedIn: ['ESMA'],
    products: ['BONDS', 'EQUITY_ETF'],
    website: 'https://example.com/axis-lane',
    description: 'Broker istituzionale per bond ed ETF.'
  },
  {
    name: 'QuantaForge',
    type: 'CFD_PROVIDER',
    regions: ['GLOBAL'],
    regulatedIn: ['FCA'],
    products: ['CFD', 'FUTURES'],
    website: 'https://example.com/quantaforge',
    description: 'Provider CFD con stack tecnologico dedicato.'
  },
  {
    name: 'LumenRock',
    type: 'EXCHANGE',
    regions: ['GLOBAL'],
    regulatedIn: ['VASP'],
    products: ['CRYPTO', 'EQUITY_ETF'],
    website: 'https://example.com/lumenrock',
    description: 'Piattaforma ibrida con bridge tra crypto e equity.'
  },
  {
    name: 'CopperGate',
    type: 'CFD_PROVIDER',
    regions: ['EU'],
    regulatedIn: ['ESMA'],
    products: ['CFD'],
    website: 'https://example.com/coppergate',
    description: 'Provider CFD specializzato su strumenti EU.'
  },
  {
    name: 'Vantage Loop',
    type: 'BROKER',
    regions: ['GLOBAL'],
    regulatedIn: ['CFTC'],
    products: ['FUTURES', 'BONDS'],
    website: 'https://example.com/vantage-loop',
    description: 'Broker globale con focus su futures e bond.'
  }
]

const feeSeed = [
  {
    providerName: 'Orion Desk',
    product: 'CFD',
    makerFeePct: null,
    takerFeePct: null,
    commissionPerTrade: 0,
    fxFeePct: 0.15,
    financingRatePolicy: 'Indice base + 2.2%',
    spreadPolicy: 'variable',
    withdrawalFees: { EUR: 0 },
    sourceUrl: 'https://example.com/docs/orion-fees'
  },
  {
    providerName: 'Orion Desk',
    product: 'FUTURES',
    commissionPerTrade: 1.5,
    minCommission: 1.5,
    fxFeePct: 0.12,
    spreadPolicy: 'variable',
    withdrawalFees: { EUR: 5 },
    sourceUrl: 'https://example.com/docs/orion-futures'
  },
  {
    providerName: 'BlueCove Exchange',
    product: 'CRYPTO',
    makerFeePct: 0.08,
    takerFeePct: 0.12,
    spreadPolicy: 'variable',
    withdrawalFees: { BTC: 0.0004, EUR: 0.8 },
    sourceUrl: 'https://example.com/docs/bluecove-fees'
  },
  {
    providerName: 'Summit Flow',
    product: 'EQUITY_ETF',
    commissionPerTrade: 2.4,
    minCommission: 2.4,
    fxFeePct: 0.1,
    spreadPolicy: 'unknown',
    withdrawalFees: { EUR: 0 },
    sourceUrl: 'https://example.com/docs/summit-equity'
  },
  {
    providerName: 'Summit Flow',
    product: 'BONDS',
    commissionPerTrade: 4.5,
    minCommission: 4.5,
    spreadPolicy: 'unknown',
    withdrawalFees: { EUR: 3 },
    sourceUrl: 'https://example.com/docs/summit-bonds'
  },
  {
    providerName: 'NovaBridge Markets',
    product: 'EQUITY_ETF',
    commissionPerTrade: 1.8,
    minCommission: 1.8,
    fxFeePct: 0.12,
    spreadPolicy: 'unknown',
    withdrawalFees: { USD: 5 },
    sourceUrl: 'https://example.com/docs/novabridge-equity'
  },
  {
    providerName: 'NovaBridge Markets',
    product: 'FUTURES',
    commissionPerTrade: 2.1,
    minCommission: 2.1,
    fxFeePct: 0.18,
    spreadPolicy: 'variable',
    withdrawalFees: { USD: 10 },
    sourceUrl: 'https://example.com/docs/novabridge-futures'
  },
  {
    providerName: 'DeltaHarbor',
    product: 'CRYPTO',
    makerFeePct: 0.09,
    takerFeePct: 0.14,
    spreadPolicy: 'variable',
    withdrawalFees: { EUR: 1.2, BTC: 0.0006 },
    sourceUrl: 'https://example.com/docs/deltaharbor-crypto'
  },
  {
    providerName: 'DeltaHarbor',
    product: 'CFD',
    commissionPerTrade: 0,
    financingRatePolicy: 'Indice base + 2.8%',
    spreadPolicy: 'variable',
    withdrawalFees: { EUR: 4 },
    sourceUrl: 'https://example.com/docs/deltaharbor-cfd'
  },
  {
    providerName: 'Axis Lane',
    product: 'BONDS',
    commissionPerTrade: 5.2,
    minCommission: 5.2,
    spreadPolicy: 'unknown',
    withdrawalFees: { EUR: 2 },
    sourceUrl: 'https://example.com/docs/axis-bonds'
  },
  {
    providerName: 'Axis Lane',
    product: 'EQUITY_ETF',
    commissionPerTrade: 2.9,
    minCommission: 2.9,
    fxFeePct: 0.08,
    spreadPolicy: 'unknown',
    withdrawalFees: { EUR: 0 },
    sourceUrl: 'https://example.com/docs/axis-equity'
  },
  {
    providerName: 'QuantaForge',
    product: 'CFD',
    commissionPerTrade: 0,
    financingRatePolicy: 'Indice base + 3.1%',
    spreadPolicy: 'variable',
    withdrawalFees: { EUR: 6 },
    sourceUrl: 'https://example.com/docs/quanta-cfd'
  },
  {
    providerName: 'QuantaForge',
    product: 'FUTURES',
    commissionPerTrade: 2.7,
    minCommission: 2.7,
    spreadPolicy: 'variable',
    withdrawalFees: { USD: 8 },
    sourceUrl: 'https://example.com/docs/quanta-futures'
  },
  {
    providerName: 'LumenRock',
    product: 'CRYPTO',
    makerFeePct: 0.07,
    takerFeePct: 0.11,
    spreadPolicy: 'variable',
    withdrawalFees: { EUR: 0.7 },
    sourceUrl: 'https://example.com/docs/lumenrock-crypto'
  },
  {
    providerName: 'LumenRock',
    product: 'EQUITY_ETF',
    commissionPerTrade: 2.1,
    minCommission: 2.1,
    fxFeePct: 0.09,
    spreadPolicy: 'unknown',
    withdrawalFees: { EUR: 1 },
    sourceUrl: 'https://example.com/docs/lumenrock-equity'
  },
  {
    providerName: 'CopperGate',
    product: 'CFD',
    commissionPerTrade: 0,
    financingRatePolicy: 'Indice base + 2.6%',
    spreadPolicy: 'variable',
    withdrawalFees: { EUR: 3 },
    sourceUrl: 'https://example.com/docs/coppergate-cfd'
  },
  {
    providerName: 'Vantage Loop',
    product: 'FUTURES',
    commissionPerTrade: 2.4,
    minCommission: 2.4,
    fxFeePct: 0.2,
    spreadPolicy: 'variable',
    withdrawalFees: { USD: 12 },
    sourceUrl: 'https://example.com/docs/vantage-futures'
  },
  {
    providerName: 'Vantage Loop',
    product: 'BONDS',
    commissionPerTrade: 5.7,
    minCommission: 5.7,
    spreadPolicy: 'unknown',
    withdrawalFees: { USD: 6 },
    sourceUrl: 'https://example.com/docs/vantage-bonds'
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  const providerMap = new Map<string, string>()

  for (const provider of providerSeed) {
    const record = await prisma.provider.upsert({
      where: { name: provider.name },
      update: {
        type: provider.type,
        regions: JSON.stringify(provider.regions),
        regulatedIn: JSON.stringify(provider.regulatedIn),
        products: JSON.stringify(provider.products),
        website: provider.website,
        description: provider.description
      },
      create: {
        ...provider,
        regions: JSON.stringify(provider.regions),
        regulatedIn: JSON.stringify(provider.regulatedIn),
        products: JSON.stringify(provider.products)
      }
    })

    providerMap.set(provider.name, record.id)
  }

  for (const fee of feeSeed) {
    const providerId = providerMap.get(fee.providerName)
    if (!providerId) continue

    await prisma.feeSchedule.upsert({
      where: {
        providerId_product_instrument: {
          providerId,
          product: fee.product,
          instrument: 'ALL'
        }
      },
      update: {
        makerFeePct: fee.makerFeePct ?? null,
        takerFeePct: fee.takerFeePct ?? null,
        commissionPerTrade: fee.commissionPerTrade ?? null,
        minCommission: fee.minCommission ?? null,
        fxFeePct: fee.fxFeePct ?? null,
        financingRatePolicy: fee.financingRatePolicy ?? null,
        spreadPolicy: fee.spreadPolicy,
        withdrawalFees: JSON.stringify(fee.withdrawalFees),
        sourceUrl: fee.sourceUrl
      },
      create: {
        providerId,
        product: fee.product,
        instrument: 'ALL',
        makerFeePct: fee.makerFeePct ?? null,
        takerFeePct: fee.takerFeePct ?? null,
        commissionPerTrade: fee.commissionPerTrade ?? null,
        minCommission: fee.minCommission ?? null,
        fxFeePct: fee.fxFeePct ?? null,
        financingRatePolicy: fee.financingRatePolicy ?? null,
        spreadPolicy: fee.spreadPolicy,
        withdrawalFees: JSON.stringify(fee.withdrawalFees),
        sourceUrl: fee.sourceUrl,
        lastVerifiedAt: new Date(),
        notes: 'Dati fittizi per MVP.'
      }
    })
  }

  console.log('✅ Database seeded successfully')
  console.log(`Providers: ${await prisma.provider.count()}`)
  console.log(`Fee schedules: ${await prisma.feeSchedule.count()}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
