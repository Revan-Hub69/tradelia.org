'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n/use-translations';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { useUserRole } from '@/lib/hooks/useUserRole';

interface ReviewFormProps {
  onSuccess?: () => void;
}

export function ReviewForm({ onSuccess }: ReviewFormProps) {
  const { t } = useTranslations();
  const { role } = useUserRole();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (comment.length < 10) {
      setError(t('reviews.errors.commentTooShort') || 'Il commento deve essere di almeno 10 caratteri');
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError(t('reviews.errors.notLoggedIn') || 'Devi essere loggato per lasciare una recensione');
        setIsSubmitting(false);
        return;
      }

      // Ottieni nome utente dal profilo
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const userName = profile?.display_name || user.email?.split('@')[0] || 'Utente';

      const { error: insertError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          user_name: userName,
          user_role: role || 'trial',
          rating,
          comment: comment.trim(),
          verified: false, // Admin verificherà
          public: true,
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setComment('');
      setRating(5);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err: any) {
      setError(err.message || t('reviews.errors.submitError') || 'Errore durante l\'invio della recensione');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
        <p className="text-green-400 font-medium mb-2">
          {t('reviews.submitSuccess') || 'Recensione inviata! Verrà pubblicata dopo la verifica.'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-surface border border-border-subtle rounded-xl p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-3">
          {t('reviews.rating') || 'Voto'}
        </label>
        <div className="flex items-center gap-2">
          {[5, 4, 3, 2, 1].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center transition-all min-w-[44px] min-h-[44px]',
                rating >= value
                  ? 'bg-accent text-white'
                  : 'bg-bg-soft text-text-tertiary hover:bg-bg-elevated border border-border-subtle'
              )}
              aria-label={`${t('reviews.rate') || 'Vota'} ${value} ${value === 1 ? t('reviews.star') || 'stella' : t('reviews.stars') || 'stelle'}`}
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  rating >= value ? 'fill-white text-white' : 'fill-transparent'
                )}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-text-primary mb-2">
          {t('reviews.comment') || 'La tua recensione'}
        </label>
        <textarea
          id="comment"
          required
          minLength={10}
          maxLength={1000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 bg-bg-base border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          placeholder={t('reviews.commentPlaceholder') || 'Condividi la tua esperienza con Tradelia...'}
        />
        <p className="text-xs text-text-tertiary mt-1">
          {comment.length}/1000 {t('reviews.characters') || 'caratteri'} (min. 10)
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || comment.length < 10}
        className="w-full"
      >
        {isSubmitting ? (
          t('common.sending') || 'Invio...'
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('reviews.submit') || 'Invia Recensione'}
          </>
        )}
      </Button>

      <p className="text-xs text-text-tertiary text-center">
        {t('reviews.verificationNote') || 'La tua recensione sarà pubblicata dopo la verifica da parte del team.'}
      </p>
    </form>
  );
}
