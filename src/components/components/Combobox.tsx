'use client';

import { Combobox as BaseCombobox } from '@base-ui/react/combobox';

import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/shared/classNames';
import type { ComboboxProps as ComboboxSchemaProps } from '@/lib/site/content/schema/components/combobox';

type ComboboxProps = ComboboxSchemaProps;

const Combobox = ({
	items,
	ariaLabel,
	value,
	defaultValue,
	onValueChange,
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
	className,
}: ComboboxProps) => (
	<BaseCombobox.Root
		items={filteredItems ?? items}
		value={value}
		defaultValue={defaultValue}
		onValueChange={onValueChange}
		filter={filter}
		autoHighlight={autoHighlight}
		disabled={disabled}
		readOnly={readOnly}
		required={required}
		name={name}
	>
		<BaseCombobox.InputGroup className={classNames('combobox', className)}>
			<Icon name="search" className="combobox-search" />
			<BaseCombobox.Input className="combobox-input" placeholder={placeholder} aria-label={ariaLabel} />
			<BaseCombobox.Clear className="combobox-clear" aria-label={clearLabel}>
				<Icon name="close" />
			</BaseCombobox.Clear>
			<BaseCombobox.Trigger className="combobox-trigger" aria-label={ariaLabel}>
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
						{(item: string) => (
							<BaseCombobox.Item key={item} className="combobox-item" value={item}>
								<BaseCombobox.ItemIndicator className="combobox-indicator">
									<Icon name="check" />
								</BaseCombobox.ItemIndicator>
								<span className="content combobox-item-label">{item}</span>
							</BaseCombobox.Item>
						)}
					</BaseCombobox.List>
				</BaseCombobox.Popup>
			</BaseCombobox.Positioner>
		</BaseCombobox.Portal>
	</BaseCombobox.Root>
);

export default Combobox;
