import { z } from 'zod';

import { Colorset, Id } from '@/lib/site/content/schema/primitives';

export const ReviewItem = z
	.object({
		id: Id,
		author: z.string().min(1).describe('Name of the reviewer, shown below the review text'),
		rating: z.number().int().min(1).max(5).describe('Star rating given by the reviewer, rendered as filled stars out of 5'),
		value: z.string().min(1).describe('Review text/testimonial content'),
	})
	.meta({ title: 'ReviewItem' });
export type ReviewItem = z.infer<typeof ReviewItem>;

export const ReviewsProps = z
	.object({
		colorset: Colorset.optional(),
		title: z.string().optional().describe('Main heading of the reviews section'),
		intro: z.string().optional().describe('Supporting introductory text rendered below the title'),
		subject: z.string().optional().describe('Name of the reviewed entity for the JSON-LD rich snippet; defaults to the site name when omitted'),
		items: z.array(ReviewItem).min(1).describe('List of reviews rendered as cards in the grid'),
	})
	.meta({ title: 'Reviews' });
export type ReviewsProps = z.infer<typeof ReviewsProps>;

export const ReviewsBlock = ReviewsProps.extend({ type: z.literal('reviews'), id: Id.optional() });
export type ReviewsBlock = z.infer<typeof ReviewsBlock>;
