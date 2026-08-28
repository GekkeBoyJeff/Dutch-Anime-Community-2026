'use client';

import { Input } from '@base-ui/react/input';

import { classNames } from '@/lib/shared/classNames';
import type { TextInputProps as TextInputSchemaProps } from '@/lib/site/content/schema/forms/textInput';

type TextInputProps = TextInputSchemaProps;

// A single-line text control. Wraps Base UI's Input so that, inside a <Field>, it picks up the
// generated id, name, aria-describedby and aria-invalid automatically — no per-field wiring. Used
// standalone it is just a styled <input>. Validity data-attrs flow from the parent Field for styling.
const TextInput = ({
	type = 'text',
	className,
	ref,
	...rest
}: TextInputProps) => {
	return <Input ref={ref} type={type} className={classNames('text-input', className)} {...rest} />;
};

export default TextInput;
