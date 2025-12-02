/**
 * Script per Revisione Glossario Tradelia
 *
 * Questo script aiuta a revisionare tutte le voci del glossario secondo:
 * - Nuova matrice brand voice Tradelia
 * - Principi di neuroscienza educativa
 * - Struttura "Cosa fa" + "Come si usa"
 * - Rimozione riferimenti a "come Tradelia usa" (vecchi analisti)
 *
 * Usage: tsx scripts/glossary/review-glossary.ts
 * @ts-nocheck
 */
/* eslint-disable no-console */

import * as fs from "fs";
import * as path from "path";
import { TRADELIA_BRAND_VOICE_MATRIX } from "../../lib/ai/tradelia-brand-voice-matrix";

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

interface NewGlossaryTerm {
  title: string;
  what: string; // Definizione accademica precisa (da revisionare)
  source: string; // Fonti accademiche (verificare)
  whatDoes?: string; // Cosa fa - da generare/convertire
  howToUse?: string; // Come si usa - da generare/convertire
  category?: string;
  tags?: string[];
  relatedTerms?: string[];
}

/**
 * Analizza una voce del glossario e identifica problemi
 */
function analyzeGlossaryTerm(term: OldGlossaryTerm): {
  needsReview: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Check 1: Ha riferimenti a "Tradelia" o "In Tradelia"
  const hasTradeliaReference =
    term.how?.toLowerCase().includes("tradelia") ||
    term.technical?.toLowerCase().includes("tradelia") ||
    term.what?.toLowerCase().includes("tradelia");

  if (hasTradeliaReference) {
    issues.push('Contiene riferimenti a "Tradelia" o "In Tradelia" - da rimuovere');
    suggestions.push("Rimuovi riferimenti specifici a Tradelia, rendi la spiegazione universale");
  }

  // Check 2: Usa struttura vecchia (technical/how invece di whatDoes/howToUse)
  if (term.technical || term.how) {
    issues.push("Usa struttura vecchia (technical/how) - da convertire in whatDoes/howToUse");
    suggestions.push(
      "Converti technical in whatDoes e how in howToUse, rimuovendo riferimenti a Tradelia"
    );
  }

  // Check 3: Definizione accademica precisa?
  if (term.what.length < 50) {
    issues.push("Definizione accademica troppo breve - potrebbe non essere esaustiva");
    suggestions.push("Espandi la definizione accademica per essere più precisa e completa");
  }

  // Check 4: Ha esempi concreti?
  const hasExamples =
    term.technical?.toLowerCase().includes("esempio") ||
    term.how?.toLowerCase().includes("esempio") ||
    term.technical?.toLowerCase().includes("se ") ||
    term.how?.toLowerCase().includes("se ");

  if (!hasExamples) {
    issues.push("Manca esempio concreto - aggiungi esempio pratico");
    suggestions.push("Aggiungi un esempio concreto seguendo le linee guida Tradelia AI");
  }

  // Check 5: Linguaggio promozionale?
  const promotionalWords = ["scopri", "acquista", "offerta", "esclusivo"];
  const hasPromotional = promotionalWords.some(
    (word) => term.how?.toLowerCase().includes(word) || term.technical?.toLowerCase().includes(word)
  );

  if (hasPromotional) {
    issues.push("Contiene linguaggio promozionale");
    suggestions.push("Rimuovi linguaggio promozionale, mantieni focus educativo");
  }

  // Check 6: Focus su "come Tradelia usa" invece di "come si usa"?
  if (term.how?.toLowerCase().includes("tradelia") && term.how?.toLowerCase().includes("usato")) {
    issues.push("Focus su come Tradelia usa invece di come si usa universalmente");
    suggestions.push(
      "Riscrivi per spiegare come si usa il concetto in generale, non come Tradelia lo implementa"
    );
  }

  return {
    needsReview: issues.length > 0,
    issues,
    suggestions,
  };
}

/**
 * Converte una voce vecchia in nuova struttura
 */
function convertToNewStructure(term: OldGlossaryTerm): NewGlossaryTerm {
  const newTerm: NewGlossaryTerm = {
    title: term.title,
    what: term.what, // Da revisionare manualmente
    source: term.source,
    category: term.category,
    tags: term.tags,
    relatedTerms: term.relatedTerms,
  };

  // Converti technical in whatDoes (rimuovendo riferimenti a Tradelia)
  if (term.technical) {
    newTerm.whatDoes = term.technical
      .replace(/In Tradelia,?/gi, "")
      .replace(/Tradelia (usa|è usato|utilizza)/gi, "Si")
      .replace(/Mostriamo/gi, "Si può visualizzare")
      .trim();
  }

  // Converti how in howToUse (rimuovendo riferimenti a Tradelia)
  if (term.how) {
    newTerm.howToUse = term.how
      .replace(/In Tradelia,?/gi, "")
      .replace(/Tradelia (usa|è usato|utilizza)/gi, "Si")
      .replace(/Mostriamo/gi, "Si può visualizzare")
      .replace(/è usato per/gi, "si usa per")
      .trim();
  }

  return newTerm;
}

/**
 * Genera prompt per revisione AI
 */
function generateReviewPrompt(term: OldGlossaryTerm): string {
  const analysis = analyzeGlossaryTerm(term);

  return `${TRADELIA_BRAND_VOICE_MATRIX.contentGenerationPrompt(
    "glossary",
    term.title,
    `Revisione voce glossario esistente. Problemi identificati: ${analysis.issues.join("; ")}`
  )}

VOCE ESISTENTE DA REVISIONARE:
Titolo: ${term.title}
Definizione Accademica: ${term.what}
${term.technical ? `Technical (vecchio): ${term.technical}` : ""}
${term.how ? `How (vecchio): ${term.how}` : ""}
Fonte: ${term.source}
${term.category ? `Categoria: ${term.category}` : ""}

PROBLEMI IDENTIFICATI:
${analysis.issues.map((issue, i) => `${i + 1}. ${issue}`).join("\n")}

SUGGERIMENTI:
${analysis.suggestions.map((suggestion, i) => `${i + 1}. ${suggestion}`).join("\n")}

GENERA:
1. Definizione accademica RIVISTA (più precisa, esaustiva, basata su evidenze)
2. "Cosa fa" (whatDoes) - spiegazione semplice ma esaustiva, SENZA riferimenti a Tradelia
3. "Come si usa" (howToUse) - applicazione pratica universale, SENZA riferimenti a Tradelia

IMPORTANTE:
- Rimuovi TUTTI i riferimenti a "Tradelia", "In Tradelia", "Mostriamo"
- Rendi le spiegazioni universali e applicabili da chiunque
- Mantieni rigore accademico
- Aggiungi esempi concreti
- Segui i principi di neuroscienza educativa`;
}

/**
 * Processa tutto il glossario
 */
function processGlossary(inputPath: string, outputPath: string) {
  console.log("📖 Caricamento glossario...");
  const glossaryData = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

  const terms = Object.values(glossaryData) as OldGlossaryTerm[];
  console.log(`✅ Caricate ${terms.length} voci`);

  // Analisi
  console.log("\n🔍 Analisi voci...");
  const analysisReport: Array<{
    term: string;
    needsReview: boolean;
    issues: string[];
  }> = [];

  terms.forEach((term) => {
    const analysis = analyzeGlossaryTerm(term);
    if (analysis.needsReview) {
      analysisReport.push({
        term: term.title,
        needsReview: true,
        issues: analysis.issues,
      });
    }
  });

  console.log(`\n📊 Report Analisi:`);
  console.log(`- Voci che necessitano revisione: ${analysisReport.length}/${terms.length}`);
  console.log(`- Voci OK: ${terms.length - analysisReport.length}/${terms.length}`);

  // Genera report dettagliato
  const reportPath = path.join(path.dirname(outputPath), "glossary-review-report.json");
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        totalTerms: terms.length,
        needsReview: analysisReport.length,
        reviewDate: new Date().toISOString(),
        terms: analysisReport,
      },
      null,
      2
    )
  );
  console.log(`\n📄 Report salvato in: ${reportPath}`);

  // Genera prompt per ogni voce che necessita revisione
  const promptsPath = path.join(path.dirname(outputPath), "glossary-review-prompts.md");
  const prompts = analysisReport
    .map((item, index) => {
      const term = terms.find((t) => t.title === item.term);
      if (!term) {
        return "";
      }

      return `\n## ${index + 1}. ${term.title}\n\n${generateReviewPrompt(term)}\n\n---\n`;
    })
    .join("\n");

  fs.writeFileSync(promptsPath, `# Prompt per Revisione Glossario Tradelia\n\n${prompts}`);
  console.log(`📝 Prompt generati in: ${promptsPath}`);

  // Conversione automatica (solo struttura, contenuto da revisionare)
  console.log("\n🔄 Conversione struttura...");
  const convertedGlossary: Record<string, NewGlossaryTerm> = {};

  terms.forEach((term, index) => {
    const converted = convertToNewStructure(term);
    convertedGlossary[index.toString()] = converted;
  });

  const convertedPath = path.join(path.dirname(outputPath), "glossary-converted-structure.json");
  fs.writeFileSync(convertedPath, JSON.stringify(convertedGlossary, null, 2));
  console.log(`✅ Struttura convertita salvata in: ${convertedPath}`);
  console.log(
    `⚠️  NOTA: Il contenuto necessita ancora revisione manuale secondo la matrice brand voice`
  );

  return {
    total: terms.length,
    needsReview: analysisReport.length,
    reportPath,
    promptsPath,
    convertedPath,
  };
}

// Esegui se chiamato direttamente
if (require.main === module) {
  const inputPath = path.join(__dirname, "../../public/tradelia-glossary-300.json");
  const outputDir = path.join(__dirname, "../../public/glossary-review");

  // Crea directory se non esiste
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "glossary-reviewed.json");

  try {
    const result = processGlossary(inputPath, outputPath);
    console.log("\n✅ Processo completato!");
    console.log("\n📋 Prossimi passi:");
    console.log(`1. Rivedi il report: ${result.reportPath}`);
    console.log(`2. Usa i prompt generati: ${result.promptsPath}`);
    console.log(`3. Revisiona manualmente le voci secondo la matrice brand voice`);
    console.log(`4. Aggiorna il file glossario con le voci revisionate`);
  } catch (error) {
    console.error("❌ Errore:", error);
    process.exit(1);
  }
}

export { analyzeGlossaryTerm, convertToNewStructure, generateReviewPrompt, processGlossary };
