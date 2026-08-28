'use client';

import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';

import Checkbox from '@/components/forms/Checkbox';
import { classNames } from '@/lib/shared/classNames';
import type { CheckboxGroupProps as CheckboxGroupSchemaProps } from '@/lib/site/content/schema/forms/checkboxGroup';

export type CheckboxGroupProps = CheckboxGroupSchemaProps;

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
	ariaLabel,
	className,
	ref,
	...rest
}: CheckboxGroupProps) => {
	if (process.env.NODE_ENV !== 'production' && !ariaLabel && !rest['aria-labelledby']) {
		console.warn('CheckboxGroup: provide an accessible name via ariaLabel or aria-labelledby.');
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
			aria-label={ariaLabel}
		>
			{options.map((option) => (
				<Checkbox key={option.value} name={option.value} value={option.value} disabled={option.disabled} label={option.label} />
			))}
		</BaseCheckboxGroup>
	);
};

export default CheckboxGroup;
