'use client';

import { Select as BaseSelect } from '@base-ui/react/select';
import { useCallback, useState, type ReactNode, type Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { SelectProps as SelectSchemaProps } from '@/lib/content/schema/forms/select';

/** One selectable option. */
export interface SelectOption {
	/** The submitted form value */
	value: string;
	/** Visible label (also used for typeahead) */
	label: string;
	/** Renders the row but blocks selection */
	disabled?: boolean;
}

/** A labelled set of options shown under a heading. */
export interface SelectOptionGroup {
	/** Group heading */
	label: string;
	/** Options under this heading */
	options: SelectOption[];
}

type SelectProps = Omit<SelectSchemaProps, 'options'> & {
	/** Options, flat or grouped */
	options?: (SelectOption | SelectOptionGroup)[];
	/** Fires with the new value */
	onValueChange?: (value: string | string[] | null) => void;
};

// Narrows a flat-or-grouped option list to a flat array of groups for rendering.
const isGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup => {
	return 'options' in item;
};

// A single- or multi-select. Two modes behind one prop:
//   - default: a custom listbox (Base UI Select) — role=listbox/option, typeahead, arrow-key
//     navigation, aria-activedescendant, floating positioning — the a11y-hard parts we must not
//     hand-roll. It is interactive, so this file is a client island.
//   - native: a real <select>, which renders meaningfully without JS and is bulletproof on mobile.
// Inside a <Field> it inherits id/name/aria/invalid wiring; standalone, pass aria-label.
const Select = ({
	options = [],
	native = false,
	placeholder,
	multiple = false,
	side = 'bottom',
	className,
	ref,
	...rest
}: SelectProps & { ref?: Ref<HTMLButtonElement> }) => {
	// The popup is portalled to <body>, escaping the admin theme subtree, so tag it with `.is-admin` when
	// the trigger resolves inside one — that lets the (globally-tokenised) admin skin reach the portal.
	const [adminScoped, setAdminScoped] = useState(false);
	const assignTriggerRef = useCallback(
		(node: HTMLButtonElement | null) => {
			if (typeof ref === 'function') ref(node);
			else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
			if (node) setAdminScoped(node.closest('[data-theme="admin"]') !== null);
		},
		[ref],
	);

	// Native mode: a real <select>. Optgroups for grouped data; the placeholder is a disabled,
	// value-less first option so it shows but cannot be re-chosen.
	if (native) {
		const { value, defaultValue, onValueChange, ...nativeRest } = rest as SelectProps;

		return (
			<select
				ref={ref as unknown as Ref<HTMLSelectElement>}
				className={classNames('select', 'is-native', className)}
				multiple={multiple}
				value={value}
				defaultValue={defaultValue}
				onChange={(event) => {
					if (multiple) {
						onValueChange?.(Array.from(event.target.selectedOptions, (option) => option.value));
					} else {
						onValueChange?.(event.target.value);
					}
				}}
				{...nativeRest}
			>
				{placeholder && !multiple && (
					<option value="" disabled>
						{placeholder}
					</option>
				)}
				{options.map((item) =>
					isGroup(item) ? (
						<optgroup key={item.label} label={item.label}>
							{item.options.map((option) => (
								<option key={option.value} value={option.value} disabled={option.disabled}>
									{option.label}
								</option>
							))}
						</optgroup>
					) : (
						<option key={item.value} value={item.value} disabled={item.disabled}>
							{item.label}
						</option>
					),
				)}
			</select>
		);
	}

	const renderOption = (option: SelectOption): ReactNode => (
		<BaseSelect.Item key={option.value} value={option.value} disabled={option.disabled} className="option">
			<BaseSelect.ItemIndicator className="option-indicator" keepMounted>
				<span className="check" aria-hidden="true" />
			</BaseSelect.ItemIndicator>
			<BaseSelect.ItemText className="option-label">{option.label}</BaseSelect.ItemText>
		</BaseSelect.Item>
	);

	// aria-label belongs on the focusable Trigger <button>, not on Select.Root (a context provider that
	// renders no DOM node) — spreading it on Root drops it, leaving the custom-mode select with no name.
	const { 'aria-label': ariaLabel, ...rootRest } = rest as SelectProps;

	// Without a value→label map Base UI's Select.Value shows the raw value(s) in the trigger; feed it
	// the labels so the selection reads as its name(s), not e.g. a UUID.
	const items = Object.fromEntries(
		options.flatMap((item) => (isGroup(item) ? item.options : [item])).map((option) => [option.value, option.label]),
	);

	return (
		<BaseSelect.Root multiple={multiple} items={items} {...(rootRest as object)}>
			<BaseSelect.Trigger ref={assignTriggerRef} className={classNames('select', className)} aria-label={ariaLabel}>
				<BaseSelect.Value className="value" placeholder={placeholder} />
				<BaseSelect.Icon className="trigger-icon">
					<span className="chevron" aria-hidden="true" />
				</BaseSelect.Icon>
			</BaseSelect.Trigger>

			<BaseSelect.Portal>
				<BaseSelect.Positioner className="select-positioner" side={side} sideOffset={6}>
					<BaseSelect.Popup className={classNames('select-popup', adminScoped && 'is-admin')}>
						{options.map((item) =>
							isGroup(item) ? (
								<BaseSelect.Group key={item.label} className="option-group">
									<BaseSelect.GroupLabel className="option-group-label">{item.label}</BaseSelect.GroupLabel>
									{item.options.map(renderOption)}
								</BaseSelect.Group>
							) : (
								renderOption(item)
							),
						)}
					</BaseSelect.Popup>
				</BaseSelect.Positioner>
			</BaseSelect.Portal>
		</BaseSelect.Root>
	);
};

export default Select;
