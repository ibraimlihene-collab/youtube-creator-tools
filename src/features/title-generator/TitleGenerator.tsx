import { useState, useCallback } from 'react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import ToolNavigation from '../../components/shared/ToolNavigation';

interface TitleGeneratorProps {
  t?: Record<string, any>;
}

const TitleGenerator = ({ t }: TitleGeneratorProps) => {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('clickbait');
  const { data: generatedTitles, isLoading, error, generate, reset } = useAI<string[]>();

  const handleGenerateTitles = useCallback(async () => {
    if (!apiKey || !topic) {
      alert(t?.titleGenerator?.missingFields || 'Please provide an API key and a topic.');
      return;
    }

    let prompt = `Generate 5 catchy YouTube video titles for a video about "${topic}".`;
    
    if (keywords) {
      prompt += ` Incorporate these keywords naturally: ${keywords}.`;
    }
    
    prompt += ` Use a ${tone} style. Make them attention-grabbing and optimized for search.\n\nReturn only the 5 titles, one per line, without numbering.`;

    await generate(apiKey, prompt, 'gemini-2.5-flash', (text) =>
      text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 5)
    );
  }, [apiKey, topic, keywords, tone, generate, t]);

  return (
    <div className="p-4">
      <ToolNavigation currentTool="titleGenerator" t={t} />
      
      <h2 className="text-2xl font-bold mb-4">{t?.app?.tools?.titleGenerator?.title || 'Title Generator'}</h2>
      
      <div className="flex flex-col gap-4">
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.titleGenerator?.topicLabel || 'Video Topic'}</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t?.titleGenerator?.topicPlaceholder || "Enter your video topic"}
            className="input input-bordered"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.titleGenerator?.keywordsLabel || 'Keywords (comma separated)'}</span>
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t?.titleGenerator?.keywordsPlaceholder || "Enter keywords (e.g., tutorial, how-to, tips)"}
            className="input input-bordered"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">{t?.titleGenerator?.toneLabel || 'Tone'}</span>
          </label>
          <select 
            value={tone} 
            onChange={(e) => setTone(e.target.value)}
            className="select select-bordered"
          >
            <option value="clickbait">Clickbait</option>
            <option value="professional">Professional</option>
            <option value="educational">Educational</option>
            <option value="entertaining">Entertaining</option>
            <option value="intriguing">Intriguing</option>
          </select>
        </div>
        
        <button
          className="btn btn-primary"
          onClick={handleGenerateTitles}
          disabled={isLoading || !apiKey || !topic}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              {t?.titleGenerator?.generating || 'Generating...'}
            </>
          ) : (
            t?.titleGenerator?.generate || 'Generate Titles'
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
        
        {generatedTitles && generatedTitles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold">{t?.titleGenerator?.generatedTitle || 'Generated Titles'}</h3>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigator.clipboard.writeText(generatedTitles.join('\n'))}
              >
                {t?.titleGenerator?.copyAll || 'Copy All'}
              </button>
            </div>
            <div className="space-y-2">
              {generatedTitles.map((title, index) => (
                <div key={index} className="card bg-base-200 shadow-sm">
                  <div className="card-body py-3 px-4 flex flex-row items-center justify-between gap-2">
                    <p className="font-medium flex-1">{title}</p>
                    <button
                      className="btn btn-ghost btn-sm btn-circle"
                      onClick={() => navigator.clipboard.writeText(title)}
                      title="Copy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitleGenerator;
