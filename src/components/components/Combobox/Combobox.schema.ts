import { z } from 'zod';

export const ComboboxProps = z
	.object({
		items: z.array(z.string()).describe('The items to display and filter'),
		ariaLabel: z.string().min(1).describe('Accessible label for the input (required — none is auto-generated)'),
		value: z.string().nullable().optional().describe('Controlled selection'),
		defaultValue: z.string().nullable().optional().describe('Uncontrolled initial selection'),
		onValueChange: z.custom<(value: string | null) => void>().optional().describe('Fires with the new selection, or null when it is cleared'),
		filter: z
			.custom<((item: string, query: string) => boolean) | null>()
			.optional()
			.describe('Match predicate replacing the built-in filtering; pass null to disable filtering entirely and supply \'filteredItems\' instead'),
		filteredItems: z.array(z.string()).optional().describe('Externally-filtered items (used with filter={null})'),
		autoHighlight: z.boolean().optional().describe('Highlight the first match automatically; defaults to false'),
		placeholder: z.string().optional().describe('Placeholder shown in the empty input; defaults to \'Search…\''),
		emptyMessage: z.string().optional().describe('Shown when nothing matches the query; defaults to \'No results\''),
		clearLabel: z.string().optional().describe('Accessible label for the clear button; defaults to \'Clear\''),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		readOnly: z.boolean().optional().describe('Visible but not editable'),
		required: z.boolean().optional().describe('Marks the field required for native form submission'),
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		className: z.string().optional().describe('Additional classes on the root input group'),
	})
	.meta({ title: 'Combobox' });
export type ComboboxProps = z.infer<typeof ComboboxProps>;
