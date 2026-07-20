'use client';

import { Toast } from '@base-ui/react/toast';
import { useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import Drawer from '@/components/components/Drawer';
import FileUpload from '@/components/components/FileUpload';
import ChatTranscript from '@/components/dashboard/components/ChatTranscript';
import { parsedToChatMessages } from '@/components/dashboard/moderation/ticketMapping';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import { getBrowserClient } from '@/lib/supabase/client';
import { parseTranscript } from '@/lib/tickets/parse';
import { type ParsedTicket, TicketParseError } from '@/lib/tickets/types';
import type { Json } from '@/types/database.types';

type Props = { open: boolean; sessionUserId: string; onClose: () => void; onSaved: () => void };

const PREVIEW_LIMIT = 6;

// Upload one Ticket-Tool .html, parse it client-side, match participants to mod_subjects by Discord ID
// (uploader confirms), then persist the structured ticket. Nothing here stores raw HTML or images.
const TicketUpload = ({ open, sessionUserId, onClose, onSaved }: Props) => {
	const toast = Toast.useToastManager();
	const [parsed, setParsed] = useState<ParsedTicket | null>(null);
	// discordId → matched mod_subjects.id (or null = unmatched).
	const [matches, setMatches] = useState<Record<string, string | null>>({});
	const [note, setNote] = useState('');
	const [busy, setBusy] = useState(false);
	const [parsing, setParsing] = useState(false);

	const reset = () => {
		setParsed(null);
		setMatches({});
		setNote('');
	};

	const runMatching = async (ticket: ParsedTicket) => {
		const ids = ticket.participants.map((p) => p.discordId);
		const { data, error } = await getBrowserClient().from('mod_subjects').select('id, discord_id').in('discord_id', ids);
		if (error) {
			toast.add({ title: 'Kon profielen niet matchen', description: error.message, type: 'error' });
		}
		const byDiscord = new Map((data ?? []).map((r) => [r.discord_id as string, r.id as string]));
		setMatches(Object.fromEntries(ticket.participants.map((p) => [p.discordId, byDiscord.get(p.discordId) ?? null])));
	};

	const onFiles = async (files: File[]) => {
		const file = files[0];
		if (!file) return;
		setParsing(true);
		try {
			const ticket = parseTranscript(await file.text());
			setParsed(ticket);
			await runMatching(ticket);
		} catch (e) {
			const message = e instanceof TicketParseError ? e.message : 'Het bestand kon niet gelezen worden.';
			toast.add({ title: 'Ongeldig transcript', description: message, type: 'error' });
		} finally {
			setParsing(false);
		}
	};

	const createShadow = async (discordId: string, name: string) => {
		const { data, error } = await getBrowserClient()
			.from('mod_subjects')
			.insert({ discord_id: discordId, discord_name: name })
			.select('id')
			.single();
		if (error || !data) {
			toast.add({ title: 'Schaduwprofiel maken mislukt', description: error?.message, type: 'error' });
			return;
		}
		setMatches((m) => ({ ...m, [discordId]: data.id }));
		toast.add({ title: 'Schaduwprofiel aangemaakt', type: 'success' });
	};

	const save = async () => {
		if (!parsed) return;
		setBusy(true);
		const db = getBrowserClient();
		try {
			const { data: ticket, error: tErr } = await db
				.from('tickets')
				.insert({
					ticket_number: parsed.ticketNumber,
					server_id: parsed.serverId,
					server_name: parsed.serverName,
					channel_id: parsed.channelId,
					channel_name: parsed.channelName,
					opened_at: parsed.openedAt,
					closed_at: parsed.closedAt,
					message_count: parsed.messageCount,
					uploaded_by: sessionUserId,
					note: note.trim() || null,
				})
				.select('id')
				.single();
			if (tErr || !ticket) {
				toast.add({ title: 'Opslaan mislukt', description: tErr?.message, type: 'error' });
				return;
			}

			const { error: mErr } = await db.from('ticket_messages').insert(
				parsed.messages.map((m) => ({
					ticket_id: ticket.id,
					seq: m.seq,
					discord_id: m.discordId,
					sent_at: m.sentAt,
					edited: m.edited,
					author_discord_id: m.authorDiscordId,
					author_name: m.authorName,
					author_nick: m.authorNick,
					author_avatar_url: m.authorAvatarUrl,
					is_bot: m.isBot,
					content: m.content,
					reply_to_discord_id: m.replyToDiscordId,
					embeds: m.embeds as unknown as Json,
					attachments: m.attachments as unknown as Json,
				})),
			);
			if (mErr) {
				toast.add({ title: 'Berichten opslaan mislukt', description: mErr.message, type: 'error' });
				return;
			}

			const { error: pErr } = await db.from('ticket_participants').insert(
				parsed.participants.map((p) => ({
					ticket_id: ticket.id,
					discord_id: p.discordId,
					name: p.name,
					is_bot: p.isBot,
					subject_id: matches[p.discordId] ?? null,
				})),
			);
			if (pErr) {
				toast.add({ title: 'Deelnemers opslaan mislukt', description: pErr.message, type: 'error' });
				return;
			}

			toast.add({ title: 'Ticket opgeslagen', type: 'success' });
			reset();
			onSaved();
		} finally {
			setBusy(false);
		}
	};

	const previewMessages = useMemo(() => (parsed ? parsedToChatMessages(parsed).slice(0, PREVIEW_LIMIT) : []), [parsed]);

	const close = () => {
		reset();
		onClose();
	};

	return (
		<Drawer
			open={open}
			onOpenChange={(o) => !o && close()}
			title="Transcript uploaden"
			size="42rem"
			footer={
				parsed ? (
					<>
						<Button variant="secondary" onClick={reset}>
							Ander bestand
						</Button>
						<Button variant="primary" onClick={save} disabled={busy}>
							{busy ? 'Bezig…' : 'Ticket opslaan'}
						</Button>
					</>
				) : undefined
			}
		>
			{!parsed ? (
				<FileUpload
					accept=".html,.htm"
					maxFiles={1}
					busy={parsing}
					showFileList={false}
					onFiles={onFiles}
					label="Sleep een Ticket Tool-transcript (.html) hierheen, of klik om te kiezen."
					hint="Eén bestand. Er wordt alleen tekst en bijlage-informatie opgeslagen — geen afbeeldingen."
				/>
			) : (
				<div className="ticket-preview">
					<div className="inventory-section">
						<Title size={5}>Ticket {parsed.ticketNumber}</Title>
						<p className="con-note">
							{parsed.serverName ?? '—'} · #{parsed.channelName ?? '—'} · {parsed.messageCount} berichten
						</p>
					</div>

					<div className="inventory-section">
						<Title size={5}>Deelnemers</Title>
						<ul className="con-list">
							{parsed.participants.map((p) => {
								const matched = matches[p.discordId] != null;
								return (
									<li key={p.discordId} className="con-line">
										<div className="con-line-info">
											<span className="con-line-main">{p.name}</span>
											<span className="con-note">{p.discordId}</span>
										</div>
										<span className="mod-meta">
											{p.isBot && <StatusBadge domain="request" status="cancelled" label="Bot" />}
											{matched ? (
												<StatusBadge domain="request" status="active" label="Gekoppeld" />
											) : (
												<>
													<StatusBadge domain="request" status="requested" label="Geen profiel" />
													{!p.isBot && (
														<Button variant="ghost" onClick={() => createShadow(p.discordId, p.name)}>
															Maak schaduwprofiel
														</Button>
													)}
												</>
											)}
										</span>
									</li>
								);
							})}
						</ul>
					</div>

					<div className="inventory-section">
						<Title size={5}>Voorbeeld</Title>
						<ChatTranscript messages={previewMessages} />
					</div>

					<Field name="note">
						<Field.Label>Notitie (optioneel)</Field.Label>
						<TextArea value={note} onChange={(e) => setNote(e.currentTarget.value)} />
					</Field>
				</div>
			)}
		</Drawer>
	);
};

export default TicketUpload;
