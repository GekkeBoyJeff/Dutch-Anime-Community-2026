// Normalized Ticket-Tool transcript shapes. The parser turns one untrusted `.html` export into these
// plain, already-validated structures; the UI and the DB inserts both read from here.

export interface TicketAttachmentMeta {
	name: string;
	url: string;
	size: number | null;
	width: number | null;
	height: number | null;
}

export interface TicketEmbedMeta {
	title: string | null;
	description: string | null;
	color: string | null;
	imageUrl: string | null;
	footer: string | null;
}

export interface ParsedMessage {
	discordId: string;
	seq: number;
	sentAt: string | null;
	edited: boolean;
	authorDiscordId: string;
	authorName: string;
	authorNick: string | null;
	authorAvatarUrl: string | null;
	isBot: boolean;
	content: string;
	replyToDiscordId: string | null;
	embeds: TicketEmbedMeta[];
	attachments: TicketAttachmentMeta[];
}

export interface ParsedParticipant {
	discordId: string;
	name: string;
	isBot: boolean;
}

export interface ParsedTicket {
	ticketNumber: string;
	serverId: string | null;
	serverName: string | null;
	channelId: string | null;
	channelName: string | null;
	openedAt: string | null;
	closedAt: string | null;
	messageCount: number;
	participants: ParsedParticipant[];
	messages: ParsedMessage[];
}

// Thrown for any file that is not a readable Ticket-Tool export. The message is user-facing Dutch.
export class TicketParseError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TicketParseError';
	}
}
