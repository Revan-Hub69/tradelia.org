# API Real-Time Gratuite per Prezzi Finanziari

## Analisi API Disponibili

### ✅ API Gratuite con Limiti

#### 1. **Alpha Vantage** ⭐ (Consigliata)
- **URL**: `https://www.alphavantage.co/`
- **Free Tier**:
  - 5 chiamate/minuto
  - 500 chiamate/giorno
  - Richiede API key (gratuita)
- **Dati**: Stocks, Forex, Crypto, Commodities
- **Aggiornamento**: End-of-day (EOD) o intraday con delay
- **Pro**: Affidabile, documentazione buona
- **Contro**: Rate limit basso, non vero real-time

#### 2. **Finnhub** ⭐
- **URL**: `https://finnhub.io/`
- **Free Tier**:
  - 60 chiamate/minuto
  - Richiede API key (gratuita)
- **Dati**: Stocks, Forex, Crypto
- **Aggiornamento**: Real-time per alcuni mercati (con delay 15min per free tier)
- **Pro**: Rate limit più alto, buona documentazione
- **Contro**: Delay 15min per dati real-time

#### 3. **Twelve Data**
- **URL**: `https://twelvedata.com/`
- **Free Tier**:
  - 8 chiamate/minuto
  - 800 chiamate/giorno
  - Richiede API key (gratuita)
- **Dati**: Stocks, Forex, Crypto, Indices
- **Aggiornamento**: End-of-day o intraday
- **Pro**: Buona copertura
- **Contro**: Rate limit basso

#### 4. **IEX Cloud**
- **URL**: `https://iexcloud.io/`
- **Free Tier**:
  - 50,000 messaggi/mese
  - Richiede API key (gratuita)
- **Dati**: Stocks US principalmente
- **Aggiornamento**: Real-time (con limiti)
- **Pro**: Buona per US stocks
- **Contro**: Limitato a mercati US

#### 5. **Polygon.io**
- **URL**: `https://polygon.io/`
- **Free Tier**:
  - 5 chiamate/minuto
  - Richiede API key (gratuita)
- **Dati**: Stocks, Forex, Crypto
- **Aggiornamento**: End-of-day
- **Pro**: Buona qualità dati
- **Contro**: Rate limit molto basso

#### 6. **Yahoo Finance (Non Ufficiale)** ⚠️
- **URL**: `https://finance.yahoo.com/`
- **Free Tier**: Illimitato (ma non ufficiale)
- **Dati**: Stocks, Forex, Crypto, Indices
- **Aggiornamento**: Real-time (con delay variabile)
- **Pro**: Nessun limite, nessuna API key
- **Contro**: **Non ufficiale**, può cambiare/rompersi in qualsiasi momento, instabile

### ❌ Problemi Comuni

1. **Rate Limits**: Tutte le API gratuite hanno limiti di chiamate
2. **Delay**: I dati "real-time" spesso hanno delay (15min-1h)
3. **Instabilità**: API non ufficiali (Yahoo) possono rompersi
4. **Copertura**: Alcune API coprono solo mercati specifici
5. **Termini di Servizio**: Possono cambiare e limitare l'uso

---

## ✅ API Già Integrate in Tradelia

Tradelia ha **già integrato** queste API gratuite:

1. **Finnhub** ✅
   - **Rate Limit**: 60 calls/minuto
   - **Setup**: Richiede `FINNHUB_API_KEY` in `.env` (gratuita)
   - **Supporta**: Stocks, Forex, Crypto
   - **Stato**: ✅ Già implementato in `lib/price-apis/finnhub.ts`

2. **Binance** ✅
   - **Rate Limit**: 1200 calls/minuto (molto generoso!)
   - **Setup**: Nessuna API key necessaria (pubblico)
   - **Supporta**: Solo Crypto
   - **Stato**: ✅ Già implementato in `lib/price-apis/binance.ts`

3. **Yahoo Finance** ⚠️
   - **Rate Limit**: Illimitato (ma non ufficiale)
   - **Setup**: Nessuna API key
   - **Supporta**: Stocks, Crypto, Forex, Commodities
   - **Stato**: ✅ Già implementato in `lib/price-apis/yahoo-finance.ts`
   - **Problema**: Non ufficiale, può rompersi se Yahoo cambia struttura

**Sistema di Fallback**: Il sistema prova prima Finnhub/Binance, poi Yahoo Finance come fallback.

---

## 🎯 Raccomandazione per Tradelia

### Opzione 1: **Solo Strumenti Standalone** (Raccomandato) ✅
- **Vantaggi**:
  - Zero dipendenze esterne
  - Sempre funzionante
  - Nessun costo nascosto
  - Nessun problema di rate limits
  - Performance garantite
- **Strumenti**: 12 calcolatori matematici perfetti
- **Watchlist/Portfolio**: Rimuovere o fare versione "manual" (utente inserisce prezzi)

### Opzione 2: **Usare API Già Integrate** (Già Disponibile) ✅
- **API**: Finnhub + Binance + Yahoo Finance (già implementate!)
- **Strategia**:
  - Cache già implementata (5 minuti) in `getCurrentPriceCached`
  - Fallback automatico tra provider
  - Rate limiting gestito (60/min Finnhub, 1200/min Binance)
- **Vantaggi**: 
  - ✅ Già funzionante
  - ✅ Multi-provider con fallback
  - ✅ Cache intelligente
  - ✅ Zero costi (tutte gratuite)
- **Svantaggi**: 
  - ⚠️ Finnhub richiede API key (ma gratuita)
  - ⚠️ Yahoo Finance non ufficiale (può rompersi)
  - ⚠️ Delay 5 minuti per cache
- **Setup Richiesto**: Aggiungere `FINNHUB_API_KEY` in `.env`

### Opzione 3: **Watchlist/Portfolio "Manual"** (Ibrido)
- **Watchlist**: Utente inserisce prezzi manualmente o importa CSV
- **Portfolio**: Utente inserisce posizioni e prezzi manualmente
- **Vantaggi**: Zero dipendenze, sempre funzionante
- **Svantaggi**: Richiede input manuale

---

## 📊 Confronto

| Soluzione | Costo | Affidabilità | Real-Time | Complessità |
|-----------|-------|--------------|-----------|-------------|
| Solo Standalone | ✅ Gratis | ✅ 100% | ❌ N/A | ✅ Bassa |
| API Gratuita | ✅ Gratis | ⚠️ Media | ⚠️ Delay 15min | ⚠️ Media |
| API Pagata | ❌ Costo | ✅ Alta | ✅ Vero | ❌ Alta |
| Manual Input | ✅ Gratis | ✅ 100% | ❌ Manuale | ✅ Bassa |

---

## 💡 Suggerimento Finale

### ✅ **Raccomandazione: Usare API Già Integrate**

Tradelia ha **già tutto il necessario** per Watchlist e Portfolio Manager:

1. **API Gratuite Già Implementate**:
   - ✅ Finnhub (60/min) - Stocks, Forex
   - ✅ Binance (1200/min) - Crypto
   - ✅ Yahoo Finance (illimitato) - Fallback

2. **Sistema Robusto**:
   - ✅ Cache intelligente (5 minuti)
   - ✅ Fallback automatico
   - ✅ Rate limiting gestito
   - ✅ Error handling

3. **Setup Minimo**:
   - Solo aggiungere `FINNHUB_API_KEY` in `.env` (gratuita, 2 minuti)

### 🎯 Decisione

**Opzione A: Mantenere Watchlist/Portfolio con API Esistenti** ✅
- **Pro**: Funziona già, zero costi, dati automatici
- **Contro**: Richiede API key Finnhub (ma gratuita)
- **Setup**: Aggiungere `FINNHUB_API_KEY` in `.env`

**Opzione B: Solo Strumenti Standalone** ✅
- **Pro**: Zero dipendenze, sempre funzionante
- **Contro**: Watchlist/Portfolio rimossi o manuali
- **Setup**: Nessuno

### 📊 Conclusione

**Consiglio**: **Opzione A** - Le API sono già integrate e funzionano bene. Basta aggiungere la API key Finnhub (gratuita) e Watchlist/Portfolio Manager funzioneranno perfettamente.

Gli **12 strumenti matematici** rimangono comunque **standalone** e perfetti, indipendentemente dalla scelta.
