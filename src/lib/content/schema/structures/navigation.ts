import { z } from 'zod';

export const NavItem = z
	.object({
		label: z.string().min(1).describe('The link label'),
		url: z.string().min(1).describe('The link destination'),
		exact: z.boolean().optional().describe('Match active state on the exact path only (like a home/index link), not nested routes'),
		icon: z.string().optional().describe('Icon glyph shown next to the label in the mobile menu').meta({ editor: 'icon' }),
		target: z
			.literal('_blank')
			.optional()
			.describe('Set to _blank to open the link in a new tab (renders a plain external anchor)'),
	})
	.meta({ title: 'NavItem' });
export type NavItem = z.infer<typeof NavItem>;

export const NavCta = z
	.object({
		label: z.string().min(1).describe('The link label'),
		url: z.string().min(1).describe('The link destination'),
		variant: z.enum(['primary', 'secondary', 'ghost']).optional().describe('Visual variant; defaults to primary'),
		target: z.enum(['_blank', '_self']).optional().describe('Link target; defaults to _blank so the CTA opens in a new tab'),
	})
	.meta({ title: 'NavCta' });
export type NavCta = z.infer<typeof NavCta>;

const NavBrand = z
	.object({
		title: z.string().optional().describe('Wordmark text shown next to (or instead of) an image'),
		src: z.string().optional().describe('Image source').meta({ editor: 'file' }),
		interactive: z.boolean().optional().describe('Of de brand-roundel klikt naar / (default) of puur decoratief is'),
	})
	.meta({ title: 'NavBrand' });

export const NavigationProps = z
	.object({
		items: z.array(NavItem).optional().describe('The primary navigation links; source from site.ts routes'),
		cta: NavCta.optional().describe('The lead call-to-action button on the right'),
		brand: NavBrand.optional().describe('Brand wordmark and/or logo image'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Navigation' });
export type NavigationProps = z.infer<typeof NavigationProps>;
