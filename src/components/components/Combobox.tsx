'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { ComboboxProps as ComboboxSchemaProps } from '@/lib/content/schema/components/combobox';

// The schema narrows the generic `Item` to `string` (its shape is caller-defined/unknown, see the
// schema file); `items`/`value`/`defaultValue`/`filteredItems` stay generic here and are omitted
// from the schema intersection so non-string items (see the CustomOptions story) keep type-checking.
export interface ComboboxProps<Item> extends Omit<ComboboxSchemaProps, 'items' | 'value' | 'defaultValue' | 'filteredItems'> {
	/** The items to display and filter */
	items: Item[];
	/** Controlled selection */
	value?: Item | null;
	/** Uncontrolled initial selection */
	defaultValue?: Item | null;
	/** Fires when the selection changes */
	onValueChange?: (value: Item | null) => void;
	/** Display/search string for object items @default String(item) */
	itemToStringLabel?: (item: Item) => string;
	/** String submitted with a native form @default the label */
	itemToStringValue?: (item: Item) => string;
	/** Custom matcher; pass null with `filteredItems` to filter externally */
	filter?: ((item: Item, query: string) => boolean) | null;
	/** Externally-filtered items (used with filter={null}) */
	filteredItems?: Item[];
	/** Message shown when nothing matches the query */
	emptyMessage?: ReactNode;
	/** Renders an option for an item; defaults to the item's label */
	renderItem?: (item: Item) => ReactNode;
}

// A token-styled wrapper over Base UI's Combobox: an editable text input plus a filtered listbox
// popup (role="combobox" + aria-activedescendant), the a11y-hard surface Base UI already solves
// correctly. A small client island — Base UI's parts ship 'use client', so this file does too. Style
// only via the part data-attributes ([data-highlighted], [data-selected], [data-popup-open], …). The
// generic stays open over the item type; pass itemToStringLabel for object items. Re-exports the raw
// parts below for custom composition.
const Combobox = <Item,>({
	items,
	label,
	value,
	defaultValue,
	onValueChange,
	itemToStringLabel,
	itemToStringValue,
	filter,
	filteredItems,
	autoHighlight = false,
	placeholder = 'Search…',
	emptyMessage = 'No results',
	clearLabel = 'Clear',
	disabled,
	readOnly,
	required,
	name,
	renderItem,
	className,
	ref,
}: ComboboxProps<Item> & { ref?: Ref<HTMLInputElement> }) => {
	// One source of truth for an item's visible text: the override, or its own string form.
	const toLabel = itemToStringLabel ?? ((item: Item) => String(item));

	return (
		<BaseCombobox.Root
			items={filteredItems ?? items}
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			itemToStringLabel={itemToStringLabel}
			itemToStringValue={itemToStringValue}
			filter={filter}
			autoHighlight={autoHighlight}
			disabled={disabled}
			readOnly={readOnly}
			required={required}
			name={name}
		>
			<BaseCombobox.InputGroup className={classNames('combobox', className)}>
				<Icon name="search" className="combobox-search" />
				<BaseCombobox.Input ref={ref} className="combobox-input" placeholder={placeholder} aria-label={label} />
				<BaseCombobox.Clear className="combobox-clear" aria-label={clearLabel}>
					<Icon name="close" />
				</BaseCombobox.Clear>
				<BaseCombobox.Trigger className="combobox-trigger" aria-label={label}>
					<BaseCombobox.Icon className="combobox-icon">
						<Icon name="chevron-down" />
					</BaseCombobox.Icon>
				</BaseCombobox.Trigger>
			</BaseCombobox.InputGroup>

			<BaseCombobox.Portal>
				<BaseCombobox.Positioner className="combobox-positioner" sideOffset={6}>
					<BaseCombobox.Popup className="combobox-popup">
						<BaseCombobox.Empty className="combobox-empty">{emptyMessage}</BaseCombobox.Empty>
						<BaseCombobox.List className="combobox-list">
							{(item: Item) => (
								<BaseCombobox.Item key={toLabel(item)} className="combobox-item" value={item}>
									<BaseCombobox.ItemIndicator className="combobox-indicator">
										<Icon name="check" />
									</BaseCombobox.ItemIndicator>
									<Content element="span" className="combobox-item-label">{renderItem ? renderItem(item) : toLabel(item)}</Content>
								</BaseCombobox.Item>
							)}
						</BaseCombobox.List>
					</BaseCombobox.Popup>
				</BaseCombobox.Positioner>
			</BaseCombobox.Portal>
		</BaseCombobox.Root>
	);
};

export default Combobox;

// Re-export the Base UI parts so callers can compose a custom layout (multiple-select chips, groups,
// rows, async status) while reusing the same styled root class.
export const ComboboxRoot = BaseCombobox.Root;
export const ComboboxLabel = BaseCombobox.Label;
export const ComboboxInputGroup = BaseCombobox.InputGroup;
export const ComboboxInput = BaseCombobox.Input;
export const ComboboxTrigger = BaseCombobox.Trigger;
export const ComboboxClear = BaseCombobox.Clear;
export const ComboboxValue = BaseCombobox.Value;
export const ComboboxIcon = BaseCombobox.Icon;
export const ComboboxChips = BaseCombobox.Chips;
export const ComboboxChip = BaseCombobox.Chip;
export const ComboboxChipRemove = BaseCombobox.ChipRemove;
export const ComboboxPortal = BaseCombobox.Portal;
export const ComboboxPositioner = BaseCombobox.Positioner;
export const ComboboxPopup = BaseCombobox.Popup;
export const ComboboxList = BaseCombobox.List;
export const ComboboxItem = BaseCombobox.Item;
export const ComboboxItemIndicator = BaseCombobox.ItemIndicator;
export const ComboboxEmpty = BaseCombobox.Empty;
export const ComboboxStatus = BaseCombobox.Status;
export const ComboboxGroup = BaseCombobox.Group;
export const ComboboxGroupLabel = BaseCombobox.GroupLabel;
export const ComboboxRow = BaseCombobox.Row;
