'use client';

import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { CheckboxProps as CheckboxSchemaProps } from '@/lib/content/schema/forms/checkbox';

type CheckboxProps = CheckboxSchemaProps & {
	/** Fires on toggle with the new boolean (Base UI's two-arg event is re-narrowed for us) */
	onCheckedChange?: (checked: boolean) => void;
	/** Inline label content; takes precedence over `label` */
	children?: ReactNode;
};

// A single tick-box. Wraps Base UI's Checkbox, so it carries role="checkbox" + aria-checked
// (including "mixed" for the indeterminate state) and ships a hidden <input> for native forms. When
// a label/children is given it renders a clickable <label> row; otherwise it is just the box (pair
// it with a <Field.Label> or pass aria-label). Inside a <Field> it inherits id/name/invalid state.
const Checkbox = ({
	onCheckedChange,
	label,
	className,
	children,
	ref,
	...rest
}: CheckboxProps & { ref?: Ref<HTMLElement> }) => {
	const { haptic } = useHaptics();
	// `children` (arbitrary nodes) wins over `label` (an HTML string) — Content resolves both, so it
	// parses the HTML label instead of a local html-react-parser call.
	const hasLabel = Boolean(children || label);

	const box = (
		<BaseCheckbox.Root
			ref={ref}
			className={classNames('checkbox', !hasLabel && className)}
			onCheckedChange={(next) => {
				haptic();
				onCheckedChange?.(next);
			}}
			{...rest}
		>
			<BaseCheckbox.Indicator className="indicator" keepMounted>
				<span className="check" aria-hidden="true" />
			</BaseCheckbox.Indicator>
		</BaseCheckbox.Root>
	);

	if (!hasLabel) {
		return box;
	}

	return (
		<label className={classNames('checkbox-field', className)}>
			{box}
			<Content element="span" className="label" value={label}>{children}</Content>
		</label>
	);
};

export default Checkbox;
