'use client';

import { Field as BaseField } from '@base-ui/react/field';
import { use, type ReactNode, type Ref } from 'react';

import FieldDescription from '@/components/forms/FieldDescription';
import FieldError from '@/components/forms/FieldError';
import FieldLabel from '@/components/forms/FieldLabel';
import { FieldSetContext } from '@/components/forms/FieldSet';
import { classNames } from '@/lib/classNames';
import type { FieldProps as FieldSchemaProps } from '@/lib/content/schema/forms/field';

/** When a field runs its validate callback; overrides the parent <Form>. */
export type FieldValidationMode = 'onSubmit' | 'onBlur' | 'onChange';

type FieldProps = FieldSchemaProps & {
	/** Custom (a)sync validator; return message(s) when invalid or null when valid */
	validate?: (value: unknown, formValues: Record<string, unknown>) => string | string[] | null | Promise<string | string[] | null>;
	/** Label + Control + Description + Error */
	children?: ReactNode;
};

// The per-field wrapper that owns the gnarly a11y plumbing: it generates the control id, wires
// label↔control via htmlFor, merges the Description and Error ids into aria-describedby, and sets
// aria-invalid — all delegated to Base UI's Field.Root. It also broadcasts validity as data-attrs
// (data-invalid/-valid/-touched/-dirty/-filled/-focused) for styling. Orientation falls back to the
// enclosing FieldSet when not set on the row. A small client island; the page can stay a Server
// Component and render <Field> as a leaf.
const Field = ({
	name,
	orientation,
	disabled,
	invalid,
	validate,
	validationMode,
	validationDebounceTime,
	className,
	children,
	ref,
}: FieldProps & { ref?: Ref<HTMLDivElement> }) => {
	const inheritedOrientation = use(FieldSetContext);
	const effectiveOrientation = orientation ?? inheritedOrientation ?? 'vertical';

	return (
		<BaseField.Root
			ref={ref}
			className={classNames('field', `is-${effectiveOrientation}`, invalid && 'is-invalid', className)}
			name={name}
			disabled={disabled}
			invalid={invalid}
			validate={validate}
			validationMode={validationMode}
			validationDebounceTime={validationDebounceTime}
		>
			{children}
		</BaseField.Root>
	);
};

// Compose the field row from these parts: <Field.Label>, the control (a TextInput/Select/Checkbox
// or a raw <Field.Control>), <Field.Description> and <Field.Error>.
Field.Label = FieldLabel;
Field.Description = FieldDescription;
Field.Error = FieldError;
Field.Control = BaseField.Control;

export default Field;
