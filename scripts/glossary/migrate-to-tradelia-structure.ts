/**
 * Script di Migrazione Glossario alla Nuova Struttura Tradelia
 *
 * Converte i termini del glossario dalla struttura vecchia alla nuova struttura Tradelia:
 * - Mappa categorie vecchie → nuove categorie Tradelia
 * - Converte struttura: what/technical/how → academicDefinition/tradeliaExplanation
 * - Aggiunge metadati educativi (learningLevel, userTypes, applicationContexts)
 * - Genera nuovo file JSON con struttura completa
 *
 * Usage: tsx scripts/glossary/migrate-to-tradelia-structure.ts
 * @ts-nocheck
 */
/* eslint-disable no-console */

import * as fs from "fs";
import * as path from "path";
import {
  TRADELIA_GLOSSARY_CATEGORIES,
  TRADELIA_GLOSSARY_TAGS,
  getTradeliaCategory,
  determineLearningLevel,
  determineUserTypes,
  generateSlug,
  isValidTradeliaCategory,
} from "../../lib/glossary/tradelia-glossary-structure";

import type {
  TradeliaGlossaryTerm,
  TradeliaGlossaryCategory,
  GlossaryApplicationContext,
} from "../../lib/glossary/tradelia-glossary-structure";

interface OldGlossaryTerm {
  title: string;
  what: string;
  technical?: string;
  how?: string;
  source: string;
  category?: string;
  tags?: string[];
  relatedTerms?: string[];
}

/**
 * Mappa tag vecchi → tag Tradelia
 */
function mapOldTagToTradeliaTag(oldTag: string): string | null {
  const tagMap: Record<string, string> = {
    "technical-analysis": TRADELIA_GLOSSARY_TAGS.OPERATIONAL.SYSTEMATIC,
    "fundamental-analysis": TRADELIA_GLOSSARY_TAGS.APPLICATION.INVESTING,
    quantitative: TRADELIA_GLOSSARY_TAGS.OPERATIONAL.QUANTITATIVE,
    behavioral: TRADELIA_GLOSSARY_TAGS.APPLICATION.INVESTING,
    trend: TRADELIA_GLOSSARY_TAGS.APPLICATION.SWING_TRADING,
    momentum: TRADELIA_GLOSSARY_TAGS.APPLICATION.SWING_TRADING,
    volatility: TRADELIA_GLOSSARY_TAGS.COMPLEXITY.MODERATE,
    risk: TRADELIA_GLOSSARY_TAGS.APPLICATION.HEDGING,
    "support-resistance": TRADELIA_GLOSSARY_TAGS.APPLICATION.DAILY_TRADING,
    volume: TRADELIA_GLOSSARY_TAGS.APPLICATION.DAILY_TRADING,
    fibonacci: TRADELIA_GLOSSARY_TAGS.APPLICATION.DAILY_TRADING,
    ichimoku: TRADELIA_GLOSSARY_TAGS.APPLICATION.SWING_TRADING,
  };

  return tagMap[oldTag] || null;
}

/**
 * Determina application contexts da tag e categoria
 */
function determineApplicationContexts(
  oldTags: string[],
  category: TradeliaGlossaryCategory
): GlossaryApplicationContext[] {
  const contexts: GlossaryApplicationContext[] = [];

  // Mappa tag → context
  if (oldTags.some((t) => t.includes("trading") || t.includes("trend") || t.includes("momentum"))) {
    contexts.push("trading");
  }
  if (
    oldTags.some(
      (t) => t.includes("investing") || t.includes("fundamental") || t.includes("portfolio")
    )
  ) {
    contexts.push("investing");
  }
  if (oldTags.some((t) => t.includes("risk") || t.includes("hedge") || t.includes("volatility"))) {
    contexts.push("risk-management");
  }
  if (oldTags.some((t) => t.includes("portfolio") || t.includes("allocation"))) {
    contexts.push("portfolio-construction");
  }
  if (
    oldTags.some(
      (t) => t.includes("analysis") || t.includes("technical") || t.includes("fundamental")
    )
  ) {
    contexts.push("market-analysis");
  }
  if (oldTags.some((t) => t.includes("compliance") || t.includes("regulation"))) {
    contexts.push("regulatory-compliance");
  }

  // Default basato su categoria
  if (contexts.length === 0) {
    const categoryData = TRADELIA_GLOSSARY_CATEGORIES[category];
    if (categoryData.key === "trading-execution") {
      contexts.push("trading");
    } else if (categoryData.key === "portfolio-construction") {
      contexts.push("portfolio-construction");
    } else if (categoryData.key === "risk-management") {
      contexts.push("risk-management");
    } else {
      contexts.push("market-analysis");
    }
  }

  return [...new Set(contexts)]; // Rimuovi duplicati
}

/**
 * Rimuove riferimenti a "Tradelia" o "In Tradelia" dal testo
 */
function removeTradeliaReferences(text: string): string {
  if (!text) {
    return text;
  }

  return text
    .replace(/In Tradelia,?\s*/gi, "")
    .replace(/Tradelia\s+(usa|utilizza|mostra|calcola|identifica)/gi, "Si")
    .replace(/Tradelia/gi, "il sistema")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Converte un termine vecchio alla nuova struttura Tradelia
 */
function convertToTradeliaTerm(key: string, oldTerm: OldGlossaryTerm): TradeliaGlossaryTerm | null {
  try {
    // 1. Mappa categoria
    const oldCategory = oldTerm.category || "Technical Analysis";
    const tradeliaCategory = getTradeliaCategory(oldCategory);

    if (!isValidTradeliaCategory(tradeliaCategory)) {
      console.warn(`⚠️  Categoria non valida per "${oldTerm.title}": ${tradeliaCategory}`);
      return null;
    }

    // 2. Determina learning level
    const complexity = oldTerm.tags?.find((t) =>
      ["simple", "moderate", "complex", "expert"].includes(t)
    );
    const learningLevel = determineLearningLevel(tradeliaCategory, complexity);

    // 3. Determina user types
    const applicationContexts = determineApplicationContexts(oldTerm.tags || [], tradeliaCategory);
    const userTypes = determineUserTypes(tradeliaCategory, applicationContexts[0]);

    // 4. Mappa tag
    const tradeliaTags: string[] = [];
    if (oldTerm.tags) {
      for (const oldTag of oldTerm.tags) {
        const mappedTag = mapOldTagToTradeliaTag(oldTag);
        if (mappedTag) {
          tradeliaTags.push(mappedTag);
        } else {
          // Mantieni tag originale se non mappato (potrebbe essere valido)
          tradeliaTags.push(oldTag);
        }
      }
    }

    // 5. Converti contenuto
    const whatDoes = removeTradeliaReferences(oldTerm.technical || oldTerm.how || "");
    const howToUse = removeTradeliaReferences(oldTerm.how || oldTerm.technical || "");

    // Se whatDoes e howToUse sono uguali o vuoti, dividi meglio
    let finalWhatDoes = whatDoes;
    let finalHowToUse = howToUse;

    if (whatDoes === howToUse && whatDoes.length > 0) {
      // Dividi il testo a metà o cerca pattern
      const sentences = whatDoes.split(/[.!?]\s+/);
      if (sentences.length > 1) {
        finalWhatDoes = sentences.slice(0, Math.ceil(sentences.length / 2)).join(". ") + ".";
        finalHowToUse = sentences.slice(Math.ceil(sentences.length / 2)).join(". ") + ".";
      } else {
        finalWhatDoes = whatDoes;
        finalHowToUse =
          "Applica questo concetto nel contesto appropriato del tuo trading o investimento.";
      }
    }

    if (!finalWhatDoes && !finalHowToUse) {
      finalWhatDoes = "Concetto finanziario importante per l'analisi di mercato.";
      finalHowToUse =
        "Applica questo concetto nel contesto appropriato del tuo trading o investimento.";
    }

    // 6. Genera ID e slug
    const id = key;
    const slug = generateSlug(oldTerm.title);

    // 7. Costruisci termine Tradelia
    const tradeliaTerm: TradeliaGlossaryTerm = {
      id,
      title: oldTerm.title,
      slug,
      academicDefinition: {
        what: oldTerm.what,
        source: oldTerm.source,
      },
      tradeliaExplanation: {
        whatDoes: finalWhatDoes,
        howToUse: finalHowToUse,
      },
      category: tradeliaCategory,
      tags: tradeliaTags as any,
      learningLevel,
      relatedTerms: oldTerm.relatedTerms || [],
      applicationContexts,
      userTypes,
      version: 1,
    };

    return tradeliaTerm;
  } catch (error: unknown) {
    console.error(`❌ Errore convertendo "${oldTerm.title}":`, error);
    return null;
  }
}

/**
 * Funzione principale di migrazione
 */
function migrateGlossary() {
  console.log("🔄 Avvio migrazione glossario alla nuova struttura Tradelia...\n");

  // 1. Leggi file vecchio
  const oldGlossaryPath = path.join(process.cwd(), "public", "tradelia-glossary-300.json");
  if (!fs.existsSync(oldGlossaryPath)) {
    console.error(`❌ File non trovato: ${oldGlossaryPath}`);
    process.exit(1);
  }

  const oldGlossaryData: Record<string, OldGlossaryTerm> = JSON.parse(
    fs.readFileSync(oldGlossaryPath, "utf-8")
  );

  console.log(`📖 Letti ${Object.keys(oldGlossaryData).length} termini dal file vecchio\n`);

  // 2. Converti termini
  const newGlossaryData: Record<string, TradeliaGlossaryTerm> = {};
  let convertedCount = 0;
  let skippedCount = 0;

  for (const [key, oldTerm] of Object.entries(oldGlossaryData)) {
    const newTerm = convertToTradeliaTerm(key, oldTerm);
    if (newTerm) {
      newGlossaryData[key] = newTerm;
      convertedCount++;
    } else {
      skippedCount++;
      console.warn(`⚠️  Saltato: ${oldTerm.title}`);
    }
  }

  console.log(`✅ Convertiti: ${convertedCount}`);
  console.log(`⚠️  Saltati: ${skippedCount}\n`);

  // 3. Salva nuovo file
  const newGlossaryPath = path.join(process.cwd(), "public", "tradelia-glossary-new.json");
  fs.writeFileSync(newGlossaryPath, JSON.stringify(newGlossaryData, null, 2), "utf-8");

  console.log(`💾 Nuovo file salvato: ${newGlossaryPath}\n`);

  // 4. Genera report
  const report = {
    totalTerms: Object.keys(oldGlossaryData).length,
    converted: convertedCount,
    skipped: skippedCount,
    categories: {} as Record<string, number>,
    learningLevels: {} as Record<string, number>,
  };

  for (const term of Object.values(newGlossaryData)) {
    report.categories[term.category] = (report.categories[term.category] || 0) + 1;
    report.learningLevels[term.learningLevel] =
      (report.learningLevels[term.learningLevel] || 0) + 1;
  }

  const reportPath = path.join(process.cwd(), "glossary-migration-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

  console.log("📊 Report migrazione:");
  console.log(JSON.stringify(report, null, 2));
  console.log(`\n📄 Report salvato: ${reportPath}\n`);

  console.log("✅ Migrazione completata!");
}

// Esegui migrazione
try {
  migrateGlossary();
} catch (error: unknown) {
  console.error("❌ Errore durante la migrazione:", error);
  process.exit(1);
}
