import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const FMP_API_KEY = process.env.FMP_API_KEY!;
const TWELVE_API_KEY = process.env.TWELVE_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const symbol = req.query.symbol as string;
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  try {
    const [
      profileRes,
      quoteRes,
      ratingRes,
      targetRes,
      price7dRes,
      price30dRes
    ] = await Promise.all([
      axios.get(https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}),
      axios.get(https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${FMP_API_KEY}),
      axios.get(https://financialmodelingprep.com/api/v3/rating/${symbol}?apikey=${FMP_API_KEY}),
      axios.get(https://financialmodelingprep.com/api/v3/price-target/${symbol}?apikey=${FMP_API_KEY}),
      axios.get(https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=7&apikey=${TWELVE_API_KEY}),
      axios.get(https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_API_KEY})
    ]);

    const profile = profileRes.data[0];
    const quote = quoteRes.data[0];
    const rating = ratingRes.data[0];
    const target = targetRes.data[0];

    const price7dClose = parseFloat(price7dRes.data.values[0].close);
    const price7dPast = parseFloat(price7dRes.data.values[6].close);
    const var7d = ((price7dClose - price7dPast) / price7dPast) * 100;

    const price30dClose = parseFloat(price30dRes.data.values[0].close);
    const price30dPast = parseFloat(price30dRes.data.values[29].close);
    const var30d = ((price30dClose - price30dPast) / price30dPast) * 100;

    res.status(200).json({
      ticker: profile.symbol,
      isin: profile.isin,
      exchange: profile.exchangeShortName,
      sector: profile.sector,
      industry: profile.industry,
      marketCap: quote.marketCap,
      sharesOutstanding: quote.sharesOutstanding,
      freeFloat: profile.floatShares,
      price: quote.price,
      priceTarget: target.targetMean,
      rating: rating.rating,
      variation24h: quote.changesPercentage,
      variation7d: var7d.toFixed(2),
      variation30d: var30d.toFixed(2),
      high: quote.yearHigh,
      low: quote.yearLow,
      ipoDate: profile.ipoDate,
      indices: profile.index,
      currency: profile.currency,
      country: profile.country,
      type: profile.exchange
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
} 
