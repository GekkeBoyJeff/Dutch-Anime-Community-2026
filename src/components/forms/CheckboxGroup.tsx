'use client';

import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import type { ReactNode, Ref } from 'react';

import Checkbox from '@/components/forms/Checkbox';
import { classNames } from '@/lib/classNames';
import type { CheckboxGroupProps as CheckboxGroupSchemaProps } from '@/lib/content/schema/forms/checkboxGroup';

export interface CheckboxOption {
	/** Unique value, added to the ticked array when this box is on */
	value: string;
	/** Visible label */
	label?: ReactNode;
	/** Disable just this option */
	disabled?: boolean;
}

// `options` keeps its local shape (ReactNode label) since the schema's CheckboxOption models
// label as a string for JSON-serializability, but the component also accepts arbitrary nodes.
export type CheckboxGroupProps = Omit<CheckboxGroupSchemaProps, 'options'> & {
	/** The options to render */
	options?: CheckboxOption[];
	/** Fires with the new ticked array */
	onValueChange?: (value: string[]) => void;
	/** Custom content instead of the `options` prop; takes precedence */
	children?: ReactNode;
};

// A set of related checkboxes sharing one ticked-values array. Wraps Base UI's CheckboxGroup for the
// array state and renders each option as the <Checkbox> primitive, so a box inside a group is the
// same box as a standalone one — same states, same indeterminate and invalid handling, one
// stylesheet. This component only lays the set out. It needs an accessible name (aria-label /
// aria-labelledby) since role="group" generates none.
const CheckboxGroup = ({
	options = [],
	value,
	defaultValue,
	onValueChange,
	disabled,
	className,
	children,
	ref,
	...rest
}: CheckboxGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	if (process.env.NODE_ENV !== 'production' && !rest['aria-label'] && !rest['aria-labelledby']) {
		console.warn('CheckboxGroup: provide an accessible name via aria-label or aria-labelledby.');
	}

	return (
		<BaseCheckboxGroup
			ref={ref}
			className={classNames('checkbox-group', className)}
			value={value}
			defaultValue={defaultValue}
			onValueChange={(next) => onValueChange?.(next)}
			disabled={disabled}
			{...rest}
		>
			{children
				? children
				: options.map((option) => (
						<Checkbox key={option.value} name={option.value} value={option.value} disabled={option.disabled}>
							{option.label}
						</Checkbox>
					))}
		</BaseCheckboxGroup>
	);
};

export default CheckboxGroup;
