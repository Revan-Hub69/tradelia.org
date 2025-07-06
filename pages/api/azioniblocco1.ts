import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const TWELVE_API_KEY = process.env.TWELVE_API_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const symbol = req.query.symbol as string;
  if (!symbol) return res.status(400).json({ error: 'Missing symbol parameter' });

  try {
    const [profileRes, quoteRes, prices7dRes, prices30dRes] = await Promise.all([
      axios.get(`https://yh-finance.p.rapidapi.com/stock/v2/get-profile`, {
        params: { symbol, region: 'US' },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
        },
      }),
      axios.get(`https://yh-finance.p.rapidapi.com/market/v2/get-quotes`, {
        params: { symbols: symbol, region: 'US' },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
        },
      }),
      axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=7&apikey=${TWELVE_API_KEY}`),
      axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_API_KEY}`),
    ]);

    const profile = profileRes.data;
    const quote = quoteRes.data.quoteResponse.result[0];

    const price7dClose = parseFloat(prices7dRes.data.values[0].close);
    const price7dPast = parseFloat(prices7dRes.data.values[6].close);
    const variation7d = ((price7dClose - price7dPast) / price7dPast) * 100;

    const price30dClose = parseFloat(prices30dRes.data.values[0].close);
    const price30dPast = parseFloat(prices30dRes.data.values[29].close);
    const variation30d = ((price30dClose - price30dPast) / price30dPast) * 100;

    res.status(200).json({
      ticker: quote.symbol,
      isin: profile.isin || null,
      exchange: quote.fullExchangeName,
      sector: profile.assetProfile?.sector || null,
      industry: profile.assetProfile?.industry || null,
      ipoDate: profile.assetProfile?.ipoDate || null,
      indexMembership: profile.summaryProfile?.index || null,
      legalCountry: profile.assetProfile?.country || null,
      type: profile.quoteType || null,
      currency: quote.currency,

      marketCap: quote.marketCap,
      sharesOutstanding: quote.sharesOutstanding,
      freeFloat: null, // not directly available
      currentPrice: quote.regularMarketPrice,
      targetMeanPrice: profile.financialData?.targetMeanPrice || null,
      ratingAnalysts: null, // to be added later if available

      variation24h: quote.regularMarketChangePercent,
      variation7d: variation7d.toFixed(2),
      variation30d: variation30d.toFixed(2),

      yearHigh: quote.fiftyTwoWeekHigh,
      yearLow: quote.fiftyTwoWeekLow,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
