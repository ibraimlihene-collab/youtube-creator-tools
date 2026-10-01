import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Copy } from 'lucide-react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

type CopyButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'brand' | 'soft' | 'ghost';
};

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className = '',
  size = 'sm',
  variant = 'soft',
}) => {
  const { lang } = useApp();
  const [failed, setFailed] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const base =
    variant === 'brand' ? 'btn-brand' : variant === 'ghost' ? 'btn btn-ghost' : 'btn-soft';

  const showLabel = Boolean(copied ? copiedLabel : label);

  return (
    <>
      <button
        type="button"
        className={`btn ${size === 'sm' ? 'btn-sm' : ''} ${base} ${showLabel ? 'gap-1.5' : ''} ${className}`}
        onClick={async () => setFailed(!(await copy(text)))}
        disabled={!text}
        aria-label={copied ? copiedLabel || 'Copied' : label || 'Copy'}
        title={copied ? copiedLabel || 'Copied' : label || 'Copy'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {showLabel ? (copied ? copiedLabel : label) : null}
      </button>
      {failed && (
        <span role="alert" className="text-xs text-error">
          {lang === 'ar'
            ? 'تعذر النسخ. حدد النص وانسخه يدوياً.'
            : 'Could not copy. Select the text and copy manually.'}
        </span>
      )}
    </>
  );
};

export default CopyButton;
