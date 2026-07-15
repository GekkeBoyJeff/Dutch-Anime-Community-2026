import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Toggle from '@/components/components/Toggle';
import { ToggleProps } from '@/lib/content/schema/components/toggle';

const meta: Meta<typeof Toggle> = {
	title: 'Components/Toggle',
	component: Toggle,
	parameters: {
		docs: {
			description: {
				component:
					'A single two-state toggle button (e.g. bold on/off). Renders a real `<button>` exposing aria-pressed. For a set of related toggles (segmented control, view switcher) use ToggleGroup.',
			},
		},
		jsonSchema: { schema: ToggleProps },
	},
	argTypes: {
		disabled: { control: 'boolean' },
		defaultPressed: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
	args: {
		children: 'Bold',
		defaultPressed: false,
	},
};

export const Pressed: Story = {
	...Default,
	args: {
		...Default.args,
		defaultPressed: true
	}
};

export const WithIcon: Story = {
	...Default,
	args: { ...Default.args, icon: 'star', children: 'Favourite' },
};

export const IconOnly: Story = {
	...Default,
	args: { ...Default.args, icon: 'star', children: undefined, 'aria-label': 'Favourite' },
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
		defaultPressed: true
	}
};
