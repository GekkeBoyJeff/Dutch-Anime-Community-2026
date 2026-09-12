import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Shortcut from './Shortcut';
import { ShortcutProps } from './Shortcut.schema';

const meta: Meta<typeof Shortcut> = {
	title: 'Basics/Shortcut',
	component: Shortcut,
	parameters: {
		docs: { description: { component: 'A keyboard shortcut hint — one or more `<kbd>` keys joined by a separator (nested `<kbd>` is the HTML markup for a key combination). Pairs with SearchPalette / useHotkey hints.' } },
		jsonSchema: { schema: ShortcutProps },
	},
};

export default meta;

type Story = StoryObj<typeof Shortcut>;

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
