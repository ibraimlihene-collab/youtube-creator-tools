import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type en from '../../locales/en.json';

const cpmData = [
  { key: 'moneyAndInvestment', global: '15–50', rich: '25–40', medium: '3–6', poor: '0.5–2' },
  { key: 'programming', global: '5–30', rich: '15–25', medium: '1–3', poor: '0.1–0.5' },
  { key: 'ecommerce', global: '10–35', rich: '20–30', medium: '2–5', poor: '0.5–1.5' },
  { key: 'digitalMarketing', global: '12–40', rich: '25–35', medium: '3–6', poor: '0.8–2' },
  { key: 'cryptocurrency', global: '10–30', rich: '18–25', medium: '2–4', poor: '0.4–1' },
  { key: 'realEstate', global: '15–45', rich: '30–40', medium: '3–7', poor: '0.6–2' },
  { key: 'productReviews', global: '5–12', rich: '8–10', medium: '1–2', poor: '0.2–0.6' },
  { key: 'technologyAndGadgets', global: '5–15', rich: '8–12', medium: '1–3', poor: '0.2–0.5' },
  { key: 'educationAndTraining', global: '6–20', rich: '12–18', medium: '2–4', poor: '0.4–1' },
  { key: 'gaming', global: '4–15', rich: '8–12', medium: '1–2.5', poor: '0.1–0.4' },
  { key: 'healthAndNutrition', global: '7–20', rich: '12–18', medium: '1.5–3', poor: '0.2–0.7' },
  { key: 'fitness', global: '7–18', rich: '12–16', medium: '1.3–3', poor: '0.2–0.6' },
  { key: 'beautyAndCare', global: '5–18', rich: '9–15', medium: '0.9–3.3', poor: '0.2–0.6' },
  { key: 'travelAndTourism', global: '6–20', rich: '12–18', medium: '1.1–3.5', poor: '0.2–0.7' },
  { key: 'natureAndAnimals', global: '1.8–3.5', rich: '3–4', medium: '0.3–0.5', poor: '0.06–0.2' },
  { key: 'carsAndVehicles', global: '5–15', rich: '8–12', medium: '1–2.5', poor: '0.2–0.6' },
  {
    key: 'vlogsAndEntertainment',
    global: '2.7–6.4',
    rich: '5–9',
    medium: '0.5–1.2',
    poor: '0.1–0.3',
  },
  { key: 'comedy', global: '3–8', rich: '6–8', medium: '0.8–1.5', poor: '0.1–0.3' },
  { key: 'selfDevelopment', global: '6–15', rich: '10–14', medium: '1–3', poor: '0.2–0.6' },
  { key: 'music', global: '1–3', rich: '2–3', medium: '0.5–1', poor: '0.1–0.2' },
  { key: 'photographyAndEditing', global: '5–12', rich: '10–12', medium: '1.2–2', poor: '0.2–0.5' },
  { key: 'educationalLessons', global: '10–25', rich: '18–22', medium: '2–4', poor: '0.3–0.8' },
  { key: 'historyAndCulture', global: '4–10', rich: '7–9', medium: '1–2', poor: '0.2–0.4' },
  { key: 'booksAndReading', global: '3–6', rich: '5–6', medium: '0.8–1.2', poor: '0.2–0.3' },
  { key: 'cookingAndFood', global: '4–12', rich: '7–10', medium: '1–2', poor: '0.3–0.6' },
  { key: 'decorationAndDesign', global: '5–14', rich: '9–12', medium: '1.3–2.5', poor: '0.3–0.6' },
  { key: 'handicrafts', global: '3–10', rich: '6–9', medium: '1–2', poor: '0.3–0.5' },
  { key: 'comedySkits', global: '3–7', rich: '6–7', medium: '1–1.5', poor: '0.2–0.3' },
  { key: 'entrepreneurship', global: '12–30', rich: '20–28', medium: '3–5', poor: '0.5–1.5' },
  {
    key: 'personalStoriesAndExperiences',
    global: '2–8',
    rich: '5–7',
    medium: '1–1.5',
    poor: '0.2–0.4',
  },
  { key: 'lifestyle', global: '3–8', rich: '6–8', medium: '1–1.8', poor: '0.2–0.4' },
  { key: 'technologyAndScience', global: '5-25', rich: '10-20', medium: '1-4', poor: '0.2-0.8' },
  {
    key: 'artificialIntelligenceAndMachineLearning',
    global: '8-30',
    rich: '15-28',
    medium: '2-5',
    poor: '0.5-1.5',
  },
  {
    key: 'cybersecurityAndPenetrationTesting',
    global: '10-35',
    rich: '18-30',
    medium: '3-6',
    poor: '0.6-2',
  },
  { key: 'webDevelopment', global: '7-28', rich: '12-25', medium: '2-5', poor: '0.4-1.2' },
  { key: 'mobileApplications', global: '6-25', rich: '10-22', medium: '1.5-4', poor: '0.3-1' },
  {
    key: 'virtualAndAugmentedReality',
    global: '5-20',
    rich: '10-18',
    medium: '1-3.5',
    poor: '0.2-0.8',
  },
  { key: 'internetOfThings', global: '5-22', rich: '10-20', medium: '1-4', poor: '0.3-0.9' },
  { key: 'personalFinance', global: '10-40', rich: '20-35', medium: '3-7', poor: '0.8-2.5' },
  { key: 'stockAndForexTrading', global: '15-50', rich: '25-45', medium: '4-8', poor: '1-3' },
  { key: 'electronicSports', global: '5-18', rich: '10-15', medium: '1.5-3', poor: '0.2-0.7' },
  { key: 'educationAndKnowledge', global: '6-25', rich: '12-22', medium: '2-5', poor: '0.4-1' },
  { key: 'entertainmentAndArts', global: '3-10', rich: '5-9', medium: '0.8-2', poor: '0.1-0.5' },
  { key: 'healthAndBeauty', global: '5-20', rich: '10-18', medium: '1-3.5', poor: '0.2-0.7' },
  { key: 'religionAndCulture', global: '2-10', rich: '4-9', medium: '0.5-2', poor: '0.1-0.4' },
  { key: 'cinemaAndTelevision', global: '4-12', rich: '7-10', medium: '1-2', poor: '0.3-0.6' },
  {
    key: 'sportsAndPhysicalActivity',
    global: '5-18',
    rich: '8-15',
    medium: '1-3',
    poor: '0.2-0.5',
  },
  { key: 'fashionAndClothing', global: '4-15', rich: '7-12', medium: '1-2.5', poor: '0.2-0.5' },
  {
    key: 'marketingAndEntrepreneurship',
    global: '12-35',
    rich: '20-30',
    medium: '3-6',
    poor: '0.5-1.8',
  },
  { key: 'reviewsAndProducts', global: '5-15', rich: '8-12', medium: '1-3', poor: '0.2-0.6' },
  { key: 'dailyLifeAndFamily', global: '3-10', rich: '5-9', medium: '0.8-2', poor: '0.1-0.4' },
  {
    key: 'selfDevelopmentAndProfessionalTips',
    global: '6-20',
    rich: '10-18',
    medium: '2-4',
    poor: '0.3-0.8',
  },
];

type Region = 'global' | 'rich' | 'medium' | 'poor';

export default function CpmCalculator({ t }: { t: typeof en }) {
  const { lang } = useApp();
  const ar = lang === 'ar';
  const [niche, setNiche] = useState('');
  const [region, setRegion] = useState<Region>('global');
  const [views, setViews] = useState('100000');
  const range = cpmData.find((item) => item.key === niche)?.[region];
  const playbacks = Number(views);
  const validViews =
    views.trim() !== '' &&
    Number.isFinite(playbacks) &&
    playbacks >= 0 &&
    Number.isInteger(playbacks) &&
    playbacks <= 1e12;
  const estimate =
    range && validViews
      ? range.split(/[–-]/).map((rate) => ((Number(rate) * playbacks) / 1000) * 0.55)
      : null;
  const usd = (amount: number) =>
    new Intl.NumberFormat(ar ? 'ar' : 'en', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  return (
    <div className="space-y-6">
      <p className="text-sm text-base-content/65 leading-relaxed">
        {ar
          ? 'استكشف تقديراً تقريبياً للأرباح حسب مجالك وجمهورك. استخدم مرات التشغيل التي تعرض إعلانات، وليس إجمالي المشاهدات.'
          : 'Explore an illustrative ad-revenue range for your niche and audience. Enter monetized playbacks, rather than total video views.'}
      </p>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="revenue-niche" className="block text-sm font-medium mb-2">
            {t.cpmCalculator.selectNiche}
          </label>
          <select
            id="revenue-niche"
            className="select-modern"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          >
            <option value="">{t.cpmCalculator.chooseNiche}</option>
            {cpmData.map((item) => (
              <option key={item.key} value={item.key}>
                {t.cpmCalculator.niches[item.key as keyof typeof t.cpmCalculator.niches] ||
                  item.key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="revenue-region" className="block text-sm font-medium mb-2">
            {t.cpmCalculator.countryCategory}
          </label>
          <select
            id="revenue-region"
            className="select-modern"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
          >
            <option value="global">{t.cpmCalculator.globalAverage}</option>
            <option value="rich">{t.cpmCalculator.wealthyCountries}</option>
            <option value="medium">{t.cpmCalculator.middleIncome}</option>
            <option value="poor">{t.cpmCalculator.lowIncome}</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="revenue-views" className="block text-sm font-medium mb-2">
            {ar ? 'مرات التشغيل التي تعرض إعلانات' : 'Monetized playbacks'}
          </label>
          <input
            id="revenue-views"
            className="input-modern"
            type="number"
            min="0"
            max="1000000000000"
            step="1"
            value={views}
            onChange={(e) => setViews(e.target.value)}
            aria-invalid={!validViews}
            aria-describedby="views-help"
          />
          <p
            id="views-help"
            className={`text-xs mt-2 ${validViews ? 'text-base-content/55' : 'text-error'}`}
          >
            {validViews
              ? ar
                ? 'ليست كل مشاهدة تعرض إعلاناً. راجع تحليلات يوتيوب لمعرفة مرات التشغيل التي تحقق الدخل.'
                : 'Not every view serves an ad. Check YouTube Analytics for your monetized playback count.'
              : ar
                ? 'أدخل عدداً صحيحاً بين 0 و 1,000,000,000,000.'
                : 'Enter a whole number between 0 and 1,000,000,000,000.'}
          </p>
        </div>
      </div>
      <div className="rounded-2xl p-6 border border-success/20 bg-success/5" aria-live="polite">
        {estimate ? (
          <>
            <p className="text-xs uppercase tracking-wider text-base-content/60 mb-3">
              {ar ? 'تقدير أرباح المنشئ' : 'Illustrative creator revenue'}
            </p>
            <p
              className="text-3xl sm:text-4xl font-bold text-success mb-4"
              data-testid="revenue-result"
            >
              {usd(estimate[0])} – {usd(estimate[1])}
            </p>
            <p className="text-sm text-base-content/65">
              {ar ? 'نطاق CPM المستخدم' : 'CPM range used'}: ${range} ·{' '}
              {ar ? 'حصة المنشئ المفترضة: 55٪' : 'Assumed creator share: 55%'}
            </p>
          </>
        ) : (
          <p className="text-sm text-base-content/65">
            {ar
              ? 'اختر مجالاً وأدخل مرات تشغيل صالحة لرؤية تقديرك.'
              : 'Choose a niche and enter valid playbacks to see your estimate.'}
          </p>
        )}
      </div>
      <p className="text-xs leading-relaxed text-base-content/60">
        {ar
          ? 'هذه النطاقات أمثلة تقريبية وليست أسعاراً مباشرة أو أرباحاً مضمونة. يفترض التقدير حصة 55٪ لإعلانات الفيديوهات الطويلة فقط؛ لا ينطبق على Shorts. تتغير الأرباح حسب الموسم والمعلنين والجمهور. استخدم RPM الحقيقي في تحليلاتك للتخطيط المالي.'
          : 'These static ranges are rough examples, not live rates or guaranteed earnings. The estimate assumes a 55% creator share for long-form watch-page ads; it does not apply to Shorts. Revenue varies with season, advertisers, and audience. Use your actual Analytics RPM for financial planning.'}
      </p>
    </div>
  );
}
