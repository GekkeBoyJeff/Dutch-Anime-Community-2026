import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import { ButtonProps } from '@/lib/content/schema/basics/button';

const meta: Meta<typeof Button> = {
	title: 'Basics/Button',
	component: Button,
	parameters: {
		docs: { description: { component: 'The one CTA face of the system: every button and button-styled link renders through here — a content block never hand-rolls `class="button is-…"` markup. Interactive keeps the element honest (no `url` = a real `<button>`, an internal path = next/link, an external URL = a safe `<a>`); Button adds the visual variant and the optional trailing icon, inline (`plain`) or as the circular badge that nudges its glyph on hover (`badge`).' } },
		jsonSchema: { schema: ButtonProps },
	},
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['primary', 'secondary', 'ghost'],
		},
		iconStyle: {
			control: 'inline-radio',
			options: ['plain', 'badge'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
	args: {
		children: 'Word lid',
		variant: 'primary',
	},
};

export const Secondary: Story = {
	...Default,
	args: {
		...Default.args,
		children: 'Bekijk evenementen',
		variant: 'secondary',
	},
};

export const Ghost: Story = {
	...Default,
	args: {
		...Default.args,
		children: 'Lees meer',
		variant: 'ghost',
	},
};

// A link wearing the button's visual: pass a url and Interactive picks the honest element
// (next/link here). This replaces the old hand-rolled `<Interactive className="button is-…">`.
export const AsLink: Story = {
	...Default,
	args: {
		...Default.args,
		url: '/word-lid',
	},
};

export const WithIcon: Story = {
	...Default,
	args: {
		...Default.args,
		children: 'Bekijk agenda',
		icon: 'calendar',
	},
};

// The site's leading CTA: the circular badge chip whose glyph nudges up-right on hover.
// Exactly what the hero renders — hover it to see the motion.
export const WithBadge: Story = {
	...Default,
	args: {
		...Default.args,
		url: '/word-lid',
		icon: 'arrow-up-right',
		iconStyle: 'badge',
	},
};

export const Hover: Story = {
	...WithBadge,
	args: {
		...WithBadge.args,
	},
	parameters: {
		pseudo: { hover: true },
	},
};

export const Focus: Story = {
	...Default,
	args: {
		...Default.args,
	},
	parameters: {
		pseudo: { focusVisible: true },
	},
};

export const Disabled: Story = {
	...Default,
	args: {
		...Default.args,
		disabled: true,
	},
};
