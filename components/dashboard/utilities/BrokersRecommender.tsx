'use client';

import { useState } from 'react';
import { Building2, Star, Shield, ExternalLink, Info, TrendingUp, DollarSign, Globe, CheckCircle2, X } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Broker {
  id: string;
  name: string;
  logo: string;
  description: string;
  regulatory: string[];
  instruments: string[];
  minDeposit: number | string;
  taxRegime: 'amministrato' | 'dichiarativo' | 'both';
  rating: number;
  score?: number;
  officialLinks?: {
    website?: string;
  };
  costs?: {
    commissionStocks?: string;
    spreadForex?: string;
  };
  fundProtection?: {
    scheme: string;
    amount: string;
  };
}

const availableBrokers: Broker[] = [
  {
    id: 'ibkr',
    name: 'Interactive Brokers',
    logo: '/logos/tradelia-logo.svg',
    description: 'Accesso DMA a 160+ mercati globali.',
    regulatory: ['SEC', 'CFTC', 'FCA', 'CSSF', 'ASIC'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex'],
    minDeposit: 0,
    taxRegime: 'dichiarativo',
    rating: 4.8,
    score: 95,
    officialLinks: { website: 'https://www.interactivebrokers.com' },
    costs: { commissionStocks: '$0.005 per azione (min $1)' },
    fundProtection: { scheme: 'SIPC', amount: '$500,000' }
  },
  {
    id: 'bgsaxo',
    name: 'BG Saxo',
    logo: '/logos/tradelia-logo.svg',
    description: 'Regime amministrato italiano con piattaforme professionali.',
    regulatory: ['Consob', 'Banca d\'Italia'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex', 'CFD'],
    minDeposit: 0,
    taxRegime: 'amministrato',
    rating: 4.5,
    score: 90,
    officialLinks: { website: 'https://www.saxobank.com/it' },
    costs: { commissionStocks: '0.1% (min €3)' },
    fundProtection: { scheme: 'Fondo Interbancario', amount: '€100,000' }
  },
  {
    id: 'directa',
    name: 'Directa SIM',
    logo: '/logos/tradelia-logo.svg',
    description: 'Broker italiano con focus su Borsa Italiana.',
    regulatory: ['Consob', 'Banca d\'Italia'],
    instruments: ['Azioni', 'ETF', 'Bond', 'IDEM'],
    minDeposit: 0,
    taxRegime: 'amministrato',
    rating: 4.2,
    score: 84,
    officialLinks: { website: 'https://www.directa.it' },
    costs: { commissionStocks: '0.19% (min €2.95)' },
    fundProtection: { scheme: 'Fondo Interbancario', amount: '€100,000' }
  },
  {
    id: 'exante',
    name: 'Exante',
    logo: '/logos/exante.svg',
    description: 'Intermediario multi-mercato con accesso DMA.',
    regulatory: ['MFSA', 'CySEC', 'FCA'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex', 'CFD'],
    minDeposit: 10000,
    taxRegime: 'both',
    rating: 4.4,
    score: 88,
    officialLinks: { website: 'https://exante.eu' },
    costs: { commissionStocks: '0.1% (min €1)' },
    fundProtection: { scheme: 'ICF', amount: '€20,000' }
  },
  {
    id: 'mexem',
    name: 'MEXEM',
    logo: '/logos/tradelia-logo.svg',
    description: 'Introducing broker su infrastruttura IBKR.',
    regulatory: ['CySEC', 'FCA'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Opzioni', 'Futures', 'Forex'],
    minDeposit: 0,
    taxRegime: 'dichiarativo',
    rating: 4.3,
    score: 86,
    officialLinks: { website: 'https://www.mexem.com' },
    costs: { commissionStocks: '$0.005 per azione (min $1)' },
    fundProtection: { scheme: 'ICF', amount: '€20,000' }
  },
  {
    id: 'freedom24',
    name: 'Freedom24',
    logo: '/logos/freedom24.svg',
    description: 'Focalizzata su IPO statunitensi ed europee.',
    regulatory: ['CySEC', 'CONSOB'],
    instruments: ['Azioni', 'ETF', 'Bond', 'IPO'],
    minDeposit: 10,
    taxRegime: 'amministrato',
    rating: 4.3,
    score: 85,
    officialLinks: { website: 'https://www.freedom24.com' },
    costs: { commissionStocks: '€0.99 per ordine' },
    fundProtection: { scheme: 'ICF', amount: '€20,000' }
  },
  {
    id: 'scalable',
    name: 'Scalable Capital',
    logo: '/logos/tradelia-logo.svg',
    description: 'Piattaforma europea focalizzata su ETF e PAC.',
    regulatory: ['BaFin', 'CONSOB'],
    instruments: ['ETF', 'Azioni', 'PAC', 'Bond'],
    minDeposit: 1,
    taxRegime: 'dichiarativo',
    rating: 4.2,
    score: 83,
    officialLinks: { website: 'https://www.scalable.capital' },
    costs: { commissionStocks: '€0.99 per ordine' },
    fundProtection: { scheme: 'Einlagensicherungsfonds', amount: '€100,000' }
  },
  {
    id: 'traderepublic',
    name: 'Trade Republic',
    logo: '/logos/tradelia-logo.svg',
    description: 'Banca d\'investimento con IBAN italiano.',
    regulatory: ['BaFin', 'Banca d\'Italia'],
    instruments: ['Azioni', 'ETF', 'Bond', 'Crypto spot'],
    minDeposit: 1,
    taxRegime: 'amministrato',
    rating: 4.4,
    score: 88,
    officialLinks: { website: 'https://www.traderepublic.com' },
    costs: { commissionStocks: '€1 per ordine' },
    fundProtection: { scheme: 'Einlagensicherungsfonds', amount: '€100,000' }
  },
  {
    id: 'pepperstone',
    name: 'Pepperstone',
    logo: '/logos/pepperstone.svg',
    description: 'Broker CFD con spread competitivi.',
    regulatory: ['ASIC', 'FCA', 'DFSA', 'SCB'],
    instruments: ['Forex', 'CFD', 'Indici', 'Commodities', 'Crypto'],
    minDeposit: 200,
    taxRegime: 'dichiarativo',
    rating: 4.6,
    score: 89,
    officialLinks: { website: 'https://www.pepperstone.com' },
    costs: { spreadForex: 'Da 0.0 pip (Raw)' },
    fundProtection: { scheme: 'FSCS', amount: '£85,000' }
  },
  {
    id: 'etoro',
    name: 'eToro',
    logo: '/logos/etoro.svg',
    description: 'Piattaforma social trading.',
    regulatory: ['CySEC', 'FCA', 'ASIC'],
    instruments: ['Azioni', 'ETF', 'Crypto', 'CFD', 'Forex'],
    minDeposit: 50,
    taxRegime: 'dichiarativo',
    rating: 4.3,
    score: 85,
    officialLinks: { website: 'https://www.etoro.com' },
    costs: { commissionStocks: '0% su azioni reali' },
    fundProtection: { scheme: 'ICF', amount: '€20,000' }
  },
  {
    id: 'ig',
    name: 'IG Markets',
    logo: '/logos/tradelia-logo.svg',
    description: 'Broker CFD con accesso a 17,000+ mercati.',
    regulatory: ['FCA', 'ASIC', 'FMA', 'FSCA'],
    instruments: ['Forex', 'CFD', 'Indici', 'Commodities', 'Crypto', 'Azioni', 'ETF'],
    minDeposit: 0,
    taxRegime: 'dichiarativo',
    rating: 4.7,
    score: 91,
    officialLinks: { website: 'https://www.ig.com' },
    costs: { spreadForex: 'Da 0.6 pip' },
    fundProtection: { scheme: 'FSCS', amount: '£85,000' }
  },
];

export function BrokersRecommender() {
  const { t } = useTranslations();
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'name'>('score');

  const sortedBrokers = [...availableBrokers].sort((a, b) => {
    if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      {/* Header Semplice */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Broker Disponibili</h2>
        <p className="text-text-secondary">
          Confronto accademico dei principali broker regolamentati. Verifica sempre i dati ufficiali.
        </p>
      </div>

      {/* Nota Verifica */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-text-primary mb-1">Verifica Dati Ufficiali</p>
            <p className="text-sm text-text-secondary">
              Le informazioni sono indicative. <strong>Verifica sempre le condizioni aggiornate sui siti ufficiali</strong> prima di aprire un conto.
            </p>
          </div>
        </div>
      </div>

      {/* Filtro Semplice */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-text-secondary">Ordina per:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'score' | 'rating' | 'name')}
          className="px-4 py-2 bg-bg-surface border border-border-subtle rounded-lg text-text-primary"
        >
          <option value="score">Score Tradelia</option>
          <option value="rating">Rating</option>
          <option value="name">Nome</option>
        </select>
      </div>

      {/* Tabella Accademica Semplice */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-soft border-b border-border-subtle">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Broker</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Regolamentazione</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Strumenti</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Deposito Min.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Regime</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">Score</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-text-primary">Dettagli</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {sortedBrokers.map((broker) => (
                <tr key={broker.id} className="hover:bg-bg-soft transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white p-2 flex items-center justify-center border border-border-subtle">
                        <Image
                          src={broker.logo}
                          alt={broker.name}
                          width={40}
                          height={40}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary">{broker.name}</div>
                        <div className="text-xs text-text-tertiary mt-1">{broker.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {broker.regulatory.slice(0, 2).map((reg) => (
                        <span key={reg} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          {reg}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-text-secondary">
                      {broker.instruments.slice(0, 3).join(', ')}
                      {broker.instruments.length > 3 && ` +${broker.instruments.length - 3}`}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-text-secondary">
                      {typeof broker.minDeposit === 'number' 
                        ? broker.minDeposit === 0 ? 'Nessuno' : `€${broker.minDeposit}`
                        : broker.minDeposit}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      broker.taxRegime === 'amministrato' ? 'bg-blue-500/20 text-blue-400' :
                      broker.taxRegime === 'dichiarativo' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    )}>
                      {broker.taxRegime === 'amministrato' ? 'Amministrato' :
                       broker.taxRegime === 'dichiarativo' ? 'Dichiarativo' : 'Entrambi'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-text-primary">{broker.rating}</span>
                      {broker.score && (
                        <span className="text-xs text-text-tertiary ml-2">({broker.score})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setSelectedBroker(broker)}
                      className="px-3 py-1.5 bg-bg-soft hover:bg-bg-elevated text-text-primary rounded-lg text-sm font-medium transition-colors"
                    >
                      Dettagli
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Semplice */}
      <AnimatePresence>
        {selectedBroker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBroker(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-bg-surface border border-border-subtle rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-bg-soft p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white p-3 border border-border-subtle">
                    <Image
                      src={selectedBroker.logo}
                      alt={selectedBroker.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">{selectedBroker.name}</h3>
                    <p className="text-sm text-text-secondary">{selectedBroker.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBroker(null)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Regolamentazione</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBroker.regulatory.map((reg) => (
                        <span key={reg} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                          {reg}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Strumenti</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBroker.instruments.map((inst) => (
                        <span key={inst} className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm">
                          {inst}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedBroker.costs && (
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Costi</h4>
                    <div className="bg-bg-soft rounded-lg p-4 space-y-2">
                      {selectedBroker.costs.commissionStocks && (
                        <div className="flex justify-between">
                          <span className="text-sm text-text-tertiary">Commissioni Azioni:</span>
                          <span className="text-sm font-semibold text-text-primary">{selectedBroker.costs.commissionStocks}</span>
                        </div>
                      )}
                      {selectedBroker.costs.spreadForex && (
                        <div className="flex justify-between">
                          <span className="text-sm text-text-tertiary">Spread Forex:</span>
                          <span className="text-sm font-semibold text-text-primary">{selectedBroker.costs.spreadForex}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedBroker.fundProtection && (
                  <div>
                    <h4 className="font-semibold text-text-primary mb-2">Protezione Fondi</h4>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <p className="text-sm text-text-secondary">
                        <strong>{selectedBroker.fundProtection.scheme}</strong>: {selectedBroker.fundProtection.amount}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBroker.officialLinks?.website && (
                  <div>
                    <a
                      href={selectedBroker.officialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors"
                    >
                      Visita Sito Ufficiale
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
