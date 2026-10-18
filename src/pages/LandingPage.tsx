import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Check,
  ChevronDown,
  Globe2,
  Image,
  Moon,
  Play,
  Scissors,
  ShieldCheck,
  Sparkles,
  Sun,
  Youtube,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS, TOOL_COUNT } from '../lib/tools';

export default function LandingPage() {
  const { lang, theme, toggleLang, toggleTheme } = useApp();
  const ar = lang === 'ar';
  const featured = [
    'titleGenerator',
    'thumbnailPreviewer',
    'silenceRemover',
    'hashtagGenerator',
    'cpmCalculator',
    'colorPaletteGenerator',
  ]
    .map((id) => TOOLS.find((tool) => tool.id === id))
    .filter((tool) => tool !== undefined);
  useEffect(() => {
    document.title = ar
      ? 'YouCreator — مساحة لكل أفكارك'
      : 'YouCreator — A little help. A lot more creating.';
  }, [ar]);
  const faqs = ar
    ? [
        [
          'هل يمكنني البدء مجانًا؟',
          'نعم، الأدوات الأساسية مجانية ولا تحتاج إلى حساب للبدء. اختر أداتك من الاستوديو وابدأ مباشرة.',
        ],
        [
          'هل يعمل الموقع بالعربية؟',
          'نعم، يمكنك التبديل بين العربية والإنجليزية من أعلى الصفحة. تدعم الواجهة اتجاه الكتابة من اليمين إلى اليسار.',
        ],
        [
          'كيف يتم التعامل مع ملفاتي؟',
          'أدوات مثل إزالة الصمت تعمل داخل المتصفح. أدوات الذكاء الاصطناعي ترسل المدخلات اللازمة إلى الخادم لمعالجتها؛ راجع وصف الأداة قبل استخدامها.',
        ],
        [
          'هل أحتاج إلى مفتاح ذكاء اصطناعي؟',
          'لن تحتاج إلى لصق مفاتيح داخل الموقع. خدمات الذكاء الاصطناعي تعتمد على إعدادها من طرف مشغّل الموقع؛ الأدوات المحلية لا تحتاج إليها.',
        ],
      ]
    : [
        [
          'Can I get started for free?',
          'Yes. Core tools are free, and you can start without an account. Pick a tool in the studio and get straight to work.',
        ],
        [
          'Does it work in Arabic?',
          'Yes. Switch between English and Arabic at the top of the page. The interface supports right-to-left layouts too.',
        ],
        [
          'What happens to my files?',
          'Tools like silence removal work in your browser. AI tools send the inputs needed for processing to the server. Check each tool’s description before using it.',
        ],
        [
          'Do I need my own AI key?',
          'You never need to paste a key into the site. AI features depend on services configured by the site operator; local tools work without them.',
        ],
      ];
  return (
    <div className="creator-landing">
      <a className="skip-link" href="#main-content">
        {ar ? 'انتقل للمحتوى' : 'Skip to content'}
      </a>
      <header className="landing-header">
        <nav
          className="site-width landing-nav"
          aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}
        >
          <Link to="/" className="creator-logo">
            <span className="logo-symbol">
              <Youtube size={23} />
            </span>
            <span>
              YouCreator<span className="logo-dot">.</span>
            </span>
          </Link>
          <div className="landing-nav-links">
            <a href="#tools">{ar ? 'الأدوات' : 'The tools'}</a>
            <a href="#story">{ar ? 'قصتنا' : 'Our story'}</a>
            <Link to="/articles">{ar ? 'المقالات' : 'The journal'}</Link>
          </div>
          <div className="landing-nav-actions">
            <button
              type="button"
              className="quiet-button"
              onClick={toggleLang}
              aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              <Globe2 size={17} />
              <span>{ar ? 'EN' : 'AR'}</span>
            </button>
            <button
              type="button"
              className="quiet-button theme-toggle"
              data-testid="theme-toggle"
              onClick={toggleTheme}
              aria-label={ar ? 'تغيير المظهر' : 'Change theme'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link className="btn-brand nav-start" to="/app">
              {ar ? 'افتح الاستوديو' : 'Open studio'}
              <ArrowUpRight size={16} className="directional-icon" />
            </Link>
          </div>
        </nav>
      </header>
      <main id="main-content">
        <section className="site-width landing-hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-star">✳</span>
              {ar
                ? 'مساحة صغيرة. أفكار كبيرة.'
                : 'YOUR NEXT GREAT VIDEO STARTS HERE'}
            </p>
            <h1>
              {ar ? (
                <>
                  وقت أقل للمهام.
                  <br />
                  <span>مساحة أكبر للإبداع.</span>
                </>
              ) : (
                <>
                  Less busywork.
                  <br />
                  <span>More creating.</span>
                </>
              )}
            </h1>
            <p className="hero-description">
              {ar
                ? `من الفكرة الأولى إلى آخر لمسة. ${TOOL_COUNT} أداة تساعدك على الكتابة والتصميم وتطوير محتواك — في مكان واحد.`
                : `From the first idea to the finishing touches. ${TOOL_COUNT} handy tools to help you write, design, and make better YouTube videos. All in one place.`}
            </p>
            <div className="hero-actions">
              <Link to="/app" className="btn-brand btn-large">
                {ar ? 'لنصنع شيئًا رائعًا' : 'Let’s make something'}
                <ArrowRight size={18} className="directional-icon" />
              </Link>
              <a href="#tools" className="text-link">
                {ar ? 'استكشف الأدوات' : 'Explore the tools'}
                <ArrowRight size={16} className="directional-icon" />
              </a>
            </div>
            <div className="hero-reassurance">
              <span>
                <Check size={14} />
                {ar ? 'ابدأ بدون حساب' : 'No account needed'}
              </span>
              <span>
                <Check size={14} />
                {ar ? 'أدوات أساسية مجانية' : 'Free core tools'}
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label={
              ar
                ? 'عرض توضيحي لأدوات الاستوديو'
                : 'An illustration of a creator’s workflow'
            }
          >
            <div className="art-grid" />
            <div className="art-label">
              <span />
              {ar ? 'من فكرتك إلى الشاشة' : 'FROM YOUR MIND TO THE SCREEN'}
            </div>
            <Link to="/tools/thumbnail-previewer" className="art-thumbnail">
              <div className="art-window-bar">
                <span>
                  <span className="window-dot" />
                  <span className="window-dot" />
                  <span className="window-dot" />
                </span>
                <span>{ar ? 'الصورة المصغرة' : 'THE THUMBNAIL'}</span>
                <Image size={13} />
              </div>
              <div className="art-video">
                <div className="art-orbit" />
                <span className="art-video-tag">
                  {ar ? 'فكرتك القادمة' : 'YOUR NEXT IDEA'}
                </span>
                <strong>
                  {ar ? (
                    <>
                      أبدع
                      <br />
                      أكثر.
                    </>
                  ) : (
                    <>
                      MAKE
                      <br />
                      MORE.
                    </>
                  )}
                </strong>
                <span className="art-play">
                  <Play size={24} fill="currentColor" />
                </span>
                <span className="art-duration">08:24</span>
              </div>
              <div className="art-video-footer">
                <span className="art-avatar">Y</span>
                <div>
                  <b>{ar ? 'بداية فيديو رائع' : 'A great video starts here'}</b>
                  <small>
                    {ar ? 'قناتك · أسلوبك' : 'Your channel. Your way.'}
                  </small>
                </div>
                <ArrowUpRight size={18} />
              </div>
            </Link>
            <Link className="art-note" to="/tools/title-generator">
              <span className="art-note-icon">
                <Sparkles size={17} />
              </span>
              <div>
                <small>
                  {ar ? 'فكرة. عنوان. انطلاقة.' : 'IDEA. TITLE. ACTION.'}
                </small>
                <b>
                  {ar
                    ? 'الكلمات المناسبة تغيّر كل شيء.'
                    : 'Find the words that click.'}
                </b>
              </div>
              <Check size={17} />
            </Link>
            <Link className="art-audio" to="/tools/silence-remover">
              <span className="audio-icon">
                <Scissors size={17} />
              </span>
              <div>
                <small>
                  {ar ? 'وداعًا للصمت' : 'LESS SILENCE. MORE STORY.'}
                </small>
                <div className="waveform" aria-hidden="true">
                  {[
                    12, 24, 17, 34, 21, 39, 29, 16, 8, 6, 6, 6, 16, 31, 40, 23,
                    33, 18, 26, 10, 20, 34, 27, 15,
                  ].map((height, i) => (
                    <i key={i} style={{ height }} />
                  ))}
                </div>
              </div>
              <ArrowUpRight size={17} />
            </Link>
            <span className="art-sticker" aria-hidden="true">
              ✳
            </span>
            <p className="art-caption">
              {ar
                ? 'أدوات صغيرة، احتمالات كبيرة.'
                : 'Small tools. Big possibilities.'}
            </p>
          </div>
        </section>
        <div className="benefit-strip">
          <div className="site-width">
            <span>
              <Sparkles size={18} />
              {ar
                ? `${TOOL_COUNT} أداة في مكان واحد`
                : `${TOOL_COUNT} tools. One creative space.`}
            </span>
            <span>
              <Globe2 size={18} />
              {ar ? 'عربي وإنجليزي' : 'English & Arabic'}
            </span>
            <span>
              <ShieldCheck size={18} />
              {ar ? 'لا حاجة للصق مفاتيح' : 'No keys to paste'}
            </span>
            <span>
              <BookOpen size={18} />
              {ar ? 'مفتوح المصدر' : 'Open source, always'}
            </span>
          </div>
        </div>
        <section id="tools" className="site-width landing-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                {ar ? 'أدواتك الإبداعية' : 'A LITTLE HELP GOES A LONG WAY'}
              </p>
              <h2>
                {ar ? 'ماذا ستصنع اليوم؟' : 'What will you create today?'}
              </h2>
              <p>
                {ar
                  ? 'كل خطوة في رحلتك تستحق أداة تجعلها أسهل.'
                  : 'A few everyday favorites, ready when inspiration strikes.'}
              </p>
            </div>
            <Link to="/app" className="text-link">
              {ar ? `كل الأدوات (${TOOL_COUNT})` : `All ${TOOL_COUNT} tools`}
              <ArrowUpRight size={17} className="directional-icon" />
            </Link>
          </div>
          <div className="featured-tools">
            {featured.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Link
                  to={tool.path}
                  key={tool.id}
                  className={`featured-tool tool-tone-${index % 4}`}
                >
                  <div className="featured-tool-top">
                    <span className="tool-icon">
                      <Icon size={23} />
                    </span>
                    <ArrowUpRight
                      size={19}
                      className="tool-card-arrow directional-icon"
                    />
                  </div>
                  <span className="tool-kind">
                    {tool.kind === 'local'
                      ? ar
                        ? 'على جهازك'
                        : 'ON YOUR DEVICE'
                      : ar
                        ? 'مساعد إبداعي'
                        : 'CREATIVE ASSISTANT'}
                  </span>
                  <h3>{ar ? tool.titleAr : tool.titleEn}</h3>
                  <p>{ar ? tool.descAr : tool.descEn}</p>
                  <span className="tool-open">
                    {ar ? 'افتح الأداة' : 'Open tool'}
                    <ArrowRight size={15} className="directional-icon" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="workflow-section">
          <div className="site-width landing-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">
                  {ar ? 'من الفكرة إلى النشر' : 'FIND YOUR FLOW'}
                </p>
                <h2>
                  {ar
                    ? 'ركّز على الجزء الذي تحبّه.'
                    : 'Keep the good ideas moving.'}
                </h2>
              </div>
              <p className="section-side-note">
                {ar
                  ? 'اختر ما تحتاجه، عندما تحتاجه. بلا خطوات معقدة.'
                  : 'Pick what you need, when you need it. No complicated setup.'}
              </p>
            </div>
            <div className="workflow-grid">
              {[
                {
                  icon: Sparkles,
                  title: ar ? 'أعطِ فكرتك صوتًا' : 'Give your idea a voice',
                  desc: ar
                    ? 'حوّل ملاحظاتك إلى عنوان أو نص أو وصف لفيديوك القادم.'
                    : 'Turn your notes into a title, a script, or a description for your next video.',
                  link: '/tools/script-writer',
                  action: ar ? 'أدوات الكتابة' : 'Start with a script',
                },
                {
                  icon: Image,
                  title: ar ? 'اصنع الانطباع الأول' : 'Make a first impression',
                  desc: ar
                    ? 'عاين الصورة المصغرة واختر الألوان التي تعبّر عن قناتك.'
                    : 'Preview your thumbnail and find the colors that feel like your channel.',
                  link: '/tools/thumbnail-previewer',
                  action: ar ? 'عاين صورتك' : 'Preview a thumbnail',
                },
                {
                  icon: AudioLines,
                  title: ar ? 'أضف اللمسة الأخيرة' : 'Bring it all together',
                  desc: ar
                    ? 'تخلّص من الصمت وامنح قصتك إيقاعًا أفضل قبل النشر.'
                    : 'Trim the quiet moments and give your story a better rhythm before you publish.',
                  link: '/tools/silence-remover',
                  action: ar ? 'حسّن الصوت' : 'Work on your audio',
                },
              ].map((step, index) => (
                <div className="workflow-step" key={step.link}>
                  <div className="workflow-step-top">
                    <span>0{index + 1}</span>
                    <step.icon size={24} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <Link className="text-link" to={step.link}>
                    {step.action}
                    <ArrowRight size={15} className="directional-icon" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="story" className="site-width story-section">
          <div className="story-art" aria-hidden="true">
            <span>Y.</span>
            <i>✳</i>
            <small>
              MADE WITH HEART
              <br />
              IN MOROCCO
            </small>
          </div>
          <div>
            <p className="eyebrow">
              {ar ? 'من صانع إلى صانع' : 'FROM ONE CREATOR TO ANOTHER'}
            </p>
            <h2>
              {ar ? (
                'حلم صغير من المغرب، لكل صانع محتوى.'
              ) : (
                <>
                  A small beginning.
                  <br />A world of possibilities.
                </>
              )}
            </h2>
            <p>
              {ar
                ? 'أنا إبراهيم، مطور علّم نفسه من قرية صغيرة في المغرب. بنيت YouCreator لأجعل خطوات صناعة المحتوى أسهل، ولتجد أفكارك المساحة التي تستحقها.'
                : 'I’m Ibrahim, a self-taught developer from a small village in Morocco. I built YouCreator to make the everyday parts of creating a little easier, so your ideas have more room to grow.'}
            </p>
            <p className="story-signature">
              {ar
                ? 'صُنع بشغف. ومتاح للجميع.'
                : 'Built with heart. Open to everyone.'}
              <span>— Ibrahim</span>
            </p>
          </div>
        </section>
        <section className="site-width faq-section">
          <div>
            <p className="eyebrow">{ar ? 'قبل أن تبدأ' : 'GOOD QUESTIONS'}</p>
            <h2>{ar ? 'كل شيء أوضح.' : 'A little clarity.'}</h2>
            <p>
              {ar
                ? 'إجابات بسيطة، لتبدأ وأنت مطمئن.'
                : 'A few things you might be wondering.'}
            </p>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a], index) => (
              <details
                key={q}
                name="landing-faq"
                open={index === 0 ? true : undefined}
              >
                <summary>
                  {q}
                  <ChevronDown size={18} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="site-width">
          <div className="landing-cta">
            <span className="cta-star" aria-hidden="true">
              ✳
            </span>
            <p className="eyebrow">
              {ar ? 'فيديوك القادم ينتظرك' : 'YOUR IDEAS DESERVE TO BE SEEN'}
            </p>
            <h2>
              {ar ? (
                <>
                  أنت تأتي بالفكرة،
                  <br />
                  ونحن نسهّل الباقي.
                </>
              ) : (
                <>
                  You bring the idea.
                  <br />
                  We’ll help with the rest.
                </>
              )}
            </h2>
            <Link to="/app" className="btn-brand btn-large">
              {ar ? 'إلى الاستوديو' : 'Take me to the studio'}
              <ArrowRight size={18} className="directional-icon" />
            </Link>
            <p className="cta-footnote">
              {ar
                ? 'بدون حساب. فقط أنت وأفكارك.'
                : 'No account. Just you and your next big idea.'}
            </p>
          </div>
        </section>
      </main>
      <footer className="site-width landing-footer">
        <div>
          <Link to="/" className="creator-logo">
            <span className="logo-symbol">
              <Youtube size={21} />
            </span>
            YouCreator.
          </Link>
          <p>
            {ar
              ? 'قليل من المساعدة. كثير من الإبداع.'
              : 'A little help. A lot more creating.'}
          </p>
        </div>
        <div className="footer-links">
          <Link to="/app">{ar ? 'الأدوات' : 'The tools'}</Link>
          <Link to="/articles">{ar ? 'المقالات' : 'The journal'}</Link>
          <a
            href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <ArrowUpRight size={13} />
          </a>
        </div>
        <span className="footer-credit">
          {ar ? 'من المغرب، بكل حب' : 'Made with heart in Morocco'}
          <span>© {new Date().getFullYear()} YouCreator · MIT</span>
        </span>
      </footer>
    </div>
  );
}
