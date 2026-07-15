import { z } from 'zod';

import { FilterOption } from '@/lib/content/schema/primitives';

export const FilterBarProps = z
	.object({
		filters: z.array(FilterOption).describe('The filter chips; one chip per option, rendered as a group of toggle buttons'),
		value: z.string().optional().describe('The selected filter value (controlled — there is no internal state)'),
		sortOptions: z.array(FilterOption).optional().describe('Sort options; omit to hide the sort control'),
		sortValue: z.string().optional().describe('The selected sort value'),
		searchable: z.boolean().optional().describe('Shows a search input; defaults to false'),
		searchValue: z.string().optional().describe('The search query value'),
		resettable: z.boolean().optional().describe('Shows a reset button; defaults to false'),
		searchPlaceholder: z.string().optional().describe('Placeholder for the search input; defaults to \'Search…\''),
		searchLabel: z.string().optional().describe('Accessible name for the search field; defaults to \'Search\''),
		sortLabel: z.string().optional().describe('Accessible label for the sort control; defaults to \'Sort\''),
		resetLabel: z.string().optional().describe('Label for the reset button; defaults to \'Reset\''),
		label: z.string().optional().describe('Accessible name for the chip group; defaults to \'Filters\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'FilterBar' });
export type FilterBarProps = z.infer<typeof FilterBarProps>;
