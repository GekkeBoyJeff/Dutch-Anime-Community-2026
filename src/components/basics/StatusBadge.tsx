import type { ReactNode, Ref } from 'react';

import Badge from '@/components/basics/Badge';
import type { StatusVariant } from '@/lib/content/schema/primitives';

// The canonical domain-status → colour + label mapping. Every beheer screen renders a status through
// this so warning/declaratie/aanwezigheid/verzoek chips stay consistent. Values mirror the planned DB
// enums; there is no yellow status token (warning is orange), so "geel" maps to warning and "rood" to
// error. Unknown statuses fall back to a neutral chip showing the raw key.
const STATUS: Record<string, Record<string, { variant: StatusVariant; label: string }>> = {
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

export type StatusDomain = keyof typeof STATUS;

type StatusBadgeProps = {
	/** The domain namespace (warning, expense, attendance, request) */
	domain: StatusDomain;
	/** The status key within the domain */
	status: string;
	/** Override the auto-derived label */
	label?: ReactNode;
	/** Show a leading status dot, so meaning is not colour-only */
	dot?: boolean;
	className?: string;
	ref?: Ref<HTMLSpanElement>;
};

// A read-only status chip built on Badge (never Pill — Pill is an interactive filter). Looks up the
// domain+status in the canonical map above; a screen never hardcodes a status colour.
const StatusBadge = ({ domain, status, label, dot = false, className, ref }: StatusBadgeProps) => {
	const mapped = STATUS[domain]?.[status];
	return (
		<Badge ref={ref} variant={mapped?.variant ?? 'neutral'} dot={dot} className={className}>
			{label ?? mapped?.label ?? status}
		</Badge>
	);
};

export default StatusBadge;
