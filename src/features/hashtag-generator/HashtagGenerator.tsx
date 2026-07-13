import { useState, useCallback } from 'react';
import { Hash, Sparkles, AlertCircle, Eraser } from 'lucide-react';
import { useAI } from '../../lib/useAI';
import ApiKeyInput from '../../components/ApiKeyInput';
import CopyButton from '../../components/CopyButton';
import OtherTools from '../../components/shared/OtherTools';
import ToolFAQ from '../../components/shared/ToolFAQ';
import ToolFooter from '../../components/shared/ToolFooter';
import { getApiKey } from '../../lib/apiKeyManager';

const HashtagGenerator = ({ lang, t }: { lang: 'ar' | 'en'; t: any }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'quick' | 'ai'>('quick');
  const [apiKey, setApiKey] = useState(getApiKey());
  const [localTags, setLocalTags] = useState<string[]>([]);
  const { data: aiTags, isLoading, error, generate, reset } = useAI<string[]>();

  const hashtags = mode === 'ai' ? aiTags || [] : localTags;

  const generateLocal = () => {
    const commonWordsEn = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
      'from', 'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'should', 'can', 'could', 'may',
      'might', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
      'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these',
      'those', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    ]);
    const commonWordsAr = new Set([
      'من', 'في', 'على', 'إلى', 'عن', 'و', 'أو', 'لكن', 'ب', 'ل', 'ك', 'هو', 'هي',
      'هم', 'هن', 'أنا', 'أنت', 'أنتم', 'أنتن', 'نحن', 'هذا', 'هذه', 'هؤلاء', 'ذلك',
      'تلك', 'أولئك', 'كان', 'يكون', 'سوف', 'قد', 'لقد', 'ما', 'ماذا', 'كيف', 'أين',
      'متى', 'لماذا', 'هل', 'لا', 'نعم',
    ]);

    const commonWords = lang === 'ar' ? commonWordsAr : commonWordsEn;
    const regex = lang === 'ar' ? /[^a-zA-Z0-9\u0600-\u06FF\s]/g : /[^a-z0-9\s]/g;
    const words = text.toLowerCase().replace(regex, '').split(/\s+/);
    const wordCounts = words.reduce((acc, word) => {
      if (word && word.length > 2 && !commonWords.has(word)) {
        acc[word] = (acc[word] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
    setLocalTags(sortedWords.slice(0, 15).map(([w]) => `#${w}`));
  };

  const generateAI = useCallback(async () => {
    if (!apiKey || !text.trim()) return;
    const prompt = `Generate 15 highly relevant YouTube hashtags for this content (language: ${lang === 'ar' ? 'Arabic' : 'English'}).

Content:
"""
${text.slice(0, 2000)}
"""

Rules:
- Mix broad + niche hashtags
- No spaces inside hashtags
- Prefer popular creator hashtags
- Return ONLY hashtags, one per line, each starting with #`;

    await generate(apiKey, prompt, 'gemini-2.5-flash', (raw) =>
      raw
        .split(/[\n,\s]+/)
        .map((s) => s.trim())
        .filter((s) => s.startsWith('#') || s.length > 1)
        .map((s) => (s.startsWith('#') ? s : `#${s}`))
        .filter((s, i, arr) => arr.indexOf(s) === i)
        .slice(0, 15)
    );
  }, [apiKey, text, lang, generate]);

  const handleGenerate = () => {
    if (mode === 'ai') generateAI();
    else generateLocal();
  };

  const handleClear = () => {
    setText('');
    setLocalTags([]);
    reset();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`btn btn-sm ${mode === 'quick' ? 'btn-brand' : 'btn-soft'}`}
          onClick={() => setMode('quick')}
        >
          <Hash className="w-4 h-4" />
          {t?.hashtagGenerator?.quickMode || 'Quick (offline)'}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mode === 'ai' ? 'btn-brand' : 'btn-soft'}`}
          onClick={() => setMode('ai')}
        >
          <Sparkles className="w-4 h-4" />
          {t?.hashtagGenerator?.aiMode || 'AI powered'}
        </button>
      </div>

      {mode === 'ai' && (
        <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} t={t} compact />
      )}

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-medium">{t.hashtagGenerator.label}</span>
        </label>
        <textarea
          className="textarea-modern resize-y min-h-[140px]"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.hashtagGenerator.placeholder}
        />
        <div className="label justify-start py-1">
          <span className="label-text-alt text-sm opacity-70">
            {t.hashtagGenerator.characters.replace('{count}', text.length.toString())}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn-brand gap-2"
          onClick={handleGenerate}
          disabled={!text.trim() || isLoading || (mode === 'ai' && !apiKey)}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              {t?.hashtagGenerator?.generating || 'Generating...'}
            </>
          ) : (
            <>
              {mode === 'ai' ? <Sparkles className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              {t.hashtagGenerator.generate}
            </>
          )}
        </button>
        <button className="btn-soft gap-2" onClick={handleClear} disabled={!text.trim() && hashtags.length === 0}>
          <Eraser className="w-4 h-4" />
          {t.hashtagGenerator.clear}
        </button>
      </div>

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {hashtags.length > 0 && (
        <div className="surface-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">{t.hashtagGenerator.generatedTitle}</h3>
              <p className="text-sm opacity-70">
                {t.hashtagGenerator.found.replace('{count}', hashtags.length.toString())}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton
                text={hashtags.join(' ')}
                label={t.hashtagGenerator.copyAll}
                copiedLabel={t?.common?.copied || 'Copied!'}
                variant="brand"
              />
              <CopyButton
                text={hashtags.slice(0, 10).join(' ')}
                label={t.hashtagGenerator.copyTop10}
                copiedLabel={t?.common?.copied || 'Copied!'}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <button
                key={`${tag}-${index}`}
                type="button"
                className="badge badge-lg bg-base-300 border-0 hover:bg-primary hover:text-primary-content transition-colors cursor-pointer px-3 py-3"
                onClick={() => navigator.clipboard.writeText(tag)}
                title="Click to copy"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <OtherTools currentTool="hashtagGenerator" t={t} />
      <ToolFAQ toolId="hashtagGenerator" t={t} />
      <ToolFooter t={t} />
    </div>
  );
};

export default HashtagGenerator;
