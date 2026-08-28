'use client';

import { Field } from '@base-ui/react/field';

import { classNames } from '@/lib/shared/classNames';
import type { FieldDescriptionProps as FieldDescriptionSchemaProps } from '@/lib/site/content/schema/forms/fieldDescription';

type FieldDescriptionProps = FieldDescriptionSchemaProps;

// Helper text under a control. Base UI links its id into the control's aria-describedby, so screen
// readers announce it as part of the field — no manual aria wiring.
const FieldDescription = ({
	className,
	children,
	ref,
}: FieldDescriptionProps) => {
	return (
		<Field.Description ref={ref} className={classNames('field-description', className)}>
			{children}
		</Field.Description>
	);
};

export default FieldDescription;
