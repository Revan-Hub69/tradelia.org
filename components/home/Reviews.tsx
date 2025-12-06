'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/use-translations';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
  useReducedMotion,
  createContainerVariants,
  createItemVariants,
} from '@/lib/animations';
// buildLocalePath removed - system always uses Italian

interface Review {
  id: string;
  user_name: string;
  user_role: string;
  rating: number;
  comment: string;
  created_at: string;
  verified: boolean;
}

export function Reviews() {
  const { t, locale } = useTranslations();
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = createContainerVariants(prefersReducedMotion);
  const itemVariants = createItemVariants(prefersReducedMotion);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadReviews() {
      try {
        // Carica recensioni pubbliche verificate - VISIBILI A TUTTI
        // Nota: 'public' è una parola riservata in PostgreSQL, ma funziona con Supabase
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('verified', true)
          .eq('public', true)
          .order('created_at', { ascending: false })
          .limit(10);

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
            setReviews([]);
          } else {
            // Altri errori (RLS, permessi, etc.)
            console.error('Error loading reviews:', error);
            setReviews([]);
          }
        } else {
          setReviews(data || []);
        }
      } catch (error: any) {
        // Gestisci errori di rete o altri errori
        console.error('Unexpected error loading reviews:', error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadReviews();
  }, []);

  // Auto-rotate reviews ogni 5 secondi
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  // Non mostrare se non ci sono recensioni
  if (isLoading || reviews.length === 0) {
    return null;
  }

  // Safety check: assicurati che currentReview esista
  if (!reviews[currentIndex]) {
    return null;
  }

  const currentReview = reviews[currentIndex];
  const nextReview = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prevReview = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  return (
    <section 
      className="relative py-16 md:py-24 bg-gradient-to-b from-bg-base via-bg-soft to-bg-base"
      aria-labelledby="reviews-title"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <motion.h2
            id="reviews-title"
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4"
          >
            {t('reviews.title') || 'Cosa Dicono i Nostri Utenti'}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-text-secondary max-w-2xl mx-auto mb-6"
          >
            {t('reviews.subtitle') || 'Recensioni verificate da utenti reali'}
          </motion.p>
          
          {/* Link alla pagina completa recensioni */}
          <motion.div variants={itemVariants}>
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>{t('reviews.viewAll') || 'Vedi tutte le recensioni'}</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="relative bg-bg-surface border border-border-subtle rounded-2xl p-8 md:p-12 shadow-lg">
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 opacity-10">
              <Quote className="w-16 h-16 text-accent" aria-hidden="true" />
            </div>

            {/* Review Content */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-6 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-5 h-5 transition-colors',
                      i < currentReview.rating
                        ? 'fill-accent text-accent'
                        : 'fill-transparent text-text-tertiary'
                    )}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-2 text-sm text-text-tertiary">
                  {currentReview.rating}/5
                </span>
              </div>

              {/* Comment */}
              <blockquote className="text-lg md:text-xl text-text-primary mb-8 leading-relaxed italic">
                {currentReview.comment ? `"${currentReview.comment}"` : ''}
              </blockquote>

              {/* User Info */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                    <span className="text-accent font-bold text-lg">
                      {currentReview.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-text-primary">
                      {currentReview.user_name}
                    </p>
                    <p className="text-sm text-text-tertiary capitalize">
                      {currentReview.user_role}
                    </p>
                  </div>
                </div>
                {currentReview.verified && (
                  <div className="flex items-center gap-1 text-accent text-sm">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span>{t('reviews.verified') || 'Verificato'}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Navigation */}
            {reviews.length > 1 && (
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                <button
                  onClick={prevReview}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center hover:bg-bg-hover hover:border-accent/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent min-w-[44px] min-h-[44px]"
                  aria-label={t('reviews.previous') || 'Recensione precedente'}
                >
                  <ChevronLeft className="w-5 h-5 text-text-primary" aria-hidden="true" />
                </button>
                <button
                  onClick={nextReview}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center hover:bg-bg-hover hover:border-accent/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent min-w-[44px] min-h-[44px]"
                  aria-label={t('reviews.next') || 'Recensione successiva'}
                >
                  <ChevronRight className="w-5 h-5 text-text-primary" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Dots Indicator */}
            {reviews.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent min-w-[44px] min-h-[44px] flex items-center justify-center',
                      index === currentIndex
                        ? 'bg-accent w-8'
                        : 'bg-text-tertiary hover:bg-text-secondary'
                    )}
                    aria-label={`${t('reviews.goToReview') || 'Vai alla recensione'} ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
