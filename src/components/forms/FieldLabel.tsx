'use client';

import { Field } from '@base-ui/react/field';

import { classNames } from '@/lib/shared/classNames';
import type { FieldLabelProps as FieldLabelSchemaProps } from '@/lib/site/content/schema/forms/fieldLabel';

type FieldLabelProps = FieldLabelSchemaProps;

// The field's <label>. Base UI auto-wires htmlFor to the control's generated id, so clicking the
// label focuses the control without you tracking ids by hand.
const FieldLabel = ({
	htmlFor,
	nativeLabel,
	className,
	children,
	ref,
}: FieldLabelProps) => {
	return (
		<Field.Label
			ref={ref}
			htmlFor={htmlFor}
			nativeLabel={nativeLabel}
			className={classNames('field-label', className)}
		>
			{children}
		</Field.Label>
	);
};

export default FieldLabel;
