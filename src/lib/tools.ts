/**
 * Compatibility re-export — single source of truth is toolsRegistry.
 */
export {
  TOOLS,
  TOOL_COUNT,
  CATEGORY_META,
  ALL_CATEGORIES,
  getToolById,
  getToolByPath,
  type ToolDef,
  type ToolCategory,
  type ToolKind,
} from '../data/toolsRegistry';

/** @deprecated use string tool ids from registry */
export type ToolId = string;
