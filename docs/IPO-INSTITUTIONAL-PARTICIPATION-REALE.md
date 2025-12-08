# 📊 IPO - PARTECIPAZIONE ISTITUZIONALE REALE

## ⚠️ SITUAZIONE ATTUALE

### **Partecipazione Istituzionale: SIMULATA** ❌

**File**: `app/api/market/ipo-calendar/route.ts`

**Linea 117**: `// Process IPO data and add sentiment/participation (simulated for now)`
**Linea 125-126**: 
```typescript
// Simulate institutional participation
const institutionalPct = 60 + Math.random() * 30; // 60-90%
```

**Linea 148**: `majorInvestors: ['Institutional Investors'],` - Generico, non reale

---

## 🎯 COME OTTENERE DATI REALI

### ✅ **Opzione 1: Finnhub IPO Calendar** (FREE TIER)

**API**: Finnhub `/calendar/ipo`

**Cosa fornisce**:
- ✅ Symbol, Name, Exchange
- ✅ IPO Date
- ✅ Price, Shares, Market Cap
- ❌ **NON fornisce partecipazione istituzionale**

**Status**: ✅ Già usato, ma non ha dati istituzionali

---

### ✅ **Opzione 2: SEC Filings (13F)** (GRATIS)

**API**: SEC EDGAR API (GRATIS, no key)

**Cosa fornisce**:
- ✅ 13F filings (quarterly institutional holdings)
- ✅ Nome istituzioni
- ✅ Holdings per stock
- ✅ Percentuale ownership
- ⚠️ **Disponibile solo DOPO l'IPO** (quarterly reports)

**Endpoint**: 
- `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=13F-HR`

**Limitazioni**:
- ⚠️ Solo per IPO già avvenute
- ⚠️ Dati quarterly (non real-time)
- ⚠️ Richiede CIK (Company Identifier)

**Tempo**: 4-5 ore
**Status**: ⚠️ Da implementare

---

### ✅ **Opzione 3: Alpha Vantage IPO Calendar** (FREE TIER)

**API**: Alpha Vantage (GRATIS, 5 calls/min)

**Cosa fornisce**:
- ✅ IPO calendar
- ❌ **NON fornisce partecipazione istituzionale**

**Status**: ⚠️ Non migliore di Finnhub

---

### ✅ **Opzione 4: Yahoo Finance IPO Data** (GRATIS, non ufficiale)

**Cosa fornisce**:
- ✅ IPO calendar
- ✅ Pre-IPO data
- ❌ **NON fornisce partecipazione istituzionale**

**Status**: ⚠️ Non ufficiale, non ha dati istituzionali

---

### ⚠️ **Opzione 5: IPO Prospectus Scraping** (Complesso)

**Cosa fornisce**:
- ✅ Dati reali da SEC filings (S-1, 424B)
- ✅ Underwriters
- ✅ Institutional investors pre-IPO
- ✅ Allocation details

**Limitazioni**:
- ⚠️ Richiede scraping SEC EDGAR
- ⚠️ Complesso da parsare
- ⚠️ Formato varia per IPO

**Tempo**: 8-10 ore
**Status**: ⚠️ Possibile ma complesso

---

### ⚠️ **Opzione 6: Paid APIs** (Non free tier)

**APIs a pagamento**:
- **Bloomberg API**: Dati completi IPO + istituzionali
- **Refinitiv (ex Thomson Reuters)**: Dati IPO completi
- **PitchBook**: Dati venture capital e IPO
- **Crunchbase**: Dati startup e IPO

**Costo**: $500-5000/mese
**Status**: ❌ Non free tier

---

## 🚀 SOLUZIONE RACCOMANDATA

### **Approccio Ibrido** (FREE TIER)

#### **1. Pre-IPO: Dati da SEC Filings (S-1)** ⭐⭐⭐⭐

**Cosa fare**:
- Scraping SEC EDGAR per S-1 filings (IPO prospectus)
- Parsare sezione "Principal Stockholders"
- Estrarre institutional investors pre-IPO
- Calcolare percentuale allocation

**API**: SEC EDGAR (GRATIS, no key)
**Tempo**: 6-8 ore
**Status**: ⚠️ Da implementare

**Esempio**:
```
SEC Filing S-1 → Parsing → Extract:
- BlackRock: 15%
- Vanguard: 12%
- Fidelity: 8%
- Total Institutional: 60%
```

---

#### **2. Post-IPO: Dati da 13F Filings** ⭐⭐⭐⭐⭐

**Cosa fare**:
- Dopo IPO, fetch 13F filings quarterly
- Aggrega holdings per stock
- Calcola percentuale istituzionale
- Lista top institutional investors

**API**: SEC EDGAR (GRATIS, no key)
**Tempo**: 4-5 ore
**Status**: ⚠️ Da implementare

**Esempio**:
```
13F Filing Q1 2025 → Extract:
- BlackRock: 2.5M shares (12%)
- Vanguard: 2.0M shares (10%)
- State Street: 1.5M shares (7%)
- Total Institutional: 45%
```

---

#### **3. Fallback: Stima Basata su Pattern** ⭐⭐⭐

**Cosa fare**:
- Se dati SEC non disponibili, usa pattern storici
- Basato su: Exchange, Market Cap, Sector
- Stima percentuale istituzionale tipica

**Tempo**: 2-3 ore
**Status**: ⚠️ Da implementare

**Esempio**:
```
NASDAQ Tech IPO, Market Cap $1B:
- Typical Institutional: 70-85%
- Typical Retail: 15-30%
```

---

## 📋 IMPLEMENTAZIONE

### **Fase 1: SEC EDGAR Integration** (6-8 ore)

1. **SEC EDGAR API Client**
   - Fetch S-1 filings per IPO
   - Parsare HTML/XML
   - Estrarre institutional data

2. **13F Filings Parser**
   - Fetch 13F-HR quarterly
   - Parsare holdings
   - Aggrega per stock

3. **Data Storage**
   - Cache SEC data
   - Update quarterly

---

### **Fase 2: IPO Calendar Enhancement** (2-3 ore)

1. **Pre-IPO Data**
   - Integra SEC S-1 data
   - Mostra institutional investors
   - Calcola allocation

2. **Post-IPO Tracking**
   - Fetch 13F dopo IPO
   - Update institutional holdings
   - Performance tracking

---

### **Fase 3: Fallback System** (2-3 ore)

1. **Pattern-Based Estimation**
   - Database pattern storici
   - Stima basata su exchange/sector
   - Confidence score

---

## 📊 DATI DISPONIBILI CON FREE TIER

### ✅ **Pre-IPO** (SEC S-1 Filings)
- ✅ Institutional investors pre-IPO
- ✅ Allocation percentuale
- ✅ Underwriters
- ✅ Lock-up periods

### ✅ **Post-IPO** (SEC 13F Filings)
- ✅ Institutional holdings quarterly
- ✅ Top institutional investors
- ✅ Percentuale ownership
- ✅ Changes quarter-over-quarter

### ⚠️ **Limitazioni**
- ⚠️ Dati quarterly (non real-time)
- ⚠️ Richiede parsing complesso
- ⚠️ Disponibile solo per IPO USA

---

## 🎯 PRIORITÀ

### **Priorità ALTA**:
1. ✅ **13F Filings Parser** (Post-IPO tracking)
   - Dati reali quarterly
   - Top institutional investors
   - Percentuale ownership

### **Priorità MEDIA**:
2. ⚠️ **SEC S-1 Parser** (Pre-IPO data)
   - Dati pre-IPO
   - Institutional allocation
   - Complesso ma possibile

### **Priorità BASSA**:
3. ⚠️ **Pattern-Based Estimation** (Fallback)
   - Stima quando dati SEC non disponibili
   - Basato su pattern storici

---

## ✅ CONCLUSIONE

### **Situazione Attuale**:
- ❌ Partecipazione istituzionale: **SIMULATA**
- ❌ Major investors: **Generici** ("Institutional Investors")

### **Soluzione FREE TIER**:
- ✅ **SEC EDGAR API** (GRATIS, no key)
- ✅ **13F Filings** (Post-IPO, quarterly)
- ✅ **S-1 Filings** (Pre-IPO, prospectus)
- ⚠️ Richiede parsing complesso

### **Tempo Totale**: 10-14 ore

**Vuoi che implementi la partecipazione istituzionale reale usando SEC EDGAR?**
