/**
 * Groq AI Assistant
 * 
 * Integrazione con Groq AI per analisi intelligente dei dati di trading
 * 
 * Funzionalità:
 * - Analisi completa dei dati del dashboard
 * - Interpretazione dei segnali
 * - Raccomandazioni basate su tutti i dati
 * - Spiegazioni accademiche degli indicatori
 * 
 * Docs: https://console.groq.com/docs
 */

export interface DashboardData {
  marketData?: {
    price: number;
    change24hPercent: number;
    supportResistance: Array<{
      type: 'support' | 'resistance';
      price: number;
      strength: string;
      distancePercent: number;
    }>;
    pressure: {
      buying: number;
      selling: number;
      overall: number;
      strength: string;
    };
  };
  futuresData?: {
    fundingRate: number;
    openInterest: number;
    longShortRatio: number;
    liquidationRisk: 'low' | 'medium' | 'high' | 'very-high';
    leverageMetrics: {
      recommendedLeverage: number;
      maxSafeLeverage: number;
    };
  };
  orderFlow?: {
    indicators: {
      delta: {
        deltaPercent: number;
        signal: string;
      };
      takerRatio: {
        ratio: number;
      };
      orderBookImbalance: {
        imbalancePercent: number;
      };
    };
    combinedSignal: {
      signal: string;
      confidence: number;
      reasons: string[];
    };
  };
  liquidations?: {
    liquidationClusters: Array<{
      leverage: number;
      risk: string;
      longLiquidationPrice: number;
      shortLiquidationPrice: number;
    }>;
  };
  multiTimeframe?: {
    analysis: {
      consensus: string;
      alignment: number;
      consensusConfidence: number;
      recommendation: string;
    };
    timeframes: Array<{
      timeframe: string;
      signal: string;
      confidence: number;
      trend: string;
    }>;
  };
  decision?: {
    recommendation: 'LONG' | 'SHORT' | 'NEUTRAL' | 'AVOID';
    confidence: 'low' | 'medium' | 'high';
    reasoning: string[];
    entryPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    recommendedLeverage: number;
    riskLevel: string;
  };
  performance?: {
    winRate: number;
    profitFactor: number;
    totalPnL: number;
    maxDrawdownPercent: number;
  };
}

export interface AIAnalysis {
  summary: string;
  interpretation: string;
  recommendation: string;
  confidence: number;
  keyInsights: string[];
  risks: string[];
  opportunities: string[];
  academicExplanation: string;
  dataQuality: {
    completeness: number;
    reliability: number;
    timeliness: number;
    notes: string[];
  };
}

/**
 * Analizza tutti i dati del dashboard con Groq AI
 */
export async function analyzeDashboardWithAI(
  data: DashboardData,
  symbol: string
): Promise<AIAnalysis> {
  const groqApiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    // Fallback: analisi locale senza AI
    return generateLocalAnalysis(data, symbol);
  }

  try {
    const prompt = buildAnalysisPrompt(data, symbol);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile', // Fast and accurate
        messages: [
          {
            role: 'system',
            content: `Sei un esperto analista quantitativo di criptovalute con background accademico in finanza quantitativa, statistica e machine learning. 
Analizza i dati di trading forniti e fornisci:
1. Un riepilogo conciso della situazione
2. Interpretazione accademica dei segnali
3. Raccomandazione chiara con confidenza
4. Insight chiave basati su evidenze
5. Rischio identificati
6. Opportunità
7. Spiegazione accademica degli indicatori usati
8. Valutazione qualità dati

Usa terminologia tecnica ma accessibile. Cita principi accademici quando rilevanti.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower for more consistent analysis
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content || '';

    // Parse AI response into structured format
    return parseAIResponse(aiResponse, data);
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    // Fallback to local analysis
    return generateLocalAnalysis(data, symbol);
  }
}

function buildAnalysisPrompt(data: DashboardData, symbol: string): string {
  const parts: string[] = [];

  parts.push(`Analizza i dati di trading per ${symbol}:`);
  parts.push('');

  if (data.marketData) {
    parts.push(`PREZZO: $${data.marketData.price.toFixed(2)} (${data.marketData.change24hPercent >= 0 ? '+' : ''}${data.marketData.change24hPercent.toFixed(2)}% 24h)`);
    parts.push(`PRESSIONE MERCATO: ${(data.marketData.pressure.overall * 100).toFixed(1)}% (${data.marketData.pressure.strength})`);
    parts.push(`SUPPORTI/RESISTENZE: ${data.marketData.supportResistance.length} livelli identificati`);
  }

  if (data.futuresData) {
    parts.push(`FUNDING RATE: ${data.futuresData.fundingRate >= 0 ? '+' : ''}${data.futuresData.fundingRate.toFixed(4)}%`);
    parts.push(`OPEN INTEREST: $${(data.futuresData.openInterest / 1e9).toFixed(2)}B`);
    parts.push(`LONG/SHORT RATIO: ${data.futuresData.longShortRatio.toFixed(2)}`);
    parts.push(`RISCHIO LIQUIDAZIONE: ${data.futuresData.liquidationRisk}`);
    parts.push(`LEVERAGE CONSIGLIATO: ${data.futuresData.leverageMetrics.recommendedLeverage}x`);
  }

  if (data.orderFlow) {
    parts.push(`ORDER FLOW DELTA: ${data.orderFlow.indicators.delta.deltaPercent.toFixed(2)}% (${data.orderFlow.indicators.delta.signal})`);
    parts.push(`TAKER RATIO: ${data.orderFlow.indicators.takerRatio.ratio.toFixed(2)}`);
    parts.push(`ORDER BOOK IMBALANCE: ${data.orderFlow.indicators.orderBookImbalance.imbalancePercent.toFixed(2)}%`);
    parts.push(`COMBINED SIGNAL: ${data.orderFlow.combinedSignal.signal} (${data.orderFlow.combinedSignal.confidence}% confidence)`);
  }

  if (data.multiTimeframe) {
    parts.push(`MULTI-TIMEFRAME CONSENSUS: ${data.multiTimeframe.analysis.consensus} (${data.multiTimeframe.analysis.alignment.toFixed(1)}% alignment)`);
    parts.push(`TIMEFRAMES: ${data.multiTimeframe.timeframes.map(tf => `${tf.timeframe}: ${tf.signal} (${tf.confidence}%)`).join(', ')}`);
  }

  if (data.decision) {
    parts.push(`DECISIONE: ${data.decision.recommendation} (${data.decision.confidence} confidence)`);
    parts.push(`RAGIONAMENTO: ${data.decision.reasoning.join('; ')}`);
    if (data.decision.entryPrice) {
      parts.push(`ENTRY: $${data.decision.entryPrice.toFixed(2)} | STOP: $${data.decision.stopLoss?.toFixed(2) || 'N/A'} | TP: $${data.decision.takeProfit?.toFixed(2) || 'N/A'}`);
    }
  }

  if (data.performance) {
    parts.push(`PERFORMANCE: Win Rate ${data.performance.winRate.toFixed(1)}% | Profit Factor ${data.performance.profitFactor.toFixed(2)} | P&L ${data.performance.totalPnL >= 0 ? '+' : ''}$${data.performance.totalPnL.toFixed(2)}`);
  }

  parts.push('');
  parts.push('Fornisci analisi completa in formato JSON strutturato.');

  return parts.join('\n');
}

function parseAIResponse(response: string, data: DashboardData): AIAnalysis {
  // Try to extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Analisi completata',
        interpretation: parsed.interpretation || '',
        recommendation: parsed.recommendation || '',
        confidence: parsed.confidence || 50,
        keyInsights: parsed.keyInsights || [],
        risks: parsed.risks || [],
        opportunities: parsed.opportunities || [],
        academicExplanation: parsed.academicExplanation || '',
        dataQuality: parsed.dataQuality || {
          completeness: 80,
          reliability: 75,
          timeliness: 90,
          notes: [],
        },
      };
    } catch (e) {
      // Fall through to text parsing
    }
  }

  // Fallback: parse from text
  return {
    summary: response.substring(0, 200) + '...',
    interpretation: response,
    recommendation: data.decision?.recommendation || 'NEUTRAL',
    confidence: data.decision?.confidence === 'high' ? 80 : data.decision?.confidence === 'medium' ? 60 : 40,
    keyInsights: extractInsights(response),
    risks: extractRisks(response),
    opportunities: extractOpportunities(response),
    academicExplanation: extractAcademicExplanation(response),
    dataQuality: assessDataQuality(data),
  };
}

function extractInsights(text: string): string[] {
  const insights: string[] = [];
  const insightPatterns = [
    /(?:insight|key point|importante|nota)[:]\s*(.+?)(?:\.|$)/gi,
    /(?:•|[-*])\s*(.+?)(?:\.|$)/g,
  ];

  insightPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && insights.length < 5) {
        insights.push(match[1].trim());
      }
    }
  });

  return insights.length > 0 ? insights : ['Analisi in corso...'];
}

function extractRisks(text: string): string[] {
  const risks: string[] = [];
  const riskPatterns = [
    /(?:rischio|risk|attenzione|warning)[:]\s*(.+?)(?:\.|$)/gi,
    /⚠️\s*(.+?)(?:\.|$)/g,
  ];

  riskPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && risks.length < 5) {
        risks.push(match[1].trim());
      }
    }
  });

  return risks.length > 0 ? risks : ['Nessun rischio critico identificato'];
}

function extractOpportunities(text: string): string[] {
  const opportunities: string[] = [];
  const oppPatterns = [
    /(?:opportunità|opportunity|possibilità)[:]\s*(.+?)(?:\.|$)/gi,
    /💡\s*(.+?)(?:\.|$)/g,
  ];

  oppPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && opportunities.length < 5) {
        opportunities.push(match[1].trim());
      }
    }
  });

  return opportunities.length > 0 ? opportunities : ['Monitorare setup migliori'];
}

function extractAcademicExplanation(text: string): string {
  const academicPatterns = [
    /(?:spiegazione|explanation|principio|teoria)[:]\s*(.+?)(?:\.|$)/gi,
    /(?:secondo|basato su|principio di)\s+(.+?)(?:\.|$)/gi,
  ];

  for (const pattern of academicPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Analisi basata su indicatori quantitativi standard (RSI, MACD, Order Flow, Volume Profile)';
}

function assessDataQuality(data: DashboardData): {
  completeness: number;
  reliability: number;
  timeliness: number;
  notes: string[];
} {
  const notes: string[] = [];
  let completeness = 0;
  let reliability = 0;
  let timeliness = 100; // Assume real-time

  const dataPoints = [
    { name: 'Market Data', present: !!data.marketData },
    { name: 'Futures Data', present: !!data.futuresData },
    { name: 'Order Flow', present: !!data.orderFlow },
    { name: 'Liquidations', present: !!data.liquidations },
    { name: 'Multi-Timeframe', present: !!data.multiTimeframe },
    { name: 'Decision', present: !!data.decision },
  ];

  const presentCount = dataPoints.filter(dp => dp.present).length;
  completeness = (presentCount / dataPoints.length) * 100;

  if (completeness < 50) {
    notes.push('Dati incompleti - analisi limitata');
  }

  // Reliability based on data consistency
  if (data.decision && data.orderFlow) {
    const signalMatch = 
      (data.decision.recommendation === 'LONG' && data.orderFlow.combinedSignal.signal.includes('BUY')) ||
      (data.decision.recommendation === 'SHORT' && data.orderFlow.combinedSignal.signal.includes('SELL'));
    
    reliability = signalMatch ? 85 : 70;
  } else {
    reliability = 75;
  }

  if (reliability < 70) {
    notes.push('Segnali potenzialmente inconsistenti');
  }

  return { completeness, reliability, timeliness, notes };
}

function generateLocalAnalysis(data: DashboardData, symbol: string): AIAnalysis {
  // Fallback analysis without AI
  const insights: string[] = [];
  const risks: string[] = [];
  const opportunities: string[] = [];

  if (data.decision) {
    if (data.decision.recommendation === 'LONG') {
      opportunities.push('Segnale rialzista identificato');
      if (data.decision.confidence === 'high') {
        insights.push('Alta confidenza nel segnale LONG');
      }
    } else if (data.decision.recommendation === 'SHORT') {
      opportunities.push('Segnale ribassista identificato');
    } else if (data.decision.recommendation === 'AVOID') {
      risks.push('Rischio elevato - evitare posizioni');
    }
  }

  if (data.futuresData?.liquidationRisk === 'very-high' || data.futuresData?.liquidationRisk === 'high') {
    risks.push(`Rischio liquidazione ${data.futuresData.liquidationRisk}`);
  }

  if (data.orderFlow?.combinedSignal.confidence && data.orderFlow.combinedSignal.confidence >= 80) {
    insights.push(`Order flow mostra segnale forte (${data.orderFlow.combinedSignal.confidence}% confidence)`);
  }

  if (data.multiTimeframe?.analysis.alignment && data.multiTimeframe.analysis.alignment >= 75) {
    insights.push(`Allineamento multi-timeframe elevato (${data.multiTimeframe.analysis.alignment.toFixed(1)}%)`);
  }

  return {
    summary: `Analisi ${symbol}: ${data.decision?.recommendation || 'NEUTRAL'} con confidenza ${data.decision?.confidence || 'low'}`,
    interpretation: data.decision?.reasoning.join(' ') || 'Analisi in corso',
    recommendation: data.decision?.recommendation || 'NEUTRAL',
    confidence: data.decision?.confidence === 'high' ? 80 : data.decision?.confidence === 'medium' ? 60 : 40,
    keyInsights: insights.length > 0 ? insights : ['Monitorare setup migliori'],
    risks: risks.length > 0 ? risks : ['Rischi standard di mercato'],
    opportunities: opportunities.length > 0 ? opportunities : ['Attendere setup più chiari'],
    academicExplanation: 'Analisi basata su indicatori quantitativi: Order Flow (Delta, CVD), Support/Resistance (Order Book Depth), Futures Sentiment (Funding Rate, OI), Multi-Timeframe Consensus.',
    dataQuality: assessDataQuality(data),
  };
}

