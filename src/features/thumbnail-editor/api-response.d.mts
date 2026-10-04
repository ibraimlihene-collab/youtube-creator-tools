export class EditorApiError extends Error {
  status: number;
  unavailable: boolean;
  constructor(message: string, status: number, unavailable?: boolean);
}
export function readEditorResponse(response: Response, ar?: boolean): Promise<Record<string, unknown>>;
