import Badge from '@/components/basics/Badge';
import type { StatusBadgeProps as StatusBadgeSchemaProps, StatusDomain } from '@/lib/site/content/schema/basics/statusBadge';
import type { StatusVariant } from '@/lib/site/content/schema/primitives';

type StatusBadgeProps = StatusBadgeSchemaProps;

type StatusEntry = { variant: StatusVariant; label: string };

const STATUS: Record<StatusDomain, Record<string, StatusEntry>> = {
	warning: {
		yellow: { variant: 'warning', label: 'Geel' },
		red: { variant: 'error', label: 'Rood' },
	},
	expense: {
		submitted: { variant: 'info', label: 'Ingediend' },
		approved: { variant: 'success', label: 'Goedgekeurd' },
		rejected: { variant: 'error', label: 'Afgewezen' },
		reimbursed: { variant: 'primary', label: 'Uitbetaald' },
	},
	attendance: {
		signed_up: { variant: 'info', label: 'Ingeschreven' },
		expected: { variant: 'info', label: 'Verwacht' },
		present: { variant: 'success', label: 'Aanwezig' },
		late: { variant: 'warning', label: 'Te laat' },
		cancelled_late: { variant: 'error', label: 'Laat afgezegd' },
		no_show: { variant: 'error', label: 'Niet op komen dagen' },
	},
	request: {
		requested: { variant: 'warning', label: 'Aangevraagd' },
		active: { variant: 'success', label: 'Actief' },
		approved: { variant: 'success', label: 'Goedgekeurd' },
		rejected: { variant: 'error', label: 'Afgewezen' },
		cancelled: { variant: 'neutral', label: 'Ingetrokken' },
	},
	survey: {
		concept: { variant: 'neutral', label: 'Concept' },
		open: { variant: 'success', label: 'Open' },
		closed: { variant: 'info', label: 'Gesloten' },
		archived: { variant: 'neutral', label: 'Gearchiveerd' },
	},
};

const StatusBadge = ({
	domain,
	status,
	label,
	dot = false,
	className,
}: StatusBadgeProps) => {
	const mapped = STATUS[domain][status];

	return (
		<Badge variant={mapped?.variant ?? 'neutral'} dot={dot} className={className} value={label ?? mapped?.label ?? status} />
	);
};

export default StatusBadge;
