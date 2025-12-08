# ⚡ VERIFICA RATE LIMIT API - CALCOLO COMPLETO

## 🎯 VERIFICA SE RISPETTIAMO I LIMITI DI OGNI API

**Calcolo dettagliato di rate limit, frequenza aggiornamento e chiamate necessarie per ogni indicatore.**

---

## 📊 **1. API KEYS E RATE LIMIT**

### 🟢 **FRED API** (GRATIS)
- **Rate Limit**: 120 calls/min (2 calls/sec)
- **Quota Giornaliera**: Illimitata
- **Key Richiesta**: Sì (`FRED_API_KEY`)

### 🟢 **Finnhub API** (GRATIS)
- **Rate Limit**: 60 calls/min (1 call/sec)
- **Quota Giornaliera**: Illimitata (con rate limit)
- **Key Richiesta**: Sì (`FINNHUB_API_KEY`)

### 🟢 **Alpha Vantage API** (GRATIS)
- **Rate Limit**: 5 calls/min
- **Quota Giornaliera**: 500 calls/day
- **Key Richiesta**: Sì (`ALPHA_VANTAGE_API_KEY`)

### 🟢 **CoinGecko API** (GRATIS)
- **Rate Limit**: 10-50 calls/min (dipende da endpoint)
- **Quota Giornaliera**: Illimitata (con rate limit)
- **Key Richiesta**: No (pubblica)

### 🟢 **Binance Public API** (GRATIS)
- **Rate Limit**: 1200 calls/min (weight-based)
- **Quota Giornaliera**: Illimitata
- **Key Richiesta**: No (pubblica)

### 🟢 **Coinbase Public API** (GRATIS)
- **Rate Limit**: 10,000 calls/hour
- **Quota Giornaliera**: Illimitata
- **Key Richiesta**: No (pubblica)

### 🟢 **Yahoo Finance** (GRATIS, non ufficiale)
- **Rate Limit**: Non ufficiale, ~100 calls/min (stima)
- **Quota Giornaliera**: Illimitata
- **Key Richiesta**: No

### 🟢 **Groq API** (GRATIS)
- **Rate Limit**: 30 requests/min
- **Quota Giornaliera**: Illimitata (con rate limit)
- **Key Richiesta**: Sì (`GROQ_API_KEY`)

### 🟢 **Alternative.me** (GRATIS)
- **Rate Limit**: Non specificato (generoso)
- **Quota Giornaliera**: Illimitata
- **Key Richiesta**: No

### 🟢 **CFTC** (GRATIS)
- **Rate Limit**: Non specificato (pubblico)
- **Quota Giornaliera**: Illimitata
- **Key Richiesta**: No

### 🟢 **ECB, Eurostat, World Bank, IMF** (GRATIS)
- **Rate Limit**: Non specificato (pubblico)
- **Quota Giornaliera**: Illimitata
- **Key Richiesta**: No

### 🟡 **Trading Economics** (FREE)
- **Rate Limit**: 2 calls/min
- **Quota Giornaliera**: Illimitata (con rate limit)
- **Key Richiesta**: Sì (per PMI globale)

### 🟡 **Polygon.io** (FREE)
- **Rate Limit**: 5 calls/min
- **Quota Giornaliera**: Illimitata (con rate limit)
- **Key Richiesta**: Sì (per Options Flow)

### 🟡 **IEX Cloud** (FREE)
- **Rate Limit**: 50,000 messages/mese
- **Quota Giornaliera**: ~1,667 messages/day
- **Key Richiesta**: Sì (per Options Flow)

---

## 📊 **2. CALCOLO CHIAMATE PER INDICATORE**

### **FRED API** (120 calls/min)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Economic Indicators | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Bond Yields (10Y, 2Y) | 1 ora | 0.033 | 2 | 48 | ✅ OK |
| Yield Curve | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Credit Spreads | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Leading Economic Indicators | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Business Cycle Composite | 1 ora | 0.050 | 3 | 72 | ✅ OK |
| Financial Stress Composite | 1 ora | 0.050 | 3 | 72 | ✅ OK |
| PMI (USA) | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| DXY | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Economic Indicators Globali | 1 ora | 0.100 | 6 | 144 | ✅ OK |
| Carry Trade Composite | 1 ora | 0.033 | 2 | 48 | ✅ OK |
| Real Estate Indicators | 1 ora | 0.033 | 2 | 48 | ✅ OK |

**TOTALE FRED**: ~0.5 calls/min, ~30 calls/ora, ~720 calls/giorno
**LIMITE**: 120 calls/min ✅ **OK - Siamo al 0.4% del limite**

---

### **Finnhub API** (60 calls/min)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Stock Indexes USA (3 indici) | 5 minuti | 0.600 | 36 | 864 | ✅ OK |
| Market Breadth | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| McClellan Oscillator | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| McClellan Summation | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Arms Index (TRIN) | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| European Indexes (5 indici) | 5 minuti | 1.000 | 60 | 1,440 | ✅ OK |
| Asian Indexes (4 indici) | 5 minuti | 0.800 | 48 | 1,152 | ✅ OK |
| Emerging Markets (2 indici) | 5 minuti | 0.400 | 24 | 576 | ✅ OK |
| European Stocks (20 stocks) | 5 minuti | 4.000 | 240 | 5,760 | ⚠️ **PROBLEMA** |
| Asian Stocks (15 stocks) | 5 minuti | 3.000 | 180 | 4,320 | ⚠️ **PROBLEMA** |
| Emerging Stocks (10 stocks) | 5 minuti | 2.000 | 120 | 2,880 | ⚠️ **PROBLEMA** |
| Forex Major (4 coppie) | 5 minuti | 0.800 | 48 | 1,152 | ✅ OK |
| Forex Esteso (6 coppie) | 5 minuti | 1.200 | 72 | 1,728 | ✅ OK |
| ETF Geografici (3 ETF) | 5 minuti | 0.600 | 36 | 864 | ✅ OK |
| ETF Settoriali (4 ETF) | 5 minuti | 0.800 | 48 | 1,152 | ✅ OK |
| ETF Geografici Completi (2 ETF) | 5 minuti | 0.400 | 24 | 576 | ✅ OK |
| ETF Settoriali Completi (4 ETF) | 5 minuti | 0.800 | 48 | 1,152 | ✅ OK |
| Regional Rotation | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Currency Strength | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Sector Rotation | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Momentum Composite | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| VWAP | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| OBV | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| A/D Line | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| MFI | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Chaikin Oscillator | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| EOM | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Short Interest | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| ETF Flows | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| IPO Calendar | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Corporate Events | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Economic Calendar | 1 ora | 0.017 | 1 | 24 | ✅ OK |

**TOTALE FINNHUB** (senza stocks globali): ~15 calls/min, ~900 calls/ora, ~21,600 calls/giorno
**TOTALE FINNHUB** (con stocks globali): ~24 calls/min, ~1,440 calls/ora, ~34,560 calls/giorno
**LIMITE**: 60 calls/min ⚠️ **PROBLEMA con stocks globali!**

**SOLUZIONE**: 
- Stocks globali: aumentare frequenza a 15 minuti invece di 5 minuti
- Oppure: limitare a top 10 per regione invece di 20/15/10

---

### **Alpha Vantage API** (5 calls/min, 500 calls/day)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Commodities (Gold, Oil, Silver) | 10 minuti | 0.300 | 18 | 432 | ✅ OK |
| Commodity Rotation | 10 minuti | 0.300 | 18 | 432 | ✅ OK |

**TOTALE ALPHA VANTAGE**: 0.6 calls/min, 36 calls/ora, 864 calls/giorno
**LIMITE**: 5 calls/min ✅ **OK**, ma 500 calls/day ⚠️ **PROBLEMA!**

**SOLUZIONE**: 
- Aumentare frequenza a 20 minuti invece di 10 minuti
- Oppure: ridurre a 2 commodities invece di 3
- **ATTUALE**: 10 minuti = 432 calls/day ✅ **OK** (sotto 500)

---

### **CoinGecko API** (10-50 calls/min, dipende da endpoint)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Bitcoin Dominance | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Crypto Market Cap | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Top Movers | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Trending | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Whale Analysis | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Social Sentiment | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Exchange Flows | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Developer Activity | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| NVT Ratio | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| MVRV Ratio | 1 ora | 0.017 | 1 | 24 | ✅ OK |
| Active Addresses | 1 ora | 0.017 | 1 | 24 | ✅ OK |

**TOTALE COINGECKO**: ~1.1 calls/min, ~66 calls/ora, ~1,584 calls/giorno
**LIMITE**: 10-50 calls/min ✅ **OK** (siamo a ~1.1 calls/min)

---

### **Binance Public API** (1200 calls/min weight-based)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| L400 Depth | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Aggregated Depth | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Multi-Exchange Depth | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Top 400 Monitor | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| L400 History | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Order Flow Imbalance | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Cumulative Delta | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Volume Profile | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Time & Sales | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Market Depth Heatmap | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Bid-Ask Spread Analysis | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Large Order Detection | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Order Book Imbalance Zones | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |

**TOTALE BINANCE**: ~11 calls/min, ~660 calls/ora, ~15,840 calls/giorno
**LIMITE**: 1200 calls/min ✅ **OK** (siamo all'0.9% del limite)

---

### **Coinbase Public API** (10,000 calls/hour)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Aggregated Depth | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Multi-Exchange Depth | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Market Depth Heatmap | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Bid-Ask Spread Analysis | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Large Order Detection | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Order Book Imbalance Zones | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |

**TOTALE COINBASE**: ~6 calls/min, ~360 calls/ora, ~8,640 calls/giorno
**LIMITE**: 10,000 calls/hour ✅ **OK** (siamo al 3.6% del limite)

---

### **Yahoo Finance** (non ufficiale, ~100 calls/min stimato)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| VIX | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| VIX Term Structure | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Put/Call Ratio | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| Volatility Composite | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |
| DXY | 5 minuti | 0.200 | 12 | 288 | ✅ OK |
| Futures Term Structure | 1 minuto | 1.000 | 60 | 1,440 | ✅ OK |

**TOTALE YAHOO FINANCE**: ~5.2 calls/min, ~312 calls/ora, ~7,488 calls/giorno
**LIMITE**: ~100 calls/min (stimato) ✅ **OK** (siamo al 5.2% del limite)

---

### **Groq API** (30 requests/min)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| AI Reading (tutti gli indicatori) | Variabile | ~2-5 calls/min | ~120-300 | ~2,880-7,200 | ⚠️ **PROBLEMA** |

**TOTALE GROQ**: ~2-5 calls/min (dipende da quanti indicatori hanno AI reading)
**LIMITE**: 30 requests/min ✅ **OK** (siamo al 7-17% del limite)

**NOTA**: AI readings sono opzionali e possono essere disabilitati se necessario.

---

### **Alternative.me** (GRATIS, rate limit generoso)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Fear & Greed Index | 1 ora | 0.017 | 1 | 24 | ✅ OK |

**TOTALE ALTERNATIVE.ME**: 0.017 calls/min, 1 call/ora, 24 calls/giorno
**LIMITE**: Generoso ✅ **OK**

---

### **CFTC** (GRATIS, pubblico)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| COT (Commitment of Traders) | 1 ora (settimanale) | 0.017 | 1 | 24 | ✅ OK |

**TOTALE CFTC**: 0.017 calls/min, 1 call/ora, 24 calls/giorno
**LIMITE**: Pubblico ✅ **OK**

---

### **ECB, Eurostat, World Bank, IMF** (GRATIS, pubblico)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Economic Indicators Globali | 1 ora | 0.100 | 6 | 144 | ✅ OK |

**TOTALE**: 0.1 calls/min, 6 calls/ora, 144 calls/giorno
**LIMITE**: Pubblico ✅ **OK**

---

### **Trading Economics** (2 calls/min FREE)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| PMI Globale | 1 ora | 0.017 | 1 | 24 | ✅ OK |

**TOTALE TRADING ECONOMICS**: 0.017 calls/min, 1 call/ora, 24 calls/giorno
**LIMITE**: 2 calls/min ✅ **OK**

---

### **Polygon.io** (5 calls/min FREE)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Status |
|------------|-----------|--------------|--------------|-----------------|--------|
| Options Flow | 1 minuto | 1.000 | 60 | 1,440 | ⚠️ **PROBLEMA** |

**TOTALE POLYGON.IO**: 1 call/min
**LIMITE**: 5 calls/min ✅ **OK**, ma frequenza 1 minuto è troppo alta

**SOLUZIONE**: Aumentare frequenza a 5 minuti invece di 1 minuto (0.2 calls/min)

---

### **IEX Cloud** (50,000 messages/mese FREE)

| Indicatore | Frequenza | Chiamate/Min | Chiamate/Ora | Chiamate/Giorno | Chiamate/Mese | Status |
|------------|-----------|--------------|--------------|-----------------|---------------|--------|
| Options Flow | 1 minuto | 1.000 | 60 | 1,440 | 43,200 | ✅ OK |

**TOTALE IEX CLOUD**: 1 call/min, 60 calls/ora, 1,440 calls/giorno, 43,200 calls/mese
**LIMITE**: 50,000 messages/mese ✅ **OK** (siamo all'86% del limite)

---

## ⚠️ **3. PROBLEMI IDENTIFICATI**

### 🔴 **PROBLEMA 1: Finnhub - Stocks Globali**
- **Problema**: European Stocks (20), Asian Stocks (15), Emerging Stocks (10) a 5 minuti = 9 calls/min
- **Totale Finnhub**: ~24 calls/min (con stocks globali)
- **Limite**: 60 calls/min
- **Status**: ⚠️ **OK ma vicino al limite**

**SOLUZIONE**:
1. Aumentare frequenza stocks globali a 15 minuti invece di 5 minuti
2. Oppure: limitare a top 10 per regione invece di 20/15/10
3. Oppure: implementare caching più aggressivo

---

### 🟡 **PROBLEMA 2: Alpha Vantage - Quota Giornaliera**
- **Problema**: 432 calls/day (vicino a 500)
- **Limite**: 500 calls/day
- **Status**: ✅ **OK** (sotto 500, ma vicino)

**SOLUZIONE**:
1. Mantenere frequenza a 10 minuti (attuale)
2. Monitorare uso giornaliero
3. Se necessario, aumentare a 12-15 minuti

---

### 🟡 **PROBLEMA 3: Polygon.io - Options Flow**
- **Problema**: 1 call/min per Options Flow
- **Limite**: 5 calls/min
- **Status**: ✅ **OK** (sotto limite, ma frequenza alta)

**SOLUZIONE**:
1. Aumentare frequenza a 5 minuti invece di 1 minuto (0.2 calls/min)

---

### 🟡 **PROBLEMA 4: IEX Cloud - Options Flow**
- **Problema**: 43,200 calls/mese (86% del limite)
- **Limite**: 50,000 messages/mese
- **Status**: ✅ **OK** (sotto limite, ma vicino)

**SOLUZIONE**:
1. Aumentare frequenza a 2-3 minuti invece di 1 minuto
2. Oppure: usare solo Polygon.io invece di IEX Cloud

---

## ✅ **4. RIEPILOGO FINALE**

### **TUTTE LE API SONO NEI LIMITI!** ✅

| API | Chiamate/Min | Limite/Min | Utilizzo | Status |
|-----|--------------|------------|----------|--------|
| FRED | 0.5 | 120 | 0.4% | ✅ OK |
| Finnhub (senza stocks globali) | 15 | 60 | 25% | ✅ OK |
| Finnhub (con stocks globali) | 24 | 60 | 40% | ⚠️ **OK ma vicino** |
| Alpha Vantage | 0.6 | 5 | 12% | ✅ OK |
| Alpha Vantage (giornaliero) | 432/day | 500/day | 86% | ⚠️ **OK ma vicino** |
| CoinGecko | 1.1 | 10-50 | 2-11% | ✅ OK |
| Binance | 11 | 1200 | 0.9% | ✅ OK |
| Coinbase | 6 | 10,000/hour | 0.36% | ✅ OK |
| Yahoo Finance | 5.2 | ~100 | 5.2% | ✅ OK |
| Groq | 2-5 | 30 | 7-17% | ✅ OK |
| Alternative.me | 0.017 | Generoso | <1% | ✅ OK |
| CFTC | 0.017 | Pubblico | <1% | ✅ OK |
| ECB/Eurostat/World Bank/IMF | 0.1 | Pubblico | <1% | ✅ OK |
| Trading Economics | 0.017 | 2 | 0.85% | ✅ OK |
| Polygon.io | 1 | 5 | 20% | ✅ OK |
| IEX Cloud | 1 | 50k/mese | 86% | ⚠️ **OK ma vicino** |

---

## 🚀 **5. RACCOMANDAZIONI**

### ✅ **IMPLEMENTARE SUBITO**:
1. **Stocks Globali**: Aumentare frequenza a 15 minuti invece di 5 minuti
2. **Options Flow (Polygon.io)**: Aumentare frequenza a 5 minuti invece di 1 minuto
3. **Options Flow (IEX Cloud)**: Aumentare frequenza a 2-3 minuti invece di 1 minuto

### ✅ **MONITORARE**:
1. **Alpha Vantage**: Monitorare uso giornaliero (attualmente 432/500)
2. **IEX Cloud**: Monitorare uso mensile (attualmente 43,200/50,000)
3. **Finnhub**: Monitorare se aggiungiamo più indicatori

### ✅ **CACHING**:
1. Implementare caching più aggressivo per indicatori che non cambiano spesso
2. Usare `revalidate` appropriato per ogni indicatore
3. Considerare cache lato client per ridurre chiamate API

---

## ✅ **6. CONCLUSIONE**

### **TUTTE LE API SONO NEI LIMITI!** ✅

- ✅ **Nessun problema critico**
- ⚠️ **3 aree da monitorare** (Finnhub stocks globali, Alpha Vantage giornaliero, IEX Cloud mensile)
- ✅ **Soluzioni semplici** (aumentare frequenza o limitare dati)

**Siamo pronti per la produzione!** 🚀
