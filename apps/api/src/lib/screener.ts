import { BinanceProvider } from '../providers/binance';

export type ScreenerProfile = 'A' | 'B';

export type ScreenerSymbol = {
  symbol: string;
  spreadPct: number;
  depth: number;
  volume24h: number;
  fundingRate: number;
};

export type ScreenerSnapshot = {
  profile: ScreenerProfile;
  kDynamic: number;
  kCap: number;
  totalScreened: number;
  topK: ScreenerSymbol[];
  watchlistFinal: ScreenerSymbol[];
};

// Use an explicit type guard so TS correctly narrows arrays from (T | null)[] to T[].
const isScreenerSymbol = (x: ScreenerSymbol | null): x is ScreenerSymbol => x !== null;

export const buildScreenerSnapshot = async (profile: ScreenerProfile): Promise<ScreenerSnapshot> => {
  const binance = new BinanceProvider();

  const [exchangeInfo, bookTickers, dayTickers, premiumIndex] = await Promise.all([
    binance.getExchangeInfo(),
    binance.getBookTickers(),
    binance.get24hTickers(),
    binance.getPremiumIndex()
  ]);

  const tradableSymbols = exchangeInfo.symbols
    .filter((symbol: any) =>
      symbol.status === 'TRADING' &&
      symbol.quoteAsset === 'USDT' &&
      symbol.contractType === 'PERPETUAL'
    )
    .map((symbol: any) => symbol.symbol);

  const bookBySymbol = new Map(bookTickers.map((ticker: any) => [ticker.symbol, ticker]));
  const dayBySymbol = new Map(dayTickers.map((ticker: any) => [ticker.symbol, ticker]));
  const premiumBySymbol = new Map(premiumIndex.map((item: any) => [item.symbol, item]));

  const metrics: ScreenerSymbol[] = tradableSymbols
    .map((symbol: string): ScreenerSymbol | null => {
      const book = bookBySymbol.get(symbol);
      const day = dayBySymbol.get(symbol);
      const premium = premiumBySymbol.get(symbol);

      if (!book || !day || !premium) {
        return null;
      }

      const bid = parseFloat(book.bidPrice);
      const ask = parseFloat(book.askPrice);
      const bidQty = parseFloat(book.bidQty);
      const askQty = parseFloat(book.askQty);
      const mid = (bid + ask) / 2;

      const spreadPct = mid > 0 ? (ask - bid) / mid : 1;
      const depth = bidQty + askQty;
      const volume24h = parseFloat(day.quoteVolume || day.volume);
      const fundingRate = parseFloat(premium.lastFundingRate ?? premium.fundingRate);

      return {
        symbol,
        spreadPct,
        depth,
        volume24h,
        fundingRate
      };
    })
    .filter(isScreenerSymbol);

  const sortedByVolume = [...metrics].sort((a, b) => b.volume24h - a.volume24h);
  const totalScreened = sortedByVolume.length;
  const kCap = profile === 'A' ? 30 : 15;
  const kDynamic = Math.min(kCap, Math.max(5, Math.round(totalScreened * 0.08)));
  const topK = sortedByVolume.slice(0, kDynamic);

  const depthValues = topK.map((item) => item.depth).sort((a, b) => a - b);
  const depthIndex = Math.floor(depthValues.length * (profile === 'A' ? 0.4 : 0.6));
  const depthMin = depthValues[depthIndex] ?? 0;

  const spreadMax = profile === 'A' ? 0.0012 : 0.001;
  const fundingAbsMin = profile === 'A' ? 0.00015 : 0.00025;

  const watchlistFinal = topK.filter((item) => {
    const fundingAbs = Math.abs(item.fundingRate);
    return item.spreadPct <= spreadMax &&
      item.depth >= depthMin &&
      fundingAbs >= fundingAbsMin;
  });

  return {
    profile,
    kDynamic,
    kCap,
    totalScreened,
    topK,
    watchlistFinal
  };
};
