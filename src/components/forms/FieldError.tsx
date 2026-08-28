'use client';

import { Field } from '@base-ui/react/field';

import { classNames } from '@/lib/shared/classNames';
import type { FieldErrorProps as FieldErrorSchemaProps } from '@/lib/site/content/schema/forms/fieldError';

export type { FieldErrorValidity } from '@/lib/site/content/schema/forms/fieldError';

type FieldErrorProps = FieldErrorSchemaProps;

// The field's error message. Base UI shows it only once the field is touched/submitted, links its
// id into the control's aria-describedby, and announces it via role="alert" without stealing focus.
// Pass a function child for react-aria-style messages built from the native ValidityState.
const FieldError = ({
	match,
	className,
	children,
	ref,
}: FieldErrorProps) => {
	// Render-prop form: read the live validity via Base UI's Field.Validity and hand the consumer the
	// react-aria-parity shape (isInvalid / validationErrors / validationDetails).
	if (typeof children === 'function') {
		const render = children;

		return (
			<Field.Validity>
				{(state) => (
					<Field.Error ref={ref} match={match} className={classNames('field-error', className)}>
						{render({
							isInvalid: state.validity.valid === false,
							validationErrors: state.errors,
							validationDetails: state.validity as unknown as ValidityState,
						})}
					</Field.Error>
				)}
			</Field.Validity>
		);
	}

	return (
		<Field.Error ref={ref} match={match} className={classNames('field-error', className)}>
			{children}
		</Field.Error>
	);
};

export default FieldError;
