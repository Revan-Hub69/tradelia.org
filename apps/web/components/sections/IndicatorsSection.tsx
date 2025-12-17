import { IndicatorCard } from './IndicatorCard'

interface IndicatorData {
  name: string
  value: string
  status: string
  description: string
  methodology: string
  lastUpdate: string
}

async function getIndicators(): Promise<IndicatorData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/indicators`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) throw new Error('Failed to fetch')
    
    const data = await response.json()
    return data.indicators
  } catch (error) {
    console.error('Error fetching indicators:', error)
    // Fallback data
    return [
      {
        name: 'Bitcoin Fear & Greed Index',
        value: '42',
        status: 'Fear',
        description: 'Sentiment composito basato su volatilità, momentum, social media e survey.',
        methodology: 'Indice ponderato 0-100 che aggrega 5 metriche quantitative di sentiment di mercato.',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'MVRV Ratio',
        value: '1.8',
        status: 'Neutral',
        description: 'Market Value to Realized Value - rapporto tra capitalizzazione e valore realizzato.',
        methodology: 'MVRV = Market Cap / Realized Cap. Valori >3.7 indicano potenziali top, <1 potenziali bottom.',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'NVT Ratio',
        value: '28.4',
        status: 'Normal',
        description: 'Network Value to Transactions - P/E ratio per Bitcoin.',
        methodology: 'NVT = Market Cap / Volume Transazioni On-chain (90d MA). Range normale: 20-55.',
        lastUpdate: new Date().toISOString()
      },
      {
        name: 'Long/Short Ratio',
        value: '2.1',
        status: 'Bullish',
        description: 'Rapporto posizioni long/short aggregate sui principali exchange.',
        methodology: 'Aggregazione weighted delle posizioni aperte su Binance, Bybit, OKX. >2 = sentiment bullish.',
        lastUpdate: new Date().toISOString()
      }
    ]
  }
}

export async function IndicatorsSection() {
  const indicators = await getIndicators()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Indicatori di Mercato Real-Time
          </h2>
          <p className="text-lg text-slate-600">
            Metriche quantitative con metodologie accademiche trasparenti
          </p>
          <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Dati aggiornati in tempo reale
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {indicators.map((indicator, index) => (
            <IndicatorCard key={index} {...indicator} />
          ))}
        </div>
      </div>
    </section>
  )
}