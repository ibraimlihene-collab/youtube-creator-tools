import { useCallback, useState } from 'react';

/**
 * Copy text to clipboard with a short-lived "copied" flag for UI feedback.
 */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, key?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setCopiedKey(key ?? null);
        window.setTimeout(() => {
          setCopied(false);
          setCopiedKey(null);
        }, resetMs);
        return true;
      } catch {
        // Fallback for older browsers / insecure contexts
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          setCopied(true);
          setCopiedKey(key ?? null);
          window.setTimeout(() => {
            setCopied(false);
            setCopiedKey(null);
          }, resetMs);
          return true;
        } catch {
          return false;
        }
      }
    },
    [resetMs]
  );

  return { copied, copiedKey, copy };
}
