import { useState, useCallback } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import CopyButton from '../../components/CopyButton';
import OtherTools from '../../components/shared/OtherTools';
import ToolFAQ from '../../components/shared/ToolFAQ';
import ToolFooter from '../../components/shared/ToolFooter';

interface TitleGeneratorProps {
  t?: Record<string, any>;
}

const TitleGenerator = ({ t }: TitleGeneratorProps) => {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('clickbait');
  const { data: generatedTitles, isLoading, error, generate } = useAI<string[]>();

  const handleGenerateTitles = useCallback(async () => {
    if (!apiKey || !topic) return;

    let prompt = `Generate 8 catchy YouTube video titles for a video about "${topic}".`;
    if (keywords) prompt += ` Incorporate these keywords naturally: ${keywords}.`;
    prompt += ` Use a ${tone} style. Make them attention-grabbing, under 70 characters when possible, and optimized for search and CTR.\n\nReturn only the titles, one per line, without numbering or bullets.`;

    await generate(apiKey, prompt, 'gemini-2.5-flash', (text) =>
      text
        .split('\n')
        .map((line) => line.replace(/^[\d\-\*\.\)\s]+/, '').trim())
        .filter((line) => line.length > 0)
        .slice(0, 8)
    );
  }, [apiKey, topic, keywords, tone, generate]);

  return (
    <div className="space-y-5">
      <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control md:col-span-2">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.titleGenerator?.topicLabel || 'Video Topic'}
            </span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t?.titleGenerator?.topicPlaceholder || 'Enter your video topic'}
            className="input-modern"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && apiKey && topic && !isLoading) handleGenerateTitles();
            }}
          />
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.titleGenerator?.keywordsLabel || 'Keywords (comma separated)'}
            </span>
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={
              t?.titleGenerator?.keywordsPlaceholder ||
              'Enter keywords (e.g., tutorial, how-to, tips)'
            }
            className="input-modern"
          />
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.titleGenerator?.toneLabel || 'Tone'}
            </span>
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="select-modern"
          >
            <option value="clickbait">Clickbait</option>
            <option value="professional">Professional</option>
            <option value="educational">Educational</option>
            <option value="entertaining">Entertaining</option>
            <option value="intriguing">Intriguing</option>
          </select>
        </div>
      </div>

      <button
        className="btn-brand gap-2"
        onClick={handleGenerateTitles}
        disabled={isLoading || !apiKey || !topic}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            {t?.titleGenerator?.generating || 'Generating...'}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t?.titleGenerator?.generate || 'Generate Titles'}
          </>
        )}
      </button>

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {generatedTitles && generatedTitles.length > 0 && (
        <div className="surface-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold">
              {t?.titleGenerator?.generatedTitles || 'Generated Titles'}
            </h3>
            <CopyButton
              text={generatedTitles.join('\n')}
              label={t?.titleGenerator?.copyAll || 'Copy all'}
              copiedLabel={t?.common?.copied || 'Copied!'}
            />
          </div>
          <div className="space-y-2">
            {generatedTitles.map((title, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-base-200/80 border border-base-300 px-3 py-3"
              >
                <span className="text-xs font-mono text-base-content/40 mt-1 w-5 shrink-0">
                  {index + 1}
                </span>
                <p className="font-medium flex-1 leading-snug">{title}</p>
                <span className="text-[10px] text-base-content/40 mt-1 shrink-0">
                  {title.length}c
                </span>
                <CopyButton
                  text={title}
                  label=""
                  copiedLabel=""
                  variant="ghost"
                  className="btn-circle shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <OtherTools currentTool="titleGenerator" t={t} />
      <ToolFAQ toolId="titleGenerator" t={t} />
      <ToolFooter t={t} />
    </div>
  );
};

export default TitleGenerator;
