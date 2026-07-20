import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ChatTranscript, { type ChatMessage } from '@/components/dashboard/components/ChatTranscript';

const MESSAGES: ChatMessage[] = [
	{
		id: '1',
		authorName: 'Ticket Tool',
		isBot: true,
		timestamp: '2026-06-12T14:41:58.759Z',
		content: 'Bedankt voor het maken van een ticket, een staff member helpt je zo snel mogelijk.',
		embeds: [{ description: 'Reageer met 🔒 om het ticket te sluiten.', color: '#1ec45c', footer: 'TicketTool.xyz' }],
	},
	{
		id: '2',
		authorName: 'youri._.',
		timestamp: '2026-06-12T14:42:35.206Z',
		content: 'Hey Roy 👋 Wat kunnen we voor je doen?',
	},
	{
		id: '3',
		authorName: 'rooyality',
		timestamp: '2026-06-12T14:43:03.480Z',
		content: 'Ik kom even iets melden. Hierbij een screenshot.',
		attachments: [
			{ name: 'image.png', url: 'https://cdn.discordapp.com/attachments/expired/image.png', size: 14248, isImage: true },
			{ name: 'logboek.txt', url: 'https://cdn.discordapp.com/attachments/expired/logboek.txt', size: 2048 },
		],
	},
	{
		id: '4',
		authorName: 'youri._.',
		timestamp: '2026-06-12T14:44:10.000Z',
		content: 'Duidelijk, ik pak het op.',
		replyToName: 'rooyality',
	},
];

const meta: Meta<typeof ChatTranscript> = {
	title: 'Dashboard/Components/ChatTranscript',
	component: ChatTranscript,
	parameters: {
		docs: {
			description: {
				component:
					'Read-only Discord-style chat viewer for parsed ticket transcripts. Text-only (no HTML injection); avatar and image URLs are external and fall back to initials / a "verlopen" placeholder when the link dies. The sample image URLs here are intentionally dead to show that fallback.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ChatTranscript>;

export const Default: Story = {
	render: () => <ChatTranscript messages={MESSAGES} />,
};

export const Empty: Story = {
	render: () => <ChatTranscript messages={[]} />,
};
