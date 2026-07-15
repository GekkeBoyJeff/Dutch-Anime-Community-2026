import { z } from 'zod';

// Props for the Menu root: an action / dropdown / kebab menu wrapping Base UI's Menu. `trigger`
// and `children` are ReactNode (the trigger element and the item/group/separator tree) and
// `onOpenChange` is a callback, so none of the three are part of the serializable contract.
export const MenuProps = z
	.object({
		open: z.boolean().optional().describe('Open state (controlled); omit for uncontrolled'),
		defaultOpen: z.boolean().optional().describe('Initial open state when uncontrolled; defaults to false'),
		modal: z.boolean().optional().describe('Locks page scroll and outside pointer while open; defaults to true'),
		orientation: z.enum(['vertical', 'horizontal']).optional().describe('Roving-focus axis; defaults to \'vertical\''),
		side: z
			.enum(['top', 'bottom', 'left', 'right', 'inline-start', 'inline-end'])
			.optional()
			.describe('Preferred placement relative to the trigger; defaults to \'bottom\''),
		align: z.enum(['start', 'center', 'end']).optional().describe('Cross-axis alignment; defaults to \'start\''),
		sideOffset: z.number().optional().describe('Gap in px between the trigger and the popup; defaults to 6'),
		label: z.string().optional().describe('Accessible name for the popup when no labelled trigger applies'),
		className: z.string().optional().describe('Additional classes on the root popup element'),
	})
	.meta({ title: 'Menu' });
export type MenuProps = z.infer<typeof MenuProps>;

// A single action item. `onClick` is a callback and `children` is the item's ReactNode content, so
// neither is part of the serializable contract.
export const MenuItemProps = z
	.object({
		icon: z.string().optional().describe('Leading icon glyph name (see the $icons map)'),
		label: z.string().optional().describe('Typeahead override when children aren\'t plain text'),
		url: z.string().optional().describe('Internal route or external URL — renders the item as a link'),
		target: z.string().optional().describe('Link target, e.g. \'_blank\''),
		disabled: z.boolean().optional().describe('Disables the item; stays announced, skipped by roving focus'),
		keepOpen: z.boolean().optional().describe('Keeps the menu open after activation; defaults to false (closes)'),
		className: z.string().optional().describe('Additional classes on the item'),
	})
	.meta({ title: 'MenuItemProps' });
export type MenuItemProps = z.infer<typeof MenuItemProps>;

// A labelled cluster of items. `children` (the GroupLabel and items) is ReactNode, so it is not
// part of the serializable contract.
export const MenuGroupProps = z
	.object({
		className: z.string().optional().describe('Additional classes on the group'),
	})
	.meta({ title: 'MenuGroupProps' });
export type MenuGroupProps = z.infer<typeof MenuGroupProps>;

// The non-focusable heading for a Group. `children` is ReactNode, so it is not part of the
// serializable contract.
export const MenuGroupLabelProps = z
	.object({
		className: z.string().optional().describe('Additional classes on the group label'),
	})
	.meta({ title: 'MenuGroupLabelProps' });
export type MenuGroupLabelProps = z.infer<typeof MenuGroupLabelProps>;

// A toggle item that keeps the menu open so several can be flipped in one pass. `onCheckedChange`
// is a callback and `children` is the item's ReactNode content, so neither is part of the
// serializable contract.
export const MenuCheckboxItemProps = z
	.object({
		checked: z.boolean().optional().describe('Checked state (controlled); omit for uncontrolled'),
		defaultChecked: z.boolean().optional().describe('Initial checked state when uncontrolled; defaults to false'),
		label: z.string().optional().describe('Typeahead override when children aren\'t plain text'),
		disabled: z.boolean().optional().describe('Disables the item'),
		className: z.string().optional().describe('Additional classes on the item'),
	})
	.meta({ title: 'MenuCheckboxItemProps' });
export type MenuCheckboxItemProps = z.infer<typeof MenuCheckboxItemProps>;

// The group wrapper for radio items. `onValueChange` is a callback and `children` (the
// MenuRadioItem children) is ReactNode, so neither is part of the serializable contract.
export const MenuRadioGroupProps = z
	.object({
		value: z.string().optional().describe('The selected value (controlled)'),
		defaultValue: z.string().optional().describe('The initial selected value when uncontrolled'),
		className: z.string().optional().describe('Additional classes on the radio group'),
	})
	.meta({ title: 'MenuRadioGroupProps' });
export type MenuRadioGroupProps = z.infer<typeof MenuRadioGroupProps>;

// A single radio option within a MenuRadioGroup. `children` is ReactNode, so it is not part of the
// serializable contract.
export const MenuRadioItemProps = z
	.object({
		value: z.string().min(1).describe('The value this item represents in the group'),
		label: z.string().optional().describe('Typeahead override when children aren\'t plain text'),
		disabled: z.boolean().optional().describe('Disables the item'),
		className: z.string().optional().describe('Additional classes on the item'),
	})
	.meta({ title: 'MenuRadioItemProps' });
export type MenuRadioItemProps = z.infer<typeof MenuRadioItemProps>;

// A visual divider between items or groups.
export const MenuSeparatorProps = z
	.object({
		className: z.string().optional().describe('Additional classes on the separator'),
	})
	.meta({ title: 'MenuSeparatorProps' });
export type MenuSeparatorProps = z.infer<typeof MenuSeparatorProps>;
