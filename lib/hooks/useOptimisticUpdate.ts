/**
 * Custom hook for optimistic updates
 * Updates UI immediately, then syncs with server
 * Rolls back on error
 */

import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/Toast';

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollback: () => void) => void;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousData, setPreviousData] = useState<T | null>(null);

  const update = useCallback(async (
    optimisticData: T,
    options?: OptimisticUpdateOptions<T>
  ) => {
    // Save current state for rollback
    setPreviousData(data);
    
    // Optimistic update - update UI immediately
    setData(optimisticData);
    setIsUpdating(true);

    try {
      // Sync with server
      const serverData = await updateFn(optimisticData);
      
      // Update with server response
      setData(serverData);
      
      if (options?.onSuccess) {
        options.onSuccess(serverData);
      }
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    } catch (error) {
      // Rollback on error
      if (previousData !== null) {
        setData(previousData);
      }
      
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (options?.onError) {
        options.onError(err, () => {
          if (previousData !== null) {
            setData(previousData);
          }
        });
      } else {
        toast.error(options?.errorMessage || 'Errore durante l\'aggiornamento', {
          action: {
            label: 'Riprova',
            onClick: () => update(optimisticData, options),
          },
        });
      }
    } finally {
      setIsUpdating(false);
      setPreviousData(null);
    }
  }, [data, updateFn, previousData]);

  return {
    data,
    update,
    isUpdating,
  };
}

