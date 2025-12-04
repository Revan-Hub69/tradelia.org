'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import CryptoWhaleAnalysis from './pro/CryptoWhaleAnalysis';
import CryptoDepthAggregated from './pro/CryptoDepthAggregated';
import CryptoTopMovers from './pro/CryptoTopMovers';
import FuturesAnalysis from './pro/FuturesAnalysis';
import OptionsAnalysis from './pro/OptionsAnalysis';
import ForexAnalysis from './pro/ForexAnalysis';

interface ProAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

/**
 * Pro Analysis Modal
 * 
 * Features:
 * - Crypto whale analysis with Groq AI reading
 * - Aggregated depth (multi-exchange) with Groq AI reading
 * - Top winners/losers, volumes
 * - Futures live analysis
 * - Options analysis
 * - Forex analysis
 * 
 * All data: real-time, free APIs, academic compliance
 */
export default function ProAnalysisModal({ isOpen, onClose, userRole }: ProAnalysisModalProps) {
  const t = useTranslations('Dashboard');
  const [activeTab, setActiveTab] = useState<'crypto-whale' | 'crypto-depth' | 'crypto-movers' | 'futures' | 'options' | 'forex'>('crypto-whale');
  const isPro = userRole === 'pro' || userRole === 'desk';

  if (!isOpen) return null;

  const tabs = [
    { id: 'crypto-whale' as const, label: 'Crypto Whale', icon: '🐋' },
    { id: 'crypto-depth' as const, label: 'Depth Aggregated', icon: '📊' },
    { id: 'crypto-movers' as const, label: 'Top Movers', icon: '📈' },
    { id: 'futures' as const, label: 'Futures', icon: '⚡' },
    { id: 'options' as const, label: 'Options', icon: '🎯' },
    { id: 'forex' as const, label: 'Forex', icon: '💱' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-lg border w-full max-w-7xl max-h-[90vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Pro Analysis</h2>
            <p className="text-sm text-muted-foreground">Real-time market analysis</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isPro && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                🔒 Pro feature preview. Upgrade to Pro for full access and real-time data.
              </p>
            </div>
          )}

          {activeTab === 'crypto-whale' && <CryptoWhaleAnalysis isPro={isPro} />}
          {activeTab === 'crypto-depth' && <CryptoDepthAggregated isPro={isPro} />}
          {activeTab === 'crypto-movers' && <CryptoTopMovers isPro={isPro} />}
          {activeTab === 'futures' && <FuturesAnalysis isPro={isPro} />}
          {activeTab === 'options' && <OptionsAnalysis isPro={isPro} />}
          {activeTab === 'forex' && <ForexAnalysis isPro={isPro} />}
        </div>
      </div>
    </div>
  );
}
