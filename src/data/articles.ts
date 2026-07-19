export interface Article {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  tags: string[];
  readMinutes: number;
  /** Original practical content — inspired by creator education, not copied */
  bodyEn: string;
  bodyAr: string;
}

export const ARTICLES: Article[] = [
  {
    slug: 'youtube-hook-framework',
    titleEn: 'The 3-second hook framework that keeps viewers watching',
    titleAr: 'إطار خطاف الـ 3 ثوانٍ الذي يُبقي المشاهد',
    excerptEn: 'A practical cold-open formula: pattern interrupt, promise, proof.',
    excerptAr: 'صيغة افتتاحية عملية: مقاطعة نمط، وعد، إثبات.',
    tags: ['retention', 'scripting'],
    readMinutes: 6,
    bodyEn: `## Why the first 3 seconds matter
YouTube decides early whether your video is "working." Viewers decide even faster.

## The framework
1. **Pattern interrupt** — something unexpected (visual or line).
2. **Promise** — what they get by the end (specific outcome).
3. **Proof teaser** — a flash of the result or credibility.

## Example
"Stop editing like this — I'll show the 4 cuts that doubled my average view duration last month."

## Checklist before you publish
- Can a muted scroller still "feel" the hook via text/on-screen?
- Is the promise measurable?
- Does the intro match the thumbnail/title (no bait-and-switch)?

Inspired by patterns discussed across Creator Insider, Think Media, and high-retention channels — rewritten as a field checklist you can run on every upload.`,
    bodyAr: `## لماذا أول 3 ثوانٍ مهمة
يوتيوب يقرّر مبكراً إن كان الفيديو "يعمل". والمشاهد يقرّر أسرع.

## الإطار
1. **مقاطعة النمط** — شيء غير متوقع (بصري أو جملة).
2. **الوعد** — ماذا سيحصل بنهاية الفيديو (نتيجة محددة).
3. **لمحة إثبات** — ومضة من النتيجة أو المصداقية.

## مثال
"توقّف عن المونتاج هكذا — سأريك 4 قصّات ضاعفت متوسط مدة المشاهدة الشهر الماضي."

## قائمة قبل النشر
- هل يفهم الصامت الخطاف من النص على الشاشة؟
- هل الوعد قابل للقياس؟
- هل المقدمة تطابق العنوان/المصغّرة (بلا خداع)؟

مستوحى من أنماط شائعة في تعليم صنّاع المحتوى — مكتوب كقائمة عمل ميدانية.`,
  },
  {
    slug: 'seo-title-thumbnail-pack',
    titleEn: 'Title + thumbnail packaging without clickbait traps',
    titleAr: 'تعبئة العنوان والمصغّرة بلا فخاخ الكلِكْبيت',
    excerptEn: 'Align curiosity, clarity, and delivery so CTR and satisfaction both rise.',
    excerptAr: 'وازن الفضول والوضوح والتنفيذ ليرتفع النقر والرضا معاً.',
    tags: ['seo', 'thumbnails'],
    readMinutes: 7,
    bodyEn: `## The packaging triangle
- **Clarity**: what is the video?
- **Curiosity**: why click now?
- **Credibility**: why trust you?

If any corner is missing, you get either low CTR or high CTR + low retention (the worst combo).

## Title rules that scale
- Prefer outcomes over vague vibes.
- Keep mobile length in mind (~50–70 visible chars).
- Mirror one keyword the audience actually searches.

## Thumbnail text
- 2–5 words max.
- Highest contrast on the face/subject.
- One emotion only.

## A/B mindset
Change **one** variable per test (title OR thumbnail text OR expression). Log results weekly.

This synthesizes packaging advice popularized by growth educators (VidIQ/TubeBuddy-style testing culture, MrBeast-level iteration discipline) into a simple operating system.`,
    bodyAr: `## مثلث التعبئة
- **الوضوح**: عن ماذا الفيديو؟
- **الفضول**: لماذا النقر الآن؟
- **المصداقية**: لماذا يثق بك؟

نقص أي زاوية = نقر منخفض أو نقر عالٍ مع احتفاظ ضعيف (الأسوأ).

## قواعد العنوان
- فضّل النتائج على العبارات الضبابية.
- راعِ طول الجوال (~50–70 حرفاً ظاهراً).
- اربط كلمة يبحث عنها جمهورك فعلاً.

## نص المصغّرة
- 2–5 كلمات كحد أقصى.
- أعلى تباين على الوجه/الموضوع.
- عاطفة واحدة فقط.

## عقلية A/B
غيّر **متغيراً واحداً** في كل اختبار. سجّل أسبوعياً.`,
  },
  {
    slug: 'sustainable-upload-cadence',
    titleEn: 'A sustainable upload cadence for solo creators',
    titleAr: 'إيقاع رفع مستدام لصانع منفرد',
    excerptEn: 'Batch research, batch record, batch edit — without burnout.',
    excerptAr: 'جمّع البحث والتسجيل والمونتاج — بلا احتراق.',
    tags: ['planning', 'productivity'],
    readMinutes: 5,
    bodyEn: `## The myth of daily uploads
Consistency beats frequency. A burned-out creator who stops for 6 weeks loses more than someone who ships weekly forever.

## A realistic solo system
- **Mon**: research + outline (2 videos)
- **Tue**: record both
- **Wed–Thu**: edit one
- **Fri**: package (title/thumb/desc) + schedule
- **Sat**: Shorts/community from leftovers
- **Sun**: rest or light analytics

## Guardrails
- Cap WIP (work in progress) at 3 videos.
- Maintain a swipe file of hooks and B-roll.
- Reuse winners as series, not one-offs.

Ideas aligned with sustainable creator ops taught by educators like Ali Abdaal (systems over hustle) and channel-ops thinking from modern YouTube education — original structure for solo builders.`,
    bodyAr: `## أسطورة الرفع اليومي
الانتظام يتفوّق على الكثافة. صانع محترق يتوقف 6 أسابيع يخسر أكثر ممن ينشر أسبوعياً للأبد.

## نظام منفرد واقعي
- **الإثنين**: بحث + مخطط (فيديوهان)
- **الثلاثاء**: تصوير الاثنين
- **أ–خ**: مونتاج واحد
- **الجمعة**: تعبئة (عنوان/مصغّرة/وصف) + جدولة
- **السبت**: Shorts/مجتمع من البقايا
- **الأحد**: راحة أو تحليل خفيف

## حواجز حماية
- حدّ أقصى 3 فيديوهات قيد العمل.
- ملف خطافات ولقطات B-roll.
- أعد استخدام الفائزين كسلاسل.`,
  },
  {
    slug: 'analytics-that-matter',
    titleEn: 'Analytics that actually change your next video',
    titleAr: 'تحليلات تغيّر فيديوك التالي فعلاً',
    excerptEn: 'Ignore vanity metrics. Focus on AVD, retained audience, and traffic sources.',
    excerptAr: 'تجاهل المقاييس الفارغة. ركّز على AVD والجمهور المحتفظ ومصادر الزيارات.',
    tags: ['analytics', 'growth'],
    readMinutes: 6,
    bodyEn: `## Metrics that drive decisions
1. **Impressions CTR** — packaging problem?
2. **Average view duration / retained audience** — content/pacing problem?
3. **Traffic source** — browse vs search vs suggested changes your SEO vs branding mix.

## A weekly 20-minute review
- Top 3 and bottom 3 by retained audience.
- Note the hook style of winners.
- Note where losers drop (first 30s? mid-roll?).
- Ship **one** experiment next week.

## Suggested vs search
Search loves clarity and chapters. Suggested loves packaging + session value. Build playlists for sessions.

Synthesized from YouTube's own creator education themes and practitioner analytics habits (not a copy of any single post).`,
    bodyAr: `## مقاييس تقود القرار
1. **CTR الظهور** — مشكلة تعبئة؟
2. **متوسط المشاهدة / الجمهور المحتفظ** — مشكلة محتوى/إيقاع؟
3. **مصدر الزيارات** — تصفّح مقابل بحث مقابل مقترَح يغيّر مزيج SEO والعلامة.

## مراجعة أسبوعية 20 دقيقة
- أفضل 3 وأسوأ 3 حسب الاحتفاظ.
- لاحظ أسلوب خطاف الفائزين.
- أين ينهار الخاسرون (أول 30ث؟ المنتصف؟).
- نفّذ **تجربة واحدة** الأسبوع التالي.`,
  },
  {
    slug: 'shorts-to-long-bridge',
    titleEn: 'Turn Shorts viewers into long-form subscribers',
    titleAr: 'حوّل مشاهدي Shorts إلى مشتركين للفيديو الطويل',
    excerptEn: 'Bridge CTAs, series pins, and topic continuity without spammy asks.',
    excerptAr: 'جسور CTA وتثبيت سلاسل واستمرارية موضوع بلا طلب مزعج.',
    tags: ['shorts', 'growth'],
    readMinutes: 5,
    bodyEn: `## Shorts are top-of-funnel
Treat them as discovery ads for your long-form expertise — not as the whole business.

## The bridge
- Same topic family across Short → long.
- End with a **specific** next watch ("full breakdown of X on the channel").
- Pin a comment with the long-form link + timestamp promise.
- Create a playlist: Shorts highlights → full episodes.

## What not to do
- Generic "subscribe for more."
- Totally unrelated viral topics that attract the wrong crowd.

Original playbook combining funnel thinking with YouTube surface realities.`,
    bodyAr: `## Shorts أعلى القمع
عاملها كإعلانات اكتشاف لخبرتك الطويلة — لا كالعمل كله.

## الجسر
- نفس عائلة الموضوع من Short → طويل.
- اختم بمشاهدة تالية **محددة**.
- ثبّت تعليقاً برابط الطويل + وعد طابع زمني.
- قائمة: أبرز Shorts → الحلقات الكاملة.

## ما لا تفعله
- "اشترك للمزيد" العامة.
- ترندات بلا صلة تجلب جمهوراً خاطئاً.`,
  },
  {
    slug: 'privacy-first-creator-stack',
    titleEn: 'A privacy-first tool stack for creators',
    titleAr: 'حزمة أدوات تحترم الخصوصية للصنّاع',
    excerptEn: 'Why on-device processing and server-side keys beat pasting API keys in random sites.',
    excerptAr: 'لماذا المعالجة على الجهاز والمفاتيح على الخادم أفضل من لصق المفاتيح في مواقع عشوائية.',
    tags: ['security', 'tools'],
    readMinutes: 4,
    bodyEn: `## The risk
Pasting AI keys into unknown frontends means anyone can extract them from DevTools or network logs.

## Better model
- **On-device** for media (silence removal, local transforms).
- **Your backend** holds provider keys.
- Browser only sends **task input**, never secrets.
- Rate limits + origin checks reduce abuse.

YouCreator Tools is built on this model: Netlify Functions hold Gemini/Apify secrets; the SPA never sees them.`,
    bodyAr: `## الخطر
لصق مفاتيح الذكاء في واجهات مجهولة يعني استخراجها من DevTools أو سجلات الشبكة.

## النموذج الأفضل
- **على الجهاز** للوسائط (إزالة صمت، تحويلات محلية).
- **خادمك** يحمل مفاتيح المزوّدين.
- المتصفح يرسل **مدخل المهمة** فقط.
- حدود معدّل وفحص أصل يقلّلان الإساءة.

YouCreator Tools مبني على هذا النموذج: دوال Netlify تحمل أسرار Gemini/Apify؛ الواجهة لا تراها أبداً.`,
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
