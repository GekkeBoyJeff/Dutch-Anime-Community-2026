import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field';
import FieldDescription from '@/components/forms/FieldDescription';
import TextInput from '@/components/forms/TextInput';

const meta: Meta<typeof FieldDescription> = {
	title: 'Forms/FieldDescription',
	component: FieldDescription,
	parameters: {
		docs: {
			description: {
				component:
					'Helper text under a control. Base UI links its id into the control aria-describedby, so screen readers announce it as part of the field.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof FieldDescription>;

export const Default: Story = {
	render: () => (
		<Field name="password">
			<Field.Label>Password</Field.Label>
			<TextInput type="password" />
			<Field.Description>At least 8 characters, with a number and a symbol.</Field.Description>
		</Field>
	),
};
