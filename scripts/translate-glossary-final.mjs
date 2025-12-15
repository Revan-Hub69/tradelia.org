import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive translation mappings for financial/trading terms
const translations = {
  // Common phrases
  'Indicatore che misura': 'Indicator that measures',
  'valori elevati indicano': 'high values indicate',
  'valori bassi suggeriscono': 'low values suggest',
  'mercato laterale': 'sideways market',
  'in consolidamento': 'in consolidation',
  'misura della volatilità': 'measure of volatility',
  'stop loss': 'stop loss',
  'posizione': 'position',
  'posizioni long': 'long positions',
  'posizioni short': 'short positions',
  'prezzo': 'price',
  'asset': 'asset',
  'titolo': 'stock',
  'azione': 'stock',
  'azioni': 'stocks',
  'obbligazione': 'bond',
  'obbligazioni': 'bonds',
  'materia prima': 'commodity',
  'materie prime': 'commodities',
  'portafoglio': 'portfolio',
  'diversificazione': 'diversification',
  'rischio': 'risk',
  'rendimento': 'return',
  'volatilità': 'volatility',
  'correlazione': 'correlation',
  'settore': 'sector',
  'settori': 'sectors',
  'investimento': 'investment',
  'investimenti': 'investments',
  'Esempio:': 'Example:',
  'Errore comune:': 'Common mistake:',
  'Altro errore:': 'Another mistake:',
  'esempio pratico': 'practical example',
  'errori comuni': 'common mistakes',
  
  // Verbs
  'misura': 'measures',
  'indica': 'indicates',
  'suggerisce': 'suggests',
  'mostra': 'shows',
  'calcola': 'calculates',
  'protegge': 'protects',
  'riduce': 'reduces',
  'aumenta': 'increases',
  'imposta': 'set',
  'usa': 'use',
  'combina': 'combine',
  'evita': 'avoid',
  'considera': 'consider',
  'verifica': 'verify',
  'ignora': 'ignore',
  
  // Adjectives
  'forte': 'strong',
  'debole': 'weak',
  'alto': 'high',
  'basso': 'low',
  'elevato': 'high',
  'significativo': 'significant',
  'normale': 'normal',
  'stabile': 'stable',
  'volatile': 'volatile',
  'diverso': 'different',
  'simile': 'similar',
  'comune': 'common',
  'maggiore': 'greater',
  'minore': 'lesser',
  
  // Nouns
  'trend': 'trend',
  'direzione': 'direction',
  'forza': 'strength',
  'movimento': 'movement',
  'supporto': 'support',
  'resistenza': 'resistance',
  'livello': 'level',
  'livelli': 'levels',
  'media mobile': 'moving average',
  'indicatore': 'indicator',
  'indicatori': 'indicators',
  'strategia': 'strategy',
  'strategie': 'strategies',
  'mercato': 'market',
  'capitale': 'capital',
  'perdita': 'loss',
  'perdite': 'losses',
  'profitto': 'profit',
  'profitti': 'profits',
  'dimensione': 'size',
  'spazio': 'space',
  'rumore': 'noise',
  'segnale': 'signal',
  'segnali': 'signals',
  'dato': 'data',
  'dati': 'data',
  'informazione': 'information',
  'informazioni': 'information',
  'analisi': 'analysis',
  'valutazione': 'evaluation',
  'confronto': 'comparison',
  'target': 'target',
  'obiettivo': 'objective',
  'obiettivi': 'objectives',
};

// Function to translate Italian text to English
function translateText(text) {
  if (!text || typeof text !== 'string') return text;
  
  let result = text;
  
  // Replace common Italian financial terms with English equivalents
  // This is a simplified approach - for production, use a proper translation service
  
  // Handle specific patterns
  result = result.replace(/L'ADX/g, 'ADX');
  result = result.replace(/L'ATR/g, 'ATR');
  result = result.replace(/L'/g, 'The ');
  result = result.replace(/l'/g, 'the ');
  result = result.replace(/Un'/g, 'A ');
  result = result.replace(/un'/g, 'a ');
  result = result.replace(/Una'/g, 'A ');
  result = result.replace(/una'/g, 'a ');
  
  // Replace common words (basic approach)
  for (const [italian, english] of Object.entries(translations)) {
    const regex = new RegExp(italian, 'gi');
    result = result.replace(regex, english);
  }
  
  // This is a placeholder - real translation would require NLP/ML
  // For now, we'll need to manually translate or use an API
  return result;
}

// Read the Italian glossary
const inputPath = path.join(__dirname, '../public/tradelia-glossary-new.json');
const outputPath = path.join(__dirname, '../public/tradelia-glossary-new-en.json');

console.log('Reading Italian glossary...');
const italianData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log(`Found ${Object.keys(italianData).length} terms to translate`);

// Translate each term
const englishData = {};
let count = 0;

for (const [key, term] of Object.entries(italianData)) {
  count++;
  if (count % 10 === 0) {
    console.log(`Translated ${count}/${Object.keys(italianData).length} terms...`);
  }
  
  const translatedTerm = { ...term };
  
  // Translate academicDefinition.what
  if (term.academicDefinition?.what) {
    // For academic definitions, we often need to keep the English part and translate the Italian
    let what = term.academicDefinition.what;
    
    // If it starts with English (like "Average Directional Index -"), keep that part
    const dashIndex = what.indexOf(' - ');
    if (dashIndex > 0) {
      const englishPart = what.substring(0, dashIndex);
      const italianPart = what.substring(dashIndex + 3);
      translatedTerm.academicDefinition.what = `${englishPart} - ${translateText(italianPart)}`;
    } else {
      translatedTerm.academicDefinition.what = translateText(what);
    }
  }
  
  // Translate academicContext if present
  if (term.academicDefinition?.academicContext) {
    translatedTerm.academicDefinition.academicContext = translateText(term.academicDefinition.academicContext);
  }
  
  // Translate tradeliaExplanation fields
  if (term.tradeliaExplanation) {
    translatedTerm.tradeliaExplanation = { ...term.tradeliaExplanation };
    
    if (term.tradeliaExplanation.whatDoes) {
      translatedTerm.tradeliaExplanation.whatDoes = translateText(term.tradeliaExplanation.whatDoes);
    }
    if (term.tradeliaExplanation.howToUse) {
      translatedTerm.tradeliaExplanation.howToUse = translateText(term.tradeliaExplanation.howToUse);
    }
    if (term.tradeliaExplanation.practicalExample) {
      translatedTerm.tradeliaExplanation.practicalExample = translateText(term.tradeliaExplanation.practicalExample);
    }
    if (term.tradeliaExplanation.commonMistakes) {
      translatedTerm.tradeliaExplanation.commonMistakes = translateText(term.tradeliaExplanation.commonMistakes);
    }
  }
  
  englishData[key] = translatedTerm;
}

// Write the English glossary
console.log('Writing English glossary...');
fs.writeFileSync(outputPath, JSON.stringify(englishData, null, 2), 'utf8');

console.log(`✅ Translation complete! ${Object.keys(englishData).length} terms translated.`);
console.log(`Output: ${outputPath}`);
