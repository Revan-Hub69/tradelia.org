type ExchangeFilter = {
  filterType: string;
  tickSize?: string;
  stepSize?: string;
  minNotional?: string;
  notional?: string;
};

type ExchangeSymbol = {
  symbol: string;
  filters: ExchangeFilter[];
};

export type SymbolFilters = {
  tickSize: number;
  stepSize: number;
  minNotional: number;
};

export const getSymbolFilters = (exchangeInfo: { symbols: ExchangeSymbol[] }, symbol: string): SymbolFilters | null => {
  const symbolInfo = exchangeInfo.symbols.find((item) => item.symbol === symbol);
  if (!symbolInfo) {
    return null;
  }

  const priceFilter = symbolInfo.filters.find((filter) => filter.filterType === 'PRICE_FILTER');
  const lotFilter = symbolInfo.filters.find((filter) => filter.filterType === 'LOT_SIZE');
  const minNotionalFilter = symbolInfo.filters.find((filter) =>
    filter.filterType === 'MIN_NOTIONAL' || filter.filterType === 'NOTIONAL'
  );

  const tickSize = priceFilter?.tickSize ? parseFloat(priceFilter.tickSize) : 0;
  const stepSize = lotFilter?.stepSize ? parseFloat(lotFilter.stepSize) : 0;
  const minNotional = minNotionalFilter?.minNotional
    ? parseFloat(minNotionalFilter.minNotional)
    : minNotionalFilter?.notional
      ? parseFloat(minNotionalFilter.notional)
      : 0;

  if (!tickSize || !stepSize) {
    return null;
  }

  return {
    tickSize,
    stepSize,
    minNotional
  };
};

export const roundToStep = (value: number, step: number): number => {
  if (!step) {
    return value;
  }
  const precision = Math.max(0, Math.ceil(-Math.log10(step)));
  const rounded = Math.floor(value / step) * step;
  return parseFloat(rounded.toFixed(precision));
};
