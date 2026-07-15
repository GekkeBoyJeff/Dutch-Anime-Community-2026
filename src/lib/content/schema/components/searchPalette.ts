import { z } from 'zod';

// One searchable command. `onSelect` is a callback and stays TS-only on the component.
export const SearchPaletteItem = z
	.object({
		id: z.string().min(1).describe('Stable id, used as the React key and the cmdk value'),
		label: z.string().min(1).describe('The visible label that the fuzzy filter matches against'),
		hint: z.string().optional().describe('A muted line under the label (a path, a description, …)'),
		category: z.string().optional().describe('Group heading this item is filed under; falls back to `fallbackCategory`'),
		icon: z.string().optional().describe('Leading icon glyph name (the icon font is a placeholder, so it is optional)'),
		url: z.string().optional().describe('Internal route to navigate to on select'),
	})
	.meta({ title: 'SearchPaletteItem' });
export type SearchPaletteItem = z.infer<typeof SearchPaletteItem>;

// Props for the SearchPalette component: Cmd/Ctrl+K command palette over cmdk with fuzzy filtering,
// category grouping and full keyboard nav, rendered in the shared overlay.
export const SearchPaletteProps = z
	.object({
		open: z.boolean().optional().describe('Controlled open state. Omit to let the palette manage its own (Cmd/Ctrl+K toggles it)'),
		items: z.array(SearchPaletteItem).describe('The searchable commands, grouped by `category`'),
		categories: z.array(z.string()).optional().describe('Group order; categories not listed here keep their first-seen order after these; defaults to []'),
		fallbackCategory: z.string().optional().describe('Heading for items without a `category`; defaults to \'Other\''),
		placeholder: z.string().optional().describe('Placeholder for the search field; defaults to \'Type a command or search…\''),
		emptyLabel: z.string().optional().describe('Copy shown when nothing matches; defaults to \'No results found.\''),
		selectHint: z.string().optional().describe('Footer hint shown on the inline-end side; defaults to \'to select\''),
		className: z.string().optional().describe('Extra classes on the palette panel'),
	})
	.meta({ title: 'SearchPalette' });
export type SearchPaletteProps = z.infer<typeof SearchPaletteProps>;
