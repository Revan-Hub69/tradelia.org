import fs from 'fs';
import path from 'path';

// Read Italian glossary
const italianData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/tradelia-glossary-new.json'), 'utf8')
);

// Translation function - placeholder for now
// In a real scenario, you'd use a translation API or manual translations
function translateText(text) {
  // This is a placeholder - you would implement actual translation here
  // For now, we'll create a structure that can be filled in
  return text; // Placeholder - returns original text
}

// Translate a term
function translateTerm(term) {
  const translated = {
    ...term,
    academicDefinition: term.academicDefinition ? {
      what: translateText(term.academicDefinition.what),
      source: term.academicDefinition.source, // Keep source as-is (usually English)
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
  return translated;
}

// Translate all terms
const englishData = {};
for (const [key, value] of Object.entries(italianData)) {
  if (key.startsWith('_')) {
    englishData[key] = value; // Keep metadata
  } else {
    englishData[key] = translateTerm(value);
  }
}

// Write English glossary
const outputPath = path.join(process.cwd(), 'public/tradelia-glossary-new-en.json');
fs.writeFileSync(outputPath, JSON.stringify(englishData, null, 2), 'utf8');
console.log(`English glossary created at ${outputPath}`);
console.log(`Translated ${Object.keys(englishData).filter(k => !k.startsWith('_')).length} terms`);
