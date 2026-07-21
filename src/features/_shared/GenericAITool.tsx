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
    (f) => f.required !== false && f.type !== 'select' && !String(values[f.name] || '').trim()
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
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-base-content/80">
        {lang === 'ar' ? (
          <>
            🔒 المفاتيح على الخادم فقط. يمكنك لصق <strong>رابط يوتيوب</strong> في الحقول — سنقرأ العنوان تلقائياً.
            النماذج الأرخص تُستخدم افتراضياً لتقليل التكلفة.
          </>
        ) : (
          <>
            🔒 Keys stay server-side. Paste a <strong>YouTube URL</strong> in any field — we resolve the title automatically.
            Cheapest models are used by default.
          </>
        )}
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
              <label className="label py-1 justify-between gap-2">
                <span className="label-text font-medium">{fieldLabel(f, lang)}</span>
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
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  className="textarea-modern min-h-[140px]"
                  rows={f.rows || 6}
                  value={values[f.name] || ''}
                  placeholder={fieldPh(f, lang)}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              ) : f.type === 'select' ? (
                <select
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
                  type={f.type === 'number' ? 'number' : 'text'}
                  className="input-modern"
                  value={values[f.name] || ''}
                  placeholder={fieldPh(f, lang)}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading && !missing.length) onGenerate();
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-brand gap-2"
          disabled={isLoading || missing.length > 0}
          onClick={onGenerate}
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
        <div className="alert alert-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {(listItems || rawText) && (
        <div className="surface-card p-4 sm:p-5 space-y-3">
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
                  <CopyButton text={item} label="" copiedLabel="✓" className="btn btn-ghost btn-xs shrink-0" />
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
    </div>
  );
}
