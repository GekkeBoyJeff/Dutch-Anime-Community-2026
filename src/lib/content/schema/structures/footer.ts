import { z } from 'zod';

import { Action } from '@/lib/content/schema/primitives';

// url is required here (optional on the Action primitive): every footer link renders into <Link>, which needs it.
export const FooterLink = Action.pick({ label: true }).extend({ url: z.string().min(1).describe('The link destination') }).meta({ title: 'FooterLink' });
export type FooterLink = z.infer<typeof FooterLink>;

export const FooterColumn = z
	.object({
		heading: z.string().min(1).describe('The column heading'),
		links: z.array(FooterLink).describe('The links in this column'),
	})
	.meta({ title: 'FooterColumn' });
export type FooterColumn = z.infer<typeof FooterColumn>;

export const FooterSocial = z
	.object({
		label: z.string().min(1).describe('The platform label, used for the accessible name'),
		// Same required-url rule as FooterLink.
		url: z.string().min(1).describe('The profile destination'),
		icon: z.string().optional().describe('Optional icon glyph name (icon font is a placeholder, so this is never required)').meta({ editor: 'icon' }),
	})
	.meta({ title: 'FooterSocial' });
export type FooterSocial = z.infer<typeof FooterSocial>;

export const FooterBrand = z
	.object({
		title: z.string().min(1).describe('The brand title'),
		tagline: z.string().optional().describe('Optional tagline shown below the title'),
	})
	.meta({ title: 'FooterBrand' });
export type FooterBrand = z.infer<typeof FooterBrand>;

export const FooterProps = z
	.object({
		navColumns: z.array(FooterColumn).optional().describe('The link columns; source from site.ts routes; defaults to []'),
		socialLinks: z.array(FooterSocial).optional().describe('Defaults to []'),
		brand: FooterBrand.optional().describe('The brand block shown at the top of the footer'),
		legalLinks: z.array(FooterLink).optional().describe('The fine-print links in the legal bar (privacy, terms, …); defaults to []'),
		credit: z.string().optional().describe('Optional credit line in the legal bar (e.g. \'Built by …\')'),
		decorated: z.boolean().optional().describe('Tilts the footer slightly for a playful \'scrapbook\' look; off by default'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Footer' });
export type FooterProps = z.infer<typeof FooterProps>;
