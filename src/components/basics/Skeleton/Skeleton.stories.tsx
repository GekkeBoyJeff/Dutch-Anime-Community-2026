import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Skeleton from './Skeleton';
import { SkeletonProps } from './Skeleton.schema';

const meta: Meta<typeof Skeleton> = {
	title: 'Basics/Skeleton',
	component: Skeleton,
	parameters: {
		docs: { description: { component: 'Token-driven loading placeholder with a CSS-only shimmer (gated by prefers-reduced-motion). aria-hidden — the loading semantics live on the surrounding region.' } },
		jsonSchema: { schema: SkeletonProps },
	},
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
	args: {
		width: '14rem',
		height: '1rem',
		radius: 'm',
	},
};

export const Circle: Story = {
	args: {
		...Default.args,
		circle: true,
		width: '3rem',
		height: '3rem',
	},
};
