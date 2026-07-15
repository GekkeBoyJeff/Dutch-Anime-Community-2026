'use client';

import { Field } from '@base-ui/react/field';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { FieldLabelProps as FieldLabelSchemaProps } from '@/lib/content/schema/forms/fieldLabel';

type FieldLabelProps = FieldLabelSchemaProps & {
	children?: ReactNode;
};

// The field's <label>. Base UI auto-wires htmlFor to the control's generated id, so clicking the
// label focuses the control without you tracking ids by hand.
const FieldLabel = ({
	htmlFor,
	nativeLabel,
	className,
	children,
	ref,
}: FieldLabelProps & { ref?: Ref<HTMLLabelElement> }) => {
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
