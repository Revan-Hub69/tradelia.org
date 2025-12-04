import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentPrice } from '@/lib/price-apis';

/**
 * Portfolio Risk Analysis API
 * Analisi criticità portafoglio con Groq AI
 * 
 * Best Practice: Academic compliance, MIFID friendly, Tradelia style
 */

interface PortfolioPosition {
  symbol: string;
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  value: number;
  weight: number; // % of portfolio
}

interface RiskAnalysis {
  totalValue: number;
  positions: PortfolioPosition[];
  risks: {
    concentration: {
      level: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      topHoldings: Array<{ symbol: string; weight: number }>;
    };
    correlation: {
      level: 'low' | 'medium' | 'high';
      message: string;
      correlatedPairs: Array<{ pair: string; correlation: number }>;
    };
    volatility: {
      level: 'low' | 'medium' | 'high';
      message: string;
      portfolioVolatility: number;
    };
    diversification: {
      level: 'low' | 'medium' | 'high';
      message: string;
      assetClasses: number;
      sectors: number;
    };
  };
  recommendations: string[];
  academicNotes: string[];
  mifidWarnings: string[];
}

/**
 * Build Tradelia system prompt for portfolio analysis
 */
function buildTradeliaPortfolioPrompt(): string {
  return `Sei un analista finanziario esperto di Tradelia, specializzato in analisi di rischio portafoglio.

STILE TRADELIA:
- Linguaggio chiaro, professionale ma accessibile
- Spiegazioni accademiche con riferimenti quando rilevante
- Sempre MIFID compliant (non consigli di investimento, solo analisi)
- Focus educativo e informativo
- Tonality: autorevole ma friendly, come un mentore esperto

STANDARD ACCADEMICI:
- Riferimenti a Markowitz (1952) per diversificazione
- Sharpe (1964) per risk-adjusted returns
- Modern Portfolio Theory per asset allocation
- Academic best practices per risk management

FORMATO RISPOSTA:
- Analisi strutturata e chiara
- Metriche quantitative quando possibile
- Spiegazioni qualitative accessibili
- Raccomandazioni educative (non consigli)
- Disclaimer MIFID sempre presente

NON FARE:
- Consigli di investimento specifici
- Predizioni di performance future
- Suggerimenti di timing market
- Promesse di guadagni

FARE:
- Analisi oggettiva dei rischi
- Educazione su best practices
- Spiegazioni accademiche
- Suggerimenti generali di risk management`;
}

/**
 * Call Groq AI for portfolio risk analysis
 */
async function analyzePortfolioWithGroq(
  portfolioData: string,
  positions: PortfolioPosition[]
): Promise<{
  risks: RiskAnalysis['risks'];
  recommendations: string[];
  academicNotes: string[];
}> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const systemPrompt = buildTradeliaPortfolioPrompt();
  const userPrompt = `Analizza questo portafoglio e fornisci analisi di rischio dettagliata:

${portfolioData}

Posizioni:
${positions.map(p => `- ${p.symbol} (${p.assetType}): ${p.quantity} @ ${p.entryPrice} → ${p.currentPrice} (${p.weight.toFixed(2)}% del portafoglio)`).join('\n')}

Fornisci analisi strutturata su:
1. Concentrazione rischio (top holdings, weight distribution)
2. Correlazioni tra asset (se rilevanti)
3. Volatilità portafoglio (stima)
4. Diversificazione (asset classes, settori)
5. Raccomandazioni educative (non consigli di investimento)
6. Note accademiche (riferimenti quando rilevante)

Rispondi in formato JSON strutturato:
{
  "concentration": {
    "level": "low|medium|high|critical",
    "message": "...",
    "topHoldings": [{"symbol": "...", "weight": 0.XX}]
  },
  "correlation": {
    "level": "low|medium|high",
    "message": "...",
    "correlatedPairs": []
  },
  "volatility": {
    "level": "low|medium|high",
    "message": "...",
    "portfolioVolatility": 0.XX
  },
  "diversification": {
    "level": "low|medium|high",
    "message": "...",
    "assetClasses": X,
    "sectors": X
  },
  "recommendations": ["...", "..."],
  "academicNotes": ["...", "..."]
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Lower for more consistent analysis
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';

    // Parse JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (e) {
      // Fallback: try to parse as-is
      analysis = JSON.parse(content);
    }

    return {
      risks: analysis,
      recommendations: analysis.recommendations || [],
      academicNotes: analysis.academicNotes || [],
    };
  } catch (error) {
    console.error('Error calling Groq AI:', error);
    throw error;
  }
}

/**
 * POST /api/portfolio/risk-analysis
 * Analyze portfolio risk with Groq AI
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { positions: inputPositions, source } = body; // source: 'paper-trading' | 'tournament' | 'custom'

    if (!inputPositions || !Array.isArray(inputPositions) || inputPositions.length === 0) {
      return NextResponse.json({ error: 'No positions provided' }, { status: 400 });
    }

    // Fetch current prices and calculate portfolio
    const positions: PortfolioPosition[] = [];
    let totalValue = 0;

    for (const pos of inputPositions) {
      const currentPriceResult = await getCurrentPrice(
        pos.symbol,
        pos.assetType || 'stock'
      );

      if (currentPriceResult.price === null) {
        continue; // Skip if price unavailable
      }

      const currentPrice = currentPriceResult.price;
      const value = currentPrice * pos.quantity;
      totalValue += value;

      positions.push({
        symbol: pos.symbol,
        assetType: pos.assetType || 'stock',
        quantity: pos.quantity,
        entryPrice: pos.entryPrice || currentPrice,
        currentPrice,
        value,
        weight: 0, // Will calculate after total
      });
    }

    // Calculate weights
    positions.forEach(p => {
      p.weight = totalValue > 0 ? (p.value / totalValue) * 100 : 0;
    });

    // Sort by weight descending
    positions.sort((a, b) => b.weight - a.weight);

    // Prepare portfolio data for AI
    const portfolioData = `
Portafoglio Totale: €${totalValue.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Numero Posizioni: ${positions.length}
Asset Classes: ${new Set(positions.map(p => p.assetType)).size}
Top 5 Holdings: ${positions.slice(0, 5).map(p => `${p.symbol} (${p.weight.toFixed(2)}%)`).join(', ')}
`;

    // Analyze with Groq AI
    const analysis = await analyzePortfolioWithGroq(portfolioData, positions);

    // Build response
    const riskAnalysis: RiskAnalysis = {
      totalValue,
      positions,
      risks: analysis.risks,
      recommendations: analysis.recommendations,
      academicNotes: analysis.academicNotes,
      mifidWarnings: [
        'Questa analisi è fornita a scopo educativo e informativo. Non costituisce consulenza in materia di investimenti.',
        'I risultati passati non garantiscono performance future. Investi solo quello che puoi permetterti di perdere.',
        'Diversificazione non elimina il rischio di perdita. Valuta sempre il tuo profilo di rischio personale.',
      ],
    };

    return NextResponse.json(riskAnalysis);
  } catch (error) {
    console.error('Error in POST /api/portfolio/risk-analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
