import { useState, useCallback } from 'react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import ToolNavigation from '../../components/shared/ToolNavigation';

interface DescriptionGeneratorProps {
  t?: Record<string, any>;
}

const DescriptionGenerator = ({ t }: DescriptionGeneratorProps) => {
  const [apiKey, setApiKey] = useState('');
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('engaging');
  const { data: generatedDescription, isLoading, error, generate, reset } = useAI<string>();

  const handleGenerateDescription = useCallback(async () => {
    if (!apiKey || !title) {
      alert(t?.descriptionGenerator?.missingFields || 'Please provide an API key and a video title.');
      return;
    }

    let prompt = `Write a compelling YouTube video description for a video titled "${title}".`;
    
    if (keywords) {
      prompt += ` Include these keywords naturally: ${keywords}.`;
    }
    
    prompt += ` Use a ${tone} tone. The description should include:
1. An engaging opening that hooks the viewer
2. A summary of what the video covers
3. Timestamps for key sections (if applicable)
4. Links to relevant resources
5. A call-to-action to like, comment, and subscribe
6. Relevant hashtags at the end

Return only the description text, no extra formatting.`;

    await generate(apiKey, prompt, 'gemini-2.5-flash', (text) => text);
  }, [apiKey, title, keywords, tone, generate, t]);

  return (
    <div className="p-4">
      <ToolNavigation currentTool="descriptionGenerator" t={t} />
      
      <h2 className="text-2xl font-bold mb-4">{t?.app?.tools?.descriptionGenerator?.title || 'Description Generator'}</h2>
      
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.descriptionGenerator?.titleLabel || 'Video Title'}</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t?.descriptionGenerator?.titlePlaceholder || "Enter your video title"}
            className="input input-bordered"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.descriptionGenerator?.keywordsLabel || 'Keywords (comma separated)'}</span>
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t?.descriptionGenerator?.keywordsPlaceholder || "Enter keywords"}
            className="input input-bordered"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.descriptionGenerator?.toneLabel || 'Tone'}</span>
          </label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="select select-bordered"
          >
            <option value="engaging">Engaging</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="exciting">Exciting</option>
            <option value="informative">Informative</option>
          </select>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleGenerateDescription}
          disabled={isLoading || !apiKey || !title}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              {t?.descriptionGenerator?.generating || 'Generating...'}
            </>
          ) : (
            t?.descriptionGenerator?.generate || 'Generate Description'
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
        
        {generatedDescription && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{t?.descriptionGenerator?.generatedTitle || 'Generated Description'}</h3>
              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => navigator.clipboard.writeText(generatedDescription)}
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
                <textarea
                  className="textarea textarea-bordered w-full min-h-[200px]"
                  value={generatedDescription}
                  readOnly
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionGenerator;
