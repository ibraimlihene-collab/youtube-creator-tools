/**
 * Shared AI generation hook for all tools
 * Provides consistent error handling, loading states, and retry logic
 */

import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

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

  const generate = useCallback(async (
    apiKey: string,
    prompt: string,
    model: string = 'gemini-2.5-flash',
    parser: (text: string) => T
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model,
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      
      if (!text) {
        throw new Error('No content generated. Please try again.');
      }

      const parsed = parser(text);
      setState({ data: parsed, isLoading: false, error: null });
      return true;
    } catch (e: any) {
      const error: AIError = {
        message: e?.message || 'An unexpected error occurred.',
        code: e?.code,
      };
      
      // Handle common API errors
      if (error.message.includes('API key')) {
        error.message = 'Invalid API key. Please check your Google AI API key and try again.';
      } else if (error.message.includes('quota')) {
        error.message = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('network')) {
        error.message = 'Network error. Please check your internet connection.';
      }
      
      setState({ data: null, isLoading: false, error });
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, generate, reset };
}
