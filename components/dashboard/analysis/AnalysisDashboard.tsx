'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import VIXIndicator from './VIXIndicator';
import FearGreedIndicator from './FearGreedIndicator';
import BitcoinDominanceIndicator from './BitcoinDominanceIndicator';
import EconomicIndicatorsIndicator from './EconomicIndicatorsIndicator';
import BondYieldsIndicator from './BondYieldsIndicator';
import StockIndexesIndicator from './StockIndexesIndicator';
import CommoditiesIndicator from './CommoditiesIndicator';
import CryptoMarketCapIndicator from './CryptoMarketCapIndicator';
import ForexIndicator from './ForexIndicator';
import ProAnalysisTabs from './ProAnalysisTabs';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { cn } from '@/lib/utils/cn';

/**
 * Analysis Dashboard - Main Market Indicators
 * 
 * Features:
 * - 3 large academic indicators with charts
 * - Groq AI readings
 * - Mobile: slide laterali (super innovativo)
 * - Real-time updates (appropriate to indicator type)
 * - Pro modal for advanced analysis
 * 
 * Best Practice: Academic rigor, MIFID compliance, mobile-first
 */
export default function AnalysisDashboard() {
  const { t, locale } = useTranslations();
  const { isLoading } = useUserRole();
  const [currentSlide, setCurrentSlide] = useState(0);

  const indicators = [
    { id: 'bitcoin-dominance', component: BitcoinDominanceIndicator },
    { id: 'crypto-market-cap', component: CryptoMarketCapIndicator },
    { id: 'fear-greed', component: FearGreedIndicator },
    { id: 'economic', component: EconomicIndicatorsIndicator },
    { id: 'bond-yields', component: BondYieldsIndicator },
    { id: 'stock-indexes', component: StockIndexesIndicator },
    { id: 'commodities', component: CommoditiesIndicator },
    { id: 'forex', component: ForexIndicator },
    { id: 'vix', component: VIXIndicator },
  ];

  // Mobile slide navigation
  const handleSlideChange = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentSlide((prev) => (prev + 1) % indicators.length);
    } else {
      setCurrentSlide((prev) => (prev - 1 + indicators.length) % indicators.length);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <DashboardTabs />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
                {locale === 'it' ? 'Analisi di Mercato' : 'Market Analysis'}
              </h1>
              <p className="text-text-secondary mt-1">
                {locale === 'it' 
                  ? 'Indicatori accademici di mercato con dati in tempo reale' 
                  : 'Academic market indicators with real-time data'}
              </p>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                {locale === 'it' 
                  ? 'Questi indicatori sono strumenti educativi basati su framework accademici. Non costituiscono consulenza finanziaria.'
                  : 'These indicators are educational tools based on academic frameworks. They do not constitute financial advice.'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Indicators Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            {locale === 'it' ? 'Indicatori Principali' : 'Main Indicators'}
          </h2>
          
          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {indicators.map((indicator, index) => {
              const IndicatorComponent = indicator.component;
              return (
                <div key={indicator.id} className="h-full">
                  <IndicatorComponent />
                </div>
              );
            })}
          </div>

          {/* Mobile: Slide Layout */}
          <div className="md:hidden relative">
            <div className="overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {indicators.map((indicator) => {
                  const IndicatorComponent = indicator.component;
                  return (
                    <div key={indicator.id} className="min-w-full">
                      <IndicatorComponent />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => handleSlideChange('prev')}
                className={cn(
                  'p-2 rounded-full bg-bg-soft hover:bg-bg-surface transition-colors',
                  'border border-border-subtle',
                  'focus:outline-none focus:ring-2 focus:ring-accent'
                )}
                aria-label={locale === 'it' ? 'Indicatore precedente' : 'Previous indicator'}
              >
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Dots Indicator */}
              <div className="flex gap-2">
                {indicators.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentSlide 
                        ? 'bg-accent w-8' 
                        : 'bg-text-tertiary hover:bg-text-secondary'
                    )}
                    aria-label={`${locale === 'it' ? 'Vai all\'indicatore' : 'Go to indicator'} ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => handleSlideChange('next')}
                className={cn(
                  'p-2 rounded-full bg-bg-soft hover:bg-bg-surface transition-colors',
                  'border border-border-subtle',
                  'focus:outline-none focus:ring-2 focus:ring-accent'
                )}
                aria-label={locale === 'it' ? 'Indicatore successivo' : 'Next indicator'}
              >
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Pro Analysis Tabs - Standard Tradelia AI */}
        <ProAnalysisTabs />
      </div>
    </div>
  );
}
