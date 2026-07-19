/**
 * DEPRECATED — API keys must NEVER be stored or read in the browser.
 * Kept as no-ops so any leftover imports do not break the build.
 */

export function saveApiKey(_apiKey: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('gemini-api-key');
    } catch {
      /* ignore */
    }
  }
}

export function getApiKey(): string {
  // Always empty — secrets live only on the server
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem('gemini-api-key');
    } catch {
      /* ignore */
    }
  }
  return '';
}

export function isValidApiKey(_apiKey: string): boolean {
  return false;
}
