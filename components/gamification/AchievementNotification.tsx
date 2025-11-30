'use client';

import { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from '@/lib/i18n/use-translations';
import { cn } from '@/lib/utils/cn';
import { useBodyScrollLock } from '@/lib/hooks/useBodyScrollLock';

interface AchievementNotificationProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon_type?: string;
  };
  onClose: () => void;
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const { t } = useTranslations();
  const [isVisible, setIsVisible] = useState(true);

  useBodyScrollLock(isVisible);

  useEffect(() => {
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label={t('gamification.achievement.unlocked') || 'Achievement sbloccato'}
          >
            <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/40 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-soft/50 hover:bg-bg-soft text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center z-10"
                aria-label={t('common.close') || 'Chiudi'}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg"
                >
                  <Award className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-text-primary mb-2"
                >
                  {t('gamification.achievement.unlocked') || 'Achievement Sbloccato!'}
                </motion.h3>

                {/* Achievement Name */}
                <motion.h4
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-semibold text-amber-400 mb-2"
                >
                  {achievement.title}
                </motion.h4>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-text-secondary mb-6"
                >
                  {achievement.description}
                </motion.p>

                {/* Confetti effect (optional) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center gap-2"
                >
                  {['🎉', '⭐', '🏆'].map((emoji, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.7 + i * 0.1, type: 'spring' }}
                      className="text-2xl"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

