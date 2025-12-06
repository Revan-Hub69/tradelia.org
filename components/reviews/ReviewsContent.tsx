'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Filter, X, Plus } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { InternalLinks } from '@/components/seo/InternalLinks';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
} from '@/lib/animations';
// buildLocalePath removed - system always uses Italian
import Link from 'next/link';

interface Review {
  id: string;
  user_name: string;
  user_role: string;
  rating: number;
  comment: string;
  created_at: string;
  verified: boolean;
}

export function ReviewsContent() {
  const { t, locale } = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuthAndLoadReviews() {
      try {
        // Verifica se utente è loggato (per mostrare form commento)
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);

        // Carica tutte le recensioni pubbliche verificate - VISIBILI A TUTTI
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('verified', true)
          .eq('public', true)
          .order('created_at', { ascending: false });

        if (error) {
          // Gestisci errori in modo informativo
          if (error.code === 'PGRST116' || error.code === 'PGRST301' || 
              error.message?.includes('404') || 
              error.message?.includes('relation') || 
              error.message?.includes('does not exist')) {
            // Tabella non esiste - migration non eseguita
            console.warn(
              'Reviews table not found. Please run migration 012_reviews_table.sql in Supabase.',
              error
            );
          } else {
            // Altri errori (RLS, permessi, etc.)
            console.error('Error loading reviews:', error);
          }
          setReviews([]);
        } else {
          setReviews(data || []);
        }
      } catch (error) {
        console.error('Unexpected error loading reviews:', error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthAndLoadReviews();

    // Ascolta cambiamenti autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndLoadReviews();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredReviews = selectedRating
    ? reviews.filter(r => r.rating === selectedRating)
    : reviews;

  // Calcola statistiche
  const stats = {
    total: reviews.length,
    average: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    byRating: [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
    })),
  };

  const localePrefix = '';

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4"
            >
              {t('reviews.title') || 'Cosa Dicono i Nostri Utenti'}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg text-text-secondary max-w-2xl mx-auto mb-8"
            >
              {t('reviews.subtitle') || 'Recensioni verificate da utenti reali'}
            </motion.p>

            {/* Stats */}
            {!isLoading && reviews.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center gap-8 mb-8"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-primary">
                    {stats.average}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i < Math.round(parseFloat(stats.average))
                            ? 'fill-accent text-accent'
                            : 'fill-transparent text-text-tertiary'
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-text-tertiary mt-1">
                    {t('reviews.averageRating') || 'Media voti'}
                  </p>
                </div>
                <div className="h-12 w-px bg-border-subtle" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-text-primary">
                    {stats.total}
                  </div>
                  <p className="text-sm text-text-tertiary mt-1">
                    {t('reviews.totalReviews') || 'Recensioni totali'}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Filters */}
          {!isLoading && reviews.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="mb-8 flex flex-wrap items-center gap-4 justify-center"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-text-tertiary" aria-hidden="true" />
                <span className="text-sm font-medium text-text-secondary">
                  {t('reviews.filterByRating') || 'Filtra per voto:'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedRating(null)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] min-h-[44px]',
                    selectedRating === null
                      ? 'bg-accent text-white'
                      : 'bg-bg-surface text-text-secondary hover:bg-bg-soft border border-border-subtle'
                  )}
                >
                  {t('reviews.all') || 'Tutte'}
                </button>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.byRating.find(r => r.rating === rating)?.count || 0;
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 min-w-[44px] min-h-[44px]',
                        selectedRating === rating
                          ? 'bg-accent text-white'
                          : 'bg-bg-surface text-text-secondary hover:bg-bg-soft border border-border-subtle'
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {[...Array(rating)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3 h-3',
                              'fill-accent text-accent'
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span>({count})</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Reviews Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">{t('reviews.loading') || 'Caricamento recensioni...'}</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-bg-surface rounded-xl border border-border-subtle">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-text-tertiary opacity-50" />
              <p className="text-base font-semibold text-text-secondary mb-1">
                {selectedRating
                  ? t('reviews.noReviewsForRating') || 'Nessuna recensione con questo voto'
                  : t('reviews.noReviews') || 'Nessuna recensione disponibile'}
              </p>
              {selectedRating && (
                <button
                  onClick={() => setSelectedRating(null)}
                  className="mt-3 text-sm text-accent hover:text-accent-hover underline"
                >
                  {t('reviews.showAll') || 'Mostra tutte le recensioni'}
                </button>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  className="bg-bg-surface border border-border-subtle rounded-xl p-6 hover:border-accent/40 hover:shadow-lg transition-all"
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4 transition-colors',
                          i < review.rating
                            ? 'fill-accent text-accent'
                            : 'fill-transparent text-text-tertiary'
                        )}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-2 text-sm text-text-tertiary">
                      {review.rating}/5
                    </span>
                    {review.verified && (
                      <span className="ml-auto flex items-center gap-1 text-xs text-accent">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {t('reviews.verified') || 'Verificato'}
                      </span>
                    )}
                  </div>

                  {/* Comment */}
                  <blockquote className="text-base text-text-primary mb-4 leading-relaxed line-clamp-4">
                    "{review.comment}"
                  </blockquote>

                  {/* User Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border-subtle">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-accent font-bold text-sm">
                        {review.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-primary text-sm truncate">
                        {review.user_name}
                      </p>
                      <p className="text-xs text-text-tertiary capitalize">
                        {review.user_role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* CTA per lasciare recensione */}
          <motion.div
            variants={itemVariants}
            className="mt-12 text-center"
          >
            {isLoggedIn ? (
              <Button asChild size="lg" variant="default">
                <Link href="/reviews/new">
                  <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                  {t('reviews.writeReview') || 'Scrivi una Recensione'}
                </Link>
              </Button>
            ) : (
              <div className="bg-bg-surface border border-border-subtle rounded-xl p-8">
                <p className="text-text-secondary mb-4">
                  {t('reviews.loginToReview') || 'Accedi per lasciare una recensione'}
                </p>
                <Button asChild>
                  <Link href="/login?redirect=/reviews/new">
                    {t('auth.mode.login') || 'Accedi'}
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>

          {/* Share Buttons */}
          <motion.div variants={itemVariants} className="mt-12 flex justify-center">
            <ShareButtons 
              variant="compact"
              title={t('reviews.title')}
              description={t('reviews.subtitle')}
            />
          </motion.div>
          
          {/* Internal Links per SEO */}
          <InternalLinks />
        </div>
      </div>
    </div>
  );
}
