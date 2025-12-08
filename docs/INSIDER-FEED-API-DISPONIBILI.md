# 📊 INSIDER TRADING - FEED GENERALE DEL MERCATO

## 🎯 RISPOSTA RAPIDA

### **Esiste API per Feed Generale Insider?**
- ❌ **Finnhub**: NO (solo per symbol singolo)
- ✅ **SEC EDGAR**: SÌ (feed generale, GRATIS)

---

## ✅ **1. FINNHUB INSIDER TRANSACTIONS** (FREE TIER)

### **Endpoint**: `/stock/insider-transactions`
**API**: Finnhub (GRATIS, 60 calls/min)

### **Cosa fornisce**:
- ✅ Ultime transazioni insider
- ✅ Insider name, title, transaction type
- ✅ Shares, price, value
- ✅ Transaction date

### **Limitazioni**:
- ❌ **Solo per symbol singolo** (es. `?symbol=AAPL`)
- ❌ **NON c'è feed generale** del mercato
- ❌ Richiede chiamare per ogni symbol

**Esempio**:
```
GET /stock/insider-transactions?symbol=AAPL&token={key}
→ Restituisce solo insider di AAPL
```

**Status**: ⚠️ Disponibile ma per symbol singolo

---

## ✅ **2. FINNHUB INSIDER SENTIMENT** (FREE TIER)

### **Endpoint**: `/stock/insider-sentiment`
**API**: Finnhub (GRATIS, 60 calls/min)

### **Cosa fornisce**:
- ✅ Insider sentiment score
- ✅ Buy/Sell ratio
- ✅ Aggregato mensile

### **Limitazioni**:
- ❌ **Solo per symbol singolo**
- ❌ Aggregato mensile (non transazioni individuali)
- ❌ **NON feed generale**

**Status**: ⚠️ Disponibile ma per symbol singolo

---

## ✅ **3. SEC EDGAR - FEED GENERALE** (GRATIS, NO KEY)

### **Endpoint**: SEC EDGAR Browse
**API**: SEC EDGAR (GRATIS, no key)

### **URL**:
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&company=&dateb=&owner=include&start=0&count=100
```

### **Cosa fornisce**:
- ✅ **TUTTE le ultime Form 4 del mercato**
- ✅ **Feed generale** (non per symbol)
- ✅ Ultime transazioni insider
- ✅ Tutti i dati: symbol, insider, shares, price, value
- ✅ Aggiornato daily

### **Vantaggi**:
- ✅ **Feed generale del mercato** (tutti gli stock)
- ✅ **GRATIS, no key**
- ✅ Aggiornato in tempo reale
- ✅ Tutti gli insider, tutti gli stock

### **Limitazioni**:
- ⚠️ Richiede parsing complesso (HTML/XML)
- ⚠️ Solo IPO USA (SEC è USA)
- ⚠️ Dati disponibili dopo 2 giorni dalla transazione

**Status**: ⚠️ Da implementare (parsing complesso)

---

## 🚀 **4. SOLUZIONE RACCOMANDATA**

### **SEC EDGAR Feed Parser** ⭐⭐⭐⭐⭐

**Perché**:
- ✅ **Feed generale del mercato** (tutti gli stock)
- ✅ **GRATIS, no key**
- ✅ Aggiornato daily
- ✅ Tutti i dati necessari

**Implementazione**:
1. Fetch ultime Form 4 da SEC EDGAR
2. Parsare HTML/XML
3. Estrarre: symbol, insider, shares, price, value
4. Creare feed aggregato
5. Calcolare indicatori (Buy/Sell Ratio, etc.)

**Tempo**: 6-8 ore
**Status**: ⚠️ Da implementare

---

## 📊 **5. API ROUTE PROPOSTA**

### **`/api/market/insider-feed`**

**Query Params**:
- `days` - Periodo (7, 30, 90) - default: 7
- `type` - All, Buy, Sell - default: All
- `minValue` - Valore minimo transazione - default: 0
- `role` - All, CEO, CFO, Director - default: All
- `limit` - Numero risultati - default: 100

**Response**:
```json
{
  "feed": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "insiderName": "Tim Cook",
      "title": "CEO",
      "transactionDate": "2025-01-15",
      "type": "Purchase",
      "shares": 10000,
      "price": 150.00,
      "value": 1500000,
      "ownershipAfter": 0.05
    },
    {
      "symbol": "MSFT",
      "name": "Microsoft Corporation",
      "insiderName": "Satya Nadella",
      "title": "CEO",
      "transactionDate": "2025-01-14",
      "type": "Purchase",
      "shares": 5000,
      "price": 380.00,
      "value": 1900000,
      "ownershipAfter": 0.03
    }
  ],
  "summary": {
    "period": "7D",
    "totalTransactions": 150,
    "totalBuyValue": 50000000,
    "totalSellValue": 20000000,
    "buySellRatio": 2.5,
    "netBuying": 30000000,
    "topBuyers": [
      { "symbol": "AAPL", "name": "Apple Inc.", "value": 5000000 },
      { "symbol": "MSFT", "name": "Microsoft Corporation", "value": 4000000 }
    ],
    "topSellers": [
      { "symbol": "TSLA", "name": "Tesla Inc.", "value": 3000000 },
      { "symbol": "META", "name": "Meta Platforms Inc.", "value": 2000000 }
    ],
    "ceoCfoActivity": {
      "ceoBuying": 12,
      "ceoSelling": 3,
      "cfoBuying": 8,
      "cfoSelling": 2
    }
  },
  "indicators": {
    "marketBuySellRatio": 2.5,
    "marketConfidence": 75,
    "clusterStrength": 0.8
  },
  "timestamp": "2025-01-27T10:00:00Z"
}
```

---

## 📋 **6. ALTERNATIVE (Se SEC troppo complesso)**

### **Opzione A: Finnhub Multi-Symbol** ⭐⭐⭐

**Cosa fa**:
- Fetch insider transactions per top stocks (S&P 500)
- Aggregare in feed generale
- Update daily

**API**: Finnhub (GRATIS, 60 calls/min)
**Tempo**: 4-5 ore

**Limitazioni**:
- ⚠️ Richiede chiamate multiple (una per symbol)
- ⚠️ Con 500 stocks = 500 chiamate
- ⚠️ Limite Finnhub: 60/min = 8.3 minuti per 500 stocks
- ⚠️ Cache necessario

**Implementazione**:
1. Lista top stocks (S&P 500)
2. Fetch insider transactions per ogni stock (con rate limiting)
3. Aggregare in feed generale
4. Cache risultati (update daily)

**Status**: ⚠️ Possibile ma lento

---

### **Opzione B: SEC EDGAR (Raccomandato)** ⭐⭐⭐⭐⭐

**Perché migliore**:
- ✅ **Feed generale** (tutti gli stock, non solo S&P 500)
- ✅ **Una chiamata** invece di 500
- ✅ **Più veloce** (dopo parsing)
- ✅ **Più completo**

**Status**: ⚠️ Da implementare (parsing complesso)

---

## ✅ **7. CONCLUSIONE**

### **Esiste API per Feed Generale?**
- ❌ **Finnhub**: NO (solo per symbol singolo)
- ✅ **SEC EDGAR**: SÌ (feed generale, GRATIS, no key)

### **Soluzione Raccomandata**:
- ✅ **SEC EDGAR Feed Parser**
- ✅ Feed generale ultimi insider del mercato
- ✅ Tutti i dati: symbol, insider, shares, price, value
- ⚠️ Richiede parsing complesso (6-8 ore)

### **Alternativa**:
- ⚠️ **Finnhub Multi-Symbol** (4-5 ore, ma lento e limitato)

**Vuoi che implementi il feed generale insider trading usando SEC EDGAR?**
