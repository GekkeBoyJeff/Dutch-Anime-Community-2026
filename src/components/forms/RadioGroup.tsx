'use client';

import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import type { CSSProperties } from 'react';

import Icon from '@/components/basics/Icon';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import Radio from '@/components/forms/Radio';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/shared/classNames';
import type { RadioGroupProps as RadioGroupSchemaProps } from '@/lib/site/content/schema/forms/radioGroup';

export type { RadioGroupOption as RadioOption } from '@/lib/site/content/schema/forms/radioGroup';

export type RadioGroupProps = RadioGroupSchemaProps;

// A set of choices where exactly one may be selected. Wraps Base UI's RadioGroup — one tab stop,
// arrow keys move between choices — and renders each option as the <Radio> primitive, so a choice
// inside a group is the same dot as anywhere else: one stylesheet, one set of states. An option
// carrying a `share` or `picked` becomes a result row: a fill bar, the percentage and a check, laid
// out as bare elements the consumer styles. It needs an accessible name (aria-label /
// aria-labelledby) since role="radiogroup" generates none.
const RadioGroup = ({
	options = [],
	value,
	defaultValue,
	onValueChange,
	horizontal = false,
	disabled,
	required,
	name,
	pickedLabel,
	ariaLabel,
	className,
	ref,
	...rest
}: RadioGroupProps) => {
	const { haptic } = useHaptics();

	if (process.env.NODE_ENV !== 'production' && !ariaLabel && !rest['aria-labelledby']) {
		console.warn('RadioGroup: provide an accessible name via ariaLabel or aria-labelledby.');
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
			aria-label={ariaLabel}
		>
			{options.map((option) => {
				if (option.share === undefined && !option.picked) {
					return <Radio key={option.value} value={option.value} disabled={option.disabled} label={option.label} />;
				}

				return (
					<Radio key={option.value} value={option.value} disabled={option.disabled}>
						<span className="radio-group-option">
							{option.share !== undefined && (
								<span
									className="radio-group-option-bar"
									style={{ '--share': `${option.share}%` } as CSSProperties}
									aria-hidden="true"
								/>
							)}
							<span className="radio-group-option-label">{option.label}</span>
							{option.share !== undefined && <span className="radio-group-option-share">{option.share}%</span>}
							{option.picked && (
								<>
									<Icon name="check" className="radio-group-option-check" />
									{pickedLabel && <VisuallyHidden value={pickedLabel} />}
								</>
							)}
						</span>
					</Radio>
				);
			})}
		</BaseRadioGroup>
	);
};

export default RadioGroup;
