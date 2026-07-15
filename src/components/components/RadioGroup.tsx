'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { RadioGroupProps as RadioGroupSchemaProps } from '@/lib/content/schema/components/radioGroup';

export interface RadioOption {
	/** Unique value selected when this radio is chosen */
	value: string;
	/** Visible label */
	label?: ReactNode;
	/** Disable just this option */
	disabled?: boolean;
}

// `options` keeps its local shape (ReactNode label) since the schema's RadioOption models label as
// a string for JSON-serializability, but the component also accepts arbitrary nodes.
export type RadioGroupProps = Omit<RadioGroupSchemaProps, 'options'> & {
	/** The options to render */
	options?: RadioOption[];
	/** Fires with the newly selected value */
	onValueChange?: (value: string) => void;
	/** Custom content instead of the `options` prop; takes precedence */
	children?: ReactNode;
};

// A set of radios where exactly one may be selected. Wraps Base UI's RadioGroup + Radio: it carries
// role="radiogroup" with role="radio" items (single-choice radio semantics, unlike Toggle's
// aria-pressed buttons) and arrow-key roving focus. A small client island; the group needs an
// accessible name (aria-label / aria-labelledby) since none is auto-generated.
const RadioGroup = ({
	options = [],
	value,
	defaultValue,
	onValueChange,
	disabled,
	required,
	name,
	className,
	children,
	ref,
	...rest
}: RadioGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	const { haptic } = useHaptics();

	// role="radiogroup" has no auto-generated name; warn in dev when neither an aria-label nor an
	// aria-labelledby is supplied so the group never ships unlabeled.
	if (process.env.NODE_ENV !== 'production' && !rest['aria-label'] && !rest['aria-labelledby']) {
		console.warn('RadioGroup: provide an accessible name via aria-label or aria-labelledby.');
	}

	return (
		<BaseRadioGroup
			ref={ref}
			className={classNames('radio-group', className)}
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
						<label key={option.value} className="option">
							<Radio.Root className="control" value={option.value} disabled={option.disabled}>
								<Radio.Indicator className="indicator" />
							</Radio.Root>
							{option.label && <Content element="span" className="label">{option.label}</Content>}
						</label>
					))}
		</BaseRadioGroup>
	);
};

export default RadioGroup;
