import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  Check,
  ChevronDown,
  Globe2,
  ImagePlus,
  Layers,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  Type,
  Upload,
  X,
  Youtube,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  drawDesign,
  HEIGHT,
  initialDesign,
  isSupportedImage,
  PRESETS,
  WIDTH,
  type Design,
  type Preset,
} from './drawing';
import './designer.css';

export default function ThumbnailDesigner() {
  const { lang, toggleLang, theme, toggleTheme } = useApp();
  const ar = lang === 'ar';
  const [design, setDesign] = useState<Design>(() => initialDesign(ar));
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loadingImage, setLoadingImage] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [ready, setReady] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const imageRequest = useRef(0);
  const update = <K extends keyof Design>(key: K, value: Design[K]) => {
    setStatus('');
    setDesign((current) => ({ ...current, [key]: value }));
  };
  useEffect(() => {
    let active = true;
    const render = () => {
      if (!active || !canvas.current) return;
      try {
        drawDesign(canvas.current, design, image, ar);
        setReady(true);
      } catch {
        setError(
          ar
            ? 'متصفحك لا يدعم الرسم. جرّب متصفحاً حديثاً.'
            : 'Your browser could not draw the preview. Try a current browser.'
        );
        setReady(false);
      }
    };
    render();
    void document.fonts.ready.then(render);
    return () => {
      active = false;
    };
  }, [design, image, ar]);
  useEffect(
    () => () => {
      imageRequest.current++;
    },
    []
  );
  const selectImage = async (file?: File) => {
    if (!file) return;
    const request = ++imageRequest.current;
    setError('');
    setStatus('');
    setLoadingImage(false);
    if (!isSupportedImage(file)) {
      setError(
        ar
          ? 'اختر صورة JPG أو PNG أو WebP أصغر من 10 ميجابايت.'
          : 'Choose a JPG, PNG, or WebP image up to 10 MB.'
      );
      return;
    }
    setLoadingImage(true);
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      if (request !== imageRequest.current) return;
      if (img.naturalWidth * img.naturalHeight > 40_000_000) throw new Error('Image too large');
      setImage(img);
      setImageName(file.name);
      setDesign((current) => ({ ...current, imageX: 50, imageY: 50 }));
    } catch {
      if (request === imageRequest.current)
        setError(
          ar
            ? 'تعذر فتح الصورة. اختر صورة صالحة أصغر من 40 ميجابكسل.'
            : 'Could not open this image. Choose a valid image smaller than 40 megapixels.'
        );
    } finally {
      URL.revokeObjectURL(url);
      if (request === imageRequest.current) setLoadingImage(false);
    }
  };
  const reset = () => {
    imageRequest.current++;
    setDesign(initialDesign(ar));
    setImage(null);
    setImageName('');
    setError('');
    setStatus('');
    setLoadingImage(false);
    if (fileInput.current) fileInput.current.value = '';
  };
  const download = async () => {
    if (!canvas.current || !ready) return;
    setExporting(true);
    setError('');
    setStatus('');
    try {
      await document.fonts.ready;
      const exported = document.createElement('canvas');
      exported.width = WIDTH;
      exported.height = HEIGHT;
      drawDesign(exported, design, image, ar);
      const blob = await new Promise<Blob | null>((resolve) =>
        exported.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Export failed');
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'youcreator-thumbnail-1280x720.png';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(
        ar
          ? 'تم تجهيز صورتك بصيغة PNG — تحقق من التنزيلات.'
          : 'Your 1280 × 720 PNG is ready. Check your downloads.'
      );
    } catch {
      setError(
        ar
          ? 'تعذر تنزيل الصورة. حاول مرة أخرى.'
          : 'Could not export your thumbnail. Please try again.'
      );
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="designer-app">
      <a href="#designer-main" className="skip-link">
        {ar ? 'انتقل للمصمم' : 'Skip to designer'}
      </a>
      <header className="designer-nav">
        <a href="/" className="brand">
          <span className="brand-mark">
            <Youtube size={22} />
          </span>
          YouCreator
          <span className="designer-brand-label">{ar ? 'مصمم الصور' : 'Thumbnail studio'}</span>
        </a>
        <div className="flex items-center gap-2">
          <button
            className="nav-icon"
            onClick={toggleLang}
            aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe2 size={17} />
            {ar ? 'EN' : 'AR'}
          </button>
          <button
            className="nav-icon"
            onClick={toggleTheme}
            aria-label={ar ? 'تغيير المظهر' : 'Change theme'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <span className="designer-local">
            <ShieldCheck size={14} />
            {ar ? 'على جهازك' : 'On your device'}
          </span>
        </div>
      </header>
      <main id="designer-main" className="designer-main">
        <div className="designer-intro">
          <div>
            <p className="eyebrow">
              {ar
                ? 'فيديو رائع يبدأ بصورة رائعة'
                : 'GREAT VIDEOS START WITH A GREAT FIRST IMPRESSION'}
            </p>
            <h1>{ar ? 'صورة تستحق النقر.' : 'Make them stop scrolling.'}</h1>
            <p>
              {ar
                ? 'صورتك. كلماتك. لمستك. صمّم صورة مصغرة جاهزة ليوتيوب.'
                : 'Your image. Your words. Your style. Make a thumbnail that feels like you.'}
            </p>
          </div>
          <button
            className="btn btn-brand designer-export"
            onClick={download}
            disabled={!ready || loadingImage || exporting}
            data-testid="download-thumbnail"
          >
            <ArrowDownToLine size={17} />
            {exporting ? (ar ? 'جاري التصدير…' : 'Exporting…') : ar ? 'تنزيل PNG' : 'Download PNG'}
          </button>
        </div>
        <div className="designer-layout">
          <aside
            className="designer-controls"
            aria-label={ar ? 'أدوات التصميم' : 'Design controls'}
          >
            <section className="designer-control-section">
              <h2>
                <Layers size={17} />
                {ar ? 'ابدأ بأسلوب' : 'Start with a style'}
                <span>01</span>
              </h2>
              <div className="designer-presets">
                {(Object.keys(PRESETS) as Preset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="designer-preset"
                    aria-pressed={design.preset === key}
                    onClick={() => {
                      setDesign((current) => ({
                        ...current,
                        preset: key,
                        color: PRESETS[key].foreground,
                      }));
                      setStatus('');
                    }}
                    data-testid={`preset-${key}`}
                  >
                    <span
                      className="designer-preset-art"
                      style={{
                        background: PRESETS[key].background,
                        color: PRESETS[key].foreground,
                      }}
                    >
                      <span style={{ background: PRESETS[key].panel }}>Aa</span>
                      <i style={{ borderColor: PRESETS[key].accent }} />
                    </span>
                    <span>
                      {ar ? PRESETS[key].labelAr : PRESETS[key].label}
                      {design.preset === key && <Check size={13} />}
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section className="designer-control-section">
              <h2>
                <Type size={17} />
                {ar ? 'اجعل كلماتك بارزة' : 'Say it your way'}
                <span>02</span>
              </h2>
              <label htmlFor="headline">
                {ar ? 'العنوان الرئيسي' : 'Headline'}
                <small>{design.headline.length}/100</small>
              </label>
              <textarea
                id="headline"
                rows={3}
                maxLength={100}
                value={design.headline}
                onChange={(e) => update('headline', e.target.value)}
                placeholder={ar ? 'ما فكرتك الكبيرة؟' : 'What’s your big idea?'}
              />
              <p className="designer-hint">
                {ar
                  ? 'استخدم سطراً جديداً لتقسيم العنوان.'
                  : 'Use a new line to choose where your headline breaks.'}
              </p>
              <label htmlFor="caption">{ar ? 'نص مساعد' : 'Small supporting line'}</label>
              <input
                id="caption"
                maxLength={65}
                value={design.caption}
                onChange={(e) => update('caption', e.target.value)}
              />
              <div className="designer-range-header">
                <label htmlFor="text-size">{ar ? 'حجم العنوان' : 'Headline size'}</label>
                <output htmlFor="text-size">{design.fontSize}px</output>
              </div>
              <input
                type="range"
                id="text-size"
                min={48}
                max={160}
                value={design.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
              />
              <div className="designer-color-row">
                <label htmlFor="text-color">{ar ? 'لون العنوان' : 'Text color'}</label>
                <input
                  id="text-color"
                  type="color"
                  value={design.color}
                  onChange={(e) => update('color', e.target.value)}
                />
              </div>
            </section>
            <section className="designer-control-section">
              <h2>
                <ImagePlus size={17} />
                {ar ? 'أضف صورتك' : 'Bring your own image'}
                <span>03</span>
              </h2>
              <label htmlFor="background-image" className="designer-upload">
                <Upload size={21} />
                <strong>
                  {loadingImage
                    ? ar
                      ? 'جاري فتح الصورة…'
                      : 'Opening image…'
                    : image
                      ? ar
                        ? 'استبدال الصورة'
                        : 'Replace image'
                      : ar
                        ? 'ارفع صورة خلفية'
                        : 'Upload a background'}
                </strong>
                <span>{ar ? 'JPG, PNG, WebP · حتى 10 ميجابايت' : 'JPG, PNG, WebP · 10 MB max'}</span>
                <input
                  ref={fileInput}
                  id="background-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    void selectImage(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </label>
              {image && (
                <div className="designer-image-name">
                  <span>{imageName}</span>
                  <button
                    type="button"
                    aria-label={ar ? 'إزالة الصورة' : 'Remove image'}
                    onClick={() => {
                      imageRequest.current++;
                      setImage(null);
                      setImageName('');
                      setLoadingImage(false);
                      setStatus('');
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              <p className="designer-hint">
                {ar
                  ? 'تبقى الصورة على جهازك. لا حاجة لحساب.'
                  : 'Your image stays in your browser. No account needed.'}
              </p>
            </section>
            <details className="designer-control-section designer-fine-tune">
              <summary>
                {ar ? 'ضبط الموضع والتباين' : 'Position & contrast'}
                <ChevronDown size={16} />
              </summary>
              {(
                [
                  ['x', ar ? 'المسافة الأفقية للنص' : 'Text horizontal inset', 4, 40],
                  ['y', ar ? 'موضع النص العمودي' : 'Text vertical position', 18, 65],
                  ...(image
                    ? [
                        ['overlay', ar ? 'تعتيم الصورة' : 'Image darkening', 0, 90],
                        ['imageX', ar ? 'اقتصاص الصورة أفقياً' : 'Image crop horizontally', 0, 100],
                        ['imageY', ar ? 'اقتصاص الصورة عمودياً' : 'Image crop vertically', 0, 100],
                      ]
                    : []),
                ] as [keyof Design, string, number, number][]
              ).map(([key, label, min, max]) => (
                <div key={key}>
                  <label htmlFor={`adjust-${key}`}>{label}</label>
                  <input
                    id={`adjust-${key}`}
                    type="range"
                    min={min}
                    max={max}
                    value={Number(design[key])}
                    onChange={(e) => update(key, Number(e.target.value))}
                  />
                </div>
              ))}
            </details>
          </aside>
          <section
            className="designer-workspace"
            aria-label={ar ? 'معاينة التصميم' : 'Design preview'}
          >
            <div className="designer-preview-bar">
              <span>
                <span className="status-dot" />
                {ar ? 'معاينة مباشرة' : 'LIVE PREVIEW'}
              </span>
              <span>1280 × 720 · 16:9</span>
            </div>
            <div className="designer-canvas-wrap">
              <canvas
                ref={canvas}
                width={WIDTH}
                height={HEIGHT}
                data-testid="thumbnail-canvas"
                aria-label={ar ? 'معاينة الصورة المصغرة' : 'Thumbnail design preview'}
              >
                {' '}
                {ar
                  ? 'صمّم صورتك باستخدام عناصر التحكم.'
                  : 'Use the controls to design your thumbnail.'}
              </canvas>
            </div>
            <div className="designer-preview-footer">
              <span>
                <ShieldCheck size={14} />
                {ar
                  ? 'لا نرفع صورك إلى الخادم'
                  : 'Private by design. Nothing to upload to a server.'}
              </span>
              <button type="button" onClick={reset}>
                <RotateCcw size={14} />
                {ar ? 'ابدأ من جديد' : 'Start over'}
              </button>
            </div>
            {error && (
              <div className="designer-message designer-error" role="alert">
                {error}
              </div>
            )}
            {status && (
              <div className="designer-message" role="status" data-testid="export-status">
                <Check size={17} />
                {status}
              </div>
            )}
            <div className="designer-tips">
              <span className="designer-tip-number">
                {ar ? 'لمسة من الإلهام' : 'A LITTLE CREATIVE DIRECTION'}
              </span>
              <h2>{ar ? 'اجعلها واضحة من النظرة الأولى.' : 'A big idea. A few bold words.'}</h2>
              <p>
                {ar
                  ? 'استخدم عنواناً قصيراً وتبايناً قوياً. اجعل النص واضحاً حتى على شاشة الهاتف، ثم أضف الصورة التي تحكي قصتك.'
                  : 'Keep your headline short, your contrast strong, and your story clear. Your thumbnail should make sense even on a small screen.'}
              </p>
              <div>
                <span>{ar ? '١ اختر أسلوباً' : '01  Pick a style'}</span>
                <span>{ar ? '٢ أضف لمستك' : '02  Make it yours'}</span>
                <span>{ar ? '٣ نزّل وانشر' : '03  Download & upload'}</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="designer-footer">
        YouCreator ·{' '}
        {ar ? 'مصمم صور مصغرة. بسيط ومجاني.' : 'One simple tool. Your next great thumbnail.'}
        <span>
          {ar
            ? 'تبقى التعديلات في هذه الصفحة فقط.'
            : 'Edits stay in this tab. Download before you leave.'}
        </span>
      </footer>
    </div>
  );
}
