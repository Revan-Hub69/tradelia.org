/**
 * AI Assistant Component
 * 
 * Componente per interagire con Groq AI per analisi intelligente
 */

'use client';

import { useState, useEffect } from 'react';
import { analyzeDashboardWithAI, type DashboardData, type AIAnalysis } from '@/lib/ai/groq-assistant';
import { Sparkles, Loader2, AlertCircle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

interface AIAssistantProps {
  dashboardData: DashboardData;
  symbol: string;
  onAnalysisUpdate?: (analysis: AIAnalysis) => void;
}

export function AIAssistant({ dashboardData, symbol, onAnalysisUpdate }: AIAssistantProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dashboardData, symbol }),
      });

      if (!response.ok) {
        throw new Error('Errore nell\'analisi AI');
      }

      const result = await response.json();
      setAnalysis(result.analysis);
      onAnalysisUpdate?.(result.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      console.error('AI analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-analyze when data changes
    if (dashboardData && symbol) {
      const timer = setTimeout(fetchAnalysis, 1000); // Debounce
      return () => clearTimeout(timer);
    }
  }, [symbol]); // Only re-analyze on symbol change

  if (!analysis && !loading && !error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <button
          onClick={fetchAnalysis}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Sparkles className="w-5 h-5" />
          <span>Analizza con AI</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            AI Assistant
          </h3>
          {analysis && (
            <span className={`px-2 py-1 text-xs rounded ${
              analysis.confidence >= 80 ? 'bg-green-100 text-green-800' :
              analysis.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {analysis.confidence}% confidence
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchAnalysis();
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
            disabled={loading}
          >
            {loading ? 'Analizzando...' : 'Rianalizza'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {analysis && (
        <div className={`${expanded ? '' : 'max-h-96 overflow-y-auto'}`}>
          {/* Summary */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              {analysis.recommendation.includes('LONG') || analysis.recommendation.includes('BUY') ? (
                <TrendingUp className="w-5 h-5 text-green-600 mt-1" />
              ) : analysis.recommendation.includes('SHORT') || analysis.recommendation.includes('SELL') ? (
                <TrendingDown className="w-5 h-5 text-red-600 mt-1" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-gray-600 mt-1" />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{analysis.summary}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{analysis.interpretation}</p>
              </div>
            </div>
          </div>

          {expanded && (
            <>
              {/* Key Insights */}
              {analysis.keyInsights.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Key Insights
                  </h4>
                  <ul className="space-y-1">
                    {analysis.keyInsights.map((insight, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risks */}
              {analysis.risks.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">Rischi</h4>
                  <ul className="space-y-1">
                    {analysis.risks.map((risk, i) => (
                      <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Opportunities */}
              {analysis.opportunities.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-green-600 mb-2">Opportunità</h4>
                  <ul className="space-y-1">
                    {analysis.opportunities.map((opp, i) => (
                      <li key={i} className="text-sm text-green-600 dark:text-green-400 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 mt-0.5" />
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Academic Explanation */}
              {analysis.academicExplanation && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Spiegazione Accademica
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {analysis.academicExplanation}
                  </p>
                </div>
              )}

              {/* Data Quality */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Qualità Dati
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Completeness</div>
                    <div className={`text-lg font-bold ${
                      analysis.dataQuality.completeness >= 80 ? 'text-green-600' :
                      analysis.dataQuality.completeness >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysis.dataQuality.completeness.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Reliability</div>
                    <div className={`text-lg font-bold ${
                      analysis.dataQuality.reliability >= 80 ? 'text-green-600' :
                      analysis.dataQuality.reliability >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysis.dataQuality.reliability.toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Timeliness</div>
                    <div className={`text-lg font-bold ${
                      analysis.dataQuality.timeliness >= 90 ? 'text-green-600' :
                      analysis.dataQuality.timeliness >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {analysis.dataQuality.timeliness.toFixed(0)}%
                    </div>
                  </div>
                </div>
                {analysis.dataQuality.notes.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {analysis.dataQuality.notes.join('; ')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

