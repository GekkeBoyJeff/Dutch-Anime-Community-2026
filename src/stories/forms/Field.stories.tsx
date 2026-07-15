import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field';
import FieldGroup from '@/components/forms/FieldGroup';
import TextInput from '@/components/forms/TextInput';
import { FieldProps } from '@/lib/content/schema/forms/field';

const meta: Meta<typeof Field> = {
	title: 'Forms/Field',
	component: Field,
	parameters: {
		docs: {
			description: {
				component:
					'The per-field wrapper. Wraps Base UI Field.Root to own the a11y plumbing — label↔control id wiring, merged aria-describedby (description + error), and aria-invalid — and to broadcast validity as data-attrs for styling. Compose it from Field.Label, a control, Field.Description and Field.Error.',
			},
		},
		jsonSchema: { schema: FieldProps },
	},
	argTypes: {
		orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
		disabled: { control: 'boolean' },
		invalid: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {
	render: (args) => (
		<Field {...args} name="email">
			<Field.Label>Email address</Field.Label>
			<TextInput type="email" placeholder="you@example.com" />
			<Field.Description>We only use this to send your receipt.</Field.Description>
		</Field>
	),
};

export const WithError: Story = {
	args: { invalid: true },
	render: (args) => (
		<Field {...args} name="email">
			<Field.Label>Email address</Field.Label>
			<TextInput type="email" defaultValue="not-an-email" />
			<Field.Error match>Enter a valid email address.</Field.Error>
		</Field>
	),
};

export const Required: Story = {
	render: (args) => (
		<Field {...args} name="name">
			<Field.Label>Full name</Field.Label>
			<TextInput required placeholder="Required" />
			<Field.Error match="valueMissing">Please enter your name.</Field.Error>
		</Field>
	),
};

export const HorizontalOrientation: Story = {
	args: { orientation: 'horizontal' },
	render: (args) => (
		<FieldGroup>
			<Field {...args} name="discord">
				<Field.Label>Discord-naam</Field.Label>
				<TextInput placeholder="amelia#0001" />
				<Field.Description>Optioneel — zo vinden we je terug op de server.</Field.Description>
			</Field>
		</FieldGroup>
	),
};
