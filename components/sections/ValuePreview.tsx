'use client'

import { useState } from 'react'
import { MarketMoodGauge } from '@/components/metrics/MarketMoodGauge'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  metricId: string
  visualType: string
}

function MetricDrawer({ isOpen, onClose, metricId, visualType }: DrawerProps) {
  const [activeTab, setActiveTab] = useState<'meaning' | 'method' | 'limits' | 'faq'>('meaning')
  const [aiResponse, setAiResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleAIQuestion = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_id: metricId,
          visual_type: visualType,
          allowed_scope: 'interpretation_only',
          no_advice: true,
          question: 'Spiega questo indicatore in modo accademico'
        })
      })
      
      const data = await response.json()
      setAiResponse(data.explanation || 'Spiegazione non disponibile')
    } catch (error) {
      setAiResponse('Errore nel caricamento della spiegazione AI')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-t-2xl border-t border-slate-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-slate-200">Market Mood</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>

          <div className="flex gap-4 mb-6 border-b border-slate-700">
            {(['meaning', 'method', 'limits', 'faq'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'meaning' && 'Cosa significa'}
                {tab === 'method' && 'Metodo'}
                {tab === 'limits' && 'Limiti'}
                {tab === 'faq' && 'FAQ (AI)'}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'meaning' && (
              <div className="text-slate-300 space-y-3">
                <p>Il Market Mood rappresenta il regime di rischio generale del mercato crypto.</p>
                <p>Non è un timing tool, ma un indicatore di contesto per valutare l'ambiente operativo.</p>
              </div>
            )}

            {activeTab === 'method' && (
              <div className="text-slate-300 space-y-3">
                <p>Aggregazione di:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Market breadth (% asset in trend positivo)</li>
                  <li>Dispersione rendimenti cross-asset</li>
                  <li>Volatilità relativa</li>
                  <li>Correlazione inter-mercato</li>
                </ul>
              </div>
            )}

            {activeTab === 'limits' && (
              <div className="text-slate-300 space-y-3">
                <p>Limitazioni metodologiche:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Non predice cambi di regime</li>
                  <li>Può rimanere in uno stato per settimane</li>
                  <li>Sensibile a shock idiosincratici</li>
                </ul>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                <button
                  onClick={handleAIQuestion}
                  disabled={loading}
                  className="btn-secondary text-sm"
                >
                  {loading ? 'Caricamento...' : '🤖 Chiedi all\'AI'}
                </button>
                
                {aiResponse && (
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-300 text-sm leading-relaxed">{aiResponse}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      Generato da AI • Non costituisce consulenza finanziaria
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ValuePreview() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <section className="py-24 relative">
      <div className="section-divider mb-24"></div>
      
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-16">
          <h2 className="text-4xl font-light text-gradient mb-6">
            Anteprima del valore
          </h2>
          <p className="text-xl text-slate-400 font-light">
            Un esempio di come Tradelia analizza il mercato
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div onClick={() => setDrawerOpen(true)} className="cursor-pointer">
            <MarketMoodGauge 
              state="Risk-On" 
              direction="up" 
              confidence={0.78} 
            />
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Clicca per esplorare metodologia e limiti
          </p>
        </div>

        <div className="bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-8">
          <h3 className="text-2xl font-light text-slate-200 mb-4">
            Accedi al dashboard completo
          </h3>
          <p className="text-slate-400 mb-6">
            6 metriche scientifiche • Spiegazioni AI • Metodologie trasparenti
          </p>
          <button className="btn-primary">
            Inizia gratis
          </button>
        </div>
      </div>

      <MetricDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        metricId="market_mood"
        visualType="gauge"
      />
    </section>
  )
}