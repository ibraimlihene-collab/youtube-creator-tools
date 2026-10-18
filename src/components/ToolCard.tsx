import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ToolCardProps {
  title: string;
  icon: React.ElementType;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  icon: Icon,
  description,
  badge,
  children,
}) => {
  const { lang } = useApp();
  return (
    <div className="tool-panel animate-fade-in">
      <Link to="/app" className="tool-back-link">
        <ArrowLeft size={14} className="directional-icon" />
        {lang === 'ar' ? 'كل الأدوات' : 'All tools'}
      </Link>
      <div className="tool-panel-header flex flex-col sm:flex-row sm:items-center gap-4 border-b border-base-300">
        <div className="flex items-center gap-4 min-w-0">
          <div className="tool-panel-icon w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                {title}
              </h1>
              {badge}
            </div>
            {description ? (
              <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
};

export default ToolCard;
