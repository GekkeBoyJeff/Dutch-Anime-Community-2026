import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Button from '@/components/basics/Button';
import SearchPalette from '@/components/components/SearchPalette';
import type { SearchPaletteItem } from '@/components/components/SearchPalette';
import { SearchPaletteProps } from '@/lib/content/schema/components/searchPalette';

const items: SearchPaletteItem[] = [
	{ id: 'home', label: 'Home', hint: '/', category: 'Pages', icon: 'home', url: '/' },
	{ id: 'events', label: 'Events', hint: '/events', category: 'Pages', icon: 'calendar', url: '/events' },
	{ id: 'about', label: 'About us', hint: '/about', category: 'Pages', icon: 'info', url: '/about' },
	{ id: 'new', label: 'New post', hint: 'Create a draft', category: 'Actions', icon: 'plus', onSelect: () => {} },
	{ id: 'theme', label: 'Toggle theme', category: 'Actions', icon: 'moon', onSelect: () => {} },
	{ id: 'docs', label: 'Documentation', hint: 'External', icon: 'book' },
];

const meta: Meta<typeof SearchPalette> = {
	title: 'Components/SearchPalette',
	component: SearchPalette,
	parameters: {
		// SearchPalette navigates via next/navigation useRouter, so mount Storybook's App Router mock.
		nextjs: { appDirectory: true },
		jsonSchema: { schema: SearchPaletteProps },
		docs: {
			description: {
				component:
					'Cmd/Ctrl+K command palette over cmdk: fuzzy filter, category grouping and full keyboard nav. Rendered in our own overlay so it reuses useOverlay (scroll lock + Escape) and useHotkey. Selecting navigates or runs onSelect, then closes.',
			},
		},
	},
	argTypes: {
		placeholder: { control: 'text' },
		emptyLabel: { control: 'text' },
		fallbackCategory: { control: 'text' },
		selectHint: { control: 'text' },
	},
};

export default meta;

type Story = StoryObj<typeof SearchPalette>;

export const Default: Story = {
	args: {
		items,
		categories: ['Pages', 'Actions'],
		placeholder: 'Type a command or search…',
	},
	render: function Render(args) {
		const [open, setOpen] = useState(true);

		return (
			<>
				<Button onClick={() => setOpen(true)}>Open palette (or press Cmd/Ctrl+K)</Button>
				<SearchPalette {...args} open={open} onClose={() => setOpen(false)} />
			</>
		);
	},
};

export const SelfManaged: Story = {
	...Default,
	args: { ...Default.args },
	render: (args) => <SearchPalette {...args} />,
	parameters: {
		docs: { description: { story: 'No `open` prop: the palette toggles itself on Cmd/Ctrl+K.' } },
	},
};
