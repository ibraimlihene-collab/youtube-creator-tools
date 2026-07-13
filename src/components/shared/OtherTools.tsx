import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { TOOLS } from '../../lib/tools';

type OtherToolsProps = {
  currentTool: string;
  t: any;
  limit?: number;
};

const OtherTools = ({ currentTool, t, limit = 6 }: OtherToolsProps) => {
  const otherTools = TOOLS.filter((tool) => tool.id !== currentTool).slice(0, limit);

  return (
    <section className="mt-12 pt-8 border-t border-base-300">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          {t.landingPage?.ourTools || 'More tools'}
        </h2>
        <p className="text-base-content/60 text-sm">
          {t.landingPage?.ourToolsDesc ||
            'Discover more tools to help you create amazing YouTube content.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.path}
              className="group surface-card p-4 hover-lift transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold mb-0.5 truncate">
                    {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
                  </h3>
                  <p className="text-xs text-base-content/60 line-clamp-2 mb-2">
                    {(t.landingPage?.[`${tool.id}Desc` as keyof typeof t.landingPage] as string) ||
                      `Powerful ${tool.id} tool for YouTube creators`}
                  </p>
                  <div className="flex items-center text-primary font-medium text-xs">
                    {t.landingPage?.tryIt || 'Try it now'}
                    <ChevronRight className="ms-1 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
