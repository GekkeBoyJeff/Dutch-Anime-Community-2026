import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field';
import FieldError from '@/components/forms/FieldError';
import TextInput from '@/components/forms/TextInput';
import { FieldErrorProps } from '@/lib/content/schema/forms/fieldError';

const meta: Meta<typeof FieldError> = {
	title: 'Forms/FieldError',
	component: FieldError,
	parameters: {
		docs: {
			description: {
				component:
					'The field error message. Base UI shows it only once the field is touched/submitted, links its id into the control aria-describedby, and announces it via role="alert". Pass match to scope it to one native failure, or a function child for messages built from the live ValidityState.',
			},
		},
		jsonSchema: { schema: FieldErrorProps },
	},
};

export default meta;

type Story = StoryObj<typeof FieldError>;

export const StaticMessage: Story = {
	render: () => (
		<Field name="email">
			<Field.Label>Email</Field.Label>
			<TextInput type="email" defaultValue="nope" />
			<Field.Error match>Enter a valid email address.</Field.Error>
		</Field>
	),
};

export const MatchedToFailure: Story = {
	render: () => (
		<Field name="name">
			<Field.Label>Name</Field.Label>
			<TextInput required placeholder="Required" />
			<Field.Error match="valueMissing">Your name is required.</Field.Error>
		</Field>
	),
};

export const RenderProp: Story = {
	render: () => (
		<Field name="code">
			<Field.Label>Discount code</Field.Label>
			<TextInput required minLength={4} defaultValue="ab" />
			<Field.Error match>
				{({ validationDetails }) =>
					validationDetails.tooShort ? 'Use at least 4 characters.' : 'This code is required.'
				}
			</Field.Error>
		</Field>
	),
};
