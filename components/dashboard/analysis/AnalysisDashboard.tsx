'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import VIXIndicator from './VIXIndicator';
import FearGreedIndicator from './FearGreedIndicator';
import TermStructureIndicator from './TermStructureIndicator';
import ProAnalysisModal from './ProAnalysisModal';
import { useUserRole, useIsPro } from '@/lib/hooks/useUserRole';

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
  const { t } = useTranslations();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('analysis')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('analysisSubtitle') || 'Academic market indicators with real-time data'}
            </p>
          </div>
          
          {/* Pro Button */}
          {isPro ? (
            <button
              onClick={() => setIsProModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t('dashboard.analysis.proAnalysis') || 'Pro Analysis'}
            </button>
          ) : (
            <button
              onClick={() => setIsProModalOpen(true)}
              className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
            >
              {t('dashboard.analysis.unlockPro') || 'Unlock Pro Analysis'}
            </button>
          )}
        </div>

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
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Previous indicator"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Dots Indicator */}
            <div className="flex gap-2">
              {indicators.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label={`Go to indicator ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => handleSlideChange('next')}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="Next indicator"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
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
