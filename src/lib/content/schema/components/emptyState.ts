import { z } from 'zod';

import { Action } from '@/lib/content/schema/primitives';

// Props for the EmptyState component: zero-state with an optional icon/illustration, a title, a
// description and up to two actions. Pairs with FilterBar / SearchPalette / ImageList for
// no-results and fills 404/error presentation.
export const EmptyStateProps = z
	.object({
		title: z.string().min(1).describe('The heading'),
		description: z.string().optional().describe('Supporting line under the heading; may contain HTML'),
		icon: z.string().optional().describe('Optional icon glyph name shown above the title (the icon font is a placeholder)'),
		actions: z.array(Action).optional().describe('One or two calls to action; defaults to []'),
		compact: z.boolean().optional().describe('Tightens the layout for an inline no-results state (the full panel is the default); defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'EmptyState' });
export type EmptyStateProps = z.infer<typeof EmptyStateProps>;
