import type { ReactNode } from 'react';
import { z } from 'zod';

export const PanelProps = z
	.object({
		title: z.string().describe('Card heading'),
		href: z.string().optional().describe('Deep link into the owning section, rendered as a trailing arrow in the header'),
		linkLabel: z.string().optional().describe('Accessible label for the deep link; defaults to `title`'),
		action: z.custom<ReactNode>().optional().describe('Extra header slot before the deep link (a filter, a menu)'),
		error: z.string().nullable().optional().describe('Set when the query failed; the message itself is not shown, only `errorLabel` is'),
		isEmpty: z.boolean().optional().describe('The query resolved with nothing actionable'),
		emptyLabel: z.string().optional().describe('Shown in the body when the query resolved empty; defaults to \'Niets te tonen\''),
		errorLabel: z.string().optional().describe('Shown in the body when `error` is set; defaults to \'Kon niet laden.\''),
		hideWhenEmpty: z.boolean().optional().describe('Drop the whole card when it resolves empty, instead of showing `emptyLabel`'),
		children: z.custom<ReactNode>().optional().describe('The card body'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Panel' });
export type PanelProps = z.infer<typeof PanelProps>;
