import type { MouseEvent, ReactNode } from 'react';
import { z } from 'zod';

export const MenuProps = z
	.object({
		trigger: z.custom<ReactNode>().describe('The element that opens the menu; rendered as the Base UI trigger'),
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
		openOnHover: z.boolean().optional().describe('Opens the menu on pointer hover instead of on click'),
		delay: z.number().optional().describe('Hover open delay in ms (used with \'openOnHover\')'),
		closeDelay: z.number().optional().describe('Hover close delay in ms (used with \'openOnHover\')'),
		onOpenChange: z.custom<(open: boolean) => void>().optional().describe('Fires on every open/close'),
		ariaLabel: z.string().optional().describe('Accessible name for the popup when no labelled trigger applies'),
		children: z.custom<ReactNode>().optional().describe('The item, group and separator tree inside the popup'),
		className: z.string().optional().describe('Additional classes on the root popup element'),
	})
	.meta({ title: 'Menu' });
export type MenuProps = z.infer<typeof MenuProps>;

export const MenuItemProps = z
	.object({
		icon: z.string().optional().describe('Leading icon glyph name (see the $icons map)'),
		label: z.string().min(1).describe('The item\'s visible text; typeahead matches on it too'),
		url: z.string().optional().describe('Internal route or external URL — renders the item as a link'),
		target: z.string().optional().describe('Link target, e.g. \'_blank\''),
		disabled: z.boolean().optional().describe('Disables the item; stays announced, skipped by roving focus'),
		keepOpen: z.boolean().optional().describe('Keeps the menu open after activation; defaults to false (closes)'),
		danger: z.boolean().optional().describe('Marks the item as destructive; defaults to false'),
		onClick: z.custom<(event: MouseEvent<HTMLElement>) => void>().optional().describe('Fires when the item is activated (not called for link items)'),
		className: z.string().optional().describe('Additional classes on the item'),
	})
	.meta({ title: 'MenuItemProps' });
export type MenuItemProps = z.infer<typeof MenuItemProps>;

export const MenuGroupProps = z
	.object({
		children: z.custom<ReactNode>().optional().describe('The group label and the items it holds'),
		className: z.string().optional().describe('Additional classes on the group'),
	})
	.meta({ title: 'MenuGroupProps' });
export type MenuGroupProps = z.infer<typeof MenuGroupProps>;

export const MenuGroupLabelProps = z
	.object({
		children: z.custom<ReactNode>().optional().describe('The heading text'),
		className: z.string().optional().describe('Additional classes on the group label'),
	})
	.meta({ title: 'MenuGroupLabelProps' });
export type MenuGroupLabelProps = z.infer<typeof MenuGroupLabelProps>;

export const MenuCheckboxItemProps = z
	.object({
		checked: z.boolean().optional().describe('Checked state (controlled); omit for uncontrolled'),
		defaultChecked: z.boolean().optional().describe('Initial checked state when uncontrolled; defaults to false'),
		label: z.string().min(1).describe('The item\'s visible text; typeahead matches on it too'),
		disabled: z.boolean().optional().describe('Disables the item'),
		onCheckedChange: z.custom<(checked: boolean) => void>().optional().describe('Fires with the new checked state'),
		className: z.string().optional().describe('Additional classes on the item'),
	})
	.meta({ title: 'MenuCheckboxItemProps' });
export type MenuCheckboxItemProps = z.infer<typeof MenuCheckboxItemProps>;

export const MenuRadioGroupProps = z
	.object({
		value: z.string().optional().describe('The selected value (controlled)'),
		defaultValue: z.string().optional().describe('The initial selected value when uncontrolled'),
		onValueChange: z.custom<(value: string) => void>().optional().describe('Fires with the newly selected value'),
		children: z.custom<ReactNode>().optional().describe('The MenuRadioItem options in this group'),
		className: z.string().optional().describe('Additional classes on the radio group'),
	})
	.meta({ title: 'MenuRadioGroupProps' });
export type MenuRadioGroupProps = z.infer<typeof MenuRadioGroupProps>;

export const MenuRadioItemProps = z
	.object({
		value: z.string().min(1).describe('The value this item represents in the group'),
		label: z.string().min(1).describe('The item\'s visible text; typeahead matches on it too'),
		disabled: z.boolean().optional().describe('Disables the item'),
		className: z.string().optional().describe('Additional classes on the item'),
	})
	.meta({ title: 'MenuRadioItemProps' });
export type MenuRadioItemProps = z.infer<typeof MenuRadioItemProps>;

export const MenuContextProps = z
	.object({
		trigger: z.custom<ReactNode>().describe('The element that opens the menu on right-click'),
		onOpenChange: z.custom<(open: boolean) => void>().optional().describe('Fires on every open/close'),
		ariaLabel: z.string().optional().describe('Accessible name for the popup'),
		children: z.custom<ReactNode>().optional().describe('The item, group and separator tree inside the popup'),
		className: z.string().optional().describe('Additional classes on the root popup element'),
	})
	.meta({ title: 'MenuContextProps' });
export type MenuContextProps = z.infer<typeof MenuContextProps>;

export const MenuSeparatorProps = z
	.object({
		className: z.string().optional().describe('Additional classes on the separator'),
	})
	.meta({ title: 'MenuSeparatorProps' });
export type MenuSeparatorProps = z.infer<typeof MenuSeparatorProps>;
