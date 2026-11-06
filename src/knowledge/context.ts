import { createContext, useContext } from 'react';
import type { Entry, Kind, Workspace } from './model';
export interface KnowledgeContextValue {
  data: Workspace;
  t: (key: string) => string;
  busy: boolean;
  commit: (next: Workspace) => Promise<boolean>;
  create: (kind: Kind, fields?: Record<string, string>, links?: string[]) => void;
  edit: (entry: Entry) => void;
  inspect: (entry: Entry) => void;
  update: (entry: Entry) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  notify: (message: string) => void;
}
export const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);
export function useKnowledge() {
  const value = useContext(KnowledgeContext);
  if (!value) throw new Error('Missing workspace');
  return value;
}
