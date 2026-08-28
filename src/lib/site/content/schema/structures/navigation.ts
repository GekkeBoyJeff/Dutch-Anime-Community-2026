import type { ReactNode } from 'react';
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

export const MegaMenuLink = z
	.object({
		key: z.string().min(1).describe('Stable key for this link within its group'),
		label: z.string().min(1).describe('The link label'),
		description: z.string().describe('One-line explanation shown under the label in the panel'),
		href: z.string().min(1).describe('The link destination'),
		icon: z.string().min(1).describe('Icon glyph shown in front of the label'),
		activeHrefs: z.array(z.string()).optional().describe('Extra paths that also mark this link active (detail routes that live under another prefix)'),
	})
	.meta({ title: 'MegaMenuLink' });
export type MegaMenuLink = z.infer<typeof MegaMenuLink>;

export const MegaMenuGroup = z
	.object({
		key: z.string().min(1).describe('Stable key; also the value the open panel is tracked by'),
		label: z.string().min(1).describe('The trigger label in the bar'),
		description: z.string().describe('One-line explanation of what the group covers'),
		links: z.array(MegaMenuLink).describe('The links inside the group\'s panel'),
		highlight: z.custom<ReactNode>().optional().describe('Extra node rendered beside the links inside the panel'),
		directHref: z.string().optional().describe('Turns the trigger into a plain link to this path — the group then opens no panel'),
		muted: z.boolean().optional().describe('Dims the trigger for a secondary group; defaults to false'),
		badge: z.number().optional().describe('Count of outstanding items shown on the trigger; hidden when 0'),
		dot: z.boolean().optional().describe('Shows a bare attention dot on the trigger when there is no count; defaults to false'),
	})
	.meta({ title: 'MegaMenuGroup' });
export type MegaMenuGroup = z.infer<typeof MegaMenuGroup>;

export const MegaMenuUser = z
	.object({
		name: z.string().min(1).describe('The signed-in user\'s display name'),
		roleLabel: z.string().optional().describe('The role shown under the name'),
		avatarUrl: z.string().optional().describe('Avatar image source'),
		initials: z.string().optional().describe('Fallback initials when there is no avatar image'),
	})
	.meta({ title: 'MegaMenuUser' });
export type MegaMenuUser = z.infer<typeof MegaMenuUser>;

export const DashboardNavigationProps = NavigationProps.extend({
	home: z
		.object({
			label: z.string().min(1).describe('The label of the dashboard home link'),
			href: z.string().min(1).describe('The dashboard home path; matched exactly for the active state'),
		})
		.optional()
		.describe('The home link that opens the bar, left of the groups'),
	groups: z.array(MegaMenuGroup).optional().describe('The mega-menu groups; passing at least one is what switches the header to the dashboard variant'),
	user: MegaMenuUser.optional().describe('The signed-in user behind the profile menu; omit to hide it'),
	backLink: z
		.object({
			label: z.string().min(1).describe('The label of the link back out of the dashboard'),
			href: z.string().min(1).describe('Where that link goes, usually the public site'),
		})
		.optional()
		.describe('Link out of the dashboard, shown in the profile menu and the mobile overlay'),
	searchSlot: z.custom<ReactNode>().optional().describe('Node rendered in the bar next to the profile menu, for a search trigger'),
	open: z.boolean().optional().describe('Controls the mobile overlay from the outside; omit to let the header own that state'),
	onOpenChange: z.custom<(open: boolean) => void>().optional().describe('Fires with the next open state of the mobile overlay'),
}).meta({ title: 'DashboardNavigation' });
export type DashboardNavigationProps = z.infer<typeof DashboardNavigationProps>;
