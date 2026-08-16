'use client';

import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import type { ReactNode, Ref } from 'react';

import Radio from '@/components/forms/Radio';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { RadioGroupProps as RadioGroupSchemaProps } from '@/lib/content/schema/forms/radioGroup';

export interface RadioOption {
	/** Unique value selected when this radio is chosen */
	value: string;
	/** Visible label */
	label?: ReactNode;
	/** Disable just this option */
	disabled?: boolean;
}

// `options` keeps its local shape (ReactNode label) since the schema's RadioGroupOption models
// label as a string for JSON-serializability, but the component also accepts arbitrary nodes.
export type RadioGroupProps = Omit<RadioGroupSchemaProps, 'options'> & {
	/** The options to render */
	options?: RadioOption[];
	/** Fires with the newly selected value */
	onValueChange?: (value: string) => void;
	/** Lay the choices out in a row instead of a column */
	horizontal?: boolean;
	/** Custom content instead of the `options` prop; takes precedence */
	children?: ReactNode;
};

// A set of choices where exactly one may be selected. Wraps Base UI's RadioGroup — one tab stop,
// arrow keys move between choices — and renders each option as the <Radio> primitive, so a choice
// inside a group is the same dot as anywhere else: one stylesheet, one set of states. It needs an
// accessible name (aria-label / aria-labelledby) since role="radiogroup" generates none.
const RadioGroup = ({
	options = [],
	value,
	defaultValue,
	onValueChange,
	horizontal = false,
	disabled,
	required,
	name,
	className,
	children,
	ref,
	...rest
}: RadioGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	const { haptic } = useHaptics();

	if (process.env.NODE_ENV !== 'production' && !rest['aria-label'] && !rest['aria-labelledby']) {
		console.warn('RadioGroup: provide an accessible name via aria-label or aria-labelledby.');
	}

	return (
		<BaseRadioGroup
			ref={ref}
			className={classNames('radio-group', horizontal && 'is-horizontal', className)}
			value={value}
			defaultValue={defaultValue}
			onValueChange={(next) => {
				haptic();
				onValueChange?.(next as string);
			}}
			disabled={disabled}
			required={required}
			name={name}
			{...rest}
		>
			{children
				? children
				: options.map((option) => (
						<Radio key={option.value} value={option.value} disabled={option.disabled}>
							{option.label}
						</Radio>
					))}
		</BaseRadioGroup>
	);
};

export default RadioGroup;
