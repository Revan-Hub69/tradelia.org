'use client'

import { useState } from 'react'

interface MetricDrawerProps {
  isOpen: boolean
  onClose: () => void
  metricData: any
}

export function MetricDrawer({ isOpen, onClose, metricData }: MetricDrawerProps) {
  const [activeTab, setActiveTab] = useState<'what' | 'why' | 'context' | 'learn' | 'faq'>('what')
  const [userQuestion, setUserQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen || !metricData) return null

  const handleAskAI = async () => {
    if (!userQuestion.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: metricData.metric_id,
          topic_title: getMetricTitle(metricData.metric_id),
          context: {
            asof: metricData.asof,
            state: metricData.state || metricData.bucket,
            drivers: metricData.drivers || [],
            quality: {
              freshness: 'T-0',
              confidence_bucket: metricData.confidence_bucket || 'Med'
            }
          },
          user_question: userQuestion,
          mode: 'faq',
          constraints: {
            language: 'it',
            style: 'academic_clear',
            no_advice: true,
            no_predictions: true,
            scope_only_topic: true
          }
        })
      })

      const data = await response.json()
      setAiResponse(data)
      setUserQuestion('')
    } catch (error) {
      console.error('AI request failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricTitle = (id: string) => {
    switch (id) {
      case 'market_regime': return 'Market Regime (Risk-On/Risk-Off)'
      case 'btc_dominance': return 'BTC Dominance'
      case 'vol_regime': return 'Volatility Regime'
      default: return 'Metric'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'what':
        return (
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Current State</span>
                <span className="text-slate-200 font-medium">
                  {metricData.state || metricData.bucket}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">As of</span>
                <span className="text-xs text-slate-500">
                  {new Date(metricData.asof).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Confidence</span>
                <span className={`text-sm ${
                  metricData.confidence_bucket === 'High' ? 'text-green-400' : 
                  metricData.confidence_bucket === 'Med' ? 'text-yellow-400' : 
                  'text-red-400'
                }`}>
                  {metricData.confidence_bucket || 'Med'}
                </span>
              </div>
            </div>

            <div className="text-slate-300 space-y-3">
              {metricData.metric_id === 'market_regime' && (
                <>
                  <p>Market Regime indica lo stato generale del mercato crypto in termini di propensione al rischio.</p>
                  <p><strong>Risk-On:</strong> Mercato in fase espansiva, breadth positivo, bassa dispersione.</p>
                  <p><strong>Risk-Off:</strong> Mercato in contrazione, flight to quality, alta dispersione.</p>
                  <p><strong>Neutral:</strong> Mercato in fase di transizione o consolidamento.</p>
                </>
              )}
              {metricData.metric_id === 'btc_dominance' && (
                <>
                  <p>BTC Dominance misura la quota di mercato di Bitcoin rispetto al totale crypto market cap.</p>
                  <p>Dominance in aumento indica rotazione verso BTC (risk-off crypto).</p>
                  <p>Dominance in calo indica rotazione verso altcoin (risk-on crypto / alt season).</p>
                </>
              )}
              {metricData.metric_id === 'vol_regime' && (
                <>
                  <p>Volatility Regime classifica il livello di volatilità corrente rispetto alla distribuzione storica.</p>
                  <p><strong>Compressed:</strong> Volatilità sotto il 25° percentile (calma prima della tempesta).</p>
                  <p><strong>Normal:</strong> Volatilità tra 25° e 75° percentile.</p>
                  <p><strong>Elevated:</strong> Volatilità sopra il 75° percentile (stress di mercato).</p>
                </>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400">
                <strong>Limitations:</strong> Regime detection is backward-looking. Transitions may occur without warning.
              </p>
            </div>
          </div>
        )

      case 'why':
        return (
          <div className="space-y-4 text-slate-300">
            <h4 className="text-lg font-medium text-slate-200">Meccanismi e Driver</h4>
            
            {metricData.metric_id === 'market_regime' && (
              <>
                <p>Il regime di mercato è determinato da:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li><strong>Market Breadth:</strong> Percentuale di asset in trend positivo</li>
                  <li><strong>Dispersion:</strong> Spread dei rendimenti cross-asset</li>
                  <li><strong>Relative Volatility:</strong> Vol corrente vs media mobile</li>
                  <li><strong>Correlation Structure:</strong> Co-movement tra asset</li>
                </ul>
                <p className="mt-4">
                  <strong>Driver attivi:</strong> {metricData.drivers?.join(', ') || 'N/A'}
                </p>
              </>
            )}

            {metricData.metric_id === 'btc_dominance' && (
              <>
                <p>La dominance shift è guidata da:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li><strong>Risk Appetite:</strong> Rotazione BTC ↔ ALT basata su propensione al rischio</li>
                  <li><strong>Narrative Cycles:</strong> Hype su nuovi progetti vs Bitcoin as store of value</li>
                  <li><strong>Liquidity Flows:</strong> Capital rotation tra asset classes crypto</li>
                </ul>
              </>
            )}

            {metricData.metric_id === 'vol_regime' && (
              <>
                <p>Volatility clustering è un fenomeno empirico robusto:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li><strong>GARCH Effects:</strong> Periodi di alta volatilità tendono a persistere</li>
                  <li><strong>Leverage Cycles:</strong> Liquidazioni amplificano movimenti</li>
                  <li><strong>Information Shocks:</strong> News e eventi macro creano spike</li>
                </ul>
              </>
            )}
          </div>
        )

      case 'context':
        return (
          <div className="space-y-4 text-slate-300">
            <h4 className="text-lg font-medium text-slate-200">Interpretazione Contestuale</h4>
            
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Nel regime corrente:</p>
              <p className="text-slate-300">
                {metricData.state === 'Risk-On' && 'Ambiente favorevole per posizioni direzionali, ma attenzione a segnali di esaurimento.'}
                {metricData.state === 'Risk-Off' && 'Ambiente difensivo: ridurre esposizione, focus su capital preservation.'}
                {metricData.state === 'Neutral' && 'Fase di transizione: attendere conferma direzionale prima di aumentare esposizione.'}
                {metricData.bucket === 'Elevated' && 'Alta volatilità: ridurre size, ampliare stop loss, evitare leva eccessiva.'}
                {metricData.bucket === 'Compressed' && 'Bassa volatilità: possibile breakout imminente, preparare strategie direzionali.'}
                {metricData.bucket === 'Normal' && 'Volatilità normale: condizioni standard per operatività.'}
              </p>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-medium text-red-400 mb-2">Quando è ingannevole:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                <li>Durante transizioni di regime (segnali misti)</li>
                <li>In presenza di eventi idiosincratici (hack, regulation)</li>
                <li>Con bassa liquidità (weekend, festività)</li>
              </ul>
            </div>
          </div>
        )

      case 'learn':
        return (
          <div className="space-y-4 text-slate-300">
            <h4 className="text-lg font-medium text-slate-200">Metodologia e Riferimenti</h4>
            
            {metricData.metric_id === 'market_regime' && (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-medium text-slate-200 mb-2">Base Accademica</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                    <li>Hamilton (1989) - Markov Switching Models</li>
                    <li>Ang & Bekaert (2002) - Regime Switches in Interest Rates</li>
                    <li>Guidolin & Timmermann (2008) - Asset Allocation under Regime Switching</li>
                  </ul>
                </div>
                <p className="text-sm">
                  Il modello aggrega 4 dimensioni quantitative per classificare lo stato del mercato in 3 regimi discreti.
                  Non è un modello predittivo, ma descrittivo dello stato corrente.
                </p>
              </>
            )}

            {metricData.metric_id === 'btc_dominance' && (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-medium text-slate-200 mb-2">Base Accademica</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                    <li>O'Hara (1995) - Market Microstructure Theory</li>
                    <li>Liu & Tsyvinski (2021) - Risks and Returns of Cryptocurrency</li>
                  </ul>
                </div>
                <p className="text-sm">
                  Dominance = BTC Market Cap / Total Crypto Market Cap. 
                  Threshold empirici: &gt;60% = BTC dominance, &lt;40% = ALT season, 40-60% = neutral.
                </p>
              </>
            )}

            {metricData.metric_id === 'vol_regime' && (
              <>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm font-medium text-slate-200 mb-2">Base Accademica</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                    <li>Engle (1982) - Autoregressive Conditional Heteroskedasticity</li>
                    <li>Bollerslev (1986) - Generalized GARCH</li>
                  </ul>
                </div>
                <p className="text-sm">
                  Volatilità realizzata (rolling 30d) confrontata con distribuzione storica (365d).
                  Classificazione basata su percentili: p25, p50, p75.
                </p>
              </>
            )}
          </div>
        )

      case 'faq':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-200">Ask AI</h4>
            
            <div className="space-y-3">
              <textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Es: Cosa significa Risk-On in questo momento?"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
              />
              
              <button
                onClick={handleAskAI}
                disabled={loading || !userQuestion.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Thinking...' : '🤖 Ask AI'}
              </button>
            </div>

            {aiResponse && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-2">Answer:</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{aiResponse.answer}</p>
                </div>

                {aiResponse.evidence && aiResponse.evidence.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-200 mb-2">Evidence:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-sm">
                      {aiResponse.evidence.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResponse.limitations && aiResponse.limitations.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3">
                    <p className="text-xs font-medium text-amber-400 mb-1">Limitations:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-400/80 text-xs">
                      {aiResponse.limitations.map((l: string, i: number) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                  AI-generated • Educational only • No financial advice
                </div>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-xs text-blue-400">
                <strong>Suggested questions:</strong> "Quando cambia il regime?", "Cosa guardare ora?", "Quali sono i limiti?"
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center">
      <div className="w-full md:max-w-3xl md:mx-auto bg-slate-900 md:rounded-2xl border-t md:border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <h3 className="text-xl font-medium text-slate-200">
            {getMetricTitle(metricData.metric_id)}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
            {(['what', 'why', 'context', 'learn', 'faq'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'what' && 'What'}
                {tab === 'why' && 'Why'}
                {tab === 'context' && 'Context'}
                {tab === 'learn' && 'Learn'}
                {tab === 'faq' && 'FAQ (AI)'}
              </button>
            ))}
          </div>

          <div className="min-h-[300px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}