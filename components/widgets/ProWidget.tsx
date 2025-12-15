'use client';

import { useState, useEffect } from 'react';
import { X, Settings, Move } from 'lucide-react';
import CryptoWhaleAnalysis from '@/components/dashboard/analysis/pro/CryptoWhaleAnalysis';
import CryptoDepthAggregated from '@/components/dashboard/analysis/pro/CryptoDepthAggregated';
import CryptoTopMovers from '@/components/dashboard/analysis/pro/CryptoTopMovers';
import FuturesAnalysis from '@/components/dashboard/analysis/pro/FuturesAnalysis';
import OptionsAnalysis from '@/components/dashboard/analysis/pro/OptionsAnalysis';
import ForexAnalysis from '@/components/dashboard/analysis/pro/ForexAnalysis';
import { useIsPro } from '@/lib/hooks/useUserRole';
import {
  CryptoWhaleIcon,
  DepthAggregatedIcon,
  TopMoversIcon,
  FuturesIcon,
  OptionsIcon,
  ForexIcon,
} from '@/components/icons/ProAnalysisIcons';

interface ProWidgetProps {
  widgetType: string;
  onRemove?: () => void;
  onConfigure?: () => void;
  isDragging?: boolean;
}

const widgetComponents: Record<string, React.ComponentType<{ isPro: boolean }>> = {
  'crypto-whale': CryptoWhaleAnalysis,
  'crypto-depth': CryptoDepthAggregated,
  'crypto-movers': CryptoTopMovers,
  'futures': FuturesAnalysis,
  'options': OptionsAnalysis,
  'forex': ForexAnalysis,
};

const widgetIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'crypto-whale': CryptoWhaleIcon,
  'crypto-depth': DepthAggregatedIcon,
  'crypto-movers': TopMoversIcon,
  'futures': FuturesIcon,
  'options': OptionsIcon,
  'forex': ForexIcon,
};

const widgetLabels: Record<string, { label: string }> = {
  'crypto-whale': { label: 'Crypto Whale' },
  'crypto-depth': { label: 'Depth Aggregated' },
  'crypto-movers': { label: 'Top Movers' },
  'futures': { label: 'Futures' },
  'options': { label: 'Options' },
  'forex': { label: 'Forex' },
};

/**
 * Pro Widget Component
 * 
 * Widget installabile per Pro users
 * Wrapper per i componenti Pro analysis
 */
export default function ProWidget({ widgetType, onRemove, onConfigure, isDragging }: ProWidgetProps) {
  const isPro = useIsPro();
  const [isMinimized, setIsMinimized] = useState(false);

  const WidgetComponent = widgetComponents[widgetType];
  const widgetInfo = widgetLabels[widgetType];

  if (!WidgetComponent || !widgetInfo) {
    return null;
  }

  return (
    <div
      className={`bg-card rounded-lg border p-4 transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-2">
          {widgetIconMap[widgetType] && (() => {
            const IconComponent = widgetIconMap[widgetType];
            return <IconComponent className="w-5 h-5 text-accent" />;
          })()}
          <h3 className="font-semibold">{widgetInfo.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Configure widget"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-muted transition-colors text-destructive"
              aria-label="Remove widget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Content */}
      {!isMinimized && (
        <div className="widget-content">
          <WidgetComponent isPro={isPro} />
        </div>
      )}
    </div>
  );
}
