'use client';

import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
import { useId, type Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { NumberFieldProps as NumberFieldSchemaProps } from '@/lib/content/schema/components/numberField';

export interface NumberFieldTranslations {
	/** Label for the decrement button @default 'Decrease' */
	decrementLabel?: string;
	/** Label for the increment button @default 'Increase' */
	incrementLabel?: string;
}

const DEFAULT_TRANSLATIONS: Required<NumberFieldTranslations> = {
	decrementLabel: 'Decrease',
	incrementLabel: 'Increase',
};

export type NumberFieldProps = NumberFieldSchemaProps & {
	/** Fires on every change with the new value (null when cleared) */
	onValueChange?: (value: number | null) => void;
	/** Fires once the value settles (blur after typing, pointer release) */
	onValueCommitted?: (value: number | null) => void;
};

// A locale-aware stepper input for quantities, bookings and donations. Wraps Base UI's NumberField,
// which puts role="spinbutton" + aria-value*/aria-valuetext on the inner <input>, parses and formats
// via Intl, handles Arrow/Page/Home/End (with Alt → smallStep, Shift → largeStep), press-and-hold
// auto-repeat, optional wheel/drag scrubbing and clamping. A small client island (Base UI's parts
// ship 'use client'); a server page can still drop it in as a leaf. The label, description and error
// are wired to the input by id so screen readers announce the formatted value and any message.
const NumberField = ({
	label,
	description,
	error,
	value,
	defaultValue,
	onValueChange,
	onValueCommitted,
	min,
	max,
	step = 1,
	smallStep,
	largeStep,
	snapOnStep,
	allowWheelScrub,
	format,
	locale,
	scrub = false,
	disabled,
	readOnly,
	required,
	name,
	id,
	translations,
	className,
	ref,
}: NumberFieldProps & { ref?: Ref<HTMLInputElement> }) => {
	const t = { ...DEFAULT_TRANSLATIONS, ...translations };
	const { haptic } = useHaptics();
	const generatedId = useId();
	const inputId = id ?? generatedId;
	const descriptionId = `${inputId}-description`;
	const errorId = `${inputId}-error`;
	const invalid = Boolean(error);

	const describedBy =
		[description && descriptionId, error && errorId].filter(Boolean).join(' ') || undefined;

	return (
		<BaseNumberField.Root
			className={classNames('number-field', invalid && 'is-invalid', className)}
			id={inputId}
			inputRef={ref}
			value={value}
			defaultValue={defaultValue}
			onValueChange={(next) => {
				haptic();
				onValueChange?.(next);
			}}
			onValueCommitted={onValueCommitted}
			min={min}
			max={max}
			step={step}
			smallStep={smallStep}
			largeStep={largeStep}
			snapOnStep={snapOnStep}
			allowWheelScrub={allowWheelScrub}
			format={format}
			locale={locale}
			disabled={disabled}
			readOnly={readOnly}
			required={required}
			name={name}
		>
			{label && (
				<label className="label" htmlFor={inputId}>
					{scrub ? (
						<BaseNumberField.ScrubArea className="scrub-area">
							{label}
							<BaseNumberField.ScrubAreaCursor className="scrub-cursor" />
						</BaseNumberField.ScrubArea>
					) : (
						label
					)}
				</label>
			)}

			<BaseNumberField.Group className="group">
				<BaseNumberField.Decrement className="step is-decrement" aria-label={t.decrementLabel}>
					<Icon name="minus" className='number-field-step-icon' />
				</BaseNumberField.Decrement>
				<BaseNumberField.Input
					className="input"
					aria-describedby={describedBy}
					aria-invalid={invalid || undefined}
				/>
				<BaseNumberField.Increment className="step is-increment" aria-label={t.incrementLabel}>
					<Icon name="plus" className='number-field-step-icon' />
				</BaseNumberField.Increment>
			</BaseNumberField.Group>

			{description && (
				<Content element="p" className="description" id={descriptionId} value={description} />
			)}
			{error && (
				<Content element="p" className="error" id={errorId} role="alert" value={error} />
			)}
		</BaseNumberField.Root>
	);
};

export default NumberField;
