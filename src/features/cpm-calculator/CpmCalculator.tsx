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
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">حاسبة تقدير أرباح يوتيوب (CPM)</h2>
        <p className="mb-4">اختر مجالك وفئة الدولة لترى تقدير تكلفة الألف ظهور (CPM).</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Field Selector */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">اختر المجال</span>
            </label>
            <select 
              className="select select-bordered"
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(Number(e.target.value))}
            >
              <option disabled value="">اختر...</option>
              {cpmData.map(item => (
                <option key={item.id} value={item.id}>{item.field}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">اختر فئة الدولة</span>
            </label>
            <select 
              className="select select-bordered"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
            >
              <option disabled value="">اختر...</option>
              <option value="rich">دول غنية</option>
              <option value="medium">دول متوسطة</option>
              <option value="poor">الدول النامية</option>
            </select>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-6">
            <div className="alert alert-success">
              <div>
                <span className="text-lg font-bold">الـ CPM المقدر هو:</span>
                <span className="text-2xl font-mono ml-2">${result}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CpmCalculator;