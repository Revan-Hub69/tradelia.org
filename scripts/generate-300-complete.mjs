import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const glossaryPath = path.join(root, 'glossario.json');
const outputPath = path.join(root, 'lib/glossary/tradelia-glossary-300.json');

// Leggi tutti i termini esistenti
const raw = JSON.parse(fs.readFileSync(glossaryPath, 'utf-8'));
const existing = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf-8')) : { _v: '', _note: '' };
const existingKeys = new Set(Object.keys(existing).filter(k => !k.startsWith('_')));

// Prendi tutti i termini dal glossario originale
const entries = Object.entries(raw).filter(([key]) => key !== '_v');

// Categoria rules
const CATEGORY_RULES = [
  { category: 'Regime Analysis', tags: ['regime', 'risk-on', 'risk-off'], match: /(Regime|Momentum|Breadth|RiskWindow|RiskTilt|Leadership|Size|Stress)/i },
  { category: 'Risk Management', tags: ['risk', 'volatility'], match: /(Risk|Drawdown|Sharpe|Beta|Volatil|Hedge|VaR|Sortino|MDD)/i },
  { category: 'Options & Derivatives', tags: ['options', 'volatility', 'greeks'], match: /(F3O|Gamma|Dealer|IV|PCR|MaxPain|VIX|Theta|Rho|ImpliedVol)/i },
  { category: 'Compliance & Regulation', tags: ['compliance', 'mifid'], match: /(MiFID|Compliance|Policy|Sources|Disclaimer|Governance|Audit|Hero|Informativa|ESMA|BCBS)/i },
  { category: 'Data Quality & Governance', tags: ['data-quality', 'governance'], match: /(Fresh|Data|Feed|Confidence|Integrity|Module|Version|State|AuditPath|Latency|Reconciliation)/i },
  { category: 'Portfolio Management', tags: ['portfolio', 'performance'], match: /(Portfolio|ROI|Alpha|Sharpe|Asset|Divers|Correlation|Leaders|Lagging|Finviz|Peer|ETF|Watchlist|Favorites|Rebalancing|Tracking|Information)/i },
  { category: 'Macro Economics', tags: ['macro', 'liquidity'], match: /(StrategyMode|Credit|Liquidity|FX|Macro|Treasury|Volatilità & USD|Curva|Yield|Inflation|GDP)/i },
  { category: 'Sentiment & Positioning', tags: ['sentiment', 'positioning'], match: /(Sentiment|Flow|AAII|NAAIM|Fear|Greed|Position|Insider|Institutional|PutCall|ShortInterest)/i },
  { category: 'Technical Analysis', tags: ['technical-analysis', 'momentum'], match: /(RSI|MovingAverage|Support|Resistance|Trend|MACD|Bollinger|Stochastic)/i },
  { category: 'Fundamental Analysis', tags: ['fundamental-analysis', 'valuation'], match: /(PEG|FreeCashFlow|DebtToEquity|PE|EV|EBITDA|ROE|ROIC|Margins|Earnings)/i },
  { category: 'Market Microstructure', tags: ['liquidity', 'market-micro'], match: /(BidAsk|OrderFlow|Volume|Liquidity|Spread|Microstructure)/i },
];

const DEFAULT_CATEGORY = { category: 'Macro Economics', tags: ['macro'] };

const assignCategory = (key) => {
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(key)) {
      return rule;
    }
  }
  return DEFAULT_CATEGORY;
};

const simplify = (text) => {
  if (!text) return '';
  const firstSentence = text.split('. ')[0]?.trim() || text;
  return firstSentence.replace(/\s+/g, ' ').replace(/\.$/, '');
};

const createTechnical = (title, what, how) => {
  const base = simplify(what);
  const usage = simplify(how);
  return `In pratica, ${title} ti dice in modo immediato ${base.toLowerCase()}. È il riferimento rapido per i team Tradelia perché ${usage.toLowerCase()}.`;
};

const result = { ...existing };
const buckets = new Map();

// Processa tutti i termini dal glossario originale
for (const [key, value] of entries) {
  if (existingKeys.has(key)) continue; // Skip già esistenti
  
  const { category, tags } = assignCategory(key);
  const technical = createTechnical(value.title, value.what, value.how);
  const term = {
    title: value.title,
    what: value.what,
    technical,
    how: value.how,
    source: value.source,
    category,
    tags,
  };
  result[key] = term;
  const list = buckets.get(category) || [];
  list.push(key);
  buckets.set(category, list);
}

// Aggiungi related terms
for (const key of Object.keys(result)) {
  if (key.startsWith('_')) continue;
  const term = result[key];
  if (!term.relatedTerms) {
    const peers = (buckets.get(term.category) || []).filter((peer) => peer !== key).slice(0, 3);
    term.relatedTerms = peers;
  }
}

// Aggiorna metadata
result._v = '2025-01-27-tradelia-300';
const totalTerms = Object.keys(result).filter(k => !k.startsWith('_')).length;
result._note = `Batch di ${totalTerms} termini con categorie, tag e spiegazione tecnica semplificata.`;

// Salva
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
console.log(`✅ Generated ${totalTerms} terms at ${outputPath}`);

