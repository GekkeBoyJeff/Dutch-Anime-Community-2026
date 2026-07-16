import DOMPurify from 'isomorphic-dompurify';

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
