import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { NAV_HIGHLIGHTS } from '@/components/dashboard/shell/NavHighlights';

const meta: Meta = {
	title: 'Dashboard/Shell/NavHighlights',
	parameters: {
		docs: {
			description: {
				component:
					'One live fact per mega-menu group — the next shift, the next convention, the review queue, the newest media, the last audited change — each drawn from a read the home widgets already run, so they cost no new migrations. In the real nav a highlight only mounts when its panel first opens (Base UI keeps inactive content unmounted), which is what keeps the queries lazy; this story mounts all five at once so they can be compared. Errors degrade to the group\'s quiet empty state. This module exports a record of nodes, not a component, hence no props table.',
			},
		},
	},
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))' }}>
			{Object.entries(NAV_HIGHLIGHTS).map(([group, highlight]) => (
				<div key={group}>{highlight}</div>
			))}
		</div>
	),
};
