import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import OpenSurveysWidget from '@/components/dashboard/home/OpenSurveysWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <OpenSurveysWidget session={session} /> : null;
};

const meta: Meta<typeof OpenSurveysWidget> = {
	title: 'Dashboard/Home/OpenSurveysWidget',
	component: OpenSurveysWidget,
	parameters: {
		docs: {
			description: {
				component:
					'Currently-open surveys with their submission counts, for survey managers. “Open” means published, not archived and not past its close date — the same rule SurveysManager applies; counts come from the `survey_response_counts` RPC.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof OpenSurveysWidget>;

export const Default: Story = {};
