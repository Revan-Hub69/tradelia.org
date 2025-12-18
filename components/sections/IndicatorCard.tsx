'use client'

import { useState } from 'react'
import { Card, CardHeader, CardContent } from '../ui/Card'

interface IndicatorCardProps {
  name: string
  value: string
  status: string
  description: string
  methodology: string
  lastUpdate: string
}

export function IndicatorCard({ name, value, status, description, methodology, lastUpdate }: IndicatorCardProps) {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase()
    if (lower.includes('fear') || lower.includes('bearish') || lower.includes('oversold')) return 'text-red-600'
    if (lower.includes('greed') || lower.includes('bullish') || lower.includes('overbought')) return 'text-green-600'
    return 'text-blue-600'
  }

  const handleAiExplanation = async () => {
    if (aiExplanation) {
      setAiExplanation(null)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indicator: name, value, status })
      })

      if (response.ok) {
        const data = await response.json()
        setAiExplanation(data.explanation)
      } else {
        setAiExplanation('Spiegazione AI temporaneamente non disponibile.')
      }
    } catch (error) {
      setAiExplanation('Errore nel caricamento della spiegazione AI.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-slate-900">{name}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{value}</div>
            <div className={`text-sm font-medium ${getStatusColor(status)}`}>{status}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 mb-3">{description}</p>
        
        <div className="space-y-3">
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
              Metodologia
            </summary>
            <p className="mt-2 text-slate-500">{methodology}</p>
          </details>

          <button
            onClick={handleAiExplanation}
            disabled={loading}
            className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Caricamento...' : aiExplanation ? 'Nascondi Analisi AI' : '🤖 Analisi AI'}
          </button>

          {aiExplanation && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-slate-700">{aiExplanation}</p>
              <div className="text-xs text-slate-500 mt-2">
                Generato da AI • Non costituisce consulenza finanziaria
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-400 mt-3">
          Ultimo aggiornamento: {new Date(lastUpdate).toLocaleString('it-IT')}
        </div>
      </CardContent>
    </Card>
  )
}