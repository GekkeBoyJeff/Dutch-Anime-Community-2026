import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import Button from '@/components/basics/Button';
import Form from '@/components/components/Form';
import Field from '@/components/forms/Field';
import TextInput from '@/components/forms/TextInput';
import { FormProps } from '@/lib/content/schema/components/form';

const meta: Meta<typeof Form> = {
	title: 'Components/Form',
	component: Form,
	parameters: {
		docs: {
			description: {
				component:
					'A low-markup form shell over react-hook-form + Zod. One schema both validates and types the values (the project Zod-first contract). The render-prop child receives the form API plus a field() helper that registers a control and surfaces its error in one spread. A "use client" leaf — a server page renders it as an island. For a Server Action, reuse the same schema on the server and map returned errors back via setError.',
			},
		},
		jsonSchema: { schema: FormProps },
	},
	argTypes: {
		validateOn: { control: 'inline-radio', options: ['blur', 'input', 'submit'] },
	},
};

export default meta;

const signupSchema = z.object({
	name: z.string().min(2, 'Please enter your name.'),
	email: z.string().email('Enter a valid email address.'),
});

type SignupValues = z.infer<typeof signupSchema>;

type Story = StoryObj<typeof Form>;

// onSubmit is passed in so the global actions enhancer (.storybook/preview.tsx) logs the parsed
// values to the Actions panel. Named function to satisfy react/function-component-definition.
const SignupForm = (validateOn: 'blur' | 'input' | 'submit', onSubmit: SubmitHandler<SignupValues>) => {
	return (
		<Form
			schema={signupSchema}
			validateOn={validateOn}
			initialValues={{ name: '', email: '' }}
			onSubmit={onSubmit}
		>
			{({ field }) => {
				const name = field('name');
				const email = field('email');

				return (
					<>
						<Field name="name" invalid={name.invalid}>
							<Field.Label>Name</Field.Label>
							<TextInput {...name.props} />
							{name.error && <Field.Error match>{name.error}</Field.Error>}
						</Field>

						<Field name="email" invalid={email.invalid}>
							<Field.Label>Email</Field.Label>
							<TextInput {...email.props} type="email" />
							{email.error && <Field.Error match>{email.error}</Field.Error>}
						</Field>

						<div className="actions">
							<Button type="submit">Create account</Button>
						</div>
					</>
				);
			}}
		</Form>
	);
}

export const Default: Story = {
	render: (args) => {
		return SignupForm('submit', args.onSubmit);
	},
};

export const ValidateOnBlur: Story = {
	render: (args) => {
		return SignupForm('blur', args.onSubmit);
	},
};

export const ValidateOnInput: Story = {
	render: (args) => {
		return SignupForm('input', args.onSubmit);
	},
};
