import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TicketUpload from '@/components/dashboard/moderation/TicketUpload';

import { USER_ID } from '../../../../.storybook/mocks/fixtures';

const meta: Meta<typeof TicketUpload> = {
	title: 'Dashboard/Moderation/TicketUpload',
	component: TicketUpload,
	parameters: {
		docs: {
			description: {
				component:
					'Import one Ticket Tool `.html` transcript. The file is parsed in the browser — no raw HTML and no images are ever stored — after which the participants are matched to existing mod subjects by Discord id and the uploader confirms or creates a shadow profile per unmatched person. Drop a transcript on the story to see the preview step: ticket header, the participant rows, the first six messages through `ChatTranscript`, and an optional note.',
			},
		},
	},
	args: { open: true, sessionUserId: USER_ID },
};

export default meta;

type Story = StoryObj<typeof TicketUpload>;

export const Default: Story = {};
