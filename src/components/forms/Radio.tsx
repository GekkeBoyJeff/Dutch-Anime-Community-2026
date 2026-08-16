'use client';

import { Radio as BaseRadio } from '@base-ui/react/radio';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import { classNames } from '@/lib/classNames';
import type { RadioProps as RadioSchemaProps } from '@/lib/content/schema/forms/radio';

type RadioProps = RadioSchemaProps & {
	/** Inline label content; takes precedence over `label` */
	children?: ReactNode;
};

// A single choice. Wraps Base UI's Radio, so it carries role="radio" + aria-checked and a hidden
// input for native forms. When a label/children is given it renders a clickable <label> row;
// otherwise it is just the dot (pair it with a <Field.Label> or pass aria-label). Always rendered
// inside a <RadioGroup> — that is where the selected value and the arrow-key navigation live.
const Radio = ({ label, className, children, ref, ...rest }: RadioProps & { ref?: Ref<HTMLElement> }) => {
	// `children` (arbitrary nodes) wins over `label` (an HTML string) — Content resolves both, so it
	// parses the HTML label instead of a local html-react-parser call.
	const hasLabel = Boolean(children || label);

	const dot = (
		<BaseRadio.Root ref={ref} className={classNames('radio', !hasLabel && className)} {...rest}>
			<BaseRadio.Indicator className="radio-indicator" keepMounted>
				<span className="radio-dot" aria-hidden="true" />
			</BaseRadio.Indicator>
		</BaseRadio.Root>
	);

	if (!hasLabel) {
		return dot;
	}

	return (
		<label className={classNames('radio-field', className)}>
			{dot}
			<Content element="span" className="radio-label" value={label}>
				{children}
			</Content>
		</label>
	);
};

export default Radio;
