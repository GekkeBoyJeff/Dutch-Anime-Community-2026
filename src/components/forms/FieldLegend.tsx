'use client';

import { Fieldset } from '@base-ui/react/fieldset';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { FieldLegendProps } from '@/lib/content/schema/forms/fieldLegend';

type FieldLegendComponentProps = FieldLegendProps & {
	children?: ReactNode;
};

// The accessible name for a FieldSet. `variant='legend'` is a section-sized title; `variant='label'`
// reads like a normal field label, which is what you want for a single grouped control such as a
// RadioGroup or a set of checkboxes. The variant only swaps the class — the wiring is identical.
const FieldLegend = ({
	variant = 'legend',
	className,
	children,
	ref,
}: FieldLegendComponentProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<Fieldset.Legend ref={ref} className={classNames('field-legend', `is-${variant}`, className)}>
			{children}
		</Fieldset.Legend>
	);
};

export default FieldLegend;
