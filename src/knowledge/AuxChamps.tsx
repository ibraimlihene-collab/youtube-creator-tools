import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Download, ExternalLink, Check, Play, Pause, Volume2 } from 'lucide-react';
import { useKnowledge } from './context';
import { bookChecked, bookCrossCheck, bookSource, readingSections } from './auxChampsContent';
import { bookLessonId } from './schoolPack';

function AudioPlayer({ src }: { src: string }) {
  const { t } = useKnowledge();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [rate, setRate] = useState('1');
  return (
    <div className="uko-reading-audio">
      <div className="uko-actions wrap">
        <button
          className="uko-button secondary"
          data-testid="play-reading"
          onClick={async () => {
            setError(false);
            if (playing) ref.current?.pause();
            else
              try {
                await ref.current?.play();
              } catch {
                setError(true);
              }
          }}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {t(playing ? 'pauseAudio' : 'playAudio')}
        </button>
        <label className="uko-audio-rate">
          {t('audioRate')}
          <select
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              if (ref.current) ref.current.playbackRate = Number(e.target.value);
            }}
          >
            <option value="0.8">0.8×</option>
            <option value="1">1×</option>
            <option value="1.2">1.2×</option>
          </select>
        </label>
      </div>
      <audio
        ref={ref}
        controls
        preload="metadata"
        src={src}
        data-testid="reader-audio"
        aria-label={t('playAudio')}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setError(true)}
      />
      {error && (
        <p role="alert" className="uko-error">
          {t('audioError')}
        </p>
      )}
    </div>
  );
}

function Scene({ index }: { index: number }) {
  const { data, t, update, busy, inspect } = useKnowledge();
  const section = readingSections[index];
  const record = data.records.find((e) => e.id === section.id);
  const [view, setView] = useState('parallel');
  const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>);
  return (
    <>
      <div className="uko-reading-scene-heading">
        <div>
          <span className="uko-kicker">
            {t('scene')} {index + 1} / {readingSections.length}
          </span>
          <h2 dir="ltr">{section.titleFr}</h2>
          <p lang="ar" dir="rtl">
            {section.titleAr}
          </p>
        </div>
        <Volume2 size={25} />
      </div>
      <AudioPlayer key={section.id} src={section.audio} />
      <p className="uko-help">
        {t('syntheticAudio')} {t('audioReferenceNotice')}
      </p>
      <div className="uko-tabs uko-reading-tabs" aria-label={t('language')}>
        {[
          ['parallel', 'parallelReading'],
          ['fr', 'frenchReading'],
          ['ar', 'arabicReading'],
        ].map(([id, key]) => (
          <button
            key={id}
            className={view === id ? 'selected' : ''}
            aria-pressed={view === id}
            data-testid={`reader-view-${id}`}
            onClick={() => setView(id)}
          >
            {t(key)}
          </button>
        ))}
      </div>
      <div className={`uko-reading-text ${view === 'parallel' ? 'parallel' : ''}`}>
        {view !== 'ar' && (
          <article lang="fr" dir="ltr" data-testid="french-original">
            <h3>{t('originalText')}</h3>
            {paragraphs(record ? record.content : section.original)}
          </article>
        )}
        {view !== 'fr' && (
          <article lang="ar" dir="rtl" data-testid="arabic-translation">
            <h3>{t('arabicTranslation')}</h3>
            {paragraphs(record?.fields.explanationAr ?? section.translation)}
          </article>
        )}
      </div>
      <section className="uko-reading-practice">
        <h3>{t('literatureQuestions')}</h3>
        <p dir="ltr" lang="fr">
          {section.questionFr}
        </p>
        <p dir="rtl" lang="ar">
          {section.questionAr}
        </p>
        <p className="uko-help">{t('readerPractice')}</p>
        {record ? (
          <>
            <div className="uko-actions wrap">
              <button
                className="uko-button"
                disabled={busy}
                data-testid="reader-notes"
                onClick={() => inspect(record)}
              >
                {t('readerNotes')}
              </button>
              <button
                className="uko-button secondary"
                disabled={busy || record.status === 'completed'}
                data-testid="mark-scene-read"
                onClick={() =>
                  update({ ...record, status: 'completed', updatedAt: new Date().toISOString() })
                }
              >
                <Check size={16} />
                {t(record.status === 'completed' ? 'markedRead' : 'markRead')}
              </button>
            </div>
          </>
        ) : (
          <p className="uko-info">{t('readerDeleted')}</p>
        )}
      </section>
    </>
  );
}

export default function AuxChamps() {
  const { data, t, inspect } = useKnowledge();
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get('scene'));
  const index =
    Number.isInteger(requested) && requested >= 1 && requested <= readingSections.length
      ? requested - 1
      : 0;
  const read = readingSections.filter((s) =>
    data.records.some((e) => e.id === s.id && e.status === 'completed'),
  ).length;
  return (
    <div className="uko-reading" data-testid="page-reading">
      <Link className="uko-text-button" to="/knowledge/school">
        ← {t('school')}
      </Link>
      <header className="uko-reading-intro">
        <span className="uko-kicker">{t('bookKicker')}</span>
        <h2 lang="fr" dir="ltr">
          Aux champs<span>Guy de Maupassant</span>
        </h2>
        <p>{t('bookIntro')}</p>
        <p className="uko-help">{t('translationNotice')}</p>
      </header>
      <div className="uko-reading-downloads">
        <a download className="uko-text-button" href="/knowledge/aux-champs/original-fr.txt">
          <Download size={15} />
          {t('downloadOriginal')}
        </a>
        <a download className="uko-text-button" href="/knowledge/aux-champs/traduction-ar.txt">
          <Download size={15} />
          {t('downloadTranslation')}
        </a>
        <a download className="uko-text-button" href="/knowledge/aux-champs/complete-ar.mp3">
          <Download size={15} />
          {t('downloadAudio')}
        </a>
      </div>
      <div className="uko-reading-progress">
        <BookOpen size={17} />
        <span data-testid="reading-progress">
          {read} / {readingSections.length} {t('readingProgress')}
        </span>
        <small>{t('readingProgressHelp')}</small>
      </div>
      {data.records.find((e) => e.id === bookLessonId) && (
        <button
          className="uko-button secondary"
          data-testid="reading-guide"
          onClick={() => inspect(data.records.find((e) => e.id === bookLessonId)!)}
        >
          <BookOpen size={17} />
          {t('revisionGuide')}
        </button>
      )}
      <nav className="uko-reading-scenes" aria-label={t('scene')}>
        {readingSections.map((s, i) => (
          <button
            key={s.id}
            aria-current={i === index ? 'step' : undefined}
            className={i === index ? 'selected' : ''}
            data-testid={`reading-scene-${i + 1}`}
            onClick={() => setParams({ scene: String(i + 1) })}
          >
            <span>{String(i + 1).padStart(2, '0')}</span>
            <strong>{data.settings.language === 'ar' ? s.titleAr : s.titleFr}</strong>
            {data.records.some((e) => e.id === s.id && e.status === 'completed') && (
              <Check size={15} />
            )}
          </button>
        ))}
      </nav>
      <section className="uko-panel uko-reading-panel">
        <Scene key={index} index={index} />
      </section>
      <footer className="uko-panel uko-reading-sources">
        <h3>{t('source')}</h3>
        <p>
          {t('sourceChecked')}{' '}
          <time dateTime={bookChecked}>
            {new Date(`${bookChecked}T12:00:00`).toLocaleDateString(
              data.settings.language === 'ar' ? 'ar-MA' : 'fr-MA',
            )}
          </time>
        </p>
        <a href={bookSource} target="_blank" rel="noreferrer">
          Project Gutenberg · 11714 <ExternalLink size={14} />
        </a>
        <a href={bookCrossCheck} target="_blank" rel="noreferrer">
          {t('sourceCrossCheck')} · maupassant.free.fr <ExternalLink size={14} />
        </a>
        <p className="uko-help">{t('editionNotice')}</p>
      </footer>
    </div>
  );
}
