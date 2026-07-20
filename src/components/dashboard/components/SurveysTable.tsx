import StatusBadge from '@/components/basics/StatusBadge';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import RowActions, { RowActionItems, type RowAction } from '@/components/dashboard/components/RowActions';

export interface SurveyRow {
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

export type SurveyStatus = 'concept' | 'open' | 'closed' | 'archived';

export const surveyStatusOf = (s: SurveyRow, now: string): SurveyStatus =>
	s.archived_at ? 'archived' : s.opens_at === null ? 'concept' : s.closes_at !== null && s.closes_at <= now ? 'closed' : 'open';

const ACCESS_LABEL: Record<SurveyRow['access_mode'], string> = { public: 'Publiek', authenticated: 'Ingelogd' };
const audienceLabel = (s: SurveyRow): string =>
	s.audience === 'all_users' ? 'Iedereen' : s.audience === 'role' ? `Rol: ${s.audience_role ?? '—'}` : 'Aanwezigen';

interface SurveysTableProps {
	surveys: SurveyRow[];
	counts: Record<string, number>;
	now: string;
	canHardDelete: boolean;
	empty: { title: string; description: string };
	onSetOpen: (id: string, open: boolean) => void;
	onCopyLink: (id: string) => void;
	onResults: (id: string) => void;
	onEdit: (id: string) => void;
	onSetArchived: (id: string, archived: boolean) => void;
	onDelete: (survey: SurveyRow) => void;
}

/**
 * The surveys overview table: title, access, audience, response count, a derived status badge and a row
 * of status/link/results/edit/archive/delete actions. Presentational — status derives from `now` and
 * every action is a callback; the caller owns queries, mutations and filtering.
 */
const SurveysTable = ({ surveys, counts, now, canHardDelete, empty, onSetOpen, onCopyLink, onResults, onEdit, onSetArchived, onDelete }: SurveysTableProps) => {
	// One action list per row, shared by the visible overflow menu and the row's right-click menu. The
	// status toggle stays a pinned button; everything else folds into "⋯"; delete carries the danger idiom.
	const actionsFor = (s: SurveyRow): RowAction[] => {
		const status = surveyStatusOf(s, now);
		const actions: RowAction[] = [];
		if (status === 'concept') actions.push({ label: 'Openzetten', pinned: true, variant: 'primary', onClick: () => onSetOpen(s.id, true) });
		else if (status === 'open') actions.push({ label: 'Sluiten', pinned: true, onClick: () => onSetOpen(s.id, false) });
		else if (status === 'closed') actions.push({ label: 'Heropenen', pinned: true, onClick: () => onSetOpen(s.id, true) });
		actions.push({ label: 'Link', icon: 'link', onClick: () => onCopyLink(s.id) });
		actions.push({ label: 'Resultaten', onClick: () => onResults(s.id) });
		actions.push({ label: 'Bewerk', onClick: () => onEdit(s.id) });
		if (s.archived_at) actions.push({ label: 'Herstellen', pinned: status === 'archived', onClick: () => onSetArchived(s.id, false) });
		else actions.push({ label: 'Archiveren', onClick: () => onSetArchived(s.id, true) });
		if (canHardDelete) actions.push({ label: 'Verwijder', icon: 'trash', danger: true, onClick: () => onDelete(s) });
		return actions;
	};

	const columns: DataTableColumn<SurveyRow>[] = [
		{ key: 'title', header: 'Titel', sortable: true, sortValue: (s) => s.title, cell: (s) => s.title },
		{ key: 'access', header: 'Toegang', cell: (s) => ACCESS_LABEL[s.access_mode] + (s.anonymous ? ' · anoniem' : '') },
		{ key: 'audience', header: 'Doelgroep', cell: (s) => audienceLabel(s) },
		{ key: 'responses', header: 'Inzendingen', align: 'center', sortable: true, sortValue: (s) => counts[s.id] ?? 0, cell: (s) => String(counts[s.id] ?? 0) },
		{
			key: 'status',
			header: 'Status',
			align: 'center',
			cell: (s) => <StatusBadge domain="survey" status={surveyStatusOf(s, now)} />,
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (s) => <RowActions actions={actionsFor(s)} />,
		},
	];

	return (
		<div className="surveys-table">
			<DataTable columns={columns} data={surveys} empty={empty} rowContextMenu={(s) => <RowActionItems actions={actionsFor(s)} />} />
		</div>
	);
};

export default SurveysTable;
