'use client';

import { Fieldset } from '@base-ui/react/fieldset';

import { classNames } from '@/lib/shared/classNames';
import type { FieldLegendProps as FieldLegendSchemaProps } from '@/lib/site/content/schema/forms/fieldLegend';

type FieldLegendProps = FieldLegendSchemaProps;

// The accessible name for a FieldSet. `variant='legend'` is a section-sized title; `variant='label'`
// reads like a normal field label, which is what you want for a single grouped control such as a
// RadioGroup or a set of checkboxes. The variant only swaps the class — the wiring is identical.
const FieldLegend = ({
	variant = 'legend',
	className,
	children,
	ref,
}: FieldLegendProps) => {
	return (
		<Fieldset.Legend ref={ref} className={classNames('field-legend', `is-${variant}`, className)}>
			{children}
		</Fieldset.Legend>
	);
};

export default FieldLegend;
