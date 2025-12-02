/**
 * Glossary Categories and Tags
 * Sistema di categorizzazione per il glossario Tradelia
 * Basato su analisi del dominio finanziario e best practice
 */

/**
 * Glossary Categories - Academic Standard Classification
 * Basato su JEL Classification (Journal of Economic Literature) e standard accademici
 * Riferimenti: JEL Codes (G00-G32), CFA Institute, Academic Finance Literature
 */
export const GLOSSARY_CATEGORIES = {
  // Core Finance Theory (JEL G00-G02)
  ASSET_PRICING: "Asset Pricing Theory",
  PORTFOLIO: "Portfolio Theory & Management",
  MARKET_EFFICIENCY: "Market Efficiency & Information",

  // Behavioral Finance (JEL G02, G40)
  BEHAVIORAL: "Behavioral Finance",
  SENTIMENT: "Sentiment & Market Psychology",

  // Quantitative & Mathematical Finance (JEL G12-G13)
  QUANTITATIVE: "Quantitative Finance",
  DERIVATIVES: "Derivatives Pricing & Modeling",
  RISK: "Risk Management & Measurement",

  // Market Structure (JEL G10-G14)
  MARKET_MICRO: "Market Microstructure",
  LIQUIDITY: "Liquidity & Market Making",
  TRADING: "Trading & Execution",

  // Corporate Finance (JEL G30-G35)
  CORPORATE: "Corporate Finance",
  VALUATION: "Valuation & Financial Analysis",
  FUNDAMENTAL: "Fundamental Analysis",

  // Macro & Regime (JEL E40-E60, G15)
  MACRO: "Macro Economics & Policy",
  REGIME: "Regime Analysis & Cycles",
  CREDIT: "Credit & Fixed Income",

  // Technical Analysis (Practitioner Domain)
  TECHNICAL: "Technical Analysis",

  // Data & Governance (Regulatory & Operational)
  DATA_QUALITY: "Data Quality & Governance",
  COMPLIANCE: "Compliance & Regulation",

  // Emerging Fields
  ML_AI: "Machine Learning & AI in Finance",
  CRYPTO: "Cryptocurrencies & Digital Assets",
} as const;

export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[keyof typeof GLOSSARY_CATEGORIES];

export const GLOSSARY_TAGS = {
  // Risk & Regime
  RISK_ON: "risk-on",
  RISK_OFF: "risk-off",
  REGIME: "regime",
  VOLATILITY: "volatility",
  HEDGE: "hedge",

  // Market Structure
  BREADTH: "breadth",
  MOMENTUM: "momentum",
  LEADERSHIP: "leadership",
  ROTATION: "rotation",

  // Options
  IV: "implied-volatility",
  GREEKS: "greeks",
  GAMMA: "gamma",
  VEGA: "vega",
  DELTA: "delta",
  THETA: "theta",

  // Credit & Rates
  CREDIT_SPREAD: "credit-spread",
  YIELD_CURVE: "yield-curve",
  FUNDING: "funding",
  LIQUIDITY: "liquidity",

  // Data & Quality
  DATA_QUALITY: "data-quality",
  FRESHNESS: "freshness",
  INTEGRITY: "integrity",
  GOVERNANCE: "governance",

  // Compliance
  MIFID: "mifid",
  BCBS: "bcbs",
  ESMA: "esma",
  COMPLIANCE: "compliance",

  // Analysis Types
  TECHNICAL: "technical-analysis",
  FUNDAMENTAL: "fundamental-analysis",
  QUANTITATIVE: "quantitative",
  BEHAVIORAL: "behavioral",

  // Timeframes
  INTRADAY: "intraday",
  SHORT_TERM: "short-term",
  MEDIUM_TERM: "medium-term",
  LONG_TERM: "long-term",

  // Asset Classes
  EQUITY: "equity",
  FIXED_INCOME: "fixed-income",
  FX: "fx",
  COMMODITIES: "commodities",
  CRYPTO: "crypto",

  // Metrics
  PERFORMANCE: "performance",
  VALUATION: "valuation",
  MARGINS: "margins",
  EARNINGS: "earnings",
  CASHFLOW: "cashflow",

  // Market Participants
  INSTITUTIONAL: "institutional",
  RETAIL: "retail",
  DEALER: "dealer",
  INSIDER: "insider",
  MARKET_MICRO: "market-microstructure",

  // Sentiment
  SENTIMENT: "sentiment",
  FEAR: "fear",
  GREED: "greed",
  POSITIONING: "positioning",
  FLOWS: "flows",
} as const;

export type GlossaryTag = (typeof GLOSSARY_TAGS)[keyof typeof GLOSSARY_TAGS];

/**
 * Mappa categorie -> tag suggeriti (Academic Standard)
 * Basato su JEL Classification e standard accademici
 */
export const CATEGORY_TAG_MAP: Partial<Record<GlossaryCategory, GlossaryTag[]>> = {
  // Asset Pricing Theory (JEL G12)
  [GLOSSARY_CATEGORIES.ASSET_PRICING]: [
    GLOSSARY_TAGS.VALUATION,
    GLOSSARY_TAGS.EQUITY,
    GLOSSARY_TAGS.QUANTITATIVE,
  ],

  // Portfolio Theory (JEL G11)
  [GLOSSARY_CATEGORIES.PORTFOLIO]: [
    GLOSSARY_TAGS.PERFORMANCE,
    GLOSSARY_TAGS.VALUATION,
    GLOSSARY_TAGS.EQUITY,
    GLOSSARY_TAGS.QUANTITATIVE,
  ],

  // Market Efficiency (JEL G14)
  [GLOSSARY_CATEGORIES.MARKET_EFFICIENCY]: [
    GLOSSARY_TAGS.REGIME,
    GLOSSARY_TAGS.MOMENTUM,
    GLOSSARY_TAGS.QUANTITATIVE,
  ],

  // Behavioral Finance (JEL G02, G40)
  [GLOSSARY_CATEGORIES.BEHAVIORAL]: [
    GLOSSARY_TAGS.BEHAVIORAL,
    GLOSSARY_TAGS.SENTIMENT,
    GLOSSARY_TAGS.FEAR,
    GLOSSARY_TAGS.GREED,
  ],

  [GLOSSARY_CATEGORIES.SENTIMENT]: [
    GLOSSARY_TAGS.SENTIMENT,
    GLOSSARY_TAGS.FEAR,
    GLOSSARY_TAGS.GREED,
    GLOSSARY_TAGS.POSITIONING,
    GLOSSARY_TAGS.FLOWS,
  ],

  // Quantitative Finance (JEL G12-G13)
  [GLOSSARY_CATEGORIES.QUANTITATIVE]: [
    GLOSSARY_TAGS.QUANTITATIVE,
    GLOSSARY_TAGS.VOLATILITY,
    GLOSSARY_TAGS.PERFORMANCE,
  ],

  // Derivatives (JEL G13)
  [GLOSSARY_CATEGORIES.DERIVATIVES]: [
    GLOSSARY_TAGS.IV,
    GLOSSARY_TAGS.GREEKS,
    GLOSSARY_TAGS.GAMMA,
    GLOSSARY_TAGS.VEGA,
    GLOSSARY_TAGS.DELTA,
    GLOSSARY_TAGS.THETA,
  ],

  // Risk Management (JEL G32)
  [GLOSSARY_CATEGORIES.RISK]: [
    GLOSSARY_TAGS.RISK_ON,
    GLOSSARY_TAGS.RISK_OFF,
    GLOSSARY_TAGS.VOLATILITY,
    GLOSSARY_TAGS.HEDGE,
    GLOSSARY_TAGS.QUANTITATIVE,
  ],

  // Market Microstructure (JEL G10)
  [GLOSSARY_CATEGORIES.MARKET_MICRO]: [
    GLOSSARY_TAGS.DEALER,
    GLOSSARY_TAGS.FLOWS,
    GLOSSARY_TAGS.LIQUIDITY,
    GLOSSARY_TAGS.INTRADAY,
  ],

  [GLOSSARY_CATEGORIES.LIQUIDITY]: [
    GLOSSARY_TAGS.LIQUIDITY,
    GLOSSARY_TAGS.FUNDING,
    GLOSSARY_TAGS.MARKET_MICRO,
  ],

  [GLOSSARY_CATEGORIES.TRADING]: [
    GLOSSARY_TAGS.INTRADAY,
    GLOSSARY_TAGS.LIQUIDITY,
    GLOSSARY_TAGS.FLOWS,
  ],

  // Corporate Finance (JEL G30-G35)
  [GLOSSARY_CATEGORIES.CORPORATE]: [
    GLOSSARY_TAGS.VALUATION,
    GLOSSARY_TAGS.EARNINGS,
    GLOSSARY_TAGS.CASHFLOW,
    GLOSSARY_TAGS.MARGINS,
  ],

  [GLOSSARY_CATEGORIES.VALUATION]: [
    GLOSSARY_TAGS.VALUATION,
    GLOSSARY_TAGS.EARNINGS,
    GLOSSARY_TAGS.MARGINS,
    GLOSSARY_TAGS.CASHFLOW,
  ],

  [GLOSSARY_CATEGORIES.FUNDAMENTAL]: [
    GLOSSARY_TAGS.VALUATION,
    GLOSSARY_TAGS.EARNINGS,
    GLOSSARY_TAGS.MARGINS,
    GLOSSARY_TAGS.CASHFLOW,
    GLOSSARY_TAGS.FUNDAMENTAL,
  ],

  // Macro Economics (JEL E40-E60)
  [GLOSSARY_CATEGORIES.MACRO]: [
    GLOSSARY_TAGS.REGIME,
    GLOSSARY_TAGS.YIELD_CURVE,
    GLOSSARY_TAGS.FX,
    GLOSSARY_TAGS.COMMODITIES,
  ],

  [GLOSSARY_CATEGORIES.REGIME]: [
    GLOSSARY_TAGS.RISK_ON,
    GLOSSARY_TAGS.RISK_OFF,
    GLOSSARY_TAGS.REGIME,
    GLOSSARY_TAGS.VOLATILITY,
  ],

  [GLOSSARY_CATEGORIES.CREDIT]: [
    GLOSSARY_TAGS.CREDIT_SPREAD,
    GLOSSARY_TAGS.FIXED_INCOME,
    GLOSSARY_TAGS.YIELD_CURVE,
  ],

  // Technical Analysis (Practitioner Domain)
  [GLOSSARY_CATEGORIES.TECHNICAL]: [
    GLOSSARY_TAGS.BREADTH,
    GLOSSARY_TAGS.MOMENTUM,
    GLOSSARY_TAGS.LEADERSHIP,
    GLOSSARY_TAGS.ROTATION,
    GLOSSARY_TAGS.TECHNICAL,
  ],

  // Data & Governance
  [GLOSSARY_CATEGORIES.DATA_QUALITY]: [
    GLOSSARY_TAGS.DATA_QUALITY,
    GLOSSARY_TAGS.FRESHNESS,
    GLOSSARY_TAGS.INTEGRITY,
    GLOSSARY_TAGS.GOVERNANCE,
  ],

  [GLOSSARY_CATEGORIES.COMPLIANCE]: [
    GLOSSARY_TAGS.MIFID,
    GLOSSARY_TAGS.BCBS,
    GLOSSARY_TAGS.ESMA,
    GLOSSARY_TAGS.COMPLIANCE,
  ],

  // Emerging Fields
  [GLOSSARY_CATEGORIES.ML_AI]: [GLOSSARY_TAGS.QUANTITATIVE, GLOSSARY_TAGS.PERFORMANCE],

  [GLOSSARY_CATEGORIES.CRYPTO]: [GLOSSARY_TAGS.CRYPTO, GLOSSARY_TAGS.VOLATILITY],
};

/**
 * Ottieni tag suggeriti per una categoria
 */
export function getSuggestedTags(category: GlossaryCategory): GlossaryTag[] {
  return CATEGORY_TAG_MAP[category] || [];
}

/**
 * Valida se un tag è valido
 */
export function isValidTag(tag: string): tag is GlossaryTag {
  return Object.values(GLOSSARY_TAGS).includes(tag as GlossaryTag);
}

/**
 * Valida se una categoria è valida
 */
export function isValidCategory(category: string): category is GlossaryCategory {
  return Object.values(GLOSSARY_CATEGORIES).includes(category as GlossaryCategory);
}

/**
 * Ottieni tutte le categorie disponibili
 */
export function getGlossaryCategories(): GlossaryCategory[] {
  return Object.values(GLOSSARY_CATEGORIES);
}

/**
 * Ottieni tutti i tag disponibili
 */
export function getGlossaryTags(): GlossaryTag[] {
  return Object.values(GLOSSARY_TAGS);
}
