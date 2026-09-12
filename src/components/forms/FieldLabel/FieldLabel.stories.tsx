import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field/Field';
import TextInput from '@/components/forms/TextInput/TextInput';

import FieldLabel from './FieldLabel';
import { FieldLabelProps } from './FieldLabel.schema';

const meta: Meta<typeof FieldLabel> = {
	title: 'Forms/FieldLabel',
	component: FieldLabel,
	parameters: {
		docs: {
			description: {
				component:
					'The field `<label>`. Base UI auto-wires its htmlFor to the control id, so clicking the label focuses the control with no manual id tracking.',
			},
		},
		jsonSchema: { schema: FieldLabelProps },
	},
};

export default meta;

type Story = StoryObj<typeof FieldLabel>;

export const Default: Story = {
	render: () => (
		<Field name="username">
			<Field.Label>Username</Field.Label>
			<TextInput placeholder="ada.lovelace" />
		</Field>
	),
};
