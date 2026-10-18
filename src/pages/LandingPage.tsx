import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Github,
  Languages,
  Moon,
  Play,
  Shield,
  Sparkles,
  Sun,
  Zap,
  Globe,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS, TOOL_COUNT } from '../lib/tools';

const LandingPage = () => {
  const navigate = useNavigate();
  const { lang, theme, toggleLang, toggleTheme } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const rtl = lang === 'ar';

  useEffect(() => {
    document.title =
      lang === 'ar'
        ? 'YouCreator Tools — أدوات يوتيوب احترافية وآمنة'
        : 'YouCreator Tools — Pro YouTube creator tools';
  }, [lang]);

  const featured = TOOLS.slice(0, 9);
  const faqs =
    lang === 'ar'
      ? [
          {
            q: 'هل الموقع مجاني؟',
            a: 'نعم. الأدوات الأساسية مجانية. مفاتيح الذكاء الاصطناعي تُدار على الخادم ولا تُطلب منك.',
          },
          {
            q: 'أين تُخزَّن مفاتيح API؟',
            a: 'على خادم Netlify فقط كمتغيرات بيئة. المتصفح لا يراها ولا يمكن استخراجها من الواجهة.',
          },
          {
            q: 'هل ترفعون ملفاتي؟',
            a: 'لا. إزالة الصمت تعمل محلياً في متصفحك. طلبات AI ترسل النص فقط عبر وكيل آمن.',
          },
          {
            q: 'كم عدد الأدوات؟',
            a: `${TOOL_COUNT} أداة احترافية لصنّاع يوتيوب — بدون حشو أو تكرار.`,
          },
        ]
      : [
          {
            q: 'Is it free?',
            a: 'Yes. Core tools are free. AI provider keys are managed server-side — you are never asked to paste them.',
          },
          {
            q: 'Where are API keys stored?',
            a: 'Only in Netlify environment variables on the server. The browser never receives them.',
          },
          {
            q: 'Do you upload my files?',
            a: 'No. Silence removal runs locally in your browser. AI calls send text only through a secure proxy.',
          },
          {
            q: 'How many tools?',
            a: `${TOOL_COUNT} professional YouTube tools — no filler, no duplicates.`,
          },
        ];

  return (
    <div className="min-h-screen w-full bg-base-100 text-base-content">
      <nav className="navbar sticky top-0 z-50 bg-base-100/80 backdrop-blur-xl border-b border-base-300 px-3 sm:px-6">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow">
              <Play className="w-4 h-4 text-primary-content fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">
              YouCreator <span className="text-primary">Tools</span>
            </span>
          </Link>
        </div>
        <div className="flex-none gap-1 sm:gap-2 items-center">
          <Link to="/articles" className="btn btn-ghost btn-sm hidden sm:inline-flex gap-1">
            <BookOpen className="w-4 h-4" />
            {lang === 'ar' ? 'مقالات' : 'Articles'}
          </Link>
          <a
            href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm btn-circle"
          >
            <Github className="w-4 h-4" />
          </a>
          <button onClick={toggleTheme} className="btn btn-ghost btn-sm btn-circle" type="button">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button onClick={toggleLang} className="btn btn-ghost btn-sm btn-circle" type="button">
            <Languages className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/app')} className="btn-brand btn-sm sm:btn-md gap-1.5" type="button">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'ar' ? 'افتح الاستوديو' : 'Open studio'}</span>
            <span className="sm:hidden">App</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-90" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Shield className="w-3.5 h-3.5" />
            {lang === 'ar'
              ? 'مفاتيح محمية على الخادم · مفتوح المصدر · MIT'
              : 'Server-side keys · Open source · MIT'}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-[1.15]">
            <span className="text-gradient">
              {lang === 'ar' ? 'من قرية صغيرة' : 'From a small village'}
            </span>
            <br />
            <span>
              {lang === 'ar' ? 'إلى منصة لصنّاع العالم' : 'to a platform for global creators'}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto mb-8">
            {lang === 'ar'
              ? `${TOOL_COUNT} أداة يوتيوب احترافية — سريعة، آمنة، ومجانية. صُنعت بشغف لت حل مشاكل حقيقية في البحث والكتابة والنشر والنمو.`
              : `${TOOL_COUNT} professional YouTube tools — fast, secure, free. Built with passion to solve real research, writing, publishing, and growth problems.`}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => navigate('/app')} className="btn-brand btn-lg gap-2 px-8" type="button">
              {lang === 'ar' ? 'ابدأ مجاناً' : 'Start free'}
              {rtl ? null : <ArrowRight className="w-5 h-5" />}
            </button>
            <button
              onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-soft btn-lg px-8"
              type="button"
            >
              {lang === 'ar' ? 'اقرأ القصة' : 'Read the story'}
            </button>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { n: String(TOOL_COUNT), l: lang === 'ar' ? 'أداة' : 'Tools' },
              { n: '2', l: lang === 'ar' ? 'لغات' : 'Languages' },
              { n: '0', l: lang === 'ar' ? 'مفتاح في المتصفح' : 'Browser keys' },
              { n: '100%', l: lang === 'ar' ? 'مجاني للبدء' : 'Free to start' },
            ].map((stat) => (
              <div key={stat.l} className="surface-card py-4 px-3">
                <div className="text-2xl font-extrabold text-primary">{stat.n}</div>
                <div className="text-xs text-base-content/55 mt-0.5">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="section-padding py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-content font-black text-xl">
                I
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {lang === 'ar' ? 'إبراهيم' : 'Ibrahim'}
                </h3>
                <p className="text-sm text-base-content/55">
                  {lang === 'ar'
                    ? 'مطور علّم نفسه · المغرب'
                    : 'Self-taught developer · Morocco'}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-base-content/75 leading-relaxed">
              {lang === 'ar' ? (
                <>
                  <p>
                    بدأت من قرية صغيرة بشغف ليوتيوب والبرمجة. لاحظت أن كثيراً من أدوات الصنّاع إما
                    مدفوعة أو تطلب لصق مفاتيح API في المتصفح — وهذا غير آمن.
                  </p>
                  <p>
                    بمساعدة عائلتي وأدوات الذكاء الاصطناعي للتعلّم، بنيت YouCreator Tools كأول مشروع
                    مفتوح المصدر: أدوات تحترم الخصوصية، تعمل بسرعة، وتُدار مفاتيحها على الخادم.
                  </p>
                  <p className="text-primary font-semibold">
                    الرؤية: أفضل منصة مساعدة لصنّاع يوتيوب — مجانية للبدء، آمنة بالتصميم، وجاهزة للنمو.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    I started from a small village with a passion for YouTube and code. Too many
                    creator tools were paid walls — or asked you to paste API keys in the browser.
                    That is unsafe.
                  </p>
                  <p>
                    With family support and AI-assisted learning, I built YouCreator Tools as my
                    first open-source project: privacy-respecting tools with server-side secrets.
                  </p>
                  <p className="text-primary font-semibold">
                    Vision: the best AI helper platform for YouTube creators — free to start, secure
                    by design, ready to scale.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: Shield,
                t: lang === 'ar' ? 'أمان أولاً' : 'Security first',
                d:
                  lang === 'ar'
                    ? 'لا مفاتيح في localStorage. وكيل Netlify + حد معدّل + رفض مفاتيح العميل.'
                    : 'No keys in localStorage. Netlify proxy + rate limits + client key rejection.',
              },
              {
                icon: Zap,
                t: lang === 'ar' ? 'تكلفة منخفضة' : 'Low operating cost',
                d:
                  lang === 'ar'
                    ? 'نماذج Gemini Flash-Lite / Gemma للمهام الخفيفة — جودة عالية بأقل توكنات.'
                    : 'Gemini Flash-Lite / Gemma for light tasks — quality with minimal tokens.',
              },
              {
                icon: Globe,
                t: lang === 'ar' ? 'عربي + إنجليزي' : 'Arabic + English',
                d:
                  lang === 'ar'
                    ? 'واجهة RTL كاملة ومخرجات تناسب صنّاع المحتوى العرب.'
                    : 'Full RTL UI and outputs that work for Arabic creators too.',
              },
            ].map((f) => (
              <div key={f.t} className="surface-card p-5 flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{f.t}</h3>
                  <p className="text-sm text-base-content/60">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools preview */}
      <section id="tools" className="section-padding py-14 bg-base-200/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {lang === 'ar' ? 'أدوات تُستخدم يومياً' : 'Tools you will use daily'}
            </h2>
            <p className="text-base-content/60">
              {lang === 'ar'
                ? `عيّنة من ${TOOL_COUNT} — الباقي داخل الاستوديو`
                : `A sample of ${TOOL_COUNT} — the rest live in the studio`}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => navigate(tool.path)}
                  className="text-start surface-card p-5 hover-lift group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold mb-1 truncate">
                        {lang === 'ar' ? tool.titleAr : tool.titleEn}
                      </h3>
                      <p className="text-sm text-base-content/60 line-clamp-2 mb-2">
                        {lang === 'ar' ? tool.descAr : tool.descEn}
                      </p>
                      <span className="text-primary text-xs font-medium inline-flex items-center">
                        {lang === 'ar' ? 'جرّب' : 'Try'}
                        <ChevronRight className="w-3.5 h-3.5 ms-1" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <button type="button" className="btn-brand" onClick={() => navigate('/app')}>
              {lang === 'ar' ? `عرض كل الـ ${TOOL_COUNT} أداة` : `View all ${TOOL_COUNT} tools`}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding py-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            {lang === 'ar' ? 'أسئلة شائعة' : 'FAQ'}
          </h2>
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
                    <span>{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-sm text-base-content/70 leading-relaxed">{faq.a}</div>
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
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            {lang === 'ar' ? 'جاهز لرفع مستوى قناتك؟' : 'Ready to level up your channel?'}
          </h2>
          <p className="text-primary-content/85 mb-7 max-w-xl mx-auto">
            {lang === 'ar'
              ? 'ادخل الاستوديو الآن — بدون حساب، بدون لصق مفاتيح.'
              : 'Enter the studio now — no account, no key pasting.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="btn bg-white text-primary hover:bg-white/90 border-0 btn-lg gap-2"
          >
            {lang === 'ar' ? 'ابدأ الإنشاء' : 'Start creating'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-base-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <div className="font-bold mb-2">
              YouCreator <span className="text-primary">Tools</span>
            </div>
            <p className="text-sm text-base-content/55 max-w-sm">
              {lang === 'ar'
                ? 'صُنع بـ ❤️ من المغرب · MIT License'
                : 'Made with ❤️ from Morocco · MIT License'}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/app" className="hover:text-primary">
              Studio
            </Link>
            <Link to="/articles" className="hover:text-primary">
              Articles
            </Link>
            <Link to="/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
            <a
              href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
