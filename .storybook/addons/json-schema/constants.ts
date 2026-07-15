export const ADDON_ID = 'json-schema';
export const PANEL_ID = `${ADDON_ID}/panel`;
export const PARAM_KEY = 'jsonSchema';

export const EVENTS = {
	RESULT: `${ADDON_ID}/result`,
	REQUEST: `${ADDON_ID}/request`,
} as const;

export interface ValidationIssue {
	code: string;
	path: (string | number)[];
	message: string;
}

export interface SchemaResult {
	storyId: string;
	/** Emitted JSON Schema (draft 2020-12) of the story's zod schema; null when the story has no jsonSchema parameter. */
	schema: Record<string, unknown> | null;
	issues: ValidationIssue[];
	error?: string;
}
