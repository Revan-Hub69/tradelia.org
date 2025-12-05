/**
 * Methodology Notes for Market Indicators
 *
 * Standard Tradelia AI - Centralized methodology notes
 * Used by MethodologyPopup component
 */

export interface MethodologyNote {
  title: string;
  description: string;
  academicReference?: string;
  methodology?: string;
  limitations?: string;
}

export function getBitcoinDominanceMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Bitcoin Dominance" : "Bitcoin Dominance",
    description:
      locale === "it"
        ? "Bitcoin Dominance misura la percentuale di Bitcoin sul totale market cap del mercato crypto. Calcolato come (Bitcoin Market Cap / Total Crypto Market Cap) × 100."
        : "Bitcoin Dominance measures Bitcoin percentage of total crypto market cap. Calculated as (Bitcoin Market Cap / Total Crypto Market Cap) × 100.",
    academicReference:
      locale === "it"
        ? "Market Cap Analysis - Portfolio Theory"
        : "Market Cap Analysis - Portfolio Theory",
    methodology:
      locale === "it"
        ? "Calcolato usando dati market cap da CoinGecko. Range 0-100%, dove valori alti indicano preferenza per Bitcoin, valori bassi indicano rotazione verso altcoin."
        : "Calculated using market cap data from CoinGecko. Range 0-100%, where high values indicate Bitcoin preference, low values indicate rotation to altcoins.",
    limitations:
      locale === "it"
        ? "La dominance può essere influenzata da nuovi progetti con market cap elevato. Non predice timing preciso delle rotazioni. Richiede contesto di altri indicatori per interpretazione completa."
        : "Dominance can be influenced by new projects with high market cap. Does not predict precise timing of rotations. Requires context from other indicators for complete interpretation.",
  };
}

export function getFearGreedMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Fear & Greed Index" : "Fear & Greed Index",
    description:
      locale === "it"
        ? "Indice di sentiment del mercato crypto che combina volatilità, volume, social media, surveys e Bitcoin dominance. Range 0-100 (0=Extreme Fear, 100=Extreme Greed)."
        : "Crypto market sentiment index combining volatility, volume, social media, surveys and Bitcoin dominance. Range 0-100 (0=Extreme Fear, 100=Extreme Greed).",
    academicReference:
      locale === "it"
        ? "Behavioral Finance - Market Sentiment Analysis"
        : "Behavioral Finance - Market Sentiment Analysis",
    methodology:
      locale === "it"
        ? "Calcolato da Alternative.me combinando 5 fattori: volatilità (25%), volume/market momentum (25%), social media (15%), surveys (15%), Bitcoin dominance (10%). Aggiornato giornalmente."
        : "Calculated by Alternative.me combining 5 factors: volatility (25%), volume/market momentum (25%), social media (15%), surveys (15%), Bitcoin dominance (10%). Updated daily.",
    limitations:
      locale === "it"
        ? "L'indice è retroattivo e può non predire movimenti futuri. Influenzato da eventi esterni e manipolazione social media. Richiede conferma da altri indicatori tecnici e fondamentali."
        : "The index is retroactive and may not predict future movements. Influenced by external events and social media manipulation. Requires confirmation from other technical and fundamental indicators.",
  };
}

export function getVIXMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "VIX (Volatility Index)" : "VIX (Volatility Index)",
    description:
      locale === "it"
        ? "Indice di volatilità implicita del mercato azionario (S&P 500). Misura le aspettative di volatilità a 30 giorni. Range tipico 10-80, con valori alti indicando paura/incertezza."
        : "Stock market (S&P 500) implied volatility index. Measures 30-day volatility expectations. Typical range 10-80, with high values indicating fear/uncertainty.",
    academicReference:
      locale === "it"
        ? 'Whaley (1993) - "Derivatives on Market Volatility: Hedging Tools Long Overdue"'
        : 'Whaley (1993) - "Derivatives on Market Volatility: Hedging Tools Long Overdue"',
    methodology:
      locale === "it"
        ? "Calcolato usando prezzi opzioni S&P 500 (SPX). VIX >30 indica alta volatilità/paura, VIX <20 indica bassa volatilità/complacenza. Aggiornato in tempo reale durante trading hours."
        : "Calculated using S&P 500 (SPX) options prices. VIX >30 indicates high volatility/fear, VIX <20 indicates low volatility/complacency. Updated in real-time during trading hours.",
    limitations:
      locale === "it"
        ? "VIX misura aspettative, non volatilità realizzata. Può rimanere elevato anche dopo correzioni. Non predice direzione del mercato, solo volatilità. Richiede contesto di altri indicatori."
        : "VIX measures expectations, not realized volatility. Can remain elevated even after corrections. Does not predict market direction, only volatility. Requires context from other indicators.",
  };
}

export function getEconomicIndicatorsMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Economic Indicators" : "Economic Indicators",
    description:
      locale === "it"
        ? "Indicatori macroeconomici chiave: GDP (PIL), CPI (inflazione), Unemployment (disoccupazione), Fed Funds Rate (tasso interesse). Dati ufficiali da FRED (Federal Reserve)."
        : "Key macroeconomic indicators: GDP, CPI (inflation), Unemployment, Fed Funds Rate (interest rate). Official data from FRED (Federal Reserve).",
    academicReference:
      locale === "it"
        ? "NBER Business Cycle Dating, BLS Labor Statistics, Federal Reserve Economic Data"
        : "NBER Business Cycle Dating, BLS Labor Statistics, Federal Reserve Economic Data",
    methodology:
      locale === "it"
        ? "GDP: Prodotto Interno Lordo trimestrale (aggiornato trimestralmente). CPI: Consumer Price Index mensile (aggiornato mensilmente). Unemployment: Tasso disoccupazione mensile. Fed Rate: Tasso interesse federale (aggiornato dopo FOMC meetings)."
        : "GDP: Quarterly Gross Domestic Product (updated quarterly). CPI: Monthly Consumer Price Index (updated monthly). Unemployment: Monthly unemployment rate. Fed Rate: Federal interest rate (updated after FOMC meetings).",
    limitations:
      locale === "it"
        ? "Gli indicatori economici sono retroattivi e possono essere rivisti. Lag temporali tra rilascio dati e impatto mercato. Richiede interpretazione contestuale e monitoraggio trend."
        : "Economic indicators are retroactive and may be revised. Time lags between data release and market impact. Requires contextual interpretation and trend monitoring.",
  };
}

export function getBondYieldsMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Bond Yields & Yield Curve" : "Bond Yields & Yield Curve",
    description:
      locale === "it"
        ? "Rendimenti dei Treasury USA (10Y e 2Y) e analisi della yield curve. Lo spread (10Y - 2Y) è un predittore accademico riconosciuto di recessioni."
        : "US Treasury yields (10Y and 2Y) and yield curve analysis. The spread (10Y - 2Y) is an academically recognized recession predictor.",
    academicReference:
      locale === "it"
        ? 'Estrella & Mishkin (1996) - "Predicting U.S. Recessions", Harvey (1988) - "The Real Term Structure"'
        : 'Estrella & Mishkin (1996) - "Predicting U.S. Recessions", Harvey (1988) - "The Real Term Structure"',
    methodology:
      locale === "it"
        ? "Dati da FRED (Federal Reserve). Yield curve normale: 10Y > 2Y (spread positivo). Yield curve invertita: 10Y < 2Y (spread negativo). Curva invertita storicamente precede recessioni di 6-18 mesi."
        : "Data from FRED (Federal Reserve). Normal yield curve: 10Y > 2Y (positive spread). Inverted yield curve: 10Y < 2Y (negative spread). Inverted curve historically precedes recessions by 6-18 months.",
    limitations:
      locale === "it"
        ? "Yield curve invertita è un predittore accademico riconosciuto, ma non predice timing preciso (tipicamente 6-18 mesi prima della recessione). Richiede conferma da altri indicatori economici."
        : "Inverted yield curve is an academically recognized predictor, but does not predict precise timing (typically 6-18 months before recession). Requires confirmation from other economic indicators.",
  };
}

export function getStockIndexesMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Stock Market Indexes" : "Stock Market Indexes",
    description:
      locale === "it"
        ? "Indici principali del mercato azionario USA: S&P 500 (500 large cap), Dow Jones (30 blue chip), NASDAQ (tech-heavy). Dati real-time da Finnhub."
        : "Major US stock market indexes: S&P 500 (500 large cap), Dow Jones (30 blue chip), NASDAQ (tech-heavy). Real-time data from Finnhub.",
    academicReference:
      locale === "it"
        ? "Market Index Theory - Modern Portfolio Theory (Markowitz)"
        : "Market Index Theory - Modern Portfolio Theory (Markowitz)",
    methodology:
      locale === "it"
        ? "S&P 500: Indice market-cap weighted di 500 large cap USA. Dow Jones: Indice price-weighted di 30 blue chip. NASDAQ: Indice tech-heavy. Calcolo variazioni percentuali e volumi."
        : "S&P 500: Market-cap weighted index of 500 US large cap. Dow Jones: Price-weighted index of 30 blue chip. NASDAQ: Tech-heavy index. Calculation of percentage changes and volumes.",
    limitations:
      locale === "it"
        ? "Gli indici riflettono solo una porzione del mercato. S&P 500 è market-cap weighted (bias verso large cap). Dow Jones è price-weighted (bias verso high-price stocks). Richiede contesto settoriale."
        : "Indexes reflect only a portion of the market. S&P 500 is market-cap weighted (bias toward large cap). Dow Jones is price-weighted (bias toward high-price stocks). Requires sector context.",
  };
}

export function getCommoditiesMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Commodities" : "Commodities",
    description:
      locale === "it"
        ? "Prezzi delle principali commodity: Gold (oro), Oil (petrolio WTI), Silver (argento). Dati real-time da Alpha Vantage."
        : "Prices of major commodities: Gold, Oil (WTI), Silver. Real-time data from Alpha Vantage.",
    academicReference:
      locale === "it"
        ? "Commodity Futures Theory - Inflation Hedging (Gorton & Rouwenhorst, 2006)"
        : "Commodity Futures Theory - Inflation Hedging (Gorton & Rouwenhorst, 2006)",
    methodology:
      locale === "it"
        ? "Gold: Prezzo spot oro (USD/oz). Oil: Prezzo WTI crude oil (USD/barrel). Silver: Prezzo spot argento (USD/oz). Calcolo variazioni percentuali e trend. Aggiornato ogni 5 minuti."
        : "Gold: Gold spot price (USD/oz). Oil: WTI crude oil price (USD/barrel). Silver: Silver spot price (USD/oz). Calculation of percentage changes and trends. Updated every 5 minutes.",
    limitations:
      locale === "it"
        ? "Le commodity possono essere influenzate da fattori geopolitici, supply/demand, e inflazione. Volatilità può essere elevata. Richiede monitoraggio continuo e contesto macroeconomico."
        : "Commodities can be influenced by geopolitical factors, supply/demand, and inflation. Volatility can be high. Requires continuous monitoring and macroeconomic context.",
  };
}

export function getForexMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Forex Major Pairs" : "Forex Major Pairs",
    description:
      locale === "it"
        ? "Tassi di cambio delle principali coppie forex: EUR/USD, GBP/USD, USD/JPY, USD/CHF. Dati real-time da Finnhub."
        : "Exchange rates of major forex pairs: EUR/USD, GBP/USD, USD/JPY, USD/CHF. Real-time data from Finnhub.",
    academicReference:
      locale === "it"
        ? "Interest Rate Parity - Foreign Exchange Theory (Dornbusch, 1976)"
        : "Interest Rate Parity - Foreign Exchange Theory (Dornbusch, 1976)",
    methodology:
      locale === "it"
        ? "Calcolo tassi di cambio spot e variazioni percentuali. Analisi correlazioni tra pairs e differenziali di interesse. Identificazione opportunità carry trade. Aggiornato ogni 5 minuti."
        : "Calculation of spot exchange rates and percentage changes. Analysis of correlations between pairs and interest rate differentials. Identification of carry trade opportunities. Updated every 5 minutes.",
    limitations:
      locale === "it"
        ? "Forex può essere influenzato da interventi delle banche centrali e eventi geopolitici. Volatilità elevata durante news events. Richiede monitoraggio continuo e gestione rischio appropriata."
        : "Forex can be influenced by central bank interventions and geopolitical events. High volatility during news events. Requires continuous monitoring and appropriate risk management.",
  };
}

export function getCryptoMarketCapMethodology(locale: string = "en"): MethodologyNote {
  return {
    title: locale === "it" ? "Total Crypto Market Cap" : "Total Crypto Market Cap",
    description:
      locale === "it"
        ? "Market cap totale del mercato crypto, volume 24h, e Bitcoin dominance. Dati da CoinGecko aggregati."
        : "Total crypto market cap, 24h volume, and Bitcoin dominance. Aggregated data from CoinGecko.",
    academicReference:
      locale === "it"
        ? "Market Cap Analysis - Portfolio Theory"
        : "Market Cap Analysis - Portfolio Theory",
    methodology:
      locale === "it"
        ? "Calcolo market cap totale sommando market cap di tutte le crypto su CoinGecko. Volume 24h aggregato. Bitcoin dominance calcolata come (BTC Market Cap / Total Market Cap) × 100."
        : "Total market cap calculated by summing market cap of all cryptocurrencies on CoinGecko. Aggregated 24h volume. Bitcoin dominance calculated as (BTC Market Cap / Total Market Cap) × 100.",
    limitations:
      locale === "it"
        ? "Market cap totale può essere influenzato da nuovi progetti e stablecoin. Volume può includere wash trading. Richiede contesto di altri indicatori per interpretazione completa."
        : "Total market cap can be influenced by new projects and stablecoins. Volume may include wash trading. Requires context from other indicators for complete interpretation.",
  };
}
