import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Spinner from './Spinner';
import { SpinnerProps } from './Spinner.schema';

const meta: Meta<typeof Spinner> = {
	title: 'Basics/Spinner',
	component: Spinner,
	parameters: {
		docs: { description: { component: 'Inline async indicator (CSS-only). role="status" with an sr-only label; the spin respects prefers-reduced-motion.' } },
		jsonSchema: { schema: SpinnerProps },
	},
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
	args: {
		ariaLabel: 'Loading',
	},
};