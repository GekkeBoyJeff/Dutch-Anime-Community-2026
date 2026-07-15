import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field';
import TextInput from '@/components/forms/TextInput';
import { TextInputProps } from '@/lib/content/schema/forms/textInput';

const meta: Meta<typeof TextInput> = {
	title: 'Forms/TextInput',
	component: TextInput,
	parameters: {
		docs: {
			description: {
				component:
					'A single-line text control. Wraps Base UI Input so that, inside a Field, it picks up the generated id, name, aria-describedby and aria-invalid automatically.',
			},
		},
		jsonSchema: { schema: TextInputProps },
	},
	argTypes: {
		type: { control: 'inline-radio', options: ['text', 'email', 'password', 'tel', 'url', 'search'] },
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
	args: {
		placeholder: 'you@example.com',
		type: 'email',
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
		defaultValue: 'locked@example.com'
	}
};

export const InsideField: Story = {
	...Default,
	render: (args) => (
		<Field name="email">
			<Field.Label>E-mailadres</Field.Label>
			<TextInput {...args} />
			<Field.Description>We delen je e-mailadres nooit met anderen.</Field.Description>
		</Field>
	),
};
