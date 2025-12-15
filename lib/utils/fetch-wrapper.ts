/**
 * Fetch Wrapper
 * Disattiva tutte le chiamate API quando API_CONFIG.DISABLE_API_CALLS è true
 * Fornisce dati mock per mantenere il design visibile
 */

import { API_CONFIG } from '@/lib/config/api';
import { MOCK_INDICATORS, MOCK_NEWS, MOCK_ECONOMIC_EVENTS, MOCK_IPOS, MOCK_CORPORATE_EVENTS } from '@/lib/config/mock-data';

// Mock responses per diverse route
const getMockResponse = (url: string): any => {
  // Market indicators
  if (url.includes('/api/market-indicators/vix')) {
    return { success: true, value: MOCK_INDICATORS.vix.value, change: MOCK_INDICATORS.vix.change, changePercent: MOCK_INDICATORS.vix.changePercent };
  }
  if (url.includes('/api/market-indicators/vix-term-structure')) {
    return { success: true, data: { contangoPercent: MOCK_INDICATORS['vix-term-structure'].contangoPercent } };
  }
  if (url.includes('/api/market-indicators/put-call-ratio')) {
    return { success: true, data: { totalPutCallRatio: MOCK_INDICATORS['put-call-ratio'].totalPutCallRatio } };
  }
  if (url.includes('/api/market-indicators/yield-curve')) {
    return { success: true, data: { spread: MOCK_INDICATORS['yield-curve'].spread } };
  }
  if (url.includes('/api/market-indicators/credit-spreads')) {
    return { success: true, data: { baa10y: MOCK_INDICATORS['credit-spreads'].baa10y } };
  }
  if (url.includes('/api/market-indicators/fear-greed')) {
    return { success: true, value: MOCK_INDICATORS['fear-greed'].value };
  }
  if (url.includes('/api/market-indicators/bitcoin-dominance')) {
    return { success: true, dominance: MOCK_INDICATORS['bitcoin-dominance'].dominance };
  }
  if (url.includes('/api/market-indicators/crypto-market-cap')) {
    return { success: true, totalMarketCap: MOCK_INDICATORS['crypto-market-cap'].totalMarketCap };
  }
  
  // Market data
  if (url.includes('/api/market/data')) {
    const symbol = new URL(url).searchParams.get('symbol');
    if (symbol === 'SPY') {
      return { success: true, data: { currentPrice: MOCK_INDICATORS.spy.currentPrice, change24hPercent: MOCK_INDICATORS.spy.change24hPercent } };
    }
    if (symbol === 'QQQ') {
      return { success: true, data: { currentPrice: MOCK_INDICATORS.qqq.currentPrice, change24hPercent: MOCK_INDICATORS.qqq.change24hPercent } };
    }
    if (symbol === 'EURUSD') {
      return { success: true, data: { currentPrice: MOCK_INDICATORS.eurusd.currentPrice, change24hPercent: MOCK_INDICATORS.eurusd.change24hPercent } };
    }
    if (symbol === 'GOLD') {
      return { success: true, data: { currentPrice: MOCK_INDICATORS.gold.currentPrice, change24hPercent: MOCK_INDICATORS.gold.change24hPercent } };
    }
  }
  
  // News
  if (url.includes('/api/news/rss')) {
    return { success: true, data: MOCK_NEWS };
  }
  
  // Economic calendar
  if (url.includes('/api/economic/calendar')) {
    return { success: true, data: MOCK_ECONOMIC_EVENTS };
  }
  
  // IPO calendar
  if (url.includes('/api/market/ipo-calendar')) {
    return { success: true, data: { ipos: MOCK_IPOS } };
  }
  
  // Corporate events
  if (url.includes('/api/market/corporate-events')) {
    return { success: true, data: MOCK_CORPORATE_EVENTS };
  }
  
  // Default mock response
  return { success: true, data: null };
};

// Wrapper per fetch globale
export const mockFetch = async (url: string | Request | URL, init?: RequestInit): Promise<Response> => {
  if (API_CONFIG.DISABLE_API_CALLS) {
    const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
    const mockData = getMockResponse(urlString);
    
    // Simula un breve delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // Chiamata API normale
  return fetch(url, init);
};

// Sostituisci fetch globale solo in development
if (typeof window !== 'undefined' && API_CONFIG.DISABLE_API_CALLS) {
  // Non sovrascriviamo fetch globale, ma forniamo un helper
  (window as any).__MOCK_FETCH__ = mockFetch;
}
