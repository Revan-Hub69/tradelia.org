'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n/use-translations';
import { useIsPro } from '@/lib/hooks/useUserRole';
import { useApi } from '@/lib/hooks/useApi';
import { LoadingState } from '@/components/dashboard/LoadingState';
import { ErrorState } from '@/components/dashboard/ErrorState';
import { TrendingUp, TrendingDown, Users, Calendar, Vote, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import { it as itLocale, enUS as enLocale } from 'date-fns/locale';

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
  created_by?: string;
}

interface ProposalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId?: string;
  onVoteSuccess?: () => void;
}

/**
 * Proposal Detail Modal
 * Mostra dettaglio completo della proposta con votazione inline
 */
export function ProposalDetailModal({
  isOpen,
  onClose,
  proposalId,
  onVoteSuccess,
}: ProposalDetailModalProps) {
  const { t, locale } = useTranslations();
  const isPro = useIsPro();
  const [voting, setVoting] = useState(false);

  const { data: proposal, loading, error, retry, refetch } = useApi<AssetProposal>(
    proposalId ? `/api/dashboard/voting/${proposalId}` : null,
    {
      cacheTime: 2 * 60 * 1000,
      enabled: isOpen && !!proposalId,
    }
  );

  const dateLocale = locale === 'it' ? itLocale : enLocale;

  const getStatusIcon = (status: AssetProposal['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="w-5 h-5 text-green-400" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusLabel = (status: AssetProposal['status']) => {
    switch (status) {
      case 'open':
        return t('dashboard.voting.status.open') || 'Aperta';
      case 'closed':
        return t('dashboard.voting.status.closed') || 'Chiusa';
      case 'approved':
        return t('dashboard.voting.status.approved') || 'Approvata';
    }
  };

  const handleVote = async (vote: 'up' | 'down') => {
    if (!proposal || !isPro) {
      toast.error(t('dashboard.voting.proRequired') || 'Account Pro richiesto per votare');
      return;
    }

    if (proposal.status !== 'open') {
      toast.error(t('dashboard.voting.votingClosed') || 'La votazione è chiusa');
      return;
    }

    setVoting(true);
    try {
      const response = await fetch('/api/dashboard/voting/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposal_id: proposal.id,
          vote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante il voto');
      }

      toast.success(t('dashboard.voting.voteSuccess') || 'Voto registrato con successo');
      refetch();
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error(error instanceof Error ? error.message : t('dashboard.voting.voteError') || 'Errore durante il voto');
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = proposal ? proposal.votes_up + proposal.votes_down : 0;
  const approvalRate = totalVotes > 0 ? (proposal?.votes_up || 0) / totalVotes * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dashboard.voting.detailTitle') || 'Dettaglio Proposta'}
      size="lg"
    >
      {loading && (
        <div className="py-8">
          <LoadingState message={t('dashboard.voting.loading') || 'Caricamento proposta...'} />
        </div>
      )}

      {error && (
        <div className="py-8">
          <ErrorState
            title={t('dashboard.voting.errorTitle') || 'Errore'}
            message={t('dashboard.voting.errorMessage') || 'Impossibile caricare la proposta'}
            onRetry={retry}
          />
        </div>
      )}

      {proposal && !loading && !error && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-border-subtle pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-text-primary">
                    {proposal.asset_name || proposal.asset_symbol}
                  </h2>
                  <span className="px-3 py-1 bg-bg-surface border border-border-subtle rounded-lg text-sm text-text-tertiary font-mono">
                    {proposal.asset_symbol}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    proposal.status === 'open' ? 'bg-green-500/20 text-green-400' :
                    proposal.status === 'closed' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {getStatusLabel(proposal.status)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(proposal.status)}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {t('dashboard.voting.created') || 'Creata'}: {formatDistanceToNow(new Date(proposal.created_at), {
                    addSuffix: true,
                    locale: dateLocale,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {proposal.description && (
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                {t('dashboard.voting.description') || 'Descrizione'}
              </h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {proposal.description}
              </p>
            </div>
          )}

          {/* Voting Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-text-primary">{proposal.votes_up}</span>
              </div>
              <p className="text-xs text-text-tertiary">
                {t('dashboard.voting.votesUp') || 'Favorevoli'}
              </p>
            </div>
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-2xl font-bold text-text-primary">{proposal.votes_down}</span>
              </div>
              <p className="text-xs text-text-tertiary">
                {t('dashboard.voting.votesDown') || 'Contrari'}
              </p>
            </div>
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-text-tertiary" />
                <span className="text-2xl font-bold text-text-primary">{totalVotes}</span>
              </div>
              <p className="text-xs text-text-tertiary">
                {t('dashboard.voting.totalVotes') || 'Totale'}
              </p>
            </div>
          </div>

          {/* Approval Rate */}
          {totalVotes > 0 && (
            <div className="bg-bg-soft border border-border-subtle rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-primary">
                  {t('dashboard.voting.approvalRate') || 'Tasso di Approvazione'}
                </span>
                <span className="text-sm font-bold text-text-primary">
                  {approvalRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-bg-base rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-400 h-full transition-all duration-300"
                  style={{ width: `${approvalRate}%` }}
                  role="progressbar"
                  aria-valuenow={approvalRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}

          {/* Voting Actions */}
          {proposal.status === 'open' && (
            <div className="border-t border-border-subtle pt-4">
              {isPro ? (
                <div className="flex items-center gap-3">
                  <Button
                    variant={proposal.user_vote === 'up' ? 'default' : 'outline'}
                    onClick={() => handleVote('up')}
                    disabled={voting || proposal.user_vote === 'up'}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    {proposal.user_vote === 'up' 
                      ? t('dashboard.voting.votedUp') || 'Hai votato Favorevole'
                      : t('dashboard.voting.voteUp') || 'Vota Favorevole'}
                  </Button>
                  <Button
                    variant={proposal.user_vote === 'down' ? 'default' : 'outline'}
                    onClick={() => handleVote('down')}
                    disabled={voting || proposal.user_vote === 'down'}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <TrendingDown className="w-4 h-4" />
                    {proposal.user_vote === 'down'
                      ? t('dashboard.voting.votedDown') || 'Hai votato Contrario'
                      : t('dashboard.voting.voteDown') || 'Vota Contrario'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg inline-block">
                    <p className="text-sm text-amber-300">
                      {t('dashboard.voting.proRequiredToVote') || 'Account Pro richiesto per votare'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {proposal.status !== 'open' && (
            <div className="text-center py-4">
              <p className="text-sm text-text-tertiary">
                {proposal.status === 'closed'
                  ? t('dashboard.voting.votingClosed') || 'La votazione è chiusa'
                  : t('dashboard.voting.proposalApproved') || 'Proposta approvata'}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

