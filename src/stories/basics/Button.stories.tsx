import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import { ButtonProps } from '@/lib/site/content/schema/basics/button';

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
		value: 'Join now',
		variant: 'primary',
	},
};

export const Secondary: Story = {
	args: {
		...Default.args,
		value: 'View events',
		variant: 'secondary',
	},
};

export const Ghost: Story = {
	args: {
		...Default.args,
		value: 'Read more',
		variant: 'ghost',
	},
};

export const AsLink: Story = {
	args: {
		...Default.args,
		url: '/join',
	},
};

export const WithIcon: Story = {
	args: {
		...Default.args,
		value: 'View calendar',
		icon: 'calendar',
	},
};

export const WithBadge: Story = {
	args: {
		...Default.args,
		url: '/join',
		icon: 'arrow-up-right',
		iconStyle: 'badge',
	},
};

export const Hover: Story = {
	...WithBadge,
	parameters: {
		pseudo: { hover: true },
	},
};

export const Focus: Story = {
	...Default,
	parameters: {
		pseudo: { focusVisible: true },
	},
};

export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true,
	},
};
