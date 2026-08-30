import { z } from 'zod';

import { Action } from '@/lib/site/content/schema/primitives';

export const ActionsProps = z
	.object({
		actions: z.array(Action).describe('The call-to-actions to render as Buttons'),
		defaultVariant: z.enum(['primary', 'secondary', 'ghost']).optional().describe('Variant applied to actions that don\'t set their own; defaults to primary'),
		badge: z.boolean().optional().describe('Give primary-variant actions the circular icon-badge treatment, using the action\'s icon (falls back to arrow-up-right)'),
		className: z.string().optional().describe('Additional classes on the row'),
	})
	.meta({ title: 'Actions' });
export type ActionsProps = z.infer<typeof ActionsProps>;
