import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FieldLegend from '@/components/forms/FieldLegend';
import FieldSet from '@/components/forms/FieldSet';
import Radio from '@/components/forms/Radio';
import { RadioProps } from '@/lib/content/schema/forms/radio';

const options = [
	{ value: 'standard', label: 'Standard — 3–5 business days' },
	{ value: 'express', label: 'Express — next business day' },
	{ value: 'pickup', label: 'Pick up in store' },
	{ value: 'freight', label: 'Freight (over 30kg)', disabled: true },
];

const meta: Meta<typeof Radio> = {
	title: 'Forms/Radio',
	component: Radio,
	parameters: {
		docs: {
			description: {
				component:
					'A set of mutually-exclusive choices. Wraps Base UI RadioGroup (one tab stop; arrow keys move between choices). Pair it with a FieldLegend variant="label" inside a FieldSet for the group name.',
			},
		},
		jsonSchema: { schema: RadioProps },
	},
	argTypes: {
		horizontal: { control: 'boolean' },
		disabled: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
	args: {
		options,
		name: 'shipping',
		defaultValue: 'standard',
	},
};

export const Horizontal: Story = {
	...Default,
	args: {
		...Default.args,
		horizontal: true
	}
};

export const InsideFieldSet: Story = {
	...Default,
	render: (args) => (
		<FieldSet>
			<FieldLegend variant="label">Shipping method</FieldLegend>
			<Radio {...args} />
		</FieldSet>
	),
};
