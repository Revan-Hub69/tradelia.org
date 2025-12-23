You are an expert TypeScript backend engineer. Implement the "OMS + Risk + Kill-switch + Reconcile" core for an autonomous Binance USDT-M futures trading system (Level B: auto-exec + auto-manage + kill-switch/flatten). Do NOT browse the web. Use ONLY the endpoints and rules defined below. Output production-ready code with strong typing, tests where sensible, and robust error handling. The system must run locally and be deployable. Assume Node 20+, pnpm, TypeScript.

========================
GOALS (deliverables)
========================
1) A Binance USDT-M client with:
   - REST signed requests (HMAC SHA256)
   - basic WS market data connector (optional stub OK)
   - idempotent order placement using deterministic clientOrderId
   - order placement: MARKET, LIMIT, STOP_MARKET, TAKE_PROFIT_MARKET
   - cancel order, cancel all open orders, query open orders, query positions (positionRisk)
   - set leverage, set margin type (ISOLATED)
   - SUPPORT position mode: One-way vs Hedge (see PATCH #1)

2) OMS (Order Management System):
   - internal OrderIntent + execution pipeline
   - idempotency: no duplicate orders on retry
   - reconciliation loop every 2s: exchange truth => local truth
   - if position exists without SL => immediately place protective SL reduce-only
   - ensure TP/SL reduce-only orders exist and match expected legs (deterministic matching rules; see PATCH #3)

3) Risk Engine:
   - global risk state: trading_enabled, max_daily_loss, max_positions, cooldown after loss
   - per-symbol constraints: max leverage by regime/stress (wired but can be config-driven)
   - daily loss accounting:
       - in testnet allow placeholder, BUT implement optional real realized PnL ingestion endpoints (PATCH #2)
   - hard "NO NEW ENTRIES" rules, and "FLATTEN NOW" rules

4) Kill-switch:
   - triggers: error storm, REST 429/418, excessive ws lag/book gaps (stub), mark-index dislocation (stub)
   - action: cancel open orders + flatten positions reduce-only + disable trading_enabled until manual reset

5) Persistence:
   - use PostgreSQL (via Prisma) OR Supabase (Postgres) — choose Prisma for local dev simplicity
   - include schema for orders, positions, risk_state, kill_events, reconcile_events, tracked_symbols
   - all decisions and executions logged

6) Internal HTTP API (Fastify) for controlling the engine:
   - POST /engine/start
   - POST /engine/stop
   - POST /engine/reset-kill
   - GET  /engine/state
   - POST /risk/config
   - GET  /risk/state
   - POST /oms/submit-intent  (manual injection for testing)
   - POST /oms/flatten        (global flatten)
   - POST /oms/flatten/:symbol
   - GET  /oms/orders?symbol=
   - GET  /oms/positions?symbol=
   Include swagger or JSON schema validation with zod.

========================
CONSTRAINTS / RULES
========================
- Binance Futures USDT-M primary exchange.
- Testnet and live MUST be supported with a single env switch EXCHANGE_ENV=testnet|live.
- Use REST for trading actions; WS for market data can be minimal stub.
- Always use ISOLATED margin and reduce-only for exits.
- Never place a position without a protective SL leg.
- Reconcile loop is mandatory and is the "source of truth" from exchange.
- Implement rate-limit protection: limiter + exponential backoff + jitter.
- Implement circuit breaker: open for 30s after storm; during open -> no new entries; allow flatten/reconcile.
- Deterministic clientOrderId format:
    TRD|{env}|{symbol}|{planId}|{leg}|{seq}
  Example:
    TRD|testnet|BTCUSDT|P173|ENTRY|1
    TRD|testnet|BTCUSDT|P173|SL|1
    TRD|testnet|BTCUSDT|P173|TP1|1
    TRD|testnet|BTCUSDT|P173|FLAT|1
- No strategy implementation here. Only OMS+Risk+Kill-switch+Reconcile.
- Provide a "dummy SignalIntent generator" for testing via /oms/submit-intent.

========================
ENDPOINTS (hard-coded)
========================
Base URLs:
LIVE REST:    https://fapi.binance.com
LIVE WS:      wss://fstream.binance.com

TESTNET REST: https://testnet.binancefuture.com
TESTNET WS:   wss://stream.binancefuture.com

REST endpoints used (USDT-M Futures):
- GET  /fapi/v1/exchangeInfo
- GET  /fapi/v1/time
- GET  /fapi/v1/ticker/bookTicker?symbol=BTCUSDT   (spread sanity)
- GET  /fapi/v1/openOrders?symbol=BTCUSDT
- DELETE /fapi/v1/allOpenOrders?symbol=BTCUSDT
- DELETE /fapi/v1/order?symbol=BTCUSDT&orderId=... or origClientOrderId=...
- POST /fapi/v1/order   (place order)
- GET  /fapi/v2/positionRisk
- POST /fapi/v1/leverage
- POST /fapi/v1/marginType

OPTIONAL (for PATCH #2 realized pnl / balances):
- GET  /fapi/v2/account
- GET  /fapi/v1/income

Signed endpoints: order, cancel, openOrders, allOpenOrders, positionRisk, leverage, marginType, account, income.
Signature: HMAC SHA256 of query string using API_SECRET. Include X-MBX-APIKEY header.

Time sync:
- Use /fapi/v1/time to get serverTime. Maintain timeOffset = serverTime - localTime.
- Add recvWindow=5000 and timestamp=Date.now()+timeOffset.

Order placement specifics:
- MARKET entry: type=MARKET, side=BUY/SELL, quantity
- LIMIT entry: type=LIMIT, price=..., timeInForce=GTC (or IOC if specified), quantity
- STOP_MARKET SL: type=STOP_MARKET, stopPrice=..., reduceOnly=true, workingType=MARK_PRICE
- TAKE_PROFIT_MARKET TP: type=TAKE_PROFIT_MARKET, stopPrice=..., reduceOnly=true, workingType=MARK_PRICE
- If POSITION_MODE=hedge, include positionSide=LONG|SHORT on orders and match positions accordingly.
- Ensure qty formatting respects stepSize and minQty; price respects tickSize; validate minNotional (PATCH #4).

========================
PROJECT STRUCTURE
========================
Create an app under apps/api (Fastify). Suggested folders:
- src/config/env.ts
- src/exchange/binance/constants.ts
- src/exchange/binance/signing.ts
- src/exchange/binance/restClient.ts
- src/exchange/binance/binanceFutures.ts (typed wrapper)
- src/exchange/binance/filters.ts (PATCH #4 symbol filters & rounding)
- src/oms/types.ts
- src/oms/omsService.ts
- src/risk/riskEngine.ts
- src/kill/killSwitch.ts
- src/reconcile/reconcileService.ts
- src/db/prisma.ts + prisma/schema.prisma
- src/http/server.ts + routes
- src/index.ts

========================
DB SCHEMA (Prisma)
========================
Models:
- RiskState (singleton): id=1, tradingEnabled, killActive, killReason, dailyLossUsed, dailyLossLimitPct, maxPositions, cooldownUntilTs, circuitOpenUntilTs
- OrderRecord: id, ts, env, symbol, planId, leg, seq, clientOrderId, side, type, qty, price, stopPrice, reduceOnly, tif, status, exchangeOrderId, lastError, positionSide?
- PositionRecord: id, ts, env, symbol, side, qty, entryPrice, unrealizedPnl, realizedPnl, slClientOrderId, tpClientOrderIds (json), status, positionSide?
- KillEvent: id, ts, env, reason, details(json)
- ReconcileEvent: id, ts, env, symbol, action, details(json)
- TrackedSymbol: id, env, symbol, enabled(boolean), updatedAt
  (This allows dynamic universe in the future; for now seed from TRACK_SYMBOLS env but also persist.)

========================
RISK RULES (initial)
========================
Config defaults (env override):
- MAX_CONCURRENT_POSITIONS=2
- DAILY_MAX_LOSS_PCT=1.5
- COOLDOWN_AFTER_LOSS_MIN=15
- ERROR_STORM_FAIL=8 within 30s
- CB_OPEN_SEC=30
- During killActive or circuitBreakerOpen: no new entries; allow flatten/reconcile only.

Define these methods:
- riskEngine.canEnter(symbol): boolean + reason
- riskEngine.onFillUpdate(...)
- riskEngine.onRealizedLoss(...)
- riskEngine.shouldFlattenNow(exchangeHealth): boolean + reason

Realized PnL best practice (PATCH #2):
- If ENABLE_INCOME_TRACKING=true, periodically query /fapi/v1/income and update dailyLossUsed
- If not enabled, keep placeholder logic but DO enforce kill on 429/418 and error storm.

========================
KILL SWITCH
========================
Triggers:
- Too many consecutive REST errors (>= ERROR_STORM_FAIL within 30s)
- Any REST 418/429 -> immediate killActive
Actions:
- cancel all open orders for all tracked symbols
- flatten all positions reduce-only MARKET
- set tradingEnabled=false, killActive=true
Manual reset:
- POST /engine/reset-kill sets killActive=false but keeps tradingEnabled=false unless explicitly enabled by /risk/config.

Circuit breaker:
- on error storm, set circuitOpenUntilTs = now + CB_OPEN_SEC*1000
- while circuit breaker open: no new entries, allow flatten/reconcile

========================
RECONCILE LOOP (every 2s)
========================
Universe:
- start from env TRACK_SYMBOLS="BTCUSDT,ETHUSDT"
- also persist them in TrackedSymbol table on boot (enabled=true)

Steps:
1) Fetch positions: GET /fapi/v2/positionRisk
   - If POSITION_MODE=hedge, treat LONG and SHORT positions separately by positionSide
2) Fetch open orders per tracked symbol: GET /fapi/v1/openOrders?symbol=...
3) For each non-zero position:
   - ensure exists in PositionRecord (key includes symbol + positionSide if hedge)
   - ensure protective SL exists on exchange using deterministic matching (PATCH #3):
       SL exists if there is an open order with origClientOrderId matching:
         "TRD|{env}|{symbol}|{planId}|SL|" OR "TRD|{env}|{symbol}|EMERGENCY*|SL|"
       AND (if hedge) positionSide matches
   - If missing: place EMERGENCY SL with deterministic planId:
       planId = "EMERGENCY-" + YYYYMMDD + "-" + symbol (+ "-" + positionSide if hedge)
       leg=SL, seq increments by checking DB existing seq count
       SL price must be computed conservatively:
         - For LONG: stop below current mark by a configurable bps (e.g., 80 bps) OR use last known entryPrice and a bps buffer
         - For SHORT: stop above current mark by a configurable bps
       Use workingType=MARK_PRICE and reduceOnly=true.
4) If killActive:
   - ensure cancel all open orders (for all tracked symbols)
   - ensure flatten positions
   - verify no positions remain; log completion
5) Persist reconcile actions into ReconcileEvent logs.

========================
INTERNAL API (Fastify)
========================
Routes:
- POST /engine/start => starts reconcile scheduler
- POST /engine/stop => stops scheduler
- POST /engine/reset-kill
- GET /engine/state
- POST /risk/config (update RiskState values; include tradingEnabled toggle)
- GET /risk/state
- POST /oms/submit-intent body: {
     symbol,
     planId,
     side,           // LONG/SHORT or BUY/SELL mapping
     qty,
     slPrice,
     tpPrice?,
     entryType?      // MARKET|LIMIT
     entryPrice?,    // if LIMIT
     positionSide?   // only if POSITION_MODE=hedge
  }
  -> OMS places ENTRY then SL then TP (reduce-only). Must be idempotent on repeated calls.
- POST /oms/flatten => global flatten now
- POST /oms/flatten/:symbol => flatten symbol (and positionSide if hedge via query param)
- GET /oms/orders?symbol=
- GET /oms/positions?symbol=

Use zod for validation and return clear JSON.

========================
PATCH #1 — POSITION MODE (One-way vs Hedge)
========================
Add env var:
- POSITION_MODE=oneway|hedge (default oneway)
Rules:
- If hedge:
  - Orders MUST include positionSide=LONG or SHORT
  - Reconcile MUST treat positionRisk rows by positionSide
  - DB PositionRecord unique key includes positionSide
- If oneway:
  - Do not set positionSide (or set BOTH only if required)
Add tests for mapping.

========================
PATCH #2 — REALIZED PNL TRACKING (optional but supported)
========================
Add env:
- ENABLE_INCOME_TRACKING=true|false (default false)
If true:
- Periodically (e.g., every 60s) call GET /fapi/v1/income (signed)
- Aggregate realized PnL + commissions for current UTC day and update RiskState.dailyLossUsed
- Enforce DAILY_MAX_LOSS_PCT vs equity baseline from /fapi/v2/account (signed) OR config-supplied equity if account not available in testnet
If false:
- Keep placeholder for dailyLossUsed but keep kill-switch enforcement for 429/418 and error storms.

========================
PATCH #3 — DETERMINISTIC SL/TP MATCHING
========================
Replace any "any SL for symbol" logic with strict matching:
- SL/TP orders MUST have clientOrderId with planId embedded.
- Reconcile checks SL/TP existence by parsing origClientOrderId prefix:
  TRD|{env}|{symbol}|{planId}|SL|{seq}
- If PositionRecord has slClientOrderId, that is the primary reference.
- If missing in DB, attempt to infer planId from open orders with TRD prefix for that symbol.
- Otherwise, place EMERGENCY SL with EMERGENCY planId.
Also ensure TP legs are reduceOnly and properly tagged.

========================
PATCH #4 — ROUNDING & FILTERS (stepSize, tickSize, minQty, minNotional)
========================
On boot:
- Load exchangeInfo and build SymbolFilters map:
  stepSize, tickSize, minQty, minNotional (if available), qtyPrecision/pricePrecision
Implement helpers:
- roundQty(qty, stepSize, minQty) -> number
- roundPrice(price, tickSize) -> number
- validateNotional(qty * markPrice, minNotional) -> boolean
Use these for all order placements (ENTRY, SL, TP, FLATTEN).
Add unit tests for rounding correctness.

========================
IMPLEMENTATION NOTES
========================
- Keep code deterministic and auditable.
- No background promises without handling; everything awaited with timeouts.
- Handle Binance error formats gracefully.
- Provide unit tests for:
  - signing
  - clientOrderId builder
  - rounding (stepSize/tickSize/minQty)
  - circuit breaker state machine
  - position mode mapping
- Provide a README with env vars and how to run.

========================
ENV VARS
========================
Required:
- EXCHANGE_ENV=testnet|live
- BINANCE_API_KEY=...
- BINANCE_API_SECRET=...
- TRACK_SYMBOLS=BTCUSDT,ETHUSDT
- DATABASE_URL=postgresql://...
Optional:
- POSITION_MODE=oneway|hedge
- ENABLE_INCOME_TRACKING=true|false
- TRADING_ENABLED=true|false
- MAX_CONCURRENT_POSITIONS=2
- DAILY_MAX_LOSS_PCT=1.5
- COOLDOWN_AFTER_LOSS_MIN=15
- ERROR_STORM_FAIL=8
- BINANCE_CB_OPEN_SEC=30
- BINANCE_REST_TIMEOUT_MS=4000
- BINANCE_RETRY_MAX=3
- BINANCE_RETRY_BASE_MS=250
- EMERGENCY_SL_BPS=80   (basis points offset from mark for emergency SL)

========================
DONE CRITERIA
========================
- Running Fastify server exposes routes.
- /oms/submit-intent on testnet creates entry+SL(+TP) orders with deterministic clientOrderId.
- Reconcile loop detects missing SL and places emergency SL deterministically.
- Position mode (oneway/hedge) works without order rejections.
- Kill switch on forced 429 triggers cancel+flatten+disable trading.
- Rounding/filters prevent invalid qty/price orders.
- Codebase builds with pnpm, TypeScript strict, Prisma migrations work.
