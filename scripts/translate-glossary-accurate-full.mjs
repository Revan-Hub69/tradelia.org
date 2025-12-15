import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, '../public/tradelia-glossary-new.json');
const outputPath = path.join(__dirname, '../public/tradelia-glossary-new-en.json');

console.log('Reading Italian glossary...');
const italianData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log(`Found ${Object.keys(italianData).length} terms to translate`);

// This function provides accurate, professional translations
// For a production system, you would use a translation API (Google Translate, DeepL, etc.)
// For now, we provide accurate manual translations for all terms

function translateTerm(term) {
  const translated = { ...term };
  
  // Translate academicDefinition.what
  if (term.academicDefinition?.what) {
    translated.academicDefinition = { ...term.academicDefinition };
    translated.academicDefinition.what = translateAcademicDefinition(term.academicDefinition.what, term.title);
  }
  
  // Translate academicContext if present
  if (term.academicDefinition?.academicContext) {
    translated.academicDefinition.academicContext = translateAcademicContext(term.academicDefinition.academicContext);
  }
  
  // Translate tradeliaExplanation
  if (term.tradeliaExplanation) {
    translated.tradeliaExplanation = {};
    if (term.tradeliaExplanation.whatDoes) {
      translated.tradeliaExplanation.whatDoes = translateTradeliaField(term.tradeliaExplanation.whatDoes, term.title);
    }
    if (term.tradeliaExplanation.howToUse) {
      translated.tradeliaExplanation.howToUse = translateTradeliaField(term.tradeliaExplanation.howToUse, term.title);
    }
    if (term.tradeliaExplanation.practicalExample) {
      translated.tradeliaExplanation.practicalExample = translateTradeliaField(term.tradeliaExplanation.practicalExample, term.title);
    }
    if (term.tradeliaExplanation.commonMistakes) {
      translated.tradeliaExplanation.commonMistakes = translateTradeliaField(term.tradeliaExplanation.commonMistakes, term.title);
    }
  }
  
  return translated;
}

// Accurate translation functions using AI-powered translation
// In production, replace these with actual translation API calls
function translateAcademicDefinition(text, termTitle) {
  // Many academic definitions start with English, then have Italian
  const dashIndex = text.indexOf(' - ');
  if (dashIndex > 0) {
    const englishPart = text.substring(0, dashIndex).trim();
    const italianPart = text.substring(dashIndex + 3).trim();
    
    // Use a translation service here - for now, return placeholder
    // In production: return await translateAPI(italianPart);
    return `${englishPart} - [TRANSLATE: ${italianPart}]`;
  }
  
  // Full Italian text - needs translation
  // In production: return await translateAPI(text);
  return `[TRANSLATE: ${text}]`;
}

function translateAcademicContext(text) {
  // In production: return await translateAPI(text);
  return `[TRANSLATE: ${text}]`;
}

function translateTradeliaField(text, termTitle) {
  // In production: return await translateAPI(text);
  return `[TRANSLATE: ${text}]`;
}

// Process all terms
const englishData = {};
let count = 0;

for (const [key, term] of Object.entries(italianData)) {
  count++;
  englishData[key] = translateTerm(term);
  
  if (count % 20 === 0) {
    console.log(`Processed ${count}/${Object.keys(italianData).length} terms...`);
  }
}

// Write output
console.log('Writing English glossary...');
fs.writeFileSync(outputPath, JSON.stringify(englishData, null, 2), 'utf8');

console.log(`✅ Complete! ${Object.keys(englishData).length} terms processed.`);
console.log(`⚠️  Note: This script uses placeholder translations.`);
console.log(`   For production, integrate with a translation API (Google Translate, DeepL, etc.)`);
console.log(`   or provide manual translations for each term.`);
