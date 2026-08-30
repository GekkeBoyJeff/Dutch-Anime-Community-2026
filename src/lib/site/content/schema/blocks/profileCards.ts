import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

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
		image: z
			.string()
			.optional()
			.describe('Portrait image rendered at a 4:5 ratio. Leave empty to show initials instead. Never a URL from the avatars bucket — that leaks a member\'s account id'),
		initials: z.string().max(2).optional().describe('One or two letters for the fallback; leave empty to derive them from the name'),
		name: z.string().min(1).describe('Person\'s name, shown as the card heading and used as the portrait\'s alt text'),
		role: z.string().optional().describe('Person\'s role or title, shown below the name'),
		value: z.string().optional().describe('Short bio text shown below the role'),
		socials: z.array(ProfileSocial).optional().describe('Row of social links rendered at the bottom of the card'),
	})
	.meta({ title: 'ProfileCardItem' });
export type ProfileCardItem = z.infer<typeof ProfileCardItem>;

export const ProfileCardsProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) rendered above the grid'),
		columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Number of columns in the profile grid'),
		items: z.array(ProfileCardItem).describe('The people rendered as cards in the grid'),
		anonymousLabel: z
			.string()
			.optional()
			.describe('Adds one final card standing in for everyone who gave anonymously, e.g. \'Iedereen die anoniem geeft\''),
	})
	// The rule is about what renders, not about what is typed: a block that shows nothing is a heading
	// with a hole under it. An empty `items` is fine as long as the anonymous card fills the grid — that
	// is a supporters page before the first name, which is a complete list, not an empty one.
	.check((ctx) => {
		if (ctx.value.items.length > 0 || ctx.value.anonymousLabel) return;
		ctx.issues.push({
			code: 'custom',
			message: 'A profileCards block renders nothing: add at least one person, or set anonymousLabel',
			input: ctx.value,
			path: ['items'],
		});
	})
	.meta({ title: 'ProfileCards' });
export type ProfileCardsProps = z.infer<typeof ProfileCardsProps>;

export const ProfileCardsBlock = ProfileCardsProps.extend({
	type: z.literal('profileCards'),
	id: Id.optional(),
});
export type ProfileCardsBlock = z.infer<typeof ProfileCardsBlock>;
