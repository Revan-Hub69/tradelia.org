# 📊 INSIDER TRADING - FEED GENERALE DEL MERCATO

## 🎯 OBIETTIVO: Ultimi Insider Trading del Mercato

**Vuoi vedere gli ultimi insider trading di TUTTO il mercato**, non solo di un singolo stock.

---

## ✅ **1. FINNHUB INSIDER TRANSACTIONS** (FREE TIER)

### **API**: Finnhub `/stock/insider-transactions`
**Costo**: GRATIS (60 calls/min)
**Status**: ⚠️ Da verificare disponibilità

### **Endpoint**:
```
GET https://finnhub.io/api/v1/stock/insider-transactions?symbol={symbol}&token={apiKey}
```

### **Cosa fornisce**:
- ✅ Ultime transazioni insider per symbol
- ✅ Insider name, title, transaction type
- ✅ Shares, price, value
- ✅ Transaction date

### **Limitazioni**:
- ⚠️ **Per singolo symbol** (non feed generale mercato)
- ⚠️ Richiede symbol specifico
- ⚠️ Non c'è endpoint "tutti gli insider del mercato"

**Status**: ⚠️ Disponibile ma per symbol singolo

---

## ✅ **2. FINNHUB INSIDER SENTIMENT** (FREE TIER)

### **API**: Finnhub `/stock/insider-sentiment`
**Costo**: GRATIS (60 calls/min)

### **Endpoint**:
```
GET https://finnhub.io/api/v1/stock/insider-sentiment?symbol={symbol}&token={apiKey}
```

### **Cosa fornisce**:
- ✅ Insider sentiment score per symbol
- ✅ Buy/Sell ratio
- ✅ Aggregato mensile

### **Limitazioni**:
- ⚠️ **Per singolo symbol** (non feed generale)
- ⚠️ Aggregato mensile (non transazioni individuali)

**Status**: ⚠️ Disponibile ma per symbol singolo

---

## ⚠️ **3. SEC EDGAR - FEED GENERALE** (GRATIS)

### **API**: SEC EDGAR (GRATIS, no key)

### **Endpoint**:
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&company=&dateb=&owner=include&start=0&count=100
```

### **Cosa fornisce**:
- ✅ **TUTTE le ultime Form 4 del mercato**
- ✅ Feed generale (non per symbol)
- ✅ Ultime transazioni insider
- ✅ Tutti i dati: name, title, shares, price, value

### **Vantaggi**:
- ✅ **Feed generale del mercato**
- ✅ Aggiornato in tempo reale
- ✅ Tutti gli insider, tutti gli stock
- ✅ GRATIS, no key

### **Limitazioni**:
- ⚠️ Richiede parsing complesso (HTML/XML)
- ⚠️ Solo IPO USA (SEC è USA)
- ⚠️ Dati disponibili dopo 2 giorni dalla transazione

**Status**: ⚠️ Da implementare (parsing complesso)

---

## 📊 **4. SOLUZIONE RACCOMANDATA**

### **Approccio Ibrido** (FREE TIER)

#### **Opzione 1: SEC EDGAR Feed Parser** ⭐⭐⭐⭐⭐

**Cosa fa**:
- Fetch ultime Form 4 dal mercato
- Parsare tutte le transazioni
- Creare feed generale
- Aggiornare daily

**API**: SEC EDGAR (GRATIS, no key)
**Tempo**: 6-8 ore
**Status**: ⚠️ Da implementare

**Output**:
```json
{
  "feed": [
    {
      "symbol": "AAPL",
      "insiderName": "Tim Cook",
      "title": "CEO",
      "transactionDate": "2025-01-15",
      "type": "Purchase",
      "shares": 10000,
      "price": 150.00,
      "value": 1500000
    },
    {
      "symbol": "MSFT",
      "insiderName": "Satya Nadella",
      "title": "CEO",
      "transactionDate": "2025-01-14",
      "type": "Purchase",
      "shares": 5000,
      "price": 380.00,
      "value": 1900000
    }
  ],
  "summary": {
    "totalTransactions": 150,
    "totalBuyValue": 50000000,
    "totalSellValue": 20000000,
    "buySellRatio": 2.5,
    "topBuyers": ["AAPL", "MSFT", "GOOGL"],
    "topSellers": ["TSLA", "META"]
  }
}
```

---

#### **Opzione 2: Finnhub Multi-Symbol** ⭐⭐⭐

**Cosa fa**:
- Fetch insider transactions per top stocks (S&P 500)
- Aggregare in feed generale
- Update daily

**API**: Finnhub (GRATIS, 60 calls/min)
**Tempo**: 4-5 ore
**Status**: ⚠️ Da implementare

**Limitazioni**:
- ⚠️ Richiede chiamate multiple (una per symbol)
- ⚠️ Con 500 stocks = 500 chiamate (limite Finnhub: 60/min = 8.3 minuti)
- ⚠️ Cache necessario

---

#### **Opzione 3: SEC EDGAR + Finnhub** ⭐⭐⭐⭐⭐

**Cosa fa**:
- SEC EDGAR per feed generale (tutti gli stock)
- Finnhub per dettagli aggiuntivi (se necessario)
- Best of both worlds

**API**: SEC EDGAR (GRATIS) + Finnhub (GRATIS)
**Tempo**: 8-10 ore
**Status**: ⚠️ Da implementare

---

## 🚀 **5. IMPLEMENTAZIONE RACCOMANDATA**

### **API Route**: `/api/market/insider-feed`

**Query Params**:
- `days` - Periodo (7, 30, 90)
- `type` - All, Buy, Sell
- `minValue` - Valore minimo transazione
- `role` - All, CEO, CFO, Director

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
      { "symbol": "AAPL", "value": 5000000 },
      { "symbol": "MSFT", "value": 4000000 }
    ],
    "topSellers": [
      { "symbol": "TSLA", "value": 3000000 },
      { "symbol": "META", "value": 2000000 }
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
  }
}
```

---

## 📋 **6. DATI DISPONIBILI**

### ✅ **SEC EDGAR Feed Generale** (GRATIS)

**Cosa fornisce**:
- ✅ **Tutte le ultime Form 4 del mercato**
- ✅ Feed generale (non per symbol)
- ✅ Aggiornato daily
- ✅ Tutti i dati: symbol, insider, shares, price, value

**Endpoint**: SEC EDGAR Browse (GRATIS)
**Tempo**: 6-8 ore (parsing)
**Status**: ⚠️ Da implementare

---

### ✅ **Finnhub Insider Transactions** (FREE TIER)

**Cosa fornisce**:
- ✅ Insider transactions per symbol
- ✅ Dati dettagliati
- ⚠️ **Non feed generale** (richiede symbol)

**Endpoint**: `/stock/insider-transactions?symbol={symbol}`
**Tempo**: 4-5 ore (multi-symbol aggregation)
**Status**: ⚠️ Da implementare

---

## 🎯 **7. SOLUZIONE FINALE**

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

## ✅ **8. CONCLUSIONE**

### **Esiste API per Feed Generale?**
- ❌ **Finnhub**: NO (solo per symbol singolo)
- ✅ **SEC EDGAR**: SÌ (feed generale, gratis)

### **Soluzione**:
- ✅ **SEC EDGAR Feed Parser** (GRATIS, no key)
- ✅ Feed generale ultimi insider del mercato
- ✅ Tutti i dati: symbol, insider, shares, price, value
- ⚠️ Richiede parsing complesso

### **Tempo**: 6-8 ore

**Vuoi che implementi il feed generale insider trading usando SEC EDGAR?**
