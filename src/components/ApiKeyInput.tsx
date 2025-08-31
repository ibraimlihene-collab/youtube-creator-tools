import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { saveApiKey, getApiKey, isValidApiKey } from '../lib/apiKeyManager';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  t?: any; // Localization object (optional)
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange, t }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Load saved API key on component mount
  useEffect(() => {
    const savedApiKey = getApiKey();
    if (savedApiKey) {
      onApiKeyChange(savedApiKey);
    }
  }, [onApiKeyChange]);

  // Validate API key when it changes
  useEffect(() => {
    if (apiKey) {
      setIsValid(isValidApiKey(apiKey));
    } else {
      setIsValid(true); // Don't show error for empty key
    }
  }, [apiKey]);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    onApiKeyChange(newApiKey);
    saveApiKey(newApiKey);
  };

  // Default English strings when no localization is provided
  const defaultStrings = {
    label: "Google AI Studio API Key",
    placeholder: "Enter your Google AI Studio API Key",
    hintTitle: "Get Your Free API Key",
    hintText: "Visit {link} to get your free Google AI Studio API key. It's completely free and safe from Google. They only train on publicly available data and do not use your API requests for training.",
    hintLink: "ai.dev/apikey",
    invalidKey: "Please enter a valid API key"
  };

  // Use provided localization or fallback to defaults
  const strings = t?.apiKeyInput || defaultStrings;

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-medium">{strings.label}</span>
      </label>
      
      <div className="relative">
        <input
          type={showApiKey ? "text" : "password"}
          value={apiKey}
          onChange={handleApiKeyChange}
          placeholder={strings.placeholder}
          className={`input input-bordered w-full pr-12 ${!isValid ? 'input-error' : ''}`}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => setShowApiKey(!showApiKey)}
        >
          {showApiKey ? (
            <EyeOff className="h-5 w-5 text-gray-500" />
          ) : (
            <Eye className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
      
      {!isValid && (
        <label className="label">
          <span className="label-text-alt text-error">{strings.invalidKey}</span>
        </label>
      )}
      
      <div className="alert alert-info shadow-lg mt-2">
        <div>
          <Info className="h-6 w-6" />
          <div>
            <h3 className="font-bold">{strings.hintTitle}</h3>
            <p className="text-sm">
              {strings.hintText.replace('{link}', 
                <a 
                  href="https://ai.dev/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="link link-primary"
                >
                  {strings.hintLink}
                </a>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;