import React, { useState, useMemo } from 'react';

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
  { key: 'vlogsAndEntertainment', global: '2.7–6.4', rich: '5–9', medium: '0.5–1.2', poor: '0.1–0.3' },
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
  { key: 'personalStoriesAndExperiences', global: '2–8', rich: '5–7', medium: '1–1.5', poor: '0.2–0.4' },
  { key: 'lifestyle', global: '3–8', rich: '6–8', medium: '1–1.8', poor: '0.2–0.4' },
  { key: 'technologyAndScience', global: '5-25', rich: '10-20', medium: '1-4', poor: '0.2-0.8' },
  { key: 'artificialIntelligenceAndMachineLearning', global: '8-30', rich: '15-28', medium: '2-5', poor: '0.5-1.5' },
  { key: 'cybersecurityAndPenetrationTesting', global: '10-35', rich: '18-30', medium: '3-6', poor: '0.6-2' },
  { key: 'webDevelopment', global: '7-28', rich: '12-25', medium: '2-5', poor: '0.4-1.2' },
  { key: 'mobileApplications', global: '6-25', rich: '10-22', medium: '1.5-4', poor: '0.3-1' },
  { key: 'virtualAndAugmentedReality', global: '5-20', rich: '10-18', medium: '1-3.5', poor: '0.2-0.8' },
  { key: 'internetOfThings', global: '5-22', rich: '10-20', medium: '1-4', poor: '0.3-0.9' },
  { key: 'personalFinance', global: '10-40', rich: '20-35', medium: '3-7', poor: '0.8-2.5' },
  { key: 'stockAndForexTrading', global: '15-50', rich: '25-45', medium: '4-8', poor: '1-3' },
  { key: 'electronicSports', global: '5-18', rich: '10-15', medium: '1.5-3', poor: '0.2-0.7' },
  { key: 'educationAndKnowledge', global: '6-25', rich: '12-22', medium: '2-5', poor: '0.4-1' },
  { key: 'entertainmentAndArts', global: '3-10', rich: '5-9', medium: '0.8-2', poor: '0.1-0.5' },
  { key: 'healthAndBeauty', global: '5-20', rich: '10-18', medium: '1-3.5', poor: '0.2-0.7' },
  { key: 'religionAndCulture', global: '2-10', rich: '4-9', medium: '0.5-2', poor: '0.1-0.4' },
  { key: 'cinemaAndTelevision', global: '4-12', rich: '7-10', medium: '1-2', poor: '0.3-0.6' },
  { key: 'sportsAndPhysicalActivity', global: '5-18', rich: '8-15', medium: '1-3', poor: '0.2-0.5' },
  { key: 'fashionAndClothing', global: '4-15', rich: '7-12', medium: '1-2.5', poor: '0.2-0.5' },
  { key: 'marketingAndEntrepreneurship', global: '12-35', rich: '20-30', medium: '3-6', poor: '0.5-1.8' },
  { key: 'reviewsAndProducts', global: '5-15', rich: '8-12', medium: '1-3', poor: '0.2-0.6' },
  { key: 'dailyLifeAndFamily', global: '3-10', rich: '5-9', medium: '0.8-2', poor: '0.1-0.4' },
  { key: 'selfDevelopmentAndProfessionalTips', global: '6-20', rich: '10-18', medium: '2-4', poor: '0.3-0.8' }
];

const CpmCalculator: React.FC<{ t: any }> = ({ t }) => {
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'global' | 'rich' | 'medium' | 'poor' | ''>('');

  const result = useMemo(() => {
    if (selectedFieldKey === '' || selectedCategory === '') {
      return null;
    }
    const fieldData = cpmData.find(item => item.key === selectedFieldKey);
    if (!fieldData) {
      return null;
    }
    // @ts-ignore
    return fieldData[selectedCategory];
  }, [selectedFieldKey, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
        <h2 className="text-2xl font-bold mb-2">{t.cpmCalculator.title}</h2>
        <p className="opacity-80">{t.cpmCalculator.description}</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Field Selector */}
        <div className="form-control">
          <label className="label label-text font-medium mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t.cpmCalculator.selectNiche}
            </span>
          </label>
          <select
            className="select select-bordered select-lg"
            value={selectedFieldKey}
            onChange={(e) => setSelectedFieldKey(e.target.value)}
          >
            <option disabled value="">{t.cpmCalculator.chooseNiche}</option>
            {cpmData.map(item => (
              <option key={item.key} value={item.key}>{t.cpmCalculator.niches[item.key]}</option>
            ))}
          </select>
        </div>

        {/* Category Selector */}
        <div className="form-control">
          <label className="label label-text font-medium mb-2">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.cpmCalculator.countryCategory}
            </span>
          </label>
          <select
            className="select select-bordered select-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
          >
            <option disabled value="">{t.cpmCalculator.selectCategory}</option>
            <option value="rich">{t.cpmCalculator.wealthyCountries}</option>
            <option value="medium">{t.cpmCalculator.middleIncome}</option>
            <option value="poor">{t.cpmCalculator.lowIncome}</option>
            <option value="global">{t.cpmCalculator.globalAverage}</option>
          </select>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-2xl p-6 border border-success/20 text-center">
          <h3 className="text-xl font-bold mb-2">{t.cpmCalculator.result}</h3>
          <p className="text-3xl font-bold text-success mb-2">${result}</p>
          <p className="opacity-80">{t.cpmCalculator.resultDescription}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="alert alert-warning shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.67 1.732-3L13.732 4c-.77-1.33-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{t.cpmCalculator.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};

export default CpmCalculator;