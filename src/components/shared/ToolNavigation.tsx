import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { TOOLS } from '../../lib/tools';

type ToolNavigationProps = {
  currentTool: string;
  t: any;
};

const ToolNavigation = ({ currentTool, t }: ToolNavigationProps) => {
  const current = TOOLS.find((tool) => tool.id === currentTool);
  const title = current
    ? t?.app?.tools?.[current.id]?.title || current.id
    : '';

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-base-content/60 hover:text-primary transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        {t?.app?.home || 'Home'}
      </Link>
      <span className="text-base-content/30">/</span>
      <Link
        to="/app"
        className="inline-flex items-center gap-1 text-base-content/60 hover:text-primary transition-colors"
      >
        {t?.landingPage?.openApp || 'App'}
      </Link>
      {title && (
        <>
          <span className="text-base-content/30">/</span>
          <span className="font-medium text-base-content/90 truncate max-w-[12rem] sm:max-w-none">
            {title}
          </span>
        </>
      )}
      <Link
        to="/app"
        className="ms-auto btn btn-ghost btn-xs gap-1 text-base-content/70"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {t?.app?.allTools || 'All tools'}
      </Link>
    </div>
  );
};

export default ToolNavigation;
