import type { ChatMessage } from '@/components/components/ChatTranscript';
import type { ParsedTicket, TicketAttachmentMeta, TicketEmbedMeta } from '@/lib/tickets/types';

// Maps stored/parsed ticket data into the generic ChatTranscript shape. Kept route-local: this is the
// moderation-specific wiring, not something the reusable viewer should know about.

const IMAGE_RE = /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i;

const isImage = (name: string, width?: number | null, height?: number | null): boolean =>
	IMAGE_RE.test(name) || (width != null && height != null);

const toChatAttachment = (a: TicketAttachmentMeta) => ({
	name: a.name,
	url: a.url,
	size: a.size,
	isImage: isImage(a.name, a.width, a.height),
});

const toChatEmbed = (e: TicketEmbedMeta) => ({
	title: e.title,
	description: e.description,
	color: e.color,
	imageUrl: e.imageUrl,
	footer: e.footer,
});

/** Parsed transcript → chat messages (reply target resolved to the referenced author's name). */
export const parsedToChatMessages = (ticket: ParsedTicket): ChatMessage[] => {
	const authorById = new Map(ticket.messages.map((m) => [m.discordId, m.authorName]));
	return ticket.messages.map((m) => ({
		id: m.discordId,
		authorName: m.authorName,
		authorAvatarUrl: m.authorAvatarUrl,
		isBot: m.isBot,
		timestamp: m.sentAt,
		content: m.content,
		replyToName: m.replyToDiscordId ? authorById.get(m.replyToDiscordId) ?? null : null,
		embeds: m.embeds.map(toChatEmbed),
		attachments: m.attachments.map(toChatAttachment),
	}));
};

// A ticket_messages DB row (embeds/attachments arrive as jsonb; typed loosely here on purpose).
export interface TicketMessageRow {
	discord_id: string | null;
	seq: number;
	sent_at: string | null;
	author_discord_id: string;
	author_name: string;
	author_avatar_url: string | null;
	is_bot: boolean;
	content: string;
	reply_to_discord_id: string | null;
	embeds: unknown;
	attachments: unknown;
}

/** Stored ticket_messages rows → chat messages, resolving replies via the stored Discord message id. */
export const rowsToChatMessages = (rows: TicketMessageRow[]): ChatMessage[] => {
	const authorById = new Map(rows.filter((r) => r.discord_id).map((r) => [r.discord_id as string, r.author_name]));
	return rows.map((r) => ({
		id: r.discord_id ?? String(r.seq),
		authorName: r.author_name,
		authorAvatarUrl: r.author_avatar_url,
		isBot: r.is_bot,
		timestamp: r.sent_at,
		content: r.content,
		replyToName: r.reply_to_discord_id ? authorById.get(r.reply_to_discord_id) ?? null : null,
		embeds: (Array.isArray(r.embeds) ? (r.embeds as TicketEmbedMeta[]) : []).map(toChatEmbed),
		attachments: (Array.isArray(r.attachments) ? (r.attachments as TicketAttachmentMeta[]) : []).map(toChatAttachment),
	}));
};
