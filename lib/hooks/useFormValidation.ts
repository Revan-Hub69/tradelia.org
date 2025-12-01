import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * useFormValidation Hook
 * Helper per integrare React Hook Form con Zod
 * Riferimento: React Hook Form + Zod Best Practices
 */
export function useFormValidation<T extends z.ZodTypeAny>(schema: T) {
  type FormData = z.infer<T>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange', // Validazione in tempo reale
    defaultValues: {} as FormData,
  });

  return {
    ...form,
    // Helper per ottenere error message
    getError: (field: keyof FormData) => {
      const error = form.formState.errors[field];
      return error?.message as string | undefined;
    },
    // Helper per check se form è valido
    isValid: form.formState.isValid,
    // Helper per check se form è dirty
    isDirty: form.formState.isDirty,
  };
}

