import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

// A single social link on a profile. `label` names the network for assistive tech; `icon` is an
// optional glyph (the icon font is a placeholder, so it never required).
export const ProfileSocial = z
	.object({
		label: z.string().min(1).describe('Name of the social network; shown as the link text, or as hidden text for assistive tech when an icon is set'),
		url: z.string().min(1).describe('Destination the social link opens in a new tab'),
		icon: z.string().optional().describe('Icon glyph name rendered in place of the visible label').meta({ editor: 'icon' }),
	})
	.meta({ title: 'ProfileSocial' });
export type ProfileSocial = z.infer<typeof ProfileSocial>;

export const ProfileCardItem = z
	.object({
		id: Id,
		image: z.string().min(1).describe('Portrait image rendered at a 4:5 ratio'),
		name: z.string().min(1).describe('Person\'s name, shown as the card heading and used as the portrait\'s alt text'),
		role: z.string().optional().describe('Person\'s role or title, shown below the name'),
		text: z.string().optional().describe('Short bio text shown below the role'),
		socials: z.array(ProfileSocial).optional().describe('Row of social links rendered at the bottom of the card'),
	})
	.meta({ title: 'ProfileCardItem' });
export type ProfileCardItem = z.infer<typeof ProfileCardItem>;

export const ProfileCardsProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) rendered above the grid'),
		// Grid width; drives the --columns var (responsive cap below).
		columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Number of columns in the profile grid'),
		// A profileCards block with zero people has no reason to exist; require at least one.
		items: z.array(ProfileCardItem).min(1).describe('The people rendered as cards in the grid'),
	})
	.meta({ title: 'ProfileCards' });
export type ProfileCardsProps = z.infer<typeof ProfileCardsProps>;

// Block = props plus the keys Blocks strips before spreading (`type` selects the component, `id`
// becomes the React key).
export const ProfileCardsBlock = ProfileCardsProps.extend({
	type: z.literal('profileCards'),
	id: Id.optional(),
});
export type ProfileCardsBlock = z.infer<typeof ProfileCardsBlock>;
