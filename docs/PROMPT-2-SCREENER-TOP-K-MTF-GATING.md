You are an expert TypeScript backend engineer. Implement "Screener Top-K + Market Context MTF gating" for a Binance USDT-M futures trading system. This is PROMPT #2 and must integrate with the existing codebase from PROMPT #1 (OMS+Risk+Kill+Reconcile) and its Prisma schema. Do NOT browse the web. Use ONLY endpoints and rules defined below. Output production-ready TypeScript with strong typing, tests for key math, robust error handling, and deterministic behavior.

========================
PRIMARY OBJECTIVE
========================
Build an advanced Screener that:
1) Pulls & maintains market data (mainnet) needed for screening.
2) Computes a score per symbol using:
   - Liquidity Quality Score (LQS)
   - Volatility Opportunity Score (VOS)
   - Derivatives Flow Score (DFS)
   - Microstructure Edge Score (MES)
   PLUS MTF gating using closes (1m/5m/15m) and "solid indicators" used ONLY as enable/disable gates.
3) Outputs Top-K symbols every 60s and updates DB table TrackedSymbol (enabled=true/false), without exceeding MAX_SYMBOLS_TRACKED.
4) Exposes HTTP endpoints to:
   - GET /screener/snapshot (scores, topK, reasons)
   - POST /screener/run-once
   - POST /screener/config
   - GET /screener/config
   - POST /universe/apply  (applies topK to TrackedSymbol; optionally disables non-top symbols)
5) Provides clear "reason codes" why symbols were included/excluded.

IMPORTANT:
- Execution remains via OMS (testnet or live) from PROMPT #1.
- Market data for screening should default to LIVE (mainnet) endpoints, even when EXCHANGE_ENV=testnet, because data quality is better.
- Screener must be safe: if data is stale or WS degraded, it must degrade to a smaller universe or stop updating.

========================
ENV / CONFIG
========================
Add env vars:
- SCREENER_ENABLED=true|false (default true)
- SCREENER_TOP_K=20
- SCREENER_REFRESH_SEC=60
- MAX_SYMBOLS_TRACKED=60
- SCREEN_UNIVERSE_MODE=auto|static
- STATIC_SYMBOLS=BTCUSDT,ETHUSDT,... (used if mode=static)
- MARKET_DATA_ENV=live (default live)  // market data base URLs
- MTF_TF_LIST=1m,5m,15m  // fixed; do not expand for now
- MIN_DAILY_QUOTE_VOL_USD=50000000 (filter)
- MAX_SPREAD_BPS=12 (hard veto baseline)
- MIN_DEPTH_USD_TOPN=200000 (hard veto baseline)
- ORDERBOOK_LEVELS=50
- WS_LAG_WARN_MS=800
- WS_LAG_FAIL_MS=1500
- BOOK_GAP_FAIL_MS=2000

Add a config object persisted in DB (new model ScreenerConfig) OR reuse env + in-memory with /screener/config updating runtime.

========================
ENDPOINTS (hard-coded)
========================
Base URLs for MARKET DATA (mainnet):
REST: https://fapi.binance.com
WS:   wss://fstream.binance.com

Use these REST endpoints:
- GET /fapi/v1/exchangeInfo
- GET /fapi/v1/ticker/24hr             (for quoteVolume, volume, priceChangePercent etc.)
- GET /fapi/v1/ticker/bookTicker?symbol=BTCUSDT  (spread sanity)
- GET /fapi/v1/klines?symbol=BTCUSDT&interval=1m&limit=500
- GET /fapi/v1/klines?symbol=BTCUSDT&interval=5m&limit=500
- GET /fapi/v1/klines?symbol=BTCUSDT&interval=15m&limit=500
OPTIONAL if available without auth:
- GET /fapi/v1/openInterest?symbol=BTCUSDT   (if fails, treat as unavailable and use proxy)

WS streams (minimal set):
- bookDepth (partial depth): {symbol}@depth{levels}@100ms  (levels=ORDERBOOK_LEVELS)
- aggTrade: {symbol}@aggTrade
- markPrice: !markPrice@arr OR {symbol}@markPrice@1s (optional)

If WS implementation is heavy, implement REST-only MVP for screener first, but best practice is WS for spread/depth + microstructure.

========================
DATA MODELS (Prisma additions)
========================
Add models:
- ScreenerRun: id, ts, topK(json), summary(json), wsHealth(json)
- SymbolScore: id, ts, symbol, lqs, vos, dfs, mes, mtfGate, totalScore, vetoed(boolean), reasons(json)
- ScreenerConfig (optional): id=1, topK, refreshSec, maxTracked, thresholds(json)

Also update TrackedSymbol usage:
- Screener will set enabled=true for topK
- Optionally set enabled=false for symbols not in topK (controlled by /universe/apply flag)

========================
SCREENER PIPELINE
========================
STEP 0 — Build candidate list:
- If SCREEN_UNIVERSE_MODE=static => parse STATIC_SYMBOLS.
- If auto:
  - use /fapi/v1/exchangeInfo symbols where:
    contractType=PERPETUAL, quoteAsset=USDT, status=TRADING
  - then use /fapi/v1/ticker/24hr to filter by MIN_DAILY_QUOTE_VOL_USD
  - cap candidates to MAX_SYMBOLS_TRACKED*3 to avoid overload

STEP 1 — Hard veto filters per symbol (must compute):
- Spread veto: spread_bps = (ask-bid)/mid*10000. If > MAX_SPREAD_BPS => veto.
- Depth veto: compute depth_usd_topN from orderbook (sum bid+ask topN * price). If < MIN_DEPTH_USD_TOPN => veto.
- Step/tick penalties: if stepSize too coarse => apply penalty (not veto).

STEP 2 — Compute scores (0..100 each), then totalScore:
TotalScore = 0.35*LQS + 0.25*VOS + 0.20*DFS + 0.20*MES
Symbols vetoed => totalScore = 0 and excluded.

2A) LQS (Liquidity Quality Score):
Inputs:
- spread_bps (lower better)
- depth_usd_topN (higher better)
- trade_intensity (aggTrades count per minute or from 24h stats proxy)
- refill_rate (optional from WS deltas; if not, omit)
Scoring:
- Normalize with robust clipping:
  spreadScore = clamp01(1 - spread_bps / MAX_SPREAD_BPS) * 100
  depthScore  = clamp01(depth_usd_topN / (5*MIN_DEPTH_USD_TOPN)) * 100
  intensityScore = zscoreBased or percentile based (if only 24h volume, use quoteVolume rank)
LQS = 0.45*spreadScore + 0.40*depthScore + 0.15*intensityScore

2B) VOS (Volatility Opportunity Score):
Use klines (1m,5m,15m) closes, highs, lows:
- ATR% on 1m and 5m (compute TR and EMA or SMA ATR over 14)
- Vol expansion: ATR_1m_now / ATR_1m_baseline(lookback 200) (ratio)
- Trendability proxy: range(15m last N) / ATR(15m) (avoid chop)
Score:
  atrScore = clamp01(ATR5m_pct / targetAtrPct) * 100 (targetAtrPct configurable)
  expansionScore = clamp01((atrRatio - 1)/1.5) * 100
  chopPenalty if range/ATR too low/high extremes
VOS = 0.45*atrScore + 0.35*expansionScore + 0.20*(100 - chopPenalty)

2C) DFS (Derivatives Flow Score):
Prefer openInterest endpoint; if unavailable, use proxy.
Inputs:
- funding proxy not available via endpoints here (skip)
- OI delta over last N mins (if endpoint supports; if only snapshot, then omit delta)
- mark-index dislocation (if markPrice stream available)
- liquidation proxy: price impulse + volume spike (from klines)
Proxy if no OI:
- impulseZ = zscore(returns 1m over 200)
- volZ = zscore(volume 1m over 200)
- dfsProxy = clamp01( (impulseZ + volZ) / 8 ) * 100
DFS = if OI available:
  combine OI change + dislocation + impulse
else:
  dfsProxy

2D) MES (Microstructure Edge Score):
Inputs (WS preferred):
- imbalance = (bidDepthTopN - askDepthTopN)/(bidDepthTopN + askDepthTopN)
- imbalanceStability: stddev(imbalance over last 60s) (lower = more stable)
- sweepRate proxy: count of aggTrades with large size in last 60s
- toxicity proxy: rapid adverse move after imbalance signal (optional)
Score:
  imbalanceScore = clamp01(abs(imbalance)/0.25)*100
  stabilityScore = clamp01(1 - imbalanceStd/0.15)*100
  sweepScore = clamp01(sweepRate / targetSweepRate)*100
MES = 0.40*imbalanceScore + 0.35*stabilityScore + 0.25*sweepScore

STEP 3 — MTF Gate (enable/disable strategies, not a trade signal):
Compute on closes for 5m & 15m:
- VWAP session not required; use EMA gating for now (solid & simple).
Indicators:
- EMA20 on 5m closes
- EMA50 on 15m closes
- Structure on closes: HH/LL on 5m (higher close high vs last swing) (simple: compare last close to max close of prior N=20)
Gate rules output mtfGate in {PASS, REVIEW, FAIL}:
PASS if:
  - ATR15m_pct above min threshold AND
  - EMA20_5m slope not flat AND
  - price close is not inside "dead zone" (ATR1m too low)
FAIL if:
  - ATR1m_pct below min threshold ("dead market")
  - or 15m range below threshold
REVIEW otherwise.
Use mtfGate to:
- If FAIL => veto symbol (do not track) OR track but disabled (config toggle)
Default: mtfGate FAIL => veto.

STEP 4 — Select Top-K:
- Exclude vetoed.
- Sort by totalScore desc.
- Take Top-K.
- Persist SymbolScore rows and ScreenerRun snapshot.

STEP 5 — Apply Universe:
- Update TrackedSymbol:
  - set enabled=true for Top-K
  - if disableOthers=true => set enabled=false for tracked symbols not in Top-K
- Keep MAX_SYMBOLS_TRACKED ceiling.

========================
HTTP API (Fastify) additions
========================
- GET  /screener/snapshot
- POST /screener/run-once
- POST /screener/config  (update topK, thresholds, mtfGate policy, disableOthers)
- GET  /screener/config
- POST /universe/apply body: {disableOthers:boolean}  // applies latest Top-K to TrackedSymbol
- GET  /universe/tracked  // reads TrackedSymbol enabled list

All routes validated with zod. All responses JSON.

========================
INTEGRATION WITH ENGINE (PROMPT #1)
========================
- ReconcileService should read tracked symbols from TrackedSymbol where enabled=true if present; fallback to TRACK_SYMBOLS env.
- Screener updates TrackedSymbol; engine automatically starts managing those symbols.
- Do NOT auto-trade here. Only universe selection + scoring.

========================
WS HEALTH & DEGRADE MODE
========================
Maintain a WS health monitor:
- track lastMessageTs per symbol stream
- compute wsLagMs and bookGapMs
If wsLagMs > WS_LAG_FAIL_MS or bookGapMs > BOOK_GAP_FAIL_MS:
- mark wsHealth = DEGRADED
- reduce candidate universe size (e.g., only top 10 by 24h volume) OR stop applying updates
Log wsHealth into ScreenerRun.

========================
TESTS
========================
Unit tests for:
- ATR calculation
- EMA calculation
- spread_bps calculation
- orderbook depth USD calculation
- zscore function & robust clipping
- mtfGate classification

========================
DONE CRITERIA
========================
- /screener/run-once computes scores for candidates and persists SymbolScore + ScreenerRun.
- /universe/apply updates TrackedSymbol with Top-K enabled=true.
- /universe/tracked returns current enabled list.
- MTF gate uses closes MTF and can veto symbols.
- No web browsing, uses only defined endpoints/streams.
- Code builds with TypeScript strict and Prisma migrations succeed.
