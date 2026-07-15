import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import { TextAreaProps } from '@/lib/content/schema/forms/textArea';

const meta: Meta<typeof TextArea> = {
	title: 'Forms/TextArea',
	component: TextArea,
	parameters: {
		docs: {
			description: {
				component:
					'A multi-line text control. Renders Field.Control as a `<textarea>` via its render prop, so it keeps the id/name/aria wiring from the enclosing Field. Resizes vertically only. Always used inside a Field.',
			},
		},
		jsonSchema: { schema: TextAreaProps },
	},
	argTypes: {
		rows: { control: { type: 'range', min: 2, max: 12, step: 1 } },
		disabled: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
	args: {
		placeholder: 'Tell us what you think…',
		rows: 4,
	},
	render: (args) => (
		<Field name="message">
			<Field.Label>Message</Field.Label>
			<TextArea {...args} />
			<Field.Description>A few sentences is plenty.</Field.Description>
		</Field>
	),
};

export const Disabled: Story = {
	...Default,
	render: (args) => (
		<Field name="message" disabled>
			<Field.Label>Message</Field.Label>
			<TextArea {...args} defaultValue="This field is locked." />
		</Field>
	),
};
