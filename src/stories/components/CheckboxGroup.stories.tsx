import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import CheckboxGroup from '@/components/components/CheckboxGroup';
import { CheckboxGroupProps } from '@/lib/content/schema/components/checkboxGroup';

const meta: Meta<typeof CheckboxGroup> = {
	title: 'Components/CheckboxGroup',
	component: CheckboxGroup,
	parameters: {
		docs: {
			description: {
				component:
					'A set of related checkboxes sharing one ticked-values array. Each box is `role="checkbox"` with a hidden `<input>` for native forms. The group needs an accessible name.',
			},
		},
		jsonSchema: { schema: CheckboxGroupProps },
	},
	argTypes: {
		disabled: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof CheckboxGroup>;

export const Default: Story = {
	args: {
		'aria-label': 'Interests',
		options: [
			{ value: 'anime', label: 'Anime' },
			{ value: 'manga', label: 'Manga' },
			{ value: 'cosplay', label: 'Cosplay' },
		],
		defaultValue: ['anime'],
	},
};

export const WithDisabledOption: Story = {
	...Default,
	args: {
		...Default.args,
		options: [
			{ value: 'anime', label: 'Anime' },
			{ value: 'manga', label: 'Manga' },
			{ value: 'cosplay', label: 'Cosplay (full)', disabled: true },
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
		const [value, setValue] = useState<string[]>(['manga']);

		return <CheckboxGroup {...args} value={value} onValueChange={setValue} />;
	},
};
