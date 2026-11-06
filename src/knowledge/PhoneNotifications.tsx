import { useEffect, useState } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brainRequest } from './brain';
import { useKnowledge } from './context';
import { checkinTranslator } from './checkin-i18n';

interface PushState { ready: boolean; publicKey?: string; enabled: boolean; expired: boolean; hour: number; timeZone: string; last: { at: string; status: string } | null }
function applicationKey(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(raw, char => char.charCodeAt(0));
}
async function worker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register('/knowledge-sw.js', { scope: '/knowledge/' });
  if (registration.active) return registration;
  await new Promise<void>((resolve, reject) => {
    const installing = registration.installing || registration.waiting;
    const timer = window.setTimeout(() => { installing?.removeEventListener('statechange', change); reject(new Error('backendUnavailable')); }, 15000);
    function change() {
      if (registration.active || installing?.state === 'activated') { clearTimeout(timer); installing?.removeEventListener('statechange', change); resolve(); }
    }
    installing?.addEventListener('statechange', change); change();
  });
  return registration;
}
export default function PhoneNotifications() {
  const { data } = useKnowledge();
  const t = checkinTranslator(data.settings.language);
  const supported = window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const [state, setState] = useState<PushState | null>(null), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [working, setWorking] = useState(false), [hour, setHour] = useState(8), [zone, setZone] = useState('Africa/Casablanca');
  const [permission, setPermission] = useState(supported ? Notification.permission : 'default');
  async function status() {
    const response = await brainRequest('push-status') as PushState;
    setState(response); setHour(response.hour); setZone(response.timeZone);
  }
  useEffect(() => { void brainRequest('push-status').then(response => { setState(response); setHour(response.hour); setZone(response.timeZone); }).catch(e => setError(e.message)); }, []);
  async function action(fn: () => Promise<void>) {
    setWorking(true); setError(''); setMessage('');
    try { await fn(); } catch (e) { setError(e instanceof Error && t(e.message) !== e.message ? e.message : 'backendUnavailable'); }
    finally { setWorking(false); if (supported) setPermission(Notification.permission); }
  }
  async function enable() {
    if (!supported || !state?.ready) return;
    await action(async () => {
      const granted = await Notification.requestPermission();
      if (granted !== 'granted') { setPermission(granted); return; }
      const registration = await worker();
      let existing = await registration.pushManager.getSubscription();
      if (existing && (state.expired || !state.enabled)) { await existing.unsubscribe(); existing = null; }
      const subscription = existing || await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationKey(state.publicKey!) });
      await brainRequest('push-subscribe', { subscription: subscription.toJSON(), hour, timeZone: zone, language: data.settings.language });
      await status(); setMessage('pushQueued');
    });
  }
  return <section className="uko-panel uko-phone" data-testid="phone-notifications">
    <h2><Bell size={20} />{t('notifications')}</h2><p>{t('pushHelp')}</p><p className="uko-help">{t('pushPrivacy')}</p>
    <p>{t('permission')}: {t(permission)}</p>
    {!supported && <p className="uko-info">{t('unsupported')}</p>}
    <p data-testid="push-status" className="uko-info">{state ? t(state.ready ? state.enabled ? 'pushEnabled' : 'pushDisabled' : 'pushSetupNeeded') : t(error || 'pushSetupNeeded')}</p>
    <div className="uko-form-grid">
      <label>{t('pushHour')}<input type="number" min={7} max={21} value={hour} onChange={e => setHour(Number(e.target.value))} /></label>
      <label>{t('timezone')}<input dir="ltr" value={zone} maxLength={100} onChange={e => setZone(e.target.value)} /></label>
    </div>
    <div className="uko-actions wrap">
      <button className="uko-button" data-testid="push-enable" disabled={working || !supported || !state?.ready || !Number.isInteger(hour) || hour < 7 || hour > 21} onClick={() => void enable()}>{t('enable')}</button>
      <button className="uko-button secondary" data-testid="push-test" disabled={working || !state?.enabled || !state.ready} onClick={() => void action(async () => { try { await brainRequest('push-test', {}); setMessage('pushSent'); } finally { await status(); } })}>{t('test')}</button>
      <button className="uko-text-button" disabled={working || !state?.enabled} onClick={() => {
        if (window.confirm(t('disableConfirm'))) void action(async () => {
          await brainRequest('push-disable', {}); await status();
          const registration = supported ? await navigator.serviceWorker.getRegistration('/knowledge/') : null;
          const subscription = await registration?.pushManager.getSubscription();
          await subscription?.unsubscribe(); setMessage('pushStopped');
        });
      }}>{t('disable')}</button>
      <button className="uko-text-button" disabled={working} onClick={() => void action(status)}><RefreshCw size={15} />{t('refresh')}</button>
    </div>
    {state?.last && <p dir="auto">{t('last')}: <bdi>{state.last.at}</bdi> · {t(state.last.status)}</p>}
    {state?.expired && <p className="uko-info">{t('pushExpired')}</p>}
    {working && <p role="status">{t('working')}</p>}
    {error && <p role="alert" className="uko-error">{t(error)}</p>}
    {message && <p role="status">{t(message)}</p>}
    <p className="uko-help">{t('deployment')}</p><Link className="uko-text-button" to="/knowledge/assistant">{t('back')}</Link>
  </section>;
}
