import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Tabs from '@/components/components/Tabs';
import { TabsProps } from '@/lib/content/schema/components/tabs';

const meta: Meta<typeof Tabs> = {
	title: 'Components/Tabs',
	component: Tabs,
	parameters: {
		docs: {
			description: {
				component:
					'Token-styled wrapper over Base UI Tabs. Index-based items/panels, a sliding underline indicator, and the APG roving-tabindex keyboard pattern out of the box. A small client island.',
			},
		},
		jsonSchema: { schema: TabsProps },
	},
	argTypes: {
		orientation: {
			control: 'inline-radio',
			options: ['horizontal', 'vertical'],
		},
		activateOnFocus: { control: 'boolean' },
		defaultValue: { control: { type: 'number', min: 0 } },
		value: { control: { type: 'number', min: 0 } },
	},
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
	args: {
		label: 'Account sections',
		orientation: 'horizontal',
		activateOnFocus: false,
		items: [
			{ label: 'Overview' },
			{ label: 'Episodes' },
			{ label: 'Reviews' },
		],
		panels: [
			'A quick summary of the series, its studio and its season.',
			'The full episode list with air dates and runtimes.',
			'What the community thought, sorted by most helpful.',
		],
	},
};

export const Vertical: Story = {
	...Default,
	args: {
		...Default.args,
		orientation: 'vertical'
	}
};

export const WithIcons: Story = {
	...Default,
	args: {
		...Default.args,
		items: [
			{ label: 'Overview', icon: 'home' },
			{ label: 'Episodes', icon: 'list' },
			{ label: 'Reviews', icon: 'star' },
		],
	},
};

export const AutomaticActivation: Story = {
	...Default,
	args: {
		...Default.args,
		activateOnFocus: true
	}
};

export const WithDisabledTab: Story = {
	...Default,
	args: {
		...Default.args,
		items: [
			{ label: 'Overview' },
			{ label: 'Episodes' },
			{ label: 'Reviews', disabled: true },
		],
	},
};
