'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Target, Shield, AlertCircle, Info, Zap, Clock, DollarSign, BarChart3, Settings, X, Plus, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useApi } from '@/lib/hooks/useApi';
import { toast } from '@/components/ui/Toast';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { Tooltip } from '@/components/ui/CustomTooltip';
import { cn } from '@/lib/utils/cn';
import { getCurrentPrice } from '@/lib/price-apis';
import { ComingSoon } from '@/components/ui/ComingSoon';

/**
 * Paper Trading - Livello Professionale
 * 
 * Simula operazioni di trading in tempo reale usando prezzi reali
 * Best Practice: Order Management System, Risk Management, Portfolio Analytics
 * 
 * Features:
 * - Market, Limit, Stop, Trailing Stop orders
 * - Real-time P&L tracking
 * - Risk limits (margin, leverage, position size)
 * - Portfolio analytics
 */

interface PaperPosition {
  id: string;
  symbol: string;
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity';
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryTime: string;
  strategy?: string;
  notes?: string;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

interface PaperOrder {
  id: string;
  symbol: string;
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity';
  orderType: 'market' | 'limit' | 'stop' | 'trailing_stop';
  side: 'buy' | 'sell';
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  trailingStopPercent?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'expired';
  executionPrice?: number;
  executionTime?: string;
  createdAt: string;
}

interface PortfolioStats {
  totalEquity: number;
  totalPnL: number;
  totalPnLPercent: number;
  openPositions: number;
  totalExposure: number;
  marginUsed: number;
  marginAvailable: number;
  leverage: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export function PaperTrading() {
  const { t, locale } = useTranslations();
  const formatCurrency = useFormatCurrency();
  
  const [tradingMode, setTradingMode] = useState<'paper' | 'real'>('paper');
  const [initialCapital] = useState(10000); // €10,000 paper capital
  const [positions, setPositions] = useState<PaperPosition[]>([]);
  const [orders, setOrders] = useState<PaperOrder[]>([]);
  
  // Load positions and orders from API
  const { data: positionsData, loading: positionsLoading, refetch: refetchPositions } = useApi<PaperPosition[]>(
    '/api/paper-trading/positions',
    { cacheTime: 5 * 1000 } // 5 seconds cache
  );
  
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useApi<PaperOrder[]>(
    '/api/paper-trading/orders?status=pending',
    { cacheTime: 5 * 1000 }
  );
  
  useEffect(() => {
    if (positionsData) {
      setPositions(positionsData.map(p => ({
        id: p.id,
        symbol: p.symbol,
        assetType: (p as any).asset_type as 'stock' | 'crypto' | 'forex',
        side: p.side as 'long' | 'short',
        quantity: parseFloat(p.quantity.toString()),
        entryPrice: parseFloat((p as any).entry_price.toString()),
        currentPrice: parseFloat((p as any).current_price.toString()),
        entryTime: (p as any).entry_time,
        strategy: p.strategy,
        notes: p.notes,
        unrealizedPnL: parseFloat((p as any).unrealized_pnl?.toString() || '0'),
        unrealizedPnLPercent: parseFloat((p as any).unrealized_pnl_percent?.toString() || '0'),
      })));
    }
  }, [positionsData]);
  
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData.map(o => ({
        id: o.id,
        symbol: o.symbol,
        assetType: (o as any).asset_type as 'stock' | 'crypto' | 'forex',
        orderType: (o as any).order_type as 'market' | 'limit' | 'stop' | 'trailing_stop',
        side: o.side as 'buy' | 'sell',
        quantity: parseFloat(o.quantity.toString()),
        limitPrice: (o as any).limit_price ? parseFloat((o as any).limit_price.toString()) : undefined,
        stopPrice: (o as any).stop_price ? parseFloat((o as any).stop_price.toString()) : undefined,
        trailingStopPercent: (o as any).trailing_stop_percent ? parseFloat((o as any).trailing_stop_percent.toString()) : undefined,
        status: o.status as 'pending' | 'filled' | 'cancelled' | 'expired',
        executionPrice: (o as any).execution_price ? parseFloat((o as any).execution_price.toString()) : undefined,
        executionTime: (o as any).execution_time,
        createdAt: (o as any).created_at,
      })));
    }
  }, [ordersData]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedAssetType, setSelectedAssetType] = useState<'stock' | 'crypto' | 'forex'>('stock');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'trailing_stop'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [trailingStopPercent, setTrailingStopPercent] = useState('');
  
  // Risk Management Settings
  const [maxPositionSize, setMaxPositionSize] = useState(20); // % of capital
  const [maxLeverage, setMaxLeverage] = useState(2); // 2x leverage max
  const [maxDrawdownLimit, setMaxDrawdownLimit] = useState(20); // % max drawdown
  
  // Real-time price updates
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});
  
  // Update prices every 5 seconds (quasi real-time)
  useEffect(() => {
    if (positions.length === 0 && orders.length === 0) return;
    
    const updatePrices = async () => {
      const symbolsToUpdate = [
        ...new Set([
          ...positions.map(p => p.symbol),
          ...orders.filter(o => o.status === 'pending').map(o => o.symbol)
        ])
      ];
      
      for (const symbol of symbolsToUpdate) {
        const position = positions.find(p => p.symbol === symbol);
        const assetType = position?.assetType || 'stock';
        
        try {
          const result = await getCurrentPrice(symbol, assetType);
          if (result.price) {
            setPriceUpdates(prev => ({ ...prev, [symbol]: result.price! }));
          }
        } catch (error) {
          console.error(`Error updating price for ${symbol}:`, error);
        }
      }
    };
    
    updatePrices();
    const interval = setInterval(updatePrices, 5000); // Every 5 seconds
    
    return () => clearInterval(interval);
  }, [positions, orders]);
  
  // Update positions with current prices
  useEffect(() => {
    setPositions(prev => prev.map(pos => {
      const currentPrice = priceUpdates[pos.symbol] || pos.currentPrice;
      const unrealizedPnL = pos.side === 'long'
        ? (currentPrice - pos.entryPrice) * pos.quantity
        : (pos.entryPrice - currentPrice) * pos.quantity;
      const unrealizedPnLPercent = (unrealizedPnL / (pos.entryPrice * pos.quantity)) * 100;
      
      return {
        ...pos,
        currentPrice,
        unrealizedPnL,
        unrealizedPnLPercent,
      };
    }));
  }, [priceUpdates]);
  
  // Check pending orders for execution
  useEffect(() => {
    const checkOrders = async () => {
      for (const order of orders.filter(o => o.status === 'pending')) {
        const currentPrice = priceUpdates[order.symbol];
        if (!currentPrice) continue;
        
        let shouldExecute = false;
        
        switch (order.orderType) {
          case 'market':
            shouldExecute = true;
            break;
          case 'limit':
            if (order.side === 'buy' && currentPrice <= (order.limitPrice || 0)) {
              shouldExecute = true;
            } else if (order.side === 'sell' && currentPrice >= (order.limitPrice || 0)) {
              shouldExecute = true;
            }
            break;
          case 'stop':
            if (order.side === 'buy' && currentPrice >= (order.stopPrice || 0)) {
              shouldExecute = true;
            } else if (order.side === 'sell' && currentPrice <= (order.stopPrice || 0)) {
              shouldExecute = true;
            }
            break;
          case 'trailing_stop':
            // Trailing stop logic (simplified)
            const position = positions.find(p => p.symbol === order.symbol);
            if (position) {
              const trailingAmount = position.entryPrice * ((order.trailingStopPercent || 5) / 100);
              if (order.side === 'sell' && position.currentPrice <= (position.entryPrice - trailingAmount)) {
                shouldExecute = true;
              }
            }
            break;
        }
        
        if (shouldExecute) {
          await executeOrder(order, currentPrice);
        }
      }
    };
    
    checkOrders();
  }, [priceUpdates, orders, positions]);
  
  const executeOrder = async (order: PaperOrder, executionPrice: number) => {
    // Check risk limits
    const orderValue = executionPrice * parseFloat(orderQuantity);
    const currentExposure = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
    
    if (orderValue + currentExposure > initialCapital * maxLeverage) {
      toast.error(locale === 'it' ? 'Limite di leverage superato' : 'Leverage limit exceeded');
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
      return;
    }
    
    // Execute order via API
    if (order.side === 'buy') {
      // Create position via API
      const positionResponse = await fetch('/api/paper-trading/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: order.symbol,
          assetType: order.assetType,
          side: 'long',
          quantity: parseFloat(orderQuantity),
          entryPrice: executionPrice,
          currentPrice: executionPrice,
        }),
      });
      
      if (positionResponse.ok) {
        const newPosition = await positionResponse.json();
        const mappedPosition: PaperPosition = {
          id: newPosition.id,
          symbol: newPosition.symbol,
          assetType: (newPosition as any).asset_type,
          side: newPosition.side,
          quantity: parseFloat(newPosition.quantity.toString()),
          entryPrice: parseFloat((newPosition as any).entry_price.toString()),
          currentPrice: parseFloat((newPosition as any).current_price.toString()),
          entryTime: (newPosition as any).entry_time,
          strategy: newPosition.strategy,
          notes: newPosition.notes,
          unrealizedPnL: parseFloat(newPosition.unrealized_pnl?.toString() || '0'),
          unrealizedPnLPercent: parseFloat(newPosition.unrealized_pnl_percent?.toString() || '0'),
        };
        setPositions(prev => [...prev, mappedPosition]);
        await refetchPositions();
        
      }
    } else {
      // Close position via API
      const position = positions.find(p => p.symbol === order.symbol && p.side === 'long');
      if (position) {
        const closeResponse = await fetch(`/api/paper-trading/positions/${position.id}`, {
          method: 'DELETE',
        });
        
        if (closeResponse.ok) {
          const pnl = (executionPrice - position.entryPrice) * position.quantity;
          
          
          setPositions(prev => prev.filter(p => p.id !== position.id));
          await refetchPositions();
        }
      }
    }
    
    // Mark order as filled via API
    await fetch(`/api/paper-trading/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'filled', executionPrice }),
    });
    
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'filled' } : o));
    await refetchOrders();
    
    toast.success(locale === 'it' ? 'Ordine eseguito' : 'Order executed');
  };
  
  const handlePlaceOrder = async () => {
    if (!selectedSymbol.trim()) {
      toast.error(locale === 'it' ? 'Inserisci un simbolo' : 'Enter a symbol');
      return;
    }
    
    const qty = parseFloat(orderQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error(locale === 'it' ? 'Quantità non valida' : 'Invalid quantity');
      return;
    }
    
    // Get current price for market orders
    let executionPrice = 0;
    if (orderType === 'market') {
      const priceResult = await getCurrentPrice(selectedSymbol.toUpperCase(), selectedAssetType);
      if (!priceResult.price) {
        toast.error(locale === 'it' ? 'Impossibile ottenere prezzo' : 'Cannot get price');
        return;
      }
      executionPrice = priceResult.price;
    }
    
    // Create order
    const newOrder: PaperOrder = {
      id: `order-${Date.now()}`,
      symbol: selectedSymbol.toUpperCase(),
      assetType: selectedAssetType,
      orderType,
      side: orderSide,
      quantity: qty,
      limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
      stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
      trailingStopPercent: orderType === 'trailing_stop' ? parseFloat(trailingStopPercent) : undefined,
      status: orderType === 'market' ? 'filled' : 'pending',
      createdAt: new Date().toISOString(),
    };
    
    if (orderType === 'market') {
      await executeOrder(newOrder, executionPrice);
    } else {
      // Create order via API
      const orderResponse = await fetch('/api/paper-trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol.toUpperCase(),
          assetType: selectedAssetType,
          orderType,
          side: orderSide,
          quantity: qty,
          limitPrice: orderType === 'limit' ? parseFloat(limitPrice) : undefined,
          stopPrice: orderType === 'stop' ? parseFloat(stopPrice) : undefined,
          trailingStopPercent: orderType === 'trailing_stop' ? parseFloat(trailingStopPercent) : undefined,
        }),
      });
      
      if (orderResponse.ok) {
        const createdOrder = await orderResponse.json();
        const mappedOrder: PaperOrder = {
          id: createdOrder.id,
          symbol: createdOrder.symbol,
          assetType: (createdOrder as any).asset_type,
          orderType: createdOrder.order_type,
          side: createdOrder.side,
          quantity: parseFloat(createdOrder.quantity.toString()),
          limitPrice: createdOrder.limit_price ? parseFloat(createdOrder.limit_price.toString()) : undefined,
          stopPrice: createdOrder.stop_price ? parseFloat(createdOrder.stop_price.toString()) : undefined,
          trailingStopPercent: createdOrder.trailing_stop_percent ? parseFloat(createdOrder.trailing_stop_percent.toString()) : undefined,
          status: createdOrder.status,
          executionPrice: createdOrder.execution_price ? parseFloat(createdOrder.execution_price.toString()) : undefined,
          executionTime: createdOrder.execution_time,
          createdAt: createdOrder.created_at,
        };
        setOrders(prev => [...prev, mappedOrder]);
        await refetchOrders();
        toast.success(locale === 'it' ? 'Ordine piazzato' : 'Order placed');
      } else {
        toast.error(locale === 'it' ? 'Errore nel piazzare ordine' : 'Error placing order');
      }
    }
    
    // Reset form
    setShowOrderModal(false);
    setSelectedSymbol('');
    setOrderQuantity('');
    setLimitPrice('');
    setStopPrice('');
    setTrailingStopPercent('');
  };
  
  const handleClosePosition = async (position: PaperPosition) => {
    const currentPrice = priceUpdates[position.symbol] || position.currentPrice;
    const pnl = position.side === 'long'
      ? (currentPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - currentPrice) * position.quantity;
    
    // Close position via API
    const response = await fetch(`/api/paper-trading/positions/${position.id}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      
      setPositions(prev => prev.filter(p => p.id !== position.id));
      await refetchPositions();
      toast.success(locale === 'it' ? 'Posizione chiusa' : 'Position closed');
    } else {
      toast.error(locale === 'it' ? 'Errore nella chiusura posizione' : 'Error closing position');
    }
  };
  
  // Calculate portfolio stats
  const portfolioStats = useMemo<PortfolioStats>(() => {
    const totalPnL = positions.reduce((sum, p) => sum + p.unrealizedPnL, 0);
    const totalEquity = initialCapital + totalPnL;
    const totalExposure = positions.reduce((sum, p) => sum + (p.currentPrice * p.quantity), 0);
    const marginUsed = totalExposure;
    const marginAvailable = (initialCapital * maxLeverage) - marginUsed;
    const leverage = totalExposure / initialCapital;
    
    // Calculate win rate from closed positions (would need history)
    const winRate = 0; // TODO: Calculate from closed positions
    
    // Calculate Sharpe (simplified)
    const sharpeRatio = 0; // TODO: Calculate from returns
    
    // Calculate max drawdown
    const maxDrawdown = 0; // TODO: Calculate from equity curve
    
    return {
      totalEquity,
      totalPnL,
      totalPnLPercent: (totalPnL / initialCapital) * 100,
      openPositions: positions.length,
      totalExposure,
      marginUsed,
      marginAvailable,
      leverage,
      winRate,
      sharpeRatio,
      maxDrawdown,
    };
  }, [positions, initialCapital, maxLeverage]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Target className="w-6 h-6 text-accent" />
              {locale === 'it' ? 'Paper Trading' : 'Paper Trading'}
            </h2>
            <p className="text-text-secondary text-sm">
              {locale === 'it'
                ? 'Simula operazioni di trading in tempo reale usando prezzi reali. Ordini avanzati, risk management e portfolio analytics.'
                : 'Simulate trading operations in real-time using real prices. Advanced orders, risk management and portfolio analytics.'}
            </p>
          </div>
          
          {/* Trading Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-secondary">
              {locale === 'it' ? 'Modalità:' : 'Mode:'}
            </span>
            <div className="flex bg-bg-soft border border-border-subtle rounded-lg p-1">
              <button
                onClick={() => setTradingMode('paper')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  tradingMode === 'paper'
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {locale === 'it' ? 'Paper' : 'Paper'}
              </button>
              <button
                onClick={() => setTradingMode('real')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all',
                  tradingMode === 'real'
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {locale === 'it' ? 'Reale' : 'Real'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Coming Soon - Real-Time Data */}
        <div className="mt-4 bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-text-primary">
                  {locale === 'it' ? 'Dati Real-Time' : 'Real-Time Data'}
                </span>
                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 rounded text-[10px] text-blue-300 font-semibold">
                  {locale === 'it' ? 'Presto Disponibile' : 'Coming Soon'}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {locale === 'it'
                  ? 'Attualmente i prezzi vengono aggiornati ogni 5 secondi. Streaming real-time con WebSocket e aggiornamenti < 1 secondo saranno disponibili nell\'upgrade previsto per Q2 2025. Questo ti permetterà di tradare con latenza minima e precisione istituzionale.'
                  : 'Currently prices update every 5 seconds. Real-time streaming with WebSocket and < 1 second updates will be available in the upgrade scheduled for Q2 2025. This will allow you to trade with minimal latency and institutional precision.'}
              </p>
              <div className="mt-2 text-[10px] text-text-tertiary">
                {locale === 'it'
                  ? 'Upgrade previsto: Q2 2025'
                  : 'Upgrade scheduled: Q2 2025'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs text-text-tertiary mb-1">
            {locale === 'it' ? 'Equity Totale' : 'Total Equity'}
          </div>
          <div className="text-lg sm:text-2xl font-bold text-text-primary">
            {formatCurrency(portfolioStats.totalEquity)}
          </div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs text-text-tertiary mb-1">
            {locale === 'it' ? 'P&L Totale' : 'Total P&L'}
          </div>
          <div className={cn(
            'text-lg sm:text-2xl font-bold',
            portfolioStats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {formatCurrency(portfolioStats.totalPnL)}
            <span className="text-sm ml-1">
              ({portfolioStats.totalPnLPercent >= 0 ? '+' : ''}{portfolioStats.totalPnLPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs text-text-tertiary mb-1">
            {locale === 'it' ? 'Posizioni Aperte' : 'Open Positions'}
          </div>
          <div className="text-lg sm:text-2xl font-bold text-text-primary">
            {portfolioStats.openPositions}
          </div>
        </div>
        <div className="bg-bg-soft border border-border-subtle rounded-xl p-3 sm:p-4">
          <div className="text-xs text-text-tertiary mb-1">
            {locale === 'it' ? 'Leverage' : 'Leverage'}
          </div>
          <div className={cn(
            'text-lg sm:text-2xl font-bold',
            portfolioStats.leverage > maxLeverage * 0.8 ? 'text-red-400' : 'text-text-primary'
          )}>
            {portfolioStats.leverage.toFixed(2)}x
          </div>
        </div>
      </div>
      
      {/* Risk Management Settings */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          {locale === 'it' ? 'Risk Management' : 'Risk Management'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {locale === 'it' ? 'Max Position Size (%)' : 'Max Position Size (%)'}
            </label>
            <input
              type="number"
              value={maxPositionSize}
              onChange={(e) => setMaxPositionSize(parseInt(e.target.value) || 20)}
              min={1}
              max={100}
              className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {locale === 'it' ? 'Max Leverage' : 'Max Leverage'}
            </label>
            <input
              type="number"
              value={maxLeverage}
              onChange={(e) => setMaxLeverage(parseFloat(e.target.value) || 2)}
              min={1}
              max={10}
              step={0.5}
              className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {locale === 'it' ? 'Max Drawdown (%)' : 'Max Drawdown (%)'}
            </label>
            <input
              type="number"
              value={maxDrawdownLimit}
              onChange={(e) => setMaxDrawdownLimit(parseInt(e.target.value) || 20)}
              min={5}
              max={50}
              className="w-full px-3 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
            />
          </div>
        </div>
      </div>
      
      {/* Place Order Button */}
      <button
        onClick={() => setShowOrderModal(true)}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-accent to-accent-hover text-white rounded-lg font-semibold hover:shadow-lg transition-all"
      >
        <Plus className="w-5 h-5" />
        {locale === 'it' ? 'Piazza Ordine' : 'Place Order'}
      </button>
      
      {/* Open Positions */}
      {positions.length > 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {locale === 'it' ? 'Posizioni Aperte' : 'Open Positions'}
          </h3>
          <div className="space-y-3">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-bg-soft border border-border-subtle rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-text-primary">{position.symbol}</span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      position.side === 'long' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                    )}>
                      {position.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {locale === 'it' ? 'Entry' : 'Entry'}: {formatCurrency(position.entryPrice)} × {position.quantity}
                    {' • '}
                    {locale === 'it' ? 'Attuale' : 'Current'}: {formatCurrency(position.currentPrice)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={cn(
                      'text-lg font-bold',
                      position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {formatCurrency(position.unrealizedPnL)}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleClosePosition(position)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    {locale === 'it' ? 'Chiudi' : 'Close'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Pending Orders */}
      {orders.filter(o => o.status === 'pending').length > 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {locale === 'it' ? 'Ordini Pendenti' : 'Pending Orders'}
          </h3>
          <div className="space-y-3">
            {orders.filter(o => o.status === 'pending').map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-bg-soft border border-border-subtle rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-text-primary">{order.symbol}</span>
                    <span className="text-xs px-2 py-1 rounded bg-amber-400/20 text-amber-400">
                      {order.orderType.toUpperCase()}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded',
                      order.side === 'buy' ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                    )}>
                      {order.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {locale === 'it' ? 'Quantità' : 'Quantity'}: {order.quantity}
                    {order.limitPrice && ` • Limit: ${formatCurrency(order.limitPrice)}`}
                    {order.stopPrice && ` • Stop: ${formatCurrency(order.stopPrice)}`}
                    {order.trailingStopPercent && ` • Trailing: ${order.trailingStopPercent}%`}
                  </div>
                </div>
                <button
                  onClick={() => setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  {locale === 'it' ? 'Cancella' : 'Cancel'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                {locale === 'it' ? 'Piazza Ordine' : 'Place Order'}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-8 h-8 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Symbol */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {locale === 'it' ? 'Simbolo' : 'Symbol'}
                </label>
                <input
                  type="text"
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL, BTC, EURUSD"
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              
              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {locale === 'it' ? 'Tipo Asset' : 'Asset Type'}
                </label>
                <select
                  value={selectedAssetType}
                  onChange={(e) => setSelectedAssetType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
                >
                  <option value="stock">{locale === 'it' ? 'Stock' : 'Stock'}</option>
                  <option value="crypto">{locale === 'it' ? 'Crypto' : 'Crypto'}</option>
                  <option value="forex">{locale === 'it' ? 'Forex' : 'Forex'}</option>
                </select>
              </div>
              
              {/* Order Type */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {locale === 'it' ? 'Tipo Ordine' : 'Order Type'}
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
                >
                  <option value="market">{locale === 'it' ? 'Market' : 'Market'}</option>
                  <option value="limit">{locale === 'it' ? 'Limit' : 'Limit'}</option>
                  <option value="stop">{locale === 'it' ? 'Stop' : 'Stop'}</option>
                  <option value="trailing_stop">{locale === 'it' ? 'Trailing Stop' : 'Trailing Stop'}</option>
                </select>
              </div>
              
              {/* Side */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {locale === 'it' ? 'Lato' : 'Side'}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderSide('buy')}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
                      orderSide === 'buy'
                        ? 'bg-green-500 text-white'
                        : 'bg-bg-soft text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {locale === 'it' ? 'Compra' : 'Buy'}
                  </button>
                  <button
                    onClick={() => setOrderSide('sell')}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg font-medium transition-all',
                      orderSide === 'sell'
                        ? 'bg-red-500 text-white'
                        : 'bg-bg-soft text-text-secondary hover:text-text-primary'
                    )}
                  >
                    {locale === 'it' ? 'Vendi' : 'Sell'}
                  </button>
                </div>
              </div>
              
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {locale === 'it' ? 'Quantità' : 'Quantity'}
                </label>
                <input
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  placeholder="1.0"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
                />
              </div>
              
              {/* Limit Price */}
              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {locale === 'it' ? 'Prezzo Limite' : 'Limit Price'}
                  </label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="100.00"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
                  />
                </div>
              )}
              
              {/* Stop Price */}
              {orderType === 'stop' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {locale === 'it' ? 'Prezzo Stop' : 'Stop Price'}
                  </label>
                  <input
                    type="number"
                    value={stopPrice}
                    onChange={(e) => setStopPrice(e.target.value)}
                    placeholder="95.00"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
                  />
                </div>
              )}
              
              {/* Trailing Stop Percent */}
              {orderType === 'trailing_stop' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {locale === 'it' ? 'Trailing Stop (%)' : 'Trailing Stop (%)'}
                  </label>
                  <input
                    type="number"
                    value={trailingStopPercent}
                    onChange={(e) => setTrailingStopPercent(e.target.value)}
                    placeholder="5.0"
                    step="0.1"
                    min="0.1"
                    max="20"
                    className="w-full px-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={handlePlaceOrder}
                className="flex-1 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg font-semibold transition-all"
              >
                {locale === 'it' ? 'Piazza Ordine' : 'Place Order'}
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-6 py-3 bg-bg-soft hover:bg-bg-surface text-text-primary rounded-lg font-medium transition-colors"
              >
                {locale === 'it' ? 'Annulla' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
