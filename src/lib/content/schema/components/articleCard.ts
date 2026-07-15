import { z } from 'zod';

import { Media } from '@/lib/content/schema/primitives';

// The byline author shown on an article card.
export const ArticleCardAuthor = z
	.object({
		name: z.string().min(1).describe('The author\'s display name'),
		role: z.string().optional().describe('The author\'s role or title'),
		avatar: z.string().optional().describe('Avatar image URL'),
	})
	.meta({ title: 'ArticleCardAuthor' });
export type ArticleCardAuthor = z.infer<typeof ArticleCardAuthor>;

// Props for the ArticleCard component: editorial card for blog/news with lead media, a topic tag,
// headline, excerpt and a byline with avatar, date and read time.
export const ArticleCardProps = z
	.object({
		title: z.string().min(1).describe('The headline'),
		excerpt: z.string().optional().describe('A short standfirst / excerpt'),
		media: Media.optional().describe('Lead media (image/video/embed)'),
		tag: z.string().optional().describe('A single category/topic tag, shown as a Badge'),
		author: ArticleCardAuthor.optional().describe('The byline author'),
		readTime: z.number().optional().describe('Estimated read time in minutes'),
		publishedAt: z.string().optional().describe('ISO date string, validated and formatted SSR-safe'),
		href: z.string().optional().describe('Whole-card link to the article'),
		layout: z.enum(['vertical', 'horizontal', 'feature']).optional().describe('Layout: vertical stack, horizontal split, or a larger feature'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'ArticleCard' });
export type ArticleCardProps = z.infer<typeof ArticleCardProps>;
