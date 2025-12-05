'use client';

import { useState, useEffect } from 'react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import ProWidget from '@/components/widgets/ProWidget';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface Widget {
  id: string;
  widget_type: string;
  position: number;
  is_enabled: boolean;
  config: Record<string, any>;
}

/**
 * Widgets Section - Dashboard
 * 
 * Mostra widget installati nella dashboard principale
 */
export default function WidgetsSection() {
  const { isPro } = useUserRole();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      if (!response.ok) return;
      
      const data = await response.json();
      setWidgets((data.widgets || []).slice(0, 3)); // Max 3 widget in dashboard
    } catch (error) {
      console.error('Error fetching widgets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPro || isLoading || widgets.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Widgets</h2>
        <Link
          href="/dashboard/widgets"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Manage
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets
          .sort((a, b) => a.position - b.position)
          .map((widget) => (
            <ProWidget key={widget.id} widgetType={widget.widget_type} />
          ))}
      </div>
    </section>
  );
}
