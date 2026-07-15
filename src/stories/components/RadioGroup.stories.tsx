import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import RadioGroup from '@/components/components/RadioGroup';
import { RadioGroupProps } from '@/lib/content/schema/components/radioGroup';

const meta: Meta<typeof RadioGroup> = {
	title: 'Components/RadioGroup',
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
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
	args: {
		'aria-label': 'Plan',
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

export const Controlled: Story = {
	...Default,
	render: function Render(args) {
		const [value, setValue] = useState('pro');

		return <RadioGroup {...args} value={value} onValueChange={setValue} />;
	},
};
