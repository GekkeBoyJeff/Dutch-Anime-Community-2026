'use client';

import { Fieldset } from '@base-ui/react/fieldset';
import { createContext } from 'react';

import { classNames } from '@/lib/shared/classNames';
import type { FieldSetProps as FieldSetSchemaProps } from '@/lib/site/content/schema/forms/fieldSet';

/** How a FieldSet stacks its child Fields; child Fields inherit this unless they set their own. */
export type FieldOrientation = 'vertical' | 'horizontal';

// Base UI does not cascade orientation from the fieldset down to each Field, so we add this tiny
// context: FieldSet publishes its orientation and a Field with no explicit `orientation` reads it.
// This is the one piece of new logic in the forms layer.
export const FieldSetContext = createContext<FieldOrientation | undefined>(undefined);

type FieldSetProps = FieldSetSchemaProps;

// Semantic grouping for a set of related fields. Renders a real <fieldset> (via Base UI) so
// assistive tech reads the FieldLegend as the group's accessible name, and a disabled set removes
// every descendant control from the tab order natively. Forwards its orientation through context.
const FieldSet = ({
	orientation = 'vertical',
	disabled,
	className,
	children,
	ref,
}: FieldSetProps) => {
	return (
		<FieldSetContext value={orientation}>
			<Fieldset.Root
				ref={ref}
				className={classNames('field-set', `is-${orientation}`, className)}
				disabled={disabled}
			>
				{children}
			</Fieldset.Root>
		</FieldSetContext>
	);
};

export default FieldSet;
