'use client';

import { useState } from 'react';

import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import { formatDate } from '@/lib/formatDate';

// A read-only Discord-style chat viewer. Everything it renders is UNTRUSTED transcript content, so it
// is text-only — no dangerouslySetInnerHTML, Discord markdown stays as literal text. Avatar and image
// URLs are external (Discord CDN) and expire; both fall back to a placeholder on a broken load.

export interface ChatEmbed {
	title?: string | null;
	description?: string | null;
	color?: string | null;
	imageUrl?: string | null;
	footer?: string | null;
}

export interface ChatAttachment {
	name: string;
	url: string;
	size?: number | null;
	isImage?: boolean;
}

export interface ChatMessage {
	id: string;
	authorName: string;
	authorAvatarUrl?: string | null;
	isBot?: boolean;
	timestamp?: string | null;
	content?: string | null;
	replyToName?: string | null;
	embeds?: ChatEmbed[];
	attachments?: ChatAttachment[];
}

export interface ChatTranscriptProps {
	messages: ChatMessage[];
	emptyLabel?: string;
}

const initialsOf = (name: string): string =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((w) => w[0])
		.join('')
		.toUpperCase() || '?';

const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Avatar that swaps to initials once the CDN URL 404s (Discord signs avatar URLs; they expire).
const ChatAvatar = ({ url, name }: { url?: string | null; name: string }) => {
	const [broken, setBroken] = useState(false);
	if (!url || broken) {
		return <span className="chat-avatar chat-avatar-fallback">{initialsOf(name)}</span>;
	}
	return (
		<span className="chat-avatar">
			<picture>
				<img src={url} alt="" onError={() => setBroken(true)} loading="lazy" decoding="async" />
			</picture>
		</span>
	);
};

// Image attachment thumbnail; a dead link collapses to a "verlopen" placeholder card.
const ChatImage = ({ url, name }: { url: string; name: string }) => {
	const [broken, setBroken] = useState(false);
	if (broken) {
		return (
			<span className="chat-attachment is-expired">
				<Icon name="file" />
				<span className="chat-attachment-info">
					<span className="chat-attachment-name">{name}</span>
					<span className="chat-attachment-note">Afbeelding verlopen</span>
				</span>
				<a href={url} target="_blank" rel="noreferrer noopener">Bekijk origineel</a>
			</span>
		);
	}
	return (
		<a className="chat-attachment-image" href={url} target="_blank" rel="noreferrer noopener">
			<picture>
				<img src={url} alt={name} onError={() => setBroken(true)} loading="lazy" decoding="async" />
			</picture>
		</a>
	);
};

const Attachment = ({ attachment }: { attachment: ChatAttachment }) => {
	if (attachment.isImage) {
		return <ChatImage url={attachment.url} name={attachment.name} />;
	}
	return (
		<span className="chat-attachment">
			<Icon name="file" />
			<span className="chat-attachment-info">
				<span className="chat-attachment-name">{attachment.name}</span>
				{typeof attachment.size === 'number' && <span className="chat-attachment-note">{formatBytes(attachment.size)}</span>}
			</span>
			<a href={attachment.url} target="_blank" rel="noreferrer noopener">Bekijk origineel</a>
		</span>
	);
};

const ChatTranscript = ({ messages, emptyLabel = 'Geen berichten.' }: ChatTranscriptProps) => {
	if (messages.length === 0) {
		return <p className="chat-empty">{emptyLabel}</p>;
	}
	return (
		<ol className="chat-transcript">
			{messages.map((m) => (
				<li key={m.id} className="chat-msg">
					<ChatAvatar url={m.authorAvatarUrl} name={m.authorName} />
					<div className="chat-msg-body">
						{m.replyToName && (
							<span className="chat-msg-reply">
								<Icon name="arrow-left" />
								Antwoord op {m.replyToName}
							</span>
						)}
						<span className="chat-msg-head">
							<span className="chat-msg-author">{m.authorName}</span>
							{m.isBot && <span className="chat-msg-bot">BOT</span>}
							{m.timestamp && <span className="chat-msg-time">{formatDate(m.timestamp, { dateStyle: 'short', timeStyle: 'short' }) ?? m.timestamp}</span>}
						</span>
						{m.content && <span className="chat-msg-content">{m.content}</span>}
						{(m.embeds ?? []).map((e, i) => (
							<div key={i} className={classNames('chat-embed', !e.color && 'is-plain')} style={e.color ? { borderInlineStartColor: e.color } : undefined}>
								{e.title && <span className="chat-embed-title">{e.title}</span>}
								{e.description && <span className="chat-embed-desc">{e.description}</span>}
								{e.imageUrl && <ChatImage url={e.imageUrl} name={e.title ?? 'afbeelding'} />}
								{e.footer && <span className="chat-embed-footer">{e.footer}</span>}
							</div>
						))}
						{(m.attachments ?? []).length > 0 && (
							<div className="chat-attachments">
								{m.attachments!.map((a, i) => (
									<Attachment key={i} attachment={a} />
								))}
							</div>
						)}
					</div>
				</li>
			))}
		</ol>
	);
};

export default ChatTranscript;
