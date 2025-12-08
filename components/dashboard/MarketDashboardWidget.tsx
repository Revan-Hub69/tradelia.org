'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, Link as LinkIcon } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { buildLocalePath } from '@/lib/i18n/paths';
import { Skeleton } from '@/components/ui/Skeleton';
import { AssetType, MarketIndicator as MarketIndicatorType } from '@/lib/types/market';
import { IndicatorTooltip } from '@/components/ui/IndicatorTooltip';

interface MarketIndicator {
  id: string;
  name: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  status: 'positive' | 'negative' | 'neutral';
  loading?: boolean;
  isPro?: boolean;
  badge?: string;
  assetType?: AssetType;
}

/**
 * Market Dashboard Widget
 * Cruscotto operativo con indicatori di mercato principali
 * Versione compatta per la panoramica dashboard
 */
export function MarketDashboardWidget() {
  const { t, locale } = useTranslations();
  const [indicators, setIndicators] = useState<MarketIndicator[]>([
    // Market-wide indicators
    { id: 'vix', name: 'VIX', value: '—', status: 'neutral', loading: true, assetType: 'stock' },
    { id: 'fear-greed', name: 'Fear & Greed', value: '—', status: 'neutral', loading: true, assetType: 'crypto' },
    // Crypto indicators
    { id: 'bitcoin-dominance', name: 'BTC Dominance', value: '—', status: 'neutral', loading: true, assetType: 'crypto' },
    { id: 'crypto-market-cap', name: 'Crypto Market Cap', value: '—', status: 'neutral', loading: true, assetType: 'crypto' },
    // Stock indicators
    { id: 'spy', name: 'S&P 500', value: '—', status: 'neutral', loading: true, assetType: 'stock' },
    { id: 'qqq', name: 'NASDAQ', value: '—', status: 'neutral', loading: true, assetType: 'stock' },
    // Forex indicators
    { id: 'eurusd', name: 'EUR/USD', value: '—', status: 'neutral', loading: true, assetType: 'forex' },
    { id: 'dxy', name: 'DXY', value: '—', status: 'neutral', loading: true, assetType: 'forex' },
    // Commodity indicators
    { id: 'gold', name: 'Gold', value: '—', status: 'neutral', loading: true, assetType: 'commodity' },
    { id: 'oil', name: 'Oil', value: '—', status: 'neutral', loading: true, assetType: 'commodity' },
    // PRO indicators
    { id: 'whale-ratio', name: 'Whale Ratio', value: '—', status: 'neutral', loading: true, isPro: true, assetType: 'crypto' },
    { id: 'exchange-flow', name: 'Exchange Flow', value: '—', status: 'neutral', loading: true, isPro: true, assetType: 'crypto' },
    { id: 'l400-imbalance', name: 'L400 Imbalance', value: '—', status: 'neutral', loading: true, isPro: true, assetType: 'crypto' },
    { id: 'top-mover', name: 'Top Mover', value: '—', status: 'neutral', loading: true, isPro: true },
  ]);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        // Fetch VIX
        try {
          const vixResponse = await fetch('/api/market-indicators/vix');
          if (vixResponse.ok) {
            const vixData = await vixResponse.json();
            setIndicators(prev => prev.map(ind => 
              ind.id === 'vix' 
                ? {
                    ...ind,
                    value: vixData.value?.toFixed(2) || '—',
                    change: vixData.change,
                    changePercent: vixData.changePercent,
                    status: vixData.changePercent && vixData.changePercent > 0 ? 'negative' : 'positive',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'vix' ? { ...ind, loading: false } : ind));
        }

        // Fetch Fear & Greed
        try {
          const fgResponse = await fetch('/api/market-indicators/fear-greed');
          if (fgResponse.ok) {
            const fgData = await fgResponse.json();
            setIndicators(prev => prev.map(ind => 
              ind.id === 'fear-greed' 
                ? {
                    ...ind,
                    value: fgData.value || '—',
                    status: fgData.value >= 50 ? 'positive' : 'negative',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'fear-greed' ? { ...ind, loading: false } : ind));
        }

        // Fetch Bitcoin Dominance
        try {
          const btcResponse = await fetch('/api/market-indicators/bitcoin-dominance');
          if (btcResponse.ok) {
            const btcData = await btcResponse.json();
            setIndicators(prev => prev.map(ind => 
              ind.id === 'bitcoin-dominance' 
                ? {
                    ...ind,
                    value: btcData.dominance ? `${btcData.dominance.toFixed(1)}%` : '—',
                    status: 'neutral',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'bitcoin-dominance' ? { ...ind, loading: false } : ind));
        }

        // Fetch Crypto Market Cap
        try {
          const marketCapResponse = await fetch('/api/market-indicators/crypto-market-cap');
          if (marketCapResponse.ok) {
            const marketCapData = await marketCapResponse.json();
            const value = marketCapData.totalMarketCap 
              ? `$${(marketCapData.totalMarketCap / 1e12).toFixed(2)}T`
              : '—';
            setIndicators(prev => prev.map(ind => 
              ind.id === 'crypto-market-cap' 
                ? {
                    ...ind,
                    value,
                    status: 'neutral',
                    loading: false,
                  }
                : ind
            ));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'crypto-market-cap' ? { ...ind, loading: false } : ind));
        }

        // Fetch S&P 500 (SPY)
        try {
          const spyResponse = await fetch('/api/market/data?symbol=SPY&assetType=stock');
          if (spyResponse.ok) {
            const spyData = await spyResponse.json();
            if (spyData.success && spyData.data) {
              const value = `$${spyData.data.currentPrice.toFixed(2)}`;
              setIndicators(prev => prev.map(ind => 
                ind.id === 'spy' 
                  ? {
                      ...ind,
                      value,
                      changePercent: spyData.data.change24hPercent,
                      status: spyData.data.change24hPercent > 0 ? 'positive' : spyData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'spy' ? { ...ind, loading: false } : ind));
        }

        // Fetch NASDAQ (QQQ)
        try {
          const qqqResponse = await fetch('/api/market/data?symbol=QQQ&assetType=stock');
          if (qqqResponse.ok) {
            const qqqData = await qqqResponse.json();
            if (qqqData.success && qqqData.data) {
              const value = `$${qqqData.data.currentPrice.toFixed(2)}`;
              setIndicators(prev => prev.map(ind => 
                ind.id === 'qqq' 
                  ? {
                      ...ind,
                      value,
                      changePercent: qqqData.data.change24hPercent,
                      status: qqqData.data.change24hPercent > 0 ? 'positive' : qqqData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'qqq' ? { ...ind, loading: false } : ind));
        }

        // Fetch EUR/USD
        try {
          const eurusdResponse = await fetch('/api/market/data?symbol=EURUSD&assetType=forex');
          if (eurusdResponse.ok) {
            const eurusdData = await eurusdResponse.json();
            if (eurusdData.success && eurusdData.data) {
              const value = eurusdData.data.currentPrice.toFixed(4);
              setIndicators(prev => prev.map(ind => 
                ind.id === 'eurusd' 
                  ? {
                      ...ind,
                      value,
                      changePercent: eurusdData.data.change24hPercent,
                      status: eurusdData.data.change24hPercent > 0 ? 'positive' : eurusdData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'eurusd' ? { ...ind, loading: false } : ind));
        }

        // Fetch DXY (Dollar Index) - from FRED
        try {
          const dxyResponse = await fetch('/api/market-indicators/economic?indicator=DXY');
          if (dxyResponse.ok) {
            const dxyData = await dxyResponse.json();
            if (dxyData.value) {
              setIndicators(prev => prev.map(ind => 
                ind.id === 'dxy' 
                  ? {
                      ...ind,
                      value: dxyData.value.toFixed(2),
                      changePercent: dxyData.changePercent,
                      status: dxyData.changePercent > 0 ? 'positive' : dxyData.changePercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'dxy' ? { ...ind, loading: false } : ind));
        }

        // Fetch Gold
        try {
          const goldResponse = await fetch('/api/market/data?symbol=GOLD&assetType=commodity');
          if (goldResponse.ok) {
            const goldData = await goldResponse.json();
            if (goldData.success && goldData.data) {
              const value = `$${goldData.data.currentPrice.toFixed(2)}`;
              setIndicators(prev => prev.map(ind => 
                ind.id === 'gold' 
                  ? {
                      ...ind,
                      value,
                      changePercent: goldData.data.change24hPercent,
                      status: goldData.data.change24hPercent > 0 ? 'positive' : goldData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'gold' ? { ...ind, loading: false } : ind));
        }

        // Fetch Oil
        try {
          const oilResponse = await fetch('/api/market/data?symbol=OIL&assetType=commodity');
          if (oilResponse.ok) {
            const oilData = await oilResponse.json();
            if (oilData.success && oilData.data) {
              const value = `$${oilData.data.currentPrice.toFixed(2)}`;
              setIndicators(prev => prev.map(ind => 
                ind.id === 'oil' 
                  ? {
                      ...ind,
                      value,
                      changePercent: oilData.data.change24hPercent,
                      status: oilData.data.change24hPercent > 0 ? 'positive' : oilData.data.change24hPercent < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            }
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'oil' ? { ...ind, loading: false } : ind));
        }

        // Fetch Whale Ratio (PRO)
        try {
          const whaleResponse = await fetch('/api/crypto/whale-analysis');
          if (whaleResponse.ok) {
            const whaleData = await whaleResponse.json();
            setIndicators(prev => prev.map(ind => 
              ind.id === 'whale-ratio' 
                ? {
                    ...ind,
                    value: whaleData.whaleRatio ? `${whaleData.whaleRatio.toFixed(2)}` : '—',
                    status: whaleData.whaleRatio && whaleData.whaleRatio > 1 ? 'negative' : 'positive',
                    loading: false,
                  }
                : ind
            ));
          } else if (whaleResponse.status === 403) {
            // Pro required
            setIndicators(prev => prev.map(ind => ind.id === 'whale-ratio' ? { ...ind, value: 'PRO', loading: false } : ind));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'whale-ratio' ? { ...ind, loading: false } : ind));
        }

        // Fetch Exchange Flow (PRO) - Now using Glassnode real data
        try {
          const exchangeFlowResponse = await fetch('/api/crypto/exchange-flows?asset=BTC');
          if (exchangeFlowResponse.ok) {
            const flowData = await exchangeFlowResponse.json();
            if (flowData.success && flowData.data) {
              const netFlow = flowData.data.netFlow || 0;
              const value = netFlow !== 0 
                ? `${netFlow > 0 ? '+' : ''}$${(Math.abs(netFlow) / 1e6).toFixed(1)}M`
                : '—';
              setIndicators(prev => prev.map(ind => 
                ind.id === 'exchange-flow' 
                  ? {
                      ...ind,
                      value,
                      status: netFlow > 0 ? 'positive' : netFlow < 0 ? 'negative' : 'neutral',
                      loading: false,
                    }
                  : ind
              ));
            } else {
              setIndicators(prev => prev.map(ind => ind.id === 'exchange-flow' ? { ...ind, value: 'PRO', loading: false } : ind));
            }
          } else if (exchangeFlowResponse.status === 403) {
            setIndicators(prev => prev.map(ind => ind.id === 'exchange-flow' ? { ...ind, value: 'PRO', loading: false } : ind));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'exchange-flow' ? { ...ind, loading: false } : ind));
        }

        // Fetch L400 Imbalance (PRO)
        try {
          const l400Response = await fetch('/api/crypto/top-400-depth');
          if (l400Response.ok) {
            const l400Data = await l400Response.json();
            const imbalance = l400Data.summary?.globalImbalance || 0;
            const value = imbalance !== 0 
              ? `${imbalance > 0 ? '+' : ''}${imbalance.toFixed(1)}%`
              : '0%';
            setIndicators(prev => prev.map(ind => 
              ind.id === 'l400-imbalance' 
                ? {
                    ...ind,
                    value,
                    status: imbalance > 5 ? 'positive' : imbalance < -5 ? 'negative' : 'neutral',
                    loading: false,
                  }
                : ind
            ));
          } else if (l400Response.status === 403) {
            setIndicators(prev => prev.map(ind => ind.id === 'l400-imbalance' ? { ...ind, value: 'PRO', loading: false } : ind));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'l400-imbalance' ? { ...ind, loading: false } : ind));
        }

        // Fetch Top Mover (PRO)
        try {
          const moversResponse = await fetch('/api/crypto/top-movers');
          if (moversResponse.ok) {
            const moversData = await moversResponse.json();
            const topGainer = moversData.gainers?.[0];
            if (topGainer) {
              setIndicators(prev => prev.map(ind => 
                ind.id === 'top-mover' 
                  ? {
                      ...ind,
                      value: `${topGainer.symbol} +${topGainer.changePercent.toFixed(1)}%`,
                      status: 'positive',
                      loading: false,
                    }
                  : ind
              ));
            }
          } else if (moversResponse.status === 403) {
            setIndicators(prev => prev.map(ind => ind.id === 'top-mover' ? { ...ind, value: 'PRO', loading: false } : ind));
          }
        } catch (e) {
          setIndicators(prev => prev.map(ind => ind.id === 'top-mover' ? { ...ind, loading: false } : ind));
        }
      } catch (error) {
        console.error('Error fetching market indicators:', error);
      }
    };

    fetchIndicators();
    
    // Refresh ogni 5 minuti
    const interval = setInterval(fetchIndicators, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="bg-bg-soft border border-border-subtle rounded-xl p-6 mb-6"
      aria-label="Cruscotto operativo mercati"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            {t('dashboard.marketDashboard.title') || 'Cruscotto Operativo'}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('dashboard.marketDashboard.description') || 'Indicatori di mercato in tempo reale'}
          </p>
        </div>
        <Link
          href={buildLocalePath(locale, '/dashboard/market-data')}
          className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover font-medium transition-colors"
        >
          <span>{t('dashboard.marketDashboard.viewAll') || 'Vedi tutti'}</span>
          <LinkIcon className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {indicators.map((indicator) => (
          <div
            key={indicator.id}
            className={cn(
              'bg-bg-base border border-border-subtle rounded-lg p-4 transition-all hover:border-accent/40',
              indicator.status === 'positive' && 'border-green-500/30',
              indicator.status === 'negative' && 'border-red-500/30'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <IndicatorTooltip indicatorId={indicator.id}>
                    <span className="text-xs text-text-tertiary font-medium uppercase">
                      {indicator.name}
                    </span>
                  </IndicatorTooltip>
                  {indicator.assetType && (
                    <span className={cn(
                      'text-[9px] px-1 py-0.5 rounded font-semibold uppercase',
                      indicator.assetType === 'crypto' && 'bg-purple-500/20 text-purple-400',
                      indicator.assetType === 'stock' && 'bg-blue-500/20 text-blue-400',
                      indicator.assetType === 'forex' && 'bg-amber-500/20 text-amber-400',
                      indicator.assetType === 'commodity' && 'bg-yellow-500/20 text-yellow-400'
                    )}>
                      {indicator.assetType.substring(0, 1)}
                    </span>
                  )}
                  {indicator.isPro && indicator.value === 'PRO' && (
                    <span className="text-[10px] px-1 py-0.5 bg-accent/20 text-accent rounded font-semibold">
                      PRO
                    </span>
                  )}
                </div>
              </div>
              {indicator.changePercent !== undefined && (
                <div className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  indicator.changePercent > 0 ? 'text-red-400' : 'text-green-400'
                )}>
                  {indicator.changePercent > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{Math.abs(indicator.changePercent).toFixed(1)}%</span>
                </div>
              )}
            </div>
            {indicator.loading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="text-2xl font-bold text-text-primary">
                {indicator.value}
              </div>
            )}
            {indicator.status === 'negative' && indicator.id === 'vix' && (
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                <span>{t('dashboard.marketDashboard.highVolatility') || 'Alta volatilità'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
