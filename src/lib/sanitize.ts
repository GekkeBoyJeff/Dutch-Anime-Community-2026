import DOMPurify from 'isomorphic-dompurify';

import type { Page } from '@/lib/content/schema';

// Allowlist tuned to what Puck's richtext field emits: formatting tags only, no scripts, no iframes,
// no event handlers, and no `javascript:` URLs. `isomorphic-dompurify` runs the real DOMPurify in the
// browser and a jsdom-backed one in Node, so the same function guards both the static build (render,
// Content.tsx) and the author publish path (write, PuckEditor). Plain text passes through unchanged.
export const sanitizeHtml = (dirty: string): string =>
	DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS: [
			'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre', 'span',
		],
		ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
		ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
	});

// Defense-in-depth for the publish path: sanitize every HTML string in a page before it is written to
// the DB. Richtext values contain '<'; plain text is unchanged by the allowlist, so sanitizing every
// string that looks like HTML is safe and needs no per-field schema knowledge.
const deepSanitize = (value: unknown): unknown => {
	if (typeof value === 'string') return value.includes('<') ? sanitizeHtml(value) : value;
	if (Array.isArray(value)) return value.map(deepSanitize);
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, sub]) => [key, deepSanitize(sub)]));
	}
	return value;
};

export const sanitizePage = (page: Page): Page => deepSanitize(page) as Page;
