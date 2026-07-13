import { useState, useCallback } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import CopyButton from '../../components/CopyButton';
import OtherTools from '../../components/shared/OtherTools';
import ToolFooter from '../../components/shared/ToolFooter';

interface DescriptionGeneratorProps {
  t?: Record<string, any>;
}

const DescriptionGenerator = ({ t }: DescriptionGeneratorProps) => {
  const [apiKey, setApiKey] = useState('');
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('engaging');
  const { data: generatedDescription, isLoading, error, generate } = useAI<string>();

  const handleGenerateDescription = useCallback(async () => {
    if (!apiKey || !title) return;

    let prompt = `Write a compelling YouTube video description for a video titled "${title}".`;
    if (keywords) prompt += ` Include these keywords naturally: ${keywords}.`;
    prompt += ` Use a ${tone} tone. The description should include:
1. An engaging opening hook (first 2 lines matter most for SEO)
2. A summary of what the video covers
3. Placeholder timestamps for key sections
4. A clear call-to-action (like, comment, subscribe)
5. 5–8 relevant hashtags at the end

Return only the description text.`;

    await generate(apiKey, prompt, 'gemini-2.5-flash', (text) => text);
  }, [apiKey, title, keywords, tone, generate]);

  return (
    <div className="space-y-5">
      <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-medium">
            {t?.descriptionGenerator?.titleLabel || 'Video Title'}
          </span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t?.descriptionGenerator?.titlePlaceholder || 'Enter your video title'}
          className="input-modern"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.descriptionGenerator?.keywordsLabel || 'Keywords (comma separated)'}
            </span>
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={t?.descriptionGenerator?.keywordsPlaceholder || 'Enter keywords'}
            className="input-modern"
          />
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.descriptionGenerator?.toneLabel || 'Tone'}
            </span>
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="select-modern"
          >
            <option value="engaging">Engaging</option>
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="educational">Educational</option>
          </select>
        </div>
      </div>

      <button
        className="btn-brand gap-2"
        onClick={handleGenerateDescription}
        disabled={isLoading || !apiKey || !title}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            {t?.descriptionGenerator?.generating || 'Generating...'}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t?.descriptionGenerator?.generate || 'Generate Description'}
          </>
        )}
      </button>

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {generatedDescription && (
        <div className="surface-card p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold">
                {t?.descriptionGenerator?.generated || 'Generated Description'}
              </h3>
              <p className="text-xs text-base-content/50">
                {generatedDescription.length} {t?.common?.characters || 'characters'}
              </p>
            </div>
            <CopyButton
              text={generatedDescription}
              label={t?.common?.copy || 'Copy'}
              copiedLabel={t?.common?.copied || 'Copied!'}
            />
          </div>
          <textarea
            readOnly
            value={generatedDescription}
            className="textarea-modern min-h-[240px] font-mono text-sm leading-relaxed"
          />
        </div>
      )}

      <OtherTools currentTool="descriptionGenerator" t={t} />
      <ToolFooter t={t} />
    </div>
  );
};

export default DescriptionGenerator;
