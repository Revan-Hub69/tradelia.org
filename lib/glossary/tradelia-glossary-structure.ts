/**
 * Tradelia Glossary Structure
 *
 * Nuova architettura del glossario basata su:
 * - Identità Tradelia come educatore finanziario professionale
 * - Logiche educative progressive
 * - Organizzazione per applicazione pratica
 * - Categorie orientate all'utente, non solo tecniche
 *
 * Best Practice: Educational Progression, User-Centric Organization, Practical Application
 */

export type GlossaryLearningLevel = "foundational" | "intermediate" | "advanced" | "expert";

export type GlossaryApplicationContext =
  | "trading"
  | "investing"
  | "risk-management"
  | "portfolio-construction"
  | "market-analysis"
  | "regulatory-compliance";

export type GlossaryUserType = "beginner" | "intermediate-trader" | "professional" | "academic";

/**
 * Nuova struttura categoria Tradelia
 * Organizzate per percorso educativo e applicazione pratica
 */
export const TRADELIA_GLOSSARY_CATEGORIES = {
  // FONDAMENTA - Concetti base che tutti devono conoscere
  FOUNDATIONS: {
    key: "foundations",
    displayName: "Fondamenta",
    description: "Concetti base essenziali per comprendere i mercati finanziari",
    learningLevel: "foundational" as GlossaryLearningLevel,
    userTypes: ["beginner", "intermediate-trader", "professional"] as GlossaryUserType[],
    icon: "BookOpen",
    color: "blue",
    order: 1,
  },

  // ANALISI DI MERCATO - Come leggere e interpretare i mercati
  MARKET_ANALYSIS: {
    key: "market-analysis",
    displayName: "Analisi di Mercato",
    description: "Strumenti e metodologie per analizzare i mercati finanziari",
    learningLevel: "intermediate" as GlossaryLearningLevel,
    userTypes: ["intermediate-trader", "professional"] as GlossaryUserType[],
    icon: "TrendingUp",
    color: "green",
    order: 2,
    subcategories: ["technical", "fundamental", "sentiment", "quantitative"],
  },

  // GESTIONE DEL RISCHIO - Protezione e controllo del rischio
  RISK_MANAGEMENT: {
    key: "risk-management",
    displayName: "Gestione del Rischio",
    description: "Strategie e strumenti per identificare, misurare e controllare il rischio",
    learningLevel: "intermediate" as GlossaryLearningLevel,
    userTypes: ["intermediate-trader", "professional"] as GlossaryUserType[],
    icon: "Shield",
    color: "red",
    order: 3,
    subcategories: ["position-sizing", "stop-loss", "diversification", "hedging"],
  },

  // COSTRUZIONE PORTAFOGLIO - Come costruire e gestire portafogli
  PORTFOLIO_CONSTRUCTION: {
    key: "portfolio-construction",
    displayName: "Costruzione Portafoglio",
    description: "Principi e strategie per costruire e ottimizzare portafogli di investimento",
    learningLevel: "intermediate" as GlossaryLearningLevel,
    userTypes: ["intermediate-trader", "professional"] as GlossaryUserType[],
    icon: "Layers",
    color: "purple",
    order: 4,
    subcategories: ["asset-allocation", "rebalancing", "optimization", "performance"],
  },

  // TRADING ED ESECUZIONE - Strategie operative e esecuzione
  TRADING_EXECUTION: {
    key: "trading-execution",
    displayName: "Trading ed Esecuzione",
    description: "Strategie operative, esecuzione ordini e gestione delle posizioni",
    learningLevel: "advanced" as GlossaryLearningLevel,
    userTypes: ["intermediate-trader", "professional"] as GlossaryUserType[],
    icon: "Activity",
    color: "orange",
    order: 5,
    subcategories: ["entry-strategies", "exit-strategies", "order-types", "execution-quality"],
  },

  // FINANZA COMPORTAMENTALE - Psicologia e bias cognitivi
  BEHAVIORAL_FINANCE: {
    key: "behavioral-finance",
    displayName: "Finanza Comportamentale",
    description: "Psicologia del trading, bias cognitivi e decisioni finanziarie",
    learningLevel: "intermediate" as GlossaryLearningLevel,
    userTypes: ["beginner", "intermediate-trader", "professional"] as GlossaryUserType[],
    icon: "Brain",
    color: "indigo",
    order: 6,
    subcategories: ["cognitive-biases", "emotions", "decision-making", "heuristics"],
  },

  // DERIVATI E OPZIONI - Strumenti derivati complessi
  DERIVATIVES_OPTIONS: {
    key: "derivatives-options",
    displayName: "Derivati e Opzioni",
    description: "Strumenti derivati, opzioni e strategie avanzate",
    learningLevel: "advanced" as GlossaryLearningLevel,
    userTypes: ["professional"] as GlossaryUserType[],
    icon: "Zap",
    color: "yellow",
    order: 7,
    subcategories: ["options-strategies", "futures", "swaps", "structured-products"],
  },

  // MACROECONOMIA - Contesto macroeconomico e cicli
  MACROECONOMICS: {
    key: "macroeconomics",
    displayName: "Macroeconomia",
    description: "Indicatori macroeconomici, cicli economici e politica monetaria",
    learningLevel: "intermediate" as GlossaryLearningLevel,
    userTypes: ["intermediate-trader", "professional", "academic"] as GlossaryUserType[],
    icon: "Globe",
    color: "cyan",
    order: 8,
    subcategories: ["indicators", "monetary-policy", "economic-cycles", "geopolitics"],
  },

  // REGIMI DI MERCATO - Contesti di mercato e regimi
  MARKET_REGIMES: {
    key: "market-regimes",
    displayName: "Regimi di Mercato",
    description: "Identificazione e adattamento a diversi regimi di mercato",
    learningLevel: "advanced" as GlossaryLearningLevel,
    userTypes: ["intermediate-trader", "professional"] as GlossaryUserType[],
    icon: "BarChart",
    color: "teal",
    order: 9,
    subcategories: ["momentum", "mean-reversion", "volatility-regimes", "trend-identification"],
  },

  // VALUTAZIONE E PRICING - Come valutare asset e determinare prezzi
  VALUATION_PRICING: {
    key: "valuation-pricing",
    displayName: "Valutazione e Pricing",
    description: "Metodologie per valutare asset e determinare prezzi equi",
    learningLevel: "advanced" as GlossaryLearningLevel,
    userTypes: ["professional", "academic"] as GlossaryUserType[],
    icon: "Calculator",
    color: "pink",
    order: 10,
    subcategories: [
      "discounted-cash-flow",
      "relative-valuation",
      "asset-pricing-models",
      "fair-value",
    ],
  },

  // LIQUIDITÀ E STRUTTURA DI MERCATO - Microstruttura dei mercati
  MARKET_MICROSTRUCTURE: {
    key: "market-microstructure",
    displayName: "Liquidità e Struttura di Mercato",
    description: "Microstruttura dei mercati, liquidità e meccanismi di trading",
    learningLevel: "expert" as GlossaryLearningLevel,
    userTypes: ["professional", "academic"] as GlossaryUserType[],
    icon: "Network",
    color: "slate",
    order: 11,
    subcategories: ["liquidity", "market-making", "order-flow", "market-impact"],
  },

  // COMPLIANCE E REGOLAMENTAZIONE - Aspetti normativi
  COMPLIANCE_REGULATION: {
    key: "compliance-regulation",
    displayName: "Compliance e Regolamentazione",
    description: "Normative, compliance e aspetti regolamentari del trading e investimenti",
    learningLevel: "intermediate" as GlossaryLearningLevel,
    userTypes: ["professional"] as GlossaryUserType[],
    icon: "FileCheck",
    color: "amber",
    order: 12,
    subcategories: ["mifid", "best-execution", "reporting", "tax"],
  },
} as const;

/**
 * Tag Tradelia - Organizzati per contesto di applicazione
 */
export const TRADELIA_GLOSSARY_TAGS = {
  // Contesto di applicazione
  APPLICATION: {
    DAILY_TRADING: "daily-trading",
    SWING_TRADING: "swing-trading",
    POSITION_TRADING: "position-trading",
    INVESTING: "investing",
    HEDGING: "hedging",
    ARBITRAGE: "arbitrage",
  },

  // Tipo di asset
  ASSET_TYPE: {
    EQUITIES: "equities",
    BONDS: "bonds",
    COMMODITIES: "commodities",
    FOREX: "forex",
    CRYPTO: "crypto",
    DERIVATIVES: "derivatives",
  },

  // Caratteristiche operative
  OPERATIONAL: {
    HIGH_FREQUENCY: "high-frequency",
    ALGORITHMIC: "algorithmic",
    DISCRETIONARY: "discretionary",
    SYSTEMATIC: "systematic",
    QUANTITATIVE: "quantitative",
  },

  // Livello di complessità
  COMPLEXITY: {
    SIMPLE: "simple",
    MODERATE: "moderate",
    COMPLEX: "complex",
    EXPERT: "expert",
  },
} as const;

/**
 * Nuova interfaccia termine glossario Tradelia
 */
export interface TradeliaGlossaryTerm {
  // Identificazione
  id: string; // ID univoco
  title: string; // Nome del termine
  slug: string; // URL-friendly slug

  // Contenuto educativo
  academicDefinition: {
    what: string; // Definizione accademica precisa ed esaustiva
    source: string; // Fonti accademiche verificate (separate da |)
    academicContext?: string; // Contesto accademico aggiuntivo
  };

  tradeliaExplanation: {
    whatDoes: string; // Cosa fa - spiegazione semplice ma esaustiva
    howToUse: string; // Come si usa - applicazione pratica universale
    practicalExample?: string; // Esempio pratico concreto (opzionale)
    commonMistakes?: string; // Errori comuni da evitare (opzionale)
  };

  // Organizzazione Tradelia
  category: keyof typeof TRADELIA_GLOSSARY_CATEGORIES;
  subcategory?: string; // Sottocategoria se applicabile
  tags: string[]; // Tag multipli per ricerca e filtraggio

  // Metadati educativi
  learningLevel: GlossaryLearningLevel;
  prerequisites?: string[]; // ID di termini che devono essere compresi prima
  relatedTerms?: string[]; // ID di termini correlati
  seeAlso?: string[]; // ID di termini da vedere anche

  // Applicazione pratica
  applicationContexts: GlossaryApplicationContext[]; // Contesti in cui si applica
  userTypes: GlossaryUserType[]; // Tipi di utente a cui è rivolto

  // Metadati
  lastReviewed?: string; // Data ultima revisione (ISO)
  reviewedBy?: string; // Chi ha revisionato
  version: number; // Versione del termine
}

/**
 * Mappa categorie vecchie → nuove Tradelia
 */
export const CATEGORY_MIGRATION_MAP: Record<string, keyof typeof TRADELIA_GLOSSARY_CATEGORIES> = {
  "Technical Analysis": "market-analysis",
  Portfolio: "portfolio-construction",
  Risk: "risk-management",
  Trading: "trading-execution",
  Behavioral: "behavioral-finance",
  Derivatives: "derivatives-options",
  Macro: "macroeconomics",
  Regime: "market-regimes",
  Valuation: "valuation-pricing",
  "Market Micro": "market-microstructure",
  Liquidity: "market-microstructure",
  Compliance: "compliance-regulation",
  Fundamental: "market-analysis",
  Sentiment: "market-analysis",
  Quantitative: "market-analysis",
  Credit: "valuation-pricing",
  Corporate: "valuation-pricing",
  "Data Quality": "compliance-regulation",
  "ML/AI": "market-analysis",
  Crypto: "market-analysis",
};

/**
 * Helper per ottenere categoria Tradelia da categoria vecchia
 */
export function getTradeliaCategory(
  oldCategory: string
): keyof typeof TRADELIA_GLOSSARY_CATEGORIES {
  return CATEGORY_MIGRATION_MAP[oldCategory] || "foundations";
}

/**
 * Helper per determinare learning level da categoria e complessità
 */
export function determineLearningLevel(
  category: keyof typeof TRADELIA_GLOSSARY_CATEGORIES,
  complexity?: string
): GlossaryLearningLevel {
  const categoryData = TRADELIA_GLOSSARY_CATEGORIES[category];
  if (categoryData.learningLevel) {
    return categoryData.learningLevel;
  }

  // Fallback basato su complessità
  if (complexity === "expert" || complexity === "complex") {
    return "expert";
  }
  if (complexity === "moderate") {
    return "intermediate";
  }
  return "foundational";
}

/**
 * Helper per determinare user types da categoria e contesto
 */
export function determineUserTypes(
  category: keyof typeof TRADELIA_GLOSSARY_CATEGORIES,
  applicationContext?: GlossaryApplicationContext
): GlossaryUserType[] {
  const categoryData = TRADELIA_GLOSSARY_CATEGORIES[category];
  const userTypes = [...categoryData.userTypes];

  // Aggiungi user types basati su contesto applicativo
  if (applicationContext === "trading") {
    if (!userTypes.includes("intermediate-trader")) {
      userTypes.push("intermediate-trader");
    }
  }
  if (applicationContext === "investing") {
    if (!userTypes.includes("beginner")) {
      userTypes.push("beginner");
    }
  }

  return userTypes;
}

/**
 * Helper per generare slug da titolo
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Template per nuovo termine Tradelia
 */
export function createTradeliaGlossaryTerm(
  title: string,
  category: keyof typeof TRADELIA_GLOSSARY_CATEGORIES,
  academicDefinition: { what: string; source: string },
  tradeliaExplanation: { whatDoes: string; howToUse: string }
): TradeliaGlossaryTerm {
  const categoryData = TRADELIA_GLOSSARY_CATEGORIES[category];

  return {
    id: generateSlug(title),
    title,
    slug: generateSlug(title),
    academicDefinition,
    tradeliaExplanation,
    category,
    tags: [],
    learningLevel: categoryData.learningLevel,
    applicationContexts: [],
    userTypes: categoryData.userTypes,
    version: 1,
  };
}
