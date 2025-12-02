/**
 * useGlossaryText Hook
 * Hook per processare testo e trovare automaticamente termini del glossario
 */

import { useState, useEffect } from "react";
import { processTextWithGlossary, type TextSegment } from "@/lib/glossary/text-processor";

interface UseGlossaryTextOptions {
  enabled?: boolean;
}

interface UseGlossaryTextResult {
  segments: TextSegment[];
  isLoading: boolean;
  error: Error | null;
}

export function useGlossaryText(
  text: string,
  options: UseGlossaryTextOptions = {}
): UseGlossaryTextResult {
  const { enabled = true } = options;
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !text) {
      setSegments([{ type: "text", content: text }]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    processTextWithGlossary(text)
      .then((processedSegments) => {
        setSegments(processedSegments);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error processing glossary text:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setSegments([{ type: "text", content: text }]);
        setIsLoading(false);
      });
  }, [text, enabled]);

  return { segments, isLoading, error };
}
