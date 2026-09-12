import type { Ref } from 'react';
import { z } from 'zod';

export const SliderProps = z
	.object({
		value: z.union([z.number(), z.array(z.number())]).optional().describe('Controlled value: a number for a single thumb, a two-number array for a range'),
		defaultValue: z.union([z.number(), z.array(z.number())]).optional().describe('Uncontrolled initial value'),
		onValueChange: z.custom<(value: number | number[]) => void>().optional().describe('Fires while dragging with the new value'),
		onValueCommitted: z.custom<(value: number | number[]) => void>().optional().describe('Fires once the value is committed (drag end / key release)'),
		min: z.number().optional().describe('Smallest allowed value; defaults to 0'),
		max: z.number().optional().describe('Largest allowed value; defaults to 100'),
		step: z.number().optional().describe('Step increment values snap to; defaults to 1'),
		disabled: z.boolean().optional().describe('Disable interaction and dim the control'),
		orientation: z.enum(['horizontal', 'vertical']).optional().describe('Track axis; defaults to horizontal'),
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		ariaLabel: z.string().optional().describe('Accessible name (required — none is auto-generated)'),
		'aria-labelledby': z.string().optional().describe('Id of the element that labels this slider'),
		showValue: z.boolean().optional().describe('Show the formatted current value beside the track; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
		ref: z.custom<Ref<HTMLDivElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'Slider' });
export type SliderProps = z.infer<typeof SliderProps>;
