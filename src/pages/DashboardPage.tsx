import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, Sparkles, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOL_COUNT, TOOLS } from '../lib/tools';
import { healthCheck } from '../lib/api/client';

export default function DashboardPage() {
  const { lang } = useApp();
  const [health, setHealth] = useState<{ ok: boolean; gemini?: boolean; apify?: boolean } | null>(
    null
  );

  useEffect(() => {
    healthCheck().then(setHealth);
  }, []);

  const aiCount = TOOLS.filter((t) => t.kind === 'ai' || t.kind === 'hybrid').length;
  const localCount = TOOLS.filter((t) => t.kind === 'local').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          {lang === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-base-content/60">
          {lang === 'ar'
            ? 'نظرة عامة على المنصة والحالة الأمنية للخوادم.'
            : 'Platform overview and secure backend status.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Wrench className="w-5 h-5 text-primary" />
            <span className="text-sm text-base-content/60">{lang === 'ar' ? 'الأدوات' : 'Tools'}</span>
          </div>
          <div className="text-3xl font-extrabold">{TOOL_COUNT}</div>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-secondary" />
            <span className="text-sm text-base-content/60">{lang === 'ar' ? 'ذكاء اصطناعي' : 'AI tools'}</span>
          </div>
          <div className="text-3xl font-extrabold">{aiCount}</div>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-accent" />
            <span className="text-sm text-base-content/60">{lang === 'ar' ? 'محلية' : 'On-device'}</span>
          </div>
          <div className="text-3xl font-extrabold">{localCount}</div>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm text-base-content/60">{lang === 'ar' ? 'الأمان' : 'Security'}</span>
          </div>
          <div className="text-sm font-semibold">
            {lang === 'ar' ? 'مفاتيح على الخادم فقط' : 'Server-side keys only'}
          </div>
        </div>
      </div>

      <div className="surface-card p-5 sm:p-6">
        <h2 className="font-bold text-lg mb-4">
          {lang === 'ar' ? 'حالة الـ API الآمن' : 'Secure API status'}
        </h2>
        {!health ? (
          <div className="flex items-center gap-2 text-sm opacity-70">
            <span className="loading loading-spinner loading-sm" />
            {lang === 'ar' ? 'جاري الفحص…' : 'Checking…'}
          </div>
        ) : (
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between gap-3 border-b border-base-300 py-2">
              <span>{lang === 'ar' ? 'بوابة الصحة' : 'Health gateway'}</span>
              <span className={health.ok ? 'text-success font-semibold' : 'text-error font-semibold'}>
                {health.ok ? 'OK' : 'Offline'}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 border-b border-base-300 py-2">
              <span>Gemini (server env)</span>
              <span className={health.gemini ? 'text-success font-semibold' : 'text-warning font-semibold'}>
                {health.gemini ? 'Configured' : 'Missing env'}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3 py-2">
              <span>Apify (server env)</span>
              <span className={health.apify ? 'text-success font-semibold' : 'text-warning font-semibold'}>
                {health.apify ? 'Configured' : 'Missing env'}
              </span>
            </li>
          </ul>
        )}
        <p className="text-xs text-base-content/50 mt-4 leading-relaxed">
          {lang === 'ar'
            ? 'القيم الحقيقية للمفاتيح لا تُعرض أبداً هنا ولا في الواجهة. اضبطها فقط في Netlify → Site settings → Environment variables.'
            : 'Real key values are never shown here or in the UI. Set them only in Netlify → Site settings → Environment variables.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/app" className="btn-brand">
          {lang === 'ar' ? 'فتح الاستوديو' : 'Open studio'}
        </Link>
        <Link to="/articles" className="btn-soft">
          {lang === 'ar' ? 'المقالات' : 'Articles'}
        </Link>
      </div>
    </div>
  );
}
