'use client';

import { useState, useEffect } from 'react';
import { TooltipGlossary } from './TooltipGlossary';
import { processTextWithGlossary, type TextSegment } from '@/lib/glossary/text-processor';
import type { GlossaryTerm } from '@/lib/glossary/terms';

interface GlossaryTextProps {
  children: string;
  className?: string;
  iconSize?: number;
  enableGlossary?: boolean;
}

/**
 * GlossaryText Component
 * Processa automaticamente il testo e trova termini del glossario
 * Aggiunge tooltip discreti con icona (?) per ogni termine trovato
 */
export function GlossaryText({
  children,
  className = '',
  iconSize = 10,
  enableGlossary = true,
}: GlossaryTextProps) {
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enableGlossary || !children) {
      setSegments([{ type: 'text', content: children }]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    processTextWithGlossary(children)
      .then((processedSegments) => {
        setSegments(processedSegments);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error processing glossary text:', error);
        setSegments([{ type: 'text', content: children }]);
        setIsLoading(false);
      });
  }, [children, enableGlossary]);

  if (isLoading) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={index}>{segment.content}</span>;
        }

        if (segment.type === 'term' && segment.term) {
          return (
            <TooltipGlossary
              key={index}
              term={segment.term}
              iconSize={iconSize}
            >
              <span className="text-text-primary">{segment.content}</span>
            </TooltipGlossary>
          );
        }

        return <span key={index}>{segment.content}</span>;
      })}
    </span>
  );
}

