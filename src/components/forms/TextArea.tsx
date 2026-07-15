'use client';

import { Field } from '@base-ui/react/field';
import type { ComponentPropsWithoutRef, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { TextAreaProps as TextAreaSchemaProps } from '@/lib/content/schema/forms/textArea';

type TextAreaProps = TextAreaSchemaProps & Omit<ComponentPropsWithoutRef<'textarea'>, keyof TextAreaSchemaProps>;

// A multi-line text control. There is no Base UI Textarea primitive, so we render Field.Control as
// a <textarea> via its `render` prop: that keeps the id/name/aria-describedby/aria-invalid wiring
// from the enclosing Field while emitting a real <textarea>. Vertical resize only, to protect layout.
const TextArea = ({
	rows = 4,
	className,
	ref,
	...rest
}: TextAreaProps & { ref?: Ref<HTMLTextAreaElement> }) => {
	// The textarea-specific attributes ride on the rendered <textarea>, not on Field.Control (whose
	// own props are typed for an <input>). Field.Control still merges in the id/name/aria wiring.
	return (
		<Field.Control
			className={classNames('text-area', className)}
			render={<textarea ref={ref} rows={rows} {...rest} />}
		/>
	);
};

export default TextArea;
