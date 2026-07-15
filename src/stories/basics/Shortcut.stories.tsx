import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Shortcut from '@/components/basics/Shortcut';
import { ShortcutProps } from '@/lib/content/schema/basics/shortcut';

const meta: Meta<typeof Shortcut> = {
	title: 'Basics/Shortcut',
	component: Shortcut,
	parameters: {
		docs: { description: { component: 'A keyboard shortcut hint — one or more `<kbd>` keys joined by a separator (nested `<kbd>` is the HTML markup for a key combination). Pairs with SearchPalette / useHotkey hints.' } },
		jsonSchema: { schema: ShortcutProps },
	},
	argTypes: {
		keys: { control: 'object', description: 'Array of key labels, e.g. ["⌘","K"]' },
		separator: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof Shortcut>;

// A combo — edit the `keys` control to add/remove keys live.
export const Default: Story = {
	args: {
		keys: ['⌘', 'K'],
		separator: '+',
	},
};

export const SingleKey: Story = {
	...Default,
	args: {
		...Default.args,
		keys: ['Esc'],
	},
};

export const ThreeKeys: Story = {
	...Default,
	args: {
		...Default.args,
		keys: ['Ctrl', 'Shift', 'P'],
	},
};

// A single key passed as children instead of the `keys` array (how SearchPalette uses it).
export const ViaChildren: Story = {
	...Default,
	args: {
		...Default.args,
		keys: undefined,
		children: '↵',
	},
};
