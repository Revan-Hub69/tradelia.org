🔥 PROMPT 3 — AUTONOMOUS INTRADAY CRYPTO TRADING ENGINE (BINANCE USDT-M)

You are an expert quantitative trading engineer specialized in crypto derivatives (Binance USDT-M), intraday trading, and market microstructure.

You must design and implement the AUTONOMOUS OPERATIONAL CORE that DECIDES, ENTERS, MANAGES, and EXITS trades automatically, using ONLY free data available from Binance Futures APIs.

This system is NOT advisory.
It EXECUTES TRADES via the OMS built in Prompt 1.

🎯 OBJECTIVE

Build a fully autonomous intraday trading engine that:

Determines market regime

Screens symbols dynamically

Detects actionable intraday setups

Enters positions automatically

Manages positions dynamically (TP/SL/trailing/kill)

Feeds all decisions to OMS (no direct order logic here)

This is Level B autonomy:

auto-entry

auto-management

risk-governed

kill-switch compliant

🔒 HARD CONSTRAINTS (NON-NEGOTIABLE)

Exchange: Binance USDT-M ONLY

Time horizon: Intraday (minutes → hours)

Instruments: Futures (long + short)

No HFT

No ML black boxes

No paid data

No discretionary human input

Must survive testnet → live unchanged

🧱 ARCHITECTURE (MANDATORY)
Modules (STRICT separation)
/strategy
  ├─ regimeDetector.ts
  ├─ symbolScreener.ts
  ├─ setupDetector.ts
  ├─ entryPlanner.ts
  ├─ positionManager.ts
  ├─ signalBus.ts


Strategy EMITS intents, OMS EXECUTES.

1️⃣ MARKET REGIME DETECTOR (CORE)

Determine current global regime using BTCUSDT + ETHUSDT:

Regimes:

TREND_UP

TREND_DOWN

RANGE

VOLATILE_BREAKOUT

DEAD (no trading)

Inputs (free):

Funding rate (trend bias)

Open Interest delta

5m / 15m / 1h returns

ATR compression / expansion

Volume expansion

VWAP slope

Output:
type MarketRegime = {
  regime: 'TREND_UP' | 'TREND_DOWN' | 'RANGE' | 'VOLATILE_BREAKOUT' | 'DEAD'
  confidence: number
  allowedDirections: ('LONG' | 'SHORT')[]
}


If confidence < threshold → NO TRADING

2️⃣ SYMBOL SCREENER (MANDATORY, NO STATIC LISTS)

From ALL Binance USDT-M symbols, dynamically select TOP-K tradable symbols.

Filters:

Volume (24h, intraday spike)

Open Interest change

Funding extreme

Spread sanity

ATR / price ratio

Exclude dead books

Output:
type ScreenedSymbol = {
  symbol: string
  liquidityScore: number
  volatilityScore: number
  squeezeScore: number
}


Select K = 3–5 max.

3️⃣ SETUP DETECTION (NO INDICATOR SPAM)

Detect REAL intraday setups only:

Allowed setups:

Volatility squeeze → expansion

VWAP reclaim / rejection

Liquidity sweep + displacement

Range high/low break with volume

Funding extreme fade (only if regime allows)

Explicitly EXCLUDE:

RSI-only

MACD-only

random indicator crosses

Output:
type TradeSetup = {
  symbol: string
  direction: 'LONG' | 'SHORT'
  setupType: 'SQUEEZE' | 'BREAKOUT' | 'FADE' | 'VWAP'
  entryZone: { min: number; max: number }
  invalidation: number
  confidence: number
}

4️⃣ ENTRY PLANNER (ORDER-AWARE)

Convert setup → executable trade plan:

Entry: MARKET or aggressive LIMIT

Stop: structure-based (NOT %)

TP: R-multiple or liquidity-based

Size: fixed risk per trade (from Risk Engine)

Output (to OMS):
OrderIntent {
  symbol
  side
  qty
  slPrice
  tpPrice
  planId
}

5️⃣ POSITION MANAGER (MICROSTRUCTURE AWARE)

Runs every few seconds AFTER entry.

Responsibilities:

Move SL to BE after displacement

Trail SL on structure breaks

Kill trade on:

funding flip

OI collapse

volume divergence

regime change

Partial TP allowed ONLY if OMS supports it

NO discretion.
Only rules.

6️⃣ SIGNAL BUS → OMS

All executions go through:

POST /oms/submit-intent
POST /oms/flatten/:symbol


Strategy NEVER places orders directly.

7️⃣ FAIL-SAFES (MANDATORY)

If regime = DEAD → flatten all

If OMS rejects → cooldown symbol

If spread widens abnormally → no entry

If funding spikes → block direction

If BTC volatility explodes → halt alts

🧪 TESTING REQUIREMENTS

Deterministic backtest via candle replay

Paper mode first

Testnet live next

Same code → live later

🚫 EXPLICIT NON-GOALS

No prediction

No AI "opinions"

No human UI decisions

No signals Telegram-style

This is a machine.

📦 DELIVERABLES

TypeScript implementation

Clear interfaces

Config-driven thresholds

Extensive logging

README explaining logic & assumptions

🔥 FINAL DIRECTIVE

Design this system as if capital is real,
latency is imperfect,
and failure must flatten safely.

Proceed module by module.
Start with Market Regime Detector.
