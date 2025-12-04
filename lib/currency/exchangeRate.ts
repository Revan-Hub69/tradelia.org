/**
 * Exchange Rate API
 * Fetches real-time EUR/USD exchange rate
 * Uses exchangerate-api.com (free tier) or fallback to static rate
 */

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/EUR';
const CACHE_KEY = 'tradelia_exchange_rate';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface ExchangeRateResponse {
  rates: {
    USD: number;
  };
  date: string;
}

let cachedRate: { rate: number; timestamp: number } | null = null;

/**
 * Get EUR/USD exchange rate
 * Uses cached value if available and fresh, otherwise fetches from API
 */
export async function getExchangeRate(): Promise<number> {
  // Check cache first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rate, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          return rate;
        }
      }
    } catch (error) {
      console.warn('Error reading exchange rate cache:', error);
    }
  }

  // Check in-memory cache
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
    return cachedRate.rate;
  }

  try {
    // Fetch from API
    const response = await fetch(EXCHANGE_RATE_API, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data: ExchangeRateResponse = await response.json();
    const rate = data.rates.USD;

    // Cache the rate
    cachedRate = { rate, timestamp: Date.now() };
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
      } catch (error) {
        console.warn('Error caching exchange rate:', error);
      }
    }

    return rate;
  } catch (error) {
    console.warn('Error fetching exchange rate, using fallback:', error);
    
    // Fallback to default rate
    const fallbackRate = 1.10;
    
    // Cache fallback
    cachedRate = { rate: fallbackRate, timestamp: Date.now() };
    
    return fallbackRate;
  }
}

/**
 * Get exchange rate synchronously (from cache only)
 * Returns null if not cached
 */
export function getCachedExchangeRate(): number | null {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rate, timestamp } = JSON.parse(cached);
        const now = Date.now();
        if (now - timestamp < CACHE_DURATION) {
          return rate;
        }
      }
    } catch (error) {
      // Ignore
    }
  }

  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
    return cachedRate.rate;
  }

  return null;
}
