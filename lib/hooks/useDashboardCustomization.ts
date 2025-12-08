'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface DashboardComponent {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  collapsed?: boolean;
}

const DEFAULT_COMPONENTS: DashboardComponent[] = [
  { id: 'module-grid', name: 'Moduli', visible: true, order: 0 },
  { id: 'market-dashboard', name: 'Cruscotto Operativo', visible: true, order: 1 },
  { id: 'multi-asset-charts', name: 'Multi-Asset Charts', visible: true, order: 2 },
  { id: 'l400-support-resistance', name: 'L400 Support/Resistance', visible: true, order: 3 },
  { id: 'news-feed', name: 'News Feed', visible: true, order: 4 },
  { id: 'economic-calendar', name: 'Economic Calendar', visible: true, order: 5 },
  { id: 'ipo-calendar', name: 'IPO Calendar', visible: true, order: 6 },
  { id: 'trending-coins', name: 'Trending Coins', visible: true, order: 7 },
  { id: 'market-sentiment', name: 'Market Sentiment', visible: true, order: 8 },
  { id: 'reddit-sentiment', name: 'Reddit Sentiment', visible: true, order: 9 },
  { id: 'developer-activity', name: 'Developer Activity', visible: true, order: 10 },
  { id: 'overview', name: 'Overview Stats', visible: true, order: 11 },
];

export function useDashboardCustomization() {
  const [components, setComponents] = useState<DashboardComponent[]>(DEFAULT_COMPONENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadCustomization = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setComponents(DEFAULT_COMPONENTS);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_preferences')
          .select('dashboard_layout')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading dashboard customization:', error);
        }

        if (data?.dashboard_layout) {
          try {
            // dashboard_layout is already JSONB, no need to parse if it's an object
            const saved = typeof data.dashboard_layout === 'string' 
              ? JSON.parse(data.dashboard_layout)
              : data.dashboard_layout;
            
            // Ensure it's an array
            if (Array.isArray(saved)) {
              // Merge with defaults to handle new components
              const merged = DEFAULT_COMPONENTS.map(defaultComp => {
                const savedComp = saved.find((c: DashboardComponent) => c.id === defaultComp.id);
                return savedComp || defaultComp;
              });
              setComponents(merged);
            } else {
              setComponents(DEFAULT_COMPONENTS);
            }
          } catch (e) {
            console.error('Error parsing dashboard layout:', e);
            setComponents(DEFAULT_COMPONENTS);
          }
        } else {
          setComponents(DEFAULT_COMPONENTS);
        }
      } catch (error) {
        console.error('Error in loadCustomization:', error);
        setComponents(DEFAULT_COMPONENTS);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomization();
  }, []);

  const saveCustomization = async (newComponents: DashboardComponent[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dashboard_layout: newComponents, // JSONB accepts objects directly
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error saving dashboard customization:', error);
      } else {
        setComponents(newComponents);
      }
    } catch (error) {
      console.error('Error in saveCustomization:', error);
    }
  };

  const toggleVisibility = async (componentId: string) => {
    const updated = components.map(comp =>
      comp.id === componentId ? { ...comp, visible: !comp.visible } : comp
    );
    await saveCustomization(updated);
  };

  const reorderComponents = async (fromIndex: number, toIndex: number) => {
    const updated = [...components];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    
    // Update order numbers
    const reordered = updated.map((comp, index) => ({
      ...comp,
      order: index,
    }));
    
    await saveCustomization(reordered);
  };

  const resetToDefault = async () => {
    await saveCustomization(DEFAULT_COMPONENTS);
  };

  return {
    components,
    isLoading,
    isDragging,
    setIsDragging,
    toggleVisibility,
    reorderComponents,
    resetToDefault,
    saveCustomization,
  };
}
