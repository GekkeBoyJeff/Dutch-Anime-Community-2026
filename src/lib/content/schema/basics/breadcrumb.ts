import { z } from 'zod';

export const Crumb = z
	.object({
		label: z.string().min(1).describe('Label'),
		url: z.string().optional().describe('Target URL; the last crumb (and any without a url) renders as plain text'),
	})
	.meta({ title: 'Crumb' });
export type Crumb = z.infer<typeof Crumb>;

// Accessible breadcrumb trail: a nav > ol that links every crumb but the last, which is marked
// aria-current="page". Pairs with the JsonLd BreadcrumbList primitive for structured data.
export const BreadcrumbProps = z
	.object({
		items: z.array(Crumb).describe('The trail, root first'),
		separator: z.string().optional().describe('Separator between crumbs (text or symbol); defaults to \'/\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Breadcrumb' });
export type BreadcrumbProps = z.infer<typeof BreadcrumbProps>;
