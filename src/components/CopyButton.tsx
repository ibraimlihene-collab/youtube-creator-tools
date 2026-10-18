import React from 'react';
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
  const { copied, copy } = useCopyToClipboard();

  const base =
    variant === 'brand'
      ? 'btn-brand'
      : variant === 'ghost'
        ? 'btn btn-ghost'
        : 'btn-soft';

  const showLabel = Boolean(copied ? copiedLabel : label);

  return (
    <button
      type="button"
      className={`btn ${size === 'sm' ? 'btn-sm' : ''} ${base} ${showLabel ? 'gap-1.5' : ''} ${className}`}
      onClick={() => copy(text)}
      disabled={!text}
      aria-label={copied ? (copiedLabel || 'Copied') : (label || 'Copy')}
      title={copied ? (copiedLabel || 'Copied') : (label || 'Copy')}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {showLabel ? (copied ? copiedLabel : label) : null}
    </button>
  );
};

export default CopyButton;
