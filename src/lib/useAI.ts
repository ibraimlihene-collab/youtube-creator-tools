/**
 * @deprecated Use useSecureAI — client-side Gemini keys are forbidden.
 * This stub prevents accidental key usage at runtime.
 */
import { useCallback, useState } from 'react';

export interface AIError {
  message: string;
  code?: string;
}

export interface AIState<T> {
  data: T | null;
  isLoading: boolean;
  error: AIError | null;
}

export function useAI<T>() {
  const [state, setState] = useState<AIState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const generate = useCallback(async (..._args: unknown[]): Promise<boolean> => {
    setState({
      data: null,
      isLoading: false,
      error: {
        message:
          'Client-side AI is disabled. Use the secure /api/ai proxy (useSecureAI).',
        code: 'CLIENT_AI_DISABLED',
      },
    });
    return false;
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, generate, reset };
}
