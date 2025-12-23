import axios, { AxiosInstance } from 'axios';
import crypto from 'node:crypto';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

function sanitizeParams(params: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    out[k] = typeof v === 'string' ? v : String(v);
  }
  return out;
}

function extractBinanceErrorMessage(err: any): string {
  const data = err?.response?.data;
  if (data?.msg) return `${data.code ?? 'BINANCE_ERROR'}: ${data.msg}`;
  return err?.message ?? 'Unknown error';
}

export class BinanceProvider {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseURL: string;

  constructor(options?: { apiKey?: string; apiSecret?: string; baseURL?: string }) {
    this.apiKey = options?.apiKey ?? process.env.BINANCE_API_KEY ?? '';
    this.apiSecret = options?.apiSecret ?? process.env.BINANCE_API_SECRET ?? '';

    this.baseURL =
      options?.baseURL ??
      (process.env.BINANCE_ENV === 'live'
        ? 'https://fapi.binance.com'
        : 'https://testnet.binancefuture.com');

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15_000
    });
  }

  private ensureSignedCredentials() {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('BINANCE_API_KEY and BINANCE_API_SECRET are required for signed requests.');
    }
  }

  private sign(queryString: string): string {
    return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
  }

  private async makeSignedRequest(
    method: HttpMethod,
    endpoint: string,
    params: Record<string, unknown> = {}
  ) {
    this.ensureSignedCredentials();

    const timestamp = Date.now();
    const recvWindow = (params.recvWindow ?? 5000) as number;

    const cleaned = sanitizeParams({
      ...params,
      timestamp,
      recvWindow
    });

    const queryString = new URLSearchParams(cleaned).toString();
    const signature = this.sign(queryString);
    const finalQuery = `${queryString}&signature=${signature}`;

    try {
      const response = await this.client.request({
        method,
        url: `${endpoint}?${finalQuery}`,
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
      this.enforceRateLimits(response.headers);
      return response;
    } catch (err) {
      throw new Error(extractBinanceErrorMessage(err));
    }
  }

  private enforceRateLimits(headers: Record<string, string | string[] | undefined>) {
    const weightBudget = Number(process.env.BINANCE_IP_WEIGHT_BUDGET_1M ?? 0);
    const orderBudget1m = Number(process.env.BINANCE_ORDER_BUDGET_1M ?? 0);
    const orderBudget10s = Number(process.env.BINANCE_ORDER_BUDGET_10S ?? 0);
    const softThreshold = Number(process.env.BINANCE_RL_SOFT_THRESHOLD ?? 0);
    const hardThreshold = Number(process.env.BINANCE_RL_HARD_THRESHOLD ?? 0);

    if (!weightBudget && !orderBudget1m && !orderBudget10s) {
      return;
    }

    const usedWeight = Number(headers['x-mbx-used-weight-1m'] ?? 0);
    const orderCount1m = Number(headers['x-mbx-order-count-1m'] ?? 0);
    const orderCount10s = Number(headers['x-mbx-order-count-10s'] ?? 0);

    const weightHard = weightBudget && hardThreshold ? weightBudget * hardThreshold : 0;
    const orderHard1m = orderBudget1m && hardThreshold ? orderBudget1m * hardThreshold : 0;
    const orderHard10s = orderBudget10s && hardThreshold ? orderBudget10s * hardThreshold : 0;

    if (weightHard && usedWeight >= weightHard) {
      throw new Error('BINANCE_RATE_LIMIT: IP weight hard threshold exceeded');
    }
    if (orderHard1m && orderCount1m >= orderHard1m) {
      throw new Error('BINANCE_RATE_LIMIT: order count 1m hard threshold exceeded');
    }
    if (orderHard10s && orderCount10s >= orderHard10s) {
      throw new Error('BINANCE_RATE_LIMIT: order count 10s hard threshold exceeded');
    }

    const weightSoft = weightBudget && softThreshold ? weightBudget * softThreshold : 0;
    const orderSoft1m = orderBudget1m && softThreshold ? orderBudget1m * softThreshold : 0;
    const orderSoft10s = orderBudget10s && softThreshold ? orderBudget10s * softThreshold : 0;

    if (
      (weightSoft && usedWeight >= weightSoft) ||
      (orderSoft1m && orderCount1m >= orderSoft1m) ||
      (orderSoft10s && orderCount10s >= orderSoft10s)
    ) {
      throw new Error('BINANCE_RATE_LIMIT: soft threshold exceeded');
    }
  }

  async setMarginType(symbol: string, marginType: 'ISOLATED' | 'CROSS'): Promise<void> {
    try {
      await this.makeSignedRequest('POST', '/fapi/v1/marginType', { symbol, marginType });
    } catch (err: any) {
      const msg = String(err?.message ?? '');
      if (msg.includes('No need to change margin type')) return;
      throw err;
    }
  }

  async setLeverage(symbol: string, leverage: number): Promise<void> {
    try {
      await this.makeSignedRequest('POST', '/fapi/v1/leverage', { symbol, leverage });
    } catch (err: any) {
      const msg = String(err?.message ?? '');
      if (msg.includes('No need to change leverage')) return;
      throw err;
    }
  }

  async createOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP_MARKET';
    quantity: string;
    price?: string;
    stopPrice?: string;
    clientOrderId?: string;
    reduceOnly?: boolean;
  }): Promise<any> {
    const { clientOrderId, ...rest } = params;

    const response = await this.makeSignedRequest('POST', '/fapi/v1/order', {
      ...rest,
      ...(clientOrderId ? { newClientOrderId: clientOrderId } : {})
    });

    return response.data;
  }

  async getOrderBookDepth(symbol: string, limit = 20): Promise<any> {
    const response = await this.client.get('/fapi/v1/depth', {
      params: { symbol, limit }
    });
    this.enforceRateLimits(response.headers);
    return response.data;
  }
}
