import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import Link from '@/components/basics/Link';
import CustomCursor from '@/components/components/CustomCursor';
import { CustomCursorProps } from '@/lib/content/schema/components/customCursor';

const meta: Meta<typeof CustomCursor> = {
	title: 'Components/CustomCursor',
	component: CustomCursor,
	parameters: {
		docs: {
			description: {
				component:
					'A decorative dot plus a lerp-trailing circle that follows the pointer, writing position straight to refs in a requestAnimationFrame loop (no re-renders). It disables itself on coarse pointers and under prefers-reduced-motion, and grows over a/button/.hover-target/[data-cursor] elements. Move the pointer over the buttons below to see the hover state.',
			},
		},
		jsonSchema: { schema: CustomCursorProps },
	},
	argTypes: {
		lerp: {
			control: { type: 'range', min: 0.05, max: 0.5, step: 0.01 },
		},
	},
	decorators: [
		(Story) => {
			return (
				<div style={{ minBlockSize: '60vh', display: 'grid', placeItems: 'center', gap: '1rem' }}>
					<p>Move your pointer around. Hover the controls to grow the ring.</p>
					<div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
						<Button variant="secondary">A button</Button>
						<Link url="#">A link</Link>
						<span className="hover-target" style={{ padding: '0.5rem 1rem', border: '1px solid' }}>
							A marked target
						</span>
					</div>
					<Story />
				</div>
			);
		},
	],
};

export default meta;

type Story = StoryObj<typeof CustomCursor>;

export const Default: Story = {
	args: {
		lerp: 0.15
	}
};

export const LongTrail: Story = {
	...Default,
	args: {
		...Default.args,
		lerp: 0.08
	}
};

export const Snappy: Story = {
	...Default,
	args: {
		...Default.args,
		lerp: 0.35
	}
};
