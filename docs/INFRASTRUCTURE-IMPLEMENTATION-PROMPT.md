You are an expert TypeScript backend engineer.

Implement the CORE infrastructure for an autonomous Binance USDT-M Futures trading engine
(Level B: auto-exec + auto-manage + kill-switch + reconcile).

DO NOT browse the web.
Use ONLY the endpoints, rules, and constraints defined below.
Output production-ready code with strong typing, deterministic behavior, and auditability.

Target stack:
- Node.js 20+
- TypeScript (strict)
- pnpm
- Fastify
- Prisma + PostgreSQL (local-first, Supabase compatible)

This system is INFRASTRUCTURE ONLY.
NO trading strategy logic.
NO indicators.
NO signals beyond a dummy generator for testing.

────────────────────────────
GOALS (DELIVERABLES)
────────────────────────────

1) Binance USDT-M client
   - REST signed requests (HMAC SHA256)
   - Time sync via /fapi/v1/time
   - Deterministic clientOrderId
   - Order placement:
       MARKET
       LIMIT
       STOP_MARKET
       TAKE_PROFIT_MARKET
   - Cancel order
   - Cancel all open orders
   - Query open orders
   - Query positions (positionRisk)
   - Set leverage
   - Set margin type (ISOLATED)
   - Rate-limit protection with retry + backoff

2) OMS (Order Management System)
   - OrderIntent → execution pipeline
   - Idempotent execution (no duplicate orders on retry)
   - Deterministic clientOrderId format:
       TRD|{env}|{symbol}|{planId}|{leg}|{seq}
     Examples:
       TRD|testnet|BTCUSDT|P173|ENTRY|1
       TRD|testnet|BTCUSDT|P173|SL|1
       TRD|testnet|BTCUSDT|P173|TP1|1
       TRD|testnet|BTCUSDT|P173|FLAT|1

   - NEVER allow a position without a protective SL
   - SL and TP must always be reduce-only
   - Reconciliation loop is mandatory and authoritative

3) Risk Engine
   - Global risk state:
       tradingEnabled
       maxDailyLossPct
       maxConcurrentPositions
       cooldownAfterLoss
   - Per-symbol leverage caps (config-driven)
   - Daily loss accounting (simplified placeholder for testnet)
   - Rules:
       - Can enter?
       - Should flatten now?
       - Cooldown enforcement
   - During killActive or circuitBreakerOpen:
       NO NEW ENTRIES
       Flatten and reconcile still allowed

4) Kill-Switch
   Triggers:
   - REST error storm (>= ERROR_STORM_FAIL in 30s)
   - Any REST 418 or 429 → immediate kill
   - WS lag / mark-index dislocation (stub)

   Actions:
   - Cancel ALL open orders
   - Flatten ALL positions using reduce-only MARKET
   - tradingEnabled = false
   - killActive = true
   - Requires manual reset

5) Persistence (Prisma)
   Models:
   - RiskState (singleton)
   - OrderRecord
   - PositionRecord
   - KillEvent
   - ReconcileEvent

   All decisions MUST be logged.

6) Internal HTTP API (Fastify)
   With Zod validation + Swagger:

   Engine:
   - POST /engine/start
   - POST /engine/stop
   - POST /engine/reset-kill
   - GET  /engine/state

   Risk:
   - POST /risk/config
   - GET  /risk/state

   OMS:
   - POST /oms/submit-intent
       body: { symbol, planId, side, qty, slPrice, tpPrice? }
   - POST /oms/flatten
   - POST /oms/flatten/:symbol
   - GET  /oms/orders?symbol=
   - GET  /oms/positions?symbol=

   Include a dummy SignalIntent generator for testing.

────────────────────────────
CONSTRAINTS / RULES
────────────────────────────

- Primary exchange: Binance USDT-M Futures
- Support testnet and live via ENV switch:
    EXCHANGE_ENV = "testnet" | "live"
- Always use ISOLATED margin
- All exits must be reduce-only
- Reconcile loop every 2 seconds
- Exchange state is the source of truth
- Implement rate limiter + exponential backoff + jitter
- Implement circuit breaker (open 30s after storm)
- During circuit breaker:
    no new entries
    flatten + reconcile allowed

────────────────────────────
BINANCE ENDPOINTS (HARD-CODED)
────────────────────────────

Base URLs:
LIVE REST:    https://fapi.binance.com
LIVE WS:      wss://fstream.binance.com
TESTNET REST: https://testnet.binancefuture.com
TESTNET WS:   wss://stream.binancefuture.com

REST endpoints used:
- GET    /fapi/v1/exchangeInfo
- GET    /fapi/v1/time
- GET    /fapi/v1/ticker/bookTicker?symbol=BTCUSDT
- GET    /fapi/v1/openOrders?symbol=BTCUSDT
- DELETE /fapi/v1/allOpenOrders?symbol=BTCUSDT
- DELETE /fapi/v1/order
- POST   /fapi/v1/order
- GET    /fapi/v2/positionRisk
- POST   /fapi/v1/leverage
- POST   /fapi/v1/marginType

Signed endpoints:
- order
- cancel
- openOrders
- allOpenOrders
- positionRisk
- leverage
- marginType

Signature:
- HMAC SHA256(queryString, API_SECRET)
- Header: X-MBX-APIKEY
- recvWindow=5000
- timestamp = Date.now() + timeOffset

Order specifics:
- ENTRY:
    type=MARKET
- STOP LOSS:
    type=STOP_MARKET
    reduceOnly=true
    workingType=MARK_PRICE
- TAKE PROFIT:
    type=TAKE_PROFIT_MARKET
    reduceOnly=true
    workingType=MARK_PRICE

Quantity MUST respect stepSize (implement rounding helper).

────────────────────────────
RECONCILE LOOP (EVERY 2s)
────────────────────────────

1) Fetch positions (positionRisk)
2) For each non-zero position:
   - Ensure PositionRecord exists
   - Ensure a protective SL exists
   - If missing → place EMERGENCY SL
     planId = EMERGENCY_YYYYMMDD
3) Fetch open orders for tracked symbols
4) If killActive:
   - Ensure flatten completed
   - Cancel leftover orders
5) Persist ReconcileEvent logs

────────────────────────────
PROJECT STRUCTURE
────────────────────────────

apps/api/
 ├─ src/config/env.ts
 ├─ src/exchange/binance/constants.ts
 ├─ src/exchange/binance/signing.ts
 ├─ src/exchange/binance/restClient.ts
 ├─ src/exchange/binance/binanceFutures.ts
 ├─ src/oms/types.ts
 ├─ src/oms/omsService.ts
 ├─ src/risk/riskEngine.ts
 ├─ src/kill/killSwitch.ts
 ├─ src/reconcile/reconcileService.ts
 ├─ src/db/prisma.ts
 ├─ prisma/schema.prisma
 ├─ src/http/server.ts
 └─ src/index.ts

────────────────────────────
ENV VARS (MANDATORY)
────────────────────────────

EXCHANGE_ENV=testnet|live
BINANCE_API_KEY=string
BINANCE_API_SECRET=string
TRACK_SYMBOLS=BTCUSDT,ETHUSDT
DATABASE_URL=postgresql://...

Optional:
TRADING_ENABLED=true|false
MAX_CONCURRENT_POSITIONS=2
DAILY_MAX_LOSS_PCT=1.5
COOLDOWN_AFTER_LOSS_MIN=15
ERROR_STORM_FAIL=8
BINANCE_CB_OPEN_SEC=30
BINANCE_REST_TIMEOUT_MS=4000
BINANCE_RETRY_MAX=3
BINANCE_RETRY_BASE_MS=250

────────────────────────────
DONE CRITERIA
────────────────────────────

- Fastify server starts
- /oms/submit-intent places ENTRY + SL (+TP) on testnet
- Reconcile detects missing SL and auto-repairs
- Kill-switch flattens on forced error
- Build passes with pnpm + TS strict
- Prisma migrations work
