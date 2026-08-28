'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';

import Content from '@/components/basics/Content';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/shared/classNames';
import type { CheckboxProps as CheckboxSchemaProps } from '@/lib/site/content/schema/forms/checkbox';

type CheckboxProps = CheckboxSchemaProps;

// A single tick-box. Wraps Base UI's Checkbox, so it carries role="checkbox" + aria-checked
// (including "mixed" for the indeterminate state) and ships a hidden <input> for native forms. When
// a label is given it renders a clickable <label> row; otherwise it is just the box (pair it with a
// <Field.Label> or pass ariaLabel). Inside a <Field> it inherits id/name/invalid state.
const Checkbox = ({
	onCheckedChange,
	label,
	ariaLabel,
	className,
	ref,
	...rest
}: CheckboxProps) => {
	const { haptic } = useHaptics();
	const hasLabel = Boolean(label);

	const box = (
		<BaseCheckbox.Root
			ref={ref}
			className={classNames('checkbox', !hasLabel && className)}
			onCheckedChange={(next) => {
				haptic();
				onCheckedChange?.(next);
			}}
			{...rest}
			aria-label={ariaLabel}
		>
			<BaseCheckbox.Indicator className="checkbox-indicator" keepMounted>
				<span className="checkbox-check" aria-hidden="true" />
			</BaseCheckbox.Indicator>
		</BaseCheckbox.Root>
	);

	if (!hasLabel) {
		return box;
	}

	return (
		<label className={classNames('checkbox-field', className)}>
			{box}
			<Content element="span" className="checkbox-label" value={label} />
		</label>
	);
};

export default Checkbox;
