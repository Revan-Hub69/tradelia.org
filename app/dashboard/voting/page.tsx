'use client';

import { useState, useEffect } from 'react';
import { Vote, Search, TrendingUp, TrendingDown, Users, Eye } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { ProposalDetailModal } from '@/components/dashboard/modals/ProposalDetailModal';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

interface AssetProposal {
  id: string;
  asset_symbol: string;
  asset_name: string;
  description: string | null;
  votes_up: number;
  votes_down: number;
  status: 'open' | 'closed' | 'approved';
  created_at: string;
  user_vote?: 'up' | 'down' | null;
}

/**
 * Voting Page
 * Votazione asset per analisi community
 * PRO: Proporre e votare asset
 * BASE: Solo visualizzazione
 */
export default function VotingPage() {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const { data: proposalsData, loading, error, retry, mutate } = useApi<AssetProposal[]>(
    '/api/dashboard/voting',
    {
      cacheTime: 1 * 60 * 1000, // 1 minute
    }
  );

  // Listen for refresh event
  useEffect(() => {
    const handleRefresh = () => {
      mutate();
    };

    window.addEventListener('refresh-voting', handleRefresh);
    return () => {
      window.removeEventListener('refresh-voting', handleRefresh);
    };
  }, [mutate]);

  const handleVote = async (proposalId: string, vote: 'up' | 'down') => {
    if (!isPro) {
      toast.error(t('dashboard.voting.proRequired') || 'Account Pro richiesto per votare');
      return;
    }

    try {
      const response = await fetch('/api/dashboard/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: proposalId,
          vote,
        }),
      });

      if (!response.ok) {
        throw new Error('Errore durante il voto');
      }

      toast.success(t('dashboard.voting.voteSuccess') || 'Voto registrato con successo');
      retry();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(t('dashboard.voting.voteError') || 'Errore durante il voto');
    }
  };

  const filteredProposals = proposalsData?.filter((proposal) =>
    searchQuery === '' ||
    proposal.asset_symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proposal.asset_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingState message={t('dashboard.voting.loading') || 'Caricamento proposte...'} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <ErrorState
          title={t('dashboard.voting.errorTitle') || 'Errore'}
          message={t('dashboard.voting.errorMessage') || 'Impossibile caricare le proposte'}
          onRetry={retry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
            <Vote className="w-8 h-8 text-accent" />
            {t('dashboard.voting.title') || 'Votazione Asset'}
          </h1>
          <p className="text-text-secondary">
            {t('dashboard.voting.description') || 'Vota gli asset che vorresti vedere analizzati dalla community'}
          </p>
        </div>
        {isPro && (
          <Button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-propose-asset-modal'));
            }}
            className="flex items-center gap-2"
          >
            <Vote className="w-4 h-4" />
            {t('dashboard.voting.propose') || 'Proponi Asset'}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('dashboard.voting.search') || 'Cerca asset...'}
            className="w-full pl-10 pr-4 py-2 bg-bg-soft border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <EmptyState
          icon={<Vote className="w-12 h-12" />}
          title={t('dashboard.voting.empty') || 'Nessuna proposta trovata'}
          description={t('dashboard.voting.emptyDesc') || 'Non ci sono proposte di asset al momento'}
        />
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-bg-soft border border-border-subtle rounded-xl p-6 hover:border-accent/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary text-lg">
                      {proposal.asset_name || proposal.asset_symbol}
                    </h3>
                    <span className="px-2 py-1 bg-bg-surface border border-border-subtle rounded text-xs text-text-tertiary font-mono">
                      {proposal.asset_symbol}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      proposal.status === 'open' ? 'bg-green-500/20 text-green-400' :
                      proposal.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {proposal.status === 'open' ? t('dashboard.voting.status.open') || 'Aperta' :
                       proposal.status === 'closed' ? t('dashboard.voting.status.closed') || 'Chiusa' :
                       t('dashboard.voting.status.approved') || 'Approvata'}
                    </span>
                  </div>
                  {proposal.description && (
                    <p className="text-sm text-text-secondary mb-3">{proposal.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-text-primary">{proposal.votes_up}</span>
                    <span className="text-xs text-text-tertiary">
                      {t('dashboard.voting.votesUp') || 'favorevoli'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-text-primary">{proposal.votes_down}</span>
                    <span className="text-xs text-text-tertiary">
                      {t('dashboard.voting.votesDown') || 'contrari'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">
                      {proposal.votes_up + proposal.votes_down} {t('dashboard.voting.totalVotes') || 'voti totali'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedProposalId(proposal.id);
                      setDetailModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-accent hover:text-accent-hover transition-colors text-sm"
                    aria-label={t('dashboard.voting.viewDetail') || 'Visualizza dettaglio'}
                  >
                    <Eye className="w-4 h-4" />
                    {t('dashboard.voting.viewDetail') || 'Dettaglio'}
                  </button>
                  {isPro && proposal.status === 'open' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote(proposal.id, 'up')}
                        disabled={proposal.user_vote === 'up'}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          proposal.user_vote === 'up'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                            : 'bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-green-500/40'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        {t('dashboard.voting.voteUp') || 'Favorevole'}
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'down')}
                        disabled={proposal.user_vote === 'down'}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          proposal.user_vote === 'down'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-bg-surface border border-border-subtle text-text-secondary hover:text-text-primary hover:border-red-500/40'
                        }`}
                      >
                        <TrendingDown className="w-4 h-4 inline mr-1" />
                        {t('dashboard.voting.voteDown') || 'Contrario'}
                      </button>
                    </div>
                  )}
                  {!isPro && (
                    <div className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded text-xs text-amber-300">
                      {t('dashboard.voting.proRequired') || 'Pro richiesto'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proposal Detail Modal */}
      <ProposalDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedProposalId(null);
        }}
        proposalId={selectedProposalId || undefined}
        onVoteSuccess={() => {
          mutate();
        }}
      />
    </div>
  );
}

