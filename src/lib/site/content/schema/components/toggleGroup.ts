import { z } from 'zod';

export const ToggleGroupItem = z
	.object({
		value: z.string().min(1).describe('Unique value emitted when this item is pressed'),
		label: z.string().optional().describe('Visible label (omit for an icon-only item, then set ariaLabel)'),
		icon: z.string().optional().describe('Optional leading Icon glyph name'),
		ariaLabel: z.string().optional().describe('Accessible name, required when the item is icon-only'),
		disabled: z.boolean().optional().describe('Disable just this item'),
	})
	.meta({ title: 'ToggleGroupItem' });
export type ToggleGroupItem = z.infer<typeof ToggleGroupItem>;

export const ToggleGroupProps = z
	.object({
		items: z.array(ToggleGroupItem).optional().describe('The items to render; defaults to []'),
		value: z.array(z.string()).optional().describe('Controlled set of pressed values (always an array, even in single mode)'),
		defaultValue: z.array(z.string()).optional().describe('Uncontrolled initial pressed set'),
		onValueChange: z.custom<(value: string[]) => void>().optional().describe('Fires with the new pressed set'),
		multiple: z.boolean().optional().describe('Allow more than one item pressed at a time (default single-select, segmented-control style)'),
		required: z.boolean().optional().describe('In single mode, keep one item always pressed (clicking the active item won\'t clear it)'),
		loop: z.boolean().optional().describe('Arrow focus wraps from the last item back to the first (default true)'),
		disabled: z.boolean().optional().describe('Disable the whole group'),
		orientation: z.enum(['horizontal', 'vertical']).optional().describe('Arrow-key axis'),
		segmented: z.boolean().optional().describe('Render the items joined as one segmented control rather than separate buttons'),
		ariaLabel: z.string().optional().describe('Accessible name for the group (required — none is auto-generated)'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'ToggleGroup' });
export type ToggleGroupProps = z.infer<typeof ToggleGroupProps>;
