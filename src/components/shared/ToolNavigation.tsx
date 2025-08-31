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
  Type
} from 'lucide-react';

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

type ToolNavigationProps = {
  currentTool: string;
  t: any;
};

const ToolNavigation = ({ currentTool, t }: ToolNavigationProps) => {
  return (
    <nav className="mb-8">
      <div className="flex flex-wrap gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = tool.id === currentTool;
          
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className={`btn btn-sm flex items-center gap-2 ${
                isActive 
                  ? 'btn-primary' 
                  : 'btn-ghost hover:bg-base-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default ToolNavigation;