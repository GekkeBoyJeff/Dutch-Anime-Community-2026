import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

export const FaqItem = z
	.object({
		id: Id,
		question: z.string().min(1).describe('Visible question text shown as the accordion item trigger'),
		answer: z.string().min(1).describe('Answer content rendered inside the expanded accordion item').meta({ editor: 'richtext' }),
		category: z.string().optional().describe('Grouping label items are clustered under when `groupByCategory` is on'),
	})
	.meta({ title: 'FaqItem' });
export type FaqItem = z.infer<typeof FaqItem>;

export const FaqAccordionProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark colorset applied to the section background and text'),
		heading: Heading.optional().describe('Heading group (tagline, title, size, intro) shown above the accordion list'),
		description: z.string().optional().describe('Fallback intro text shown under the heading when `heading.intro` is not set').meta({ editor: 'textarea' }),
		// A faqAccordion with no questions has nothing to show; require at least one.
		items: z.array(FaqItem).min(1).describe('Question/answer entries rendered as accordion items'),
		numbered: z.boolean().optional().describe('Prefixes each question with a running number, continuous across category groups'),
		groupByCategory: z.boolean().optional().describe('Renders items grouped under their `category` as sub-headings, with uncategorised items under a fallback heading'),
		// Native single-open: the group's <details> elements share a name attribute.
		singleOpen: z.boolean().optional().describe('Restricts each group\'s accordion so only one answer can be open at a time'),
	})
	.meta({ title: 'FaqAccordion' });
export type FaqAccordionProps = z.infer<typeof FaqAccordionProps>;

// Block adds back the keys Blocks strips before spreading component props (`type` selects the
// component, `id` becomes the React key).
export const FaqAccordionBlock = FaqAccordionProps.extend({
	type: z.literal('faqAccordion'),
	id: Id.optional(),
});
export type FaqAccordionBlock = z.infer<typeof FaqAccordionBlock>;
