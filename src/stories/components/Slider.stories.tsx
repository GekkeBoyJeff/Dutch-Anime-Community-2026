import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Slider from '@/components/components/Slider';
import { SliderProps } from '@/lib/content/schema/components/slider';

const meta: Meta<typeof Slider> = {
	title: 'Components/Slider',
	component: Slider,
	parameters: {
		docs: {
			description: {
				component:
					'A draggable slider for picking a number or a min–max range. Wraps Base UI Slider: a real `<input type="range">` per thumb with arrow/Page/Home/End keys. Needs an aria-label.',
			},
		},
		jsonSchema: { schema: SliderProps },
	},
	argTypes: {
		min: { control: 'number' },
		max: { control: 'number' },
		step: { control: 'number' },
		disabled: { control: 'boolean' },
		showValue: { control: 'boolean' },
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
	},
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
	args: {
		'aria-label': 'Volume',
		defaultValue: 40,
		min: 0,
		max: 100,
		step: 1,
	},
};

export const WithValue: Story = {
	...Default,
	args: {
		...Default.args,
		showValue: true
	}
};

export const Stepped: Story = {
	...Default,
	args: {
		...Default.args,
		step: 10,
		defaultValue: 50,
		showValue: true
	}
};

export const SliderSelection: Story = {
	...Default,
	args: { ...Default.args, 'aria-label': 'Price range', defaultValue: [25, 75], showValue: true },
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
		const [value, setValue] = useState<number | number[]>(30);

		return <Slider {...args} value={value} onValueChange={setValue} showValue />;
	},
};
