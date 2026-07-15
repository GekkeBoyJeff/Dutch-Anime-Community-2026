'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, type Ref } from 'react';
import {
	FormProvider,
	useForm,
	type DefaultValues,
	type FieldValues,
	type Path,
	type SubmitErrorHandler,
	type SubmitHandler,
	type UseFormRegisterReturn,
	type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

import { classNames } from '@/lib/classNames';
import type { FormProps as FormSchemaProps } from '@/lib/content/schema/components/form';

/** When validation runs: as the user leaves a field, as they type, or only on submit. */
export type FormValidateOn = 'blur' | 'input' | 'submit';

/** The field() helper's return: the register props (spread onto the control) plus this field's live error state. */
export type FormFieldBinding<Values extends FieldValues> = {
	/** Spread onto the control ({...field('x').props}): name, ref, onChange, onBlur from react-hook-form */
	props: UseFormRegisterReturn<Path<Values>>;
	/** The active validation message for this field, if any */
	error?: string;
	/** Whether the field is currently invalid */
	invalid: boolean;
};

/** The form API handed to a render-prop child, plus our `field()` register-and-error helper. */
export interface FormRenderProps<Values extends FieldValues, Output extends FieldValues = Values>
	extends UseFormReturn<Values, unknown, Output> {
	/** Register a control and read its error in one call: {...field('email').props} on an input, .error/.invalid alongside */
	field: (name: Path<Values>) => FormFieldBinding<Values>;
}

export type FormProps<Input extends FieldValues, Output extends FieldValues> = FormSchemaProps & {
	/** The Zod schema; validates values and infers the form's types (the project's content contract) */
	schema: z.ZodType<Output, Input>;
	/** Initial field values */
	initialValues?: DefaultValues<Input>;
	/** Called with the parsed, valid values on a successful submit */
	onSubmit: SubmitHandler<Output>;
	/** Called with the field errors when submit is blocked by validation */
	onError?: SubmitErrorHandler<Input>;
	/** A render function receiving the form API + field() helper, or static nodes inside the provider */
	children: ReactNode | ((form: FormRenderProps<Input, Output>) => ReactNode);
};

// MODE maps our plain `validateOn` to react-hook-form's mode. 'input' validates on change after the
// first blur (onTouched is friendlier than firing on the very first keystroke); 'blur' and 'submit'
// map directly.
const MODE = {
	blur: 'onBlur',
	input: 'onTouched',
	submit: 'onSubmit',
} as const;

// A low-markup form shell over react-hook-form + Zod. It owns the form state, runs the caller's Zod
// schema through zodResolver (one schema validates AND types the values — the project's Zod-first
// contract) and hands the API to a render-prop child together with a `field()` helper that registers
// a control and surfaces its error in one spread. A 'use client' leaf: a page stays a Server
// Component and renders <Form> as an island.
//
// Server Actions are not yet supported; this shell covers client-validated forms only.
const Form = <Input extends FieldValues, Output extends FieldValues>({
	schema,
	initialValues,
	validateOn = 'submit',
	onSubmit,
	onError,
	resetOnSuccess = false,
	className,
	children,
	ref,
}: FormProps<Input, Output> & { ref?: Ref<HTMLFormElement> }) => {
	const form = useForm<Input, unknown, Output>({
		resolver: zodResolver(schema),
		defaultValues: initialValues,
		mode: MODE[validateOn],
	});

	const field: FormRenderProps<Input, Output>['field'] = (name) => {
		// getFieldState resolves dotted paths (e.g. 'address.city') against RHF's nested error tree —
		// indexing errors[name] directly only works for flat keys, so nested fields always read as valid.
		// Reading form.formState here also subscribes the field to error updates.
		const { error, invalid } = form.getFieldState(name, form.formState);
		const message = error?.message;

		return {
			props: form.register(name),
			// react-hook-form types the message as a union; we only ever set string messages via Zod.
			error: typeof message === 'string' ? message : undefined,
			invalid,
		};
	};

	const handleSubmit = form.handleSubmit(async (values) => {
		await onSubmit(values);

		if (resetOnSuccess) {
			form.reset();
		}
	}, onError);

	return (
		<FormProvider {...form}>
			<form
				ref={ref}
				className={classNames('form', `is-${validateOn}`, className)}
				onSubmit={handleSubmit}
				noValidate
			>
				{typeof children === 'function'
					? children({ ...form, field })
					: children}
			</form>
		</FormProvider>
	);
};

export default Form;
