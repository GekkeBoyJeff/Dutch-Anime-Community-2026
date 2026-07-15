import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Collapsible from '@/components/basics/Collapsible';
import { CollapsibleProps } from '@/lib/content/schema/basics/collapsible';

const meta: Meta<typeof Collapsible> = {
	title: 'Basics/Collapsible',
	component: Collapsible,
	parameters: {
		docs: {
			description: {
				component:
					'A single open/close region — the disclosure the Accordion is built from. Used directly for "show more", spoiler-hide and single FAQ rows. Wraps Base UI Collapsible for the aria + animatable-height wiring.',
			},
		},
		jsonSchema: { schema: CollapsibleProps },
	},
	argTypes: {
		defaultOpen: { control: 'boolean' },
		disabled: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
	args: {
		title: 'Show synopsis',
		defaultOpen: false,
		children:
			'After a chance encounter, two strangers discover their fates are quietly tangled across a single, unforgettable summer.',
	},
};

export const OpenByDefault: Story = {
	...Default,
	args: {
		...Default.args,
		defaultOpen: true,
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
	},
};

export const Spoiler: Story = {
	...Default,
	args: {
		...Default.args,
		title: 'Spoiler — reveal the ending',
		children: 'The lighthouse was theirs all along.',
	},
};
