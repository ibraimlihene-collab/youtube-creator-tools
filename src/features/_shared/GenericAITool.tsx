import { useMemo, useState } from 'react';
import { AlertCircle, Sparkles, Eraser } from 'lucide-react';
import { useSecureAI } from '../../lib/useSecureAI';
import { useApp } from '../../context/AppContext';
import CopyButton from '../../components/CopyButton';
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

  const missing = fields.filter((f) => f.required !== false && f.type !== 'select' && !String(values[f.name] || '').trim());

  const onGenerate = async () => {
    if (missing.length) return;
    const input: Record<string, unknown> = { ...values };
    // map keywords field name used in prompts
    if (values.keywords) input.keywords = values.keywords;
    await generate(tool.aiToolId || tool.id, input, lang);
  };

  const listItems = data?.type === 'list' ? data.items : null;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-base-content/80">
        {lang === 'ar' ? (
          <>
            🔒 المفاتيح محمية على الخادم — لا تحتاج إدخال API Key. الاستخدام عبر وكيل آمن مع حد للمعدّل.
          </>
        ) : (
          <>
            🔒 API keys stay on the server — you never paste a key here. Requests go through a secured proxy with rate limits.
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => {
          const span = f.type === 'textarea' || fields.length === 1 ? 'md:col-span-2' : '';
          return (
            <div key={f.name} className={`form-control ${span}`}>
              <label className="label py-1">
                <span className="label-text font-medium">{fieldLabel(f, lang)}</span>
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
              <h3 className="text-lg font-bold">
                {lang === 'ar' ? 'النتيجة' : 'Result'}
              </h3>
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
    </div>
  );
}
