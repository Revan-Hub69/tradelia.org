'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import ProWidget from './ProWidget';
import { Plus, GripVertical } from 'lucide-react';
import {
  CryptoWhaleIcon,
  DepthAggregatedIcon,
  TopMoversIcon,
  FuturesIcon,
  OptionsIcon,
  ForexIcon,
} from '@/components/icons/ProAnalysisIcons';

interface Widget {
  id: string;
  widget_type: string;
  position: number;
  is_enabled: boolean;
  config: Record<string, any>;
}

/**
 * Widgets Manager Component
 * 
 * Gestisce installazione, rimozione e ordinamento widget per Pro users
 */
export default function WidgetsManager() {
  const { t } = useTranslations();
  const isPro = useIsPro();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddWidget, setShowAddWidget] = useState(false);

  useEffect(() => {
    if (!isPro) {
      setIsLoading(false);
      return;
    }

    fetchWidgets();
  }, [isPro]);

  const fetchWidgets = async () => {
    try {
      const response = await fetch('/api/widgets');
      if (!response.ok) throw new Error('Failed to fetch widgets');
      
      const data = await response.json();
      setWidgets(data.widgets || []);
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallWidget = async (widgetType: string) => {
    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widget_type: widgetType }),
      });

      if (!response.ok) throw new Error('Failed to install widget');
      
      await fetchWidgets();
      setShowAddWidget(false);
    } catch (error) {
      console.error('Error installing widget:', error);
    }
  };

  const handleRemoveWidget = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove widget');
      
      await fetchWidgets();
    } catch (error) {
      console.error('Error removing widget:', error);
    }
  };

  const handleUpdatePosition = async (widgetId: string, newPosition: number) => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPosition }),
      });

      if (!response.ok) throw new Error('Failed to update position');
      
      await fetchWidgets();
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  if (!isPro) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Upgrade to Pro to access Widgets</p>
        <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading widgets...</div>
      </div>
    );
  }

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'crypto-whale': CryptoWhaleIcon,
    'crypto-depth': DepthAggregatedIcon,
    'crypto-movers': TopMoversIcon,
    'futures': FuturesIcon,
    'options': OptionsIcon,
    'forex': ForexIcon,
  };

  const availableWidgets = [
    { type: 'crypto-whale', label: 'Crypto Whale', available: true },
    { type: 'crypto-depth', label: 'Depth Aggregated', available: true },
    { type: 'crypto-movers', label: 'Top Movers', available: true },
    { type: 'futures', label: 'Futures', available: false },
    { type: 'options', label: 'Options', available: false },
    { type: 'forex', label: 'Forex', available: false },
  ];

  const installedTypes = new Set(widgets.map(w => w.widget_type));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Widgets</h2>
          <p className="text-sm text-muted-foreground">Personalizza la tua dashboard con widget Pro</p>
        </div>
        <button
          onClick={() => setShowAddWidget(!showAddWidget)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Widget
        </button>
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="bg-muted/50 rounded-lg p-4 border">
          <h3 className="font-semibold mb-4">Available Widgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                onClick={() => widget.available && handleInstallWidget(widget.type)}
                disabled={!widget.available || installedTypes.has(widget.type)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  !widget.available
                    ? 'opacity-50 cursor-not-allowed'
                    : installedTypes.has(widget.type)
                    ? 'opacity-50 cursor-not-allowed bg-muted'
                    : 'hover:border-primary hover:bg-muted/50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {iconMap[widget.type] && (() => {
                    const IconComponent = iconMap[widget.type];
                    return <IconComponent className="w-6 h-6 text-blue-400" />;
                  })()}
                  <span className="font-semibold">{widget.label}</span>
                </div>
                {!widget.available && (
                  <p className="text-xs text-muted-foreground">Coming Soon</p>
                )}
                {installedTypes.has(widget.type) && (
                  <p className="text-xs text-muted-foreground">Already Installed</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Installed Widgets */}
      <div className="space-y-4">
        {widgets.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground mb-4">No widgets installed</p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Add Your First Widget
            </button>
          </div>
        ) : (
          widgets
            .sort((a, b) => a.position - b.position)
            .map((widget) => (
              <div key={widget.id} className="flex items-start gap-2">
                <button
                  className="p-2 rounded hover:bg-muted transition-colors cursor-move"
                  aria-label="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="flex-1">
                  <ProWidget
                    widgetType={widget.widget_type}
                    onRemove={() => handleRemoveWidget(widget.id)}
                  />
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
