'use client';

import { Input } from '@base-ui/react/input';
import type { ComponentPropsWithoutRef, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { TextInputProps as TextInputSchemaProps } from '@/lib/content/schema/forms/textInput';

type TextInputProps = TextInputSchemaProps & Omit<ComponentPropsWithoutRef<'input'>, 'size' | keyof TextInputSchemaProps>;

// A single-line text control. Wraps Base UI's Input so that, inside a <Field>, it picks up the
// generated id, name, aria-describedby and aria-invalid automatically — no per-field wiring. Used
// standalone it is just a styled <input>. Validity data-attrs flow from the parent Field for styling.
const TextInput = ({
	type = 'text',
	className,
	ref,
	...rest
}: TextInputProps & { ref?: Ref<HTMLInputElement> }) => {
	return <Input ref={ref} type={type} className={classNames('text-input', className)} {...rest} />;
};

export default TextInput;
