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

  constructor() {
    this.apiKey = process.env.BINANCE_API_KEY || '';
    this.apiSecret = process.env.BINANCE_API_SECRET || '';

    this.baseURL =
      process.env.BINANCE_ENV === 'live'
        ? 'https://fapi.binance.com'
        : 'https://testnet.binancefuture.com';

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
      return await this.client.request({
        method,
        url: `${endpoint}?${finalQuery}`,
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
    } catch (err) {
      throw new Error(extractBinanceErrorMessage(err));
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
}
