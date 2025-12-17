'use client';

import { useEffect, useState, memo, useRef } from 'react';
import { IndicatorCardEnhanced } from './IndicatorCardEnhanced';
import { IndicatorCardSEO } from '../dashboard/market-data/IndicatorCardSEO';
import { LineChart, LineChartData } from '@/components/charts/LineChart';
import { BarChart, BarChartData } from '@/components/charts/BarChart';
import { AreaChart, AreaChartData } from '@/components/charts/AreaChart';
import { Skeleton } from '@/components/ui/Skeleton';
import { getChartConfig } from '@/lib/data/chart-types-config';
import { getIndicatorEndpoint } from '../dashboard/market-data/IndicatorMapping';
import type { AcademicReference, IndicatorInterpretation } from './IndicatorCard';

interface GenericIndicatorEnhancedProps {
  indicatorId: string;
  title: string;
  academicReference: AcademicReference;
  getInterpretation?: (value: any) => IndicatorInterpretation;
  immediateLoad?: boolean; // Se true, carica immediatamente senza Intersection Observer
}

/**
 * Generic Indicator Enhanced Component
 * 
 * Componente riutilizzabile per tutti gli indicatori
 * Usa chart config automatico e endpoint mapping
 */
export const GenericIndicatorEnhanced = memo(function GenericIndicatorEnhanced({
  indicatorId,
  title,
  academicReference,
  getInterpretation,
  immediateLoad = false,
}: GenericIndicatorEnhancedProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(immediateLoad);
  const [hasFailed503, setHasFailed503] = useState(false); // Track 503 errors to prevent retries
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false); // Prevent concurrent fetches

  // Intersection Observer per lazy loading - carica solo quando visibile
  // Skip se immediateLoad è true
  useEffect(() => {
    if (immediateLoad) {
      setShouldFetch(true);
      return;
    }
    
    if (!containerRef.current || shouldFetch) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldFetch(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '200px', // Inizia a caricare 200px prima che sia visibile
        threshold: 0.1,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [shouldFetch, immediateLoad]);

  // Fetch solo quando l'elemento è visibile
  useEffect(() => {
    if (!shouldFetch || hasFailed503 || fetchingRef.current) return; // Skip if 503 failed or already fetching

    let cancelled = false;
    fetchingRef.current = true;

    async function fetchIndicator() {
      try {
        setLoading(true);
        setError(null);
        const endpoint = getIndicatorEndpoint(indicatorId);
        
        if (!endpoint) {
          throw new Error(`Endpoint not found for indicator: ${indicatorId}`);
        }

        const response = await fetch(endpoint, {
          cache: 'default',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (cancelled) return;
        
        if (!response.ok) {
          // Don't retry on 503 (Service Unavailable) - API not configured
          if (response.status === 503) {
            setHasFailed503(true); // Mark as failed to prevent future retries
            setError('Service temporarily unavailable');
            setLoading(false);
            fetchingRef.current = false;
            return;
          }
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        
        const indicatorData = await response.json();
        
        if (cancelled) return;
        
        // Security: Li & Zhang (2025) - Validate response structure
        if (typeof indicatorData !== 'object' || indicatorData === null) {
          throw new Error('Invalid response format');
        }
        
        // Handle different response structures
        // Some APIs return { success: true, data: {...} }, others return data directly
        const actualData = indicatorData.data || indicatorData;
        
        setData(actualData);
        setError(null);
        setHasFailed503(false); // Reset on success
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
          fetchingRef.current = false;
        }
      }
    }

    fetchIndicator();

    return () => {
      cancelled = true;
      fetchingRef.current = false;
    };
  }, [indicatorId, shouldFetch, hasFailed503]);

  // Mostra skeleton se non ancora visibile o in loading
  if (!shouldFetch || loading) {
    return (
      <div ref={containerRef} className="h-full min-h-[200px] w-full">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <IndicatorCardEnhanced
        title={title}
        value="N/A"
        aiReading={`Dati non disponibili per ${title}. ${error || 'Verifica la configurazione delle API keys.'}`}
        academicReference={academicReference}
        methodology={{
          description: `Dati temporaneamente non disponibili per ${title}.`,
          calculation: 'N/A',
          dataSource: 'N/A',
          updateFrequency: 'N/A',
          limitations: 'N/A',
        }}
      />
    );
  }

  // Extract value and change from data
  // Handle different data structures
  let value: number | string = 0;
  let change = 0;
  let changePercent = 0;
  
  if (data.indexes && Array.isArray(data.indexes) && data.indexes.length > 0) {
    // For stock-indexes, use average of all indexes
    const avgPrice = data.indexes.reduce((sum: number, idx: any) => sum + (idx.price || 0), 0) / data.indexes.length;
    const avgChange = data.indexes.reduce((sum: number, idx: any) => sum + (idx.change || 0), 0) / data.indexes.length;
    const avgChangePercent = data.indexes.reduce((sum: number, idx: any) => sum + (idx.changePercent || 0), 0) / data.indexes.length;
    value = avgPrice;
    change = avgChange;
    changePercent = avgChangePercent;
  } else if (data.value !== undefined) {
    // Direct value (most common structure)
    value = data.value;
    change = data.change || 0;
    changePercent = data.changePercent || 0;
  } else if (data.data?.value !== undefined) {
    // Nested data.value structure
    value = data.data.value;
    change = data.data.change || 0;
    changePercent = data.data.changePercent || 0;
  } else if (data.data?.currentPrice !== undefined) {
    // Per /api/market/data (spy, eurusd, gold)
    value = data.data.currentPrice;
    change = data.data.change24h || 0;
    changePercent = data.data.change24hPercent || 0;
  } else if (data.compositeScore !== undefined) {
    value = data.compositeScore;
    change = data.change || 0;
    changePercent = data.changePercent || 0;
  } else if (data.nvtRatio !== undefined) {
    value = data.nvtRatio;
    change = data.change || 0;
    changePercent = data.changePercent || 0;
  } else if (data.mvrvRatio !== undefined) {
    value = data.mvrvRatio;
    change = data.change || 0;
    changePercent = data.changePercent || 0;
    } else {
      // Fallback: cerca qualsiasi campo numerico che potrebbe essere il valore
      const numericKeys = Object.keys(data).filter(key => 
        typeof data[key] === 'number' && 
        !['change', 'changePercent', 'timestamp'].includes(key)
      );
      if (numericKeys.length > 0) {
        value = data[numericKeys[0]];
        change = data.change || 0;
        changePercent = data.changePercent || 0;
      }
    }
  
  const aiReading = data.aiReading || data.data?.aiReading || 'Analisi AI non disponibile.';
  const history = data.history || data.data?.history || data.data?.priceHistory || [];

  // Get interpretation if function provided
  const interpretation = getInterpretation ? getInterpretation(value) : undefined;

  // Get chart config
  const chartConfig = getChartConfig(indicatorId);

  // Prepare chart data based on type
  let chart: React.ReactNode = null;

  if (history.length > 0 && chartConfig?.type === 'line') {
    const chartData: LineChartData[] = history.map((item: any) => ({
      name: new Date(item.date || item.timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
      value: item.value || item.price || item.dominance || 0,
    }));

    chart = (
      <LineChart
        data={chartData}
        lines={[{ key: 'value', label: title }]}
        indicatorId={indicatorId}
      />
    );
  } else if (Array.isArray(data.indexes) || Array.isArray(data.etfs) || Array.isArray(data.commodities)) {
    const items = data.indexes || data.etfs || data.commodities || [];
    const chartData: BarChartData[] = items.map((item: any) => ({
      name: item.name || item.symbol,
      value: item.price || item.changePercent || 0,
    }));

    chart = (
      <BarChart
        data={chartData}
        bars={[{ key: 'value', label: title }]}
        indicatorId={indicatorId}
      />
    );
  }

  return (
    <div ref={containerRef}>
      {/* SEO Component - Updates meta tags dynamically */}
      <IndicatorCardSEO
        indicatorId={indicatorId}
        currentValue={String(value)}
        chartType={chartConfig?.type ?? 'unknown'}
      />
      
      <IndicatorCardEnhanced
        title={title}
        value={data.indexes && Array.isArray(data.indexes) && data.indexes.length > 0
          ? `${data.indexes.length} indici`
          : value}
        change={change}
        changePercent={changePercent}
        chart={chart}
        aiReading={aiReading}
        academicReference={academicReference}
        interpretation={interpretation}
        timestamp={data.timestamp || new Date().toISOString()}
        methodology={{
          description: `Indicatore ${title} - Dati in tempo reale.`,
          calculation: 'Calcolato da dati di mercato in tempo reale.',
          dataSource: data.note ? 'Dati di esempio (configura API keys per dati real-time)' : 'Multiple sources (Finnhub, CoinGecko, Yahoo Finance, etc.)',
          updateFrequency: 'Aggiornato ogni 5-10 minuti.',
          limitations: data.note || 'Dati dipendono dalla disponibilità delle API esterne.',
        }}
        size="standard"
      />
    </div>
  );
});
