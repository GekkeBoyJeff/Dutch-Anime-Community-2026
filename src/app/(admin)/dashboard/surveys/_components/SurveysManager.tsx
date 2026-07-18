'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import SurveyEditor from '@/app/(admin)/dashboard/surveys/_components/SurveyEditor';
import SurveyResults from '@/app/(admin)/dashboard/surveys/_components/SurveyResults';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import FilterBar from '@/components/components/FilterBar';
import Checkbox from '@/components/forms/Checkbox';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { env } from '@/lib/env';
import { getBrowserClient } from '@/lib/supabase/client';

interface SurveyRow {
	id: string;
	title: string;
	access_mode: 'public' | 'authenticated';
	anonymous: boolean;
	audience: 'all_users' | 'role' | 'event_attendees';
	audience_role: string | null;
	event_id: string | null;
	opens_at: string | null;
	closes_at: string | null;
	archived_at: string | null;
}

type SurveyStatus = 'concept' | 'open' | 'closed' | 'archived';

const statusOf = (s: SurveyRow, now: string): SurveyStatus =>
	s.archived_at ? 'archived' : s.opens_at === null ? 'concept' : s.closes_at !== null && s.closes_at <= now ? 'closed' : 'open';

const ACCESS_LABEL: Record<SurveyRow['access_mode'], string> = { public: 'Publiek', authenticated: 'Ingelogd' };
const audienceLabel = (s: SurveyRow): string =>
	s.audience === 'all_users' ? 'Iedereen' : s.audience === 'role' ? `Rol: ${s.audience_role ?? '—'}` : 'Aanwezigen';

const SurveysManager = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard('surveys.manage', { className: 'surveys', label: 'Enquêtes laden' });

	const [surveys, setSurveys] = useState<SurveyRow[]>([]);
	const [events, setEvents] = useState<{ id: string; name: string }[]>([]);
	const [counts, setCounts] = useState<Record<string, number>>({});
	const [refreshKey, setRefreshKey] = useState(0);
	const [editorOpen, setEditorOpen] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [resultsId, setResultsId] = useState<string | null>(null);
	const [toDelete, setToDelete] = useState<SurveyRow | null>(null);
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [showArchived, setShowArchived] = useState(false);
	const toast = Toast.useToastManager();

	// now verspringt bewust bij elke data-refresh zodat de status-afleiding vers blijft.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const now = useMemo(() => new Date().toISOString(), [refreshKey]);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('surveys').select('*').order('created_at', { ascending: false }),
			db.from('events').select('id, name').is('archived_at', null).order('starts_on', { ascending: false, nullsFirst: false }),
			db.rpc('survey_response_counts'),
		]).then(([s, e, c]) => {
			if (!active) return;
			const failed = s.error ?? e.error ?? c.error;
			if (failed) {
				toast.add({ title: 'Kon enquêtes niet laden', description: failed.message, type: 'error' });
				return;
			}
			setSurveys((s.data ?? []) as SurveyRow[]);
			setEvents((e.data ?? []) as { id: string; name: string }[]);
			setCounts(Object.fromEntries(((c.data ?? []) as { survey_id: string; response_count: number }[]).map((r) => [r.survey_id, Number(r.response_count)])));
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready, session, refreshKey]);

	const openEditor = (id: string | null) => {
		setEditId(id);
		setEditorOpen(true);
	};

	const setOpen = async (id: string, open: boolean) => {
		const { error } = await getBrowserClient().rpc(open ? 'open_survey' : 'close_survey', { p_id: id });
		if (error) return void toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
		setRefreshKey((k) => k + 1);
		toast.add({ title: open ? 'Enquête opengezet' : 'Enquête gesloten', type: 'success' });
	};

	const setArchived = async (id: string, archived: boolean) => {
		const { error } = await getBrowserClient()
			.from('surveys')
			.update({ archived_at: archived ? new Date().toISOString() : null, archived_by: archived ? session?.user.id ?? null : null })
			.eq('id', id);
		if (error) return void toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
		setRefreshKey((k) => k + 1);
		toast.add({ title: archived ? 'Enquête gearchiveerd' : 'Enquête hersteld', type: 'success' });
	};

	const hardDelete = async (id: string) => {
		const { error } = await getBrowserClient().rpc('hard_delete', { target_table: 'surveys', target_id: id });
		if (error) return void toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Enquête definitief verwijderd', type: 'success' });
	};

	// De deelbare invul-URL. window.location.origin mist het basePath (dat bakt Next alleen in router/Link),
	// dus voeg NEXT_PUBLIC_BASE_PATH handmatig toe — net als bij de Discord-callback.
	const shareUrl = (id: string): string => `${window.location.origin}${env.NEXT_PUBLIC_BASE_PATH}/enquete?id=${id}`;
	const copyLink = async (id: string) => {
		const url = shareUrl(id);
		try {
			await navigator.clipboard.writeText(url);
			toast.add({ title: 'Link gekopieerd', description: url, type: 'success' });
		} catch {
			toast.add({ title: 'Kopiëren mislukt — hier is de link', description: url, type: 'error' });
		}
	};

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return surveys.filter((s) => {
			const matchesSearch = q === '' || s.title.toLowerCase().includes(q);
			const status = statusOf(s, now);
			const matchesStatus = statusFilter === '' || status === statusFilter;
			const matchesArchived = showArchived || s.archived_at === null;
			return matchesSearch && matchesStatus && matchesArchived;
		});
	}, [surveys, search, statusFilter, showArchived, now]);

	if (!ready || !session) return fallback;

	const canHardDelete = permissions.has('records.delete');

	const columns: DataTableColumn<SurveyRow>[] = [
		{ key: 'title', header: 'Titel', sortable: true, sortValue: (s) => s.title, cell: (s) => s.title },
		{ key: 'access', header: 'Toegang', cell: (s) => ACCESS_LABEL[s.access_mode] + (s.anonymous ? ' · anoniem' : '') },
		{ key: 'audience', header: 'Doelgroep', cell: (s) => audienceLabel(s) },
		{ key: 'responses', header: 'Inzendingen', align: 'center', sortable: true, sortValue: (s) => counts[s.id] ?? 0, cell: (s) => String(counts[s.id] ?? 0) },
		{
			key: 'status',
			header: 'Status',
			align: 'center',
			cell: (s) => <StatusBadge domain="survey" status={statusOf(s, now)} />,
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (s) => {
				const status = statusOf(s, now);
				return (
					<span className="survey-row-actions">
						{status === 'concept' && (
							<Button variant="primary" onClick={() => setOpen(s.id, true)}>
								Openzetten
							</Button>
						)}
						{status === 'open' && (
							<Button variant="secondary" onClick={() => setOpen(s.id, false)}>
								Sluiten
							</Button>
						)}
						{status === 'closed' && (
							<Button variant="secondary" onClick={() => setOpen(s.id, true)}>
								Heropenen
							</Button>
						)}
						<Button variant="ghost" icon="link" onClick={() => copyLink(s.id)}>
							Link
						</Button>
						<Button variant="secondary" onClick={() => setResultsId(s.id)}>
							Resultaten
						</Button>
						<Button variant="secondary" onClick={() => openEditor(s.id)}>
							Bewerk
						</Button>
						{s.archived_at ? (
							<Button variant="secondary" onClick={() => setArchived(s.id, false)}>
								Herstellen
							</Button>
						) : (
							<Button variant="ghost" onClick={() => setArchived(s.id, true)}>
								Archiveren
							</Button>
						)}
						{canHardDelete && (
							<Button variant="ghost" icon="trash" onClick={() => setToDelete(s)}>
								Verwijder
							</Button>
						)}
					</span>
				);
			},
		},
	];

	return (
		<Container className="surveys">
			<Title size={2}>Enquêtes &amp; polls</Title>

			<div className="survey-toolbar">
				<FilterBar
					filters={[
						{ label: 'Alle', value: '' },
						{ label: 'Concept', value: 'concept' },
						{ label: 'Open', value: 'open' },
						{ label: 'Gesloten', value: 'closed' },
					]}
					value={statusFilter}
					onValueChange={setStatusFilter}
					label="Filter op status"
					searchable
					searchValue={search}
					onSearchValueChange={setSearch}
					searchPlaceholder="Zoek op titel…"
					searchLabel="Zoek enquête"
				/>
				<Button variant="primary" icon="plus" onClick={() => openEditor(null)}>
					Nieuwe enquête
				</Button>
				<Checkbox checked={showArchived} onCheckedChange={setShowArchived} label="Toon gearchiveerd" />
			</div>

			<DataTable
				columns={columns}
				data={filtered}
				empty={{
					title: 'Geen enquêtes gevonden',
					description: search || statusFilter ? 'Pas je zoekopdracht of filter aan.' : 'Maak je eerste enquête aan.',
				}}
			/>

			<SurveyEditor
				surveyId={editId}
				open={editorOpen}
				events={events}
				otherSurveys={surveys.filter((s) => s.id !== editId).map((s) => ({ id: s.id, title: s.title }))}
				userId={session.user.id}
				onClose={() => setEditorOpen(false)}
				onSaved={() => setRefreshKey((k) => k + 1)}
			/>

			<Drawer open={resultsId !== null} onOpenChange={(open) => !open && setResultsId(null)} title="Resultaten" size="46rem">
				<SurveyResults surveyId={resultsId} />
			</Drawer>

			<ConfirmDialog
				open={toDelete !== null}
				onOpenChange={(open) => !open && setToDelete(null)}
				title="Enquête definitief verwijderen?"
				description={toDelete ? `"${toDelete.title}" en alle inzendingen worden onherstelbaar verwijderd. Archiveren is meestal genoeg.` : undefined}
				confirmLabel="Definitief verwijderen"
				destructive
				onConfirm={() => {
					if (toDelete) hardDelete(toDelete.id);
					setToDelete(null);
				}}
			/>
		</Container>
	);
};

export default SurveysManager;
