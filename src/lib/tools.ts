import type { ElementType } from 'react';
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
  Sparkles,
  Clapperboard,
  Hash,
} from 'lucide-react';

export type ToolId =
  | 'silenceRemover'
  | 'cpmCalculator'
  | 'thumbnailDownloader'
  | 'thumbnailPreviewer'
  | 'hashtagGenerator'
  | 'colorPaletteGenerator'
  | 'thumbnailGenerator'
  | 'videoRephraser'
  | 'scriptWriter'
  | 'descriptionGenerator'
  | 'titleGenerator';

export type ToolCategory = 'editing' | 'thumbnails' | 'ai' | 'growth';

export interface ToolMeta {
  id: ToolId;
  icon: ElementType;
  path: string;
  category: ToolCategory;
  badge?: 'ai' | 'local' | 'new';
}

export const TOOLS: ToolMeta[] = [
  { id: 'silenceRemover', icon: Scissors, path: '/silence-remover', category: 'editing', badge: 'local' },
  { id: 'cpmCalculator', icon: Calculator, path: '/cpm-calculator', category: 'growth' },
  { id: 'thumbnailDownloader', icon: Download, path: '/thumbnail-downloader', category: 'thumbnails' },
  { id: 'thumbnailPreviewer', icon: Eye, path: '/thumbnail-previewer', category: 'thumbnails' },
  { id: 'hashtagGenerator', icon: Tags, path: '/hashtag-generator', category: 'growth', badge: 'ai' },
  { id: 'colorPaletteGenerator', icon: Palette, path: '/color-palette-generator', category: 'thumbnails' },
  { id: 'thumbnailGenerator', icon: Image, path: '/thumbnail-generator', category: 'thumbnails', badge: 'ai' },
  { id: 'videoRephraser', icon: Repeat, path: '/video-rephraser', category: 'ai', badge: 'ai' },
  { id: 'scriptWriter', icon: Pen, path: '/script-writer', category: 'ai', badge: 'ai' },
  { id: 'descriptionGenerator', icon: AlignLeft, path: '/description-generator', category: 'ai', badge: 'ai' },
  { id: 'titleGenerator', icon: Type, path: '/title-generator', category: 'ai', badge: 'ai' },
];

export const CATEGORY_META: Record<
  ToolCategory,
  { icon: ElementType; labelKey: string }
> = {
  editing: { icon: Clapperboard, labelKey: 'editing' },
  thumbnails: { icon: Image, labelKey: 'thumbnails' },
  ai: { icon: Sparkles, labelKey: 'ai' },
  growth: { icon: Hash, labelKey: 'growth' },
};

export const getToolById = (id: string) => TOOLS.find((t) => t.id === id);
export const getToolByPath = (path: string) => TOOLS.find((t) => t.path === path);
