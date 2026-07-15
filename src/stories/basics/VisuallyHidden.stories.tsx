import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { VisuallyHiddenProps } from '@/lib/content/schema/basics/visuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
	title: 'Basics/VisuallyHidden',
	component: VisuallyHidden,
	parameters: {
		docs: { description: { component: 'Hides content visually while keeping it for screen readers — icon-button labels, skip links, live-region text. Renders the global `.sr-only` utility.' } },
		jsonSchema: { schema: VisuallyHiddenProps },
	},
};

export default meta;

type Story = StoryObj<typeof VisuallyHidden>;

// The text is present in the DOM and the accessibility tree, but not visible — inspect to confirm.
export const Default: Story = {
	args: {
		children: 'Screen-reader only label',
	},
};

// Typical use: an icon-only button whose only label is screen-reader text. The button shows just the
// icon (no default browser chrome); the accessible name comes entirely from the VisuallyHidden label.
export const InsideButton: Story = {
	...Default,
	render: (args) => (
		<button
			type="button"
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				inlineSize: '2.5rem',
				blockSize: '2.5rem',
				border: 'none',
				borderRadius: '0.5rem',
				background: 'transparent',
				cursor: 'pointer',
				fontSize: '1.25rem',
			}}
		>
			<span aria-hidden="true">★</span>
			<VisuallyHidden {...args}>Add to favourites</VisuallyHidden>
		</button>
	),
};
