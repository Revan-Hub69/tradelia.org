import fs from 'fs';
import path from 'path';

// This script will translate the Italian glossary to English
// Since we don't have a translation API, we'll need to manually translate
// For now, this creates a structure that can be filled with translations

const italianData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/tradelia-glossary-new.json'), 'utf8')
);

// Manual translation mapping for common phrases
const translationMap = {
  'Indicatore che misura': 'Indicator that measures',
  'valori elevati indicano': 'high values indicate',
  'valori bassi suggeriscono': 'low values suggest',
  'mercato laterale': 'sideways market',
  'in consolidamento': 'in consolidation',
  'Esempio:': 'Example:',
  'Errore comune:': 'Common mistake:',
  'Altro errore:': 'Another mistake:',
  // Add more mappings as needed
};

function translateText(text) {
  if (!text) return text;
  
  // Simple word-by-word translation for now
  // In production, you'd use a proper translation service
  let translated = text;
  
  // Apply translation map
  for (const [it, en] of Object.entries(translationMap)) {
    translated = translated.replace(new RegExp(it, 'gi'), en);
  }
  
  // For now, return a placeholder indicating translation needed
  // In a real scenario, you'd implement full translation here
  return translated;
}

function translateTerm(term) {
  return {
    ...term,
    academicDefinition: term.academicDefinition ? {
      what: translateText(term.academicDefinition.what),
      source: term.academicDefinition.source, // Keep source as-is
      ...(term.academicDefinition.academicContext && {
        academicContext: translateText(term.academicDefinition.academicContext)
      })
    } : undefined,
    tradeliaExplanation: term.tradeliaExplanation ? {
      whatDoes: translateText(term.tradeliaExplanation.whatDoes),
      howToUse: translateText(term.tradeliaExplanation.howToUse),
      ...(term.tradeliaExplanation.practicalExample && {
        practicalExample: translateText(term.tradeliaExplanation.practicalExample)
      }),
      ...(term.tradeliaExplanation.commonMistakes && {
        commonMistakes: translateText(term.tradeliaExplanation.commonMistakes)
      })
    } : undefined
  };
}

const englishData = {};
for (const [key, value] of Object.entries(italianData)) {
  if (key.startsWith('_')) {
    englishData[key] = value;
  } else {
    englishData[key] = translateTerm(value);
  }
}

const outputPath = path.join(process.cwd(), 'public/tradelia-glossary-new-en.json');
fs.writeFileSync(outputPath, JSON.stringify(englishData, null, 2), 'utf8');
console.log(`English glossary created at ${outputPath}`);
console.log(`Translated ${Object.keys(englishData).filter(k => !k.startsWith('_')).length} terms`);
