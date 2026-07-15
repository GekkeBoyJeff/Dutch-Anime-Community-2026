import { z } from 'zod';

// A toggleable consent category shown in the preferences panel (essential cookies are implicit).
export const CookieConsentConsentCategory = z
	.object({
		id: z.string().min(1).describe('Stable key persisted in the consent record'),
		label: z.string().min(1).describe('The label shown in the preferences panel'),
		description: z.string().optional().describe('A short line explaining what this category is used for'),
		defaultOn: z.boolean().optional().describe('On by default (still rejectable) — e.g. analytics you opt people into'),
	})
	.meta({ title: 'ConsentCategory' });
export type CookieConsentConsentCategory = z.infer<typeof CookieConsentConsentCategory>;

// Props for the CookieConsent component: GDPR/EU consent bar with accept all, reject all, or a
// preferences panel to toggle each category, persisted in localStorage.
export const CookieConsentProps = z
	.object({
		title: z.string().optional().describe('Bar heading'),
		description: z.string().optional().describe('The explanatory body shown in the bar'),
		categories: z.array(CookieConsentConsentCategory).optional().describe('Toggleable categories shown in the preferences panel (essential cookies are implicit)'),
		acceptLabel: z.string().optional().describe('Accept-all button label'),
		rejectLabel: z.string().optional().describe('Reject-all button label'),
		preferencesLabel: z.string().optional().describe('Open-preferences button label'),
		saveLabel: z.string().optional().describe('Save-selected-preferences button label'),
		storageKey: z.string().optional().describe('localStorage key the decision is stored under'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'CookieConsent' });
export type CookieConsentProps = z.infer<typeof CookieConsentProps>;
