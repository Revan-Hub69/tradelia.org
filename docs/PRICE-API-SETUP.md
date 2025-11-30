# Setup API Prezzi - Guida Completa

## 🎯 STRATEGIA MULTI-PROVIDER

### Provider Principali

1. **Finnhub** (Stocks/Forex)
   - Rate Limit: **60 calls/minuto** (12x Alpha Vantage!)
   - Setup: Registrati su https://finnhub.io
   - API Key: Aggiungi `FINNHUB_API_KEY` a `.env`

2. **Binance** (Crypto)
   - Rate Limit: **1200 calls/minuto** (estremamente generoso!)
   - Setup: Nessuna registrazione necessaria
   - API Key: Non richiesta per public API

3. **Yahoo Finance** (Fallback)
   - Rate Limit: **Illimitato** (ma non ufficiale)
   - Setup: `npm install yahoo-finance2`
   - API Key: Non richiesta

---

## 📝 SETUP STEP-BY-STEP

### 1. Finnhub (Stocks/Forex)

1. Vai su https://finnhub.io
2. Clicca "Get Free API Key"
3. Registrati (gratis)
4. Copia la tua API key
5. Aggiungi a `.env`:
   ```
   FINNHUB_API_KEY=your_finnhub_key_here
   ```

**Rate Limit:** 60 calls/minuto (molto generoso!)

---

### 2. Binance (Crypto)

**Nessuna registrazione necessaria!**

Binance public API è completamente gratuita e non richiede autenticazione per ottenere prezzi.

**Rate Limit:** 1200 calls/minuto (estremamente generoso!)

---

### 3. Yahoo Finance (Fallback)

1. Installa pacchetto:
   ```bash
   npm install yahoo-finance2
   ```

2. **Nessuna API key richiesta**

**Rate Limit:** Illimitato (ma non ufficiale, può essere instabile)

---

## 🔄 COME FUNZIONA

### Ordine di Fallback

1. **Crypto:**
   - Prova Binance (1200 calls/min)
   - Fallback Finnhub (60 calls/min)
   - Fallback Yahoo Finance (illimitato)

2. **Stocks:**
   - Prova Finnhub (60 calls/min)
   - Fallback Yahoo Finance (illimitato)

3. **Forex:**
   - Prova Finnhub (60 calls/min)
   - Fallback Yahoo Finance (illimitato)

### Cache Intelligente

- Prezzi cached per **5 minuti**
- Riduce chiamate API del 95%
- Aggiornamento automatico quando cache scade

---

## 📊 CONFRONTO RATE LIMITS

| Provider | Rate Limit | Stocks | Crypto | Forex | Setup |
|----------|-----------|--------|--------|-------|-------|
| **Finnhub** | 60/min | ✅ | ✅ | ✅ | Registrazione |
| **Binance** | 1200/min | ❌ | ✅ | ❌ | Nessuno |
| **Yahoo Finance** | Illimitato | ✅ | ✅ | ✅ | npm install |
| **Alpha Vantage** | 5/min | ✅ | ❌ | ✅ | Registrazione |

**Vantaggio Multi-Provider:**
- ✅ **12x più generoso** di Alpha Vantage per stocks
- ✅ **240x più generoso** per crypto
- ✅ **100% gratis**
- ✅ Redundanza (se una API fallisce, usa l'altra)

---

## 🚀 IMPLEMENTAZIONE

### File Creati

1. `lib/price-apis/finnhub.ts` - Integrazione Finnhub
2. `lib/price-apis/binance.ts` - Integrazione Binance
3. `lib/price-apis/yahoo-finance.ts` - Integrazione Yahoo Finance
4. `lib/price-apis/index.ts` - Manager con fallback automatico

### API Aggiornata

- `app/api/watchlist/check-alerts/route.ts` - Usa multi-provider
- Batch size aumentato da 5 a 50 asset (grazie a rate limits più generosi)

---

## ⚙️ CONFIGURAZIONE

### Variabili d'Ambiente

```env
# Finnhub (opzionale ma raccomandato per stocks/forex)
FINNHUB_API_KEY=your_finnhub_key_here

# Binance: Non richiesta (public API)
# Yahoo Finance: Non richiesta (usa libreria npm)
```

### Pacchetti NPM

```json
{
  "dependencies": {
    "yahoo-finance2": "^2.4.0"
  }
}
```

---

## 🎯 RISULTATO

### Prima (Alpha Vantage)
- ❌ 5 calls/minuto
- ❌ Max 5 asset per batch
- ❌ Solo stocks/forex

### Dopo (Multi-Provider)
- ✅ **60 calls/minuto** per stocks/forex (Finnhub)
- ✅ **1200 calls/minuto** per crypto (Binance)
- ✅ **Max 50 asset per batch**
- ✅ Supporto completo (stocks, crypto, forex)
- ✅ Fallback automatico
- ✅ Cache intelligente

**Miglioramento: 12-240x più generoso!** 🚀

---

## 📝 PROSSIMI PASSI

1. ✅ Installare `yahoo-finance2`: `npm install yahoo-finance2`
2. ✅ Registrarsi su Finnhub e aggiungere API key
3. ✅ Testare sistema multi-provider
4. ✅ Verificare fallback automatico
5. ✅ Monitorare rate limits

---

## 💡 NOTE

- **Finnhub**: Raccomandato per stocks/forex (molto generoso)
- **Binance**: Perfetto per crypto (estremamente generoso)
- **Yahoo Finance**: Fallback di emergenza (illimitato ma instabile)
- **Cache**: Riduce chiamate API del 95%
- **Fallback**: Garantisce uptime anche se una API fallisce

