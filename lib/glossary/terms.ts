/**
 * Glossary Terms Data
 * Termini del glossario con spiegazioni accademiche, Tradelia AI e fonti
 *
 * Architettura: JSON Statico (Best Practice)
 * - Performance ottimale (zero latency, bundle optimization)
 * - Costi zero
 * - Versioning con Git
 * - SEO-friendly (SSR/SSG)
 *
 * Alternativa futura: Hybrid (JSON base + Supabase override)
 * - JSON come base sempre disponibile
 * - Supabase per override/custom solo se necessario
 */

import type { GlossaryCategory, GlossaryTag } from "./categories";

export interface GlossaryTerm {
  title: string;
  what: string; // Definizione accademica precisa
  source: string; // Fonti accademiche
  // Spiegazione Tradelia AI suddivisa in due sezioni
  whatDoes?: string; // Cosa fa - spiegazione semplice ma esaustiva
  howToUse?: string; // Come si usa - spiegazione semplice ma esaustiva
  // Legacy support (deprecated, use whatDoes + howToUse)
  how?: string; // Deprecated: use whatDoes + howToUse
  technical?: string; // Deprecated: use whatDoes + howToUse
  relatedTerms?: string[]; // Termini correlati (chiavi nel glossario, opzionale)
  category?: GlossaryCategory; // Categoria principale
  tags?: GlossaryTag[]; // Tag multipli per ricerca e filtraggio
}

// Cache in-memory per performance
let glossaryData: Record<string, GlossaryTerm> = {};

/**
 * Carica termini del glossario
 * Strategia: Import statico (Next.js) > Fetch (fallback) > Fallback hardcoded
 */
export async function loadGlossaryTerms(): Promise<Record<string, GlossaryTerm>> {
  // Return cached data if available
  if (Object.keys(glossaryData).length > 0) {
    return glossaryData;
  }

  // Try static import first (best for Next.js bundle optimization)
  if (typeof window === "undefined") {
    // Server-side: use dynamic import
    try {
      const data = await import("./tradelia-glossary-300.json");
      glossaryData = parseGlossaryData(data.default || data);
      return glossaryData;
    } catch {
      // Fallback to public folder
      try {
        const data = await import("../../public/glossario.json");
        glossaryData = parseGlossaryData(data.default || data);
        return glossaryData;
      } catch {
        // Continue to fetch fallback
      }
    }
  }

  // Client-side: try fetch from public folder (accessible via URL)
  try {
    // Priority: tradelia-glossary-300.json (if moved to public) > glossario.json
    let response = await fetch("/tradelia-glossary-300.json");
    if (!response.ok) {
      response = await fetch("/glossario.json");
    }

    if (response.ok) {
      const data = await response.json();
      glossaryData = parseGlossaryData(data);
      return glossaryData;
    }
  } catch (error) {
    console.error("Error loading glossary terms:", error);
  }

  // Fallback: termini comuni (sempre disponibili)
  const fallbackTerms = {
    HeroDisclaimer: {
      title: "Disclaimer",
      what: "Materiale informativo/educativo non personalizzato.",
      how: "Non costituisce consulenza o raccomandazione; non considera obiettivi, conoscenze ed esperienza del lettore.",
      source: "MiFID II/ESMA – Guidelines on marketing communications & investor protection.",
    },
    Framework: {
      title: "Framework",
      what: "Struttura concettuale o metodologia utilizzata per organizzare e guidare lo sviluppo di processi, analisi o sistemi.",
      how: "In Tradelia, utilizziamo framework AI verificabili per analisi finanziarie. Ogni framework è documentato, replicabile e basato su evidenze accademiche.",
      source: "Best practice di governance dei dati (BCBS 239; ESMA Supervisory Briefings).",
    },
    Portfolio: {
      title: "Portfolio",
      what: "Insieme di investimenti detenuti da un individuo o istituzione, comprendente azioni, obbligazioni, derivati e altri strumenti finanziari.",
      how: "Il Portfolio Manager di Tradelia ti permette di tracciare le tue posizioni, monitorare performance e calcolare metriche come ROI e volatilità.",
      source: "Markowitz, H. (1952). Portfolio Selection. Journal of Finance, 7(1), 77-91.",
    },
    Watchlist: {
      title: "Watchlist",
      what: "Lista di asset finanziari monitorati per opportunità di investimento o analisi.",
      how: "La Watchlist di Tradelia ti permette di monitorare asset con alert personalizzati, ricevendo notifiche quando raggiungono target di prezzo o volume.",
      source: "Best practice di portfolio management e risk monitoring.",
    },
    ROI: {
      title: "ROI",
      what: "Return on Investment - Metrica che misura la redditività di un investimento, calcolata come (Guadagno - Costo) / Costo × 100.",
      how: "Il ROI è utilizzato nei nostri calcolatori finanziari per valutare la performance degli investimenti. Un ROI positivo indica un guadagno, negativo una perdita.",
      source:
        "Brealey, R.A., Myers, S.C., & Allen, F. (2020). Principles of Corporate Finance. McGraw-Hill Education.",
    },
    Volatilità: {
      title: "Volatilità",
      what: "Misura statistica della variazione dei rendimenti di un asset nel tempo. Una maggiore volatilità indica maggiore incertezza e rischio.",
      how: "La volatilità è un indicatore chiave nel nostro sistema di analisi del rischio. Monitoriamo la volatilità storica e implicita per valutare il rischio degli investimenti.",
      source: "Hull, J.C. (2018). Options, Futures and Other Derivatives. Pearson Education.",
    },
    Alert: {
      title: "Alert",
      what: "Notifica automatica che si attiva quando un asset raggiunge condizioni predefinite (prezzo, volume, ecc.).",
      how: "Il sistema di Alert di Tradelia ti permette di monitorare asset e ricevere notifiche quando raggiungono target di prezzo o volume, senza dover controllare manualmente.",
      source: "Best practice di portfolio management e risk monitoring.",
    },
    Volume: {
      title: "Volume",
      what: "Quantità di asset scambiati in un determinato periodo di tempo. Un volume elevato indica maggiore liquidità e interesse.",
      how: "Il volume è un indicatore chiave per valutare la liquidità e l'interesse del mercato. Monitoriamo il volume per identificare trend e opportunità.",
      source:
        "Karpoff, J.M. (1987). The Relation Between Price Changes and Trading Volume: A Survey. Journal of Financial and Quantitative Analysis, 22(1), 109-126.",
    },
    "P&L": {
      title: "Profit & Loss (P&L)",
      what: "Differenza tra il valore di uscita e il valore di entrata di un investimento. Un P&L positivo indica un guadagno, negativo una perdita.",
      how: "Il P&L è calcolato automaticamente nel Trading Journal di Tradelia per ogni operazione, permettendoti di tracciare la performance delle tue strategie.",
      source:
        "Brealey, R.A., Myers, S.C., & Allen, F. (2020). Principles of Corporate Finance. McGraw-Hill Education.",
    },
    Equity: {
      title: "Equity",
      what: "Valore totale del portafoglio in un determinato momento, calcolato come somma di tutti gli investimenti.",
      how: "L'equity curve nel Trading Journal mostra l'evoluzione del valore del tuo portafoglio nel tempo, aiutandoti a valutare la performance complessiva.",
      source: "Markowitz, H. (1952). Portfolio Selection. Journal of Finance, 7(1), 77-91.",
    },
    Drawdown: {
      title: "Drawdown",
      what: "Riduzione del valore del portafoglio rispetto al picco precedente. Un drawdown elevato indica maggiore rischio.",
      how: "Il drawdown è monitorato nel Trading Journal per valutare il rischio delle strategie. Un drawdown contenuto indica una strategia più stabile.",
      source:
        "Chekhlov, A., Uryasev, S., & Zabarankin, M. (2005). Drawdown Measure in Portfolio Optimization. International Journal of Theoretical and Applied Finance, 8(1), 13-58.",
    },
  };

  glossaryData = fallbackTerms;
  return fallbackTerms;
}

/**
 * Parse glossary data from JSON format
 */
function parseGlossaryData(data: any): Record<string, GlossaryTerm> {
  const terms: Record<string, GlossaryTerm> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "_v" || key === "_note") {
      continue;
    } // Skip metadata
    const term = value as any;
    if (term.title && term.what && term.how && term.source) {
      terms[key] = {
        title: term.title,
        what: term.what,
        how: term.how,
        source: term.source,
        technical: term.technical,
        relatedTerms: term.relatedTerms,
        category: term.category,
        tags: term.tags,
      };
    }
  }
  return terms;
}

// Funzione per ottenere un termine specifico
export async function getGlossaryTerm(termKey: string): Promise<GlossaryTerm | null> {
  const terms = await loadGlossaryTerms();
  return terms[termKey] || null;
}

// Funzione per cercare termini
export async function searchGlossaryTerms(query: string): Promise<GlossaryTerm[]> {
  const terms = await loadGlossaryTerms();
  const lowerQuery = query.toLowerCase();
  return Object.values(terms).filter(
    (term) =>
      term.title.toLowerCase().includes(lowerQuery) ||
      term.what.toLowerCase().includes(lowerQuery) ||
      (term.how && term.how.toLowerCase().includes(lowerQuery)) ||
      (term.whatDoes && term.whatDoes.toLowerCase().includes(lowerQuery)) ||
      (term.howToUse && term.howToUse.toLowerCase().includes(lowerQuery)) ||
      (term.technical && term.technical.toLowerCase().includes(lowerQuery))
  );
}
