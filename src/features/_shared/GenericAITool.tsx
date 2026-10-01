import { useMemo, useState } from 'react';
import { AlertCircle, ClipboardPaste, Sparkles, Eraser, Link2 } from 'lucide-react';
import { useSecureAI } from '../../lib/useSecureAI';
import { useApp } from '../../context/AppContext';
import CopyButton from '../../components/CopyButton';
import { extractYouTubeVideoId, isLikelyYouTubeUrl } from '../../lib/youtubeUrl';
import type { ToolDef, ToolField } from '../../data/toolsRegistry';

function fieldLabel(f: ToolField, lang: 'ar' | 'en') {
  return lang === 'ar' ? f.labelAr : f.labelEn;
}
function fieldPh(f: ToolField, lang: 'ar' | 'en') {
  return lang === 'ar' ? f.placeholderAr : f.placeholderEn;
}

export default function GenericAITool({ tool }: { tool: ToolDef }) {
  const { lang, t } = useApp();
  const fields = tool.fields || [];
  const initial = useMemo(() => {
    const o: Record<string, string> = {};
    for (const f of fields) {
      if (f.type === 'select' && f.options?.[0]) o[f.name] = f.options[0].value;
      else o[f.name] = '';
    }
    return o;
  }, [tool.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [values, setValues] = useState<Record<string, string>>(initial);
  const { data, rawText, isLoading, error, model, generate, reset } = useSecureAI();

  const missing = fields.filter(
    (f) => f.required === true && f.type !== 'select' && !String(values[f.name] || '').trim()
  );

  const detectedId = useMemo(() => {
    for (const v of Object.values(values)) {
      if (v && isLikelyYouTubeUrl(v)) {
        const id = extractYouTubeVideoId(v);
        if (id) return id;
      }
    }
    return null;
  }, [values]);

  const pasteInto = async (name: string) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setValues((v) => ({ ...v, [name]: text.trim() }));
    } catch {
      /* user can Ctrl+V */
    }
  };

  const onGenerate = async () => {
    if (missing.length) return;
    const input: Record<string, unknown> = { ...values };
    if (values.keywords) input.keywords = values.keywords;
    if (detectedId) input.url = `https://www.youtube.com/watch?v=${detectedId}`;
    await generate(tool.aiToolId || tool.id, input, lang);
  };

  const listItems = data?.type === 'list' ? data.items : null;

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isLoading) void onGenerate();
      }}
    >
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
        <p className="text-sm leading-relaxed text-base-content/70">
          {lang === 'ar'
            ? 'ابدأ بتفاصيل واضحة عن فكرتك. أضف جمهورك والكلمات المفتاحية لتحصل على نتائج أفضل، ثم راجع النتيجة قبل النشر.'
            : 'Start with a specific idea. Add your audience and keywords for better results, then review and make the output your own before publishing.'}
        </p>
      </div>

      {detectedId && (
        <div className="flex items-center gap-2 text-xs text-success font-mono" dir="ltr">
          <Link2 className="w-3.5 h-3.5" />
          Detected video: {detectedId}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => {
          const span = f.type === 'textarea' || fields.length === 1 ? 'md:col-span-2' : '';
          const showPaste = f.type === 'text' || f.type === 'textarea';
          return (
            <div key={f.name} className={`form-control ${span}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label htmlFor={`field-${f.name}`} className="text-sm font-medium">
                  {fieldLabel(f, lang)}{' '}
                  <span className="text-xs font-normal text-base-content/50">
                    {f.required
                      ? lang === 'ar'
                        ? '* مطلوب'
                        : '* required'
                      : lang === 'ar'
                        ? 'اختياري'
                        : 'optional'}
                  </span>
                </label>
                {showPaste && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs gap-1"
                    onClick={() => pasteInto(f.name)}
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    {lang === 'ar' ? 'لصق' : 'Paste'}
                  </button>
                )}
              </div>
              {f.type === 'textarea' ? (
                <textarea
                  id={`field-${f.name}`}
                  required={f.required}
                  disabled={isLoading}
                  className="textarea-modern min-h-[140px]"
                  rows={f.rows || 6}
                  value={values[f.name] || ''}
                  placeholder={fieldPh(f, lang)}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : f.type === 'select' ? (
                <select
                  id={`field-${f.name}`}
                  required={f.required}
                  disabled={isLoading}
                  className="select-modern"
                  value={values[f.name] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                >
                  {(f.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {lang === 'ar' ? opt.labelAr : opt.labelEn}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`field-${f.name}`}
                  required={f.required}
                  disabled={isLoading}
                  type={f.type === 'number' ? 'number' : 'text'}
                  className="input-modern"
                  value={values[f.name] || ''}
                  placeholder={fieldPh(f, lang)}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              )}
            </div>
          );
        })}
      </div>

      {missing.length > 0 && (
        <p className="text-xs text-base-content/60">
          {lang === 'ar'
            ? 'أكمل الحقول المطلوبة للبدء.'
            : 'Complete the required fields to get started.'}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="btn-brand gap-2"
          disabled={isLoading || missing.length > 0}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              {lang === 'ar' ? 'جاري التوليد…' : 'Generating…'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {lang === 'ar' ? 'توليد' : 'Generate'}
            </>
          )}
        </button>
        <button
          type="button"
          className="btn-soft gap-2"
          onClick={() => {
            setValues(initial);
            reset();
          }}
        >
          <Eraser className="w-4 h-4" />
          {lang === 'ar' ? 'مسح' : 'Clear'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error text-sm" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!listItems && !rawText && !error && (
        <div className="empty-state" role="status">
          <Sparkles size={26} />
          <h3>
            {isLoading
              ? lang === 'ar'
                ? 'جاري العمل على فكرتك…'
                : 'Working on your idea…'
              : lang === 'ar'
                ? 'فكرتك تبدأ هنا'
                : 'Your next idea starts here'}
          </h3>
          <p>
            {lang === 'ar'
              ? 'ستظهر النتائج هنا، جاهزة للمراجعة والنسخ.'
              : 'Your results will appear here, ready to review and copy.'}
          </p>
        </div>
      )}
      {(listItems || rawText) && (
        <div className="surface-card p-4 sm:p-5 space-y-3" aria-live="polite">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-lg font-bold">{lang === 'ar' ? 'النتيجة' : 'Result'}</h3>
              {model && (
                <p className="text-xs text-base-content/50 mt-0.5">
                  {lang === 'ar' ? 'النموذج' : 'Model'}: {model}
                </p>
              )}
            </div>
            <CopyButton
              text={listItems ? listItems.join('\n') : rawText}
              label={t?.common?.copy || (lang === 'ar' ? 'نسخ' : 'Copy')}
              copiedLabel={t?.common?.copied || (lang === 'ar' ? 'تم النسخ!' : 'Copied!')}
            />
          </div>

          {listItems ? (
            <ul className="space-y-2">
              {listItems.map((item, i) => (
                <li
                  key={`${i}-${item.slice(0, 24)}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-base-300 bg-base-100/60 px-3 py-2.5"
                >
                  <span className="text-sm leading-relaxed">{item}</span>
                  <CopyButton
                    text={item}
                    label=""
                    copiedLabel="✓"
                    className="btn btn-ghost btn-xs shrink-0"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-base-content/90">
              {rawText}
            </pre>
          )}
        </div>
      )}
    </form>
  );
}
