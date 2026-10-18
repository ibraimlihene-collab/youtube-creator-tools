import { useState } from 'react';
import { Hash, Sparkles, AlertCircle, Eraser } from 'lucide-react';
import { useSecureAI } from '../../lib/useSecureAI';
import CopyButton from '../../components/CopyButton';

const HashtagGenerator = ({ lang, t }: { lang: 'ar' | 'en'; t: any }) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'quick' | 'ai'>('quick');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const { data, isLoading, error, generate, reset } = useSecureAI();

  const aiTags = data?.type === 'list' ? data.items : [];
  const hashtags = mode === 'ai' ? aiTags : localTags;

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

  const handleGenerate = () => {
    if (mode === 'ai') {
      generate('hashtagGenerator', { topic: text, count: 15 }, lang);
    } else {
      generateLocal();
    }
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
          {t?.hashtagGenerator?.quickMode || (lang === 'ar' ? 'سريع (بدون نت)' : 'Quick (offline)')}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${mode === 'ai' ? 'btn-brand' : 'btn-soft'}`}
          onClick={() => setMode('ai')}
        >
          <Sparkles className="w-4 h-4" />
          {t?.hashtagGenerator?.aiMode || (lang === 'ar' ? 'بالذكاء الاصطناعي' : 'AI powered')}
        </button>
      </div>

      <div className="form-control">
        <label className="label py-1">
          <span className="label-text font-medium">
            {t?.hashtagGenerator?.label || (lang === 'ar' ? 'المحتوى' : 'Content')}
          </span>
        </label>
        <textarea
          className="textarea-modern resize-y min-h-[140px]"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            t?.hashtagGenerator?.placeholder ||
            (lang === 'ar' ? 'الصق موضوع أو وصف الفيديو…' : 'Paste topic or description…')
          }
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn-brand gap-2"
          onClick={handleGenerate}
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              {lang === 'ar' ? 'جاري التوليد…' : 'Generating…'}
            </>
          ) : (
            <>
              {mode === 'ai' ? <Sparkles className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
              {t?.hashtagGenerator?.generate || (lang === 'ar' ? 'توليد' : 'Generate')}
            </>
          )}
        </button>
        <button className="btn-soft gap-2" onClick={handleClear}>
          <Eraser className="w-4 h-4" />
          {t?.hashtagGenerator?.clear || (lang === 'ar' ? 'مسح' : 'Clear')}
        </button>
      </div>

      {error && (
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {hashtags.length > 0 && (
        <div className="surface-card p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-semibold">
              {t?.hashtagGenerator?.generatedTitle || (lang === 'ar' ? 'الهاشتاغات' : 'Hashtags')}
            </h3>
            <CopyButton
              text={hashtags.join(' ')}
              label={t?.hashtagGenerator?.copyAll || (lang === 'ar' ? 'نسخ الكل' : 'Copy all')}
              copiedLabel={t?.common?.copied || (lang === 'ar' ? 'تم!' : 'Copied!')}
              variant="brand"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag, index) => (
              <button
                key={`${tag}-${index}`}
                type="button"
                className="badge badge-lg bg-base-300 border-0 hover:bg-primary hover:text-primary-content transition-colors cursor-pointer px-3 py-3"
                onClick={() => navigator.clipboard.writeText(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagGenerator;
