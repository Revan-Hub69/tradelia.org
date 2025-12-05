'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import VIXIndicator from './VIXIndicator';
import FearGreedIndicator from './FearGreedIndicator';
import TermStructureIndicator from './TermStructureIndicator';
import ProAnalysisModal from './ProAnalysisModal';
import { useUserRole, useIsPro } from '@/lib/hooks/useUserRole';
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
  const isPro = useIsPro();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const indicators = [
    { id: 'vix', component: VIXIndicator },
    { id: 'fear-greed', component: FearGreedIndicator },
    { id: 'term-structure', component: TermStructureIndicator },
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
        
        {/* Pro Analysis Section - Spostato in basso */}
        {isPro && (
          <div className="mt-8">
            <div className="bg-bg-soft border border-border-subtle rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  {locale === 'it' ? 'Analisi Avanzate Pro' : 'Pro Advanced Analysis'}
                </h2>
                <button
                  onClick={() => setIsProModalOpen(true)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all',
                    'bg-accent text-white hover:bg-accent-hover',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                  )}
                >
                  {locale === 'it' ? 'Apri Analisi Pro' : 'Open Pro Analysis'}
                </button>
              </div>
              <p className="text-sm text-text-secondary">
                {locale === 'it' 
                  ? 'Accedi ad analisi avanzate con AI, backtesting e strumenti professionali.'
                  : 'Access advanced analysis with AI, backtesting and professional tools.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Non-Pro: Upgrade Prompt */}
        {!isPro && !isLoading && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-accent/20 to-accent-hover/20 border border-accent/40 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {locale === 'it' ? 'Sblocca Analisi Avanzate' : 'Unlock Advanced Analysis'}
                  </h3>
                  <p className="text-sm text-text-secondary mb-4">
                    {locale === 'it' 
                      ? 'Ottieni accesso ad analisi AI avanzate, backtesting e strumenti professionali con un account Pro.'
                      : 'Get access to advanced AI analysis, backtesting and professional tools with a Pro account.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsProModalOpen(true)}
                  className={cn(
                    'px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap',
                    'bg-accent text-white hover:bg-accent-hover',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2'
                  )}
                >
                  {locale === 'it' ? 'Scopri Pro' : 'Discover Pro'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pro Analysis Modal */}
      <ProAnalysisModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        userRole={isPro ? 'pro' : 'base'}
      />
    </div>
  );
}
