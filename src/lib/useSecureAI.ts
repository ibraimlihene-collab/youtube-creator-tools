import { useCallback, useRef, useState } from 'react';
import { runAI, type AIResult } from './api/client';

export interface SecureAIState {
  data: AIResult | null;
  rawText: string;
  isLoading: boolean;
  error: string | null;
  model: string | null;
}

export function useSecureAI() {
  const [state, setState] = useState<SecureAIState>({
    data: null,
    rawText: '',
    isLoading: false,
    error: null,
    model: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (toolId: string, input: Record<string, unknown>, lang: 'ar' | 'en' = 'en') => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState((s) => ({ ...s, isLoading: true, error: null }));

      const res = await runAI({ toolId, input, lang, signal: ac.signal });

      if (!res.ok) {
        setState({
          data: null,
          rawText: '',
          isLoading: false,
          error: res.error,
          model: null,
        });
        return false;
      }

      const rawText =
        res.result.type === 'list'
          ? res.result.items.join('\n')
          : res.result.content;

      setState({
        data: res.result,
        rawText,
        isLoading: false,
        error: null,
        model: res.model,
      });
      return true;
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ data: null, rawText: '', isLoading: false, error: null, model: null });
  }, []);

  return { ...state, generate, reset };
}
