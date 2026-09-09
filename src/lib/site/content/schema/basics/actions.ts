import { z } from 'zod';

import { ButtonProps } from '@/lib/site/content/schema/basics/button';

// The content-authoring face of a Button: the subset a page author fills in, so block data can never
// reach for onClick, the aria-* props or className.
export const Action = ButtonProps.pick({ value: true, url: true, variant: true, target: true, icon: true })
	.extend({ value: z.string().min(1).describe('The button or link text') })
	.meta({ title: 'Action' });
export type Action = z.infer<typeof Action>;

export const ActionsProps = z
	.object({
		actions: z.array(Action).describe('The call-to-actions to render as Buttons'),
		defaultVariant: z.enum(['primary', 'secondary', 'ghost']).optional().describe('Variant applied to actions that don\'t set their own; defaults to primary'),
		className: z.string().optional().describe('Additional classes on the row'),
	})
	.meta({ title: 'Actions' });
export type ActionsProps = z.infer<typeof ActionsProps>;
