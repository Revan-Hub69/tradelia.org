# Tradelia Operational Specification — TESTNET → LIVE Transition

Version: 1.0
Status: Operational Ready
Scope: OMS Idempotent, Rate-Limit/Circuit-Breaker, Position Management Flow

## 1) Single Toggle: TESTNET vs LIVE

### Environment Variable
```
EXCHANGE_ENV=testnet|live
```

### Base URLs (USDT-M Futures)

#### LIVE
- **REST**: `https://fapi.binance.com`
- **WS**: `wss://fstream.binance.com`

#### TESTNET
- **REST**: `https://testnet.binancefuture.com`
- **WS**: `wss://stream.binancefuture.com`

**Practical Note**: Market data can be taken from LIVE WS (more reliable/rich) even when executing on testnet; execution happens on testnet REST. This is normal practice.

## 2) Environment Variables (Core Required)

### Core Exchange
```
BINANCE_API_KEY=...
BINANCE_API_SECRET=...
EXCHANGE_ENV=testnet|live
TRADING_ENABLED=true|false          # Software kill-switch
MODE=testnet|micro_live|full_live   # Optional: different limits per mode
```

### Universe & Screener
```
SCREENER_TOP_K=20
SCREENER_REFRESH_SEC=60
MAX_CONCURRENT_POSITIONS=2
MAX_SYMBOLS_TRACKED=60               # Prevent WS/CPU overload
```

### Risk Management (Level B)
```
RISK_PER_TRADE_PCT=0.25              # Example: 0.25%
DAILY_MAX_LOSS_PCT=1.5
MAX_LEVERAGE_DEFAULT=5
MAX_LEVERAGE_STRESS=2
COOLDOWN_AFTER_LOSS_MIN=15
MAX_TRADES_PER_SYMBOL_PER_DAY=6
```

### Quality Gates / Kill Thresholds
```
WS_LAG_FAIL_MS=1500
BOOK_GAP_FAIL_MS=2000
SPREAD_MULT_FAIL=3.0
MARK_INDEX_FAIL_BPS=30
ERROR_STORM_FAIL=8                   # OMS errors in N seconds
```

### OMS / Rate Limiting
```
BINANCE_REST_TIMEOUT_MS=4000
BINANCE_RETRY_MAX=3
BINANCE_RETRY_BASE_MS=250
BINANCE_CB_OPEN_SEC=30               # Circuit breaker open time
```

## 3) Rate Limit, Backoff, Circuit Breaker (Non-Negotiable)

### Rules
- Every REST call goes through a "limiter"
- On 429 or 418: freeze trading for that symbol (or global if repeated)
- Exponential backoff with jitter
- On repeated errors (network, 5xx, signature, timestamp): open circuit breaker (CB)
- During CB: no new orders, only reconcile and flatten if necessary

### Standard Backoff
```
attempt 1: 250–400ms
attempt 2: 600–900ms
attempt 3: 1200–1800ms
Then FAIL → trigger ERROR_STORM_FAIL (if in burst)
```

## 4) Idempotent OMS: How NOT to Duplicate Orders

### Deterministic ClientOrderId Schema
```
TRD|{env}|{symbol}|{planId}|{leg}|{seq}
```

### Examples
```
TRD|testnet|BTCUSDT|P173|ENTRY|1
TRD|testnet|BTCUSDT|P173|SL|1
TRD|testnet|BTCUSDT|P173|TP1|1
TRD|testnet|BTCUSDT|P173|FLAT|1
```

### Golden Rules
- Never generate random IDs
- Every retry uses the same clientOrderId
- Before "retrying placement": search for open orders by clientOrderId
- If exists → consider "already placed" and go to reconcile

## 5) Complete "Level B" Flow (Serious Autonomous)

### Global Engine State
```
RUNNING → DEGRADED → STOPPED
```
- **RUNNING**: Trading OK
- **DEGRADED**: No new entries, only management/exits
- **STOPPED**: Kill-switch (flatten + stop)

### Per-Symbol State
```
IDLE → ARMED → ENTERING → IN_TRADE → MANAGING → EXITING → COOLDOWN
```

### Real Sequence

1. **Screener** produces Top-K
2. **For each symbol**:
   - QualityGate PASS?
   - RiskEngine allows new positions?
   - StrategySelector produces SignalIntent with TTL

3. **ENTERING**
   - Place ENTRY (market or aggressive limit)
   - On fill → place SL + TP (reduce-only)

4. **MANAGING**
   - Trailing / partial exits / tightening
   - If quality degrades: no new entries; more conservative management

5. **EXITING**
   - Close reduce-only (market) on kill/invalidation

6. **COOLDOWN**
   - Block re-entry for N minutes

## 6) SL/TP on Binance Futures: Correct Standard

### To Reduce Edge Cases
- **SL**: STOP_MARKET reduceOnly
- **TP**: TAKE_PROFIT_MARKET reduceOnly
- **Ladder TP**: Multiple reduceOnly orders with partial quantities

### In Every SL/TP Modification
- **Cancel/Replace with idempotency**:
  - Cancel existing order (verify OK)
  - Place new with new clientOrderId tied to SL|2, TP1|2, etc.

## 7) Reconcile Loop (What Prevents Disasters)

**Every 1–3 seconds**:
- Read real position (symbol)
- Read real open orders
- Compare with DB/state
- **On mismatch**:
  - Update state
  - If "open position without SL" → place SL immediately
  - If "zombie orders" → cancel
  - If "duplicate SL/TP" → reduce to coherent set

**This distinguishes "living bot" from "dying bot".**

## 8) TESTNET → LIVE: What Really Changes

**Only**:
- `EXCHANGE_ENV`
- API keys
- Risk limits (`MODE=micro_live` imposes minimum size and max 1 position)

**OMS/Engine code must be identical.**
If you need to change code, you designed it wrong.

## 9) Risk Limits Table (Conservative, Capital-Aware)

### Capital Assumption: $500–$2,000 (Conservative Intraday Futures)

| Mode       | Max Positions | Max Leverage | Risk/Trade % | Daily Max Loss % | Cooldown Min |
|------------|---------------|--------------|---------------|------------------|--------------|
| testnet    | 2             | 5            | 0.25         | 1.5              | 5            |
| micro_live | 1             | 3            | 0.15         | 0.8              | 15           |
| full_live  | 2             | 5–8 (stress) | 0.25         | 1.5              | 15           |

### Position Sizing Formula
```
risk_usd = capital * risk_pct / 100
stop_distance_pct = 1.5  # ATR-based stop
max_position_usd = risk_usd / (stop_distance_pct / 100)
max_qty = min(max_position_usd / price, exchange_max_qty)
```

### Symbol-Specific Adjustments
- **High vol pairs** (BTC, ETH): 0.8x leverage multiplier
- **Low liq pairs**: 0.5x risk multiplier, 0.3x leverage
- **During stress** (funding >0.5%): 0.6x leverage cap

## 10) Next Steps

1. **Immediate**: Implement idempotent clientOrderId generation
2. **Week 1**: Rate limiting + backoff + basic reconcile
3. **Week 2**: Circuit breaker + quality gates
4. **Week 3**: Full position management flow
5. **Go Live**: Start with micro_live mode, monitor 3 days, then full_live

## 11) Monitoring Dashboard Requirements

- Real-time position P&L
- Order execution latency
- Circuit breaker status
- Quality gate failures
- Risk limit utilization
- Error rate by symbol/type

## 12) Emergency Procedures

1. **Single symbol issue**: Set `TRADING_ENABLED=false` for that symbol
2. **Exchange-wide issue**: Set `EXCHANGE_ENV=testnet` (if possible) or `TRADING_ENABLED=false`
3. **System issue**: Circuit breaker will auto-trigger, manual flatten if needed
4. **Recovery**: Reconcile all positions, verify SL/TP placement, gradual restart
