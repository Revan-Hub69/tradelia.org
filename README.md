# Tradelia Futures Engine - MAX Sustainable v1.0

Advanced AI-powered cryptocurrency trading system with deterministic execution on Binance USDⓈ-M Perpetual Futures.

## 🚀 Deployment

### Automatic Deployment
Push to `main` branch triggers automatic deployment:
- **Vercel**: Web app deployed automatically
- **Railway**: API server deployed automatically

### Setup Instructions

1. **Vercel Setup:**
   - Connect GitHub repo to Vercel
   - Set build command: `cd apps/web && npm run build`
   - Set output directory: `apps/web/.next`

2. **Railway Setup:**
   - Connect GitHub repo to Railway
   - Create new service from `apps/api/Dockerfile`
   - Add environment variables (see below)

3. **Environment Variables (Railway):**
```
DATABASE_URL=postgresql://...
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_ENV=testnet
FEATURE_WS_MARKET=true
MICRO_MODE=ws_mixed
EXECUTION_MODE=confirm
PORT=3001
```

## 🔐 Access

**Credentials & Secrets:** Secrets (API keys, passwords, OTPs) MUST NOT be stored in the repository. Use the organization's secret manager (for example, Vault or Supabase Vault) or environment variables to provision credentials.

If you discover secrets in the repository, remove them immediately, rotate the affected credentials, and notify the security/contact team.

> NOTE: A secret-scanning workflow and security guidance have been added to this repo; see `SECURITY.md` for rotation steps and contacts.

## 🏗️ Architecture

- **apps/web** - Next.js frontend (Vercel)
- **apps/api** - Fastify API server (Railway)  
- **packages/shared** - Shared types and utilities
- **prisma/** - Database schema

## 📚 API Endpoints

- `POST /api/session/start` - Start trading session
- `GET /api/session/state` - Get session state
- `GET /api/screener/top?profile=A|B` - Get screened symbols
- `GET /api/signals/candidates` - Get signal candidates
- `GET /api/tradeplans` - Get executable trade plans
- `POST /api/execute` - Execute trade plan

## 🎯 Features

- AI-powered symbol screening
- Multi-timeframe analysis (15m + 1m)
- Deterministic risk management
- WebSocket market data integration
- Demo/Live environment switching
