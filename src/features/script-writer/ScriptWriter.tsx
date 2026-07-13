import { useState, useCallback } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import CopyButton from '../../components/CopyButton';
import OtherTools from '../../components/shared/OtherTools';
import ToolFooter from '../../components/shared/ToolFooter';

interface ScriptWriterProps {
  t?: Record<string, any>;
}

const ScriptWriter = ({ t }: ScriptWriterProps) => {
  const [apiKey, setApiKey] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [length, setLength] = useState('medium');
  const { data: generatedScript, isLoading, error, generate } = useAI<string>();

  const handleGenerateScript = useCallback(async () => {
    if (!apiKey || !topic) return;

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
    prompt +=
      ' Include an engaging hook, clear section headings (HOOK, INTRO, MAIN, CTA), spoken-style lines, and a strong ending CTA. Format with markdown headings.';

    await generate(apiKey, prompt, 'gemini-2.5-flash', (text) => text);
  }, [apiKey, topic, tone, length, generate]);

  const wordCount = generatedScript
    ? generatedScript.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-5">
      <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} />

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-medium">
            {t?.scriptWriter?.topicLabel || 'Video Topic'}
          </span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={
            t?.scriptWriter?.topicPlaceholder ||
            "Enter your video topic (e.g., 'How to bake a cake')"
          }
          className="input-modern"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.scriptWriter?.toneLabel || 'Tone'}
            </span>
          </label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="select-modern"
          >
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
            <option value="educational">Educational</option>
            <option value="entertaining">Entertaining</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label py-1">
            <span className="label-text font-medium">
              {t?.scriptWriter?.lengthLabel || 'Length'}
            </span>
          </label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="select-modern"
          >
            <option value="short">{t?.scriptWriter?.short || 'Short (1–2 min)'}</option>
            <option value="medium">{t?.scriptWriter?.medium || 'Medium (3–5 min)'}</option>
            <option value="long">{t?.scriptWriter?.long || 'Long (10+ min)'}</option>
          </select>
        </div>
      </div>

      <button
        className="btn-brand gap-2"
        onClick={handleGenerateScript}
        disabled={isLoading || !apiKey || !topic}
      >
        {isLoading ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            {t?.scriptWriter?.generating || 'Writing script...'}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t?.scriptWriter?.generate || 'Generate Script'}
          </>
        )}
      </button>

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {generatedScript && (
        <div className="surface-card p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold">
                {t?.scriptWriter?.generated || 'Generated Script'}
              </h3>
              <p className="text-xs text-base-content/50">
                {wordCount} {t?.common?.words || 'words'} · ~{Math.max(1, Math.round(wordCount / 140))}{' '}
                {t?.common?.minRead || 'min spoken'}
              </p>
            </div>
            <CopyButton
              text={generatedScript}
              label={t?.common?.copy || 'Copy'}
              copiedLabel={t?.common?.copied || 'Copied!'}
            />
          </div>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap rounded-xl bg-base-200/80 border border-base-300 p-4 text-sm leading-relaxed">
            {generatedScript}
          </div>
        </div>
      )}

      <OtherTools currentTool="scriptWriter" t={t} />
      <ToolFooter t={t} />
    </div>
  );
};

export default ScriptWriter;
