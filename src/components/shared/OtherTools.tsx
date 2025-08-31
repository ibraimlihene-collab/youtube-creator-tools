import React from 'react';
import { Link } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';

type OtherToolsProps = {
  currentTool: string;
  t: any;
};

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

const OtherTools = ({ currentTool, t }: OtherToolsProps) => {
  // Filter out the current tool
  const otherTools = tools.filter(tool => tool.id !== currentTool);

  return (
    <section className="mt-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          {t.landingPage?.ourTools || 'Our Other Tools'}
        </h2>
        <p className="text-base-content/80 max-w-2xl mx-auto">
          {t.landingPage?.ourToolsDesc || 'Discover more tools to help you create amazing YouTube content.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link 
              key={tool.id}
              to={tool.path}
              className="glass-effect rounded-2xl p-6 hover-lift transition-all duration-300"
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
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default OtherTools;