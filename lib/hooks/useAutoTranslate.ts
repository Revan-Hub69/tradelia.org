'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n/use-translations';

interface TranslationCache {
  [key: string]: {
    translated: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const translationCache: TranslationCache = {};

export function useAutoTranslate(text: string | null | undefined, enabled: boolean = true): string {
  const { locale } = useTranslations();
  const [translated, setTranslated] = useState<string>(text || '');
  const [isTranslating, setIsTranslating] = useState(false);

  const cacheKey = text ? `${locale}-${text.substring(0, 100)}` : '';

  useEffect(() => {
    if (!text || !enabled || locale === 'en') {
      setTranslated(text || '');
      return;
    }

    // Check cache first
    const cached = translationCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setTranslated(cached.translated);
      return;
    }

    // Simple heuristic: if text contains Italian characters, assume it's already Italian
    if (text.match(/[àèéìíîòóùú]/)) {
      setTranslated(text);
      return;
    }

    // If text looks like English and we need Italian, translate
    if (locale === 'it' && /^[a-zA-Z\s.,!?;:'"()\[\]{}\-]+$/.test(text) && text.length > 10) {
      setIsTranslating(true);
      
      fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLocale: locale,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.translated) {
            const translatedText = data.translated;
            setTranslated(translatedText);
            // Cache the translation
            translationCache[cacheKey] = {
              translated: translatedText,
              timestamp: Date.now(),
            };
          } else {
            setTranslated(text);
          }
        })
        .catch(error => {
          console.error('Translation error:', error);
          setTranslated(text);
        })
        .finally(() => {
          setIsTranslating(false);
        });
    } else {
      setTranslated(text);
    }
  }, [text, locale, enabled, cacheKey]);

  return translated;
}

export function useAutoTranslateArray(
  texts: Array<string | null | undefined>,
  enabled: boolean = true
): string[] {
  const { locale } = useTranslations();
  const [translated, setTranslated] = useState<string[]>(texts.map(t => t || ''));
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!enabled || locale === 'en' || texts.length === 0) {
      setTranslated(texts.map(t => t || ''));
      return;
    }

    // Translate all texts that need translation
    const translatePromises = texts.map((text, index) => {
      if (!text) return Promise.resolve({ index, translated: '' });

      const cacheKey = `${locale}-${text.substring(0, 100)}`;
      const cached = translationCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return Promise.resolve({ index, translated: cached.translated });
      }

      if (text.match(/[àèéìíîòóùú]/)) {
        return Promise.resolve({ index, translated: text });
      }

      if (locale === 'it' && /^[a-zA-Z\s.,!?;:'"()\[\]{}\-]+$/.test(text) && text.length > 10) {
        return fetch('/api/ai/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            targetLocale: locale,
          }),
        })
          .then(res => res.json())
          .then(data => {
            const translatedText = data.success && data.translated ? data.translated : text;
            translationCache[cacheKey] = {
              translated: translatedText,
              timestamp: Date.now(),
            };
            return { index, translated: translatedText };
          })
          .catch(() => ({ index, translated: text }));
      }

      return Promise.resolve({ index, translated: text });
    });

    setIsTranslating(true);
    Promise.all(translatePromises)
      .then(results => {
        const newTranslated = [...translated];
        results.forEach(({ index, translated: t }) => {
          newTranslated[index] = t;
        });
        setTranslated(newTranslated);
      })
      .finally(() => {
        setIsTranslating(false);
      });
  }, [texts, locale, enabled]);

  return translated;
}
