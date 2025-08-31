/**
 * API Key Manager for handling API key storage and retrieval
 */

/**
 * Saves API key to localStorage
 * @param apiKey - The API key to save
 */
export function saveApiKey(apiKey: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('gemini-api-key', apiKey);
    } catch (error) {
      console.error('Failed to save API key to localStorage:', error);
    }
  }
}

/**
 * Retrieves API key from localStorage
 * @returns The saved API key or empty string if not found
 */
export function getApiKey(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem('gemini-api-key') || '';
    } catch (error) {
      console.error('Failed to retrieve API key from localStorage:', error);
      return '';
    }
  }
  return '';
}

/**
 * Validates if an API key has the correct format
 * @param apiKey - The API key to validate
 * @returns True if the API key appears valid, false otherwise
 */
export function isValidApiKey(apiKey: string): boolean {
  // Basic validation - check if it's not empty and has reasonable length
  return typeof apiKey === 'string' && apiKey.length > 10;
}