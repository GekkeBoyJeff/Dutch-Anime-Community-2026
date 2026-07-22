'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import Spinner from '@/components/basics/Spinner';
import Drawer from '@/components/components/Drawer';
import ChatTranscript, { type ChatMessage } from '@/components/dashboard/components/ChatTranscript';
import { rowsToChatMessages, type TicketMessageRow } from '@/components/dashboard/moderation/ticketMapping';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

type TicketHead = { ticket_number: string; channel_name: string | null; opened_at: string | null; closed_at: string | null; message_count: number };
type Props = { ticketId: string | null; onClose: () => void };

// Chat-viewer for one stored ticket: loads the header + ordered messages and renders them through the
// generic ChatTranscript. Read-only, text-only.
const TicketViewer = ({ ticketId, onClose }: Props) => {
	const toast = Toast.useToastManager();
	const [head, setHead] = useState<TicketHead | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	// Which ticket the current head/messages belong to; while it lags ticketId we show the spinner
	// (avoids a synchronous setState reset inside the effect).
	const [loadedId, setLoadedId] = useState<string | null>(null);

	useEffect(() => {
		if (!ticketId) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('tickets').select('ticket_number, channel_name, opened_at, closed_at, message_count').eq('id', ticketId).maybeSingle(),
			db
				.from('ticket_messages')
				.select('discord_id, seq, sent_at, author_discord_id, author_name, author_avatar_url, is_bot, content, reply_to_discord_id, embeds, attachments')
				.eq('ticket_id', ticketId)
				.order('seq', { ascending: true }),
		]).then(([headRes, msgRes]) => {
			if (!active) return;
			if (headRes.error || msgRes.error) {
				toast.add({ title: 'Kon ticket niet laden', description: (headRes.error ?? msgRes.error)?.message, type: 'error' });
				setLoadedId(ticketId);
				return;
			}
			setHead((headRes.data ?? null) as TicketHead | null);
			setMessages(rowsToChatMessages((msgRes.data ?? []) as TicketMessageRow[]));
			setLoadedId(ticketId);
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketId]);

	const period =
		head?.opened_at && head?.closed_at
			? `${formatDate(head.opened_at, { dateStyle: 'medium', timeStyle: 'short' })} – ${formatDate(head.closed_at, { timeStyle: 'short' })}`
			: undefined;

	return (
		<Drawer open={ticketId !== null} onOpenChange={(o) => !o && onClose()} title={head ? `Ticket ${head.ticket_number}` : 'Ticket'} size="42rem">
			{loadedId !== ticketId ? (
				<Spinner label="Ticket laden" />
			) : (
				<div className="ticket-viewer">
					{head && (
						<p className="field-note">
							{head.message_count} berichten{period ? ` · ${period}` : ''}
						</p>
					)}
					<ChatTranscript messages={messages} />
				</div>
			)}
		</Drawer>
	);
};

export default TicketViewer;
