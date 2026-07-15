'use client';

import { Checkbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { CheckboxGroupProps as CheckboxGroupSchemaProps } from '@/lib/content/schema/components/checkboxGroup';

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

// A set of related checkboxes sharing one ticked-values array. Wraps Base UI's CheckboxGroup +
// Checkbox: each box is role="checkbox" with a hidden <input> for native forms, and the group
// keeps the controlled/uncontrolled array in sync. A small client island; the group needs an
// accessible name (aria-label / aria-labelledby) since no label is auto-generated.
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
	const { haptic } = useHaptics();

	// The group carries role="group" but has no auto-generated name; warn in dev when neither an
	// aria-label nor an aria-labelledby is supplied so the cluster never ships unlabeled.
	if (process.env.NODE_ENV !== 'production' && !rest['aria-label'] && !rest['aria-labelledby']) {
		console.warn('CheckboxGroup: provide an accessible name via aria-label or aria-labelledby.');
	}

	return (
		<BaseCheckboxGroup
			ref={ref}
			className={classNames('checkbox-group', className)}
			value={value}
			defaultValue={defaultValue}
			onValueChange={(next) => {
				haptic();
				onValueChange?.(next);
			}}
			disabled={disabled}
			{...rest}
		>
			{children
				? children
				: options.map((option) => (
						<label key={option.value} className="option">
							<Checkbox.Root className="control" name={option.value} value={option.value} disabled={option.disabled}>
								<Checkbox.Indicator className="indicator">
									<Icon name="check" />
								</Checkbox.Indicator>
							</Checkbox.Root>
							{option.label && <Content element="span" className="label">{option.label}</Content>}
						</label>
					))}
		</BaseCheckboxGroup>
	);
};

export default CheckboxGroup;
