# 📋 Lista Completa Endpoint da Correggere (Rimozione Mock Data)

## ✅ Già Corretti
- [x] `/api/market-indicators/stock-indexes`
- [x] `/api/market-indicators/yield-curve`
- [x] `/api/crypto/exchange-flows`
- [x] `/api/market/ipo-calendar`
- [x] `/api/market-indicators/currency-strength-index` (parziale)

## ⚠️ Da Correggere (88+ endpoint)

### Market Indicators
- [ ] `/api/market-indicators/currency-strength-index` (completare implementazione reale)
- [ ] `/api/market-indicators/crypto-correlation-matrix`
- [ ] `/api/market-indicators/european-economic-indicators`
- [ ] `/api/market-indicators/cumulative-delta`
- [ ] `/api/market-indicators/order-flow-imbalance`
- [ ] `/api/market-indicators/global-central-bank-rates`
- [ ] `/api/market-indicators/global-inflation`
- [ ] `/api/market-indicators/global-pmi`
- [ ] `/api/market-indicators/ichimoku-cloud`
- [ ] `/api/market-indicators/fibonacci-retracements`
- [ ] `/api/market-indicators/support-resistance-levels`
- [ ] `/api/market-indicators/volume-profile`
- [ ] `/api/market-indicators/advance-decline-line`
- [ ] `/api/market-indicators/market-breadth`
- [ ] `/api/market-indicators/mcclellan-oscillator`
- [ ] `/api/market-indicators/arms-index`
- [ ] `/api/market-indicators/momentum-composite`
- [ ] `/api/market-indicators/volatility-composite`
- [ ] `/api/market-indicators/sentiment-composite`
- [ ] `/api/market-indicators/short-interest`
- [ ] `/api/market-indicators/put-call-ratio`
- [ ] `/api/market-indicators/vix-term-structure`
- [ ] `/api/market-indicators/credit-spreads`
- [ ] `/api/market-indicators/aaii-sentiment`
- [ ] `/api/market-indicators/high-low-index`
- [ ] `/api/market-indicators/technical-indicators`
- [ ] `/api/market-indicators/money-flow-index`
- [ ] `/api/market-indicators/on-balance-volume`
- [ ] `/api/market-indicators/williams-r`
- [ ] `/api/market-indicators/commodity-channel-index`
- [ ] `/api/market-indicators/average-true-range`
- [ ] `/api/market-indicators/parabolic-sar`
- [ ] `/api/market-indicators/adx`
- [ ] `/api/market-indicators/rate-of-change`
- [ ] `/api/market-indicators/chaikin-money-flow`
- [ ] `/api/market-indicators/accumulation-distribution`
- [ ] `/api/market-indicators/percentage-price-oscillator`
- [ ] `/api/market-indicators/consumer-confidence`
- [ ] `/api/market-indicators/retail-sales`
- [ ] `/api/market-indicators/industrial-production`
- [ ] `/api/market-indicators/italian-indexes`
- [ ] `/api/market-indicators/cot-reports`
- [ ] `/api/market-indicators/commodity-rotation`
- [ ] `/api/market-indicators/futures-term-structure`
- [ ] `/api/market-indicators/etf-rotations`

### Crypto
- [ ] `/api/crypto/crypto-correlation-matrix`
- [ ] `/api/crypto/exchange-netflows`
- [ ] `/api/crypto/exchange-reserves`
- [ ] `/api/crypto/funding-rates`
- [ ] `/api/crypto/long-short-ratio`
- [ ] `/api/crypto/stablecoin-supply-ratio`
- [ ] `/api/crypto/whale-analysis`
- [ ] `/api/crypto/social-sentiment`
- [ ] `/api/crypto/active-addresses`

### Market
- [ ] `/api/market/insider-trading`
- [ ] `/api/market/economic-calendar`
- [ ] `/api/market/corporate-events`
- [ ] `/api/market/sentiment`

### Economic
- [ ] `/api/economic/calendar`

## Strategia

Per ogni endpoint:
1. Rimuovere TUTTI i mock/simulate data
2. Verificare che usi API keys reali
3. Restituire errore 503 se API key non configurata
4. Restituire errore 500 se fetch fallisce
5. Rimuovere commenti "simulate" o "mock"
