import type { ReactNode, Ref } from 'react';
import { z } from 'zod';

export interface FieldErrorValidity {
	isInvalid: boolean;
	validationErrors: string[];
	validationDetails: ValidityState;
}

export const FieldErrorProps = z
	.object({
		match: z
			.union([
				z.boolean(),
				z.enum([
					'badInput',
					'customError',
					'patternMismatch',
					'rangeOverflow',
					'rangeUnderflow',
					'stepMismatch',
					'tooLong',
					'tooShort',
					'typeMismatch',
					'valid',
					'valueMissing',
				]),
			])
			.optional()
			.describe('Show this message only for a specific native failure (e.g. \'valueMissing\'); omit for the active message'),
		className: z.string().optional().describe('Additional classes on the root element'),
		children: z
			.custom<ReactNode | ((validity: FieldErrorValidity) => ReactNode)>()
			.optional()
			.describe('A static message, or a render function receiving the field\'s validity snapshot'),
		ref: z.custom<Ref<HTMLDivElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'FieldError' });
export type FieldErrorProps = z.infer<typeof FieldErrorProps>;
