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
 * Tipo di fonte accademica
 */
export type AcademicSourceType =
  | "peer-reviewed"
  | "textbook"
  | "primary-source"
  | "secondary-source"
  | "working-paper"
  | "book-chapter";

/**
 * Fonte accademica strutturata (formato migliorato)
 */
export interface AcademicSource {
  author: string; // Autore/i
  year: number; // Anno pubblicazione
  title: string; // Titolo (sentence case per articoli)
  journal?: string; // Rivista (se articolo)
  publisher?: string; // Editore (se libro)
  volume?: number; // Volume rivista
  issue?: number; // Numero rivista
  pages?: string; // Pagine (es. "77-91")
  doi?: string; // Digital Object Identifier
  isbn?: string; // ISBN per libri
  url?: string; // URL se risorsa online
  accessedDate?: string; // Data accesso (ISO) se risorsa online
  type: AcademicSourceType; // Tipo di fonte
  primary?: boolean; // Se è fonte primaria
  jel?: string; // JEL Classification (opzionale)
}

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
 * Type export per categoria Tradelia
 */
export type TradeliaGlossaryCategory = keyof typeof TRADELIA_GLOSSARY_CATEGORIES;

/**
 * Type export per categoria data
 */
export type TradeliaGlossaryCategoryData =
  (typeof TRADELIA_GLOSSARY_CATEGORIES)[TradeliaGlossaryCategory];

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
 * Type export per tag Tradelia
 */
export type TradeliaGlossaryTag =
  (typeof TRADELIA_GLOSSARY_TAGS)[keyof typeof TRADELIA_GLOSSARY_TAGS][keyof (typeof TRADELIA_GLOSSARY_TAGS)[keyof typeof TRADELIA_GLOSSARY_TAGS]];

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
    source: string; // Fonti accademiche verificate (separate da |) - formato legacy
    sources?: AcademicSource[]; // Fonti strutturate (formato migliorato, opzionale per backward compatibility)
    academicContext?: string; // Contesto accademico aggiuntivo
  };

  tradeliaExplanation: {
    whatDoes: string; // Cosa fa - spiegazione semplice ma esaustiva
    howToUse: string; // Come si usa - applicazione pratica universale
    practicalExample?: string; // Esempio pratico concreto (opzionale)
    commonMistakes?: string; // Errori comuni da evitare (opzionale)
  };

  // Organizzazione Tradelia
  category: TradeliaGlossaryCategory;
  subcategory?: string; // Sottocategoria se applicabile
  tags: TradeliaGlossaryTag[]; // Tag multipli per ricerca e filtraggio

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
export const CATEGORY_MIGRATION_MAP: Record<string, TradeliaGlossaryCategory> = {
  "Technical Analysis": "MARKET_ANALYSIS",
  Portfolio: "PORTFOLIO_CONSTRUCTION",
  Risk: "RISK_MANAGEMENT",
  Trading: "TRADING_EXECUTION",
  Behavioral: "BEHAVIORAL_FINANCE",
  Derivatives: "DERIVATIVES_OPTIONS",
  Macro: "MACROECONOMICS",
  Regime: "MARKET_REGIMES",
  Valuation: "VALUATION_PRICING",
  "Market Micro": "MARKET_MICROSTRUCTURE",
  Liquidity: "MARKET_MICROSTRUCTURE",
  Compliance: "COMPLIANCE_REGULATION",
  Fundamental: "MARKET_ANALYSIS",
  Sentiment: "MARKET_ANALYSIS",
  Quantitative: "MARKET_ANALYSIS",
  Credit: "VALUATION_PRICING",
  Corporate: "VALUATION_PRICING",
  "Data Quality": "COMPLIANCE_REGULATION",
  "ML/AI": "MARKET_ANALYSIS",
  Crypto: "MARKET_ANALYSIS",
} as const;

/**
 * Helper per ottenere categoria Tradelia da categoria vecchia
 * @param oldCategory - Categoria del vecchio sistema
 * @returns Categoria Tradelia corrispondente, default "foundations"
 */
export function getTradeliaCategory(oldCategory: string): TradeliaGlossaryCategory {
  const mappedCategory = CATEGORY_MIGRATION_MAP[oldCategory];
  return mappedCategory || "FOUNDATIONS";
}

/**
 * Helper per determinare learning level da categoria e complessità
 * @param category - Categoria Tradelia
 * @param complexity - Livello di complessità opzionale
 * @returns Learning level determinato
 */
export function determineLearningLevel(
  category: TradeliaGlossaryCategory,
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
 * @param category - Categoria Tradelia
 * @param applicationContext - Contesto applicativo opzionale
 * @returns Array di user types appropriati
 */
export function determineUserTypes(
  category: TradeliaGlossaryCategory,
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
 * @param title - Titolo del termine
 * @returns Slug URL-friendly
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Rimuove accenti
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ottiene tutte le categorie Tradelia ordinate
 * @returns Array di categorie ordinate per `order`
 */
export function getTradeliaCategories(): TradeliaGlossaryCategoryData[] {
  return Object.values(TRADELIA_GLOSSARY_CATEGORIES).sort((a, b) => a.order - b.order);
}

/**
 * Ottiene una categoria Tradelia per chiave
 * @param categoryKey - Chiave della categoria
 * @returns Dati della categoria o undefined
 */
export function getTradeliaCategoryData(
  categoryKey: TradeliaGlossaryCategory
): TradeliaGlossaryCategoryData | undefined {
  return TRADELIA_GLOSSARY_CATEGORIES[categoryKey];
}

/**
 * Verifica se una categoria esiste
 * @param categoryKey - Chiave della categoria da verificare
 * @returns true se la categoria esiste
 */
export function isValidTradeliaCategory(
  categoryKey: string
): categoryKey is TradeliaGlossaryCategory {
  return categoryKey in TRADELIA_GLOSSARY_CATEGORIES;
}

/**
 * Template per nuovo termine Tradelia
 * @param title - Titolo del termine
 * @param category - Categoria Tradelia
 * @param academicDefinition - Definizione accademica
 * @param tradeliaExplanation - Spiegazione Tradelia AI
 * @returns Termine glossario Tradelia completo
 */
export function createTradeliaGlossaryTerm(
  title: string,
  category: TradeliaGlossaryCategory,
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
