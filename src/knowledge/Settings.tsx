import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {Link} from 'react-router-dom';
import {
  Download,
  Upload,
  ShieldCheck,
  UserRound,
  Globe2,
  Sun,
  Database,
  Unplug,
  Check,
} from 'lucide-react';
import { useKnowledge } from './context';
import {
  profileKeys,
  parseBackup,
  mergeBackup,
  type Workspace,
  type Language,
  type Settings as SettingsType,
} from './model';
export default function Settings() {
  const { t, data, commit, busy, notify } = useKnowledge();
  const [profile, setProfile] = useState(data.profile);
  const [incoming, setIncoming] = useState<Workspace | null>(null);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const setting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) =>
    commit({ ...data, settings: { ...data.settings, [key]: value } });
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-os-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(t('backupExported'));
  }
  async function importData(file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      if (file.size > 15000000) throw new Error('invalidBackup');
      const parsed = parseBackup(await file.text());
      if (!window.confirm(t('importConfirm'))) return;
      if (await commit(mergeBackup(data, parsed))) {
        setIncoming(parsed);
        notify(t('importSuccess'));
      }
    } catch {
      setError(t('invalidBackup'));
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }
  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    await commit({ ...data, profile });
  }
  return (
    <div data-testid="page-settings" className="uko-settings-grid">
      <div>
        <section className="uko-panel">
          <div className="uko-section-heading">
            <h2>
              <Globe2 size={18} />
              {t('interfaceLanguage')}
            </h2>
          </div>
          <fieldset disabled={busy} className="uko-form-grid">
            <label>
              {t('interfaceLanguage')}
              <select
                data-testid="settings-language"
                value={data.settings.language}
                onChange={(e) => setting('language', e.target.value as Language)}
              >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </label>
            <label>
              {t('theme')}
              <select
                value={data.settings.theme}
                onChange={(e) => setting('theme', e.target.value as 'light' | 'dark')}
              >
                <option value="light">{t('light')}</option>
                <option value="dark">{t('dark')}</option>
              </select>
            </label>
            <label>
              {t('explanationLanguage')}
              <select
                value={data.settings.explanation}
                onChange={(e) => setting('explanation', e.target.value as Language)}
              >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </label>
          </fieldset>
          <p className="uko-help">{t('originalLanguage')}</p>
        </section>
        <section className="uko-panel">
          <div className="uko-section-heading">
            <h2>
              <Sun size={18} />
              {t('preferences')}
            </h2>
          </div>
          <fieldset disabled={busy} className="uko-form-grid">
            <label>
              {t('dailyMinutes')}
              <input
                type="number"
                min={15}
                max={720}
                step={5}
                defaultValue={data.settings.dailyMinutes}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isInteger(value) && value >= 15 && value <= 720)
                    setting('dailyMinutes', value);
                  else {
                    e.target.value = String(data.settings.dailyMinutes);
                    setError(t('invalidData'));
                  }
                }}
              />
            </label>
            <label>
              {t('reviewDays')}
              <input
                type="number"
                min={1}
                max={30}
                defaultValue={data.settings.reviewDays}
                onBlur={(e) => {
                  const value = Number(e.target.value);
                  if (Number.isInteger(value) && value >= 1 && value <= 30)
                    setting('reviewDays', value);
                  else {
                    e.target.value = String(data.settings.reviewDays);
                    setError(t('invalidData'));
                  }
                }}
              />
            </label>
          </fieldset>
          <p className="uko-help">{t('capacityText')}</p>
          <h3>{t('dashboardLayout')}</h3>
          <fieldset disabled={busy}>
            {(['showResources', 'showDomains'] as const).map((key) => (
              <label className="uko-check-label" key={key}>
                <input
                  type="checkbox"
                  checked={data.settings[key]}
                  onChange={(e) => setting(key, e.target.checked)}
                />
                {t(key)}
              </label>
            ))}
          </fieldset>
        </section>
        <section className="uko-panel">
          <div className="uko-section-heading">
            <h2>
              <UserRound size={18} />
              {t('profile')}
            </h2>
          </div>
          <p className="uko-help">{t('profileHelp')}</p>
          <form onSubmit={saveProfile}>
            <fieldset disabled={busy} className="uko-form-grid">
              {profileKeys.map((key) => (
                <label
                  key={key}
                  className={['name', 'level', 'track'].includes(key) ? '' : 'uko-field-full'}
                >
                  {t(key)}
                  {['name', 'level', 'track'].includes(key) ? (
                    <input
                      value={profile[key]}
                      dir="auto"
                      maxLength={10000}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  ) : (
                    <textarea
                      rows={2}
                      value={profile[key]}
                      dir="auto"
                      maxLength={10000}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  )}
                </label>
              ))}
            </fieldset>
            <div className="uko-actions wrap">
              <button className="uko-button" type="submit" disabled={busy}>
                <Check size={16} />
                {t('save')}
              </button>
              <button
                type="button"
                className="uko-text-button danger"
                disabled={busy}
                onClick={async () => {
                  if (window.confirm(t('clearProfileConfirm'))) {
                    const cleared = Object.fromEntries(
                      profileKeys.map((k) => [k, '']),
                    ) as typeof profile;
                    if (await commit({ ...data, profile: cleared })) setProfile(cleared);
                  }
                }}
              >
                {t('clearProfile')}
              </button>
            </div>
          </form>
        </section>
      </div>
      <div>
        <section className="uko-panel uko-privacy">
          <ShieldCheck size={29} />
          <h2>{t('privacy')}</h2>
          <p>{t('privacyText')}</p>
        </section>
        <section className="uko-panel">
          <div className="uko-section-heading">
            <h2>
              <Database size={18} />
              {t('backup')}
            </h2>
          </div>
          <p className="uko-help">{t('backupHelp')}</p>
          <div className="uko-backup-actions">
            <button className="uko-button" onClick={exportData} data-testid="export-backup">
              <Download size={17} />
              {t('export')}
            </button>
            <button
              className="uko-button secondary"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={17} />
              {t('import')}
            </button>
            <input
              ref={fileInput}
              className="uko-visually-hidden"
              style={{ display: 'none' }}
              type="file"
              accept="application/json,.json"
              aria-label={t('import')}
              onChange={(e) => importData(e.target.files?.[0])}
            />
            {incoming && (
              <button
                className="uko-text-button"
                onClick={async () => {
                  if (
                    window.confirm(t('restoreProfileConfirm')) &&
                    (await commit({
                      ...data,
                      profile: incoming.profile,
                      settings: incoming.settings,
                    }))
                  )
                    setProfile(incoming.profile);
                }}
              >
                {t('restoreProfile')}
              </button>
            )}
          </div>
          {error && (
            <p className="uko-error" role="alert">
              {error}
            </p>
          )}
        </section>
        <Integrations />
      </div>
    </div>
  );
}
export function Integrations() {
  const { t } = useKnowledge();
  return (
    <section className="uko-panel">
      <div className="uko-section-heading">
        <h2>
          <Unplug size={18} />
          {t('integrations')}
        </h2>
      </div>
      <p className="uko-help">{t('serviceHelp')}</p>
      <Link className="uko-button secondary" to="/knowledge/assistant">Google Drive · Gmail · Gemini — {t('brainConnection')}</Link>
      {[
        ['Notion', 'notionHelp'],
        [t('calendar'), 'calendarHelp'],
      ].map(([name, help]) => (
        <details className="uko-integration" key={help}>
          <summary>
            <strong>{name}</strong>
            <span className="uko-badge">{t('notConfigured')}</span>
          </summary>
          <p>{t(help)}</p>
        </details>
      ))}
    </section>
  );
}
export { default as Assistant } from './BrainWorkspace';
