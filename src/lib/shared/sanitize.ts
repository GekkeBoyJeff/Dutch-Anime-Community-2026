import DOMPurify from 'isomorphic-dompurify';

import type { Page } from '@/lib/site/content/schema';

// Allowlist tuned to what Puck's richtext field emits: formatting tags only — no scripts, no
// iframes, no event handlers, no `javascript:` URLs. isomorphic-dompurify runs the real DOMPurify in
// the browser and a jsdom-backed one in Node, so one allowlist guards both the render path
// (Content.tsx) and the publish path (PuckEditor).
export const sanitizeHtml = (dirty: string): string =>
	DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS: [
			'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'span',
		],
		ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
		ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
	});

// Defense-in-depth for the publish path: sanitize every HTML string in a page before it is written
// to the DB. Plain text is unchanged by the allowlist, so the '<' test can stand in for per-field
// schema knowledge.
const deepSanitize = (value: unknown): unknown => {
	if (typeof value === 'string') return value.includes('<') ? sanitizeHtml(value) : value;
	if (Array.isArray(value)) return value.map(deepSanitize);
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, sub]) => [key, deepSanitize(sub)]));
	}
	return value;
};

export const sanitizePage = (page: Page): Page => deepSanitize(page) as Page;
