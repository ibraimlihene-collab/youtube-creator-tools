import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scissors, 
  Calculator, 
  Download, 
  Eye, 
  Tags, 
  Palette, 
  Image, 
  Repeat, 
  Pen, 
  AlignLeft, 
  Type,
  ChevronRight,
  Star,
  Zap,
  Globe,
  Users,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import ar from '../locales/ar.json';
import en from '../locales/en.json';

type Lang = 'ar' | 'en';
type Theme = 'light' | 'dark' | 'customDark';

const tools = [
  { id: 'silenceRemover', icon: Scissors, path: '/silence-remover' },
  { id: 'cpmCalculator', icon: Calculator, path: '/cpm-calculator' },
  { id: 'thumbnailDownloader', icon: Download, path: '/thumbnail-downloader' },
  { id: 'thumbnailPreviewer', icon: Eye, path: '/thumbnail-previewer' },
  { id: 'hashtagGenerator', icon: Tags, path: '/hashtag-generator' },
  { id: 'colorPaletteGenerator', icon: Palette, path: '/color-palette-generator' },
  { id: 'thumbnailGenerator', icon: Image, path: '/thumbnail-generator' },
  { id: 'videoRephraser', icon: Repeat, path: '/video-rephraser' },
  { id: 'scriptWriter', icon: Pen, path: '/script-writer' },
  { id: 'descriptionGenerator', icon: AlignLeft, path: '/description-generator' },
  { id: 'titleGenerator', icon: Type, path: '/title-generator' },
];

const features = [
  {
    icon: Zap,
    titleKey: 'features.fastProcessing',
    descriptionKey: 'features.fastProcessingDesc'
  },
  {
    icon: Globe,
    titleKey: 'features.multiLanguage',
    descriptionKey: 'features.multiLanguageDesc'
  },
  {
    icon: Shield,
    titleKey: 'features.privacyFirst',
    descriptionKey: 'features.privacyFirstDesc'
  },
  {
    icon: Users,
    titleKey: 'features.community',
    descriptionKey: 'features.communityDesc'
  }
];

const faqs = [
  {
    questionKey: 'faqs.toolQuestion1',
    answerKey: 'faqs.toolAnswer1'
  },
  {
    questionKey: 'faqs.toolQuestion2',
    answerKey: 'faqs.toolAnswer2'
  },
  {
    questionKey: 'faqs.toolQuestion3',
    answerKey: 'faqs.toolAnswer3'
  },
  {
    questionKey: 'faqs.toolQuestion4',
    answerKey: 'faqs.toolAnswer4'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  
  // State for theme and language
  const [lang, setLang] = useState<Lang>(() => {
    const savedLang = localStorage.getItem('lang');
    return (savedLang as Lang) || 'en';
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'customDark';
  });
  
  const t = useMemo(() => (lang === 'ar' ? ar : en), [lang]);

  // Update document attributes when theme or language changes
  useEffect(() => {
    localStorage.setItem('lang', lang);
    const html = document.querySelector('html');
    if (html) {
      html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      html.setAttribute('lang', lang);
    }
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const html = document.querySelector('html');
    if (html) {
      html.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // SEO meta tags
  useEffect(() => {
    const title = t.app.title ? `${t.app.title} - ${t.landingPage?.metaTitle || 'Free YouTube Creator Tools'}` : 'YouCreator Tools - Free YouTube Creator Tools';
    const description = t.landingPage?.metaDescription || 'Boost your YouTube channel with our free tools. Generate hashtags, calculate CPM, remove silence, create thumbnails, and more!';
    const keywords = t.landingPage?.metaKeywords || 'YouTube tools, content creation, video editing, hashtag generator, CPM calculator, thumbnail creator';
    
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }
    
    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = title;
      document.head.appendChild(meta);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = description;
      document.head.appendChild(meta);
    }
    
    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', window.location.origin);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = window.location.origin;
      document.head.appendChild(link);
    }
  }, [t, lang]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'dark') return 'light';
      if (prevTheme === 'light') return 'customDark';
      return 'dark';
    });
  };

  // Toggle language
  const toggleLanguage = () => {
    setLang(prevLang => prevLang === 'ar' ? 'en' : 'ar');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-base-200 to-base-300 text-base-content">
      {/* Navbar */}
      <nav className="navbar bg-base-100/80 backdrop-blur-sm border-b border-base-300 sticky top-0 z-50">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">YC</span>
            </div>
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {t.app.title}
            </a>
          </div>
        </div>
        <div className="flex-none gap-2">
          <button 
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle hover:bg-red-600/10 hover:text-primary transition-colors"
            title={theme === 'dark' ? (t.app.theme?.light || 'Light Mode') : (t.app.theme?.dark || 'Dark Mode')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleLanguage}
            className="btn btn-ghost btn-circle hover:bg-red-600/10 hover:text-primary transition-colors"
            title={lang === 'ar' ? 'English' : 'العربية'}
          >
            <Languages className="w-5 h-5" />
          </button>
          <button 
            onClick={() => navigate('/app')}
            className="btn btn-red-600"
          >
            {t.landingPage?.openApp || 'Open App'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative section-padding pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero-background.png" 
            alt="YouTube Creator Tools Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-base-200/80 to-base-300/90"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6 animate-fade-in-up">
              {t.landingPage?.heroTitle || 'Supercharge Your YouTube Channel'}
            </h1>
            <p className="text-xl md:text-2xl text-base-content/80 max-w-3xl mx-auto mb-10 animate-fade-in-up animation-delay-100">
              {t.landingPage?.heroSubtitle || 'Free tools to help you create better content, grow your audience, and increase your revenue.'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up animation-delay-200">
              <button 
                onClick={() => navigate('/silence-remover')}
                className="btn btn-red-600 btn-lg px-8 py-4 rounded-xl hover-lift text-lg font-semibold"
              >
                {t.landingPage?.getStarted || 'Get Started'} <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button 
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-outline btn-lg px-8 py-4 rounded-xl hover-lift text-lg font-semibold"
              >
                {t.landingPage?.exploreTools || 'Explore Tools'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating creator profile images */}
        <div className="absolute bottom-10 left-10 hidden lg:block">
          <img 
            src="/assets/creator-profiles.png" 
            alt="Creator Profiles" 
            className="w-20 h-20 rounded-full border-4 border-white shadow-xl"
          />
        </div>
        <div className="absolute top-20 right-20 hidden lg:block">
          <img 
            src="/assets/creator-profiles.png" 
            alt="Creator Profiles" 
            className="w-16 h-16 rounded-full border-4 border-white shadow-xl"
          />
        </div>
      </section>

      {/* Embedded Tools Preview */}
      <section className="section-padding py-16 bg-base-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.landingPage?.tryOurTools || 'Try Our Tools'}
            </h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              {t.landingPage?.tryOurToolsDesc || 'Experience some of our most popular tools right here.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hashtag Generator Preview */}
            <div className="glass-effect rounded-2xl p-6 hover-lift transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Tags className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">
                  {t.app.tools.hashtagGenerator?.title || 'Hashtag Generator'}
                </h3>
              </div>
              <div className="space-y-4">
                <textarea 
                  placeholder={t.hashtagGenerator?.placeholder || "Paste your content here to generate relevant hashtags..."}
                  className="textarea textarea-bordered w-full h-32"
                ></textarea>
                <div className="flex flex-wrap gap-2">
                  {['#youtube', '#creator', '#content', '#video'].map((tag, index) => (
                    <span key={index} className="badge badge-primary badge-outline">
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="btn btn-red-600 w-full">
                  {t.hashtagGenerator?.generate || 'Generate Hashtags'}
                </button>
              </div>
            </div>
            
            {/* CPM Calculator Preview */}
            <div className="glass-effect rounded-2xl p-6 hover-lift transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">
                  {t.app.tools.cpmCalculator?.title || 'CPM Calculator'}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t.cpmCalculator?.selectNiche || 'Select Your Niche'}</span>
                  </label>
                  <select className="select select-bordered">
                    <option>{t.cpmCalculator?.chooseNiche || 'Choose a niche...'}</option>
                    <option>Gaming</option>
                    <option>Education</option>
                    <option>Entertainment</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">{t.cpmCalculator?.countryCategory || 'Country Category'}</span>
                  </label>
                  <select className="select select-bordered">
                    <option>{t.cpmCalculator?.selectCategory || 'Select category...'}</option>
                    <option>{t.cpmCalculator?.wealthyCountries || '🇺🇸🇬🇧🇨🇦🇺 Wealthy Countries'}</option>
                    <option>{t.cpmCalculator?.middleIncome || '🌍 Middle Income Countries'}</option>
                  </select>
                </div>
                <div className="bg-red-600/10 rounded-xl p-4 text-center">
                  <p className="text-sm text-base-content/70">{t.cpmCalculator?.result || 'Estimated CPM'}</p>
                  <p className="text-2xl font-bold text-primary">$8.50</p>
                </div>
                <button className="btn btn-red-600 w-full">
                  {t.landingPage?.calculate || 'Calculate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.landingPage?.whyChooseUs || 'Why Choose YouCreator Tools?'}
            </h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              {t.landingPage?.whyChooseUsDesc || 'Everything you need to create professional YouTube content, all in one place.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="glass-effect rounded-2xl p-6 hover-lift transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">
                    {t.landingPage?.features?.[feature.titleKey.split('.')[1] as keyof typeof t.landingPage.features] || feature.titleKey}
                  </h3>
                  <p className="text-base-content/70">
                    {t.landingPage?.features?.[feature.descriptionKey.split('.')[1] as keyof typeof t.landingPage.features] || feature.descriptionKey}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Showcase */}
      <section id="tools" className="section-padding py-16 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="/assets/tools-background.png" 
            alt="Tools Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.landingPage?.ourTools || 'Our Powerful Tools'}
            </h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              {t.landingPage?.ourToolsDesc || 'Everything you need to create, optimize, and grow your YouTube channel.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={tool.id}
                  className="glass-effect rounded-2xl p-6 hover-lift transition-all duration-300 cursor-pointer animate-fade-in-up"
                  onClick={() => navigate(tool.path)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
                      </h3>
                      <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                        {t.landingPage?.[`${tool.id}Desc` as keyof typeof t.landingPage] as string || `Powerful ${tool.id} tool for YouTube creators`}
                      </p>
                      <div className="flex items-center text-primary font-medium text-sm">
                        {t.landingPage?.tryIt || 'Try it now'} <ChevronRight className="ml-1 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

   
      {/* FAQ Section */}
      <section className="section-padding py-16 bg-base-100/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.landingPage?.frequentlyAsked || 'Frequently Asked Questions'}
            </h2>
            <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
              {t.landingPage?.frequentlyAskedDesc || 'Everything you need to know about our tools and services.'}
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-effect rounded-22 p-6 hover-lift">
                <h3 className="text-lg font-bold mb-3">
                  {t.landingPage?.faqs?.[faq.questionKey.split('.')[1] as keyof typeof t.landingPage.faqs] || faq.questionKey}
                </h3>
                <p className="text-base-content/80">
                  {t.landingPage?.faqs?.[faq.answerKey.split('.')[1] as keyof typeof t.landingPage.faqs] || faq.answerKey}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-content mb-6">
            {t.landingPage?.readyToStart || 'Ready to Transform Your YouTube Channel?'}
          </h2>
          <p className="text-xl text-primary-content/90 mb-10 max-w-3xl mx-auto">
            {t.landingPage?.readyToStartDesc || 'Join thousands of creators who are already using our tools to grow their channels.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/app')}
              className="btn btn-primary-content btn-lg px-8 py-4 rounded-xl hover-lift text-lg font-semibold"
            >
              {t.landingPage?.startCreating || 'Start Creating Now'} <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button 
              onClick={() => window.location.href = 'mailto:support@youcreatortools.com'}
              className="btn btn-outline btn-primary-content btn-lg px-8 py-4 rounded-xl hover-lift text-lg font-semibold"
            >
              {t.landingPage?.contact || 'Contact Support'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-300 text-base-content py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">YC</span>
                </div>
                <a href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {t.app.title}
                </a>
              </div>
              <p className="text-base-content/80 mb-4 max-w-md">
                {t.landingPage?.heroSubtitle || 'Free tools to help you create better content, grow your audience, and increase your revenue.'}
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-base-content/80 hover:text-primary transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-base-content/80 hover:text-primary transition-colors">
                  <Users className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">{t.landingPage?.ourTools || 'Tools'}</h3>
              <ul className="space-y-2">
                {tools.slice(0, 5).map((tool) => (
                  <li key={tool.id}>
                    <a 
                      href={tool.path} 
                      className="text-base-content/80 hover:text-primary transition-colors"
                    >
                      {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">{t.landingPage?.about || 'Company'}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-base-content/80 hover:text-primary transition-colors">
                    {t.landingPage?.about || 'About Us'}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base-content/80 hover:text-primary transition-colors">
                    {t.landingPage?.contact || 'Contact'}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base-content/80 hover:text-primary transition-colors">
                    {t.landingPage?.privacy || 'Privacy Policy'}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base-content/80 hover:text-primary transition-colors">
                    {t.landingPage?.terms || 'Terms of Service'}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-base-300/50 mt-12 pt-8 text-center text-base-content/60">
            <p>{t.landingPage?.copyright || '© 2023 YouCreator Tools. All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;