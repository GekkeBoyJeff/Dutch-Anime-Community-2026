'use client';

import { Toast } from '@base-ui/react/toast';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import RowActions, { RowActionItems, type RowAction } from '@/components/dashboard/components/RowActions';
import TicketUpload from '@/components/dashboard/moderation/TicketUpload';
import TicketViewer from '@/components/dashboard/moderation/TicketViewer';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean; canDelete: boolean };
type Row = {
	id: string;
	ticket_number: string;
	date: string | null;
	message_count: number;
	participants: string;
	archived_at: string | null;
};

// Tickets linked to this profile (via ticket_participants.subject_id). List → chat-viewer; yakuza can
// archive (archived_at), admin can hard-delete via the existing RPC.
const TicketsTab = ({ subjectId, sessionUserId, canManage, canDelete }: Props) => {
	const toast = Toast.useToastManager();
	const [rows, setRows] = useState<Row[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [uploading, setUploading] = useState(false);
	const [viewerId, setViewerId] = useState<string | null>(null);
	const [toArchive, setToArchive] = useState<Row | null>(null);
	const [toDelete, setToDelete] = useState<Row | null>(null);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		db.from('ticket_participants')
			.select('ticket_id')
			.eq('subject_id', subjectId)
			.then(async ({ data: links, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon tickets niet laden', description: error.message, type: 'error' });
					return;
				}
				const ids = [...new Set((links ?? []).map((l) => l.ticket_id as string))];
				if (ids.length === 0) {
					setRows([]);
					return;
				}
				const [ticketsRes, partsRes] = await Promise.all([
					db.from('tickets').select('id, ticket_number, opened_at, uploaded_at, message_count, archived_at').in('id', ids).order('uploaded_at', { ascending: false }),
					db.from('ticket_participants').select('ticket_id, name').in('ticket_id', ids),
				]);
				if (!active) return;
				if (ticketsRes.error || partsRes.error) {
					toast.add({ title: 'Kon tickets niet laden', description: (ticketsRes.error ?? partsRes.error)?.message, type: 'error' });
					return;
				}
				const names = new Map<string, string[]>();
				for (const p of partsRes.data ?? []) {
					const list = names.get(p.ticket_id as string) ?? [];
					if (p.name) list.push(p.name as string);
					names.set(p.ticket_id as string, list);
				}
				setRows(
					(ticketsRes.data ?? []).map((t) => ({
						id: t.id as string,
						ticket_number: t.ticket_number as string,
						date: (t.opened_at as string | null) ?? (t.uploaded_at as string | null),
						message_count: t.message_count as number,
						participants: (names.get(t.id as string) ?? []).join(', ') || '—',
						archived_at: t.archived_at as string | null,
					})),
				);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectId, refreshKey]);

	const archive = async (row: Row) => {
		const { error } = await getBrowserClient()
			.from('tickets')
			.update({ archived_at: new Date().toISOString(), archived_by: sessionUserId })
			.eq('id', row.id);
		if (error) {
			toast.add({ title: 'Archiveren mislukt', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Ticket gearchiveerd', type: 'success' });
	};

	const remove = async (row: Row) => {
		const { error } = await getBrowserClient().rpc('hard_delete', { target_table: 'tickets', target_id: row.id });
		if (error) {
			toast.add({ title: 'Verwijderen mislukt', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Ticket verwijderd', type: 'success' });
	};

	// One action list per row, shared by the visible overflow menu and the row's right-click menu. Bekijk
	// stays a pinned button; archive/delete fold into "⋯" and keep their confirm dialogs.
	const actionsFor = useCallback(
		(r: Row): RowAction[] => {
			const actions: RowAction[] = [{ label: 'Bekijk', pinned: true, onClick: () => setViewerId(r.id) }];
			if (canManage && !r.archived_at) actions.push({ label: 'Archiveer', onClick: () => setToArchive(r) });
			if (canDelete) actions.push({ label: 'Verwijder', icon: 'trash', danger: true, onClick: () => setToDelete(r) });
			return actions;
		},
		[canManage, canDelete],
	);

	const columns: DataTableColumn<Row>[] = useMemo(
		() => [
			{ key: 'number', header: 'Ticket', sortable: true, sortValue: (r) => r.ticket_number, cell: (r) => r.ticket_number },
			{ key: 'date', header: 'Datum', align: 'center', sortable: true, sortValue: (r) => r.date ?? '', cell: (r) => (r.date ? formatDate(r.date, { dateStyle: 'medium' }) ?? r.date : '—') },
			{ key: 'messages', header: 'Berichten', align: 'center', cell: (r) => String(r.message_count) },
			{ key: 'participants', header: 'Deelnemers', cell: (r) => r.participants },
			{ key: 'status', header: 'Status', align: 'center', cell: (r) => (r.archived_at ? <StatusBadge domain="request" status="cancelled" label="Gearchiveerd" /> : '—') },
			{
				key: 'actions',
				header: '',
				align: 'end',
				cell: (r) => <RowActions actions={actionsFor(r)} />,
			},
		],
		[actionsFor],
	);

	return (
		<div className="inventory-tab">
			{canManage && (
				<div className="inventory-toolbar">
					<Button variant="primary" icon="upload" onClick={() => setUploading(true)}>
						Transcript uploaden
					</Button>
				</div>
			)}
			<DataTable columns={columns} data={rows} empty={{ title: 'Geen tickets', description: 'Er zijn nog geen transcripts aan dit profiel gekoppeld.' }} rowContextMenu={(r) => <RowActionItems actions={actionsFor(r)} />} />

			<TicketUpload open={uploading} sessionUserId={sessionUserId} onClose={() => setUploading(false)} onSaved={() => { setUploading(false); setRefreshKey((k) => k + 1); }} />
			<TicketViewer ticketId={viewerId} onClose={() => setViewerId(null)} />

			<ConfirmDialog
				open={toArchive !== null}
				onOpenChange={(o) => !o && setToArchive(null)}
				title="Ticket archiveren?"
				description="Het ticket blijft bewaard maar wordt als gearchiveerd gemarkeerd."
				confirmLabel="Archiveren"
				destructive
				onConfirm={() => {
					if (toArchive) archive(toArchive);
					setToArchive(null);
				}}
			/>
			<ConfirmDialog
				open={toDelete !== null}
				onOpenChange={(o) => !o && setToDelete(null)}
				title="Ticket definitief verwijderen?"
				description="Het transcript en alle berichten worden onherstelbaar verwijderd."
				confirmLabel="Verwijderen"
				destructive
				onConfirm={() => {
					if (toDelete) remove(toDelete);
					setToDelete(null);
				}}
			/>
		</div>
	);
};

export default TicketsTab;
