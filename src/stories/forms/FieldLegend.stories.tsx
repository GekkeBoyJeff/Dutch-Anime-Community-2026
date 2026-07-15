import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Checkbox from '@/components/forms/Checkbox';
import FieldLegend from '@/components/forms/FieldLegend';
import FieldSet from '@/components/forms/FieldSet';
import { FieldLegendProps } from '@/lib/content/schema/forms/fieldLegend';

const meta: Meta<typeof FieldLegend> = {
	title: 'Forms/FieldLegend',
	component: FieldLegend,
	parameters: {
		docs: {
			description: {
				component:
					'The accessible name for a FieldSet. variant="legend" is a section-sized title; variant="label" reads like a normal field label — use it for a single grouped control such as a radio/checkbox set.',
			},
		},
		jsonSchema: { schema: FieldLegendProps },
	},
	argTypes: {
		variant: { control: 'inline-radio', options: ['legend', 'label'] },
	},
};

export default meta;

type Story = StoryObj<typeof FieldLegend>;

export const Default: Story = {
	args: { variant: 'legend', children: 'Notifications' },
	render: (args) => (
		<FieldSet>
			<FieldLegend {...args} />
			<Checkbox label="Email me" defaultChecked />
			<Checkbox label="Text me" />
		</FieldSet>
	),
};

export const Label: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'label'
	}
};
