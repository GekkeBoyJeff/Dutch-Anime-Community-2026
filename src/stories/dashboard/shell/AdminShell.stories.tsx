import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AdminShell from '@/components/dashboard/shell/AdminShell';

const meta: Meta<typeof AdminShell> = {
	title: 'Dashboard/Shell/AdminShell',
	component: AdminShell,
	parameters: {
		docs: {
			description: {
				component:
					'The frame every management route\'s layout reuses (/dashboard, /upload, …). Around the routed page it mounts, from the outside in: the `.page-frame > .page-frame-scroll` nesting that owns the real scroll container, the toast provider and its outlet, the permission-filtered DashboardChrome, and the TermsGate that holds a signed-in user on the terms card until they accept. `.is-admin` is the scope hook for work mode — denser controls, tighter radii, layered elevation. The Puck /builder deliberately does not use this: a fixed navbar and a clipped frame would break a full-screen editor. The child here is a single paragraph so the frame itself is what you look at.',
			},
		},
	},
	args: {
		children: <p>Hier komt de gerouteerde beheerpagina.</p>,
	},
};

export default meta;

type Story = StoryObj<typeof AdminShell>;

export const Default: Story = {};
