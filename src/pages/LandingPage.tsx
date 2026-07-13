import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Zap,
  Globe,
  Users,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  Languages,
  Github,
  Sparkles,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS } from '../lib/tools';
import HashtagGenerator from '../features/hashtag-generator/HashtagGenerator';
import CpmCalculator from '../features/cpm-calculator/CpmCalculator';

const features = [
  { icon: Zap, titleKey: 'fastProcessing', descriptionKey: 'fastProcessingDesc' },
  { icon: Globe, titleKey: 'multiLanguage', descriptionKey: 'multiLanguageDesc' },
  { icon: Shield, titleKey: 'privacyFirst', descriptionKey: 'privacyFirstDesc' },
  { icon: Users, titleKey: 'community', descriptionKey: 'communityDesc' },
];

const faqs = [
  { q: 'toolQuestion1', a: 'toolAnswer1' },
  { q: 'toolQuestion2', a: 'toolAnswer2' },
  { q: 'toolQuestion3', a: 'toolAnswer3' },
  { q: 'toolQuestion4', a: 'toolAnswer4' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, lang, theme, toggleLang, toggleTheme } = useApp();
  const [activeEmbeddedTool, setActiveEmbeddedTool] = useState<'hashtagGenerator' | 'cpmCalculator'>(
    'hashtagGenerator'
  );
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const title = `${t.app.title} — ${t.landingPage?.metaTitle || 'Free YouTube Creator Tools'}`;
    const description =
      t.landingPage?.metaDescription ||
      'Boost your YouTube channel with free tools. Generate hashtags, calculate CPM, remove silence, create thumbnails, and more!';
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string, createAttr?: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (createAttr === 'name') el.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '');
        if (createAttr === 'property')
          el.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', description, 'name');
    setMeta('meta[property="og:title"]', 'content', title, 'property');
    setMeta('meta[property="og:description"]', 'content', description, 'property');
  }, [t, lang]);

  return (
    <div className="min-h-screen w-full bg-base-100 text-base-content">
      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-300 px-3 sm:px-6">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/assets/youtube-creator-icon.png"
              alt=""
              className="w-9 h-9 rounded-xl object-cover shadow"
            />
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              {t.app.title}
            </span>
          </Link>
        </div>
        <div className="flex-none gap-1 sm:gap-2">
          <a
            href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm btn-circle"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm btn-circle"
            title={t.app.theme?.toggle || 'Theme'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleLang}
            className="btn btn-ghost btn-sm btn-circle"
            title={lang === 'ar' ? 'English' : 'العربية'}
          >
            <Languages className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/app')} className="btn-brand btn-sm sm:btn-md gap-1.5">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">{t.landingPage?.openApp || 'Open App'}</span>
            <span className="sm:hidden">App</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-90" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" />
            {t.landingPage?.metaTitle || 'Free YouTube Creator Tools'} · MIT
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 animate-fade-in-up">
            <span className="text-gradient">
              {t.landingPage?.heroTitle || 'Supercharge Your YouTube Channel'}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto mb-8 animate-fade-in-up">
            {t.landingPage?.heroSubtitle ||
              'Free tools to help you create better content, grow your audience, and increase your revenue.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 animate-fade-in-up">
            <button
              onClick={() => navigate('/app')}
              className="btn-brand btn-lg gap-2 px-8"
            >
              {t.landingPage?.getStarted || 'Get Started'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="btn-soft btn-lg px-8"
            >
              {t.landingPage?.exploreTools || 'Explore Tools'}
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { n: '11', l: t.landingPage?.ourTools || 'Tools' },
              { n: '2', l: lang === 'ar' ? 'لغات' : 'Languages' },
              { n: '100%', l: lang === 'ar' ? 'مجاني' : 'Free' },
              { n: '0', l: lang === 'ar' ? 'حساب مطلوب' : 'Account needed' },
            ].map((stat) => (
              <div key={stat.l} className="surface-card py-4 px-3">
                <div className="text-2xl font-extrabold text-primary">{stat.n}</div>
                <div className="text-xs text-base-content/55 mt-0.5">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding py-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t.landingPage?.whyChooseUs || 'Why Choose YouCreator Tools?'}
            </h2>
            <p className="text-base-content/60 max-w-2xl mx-auto">
              {t.landingPage?.whyChooseUsDesc ||
                'Everything you need to create professional YouTube content, all in one place.'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.titleKey}
                  className="surface-card p-5 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold mb-1.5">
                    {(t.landingPage?.features as any)?.[feature.titleKey] || feature.titleKey}
                  </h3>
                  <p className="text-sm text-base-content/60 leading-relaxed">
                    {(t.landingPage?.features as any)?.[feature.descriptionKey] ||
                      feature.descriptionKey}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section id="tools" className="section-padding py-14 bg-base-200/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t.landingPage?.ourTools || 'Our Powerful Tools'}
            </h2>
            <p className="text-base-content/60 max-w-2xl mx-auto">
              {t.landingPage?.ourToolsDesc ||
                'Everything you need to create, optimize, and grow your YouTube channel.'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOOLS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => navigate(tool.path)}
                  className="text-start surface-card p-5 hover-lift animate-fade-in-up group"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold truncate">
                          {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
                        </h3>
                        {tool.badge === 'ai' && <span className="badge-ai text-[10px]">AI</span>}
                        {tool.badge === 'local' && (
                          <span className="badge-local text-[10px]">Local</span>
                        )}
                      </div>
                      <p className="text-sm text-base-content/60 line-clamp-2 mb-2">
                        {(t.landingPage as any)?.[`${tool.id}Desc`] || ''}
                      </p>
                      <div className="flex items-center text-primary font-medium text-xs">
                        {t.landingPage?.tryIt || 'Try it now'}
                        <ChevronRight className="ms-1 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live try */}
      <section className="section-padding py-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t.landingPage?.tryOurTools || 'Try Our Tools'}
            </h2>
            <p className="text-base-content/60">
              {t.landingPage?.tryOurToolsDesc ||
                'Experience some of our most popular tools right here.'}
            </p>
          </div>
          <div className="surface-card p-4 sm:p-6">
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                className={`btn btn-sm ${
                  activeEmbeddedTool === 'hashtagGenerator' ? 'btn-brand' : 'btn-soft'
                }`}
                onClick={() => setActiveEmbeddedTool('hashtagGenerator')}
              >
                {t.app.tools.hashtagGenerator?.title || 'Hashtag Generator'}
              </button>
              <button
                className={`btn btn-sm ${
                  activeEmbeddedTool === 'cpmCalculator' ? 'btn-brand' : 'btn-soft'
                }`}
                onClick={() => setActiveEmbeddedTool('cpmCalculator')}
              >
                {t.app.tools.cpmCalculator?.title || 'CPM Calculator'}
              </button>
            </div>
            {activeEmbeddedTool === 'hashtagGenerator' && (
              <HashtagGenerator lang={lang} t={t} />
            )}
            {activeEmbeddedTool === 'cpmCalculator' && <CpmCalculator t={t} />}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding py-14 bg-base-200/40">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t.landingPage?.frequentlyAsked || 'Frequently Asked Questions'}
            </h2>
            <p className="text-base-content/60">
              {t.landingPage?.frequentlyAskedDesc ||
                'Everything you need to know about our tools and services.'}
            </p>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.q} className="surface-card overflow-hidden">
                  <button
                    type="button"
                    className="w-full text-start px-5 py-4 flex items-center justify-between gap-3 font-semibold"
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    <span>
                      {(t.landingPage?.faqs as any)?.[faq.q] || faq.q}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        open ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-sm text-base-content/70 leading-relaxed">
                      {(t.landingPage?.faqs as any)?.[faq.a] || faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding py-16">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 text-center text-primary-content shadow-2xl shadow-primary/20">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            {t.landingPage?.readyToStart || 'Ready to Transform Your YouTube Channel?'}
          </h2>
          <p className="text-primary-content/85 mb-7 max-w-xl mx-auto">
            {t.landingPage?.readyToStartDesc ||
              'Join thousands of creators who are already using our tools to grow their channels.'}
          </p>
          <button
            onClick={() => navigate('/app')}
            className="btn bg-white text-primary hover:bg-white/90 border-0 btn-lg gap-2"
          >
            {t.landingPage?.startCreating || 'Start Creating Now'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-base-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src="/assets/youtube-creator-icon.png"
                alt=""
                className="w-9 h-9 rounded-lg object-cover"
              />
              <span className="font-bold">{t.app.title}</span>
            </div>
            <p className="text-sm text-base-content/60 mb-3 max-w-sm">
              {t.landingPage?.heroSubtitle}
            </p>
            <a
              href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-base-content/70 hover:text-primary"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/45 mb-3">
              {t.landingPage?.ourTools || 'Tools'}
            </h3>
            <ul className="space-y-1.5">
              {TOOLS.slice(0, 6).map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={tool.path}
                    className="text-sm text-base-content/70 hover:text-primary"
                  >
                    {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/45 mb-3">
              {t.landingPage?.about || 'About'}
            </h3>
            <p className="text-sm text-base-content/60 mb-3">
              {t.landingPage?.aboutDesc ||
                'A free open-source suite of tools for YouTube creators.'}
            </p>
            <p className="text-xs text-base-content/40">
              {t.landingPage?.copyright || '© 2026 YouCreator Tools. MIT License.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
