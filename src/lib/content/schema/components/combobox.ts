import { z } from 'zod';

// Props for the Combobox component: a token-styled wrapper over Base UI's Combobox — an editable
// text input plus a filtered listbox popup. The component is generic over an `Item` type; for the
// content contract, items are narrowed to plain strings since the actual item shape is
// caller-defined/unknown (see inventory notes) and only string items are JSON-expressible.
export const ComboboxProps = z
	.object({
		items: z.array(z.string()).describe('The items to display and filter'),
		label: z.string().min(1).describe('Accessible label for the input (required — none is auto-generated)'),
		value: z.string().nullable().optional().describe('Controlled selection'),
		defaultValue: z.string().nullable().optional().describe('Uncontrolled initial selection'),
		filteredItems: z.array(z.string()).optional().describe('Externally-filtered items (used with filter={null})'),
		autoHighlight: z.boolean().optional().describe('Highlight the first match automatically; defaults to false'),
		placeholder: z.string().optional().describe('Placeholder shown in the empty input; defaults to \'Search…\''),
		clearLabel: z.string().optional().describe('Accessible label for the clear button; defaults to \'Clear\''),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		readOnly: z.boolean().optional().describe('Visible but not editable'),
		required: z.boolean().optional().describe('Marks the field required for native form submission'),
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		className: z.string().optional().describe('Additional classes on the root input group'),
	})
	.meta({ title: 'Combobox' });
export type ComboboxProps = z.infer<typeof ComboboxProps>;
