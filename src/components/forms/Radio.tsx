'use client';

import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import type { Ref } from 'react';

import Content from '@/components/basics/Content';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { RadioOption as RadioOptionSchema, RadioProps as RadioSchemaProps } from '@/lib/content/schema/forms/radio';

/** One choice in a Radio group. */
export type RadioOption = RadioOptionSchema;

type RadioProps = RadioSchemaProps & {
	/** Fires with the newly selected value (Base UI's two-arg event is re-narrowed for us) */
	onValueChange?: (value: string) => void;
};

// A set of mutually-exclusive choices. Wraps Base UI's RadioGroup (one tab stop; arrow keys move
// between choices) plus a Radio per option, each shipping role="radio" + aria-checked and a hidden
// input for native forms. Pair it with a <FieldLegend variant="label"> inside a <FieldSet> for the
// group's accessible name. Inside a <Field> it inherits the name/invalid state.
const Radio = ({
	options = [],
	onValueChange,
	horizontal = false,
	className,
	ref,
	...rest
}: RadioProps & { ref?: Ref<HTMLDivElement> }) => {
	const { haptic } = useHaptics();

	return (
		<RadioGroup
			ref={ref}
			className={classNames('radio-set', horizontal && 'is-horizontal', className)}
			onValueChange={(next) => {
				haptic();
				onValueChange?.(next as string);
			}}
			{...rest}
		>
			{options.map((option) => (
				<label key={option.value} className="radio-field">
					<BaseRadio.Root value={option.value} disabled={option.disabled} className="radio">
						<BaseRadio.Indicator className="indicator" keepMounted>
							<span className="dot" aria-hidden="true" />
						</BaseRadio.Indicator>
					</BaseRadio.Root>
					<Content element="span" className="label" value={option.label} />
				</label>
			))}
		</RadioGroup>
	);
};

export default Radio;
