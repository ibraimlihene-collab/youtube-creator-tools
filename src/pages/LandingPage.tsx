import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Globe2,
  Moon,
  Play,
  ShieldCheck,
  Sparkles,
  Sun,
  Type,
  Wand2,
  Youtube,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS, TOOL_COUNT } from '../lib/tools';
import { DirectoryCard } from '../components/ToolDirectory';

export default function LandingPage() {
  const { lang, theme, toggleLang, toggleTheme } = useApp();
  const ar = lang === 'ar';
  const featured = [
    'titleGenerator',
    'thumbnailDownloader',
    'scriptWriter',
    'hashtagGenerator',
    'silenceRemover',
    'cpmCalculator',
  ].map((id) => TOOLS.find((t) => t.id === id)!);
  const faqs = [
    [
      ar ? 'هل أحتاج إلى حساب؟' : 'Do I need an account?',
      ar
        ? 'لا. افتح أداة وابدأ العمل مباشرة.'
        : 'No account needed. Open a tool and get straight to creating.',
    ],
    [
      ar ? 'هل جميع الأدوات تعمل بدون إنترنت؟' : 'Do all tools work offline?',
      ar
        ? 'تعمل الهاشتاغات السريعة وحاسبة الأرباح والألوان في متصفحك. تحتاج أدوات الذكاء الاصطناعي إلى اتصال وخدمة مهيأة. الصور والأصوات ومحرر الصمت قد تحتاج إلى تنزيلات أولية.'
        : 'Quick hashtags, revenue estimates, and color palettes run in your browser. AI tools need an internet connection and a configured AI service. Thumbnails, sounds, and the silence editor may need network downloads.',
    ],
    [
      ar ? 'هل ملفاتي خاصة؟' : 'What happens to my files?',
      ar
        ? 'تعالج أدوات التحرير المحلية ملفاتك على جهازك. يُرسل النص في أدوات الذكاء الاصطناعي إلى الخدمة لتوليد النتائج. لا ترسل معلومات حساسة.'
        : 'Local editing tools process your files on your device. Text submitted to AI tools is sent to the AI service to generate your results. Avoid submitting sensitive information.',
    ],
    [
      ar ? 'هل تدعم العربية؟' : 'Can I create in Arabic?',
      ar
        ? 'نعم! بدّل اللغة لتجربة واجهة عربية من اليمين إلى اليسار ومخرجات ذكاء اصطناعي بالعربية.'
        : 'Yes. Switch languages for a full right-to-left interface and AI output in Arabic.',
    ],
  ];
  return (
    <div className="landing">
      <a href="#main-content" className="skip-link">
        {ar ? 'انتقل للمحتوى' : 'Skip to content'}
      </a>
      <header className="landing-nav page-width">
        <Link className="brand" to="/" aria-label="YouCreator home">
          <span className="brand-mark">
            <Youtube size={23} />
          </span>
          <span>
            YouCreator<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className="landing-nav-links" aria-label={ar ? 'القائمة الرئيسية' : 'Main navigation'}>
          <a href="#tools">{ar ? 'الأدوات' : 'Explore tools'}</a>
          <a href="#how-it-works">{ar ? 'كيف تعمل' : 'How it works'}</a>
          <Link to="/articles">{ar ? 'المقالات' : 'Creator guides'}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            className="nav-icon"
            onClick={toggleLang}
            aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe2 size={18} />
            <span>{ar ? 'EN' : 'AR'}</span>
          </button>
          <button
            className="nav-icon"
            onClick={toggleTheme}
            aria-label={ar ? 'تغيير المظهر' : 'Change theme'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/app" className="btn btn-brand nav-cta">
            {ar ? 'ابدأ مجاناً' : 'Open studio'}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <main id="main-content">
        <section className="hero-section page-width">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              {ar ? 'أدوات صغيرة. أفكار كبيرة.' : 'SMALL TOOLS. BIG CREATOR ENERGY.'}
            </div>
            <h1>
              {ar ? 'ركّز على الإبداع.' : 'Less busywork.'}
              <br />
              <span>{ar ? 'أنشئ شيئاً رائعاً.' : 'More creating.'}</span>
            </h1>
            <p className="hero-description">
              {ar
                ? 'من أول فكرة إلى آخر تعديل. أدوات بسيطة تساعدك على كتابة محتوى أفضل، وتحسين صورك المصغرة، وتجهيز فيديوك القادم.'
                : 'From your first idea to your final edit. Simple tools to write better content, nail your thumbnails, and get your next video out into the world.'}
            </p>
            <div className="hero-actions">
              <Link to="/app" className="btn btn-brand btn-lg">
                {ar ? 'اعثر على أداتك' : 'Find your next tool'}
                <ArrowRight size={19} />
              </Link>
              <a href="#how-it-works" className="hero-secondary">
                <Play size={16} />
                {ar ? 'شاهد كيف تعمل' : 'See how it works'}
              </a>
            </div>
            <div className="hero-proof">
              <span>
                <Check size={15} />
                {ar ? 'بدون حساب' : 'No sign-up'}
              </span>
              <span>
                <Check size={15} />
                {ar ? 'عربي + إنجليزي' : 'English + Arabic'}
              </span>
              <span>
                <Check size={15} />
                {ar ? 'مفتوح المصدر' : 'Open source'}
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label={ar ? 'مثال توضيحي لاستوديو الإبداع' : 'Illustration of a creator workspace'}
          >
            <div className="art-dot-grid" />
            <div className="studio-preview">
              <div className="preview-top">
                <span className="flex items-center gap-2">
                  <span className="brand-mark small">
                    <Youtube size={15} />
                  </span>{' '}
                  YOUR CREATIVE SPACE
                </span>
                <span className="window-dots">● ● ●</span>
              </div>
              <div className="preview-body">
                <span className="preview-kicker">THE NEXT BIG IDEA STARTS HERE</span>
                <h2>
                  Make something
                  <br />
                  worth watching<span>.</span>
                </h2>
                <div className="video-art">
                  <div className="video-art-orbit" />
                  <span className="video-art-label">
                    YOUR NEXT
                    <br />
                    <b>BIG THING.</b>
                  </span>
                  <span className="video-play">
                    <Play size={25} fill="currentColor" />
                  </span>
                  <span className="video-duration">08:24</span>
                </div>
                <div className="preview-tools">
                  <span>
                    <Type size={17} /> Better titles
                  </span>
                  <span>
                    <Wand2 size={17} /> Fresh ideas
                  </span>
                </div>
              </div>
            </div>
            <Link to="/tools/title-generator" className="floating-note note-top">
              <Sparkles size={18} />
              <div>
                <strong>{ar ? 'فكرتك، بصياغة أفضل' : 'Your idea, a little sharper'}</strong>
                <small>{ar ? 'جرّب مولّد العناوين' : 'Meet your new title generator'}</small>
              </div>
              <ArrowUpRight size={17} />
            </Link>
            <div className="floating-note note-bottom">
              <span className="note-check">
                <Check size={17} />
              </span>
              <div>
                <strong>
                  {ar ? 'وقت أقل في العمل المتكرر' : 'Less time on the little things'}
                </strong>
                <small>
                  {ar ? 'وقت أكثر لإنشاء الفيديوهات' : 'More time for the videos you love'}
                </small>
              </div>
            </div>
          </div>
        </section>
        <section
          className="benefit-strip page-width"
          aria-label={ar ? 'مزايا المنصة' : 'Platform benefits'}
        >
          <div>
            <strong>
              {TOOL_COUNT}
              <span>+</span>
            </strong>
            <p>{ar ? 'أداة للإبداع' : 'creator tools, one home'}</p>
          </div>
          <div>
            <Globe2 size={25} />
            <p>{ar ? 'أنشئ بلغتك' : 'Create in your language'}</p>
          </div>
          <div>
            <ShieldCheck size={25} />
            <p>{ar ? 'أدوات محلية لملفاتك' : 'On-device editing tools'}</p>
          </div>
          <div>
            <Sparkles size={25} />
            <p>{ar ? 'مساعدتك من الفكرة إلى النشر' : 'From idea to upload'}</p>
          </div>
        </section>
        <section id="tools" className="tools-section page-width">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                {ar ? 'مجموعة أدواتك الجديدة' : 'YOUR NEW CREATIVE TOOLKIT'}
              </div>
              <h2>{ar ? 'خطوتك التالية، أصبحت أسهل.' : 'Your next step, made easier.'}</h2>
              <p>
                {ar
                  ? 'ابدأ بأداة مفضلة. واعثر على المزيد في الاستوديو.'
                  : 'Start with a favorite. Discover the rest in the studio.'}
              </p>
            </div>
            <Link to="/app" className="text-link">
              {ar ? `كل الأدوات (${TOOL_COUNT})` : `Explore all ${TOOL_COUNT} tools`}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="directory-grid">
            {featured.map((tool) => (
              <DirectoryCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
        <section id="how-it-works" className="workflow-section">
          <div className="page-width">
            <div className="eyebrow">
              {ar ? 'أقل خطوات. أكثر إبداعاً.' : 'LESS FRICTION. MORE FLOW.'}
            </div>
            <h2>{ar ? 'فكرة. أداة. انطلق.' : 'An idea. A tool. You’re off.'}</h2>
            <div className="workflow-grid">
              {[
                [
                  ar ? 'اختر خطوتك التالية' : 'Pick your next step',
                  ar
                    ? 'كتابة أو تحرير أو تحسين الصور — اعثر على ما تحتاجه.'
                    : 'Writing, editing, or polishing a thumbnail. Find what you need.',
                ],
                [
                  ar ? 'أضف لمستك' : 'Make it yours',
                  ar
                    ? 'أدخل موضوعك، اضبط الخيارات، ودع الأداة تساعدك.'
                    : 'Add your topic, adjust the options, and let your tool do the heavy lifting.',
                ],
                [
                  ar ? 'عد إلى الإبداع' : 'Get back to creating',
                  ar
                    ? 'انسخ النتائج أو حمّل الملفات وواصل العمل على فيديوك.'
                    : 'Copy your results or download your files. Keep your video moving.',
                ],
              ].map(([title, desc], i) => (
                <div key={title}>
                  <span className="step-number">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="faq-section page-width">
          <div>
            <div className="eyebrow">{ar ? 'قبل أن تبدأ' : 'GOOD TO KNOW'}</div>
            <h2>{ar ? 'أسئلة صغيرة،\nإجابات واضحة.' : 'A few questions,\nanswered.'}</h2>
            <p>
              {ar
                ? 'صُنع بشغف من المغرب، لمساعدة صُنّاع المحتوى في كل مكان.'
                : 'Built with care in Morocco, for creators everywhere.'}
            </p>
            <a
              href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              {ar ? 'استكشف المشروع' : 'Explore the open-source project'}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div>
            {faqs.map(([q, a]) => (
              <details key={q} className="faq-item">
                <summary>
                  {q}
                  <ChevronDown size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing-cta page-width">
          <span className="eyebrow">
            {ar ? 'فيديوك القادم ينتظر' : 'YOUR NEXT VIDEO IS WAITING'}
          </span>
          <h2>{ar ? 'لنصنع شيئاً رائعاً.' : 'Go make something great.'}</h2>
          <Link to="/app" className="btn btn-brand btn-lg">
            {ar ? 'افتح استوديوك' : 'Open your creator studio'}
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer page-width">
        <Link to="/" className="brand">
          <span className="brand-mark small">
            <Youtube size={18} />
          </span>
          YouCreator.
        </Link>
        <p>
          © {new Date().getFullYear()} YouCreator Tools ·{' '}
          {ar ? 'صُنع في المغرب' : 'Made in Morocco'}
        </p>
        <div>
          <Link to="/app">{ar ? 'الأدوات' : 'Tools'}</Link>
          <Link to="/articles">{ar ? 'المقالات' : 'Guides'}</Link>
          <a
            href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
    </div>
  );
}
