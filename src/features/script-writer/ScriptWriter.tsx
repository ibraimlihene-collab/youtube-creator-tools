import { useState, useCallback } from 'react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import ToolNavigation from '../../components/shared/ToolNavigation';

interface ScriptWriterProps {
  t?: Record<string, any>;
}

const ScriptWriter = ({ t }: ScriptWriterProps) => {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [length, setLength] = useState('medium');
  const { data: generatedScript, isLoading, error, generate, reset } = useAI<string>();

  const handleGenerateScript = useCallback(async () => {
    if (!apiKey || !topic) {
      alert(t?.scriptWriter?.missingFields || 'Please provide an API key and a topic.');
      return;
    }

    let prompt = `Write a YouTube video script about "${topic}" in a ${tone} tone.`;
    
    switch (length) {
      case 'short':
        prompt += ' Keep it concise, around 1-2 minutes when read aloud.';
        break;
      case 'medium':
        prompt += ' Make it detailed enough for a 3-5 minute video.';
        break;
      case 'long':
        prompt += ' Make it comprehensive, suitable for a 10+ minute video.';
        break;
    }
    
    prompt += ' Include an engaging introduction, main content with clear sections, and a compelling conclusion. Format it clearly with headings for different sections.';

    await generate(apiKey, prompt, 'gemini-2.5-flash', (text) => text);
  }, [apiKey, topic, tone, length, generate, t]);

  return (
    <div className="p-4">
      <ToolNavigation currentTool="scriptWriter" t={t} />
      
      <h2 className="text-2xl font-bold mb-4">{t?.app?.tools?.scriptWriter?.title || 'Script Writer'}</h2>
      
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.scriptWriter?.topicLabel || 'Video Topic'}</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t?.scriptWriter?.topicPlaceholder || "Enter your video topic (e.g., 'How to bake a cake')"}
            className="input input-bordered"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t?.scriptWriter?.toneLabel || 'Tone'}</span>
            </label>
            <select 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
              className="select select-bordered"
            >
              <option value="casual">Casual</option>
              <option value="professional">Professional</option>
              <option value="educational">Educational</option>
              <option value="entertaining">Entertaining</option>
            </select>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">{t?.scriptWriter?.lengthLabel || 'Video Length'}</span>
            </label>
            <select 
              value={length} 
              onChange={(e) => setLength(e.target.value)}
              className="select select-bordered"
            >
              <option value="short">Short (1-2 min)</option>
              <option value="medium">Medium (3-5 min)</option>
              <option value="long">Long (10+ min)</option>
            </select>
          </div>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleGenerateScript}
          disabled={isLoading || !apiKey || !topic}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              {t?.scriptWriter?.generating || 'Generating...'}
            </>
          ) : (
            t?.scriptWriter?.generate || 'Generate Script'
          )}
        </button>

        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error.message}</span>
          </div>
        )}
        
        {generatedScript && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{t?.scriptWriter?.generatedTitle || 'Generated Script'}</h3>
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigator.clipboard.writeText(generatedScript)}
                >
                  Copy
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={reset}
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm">{generatedScript}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;
