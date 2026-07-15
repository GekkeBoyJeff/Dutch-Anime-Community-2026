import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Checkbox from '@/components/forms/Checkbox';
import FieldLegend from '@/components/forms/FieldLegend';
import FieldSet from '@/components/forms/FieldSet';
import { FieldSetProps } from '@/lib/content/schema/forms/fieldSet';

const meta: Meta<typeof FieldSet> = {
	title: 'Forms/FieldSet',
	component: FieldSet,
	parameters: {
		docs: {
			description: {
				component:
					'Semantic grouping for related fields. Renders a real `<fieldset>` + `<legend>`, so assistive tech reads the FieldLegend as the group name and a disabled set removes every descendant control from the tab order. Forwards its orientation to child Fields via context.',
			},
		},
		jsonSchema: { schema: FieldSetProps },
	},
	argTypes: {
		orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
		disabled: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof FieldSet>;

export const Default: Story = {
	render: (args) => (
		<FieldSet {...args}>
			<FieldLegend variant="label">Email preferences</FieldLegend>
			<Checkbox label="Product updates" defaultChecked />
			<Checkbox label="Weekly digest" />
			<Checkbox label="Partner offers" />
		</FieldSet>
	),
};

export const Disabled: Story = {
	...Default,
	args: { ...Default.args, disabled: true },
	render: (args) => (
		<FieldSet {...args}>
			<FieldLegend variant="label">Email preferences</FieldLegend>
			<Checkbox label="Product updates" defaultChecked />
			<Checkbox label="Weekly digest" />
		</FieldSet>
	),
};
