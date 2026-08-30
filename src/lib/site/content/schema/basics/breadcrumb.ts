import { z } from 'zod';

export const Crumb = z
	.object({
		value: z.string().min(1).describe('The crumb\'s visible text'),
		url: z.string().optional().describe('Target URL; the last crumb (and any without a url) renders as plain text'),
	})
	.meta({ title: 'Crumb' });
export type Crumb = z.infer<typeof Crumb>;

export const BreadcrumbProps = z
	.object({
		items: z.array(Crumb).describe('The trail, root first'),
		separator: z.string().optional().describe('Separator between crumbs (text or symbol); defaults to \'/\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Breadcrumb' });
export type BreadcrumbProps = z.infer<typeof BreadcrumbProps>;
