'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ProUnlockOverlay } from '@/components/ui/ProUnlockOverlay';
import { MethodologyPopup } from '@/components/ui/MethodologyPopup';
import {
  CryptoWhaleIcon,
  DepthAggregatedIcon,
  TopMoversIcon,
  FuturesIcon,
  OptionsIcon,
  ForexIcon,
} from '@/components/icons/ProAnalysisIcons';
import CryptoWhaleAnalysis from './pro/CryptoWhaleAnalysis';
import CryptoDepthAggregated from './pro/CryptoDepthAggregated';
import CryptoTopMovers from './pro/CryptoTopMovers';
import FuturesAnalysis from './pro/FuturesAnalysis';
import OptionsAnalysis from './pro/OptionsAnalysis';
import ForexAnalysis from './pro/ForexAnalysis';

interface ProAnalysisTab {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ isPro: boolean }>;
  methodologyNotes: {
    title: string;
    description: string;
    academicReference?: string;
    methodology?: string;
    limitations?: string;
  };
}

/**
 * Pro Analysis Tabs
 * 
 * Standard Tradelia AI - Tabs collassabili per analisi avanzate Pro
 * Ogni tab ha: nome, descrizione, popup note metodologiche, overlay se non Pro
 */
export default function ProAnalysisTabs() {
  const { locale } = useTranslations();
  const isPro = useIsPro();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const tabs: ProAnalysisTab[] = [
    {
      id: 'crypto-whale',
      name: locale === 'it' ? 'Crypto Whale Analysis' : 'Crypto Whale Analysis',
      description:
        locale === 'it'
          ? 'Analisi movimenti whale su top 400 crypto con AI reading'
          : 'Whale movement analysis on top 400 crypto with AI reading',
      icon: CryptoWhaleIcon,
      component: CryptoWhaleAnalysis,
      methodologyNotes: {
        title: locale === 'it' ? 'Crypto Whale Analysis' : 'Crypto Whale Analysis',
        description:
          locale === 'it'
            ? 'Analisi dei movimenti di grandi volumi (whale) nel mercato crypto. Identifica transazioni significative e pattern di accumulo/distribuzione.'
            : 'Analysis of large volume movements (whale) in crypto market. Identifies significant transactions and accumulation/distribution patterns.',
        academicReference:
          locale === 'it'
            ? 'Market Microstructure Theory - Large Trader Impact'
            : 'Market Microstructure Theory - Large Trader Impact',
        methodology:
          locale === 'it'
            ? 'Analisi aggregata di transazioni >$1M su top 400 crypto. Identificazione pattern whale tramite volume analysis e correlazioni temporali.'
            : 'Aggregated analysis of transactions >$1M on top 400 crypto. Whale pattern identification through volume analysis and temporal correlations.',
        limitations:
          locale === 'it'
            ? 'I dati whale possono essere influenzati da exchange-specific factors. Richiede contesto di altri indicatori per interpretazione completa.'
            : 'Whale data can be influenced by exchange-specific factors. Requires context from other indicators for complete interpretation.',
      },
    },
    {
      id: 'crypto-depth',
      name: locale === 'it' ? 'Depth Aggregated' : 'Depth Aggregated',
      description:
        locale === 'it'
          ? 'Order book depth aggregato multi-exchange con AI reading'
          : 'Multi-exchange aggregated order book depth with AI reading',
      icon: DepthAggregatedIcon,
      component: CryptoDepthAggregated,
      methodologyNotes: {
        title: locale === 'it' ? 'Depth Aggregated Analysis' : 'Depth Aggregated Analysis',
        description:
          locale === 'it'
            ? 'Analisi aggregata dell\'order book depth da multiple exchange (Binance, Coinbase, etc.) per valutare liquidità e pressione bid/ask.'
            : 'Aggregated order book depth analysis from multiple exchanges (Binance, Coinbase, etc.) to assess liquidity and bid/ask pressure.',
        academicReference:
          locale === 'it'
            ? 'Market Microstructure - Order Book Analysis'
            : 'Market Microstructure - Order Book Analysis',
        methodology:
          locale === 'it'
            ? 'Aggregazione order book L400 da Binance, Coinbase, Kraken. Calcolo spread, imbalance, e profondità totale per valutare liquidità.'
            : 'L400 order book aggregation from Binance, Coinbase, Kraken. Calculation of spread, imbalance, and total depth to assess liquidity.',
        limitations:
          locale === 'it'
            ? 'Order book depth è exchange-specific. Aggregazione può nascondere differenze tra exchange. Non riflette necessariamente liquidità globale.'
            : 'Order book depth is exchange-specific. Aggregation may hide differences between exchanges. Does not necessarily reflect global liquidity.',
      },
    },
    {
      id: 'crypto-movers',
      name: locale === 'it' ? 'Top Movers' : 'Top Movers',
      description:
        locale === 'it'
          ? 'Top winners/losers e volumi con analisi AI'
          : 'Top winners/losers and volumes with AI analysis',
      icon: TopMoversIcon,
      component: CryptoTopMovers,
      methodologyNotes: {
        title: locale === 'it' ? 'Top Movers Analysis' : 'Top Movers Analysis',
        description:
          locale === 'it'
            ? 'Identificazione delle crypto con maggiori movimenti di prezzo e volume nelle ultime 24h. Analisi trend e momentum.'
            : 'Identification of cryptocurrencies with largest price and volume movements in last 24h. Trend and momentum analysis.',
        academicReference:
          locale === 'it'
            ? 'Momentum Theory - Price and Volume Analysis'
            : 'Momentum Theory - Price and Volume Analysis',
        methodology:
          locale === 'it'
            ? 'Calcolo variazioni percentuali e volumi su top 400 crypto. Ranking per performance e volume. Identificazione outlier e trend.'
            : 'Calculation of percentage changes and volumes on top 400 crypto. Ranking by performance and volume. Identification of outliers and trends.',
        limitations:
          locale === 'it'
            ? 'Movimenti estremi possono essere causati da low liquidity o manipolazione. Richiede conferma da altri indicatori.'
            : 'Extreme movements can be caused by low liquidity or manipulation. Requires confirmation from other indicators.',
      },
    },
    {
      id: 'futures',
      name: locale === 'it' ? 'Futures Analysis' : 'Futures Analysis',
      description:
        locale === 'it'
          ? 'Analisi futures real-time con term structure e AI reading'
          : 'Real-time futures analysis with term structure and AI reading',
      icon: FuturesIcon,
      component: FuturesAnalysis,
      methodologyNotes: {
        title: locale === 'it' ? 'Futures Analysis' : 'Futures Analysis',
        description:
          locale === 'it'
            ? 'Analisi dei futures markets con focus su term structure, basis, e sentiment. Identificazione contango/backwardation.'
            : 'Futures markets analysis focusing on term structure, basis, and sentiment. Identification of contango/backwardation.',
        academicReference:
          locale === 'it'
            ? 'Fama & French (1987) - "Commodity Futures Prices"'
            : 'Fama & French (1987) - "Commodity Futures Prices"',
        methodology:
          locale === 'it'
            ? 'Analisi differenza tra futures e spot price. Calcolo basis e term structure. Identificazione pattern contango/backwardation.'
            : 'Analysis of difference between futures and spot price. Basis and term structure calculation. Identification of contango/backwardation patterns.',
        limitations:
          locale === 'it'
            ? 'Term structure può essere influenzata da fattori tecnici (rollover, liquidity) oltre a fondamentali. Richiede contesto per interpretazione.'
            : 'Term structure can be influenced by technical factors (rollover, liquidity) beyond fundamentals. Requires context for interpretation.',
      },
    },
    {
      id: 'options',
      name: locale === 'it' ? 'Options Analysis' : 'Options Analysis',
      description:
        locale === 'it'
          ? 'Analisi opzioni con Greeks, IV, e AI reading'
          : 'Options analysis with Greeks, IV, and AI reading',
      icon: OptionsIcon,
      component: OptionsAnalysis,
      methodologyNotes: {
        title: locale === 'it' ? 'Options Analysis' : 'Options Analysis',
        description:
          locale === 'it'
            ? 'Analisi del mercato opzioni con focus su implied volatility, Greeks (Delta, Gamma, Theta, Vega), e sentiment.'
            : 'Options market analysis focusing on implied volatility, Greeks (Delta, Gamma, Theta, Vega), and sentiment.',
        academicReference:
          locale === 'it'
            ? 'Black-Scholes Model - Options Pricing Theory'
            : 'Black-Scholes Model - Options Pricing Theory',
        methodology:
          locale === 'it'
            ? 'Calcolo implied volatility, Greeks, e open interest. Analisi put/call ratio e skew. Identificazione sentiment e positioning.'
            : 'Calculation of implied volatility, Greeks, and open interest. Put/call ratio and skew analysis. Identification of sentiment and positioning.',
        limitations:
          locale === 'it'
            ? 'Greeks e IV possono essere influenzati da fattori di mercato specifici. Richiede conoscenza avanzata di opzioni per interpretazione.'
            : 'Greeks and IV can be influenced by specific market factors. Requires advanced options knowledge for interpretation.',
      },
    },
    {
      id: 'forex',
      name: locale === 'it' ? 'Forex Analysis' : 'Forex Analysis',
      description:
        locale === 'it'
          ? 'Analisi forex avanzata con correlazioni e AI reading'
          : 'Advanced forex analysis with correlations and AI reading',
      icon: ForexIcon,
      component: ForexAnalysis,
      methodologyNotes: {
        title: locale === 'it' ? 'Forex Analysis' : 'Forex Analysis',
        description:
          locale === 'it'
            ? 'Analisi avanzata del mercato forex con focus su correlazioni, carry trade, e sentiment. Analisi major pairs e cross.'
            : 'Advanced forex market analysis focusing on correlations, carry trade, and sentiment. Major pairs and cross analysis.',
        academicReference:
          locale === 'it'
            ? 'Interest Rate Parity - Foreign Exchange Theory'
            : 'Interest Rate Parity - Foreign Exchange Theory',
        methodology:
          locale === 'it'
            ? 'Analisi tassi di cambio, correlazioni tra pairs, e differenziali di interesse. Identificazione opportunità carry trade e risk sentiment.'
            : 'Exchange rate analysis, correlations between pairs, and interest rate differentials. Identification of carry trade opportunities and risk sentiment.',
        limitations:
          locale === 'it'
            ? 'Forex può essere influenzato da interventi delle banche centrali e eventi geopolitici. Richiede monitoraggio continuo.'
            : 'Forex can be influenced by central bank interventions and geopolitical events. Requires continuous monitoring.',
      },
    },
  ];

  const handleUnlock = () => {
    // Navigate to pricing or open upgrade modal
    window.location.href = locale === 'it' ? '/pricing' : '/en/pricing';
  };

  return (
    <div className="mt-8">
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-4 rounded-lg',
          'bg-bg-soft border-premium shadow-premium',
          'hover:bg-bg-surface transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-accent'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-text-primary">
              {locale === 'it' ? 'Analisi Avanzate Pro' : 'Pro Advanced Analysis'}
            </h3>
            <p className="text-sm text-text-secondary">
              {locale === 'it'
                ? 'Strumenti professionali con AI e dati real-time'
                : 'Professional tools with AI and real-time data'}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-secondary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        )}
      </button>

      {/* Tabs Content - Expandable */}
      {isExpanded && (
        <div className="mt-4 bg-bg-surface border-premium shadow-premium rounded-xl overflow-hidden card-mobile">
          {/* Tabs Navigation */}
          <div className="flex border-b border-premium overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                className={cn(
                  'px-6 py-4 font-medium interaction-smooth whitespace-nowrap underline-selection',
                  'border-b-2 border-transparent',
                  activeTab === tab.id
                    ? 'text-text-primary bg-bg-soft active'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-soft'
                )}
              >
                {tab.icon && <tab.icon className="w-5 h-5 mr-2" />}
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab && (
            <div className="relative min-h-[400px]">
              {tabs
                .filter((tab) => tab.id === activeTab)
                .map((tab) => {
                  const TabComponent = tab.component;
                  return (
                    <div key={tab.id} className="p-6">
                      {/* Tab Header with Methodology */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-text-primary mb-2">
                            {tab.name}
                          </h4>
                          <p className="text-sm text-text-secondary mb-2">
                            {tab.description}
                          </p>
                          <MethodologyPopup notes={tab.methodologyNotes} />
                        </div>
                      </div>

                      {/* Tab Content with Overlay if not Pro */}
                      <div className="relative">
                        {!isPro && (
                          <ProUnlockOverlay
                            featureName={tab.name}
                            featureDescription={tab.description}
                            onUnlock={handleUnlock}
                          />
                        )}
                        <TabComponent isPro={isPro} />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* No Tab Selected */}
          {!activeTab && (
            <div className="p-12 text-center">
              <p className="text-text-secondary">
                {locale === 'it'
                  ? 'Seleziona un\'analisi per iniziare'
                  : 'Select an analysis to begin'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
