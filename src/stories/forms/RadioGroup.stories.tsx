import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import FieldLegend from '@/components/forms/FieldLegend';
import FieldSet from '@/components/forms/FieldSet';
import RadioGroup from '@/components/forms/RadioGroup';
import { RadioGroupProps } from '@/lib/site/content/schema/forms/radioGroup';

const meta: Meta<typeof RadioGroup> = {
	title: 'Forms/RadioGroup',
	component: RadioGroup,
	parameters: {
		jsonSchema: { schema: RadioGroupProps },
		docs: {
			description: {
				component:
					'A set of radios where exactly one may be selected. role="radiogroup" with role="radio" items and arrow-key roving focus (true radio semantics, unlike Toggle). The group needs an accessible name.',
			},
		},
	},
	argTypes: {
		horizontal: { control: 'boolean' },
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
	args: {
		ariaLabel: 'Plan',
		options: [
			{ value: 'free', label: 'Free' },
			{ value: 'pro', label: 'Pro' },
			{ value: 'team', label: 'Team' },
		],
		defaultValue: 'free',
	},
};

export const WithDisabledOption: Story = {
	...Default,
	args: {
		...Default.args,
		options: [
			{ value: 'free', label: 'Free' },
			{ value: 'pro', label: 'Pro' },
			{ value: 'team', label: 'Team (sold out)', disabled: true },
		],
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true
	}
};

export const Horizontal: Story = {
	...Default,
	args: {
		...Default.args,
		horizontal: true,
	},
};

// Inside a FieldSet the legend names the group, so no aria-label is needed.
export const InsideFieldSet: Story = {
	...Default,
	render: (args) => (
		<FieldSet>
			<FieldLegend variant="label">Plan</FieldLegend>
			<RadioGroup {...args} />
		</FieldSet>
	),
};

export const Controlled: Story = {
	...Default,
	render: function Render(args) {
		const [value, setValue] = useState('pro');

		return <RadioGroup {...args} value={value} onValueChange={setValue} />;
	},
};
