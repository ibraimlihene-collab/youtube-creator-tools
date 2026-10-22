import { useState, useRef, useEffect } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { X, Trash2, Pencil, ArrowUpRight, Link2, Check, Plus, BookOpen } from 'lucide-react';
import { useKnowledge } from './context';
import { fieldSets } from './config';
import {
  kinds,
  statuses,
  evidenceLevels,
  subjectDefs,
  scienceSubjects,
  validateEntry,
  safeUrl,
  linkedEntries,
  today,
  addDays,
  type Entry,
  type Kind,
} from './model';
import { domains } from './i18n';

export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const { t } = useKnowledge();
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    const cancel = (event: Event) => {
      event.preventDefault();
      closeRef.current();
    };
    dialog.addEventListener('cancel', cancel);
    return () => {
      dialog.removeEventListener('cancel', cancel);
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`uko-dialog ${wide ? 'wide' : ''}`}
      aria-labelledby="uko-dialog-title"
    >
      <header>
        <h2 id="uko-dialog-title">{title}</h2>
        <button type="button" className="uko-icon-button" onClick={onClose} aria-label={t('close')}>
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Editor({ initial, onClose }: { initial: Entry; onClose: () => void }) {
  const { data, t, busy, update } = useKnowledge();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const field = (key: string, value: string) =>
    setDraft((d) => ({ ...d, fields: { ...d.fields, [key]: value } }));
  const changeKind = (kind: Kind) => setDraft((d) => ({ ...d, kind }));
  const close = () => {
    if (
      !busy &&
      (JSON.stringify(draft) === JSON.stringify(initial) || window.confirm(t('unsavedConfirm')))
    )
      onClose();
  };
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const cleaned = { ...draft, title: draft.title.trim(), updatedAt: new Date().toISOString() };
    if (!cleaned.title) return setError(t('required'));
    if (cleaned.fields.url && !safeUrl(cleaned.fields.url)) return setError(t('invalidUrl'));
    if (['flashcard', 'vocabulary'].includes(cleaned.kind) && !cleaned.fields.answer?.trim())
      return setError(t('answerRequired'));
    if (!validateEntry(cleaned)) return setError(t('invalidData'));
    if (await update(cleaned)) onClose();
  }
  const allSubjects = [
    ...subjectDefs.map(([id, name]) => ({ id, name })),
    ...data.records.filter((e) => e.kind === 'subject').map((e) => ({ id: e.id, name: e.title })),
  ];
  const customDomains = data.records.filter((e) => e.kind === 'domain');
  const allFields = fieldSets[draft.kind];
  const visibleFields = advanced
    ? allFields
    : allFields.slice(
        0,
        ['lesson', 'session', 'flashcard', 'vocabulary'].includes(draft.kind) ? 9 : 6,
      );
  const renderField = (key: string) => {
    const value = draft.fields[key] || '';
    const options =
      key === 'subject'
        ? allSubjects.map((s) => [s.id, s.name])
        : key === 'domain'
          ? [
              ...domains.map((d) => [d[0], d[data.settings.language === 'ar' ? 1 : 2]]),
              ...customDomains.map((d) => [d.id, d.title]),
            ]
          : key === 'evidence'
            ? evidenceLevels.map((e) => [e, t(e)])
            : key === 'claimType'
              ? [
                  'fact',
                  'interpretation',
                  'opinion',
                  'hypothesis',
                  'prediction',
                  'reflection',
                  'identity',
                ].map((e) => [e, t(e)])
              : key === 'priority' || key === 'difficulty'
                ? ['high', 'normal', 'low'].map((e) => [e, t(e)])
                : key === 'mistakeType'
                  ? ['conceptual', 'calculation', 'prerequisite', 'instruction'].map((e) => [
                      e,
                      t(e),
                    ])
                  : key === 'explanationLanguage'
                    ? [
                        ['ar', t('arabic')],
                        ['fr', t('french')],
                        ['en', t('english')],
                      ]
                    : null;
    const type = ['date', 'published', 'reviewDate'].includes(key)
      ? 'date'
      : key === 'time'
        ? 'time'
        : ['duration', 'confidence'].includes(key)
          ? 'number'
          : key === 'url'
            ? 'url'
            : null;
    const french =
      [
        'definition',
        'formula',
        'example',
        'explanationFr',
        'exercise',
        'solution',
        'hints',
      ].includes(key) && scienceSubjects.includes(draft.fields.subject);
    return (
      <label key={key} className={options || type ? '' : 'uko-field-full'}>
        {t(key)}
        {options ? (
          <select
            data-testid={`field-${key}`}
            value={value}
            onChange={(e) => {
              field(key, e.target.value);
              if (
                key === 'subject' &&
                draft.kind === 'lesson' &&
                scienceSubjects.includes(e.target.value)
              )
                setDraft((d) => ({ ...d, language: 'fr' }));
            }}
          >
            <option value="">—</option>
            {options.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        ) : type ? (
          <input
            data-testid={`field-${key}`}
            type={type}
            value={value}
            min={key === 'duration' ? 1 : key === 'confidence' ? 0 : undefined}
            max={key === 'duration' ? 1440 : key === 'confidence' ? 5 : undefined}
            onChange={(e) => field(key, e.target.value)}
            dir={type === 'url' ? 'ltr' : undefined}
          />
        ) : (
          <textarea
            data-testid={`field-${key}`}
            rows={key.includes('explanation') || key === 'answer' ? 3 : 2}
            maxLength={100000}
            value={value}
            dir={
              key === 'explanationAr' ? 'rtl' : french || key === 'explanationFr' ? 'ltr' : 'auto'
            }
            lang={
              key === 'explanationAr' ? 'ar' : french || key === 'explanationFr' ? 'fr' : undefined
            }
            onChange={(e) => field(key, e.target.value)}
          />
        )}
      </label>
    );
  };
  return (
    <Dialog
      title={`${data.records.some((e) => e.id === initial.id) ? t('edit') : t('create')} · ${t(draft.kind)}`}
      onClose={close}
      wide
    >
      <form onSubmit={submit} className="uko-editor" data-testid="record-editor">
        <div className="uko-form-grid">
          <label>
            {t('kind')}
            <select
              data-testid="record-kind"
              value={draft.kind}
              onChange={(e) => changeKind(e.target.value as Kind)}
            >
              {kinds.map((k) => (
                <option value={k} key={k}>
                  {t(k)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('language')}
            <select
              value={draft.language}
              onChange={(e) => setDraft((d) => ({ ...d, language: e.target.value }))}
            >
              {['ar', 'fr', 'en', 'other'].map((l, i) => (
                <option value={l} key={l}>
                  {t(['arabic', 'french', 'english', 'other'][i])}
                </option>
              ))}
            </select>
          </label>
          <label className="uko-field-full">
            {t('title')}
            <input
              data-testid="record-title"
              autoFocus
              value={draft.title}
              maxLength={500}
              required
              dir="auto"
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </label>
          <label className="uko-field-full">
            {t('content')}
            <textarea
              data-testid="record-content"
              rows={4}
              value={draft.content}
              maxLength={100000}
              dir="auto"
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
            />
          </label>
          <label>
            {t('status')}
            <select
              data-testid="record-status"
              value={draft.status}
              onChange={(e) =>
                setDraft((d) => ({ ...d, status: e.target.value as Entry['status'] }))
              }
            >
              {statuses.map((s) => (
                <option value={s} key={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('tags')}
            <input
              value={draft.tags.join(', ')}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  tags: e.target.value
                    .split(/[,،]/)
                    .map((v) => v.trim())
                    .slice(0, 100),
                }))
              }
            />
          </label>
          {draft.kind === 'lesson' && <p className="uko-info uko-field-full">{t('scienceHelp')}</p>}
          {draft.kind === 'resource' && (
            <p className="uko-info uko-field-full">{t('resourceReflection')}</p>
          )}
          {visibleFields.map(renderField)}
        </div>
        {allFields.length > visibleFields.length && (
          <button type="button" className="uko-text-button" onClick={() => setAdvanced(true)}>
            <Plus size={16} />
            {t('more')} ({allFields.length - visibleFields.length})
          </button>
        )}
        <details className="uko-links-picker">
          <summary>
            <Link2 size={15} />
            {t('links')} ({draft.links.length})
          </summary>
          <div>
            {data.records
              .filter((e) => e.id !== draft.id)
              .map((e) => (
                <label className="uko-check-label" key={e.id}>
                  <input
                    type="checkbox"
                    checked={draft.links.includes(e.id)}
                    onChange={(event) =>
                      setDraft((d) => ({
                        ...d,
                        links: event.target.checked
                          ? [...d.links, e.id]
                          : d.links.filter((id) => id !== e.id),
                      }))
                    }
                  />
                  <span dir="auto">{e.title}</span>
                  <small>{t(e.kind)}</small>
                </label>
              ))}
            {data.records.length === 0 && <p>{t('noLinks')}</p>}
          </div>
        </details>
        <p className="uko-help">{t('originalLanguage')}</p>
        {error && (
          <p className="uko-error" role="alert">
            {error}
          </p>
        )}
        <footer>
          <button type="button" className="uko-button secondary" onClick={close} disabled={busy}>
            {t('cancel')}
          </button>
          <button type="submit" className="uko-button" disabled={busy} data-testid="save-record">
            <Check size={16} />
            {t(busy ? 'saving' : 'save')}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
export function EntryDetail({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const { t, data, edit, inspect, create, remove, update } = useKnowledge();
  const [mode, setMode] = useState('tutor');
  const [attempt, setAttempt] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const links = linkedEntries(entry, data.records);
  const hidden = ['solution', 'hints', 'exercise', 'answer'];
  const locale = data.settings.language === 'ar' ? 'ar-MA' : 'fr-MA';
  return (
    <Dialog title={t(entry.kind)} onClose={onClose} wide>
      <div className="uko-detail" data-testid="record-detail">
        <div className="uko-detail-top">
          <span className={`uko-badge ${entry.status}`}>{t(entry.status)}</span>
          <div className="uko-actions">
            <button
              className="uko-icon-button"
              aria-label={t('edit')}
              onClick={() => {
                onClose();
                edit(entry);
              }}
              data-testid="edit-record"
            >
              <Pencil size={18} />
            </button>
            <button
              className="uko-icon-button danger"
              aria-label={t('delete')}
              data-testid="delete-record"
              onClick={async () => {
                if (window.confirm(t('deleteConfirm')) && (await remove(entry.id))) onClose();
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <h2 dir="auto">{entry.title}</h2>
        <p className="uko-body-text" dir="auto">
          {entry.content}
        </p>
        <div className="uko-tags">
          {entry.tags.filter(Boolean).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
        <dl>
          {Object.entries(entry.fields)
            .filter(([key, value]) => value && !hidden.includes(key))
            .map(([key, value]) => (
              <div key={key}>
                <dt>{t(key)}</dt>
                <dd dir="auto">
                  {key === 'url' && safeUrl(value) ? (
                    <a href={value} target="_blank" rel="noopener noreferrer">
                      {value}
                      <ArrowUpRight size={14} />
                    </a>
                  ) : key === 'subject' ? (
                    subjectDefs.find((s) => s[0] === value)?.[1] ||
                    data.records.find((e) => e.id === value)?.title ||
                    value
                  ) : key === 'domain' ? (
                    domains.find((d) => d[0] === value)?.[
                      data.settings.language === 'ar' ? 1 : 2
                    ] ||
                    data.records.find((e) => e.id === value)?.title ||
                    value
                  ) : key === 'explanationLanguage' ? (
                    t(value === 'ar' ? 'arabic' : value === 'fr' ? 'french' : 'english')
                  ) : ['evidence', 'claimType', 'priority', 'difficulty', 'mistakeType'].includes(
                      key,
                    ) ? (
                    t(value)
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
        </dl>
        {entry.kind === 'lesson' && entry.fields.exercise && (
          <section className="uko-practice">
            <h3>
              <BookOpen size={18} />
              {t('practice')}
            </h3>
            <p>{t('practiceHelp')}</p>
            <div className="uko-tabs">
              {['tutor', 'examination'].map((m) => (
                <button
                  key={m}
                  className={mode === m ? 'selected' : ''}
                  onClick={() => {
                    setMode(m);
                    setRevealed(false);
                    setSubmitted(false);
                    setHintCount(0);
                  }}
                >
                  {t(m)}
                </button>
              ))}
            </div>
            <p dir="auto" className="uko-body-text">
              {entry.fields.exercise}
            </p>
            <label>
              {t('attempt')}
              <textarea
                data-testid="practice-attempt"
                value={attempt}
                rows={3}
                dir="auto"
                onChange={(e) => setAttempt(e.target.value)}
              />
            </label>
            {mode === 'tutor' && entry.fields.hints && (
              <>
                <button
                  className="uko-button secondary"
                  onClick={() => setHintCount((n) => n + 1)}
                  disabled={hintCount >= entry.fields.hints.split('\n').length}
                >
                  {t('hint')}
                </button>
                {entry.fields.hints
                  .split('\n')
                  .slice(0, hintCount)
                  .map((h, i) => (
                    <p key={i} dir="auto">
                      {h}
                    </p>
                  ))}
              </>
            )}
            {!submitted ? (
              <button
                className="uko-button"
                disabled={!attempt.trim()}
                onClick={async () => {
                  if (
                    await update({
                      ...entry,
                      fields: { ...entry.fields, attempt },
                      updatedAt: new Date().toISOString(),
                    })
                  )
                    setSubmitted(true);
                }}
              >
                {t('submitAttempt')}
              </button>
            ) : (
              <button className="uko-button" onClick={() => setRevealed(true)}>
                {t('revealSolution')}
              </button>
            )}
            {revealed && (
              <div className="uko-info">
                <p dir="auto" className="uko-body-text">
                  {entry.fields.solution || t('noSolution')}
                </p>
                {entry.fields.solution && <small>{t('userSolution')}</small>}
                <button
                  className="uko-text-button"
                  onClick={() =>
                    create(
                      'mistake',
                      {
                        subject: entry.fields.subject || '',
                        attempt,
                        solution: entry.fields.solution || '',
                      },
                      [entry.id],
                    )
                  }
                >
                  {t('mistake')}
                </button>
              </div>
            )}
          </section>
        )}
        {['flashcard', 'vocabulary'].includes(entry.kind) && (
          <section className="uko-practice">
            <button className="uko-button secondary" onClick={() => setRevealed((v) => !v)}>
              {t('revealAnswer')}
            </button>
            {revealed && (
              <p className="uko-body-text" dir="auto">
                {entry.fields.answer}
              </p>
            )}
            <h3>{t('reviewHistory')}</h3>
            {entry.reviews.map((r, i) => (
              <p key={i}>
                {new Date(r.at).toLocaleDateString(locale)} · {t(r.rating)}
              </p>
            ))}
          </section>
        )}
        {['project', 'goal', 'path'].includes(entry.kind) &&
          links.some((e) =>
            ['task', 'homework', 'milestone', 'project', 'lesson'].includes(e.kind),
          ) && (
            <section className="uko-info">
              {t('completedTasks')}:{' '}
              {
                links.filter(
                  (e) =>
                    ['task', 'homework', 'milestone', 'project', 'lesson'].includes(e.kind) &&
                    e.status === 'completed',
                ).length
              }{' '}
              /{' '}
              {
                links.filter((e) =>
                  ['task', 'homework', 'milestone', 'project', 'lesson'].includes(e.kind),
                ).length
              }
            </section>
          )}
        <section className="uko-link-section">
          <h3>
            <Link2 size={17} />
            {t('linked')}
          </h3>
          {links.length ? (
            links.map((e) => (
              <button
                key={e.id}
                className="uko-link-row"
                onClick={() => {
                  onClose();
                  inspect(e);
                }}
              >
                <span dir="auto">{e.title}</span>
                <small>{t(e.kind)}</small>
                <ArrowUpRight size={15} />
              </button>
            ))
          ) : (
            <p className="uko-help">{t('noLinks')}</p>
          )}
        </section>
        <div className="uko-actions wrap">
          <button
            className="uko-button secondary"
            onClick={() =>
              create('task', { nextAction: entry.fields.nextAction || '' }, [entry.id])
            }
          >
            <Plus size={15} />
            {t('task')}
          </button>
          {!['flashcard', 'vocabulary'].includes(entry.kind) && (
            <button
              className="uko-button secondary"
              onClick={() =>
                create('flashcard', { subject: entry.fields.subject || '', reviewDate: today() }, [
                  entry.id,
                ])
              }
            >
              {t('createCard')}
            </button>
          )}
          <button
            className="uko-button secondary"
            onClick={() =>
              create(
                'session',
                {
                  date: addDays(today(), data.settings.reviewDays),
                  subject: entry.fields.subject || '',
                  duration: '25',
                },
                [entry.id],
              )
            }
          >
            {t('scheduleReview')}
          </button>
          {entry.kind === 'idea' && (
            <button
              className="uko-button secondary"
              onClick={async () => {
                if (
                  await update({
                    ...entry,
                    kind: 'project',
                    status: 'next',
                    updatedAt: new Date().toISOString(),
                  })
                )
                  onClose();
              }}
            >
              {t('convertProject')}
            </button>
          )}
        </div>
        <p className="uko-help">
          {t('created')}: {new Date(entry.createdAt).toLocaleDateString(locale)} · {t('modified')}:{' '}
          {new Date(entry.updatedAt).toLocaleDateString(locale)}
        </p>
      </div>
    </Dialog>
  );
}
