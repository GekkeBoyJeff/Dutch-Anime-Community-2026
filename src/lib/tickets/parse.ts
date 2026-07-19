import { z } from 'zod';

import {
	type ParsedMessage,
	type ParsedParticipant,
	type ParsedTicket,
	TicketParseError,
	type TicketAttachmentMeta,
	type TicketEmbedMeta,
} from '@/lib/tickets/types';

// A Ticket-Tool `.html` export embeds three base64 JS vars: `channel`, `server`, `messages`. This
// parser is pure (string in, object out) and treats every field as untrusted — it validates the
// decoded JSON with Zod and never trusts structure. Nothing here renders HTML.

// Proportionate bounds for an untrusted, manually-uploaded transcript (staff-gated, one file). The
// caps keep a hostile file from exhausting the uploader's browser or the message insert.
const MAX_HTML_CHARS = 5_000_000; // ~5 MB source before base64 decode
const MAX_MESSAGES = 2_000;
const MAX_CONTENT_CHARS = 8_000; // per free-text field; longer values are truncated, not rejected

// Keep only http(s) URLs; anything else (javascript:, data:, …) → null. Defense-in-depth alongside
// React's own URL sanitizer for the `<a href>` / `<img src>` render path.
const safeHttpUrl = (url: string | null | undefined): string | null =>
	url && /^https?:\/\//i.test(url) ? url : null;

// Cap a free-text field at MAX_CONTENT_CHARS, appending an ellipsis when truncated.
const truncate = (text: string): string =>
	text.length > MAX_CONTENT_CHARS ? `${text.slice(0, MAX_CONTENT_CHARS)}…` : text;

const rawAttachment = z
	.object({
		url: z.string(),
		name: z.string().optional(),
		size: z.number().optional(),
		width: z.number().nullable().optional(),
		height: z.number().nullable().optional(),
	})
	.passthrough();

const rawEmbed = z
	.object({
		title: z.string().optional(),
		description: z.string().optional(),
		color: z.string().optional(),
		image: z.object({ url: z.string() }).partial().optional(),
		footer: z.object({ text: z.string().optional() }).partial().optional(),
	})
	.passthrough();

const rawMessage = z
	.object({
		id: z.string(),
		user_id: z.string(),
		username: z.string().optional(),
		nick: z.string().nullable().optional(),
		avatar: z.string().nullable().optional(),
		bot: z.boolean().optional(),
		content: z.string().optional(),
		created: z.number().nullable().optional(),
		edited: z.number().nullable().optional(),
		reference: z.object({ message: z.string() }).partial().optional(),
		embeds: z.array(rawEmbed).optional(),
		attachments: z.array(rawAttachment).optional(),
	})
	.passthrough();

const rawMeta = z.object({ name: z.string().optional(), id: z.string().optional() }).partial();

// Base64 → UTF-8 (the transcript carries Dutch text and emoji, so a naive atob loses bytes).
const decodeBase64Utf8 = (b64: string): string => {
	const binary = atob(b64);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
};

const readVar = (html: string, name: string): string | null => {
	const match = html.match(new RegExp(`let ${name} = "([^"]*)"`));
	return match?.[1] ?? null;
};

const decodeJsonVar = <T>(html: string, name: string, schema: z.ZodType<T>): T => {
	const raw = readVar(html, name);
	if (raw === null) {
		throw new TicketParseError('Dit lijkt geen Ticket Tool-transcript te zijn (verwachte gegevens ontbreken).');
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(decodeBase64Utf8(raw));
	} catch {
		throw new TicketParseError('Het transcript kon niet gelezen worden — het bestand is beschadigd of niet van Ticket Tool.');
	}
	const result = schema.safeParse(parsed);
	if (!result.success) {
		throw new TicketParseError('Het transcript heeft een onverwachte structuur en kon niet verwerkt worden.');
	}
	return result.data;
};

// Discord CDN avatar URL from the user id + hash; animated hashes (a_…) are gifs. No hash → null so
// the viewer falls back to initials.
const avatarUrl = (userId: string, hash: string | null | undefined): string | null => {
	if (!hash) return null;
	const ext = hash.startsWith('a_') ? 'gif' : 'png';
	return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=64`;
};

const toIso = (ms: number | null | undefined): string | null => {
	if (typeof ms !== 'number' || !Number.isFinite(ms)) return null;
	const date = new Date(ms);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normalizeEmbed = (e: z.infer<typeof rawEmbed>): TicketEmbedMeta => ({
	title: e.title ?? null,
	description: e.description != null ? truncate(e.description) : null,
	color: e.color ?? null,
	imageUrl: safeHttpUrl(e.image?.url),
	footer: e.footer?.text ?? null,
});

// Returns null for an attachment whose URL fails the http(s) allowlist — the render is nothing but a
// link/image to that URL, so an attachment without a safe one is dropped.
const normalizeAttachment = (a: z.infer<typeof rawAttachment>): TicketAttachmentMeta | null => {
	const url = safeHttpUrl(a.url);
	if (url === null) return null;
	return { name: a.name ?? 'bijlage', url, size: a.size ?? null, width: a.width ?? null, height: a.height ?? null };
};

/** Parse one Ticket-Tool `.html` export string into a normalized, validated ticket. */
export const parseTranscript = (html: string): ParsedTicket => {
	if (html.length > MAX_HTML_CHARS) {
		throw new TicketParseError('Het bestand is te groot om te verwerken (max 5 MB).');
	}
	const channel = decodeJsonVar(html, 'channel', rawMeta);
	const server = decodeJsonVar(html, 'server', rawMeta);
	const rawMessages = decodeJsonVar(html, 'messages', z.array(rawMessage));
	if (rawMessages.length > MAX_MESSAGES) {
		throw new TicketParseError('Het transcript bevat te veel berichten om te verwerken (max 2000).');
	}

	const messages: ParsedMessage[] = rawMessages.map((m, i) => ({
		discordId: m.id,
		seq: i,
		sentAt: toIso(m.created),
		edited: m.edited != null,
		authorDiscordId: m.user_id,
		authorName: m.username ?? m.nick ?? 'Onbekend',
		authorNick: m.nick ?? null,
		authorAvatarUrl: avatarUrl(m.user_id, m.avatar),
		isBot: m.bot ?? false,
		content: truncate(m.content ?? ''),
		replyToDiscordId: m.reference?.message ?? null,
		embeds: (m.embeds ?? []).map(normalizeEmbed),
		attachments: (m.attachments ?? []).map(normalizeAttachment).filter((a): a is TicketAttachmentMeta => a !== null),
	}));

	// Participants: dedupe by author id in first-seen order; keep the richest name we saw.
	const seen = new Map<string, ParsedParticipant>();
	for (const m of messages) {
		if (!seen.has(m.authorDiscordId)) {
			seen.set(m.authorDiscordId, { discordId: m.authorDiscordId, name: m.authorName, isBot: m.isBot });
		}
	}

	const timestamps = messages.map((m) => m.sentAt).filter((t): t is string => t !== null).sort();

	return {
		ticketNumber: channel.name ?? channel.id ?? 'onbekend',
		serverId: server.id ?? null,
		serverName: server.name ?? null,
		channelId: channel.id ?? null,
		channelName: channel.name ?? null,
		openedAt: timestamps[0] ?? null,
		closedAt: timestamps[timestamps.length - 1] ?? null,
		messageCount: messages.length,
		participants: [...seen.values()],
		messages,
	};
};
