import { z } from 'zod';

import { Action } from '@/lib/content/schema/primitives';

// The shared CTA row: renders an array of Actions as Buttons, so every block honors the same
// capabilities (variant, url, target, icon) without re-writing the loop. Row layout (flex, gap)
// deliberately stays with the consuming block's stylesheet — this schema owns only the mapping.
export const ActionsProps = z
	.object({
		actions: z.array(Action).optional().describe('The call-to-actions to render as Buttons'),
		defaultVariant: z.enum(['primary', 'secondary', 'ghost']).optional().describe('Variant applied to actions that don\'t set their own; defaults to primary'),
		badge: z.boolean().optional().describe('Give primary-variant actions the circular icon-badge treatment, using the action\'s icon (falls back to arrow-up-right)'),
		className: z.string().optional().describe('Additional classes on the row'),
	})
	.meta({ title: 'Actions' });
export type ActionsProps = z.infer<typeof ActionsProps>;
