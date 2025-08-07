import React, { useState, useMemo } from 'react';

const cpmData = [
  { id: 1, field: 'المال والاستثمار', global: '15–50', rich: '25–40', medium: '3–6', poor: '0.5–2' },
  { id: 2, field: 'البرمجة', global: '5–30', rich: '15–25', medium: '1–3', poor: '0.1–0.5' },
  { id: 3, field: 'التجارة الإلكترونية', global: '10–35', rich: '20–30', medium: '2–5', poor: '0.5–1.5' },
  { id: 4, field: 'التسويق الرقمي', global: '12–40', rich: '25–35', medium: '3–6', poor: '0.8–2' },
  { id: 5, field: 'العملات الرقمية', global: '10–30', rich: '18–25', medium: '2–4', poor: '0.4–1' },
  { id: 6, field: 'العقارات', global: '15–45', rich: '30–40', medium: '3–7', poor: '0.6–2' },
  { id: 7, field: 'مراجعات المنتجات', global: '5–12', rich: '8–10', medium: '1–2', poor: '0.2–0.6' },
  { id: 8, field: 'التقنية والأجهزة', global: '5–15', rich: '8–12', medium: '1–3', poor: '0.2–0.5' },
  { id: 9, field: 'التعليم والتدريب', global: '6–20', rich: '12–18', medium: '2–4', poor: '0.4–1' },
  { id: 10, field: 'الألعاب', global: '4–15', rich: '8–12', medium: '1–2.5', poor: '0.1–0.4' },
  { id: 11, field: 'الصحة والتغذية', global: '7–20', rich: '12–18', medium: '1.5–3', poor: '0.2–0.7' },
  { id: 12, field: 'اللياقة البدنية', global: '7–18', rich: '12–16', medium: '1.3–3', poor: '0.2–0.6' },
  { id: 13, field: 'الجمال والعناية', global: '5–18', rich: '9–15', medium: '0.9–3.3', poor: '0.2–0.6' },
  { id: 14, field: 'السفر والسياحة', global: '6–20', rich: '12–18', medium: '1.1–3.5', poor: '0.2–0.7' },
  { id: 15, field: 'الطبيعة والحيوانات', global: '1.8–3.5', rich: '3–4', medium: '0.3–0.5', poor: '0.06–0.2' },
  { id: 16, field: 'السيارات والمركبات', global: '5–15', rich: '8–12', medium: '1–2.5', poor: '0.2–0.6' },
  { id: 17, field: 'الفلوقات والترفيه', global: '2.7–6.4', rich: '5–9', medium: '0.5–1.2', poor: '0.1–0.3' },
  { id: 18, field: 'الكوميديا', global: '3–8', rich: '6–8', medium: '0.8–1.5', poor: '0.1–0.3' },
  { id: 19, field: 'التنمية الذاتية', global: '6–15', rich: '10–14', medium: '1–3', poor: '0.2–0.6' },
  { id: 20, field: 'الموسيقى', global: '1–3', rich: '2–3', medium: '0.5–1', poor: '0.1–0.2' },
  { id: 21, field: 'التصوير والمونتاج', global: '5–12', rich: '10–12', medium: '1.2–2', poor: '0.2–0.5' },
  { id: 22, field: 'الدروس التعليمية', global: '10–25', rich: '18–22', medium: '2–4', poor: '0.3–0.8' },
  { id: 23, field: 'التاريخ والثقافة', global: '4–10', rich: '7–9', medium: '1–2', poor: '0.2–0.4' },
  { id: 24, field: 'الكتب والقراءة', global: '3–6', rich: '5–6', medium: '0.8–1.2', poor: '0.2–0.3' },
  { id: 25, field: 'الطبخ والمأكولات', global: '4–12', rich: '7–10', medium: '1–2', poor: '0.3–0.6' },
  { id: 26, field: 'الديكور والتصميم', global: '5–14', rich: '9–12', medium: '1.3–2.5', poor: '0.3–0.6' },
  { id: 27, field: 'الحرف اليدوية', global: '3–10', rich: '6–9', medium: '1–2', poor: '0.3–0.5' },
  { id: 28, field: 'الاستعراضات الكوميدية', global: '3–7', rich: '6–7', medium: '1–1.5', poor: '0.2–0.3' },
  { id: 29, field: 'ريادة الأعمال', global: '12–30', rich: '20–28', medium: '3–5', poor: '0.5–1.5' },
  { id: 30, field: 'قصص وتجارب شخصية', global: '2–8', rich: '5–7', medium: '1–1.5', poor: '0.2–0.4' },
  { id: 31, field: 'نمط الحياة', global: '3–8', rich: '6–8', medium: '1–1.8', poor: '0.2–0.4' },
  { id: 32, field: 'التكنولوجيا والعلوم', global: '5-25', rich: '10-20', medium: '1-4', poor: '0.2-0.8' },
  { id: 33, field: 'الذكاء الاصطناعي والتعلّم الآلي', global: '8-30', rich: '15-28', medium: '2-5', poor: '0.5-1.5' },
  { id: 34, field: 'الأمن السيبراني واختبار الاختراق', global: '10-35', rich: '18-30', medium: '3-6', poor: '0.6-2' },
  { id: 35, field: 'تطوير الويب', global: '7-28', rich: '12-25', medium: '2-5', poor: '0.4-1.2' },
  { id: 36, field: 'تطبيقات الهاتف المحمول', global: '6-25', rich: '10-22', medium: '1.5-4', poor: '0.3-1' },
  { id: 37, field: 'الواقع الافتراضي والواقع المعزّز (VR/AR)', global: '5-20', rich: '10-18', medium: '1-3.5', poor: '0.2-0.8' },
  { id: 38, field: 'إنترنت الأشياء (IoT)', global: '5-22', rich: '10-20', medium: '1-4', poor: '0.3-0.9' },
  { id: 39, field: 'التمويل الشخصي', global: '10-40', rich: '20-35', medium: '3-7', poor: '0.8-2.5' },
  { id: 40, field: 'تداول الأسهم والفوركس', global: '15-50', rich: '25-45', medium: '4-8', poor: '1-3' },
  { id: 41, field: 'الرياضات الإلكترونية (eSports)', global: '5-18', rich: '10-15', medium: '1.5-3', poor: '0.2-0.7' },
  { id: 42, field: 'التعليم والمعرفة', global: '6-25', rich: '12-22', medium: '2-5', poor: '0.4-1' },
  { id: 43, field: 'الترفيه والفنون', global: '3-10', rich: '5-9', medium: '0.8-2', poor: '0.1-0.5' },
  { id: 44, field: 'الصحة والجمال', global: '5-20', rich: '10-18', medium: '1-3.5', poor: '0.2-0.7' },
  { id: 45, field: 'الدين والثقافة', global: '2-10', rich: '4-9', medium: '0.5-2', poor: '0.1-0.4' },
  { id: 46, field: 'السينما والتلفزيون', global: '4-12', rich: '7-10', medium: '1-2', poor: '0.3-0.6' },
  { id: 47, field: 'الرياضة والنشاط البدني', global: '5-18', rich: '8-15', medium: '1-3', poor: '0.2-0.5' },
  { id: 48, field: 'الموضة والأزياء', global: '4-15', rich: '7-12', medium: '1-2.5', poor: '0.2-0.5' },
  { id: 49, field: 'التسويق وريادة الأعمال', global: '12-35', rich: '20-30', medium: '3-6', poor: '0.5-1.8' },
  { id: 50, field: 'المراجعات والمنتجات', global: '5-15', rich: '8-12', medium: '1-3', poor: '0.2-0.6' },
  { id: 51, field: 'الحياة اليومية والأسرة', global: '3-10', rich: '5-9', medium: '0.8-2', poor: '0.1-0.4' },
  { id: 52, field: 'التطوير الذاتي والنصائح المهنية', global: '6-20', rich: '10-18', medium: '2-4', poor: '0.3-0.8' }
];

const CpmCalculator: React.FC = () => {
  const [selectedFieldId, setSelectedFieldId] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<'global' | 'rich' | 'medium' | 'poor' | ''>('');

  const result = useMemo(() => {
    if (selectedFieldId === '' || selectedCategory === '') {
      return null;
    }
    const fieldData = cpmData.find(item => item.id === selectedFieldId);
    if (!fieldData) {
      return null;
    }
    // @ts-ignore
    return fieldData[selectedCategory];
  }, [selectedFieldId, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold mb-2">YouTube CPM Calculator</h2>
        <p className="opacity-80">Estimate your YouTube earnings based on your niche and target audience</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Field Selector */}
        <div className="form-control">
          <label className="label label-text font-medium mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Select Your Niche
            </span>
          </label>
          <select
            className="select select-bordered select-lg"
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(Number(e.target.value))}
          >
            <option disabled value="">Choose a niche...</option>
            {cpmData.map(item => (
              <option key={item.id} value={item.id}>{item.field}</option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="form-control">
          <label className="label label-text font-medium mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Country Category
            </span>
          </label>
          <select
            className="select select-bordered select-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
          >
            <option disabled value="">Select category...</option>
            <option value="rich">🇺🇸🇬🇧🇨🇦🇦🇺 Wealthy Countries</option>
            <option value="medium">🇧🇷🇮🇳🇹🇷🇵🇱 Medium Countries</option>
            <option value="poor">🇵🇰🇳🇬🇻🇳🇧🇩 Developing Countries</option>
          </select>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="mt-8">
          <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-2xl p-6 border border-success/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Estimated CPM</h3>
                <p className="text-sm opacity-70">Cost Per Mille (1000 views)</p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-4xl font-bold text-success">
                  ${result}
                </div>
                <div className="text-sm opacity-70 mt-1">
                  {selectedCategory === 'rich' && 'Premium advertiser rates'}
                  {selectedCategory === 'medium' && 'Moderate advertiser rates'}
                  {selectedCategory === 'poor' && 'Basic advertiser rates'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="card bg-base-100/50 backdrop-blur-sm">
              <div className="card-body items-center text-center">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold">Revenue Potential</h4>
                <p className="text-sm opacity-70">
                  {selectedCategory === 'rich' ? 'High' : selectedCategory === 'medium' ? 'Medium' : 'Moderate'}
                </p>
              </div>
            </div>
            <div className="card bg-base-100/50 backdrop-blur-sm">
              <div className="card-body items-center text-center">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-semibold">Growth Rate</h4>
                <p className="text-sm opacity-70">
                  {selectedFieldId ? 'Varies by niche' : 'Select niche'}
                </p>
              </div>
            </div>
            <div className="card bg-base-100/50 backdrop-blur-sm">
              <div className="card-body items-center text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold">Competition</h4>
                <p className="text-sm opacity-70">
                  {selectedFieldId ? 'High in popular niches' : 'Select niche'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!result && (
        <div className="alert alert-info">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Select your niche and country category to see estimated CPM rates</span>
        </div>
      )}
    </div>
  );
};

export default CpmCalculator;