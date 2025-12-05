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

const widgetLabels: Record<string, { icon: string; label: string }> = {
  'crypto-whale': { icon: '🐋', label: 'Crypto Whale' },
  'crypto-depth': { icon: '📊', label: 'Depth Aggregated' },
  'crypto-movers': { icon: '📈', label: 'Top Movers' },
  'futures': { icon: '⚡', label: 'Futures' },
  'options': { icon: '🎯', label: 'Options' },
  'forex': { icon: '💱', label: 'Forex' },
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
          <span className="text-xl">{widgetInfo.icon}</span>
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
