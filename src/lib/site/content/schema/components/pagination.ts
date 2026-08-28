import type { ReactNode } from 'react';
import { z } from 'zod';

export const PaginationTranslations = z
	.object({
		rootLabel: z.string().optional().describe('The nav landmark label; defaults to \'Pagination\''),
		prevTriggerLabel: z.string().optional().describe('Label for the previous control; defaults to \'Previous page\''),
		nextTriggerLabel: z.string().optional().describe('Label for the next control; defaults to \'Next page\''),
		firstTriggerLabel: z.string().optional().describe('Label for the first-page jump; defaults to \'First page\''),
		lastTriggerLabel: z.string().optional().describe('Label for the last-page jump; defaults to \'Last page\''),
		itemLabel: z.string().optional().describe('Accessible name of each page control. Use {page} and {totalPages}; defaults to \'Go to page {page}\''),
	})
	.meta({ title: 'PaginationTranslations' });
export type PaginationTranslations = z.infer<typeof PaginationTranslations>;

export const PaginationEllipsisProps = z
	.object({
		index: z.number().optional().describe('Position key in the list'),
		label: z.string().optional().describe('Accessible label announced in place of the glyph; defaults to \'More pages\''),
		className: z.string().optional().describe('Additional classes on the list item'),
		children: z.custom<ReactNode>().optional().describe('Replaces the default ellipsis glyph; always aria-hidden with an sr-only label'),
	})
	.meta({ title: 'PaginationEllipsis' });
export type PaginationEllipsisProps = z.infer<typeof PaginationEllipsisProps>;

export const PaginationProps = z
	.object({
		page: z.number().optional().describe('Controlled current page (1-based); pairs with onPageChange'),
		defaultPage: z.number().optional().describe('Uncontrolled initial page; defaults to 1'),
		count: z.number().optional().describe('Total number of DATA ITEMS; combine with pageSize. Provide this OR totalPages'),
		pageSize: z.number().optional().describe('Items per page; totalPages = ceil(count / pageSize); defaults to 10'),
		totalPages: z.number().optional().describe('Pre-computed page count — the escape hatch when you don\'t pass count/pageSize'),
		siblingCount: z.number().optional().describe('Pages shown either side of the active page; defaults to 1'),
		boundaryCount: z.number().optional().describe('Pages pinned at each end; defaults to 1'),
		variant: z.enum(['button', 'link']).optional().describe('Render pages as <button> actions (default) or as links for SEO; defaults to \'button\''),
		onPageChange: z
			.custom<(details: { page: number; pageSize: number }) => void>()
			.optional()
			.describe('Fires on any page change; payload mirrors the Ark data contract'),
		getPageUrl: z
			.custom<(details: { page: number; pageSize: number }) => string>()
			.optional()
			.describe('Href builder, only used when variant=\'link\''),
		withControls: z.boolean().optional().describe('Show the prev/next controls; defaults to true'),
		withEdges: z.boolean().optional().describe('Show the first/last edge jumps; defaults to false'),
		disabled: z.boolean().optional().describe('Disable every control'),
		translations: PaginationTranslations.optional().describe('Localised strings; defaults to English'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Pagination' });
export type PaginationProps = z.infer<typeof PaginationProps>;
