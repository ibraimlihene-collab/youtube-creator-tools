import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Users } from 'lucide-react';

type ToolFooterProps = {
  t: any;
};

const ToolFooter = ({ t }: ToolFooterProps) => {
  const tools = [
    { id: 'silenceRemover', path: '/silence-remover' },
    { id: 'cpmCalculator', path: '/cpm-calculator' },
    { id: 'thumbnailDownloader', path: '/thumbnail-downloader' },
    { id: 'thumbnailPreviewer', path: '/thumbnail-previewer' },
    { id: 'hashtagGenerator', path: '/hashtag-generator' },
    { id: 'colorPaletteGenerator', path: '/color-palette-generator' },
    { id: 'thumbnailGenerator', path: '/thumbnail-generator' },
    { id: 'videoRephraser', path: '/video-rephraser' },
    { id: 'scriptWriter', path: '/script-writer' },
    { id: 'descriptionGenerator', path: '/description-generator' },
    { id: 'titleGenerator', path: '/title-generator' },
  ];

  return (
    <footer className="mt-16 pt-8 border-t border-base-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">YC</span>
              </div>
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {t.app.title}
              </Link>
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
                  <Link 
                    to={tool.path} 
                    className="text-base-content/80 hover:text-primary transition-colors"
                  >
                    {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
                  </Link>
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
  );
};

export default ToolFooter;