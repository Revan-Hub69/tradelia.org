import { NextRequest, NextResponse } from 'next/server';

/**
 * FAQ API
 * Returns FAQ items from knowledge base
 * 
 * Best Practice AI 2025: Hybrid Search (Keyword + Semantic)
 * - Keyword search for exact matches
 * - Semantic search for conceptual matches
 * - RAG pattern for document retrieval
 * 
 * References:
 * - Lewis et al. (2020): "Retrieval-Augmented Generation"
 * - Karpukhin et al. (2020): "Dense Passage Retrieval"
 * - Gao et al. (2023): "Hybrid Search"
 */

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  source?: string;
  lastUpdated?: string;
}

// TODO: Load from database or markdown files
// For now, using static FAQ items
// Future: Implement RAG with vector embeddings for document retrieval
const getFAQItems = async (locale: 'it' | 'en'): Promise<FAQItem[]> => {
  // Static FAQ items - will be replaced with database/document retrieval
  const faqItems: FAQItem[] = locale === 'it' ? [
    {
      id: '1',
      question: 'Cos\'è Tradelia?',
      answer: 'Tradelia è una piattaforma educativa finanziaria che combina rigore accademico con accessibilità. Offriamo strumenti finanziari, report conformi MIFID II, analisi di mercato e formazione.',
      category: 'Generale',
      tags: ['piattaforma', 'introduzione'],
    },
    {
      id: '2',
      question: 'Come funziona il PAC (Piano di Accumulo Capitale)?',
      answer: 'Il PAC è una strategia di investimento che prevede versamenti periodici (mensili o trimestrali) per accumulare capitale nel tempo. Diversifica il rischio temporale e riduce l\'impatto della volatilità. Usa il simulatore PAC nella sezione Utilities per calcolare i rendimenti attesi.',
      category: 'Investimenti',
      tags: ['pac', 'investimenti', 'simulatore'],
    },
    {
      id: '3',
      question: 'Cos\'è il Sharpe Ratio?',
      answer: 'Il Sharpe Ratio misura il rendimento aggiustato per il rischio. Si calcola come (Rendimento Portafoglio - Tasso Risk-Free) / Deviazione Standard. Un valore superiore a 1 è considerato buono, superiore a 2 è eccellente. Usa il calcolatore Sharpe Ratio nella sezione Utilities.',
      category: 'Analisi',
      tags: ['sharpe', 'rischio', 'rendimento'],
    },
    {
      id: '4',
      question: 'Quali strumenti sono disponibili per utenti Pro?',
      answer: 'Gli utenti Pro hanno accesso a strumenti avanzati come Trading Journal, Hedging Calculator, Portfolio Optimizer, Options Calculator, e molti altri. Visita la sezione Utilities per vedere tutti gli strumenti disponibili.',
      category: 'Account',
      tags: ['pro', 'utilities', 'strumenti'],
    },
    {
      id: '5',
      question: 'I report sono conformi MIFID II?',
      answer: 'Sì, tutti i report e le analisi su Tradelia sono conformi alle normative MIFID II. Ogni strumento include disclaimer e avvisi normativi appropriati. Le informazioni sono a scopo educativo e non costituiscono consulenza finanziaria.',
      category: 'Conformità',
      tags: ['mifid', 'conformità', 'report'],
    },
  ] : [
    {
      id: '1',
      question: 'What is Tradelia?',
      answer: 'Tradelia is a professional financial analysis platform that combines academic rigor with accessibility. We offer financial tools, MIFID II compliant reports, and market analysis.',
      category: 'General',
      tags: ['platform', 'introduction'],
    },
    {
      id: '2',
      question: 'How does PAC (Capital Accumulation Plan) work?',
      answer: 'PAC is an investment strategy involving periodic contributions (monthly or quarterly) to accumulate capital over time. It diversifies temporal risk and reduces the impact of volatility. Use the PAC simulator in the Utilities section to calculate expected returns.',
      category: 'Investments',
      tags: ['pac', 'investments', 'simulator'],
    },
    {
      id: '3',
      question: 'What is the Sharpe Ratio?',
      answer: 'The Sharpe Ratio measures risk-adjusted return. It\'s calculated as (Portfolio Return - Risk-Free Rate) / Standard Deviation. A value above 1 is considered good, above 2 is excellent. Use the Sharpe Ratio calculator in the Utilities section.',
      category: 'Analysis',
      tags: ['sharpe', 'risk', 'return'],
    },
    {
      id: '4',
      question: 'What tools are available for Pro users?',
      answer: 'Pro users have access to advanced tools like Trading Journal, Hedging Calculator, Portfolio Optimizer, Options Calculator, and many more. Visit the Utilities section to see all available tools.',
      category: 'Account',
      tags: ['pro', 'utilities', 'tools'],
    },
    {
      id: '5',
      question: 'Are reports MIFID II compliant?',
      answer: 'Yes, all reports and analysis on Tradelia are compliant with MIFID II regulations. Each tool includes appropriate disclaimers and regulatory notices. Information does not constitute financial advice.',
      category: 'Compliance',
      tags: ['mifid', 'compliance', 'reports'],
    },
  ];

  return faqItems;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get('locale') || 'it') as 'it' | 'en';
    const query = searchParams.get('q') || '';

    // Get FAQ items
    let items = await getFAQItems(locale);

    // Simple keyword search (will be enhanced with semantic search)
    if (query) {
      const queryLower = query.toLowerCase();
      items = items.filter(item => {
        return (
          item.question.toLowerCase().includes(queryLower) ||
          item.answer.toLowerCase().includes(queryLower) ||
          item.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ||
          item.category?.toLowerCase().includes(queryLower)
        );
      });
    }

    return NextResponse.json({
      items,
      total: items.length,
      locale,
    });
  } catch (error) {
    console.error('Error in FAQ API:', error);
    return NextResponse.json(
      { error: 'Internal server error', items: [] },
      { status: 500 }
    );
  }
}
