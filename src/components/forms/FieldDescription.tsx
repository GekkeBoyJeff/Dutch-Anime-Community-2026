'use client';

import { Field } from '@base-ui/react/field';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';

type FieldDescriptionProps = {
	className?: string;
	/** Helper text; its id is auto-merged into the control's aria-describedby */
	children?: ReactNode;
};

// Helper text under a control. Base UI links its id into the control's aria-describedby, so screen
// readers announce it as part of the field — no manual aria wiring.
const FieldDescription = ({
	className,
	children,
	ref,
}: FieldDescriptionProps & { ref?: Ref<HTMLParagraphElement> }) => {
	return (
		<Field.Description ref={ref} className={classNames('field-description', className)}>
			{children}
		</Field.Description>
	);
};

export default FieldDescription;
