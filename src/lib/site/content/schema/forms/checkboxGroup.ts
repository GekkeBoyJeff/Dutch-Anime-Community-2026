import type { Ref } from 'react';
import { z } from 'zod';

import { Option } from '@/lib/site/content/schema/primitives';

export const CheckboxOption = Option
	.extend({ value: z.string().min(1).describe('Unique value, added to the ticked array when this box is on') })
	.meta({ title: 'CheckboxOption' });
export type CheckboxOption = z.infer<typeof CheckboxOption>;

export const CheckboxGroupProps = z
	.object({
		options: z.array(CheckboxOption).optional().describe('The options to render; defaults to []'),
		value: z.array(z.string()).optional().describe('Controlled set of ticked values'),
		defaultValue: z.array(z.string()).optional().describe('Uncontrolled initial ticked set'),
		onValueChange: z.custom<(value: string[]) => void>().optional().describe('Fires with the new ticked array'),
		disabled: z.boolean().optional().describe('Disable the whole group'),
		ariaLabel: z.string().optional().describe('Accessible name for the group (associate with a heading via aria-labelledby)'),
		'aria-labelledby': z.string().optional().describe('Id of the element that labels this group'),
		className: z.string().optional().describe('Additional classes on the root element'),
		ref: z.custom<Ref<HTMLDivElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'CheckboxGroup' });
export type CheckboxGroupProps = z.infer<typeof CheckboxGroupProps>;
