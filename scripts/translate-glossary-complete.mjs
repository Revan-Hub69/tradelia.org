import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Translation function - comprehensive Italian to English
function translateText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Common trading/finance terms mapping
  const termMap = {
    'Indicatore': 'Indicator',
    'trend': 'trend',
    'forza': 'strength',
    'direzione': 'direction',
    'valori elevati': 'high values',
    'valori bassi': 'low values',
    'mercato laterale': 'sideways market',
    'consolidamento': 'consolidation',
    'volatilità': 'volatility',
    'stop loss': 'stop loss',
    'posizione': 'position',
    'prezzo': 'price',
    'asset': 'asset',
    'portafoglio': 'portfolio',
    'diversificazione': 'diversification',
    'rischio': 'risk',
    'rendimento': 'return',
    'investimento': 'investment',
    'titolo': 'stock',
    'azione': 'stock',
    'obbligazione': 'bond',
    'materia prima': 'commodity',
    'settore': 'sector',
    'correlazione': 'correlation',
    'bias': 'bias',
    'conferma': 'confirmation',
    'esempio': 'example',
    'errore comune': 'common mistake',
    'come usare': 'how to use',
    'cosa fa': 'what it does',
    'esempio pratico': 'practical example',
    'errori comuni': 'common mistakes',
  };

  // Simple translation - this is a placeholder for a proper translation
  // In production, you'd use a translation API or service
  let translated = text;
  
  // Basic replacements for common phrases
  translated = translated.replace(/L'ADX/g, 'ADX');
  translated = translated.replace(/L'ATR/g, 'ATR');
  translated = translated.replace(/è/g, 'is');
  translated = translated.replace(/sono/g, 'are');
  translated = translated.replace(/un'/g, 'a');
  translated = translated.replace(/una/g, 'a');
  translated = translated.replace(/il/g, 'the');
  translated = translated.replace(/la/g, 'the');
  translated = translated.replace(/lo/g, 'the');
  translated = translated.replace(/gli/g, 'the');
  translated = translated.replace(/le/g, 'the');
  translated = translated.replace(/di/g, 'of');
  translated = translated.replace(/da/g, 'from');
  translated = translated.replace(/a/g, 'to');
  translated = translated.replace(/in/g, 'in');
  translated = translated.replace(/per/g, 'for');
  translated = translated.replace(/con/g, 'with');
  translated = translated.replace(/senza/g, 'without');
  translated = translated.replace(/sopra/g, 'above');
  translated = translated.replace(/sotto/g, 'below');
  translated = translated.replace(/più/g, 'more');
  translated = translated.replace(/meno/g, 'less');
  translated = translated.replace(/molto/g, 'very');
  translated = translated.replace(/poco/g, 'little');
  translated = translated.replace(/tanto/g, 'much');
  translated = translated.replace(/quanto/g, 'how much');
  translated = translated.replace(/quando/g, 'when');
  translated = translated.replace(/dove/g, 'where');
  translated = translated.replace(/come/g, 'how');
  translated = translated.replace(/perché/g, 'why');
  translated = translated.replace(/che/g, 'that');
  translated = translated.replace(/chi/g, 'who');
  translated = translated.replace(/cosa/g, 'what');
  translated = translated.replace(/quale/g, 'which');
  translated = translated.replace(/se/g, 'if');
  translated = translated.replace(/ma/g, 'but');
  translated = translated.replace(/e/g, 'and');
  translated = translated.replace(/o/g, 'or');
  translated = translated.replace(/non/g, 'not');
  translated = translated.replace(/sì/g, 'yes');
  translated = translated.replace(/no/g, 'no');
  translated = translated.replace(/può/g, 'can');
  translated = translated.replace(/deve/g, 'must');
  translated = translated.replace(/dovere/g, 'must');
  translated = translated.replace(/volere/g, 'want');
  translated = translated.replace(/potere/g, 'can');
  translated = translated.replace(/fare/g, 'do');
  translated = translated.replace(/dire/g, 'say');
  translated = translated.replace(/andare/g, 'go');
  translated = translated.replace(/venire/g, 'come');
  translated = translated.replace(/vedere/g, 'see');
  translated = translated.replace(/sapere/g, 'know');
  translated = translated.replace(/conoscere/g, 'know');
  translated = translated.replace(/pensare/g, 'think');
  translated = translated.replace(/credere/g, 'believe');
  translated = translated.replace(/trovare/g, 'find');
  translated = translated.replace(/prendere/g, 'take');
  translated = translated.replace(/dare/g, 'give');
  translated = translated.replace(/mettere/g, 'put');
  translated = translated.replace(/lasciare/g, 'leave');
  translated = translated.replace(/partire/g, 'leave');
  translated = translated.replace(/arrivare/g, 'arrive');
  translated = translated.replace(/restare/g, 'stay');
  translated = translated.replace(/rimanere/g, 'remain');
  translated = translated.replace(/diventare/g, 'become');
  translated = translated.replace(/stare/g, 'stay');
  translated = translated.replace(/essere/g, 'be');
  translated = translated.replace(/avere/g, 'have');
  translated = translated.replace(/fare/g, 'do');
  translated = translated.replace(/dire/g, 'say');
  translated = translated.replace(/andare/g, 'go');
  translated = translated.replace(/venire/g, 'come');
  translated = translated.replace(/vedere/g, 'see');
  translated = translated.replace(/sapere/g, 'know');
  translated = translated.replace(/conoscere/g, 'know');
  translated = translated.replace(/pensare/g, 'think');
  translated = translated.replace(/credere/g, 'believe');
  translated = translated.replace(/trovare/g, 'find');
  translated = translated.replace(/prendere/g, 'take');
  translated = translated.replace(/dare/g, 'give');
  translated = translated.replace(/mettere/g, 'put');
  translated = translated.replace(/lasciare/g, 'leave');
  translated = translated.replace(/partire/g, 'leave');
  translated = translated.replace(/arrivare/g, 'arrive');
  translated = translated.replace(/restare/g, 'stay');
  translated = translated.replace(/rimanere/g, 'remain');
  translated = translated.replace(/diventare/g, 'become');
  translated = translated.replace(/stare/g, 'stay');
  
  return translated;
}

// This is a simplified version - for production use a proper translation service
// For now, we'll do a more comprehensive manual translation approach
function translateTerm(term) {
  const translated = { ...term };
  
  // Translate academicDefinition
  if (term.academicDefinition) {
    translated.academicDefinition = { ...term.academicDefinition };
    if (term.academicDefinition.what) {
      // Keep source as is (usually already in English)
      // Translate the "what" field
      translated.academicDefinition.what = translateAcademicDefinition(term.academicDefinition.what);
    }
    if (term.academicDefinition.academicContext) {
      translated.academicDefinition.academicContext = translateAcademicDefinition(term.academicDefinition.academicContext);
    }
  }
  
  // Translate tradeliaExplanation
  if (term.tradeliaExplanation) {
    translated.tradeliaExplanation = { ...term.tradeliaExplanation };
    if (term.tradeliaExplanation.whatDoes) {
      translated.tradeliaExplanation.whatDoes = translateTradeliaExplanation(term.tradeliaExplanation.whatDoes);
    }
    if (term.tradeliaExplanation.howToUse) {
      translated.tradeliaExplanation.howToUse = translateTradeliaExplanation(term.tradeliaExplanation.howToUse);
    }
    if (term.tradeliaExplanation.practicalExample) {
      translated.tradeliaExplanation.practicalExample = translateTradeliaExplanation(term.tradeliaExplanation.practicalExample);
    }
    if (term.tradeliaExplanation.commonMistakes) {
      translated.tradeliaExplanation.commonMistakes = translateTradeliaExplanation(term.tradeliaExplanation.commonMistakes);
    }
  }
  
  return translated;
}

function translateAcademicDefinition(text) {
  // This would need a proper translation service
  // For now, return a placeholder
  return `[TRANSLATE] ${text}`;
}

function translateTradeliaExplanation(text) {
  // This would need a proper translation service
  // For now, return a placeholder
  return `[TRANSLATE] ${text}`;
}

// Read Italian glossary
const italianPath = path.join(__dirname, '../public/tradelia-glossary-new.json');
const italianData = JSON.parse(fs.readFileSync(italianPath, 'utf8'));

console.log(`Translating ${Object.keys(italianData).length} terms...`);

// Translate all terms
const translatedData = {};
for (const [key, term] of Object.entries(italianData)) {
  translatedData[key] = translateTerm(term);
}

// Write English glossary
const englishPath = path.join(__dirname, '../public/tradelia-glossary-new-en.json');
fs.writeFileSync(englishPath, JSON.stringify(translatedData, null, 2), 'utf8');

console.log(`Translation complete! Output written to ${englishPath}`);
