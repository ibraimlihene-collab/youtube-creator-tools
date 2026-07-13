import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, ExternalLink, KeyRound, ShieldCheck } from 'lucide-react';
import { saveApiKey, getApiKey, isValidApiKey } from '../lib/apiKeyManager';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  t?: any;
  compact?: boolean;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  onApiKeyChange,
  t,
  compact = false,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const savedApiKey = getApiKey();
    if (savedApiKey && !apiKey) {
      onApiKeyChange(savedApiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (apiKey) {
      setIsValid(isValidApiKey(apiKey));
    } else {
      setIsValid(true);
    }
  }, [apiKey]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    onApiKeyChange(newApiKey);
    saveApiKey(newApiKey);
  };

  const defaultStrings = {
    label: 'Google AI Studio API Key',
    placeholder: 'Enter your Google AI Studio API Key',
    hintTitle: 'Get Your Free API Key',
    hintText:
      'Visit {link} to get your free Google AI Studio API key. Stored only in your browser.',
    hintLink: 'ai.dev/apikey',
    invalidKey: 'Please enter a valid API key',
    storedLocally: 'Saved locally in your browser',
  };

  const strings = t?.apiKeyInput || defaultStrings;

  return (
    <div className={`form-control w-full ${compact ? '' : 'surface-card p-4 sm:p-5'}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <label className="label py-0">
          <span className="label-text font-semibold flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            {strings.label}
          </span>
        </label>
        {apiKey && isValid && (
          <span className="text-[11px] text-accent flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {strings.storedLocally || 'Saved locally'}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type={showApiKey ? 'text' : 'password'}
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder={strings.placeholder}
          className={`input-modern pr-12 ${!isValid ? 'input-error border-error' : ''}`}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="absolute inset-y-0 end-0 flex items-center pe-3 text-base-content/50 hover:text-base-content"
          onClick={() => setShowApiKey(!showApiKey)}
          aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
        >
          {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {!isValid && (
        <label className="label py-1">
          <span className="label-text-alt text-error">{strings.invalidKey}</span>
        </label>
      )}

      {!compact && (
        <div className="mt-3 rounded-xl bg-info/10 border border-info/20 p-3 text-sm">
          <div className="font-semibold text-info mb-1 flex items-center gap-1.5">
            <ExternalLink className="w-4 h-4" />
            {strings.hintTitle}
          </div>
          <p className="text-base-content/70 leading-relaxed">
            {String(strings.hintText).split('{link}')[0]}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary font-medium"
            >
              {strings.hintLink}
            </a>
            {String(strings.hintText).split('{link}')[1] || ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
