import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { TOOLS } from '../../lib/tools';

type ToolFooterProps = {
  t: any;
};

const ToolFooter = ({ t }: ToolFooterProps) => {
  return (
    <footer className="mt-14 pt-8 border-t border-base-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src="/assets/youtube-creator-icon.png"
              alt=""
              className="w-9 h-9 rounded-lg object-cover"
            />
            <Link to="/" className="text-lg font-bold hover:text-primary transition-colors">
              {t.app.title}
            </Link>
          </div>
          <p className="text-sm text-base-content/60 mb-3 max-w-sm">
            {t.landingPage?.heroSubtitle ||
              'Free tools to help you create better content, grow your audience, and increase your revenue.'}
          </p>
          <a
            href="https://github.com/ibraimlihene-collab/youtube-creator-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-base-content/70 hover:text-primary transition-colors"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-3">
            {t.landingPage?.ourTools || 'Tools'}
          </h3>
          <ul className="space-y-1.5">
            {TOOLS.slice(0, 6).map((tool) => (
              <li key={tool.id}>
                <Link
                  to={tool.path}
                  className="text-sm text-base-content/70 hover:text-primary transition-colors"
                >
                  {t.app.tools[tool.id as keyof typeof t.app.tools]?.title || tool.id}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-3">
            {t.landingPage?.about || 'About'}
          </h3>
          <p className="text-sm text-base-content/60 mb-3">
            {t.landingPage?.aboutDesc ||
              'A free open-source suite of tools for YouTube creators. Privacy-first and browser-based.'}
          </p>
          <p className="text-xs text-base-content/40">
            {t.landingPage?.copyright || '© 2026 YouCreator Tools. MIT License.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default ToolFooter;
