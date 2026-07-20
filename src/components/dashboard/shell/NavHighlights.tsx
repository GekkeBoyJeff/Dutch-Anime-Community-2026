'use client';

import type { ReactNode } from 'react';

import HighlightCard from '@/components/dashboard/components/HighlightCard';
import { formatDate } from '@/lib/formatDate';

import { fmtRange } from '../events/datetime';
import { useWidgetData } from '../home/useWidgetData';

// The mega-menu's right-zone highlight per group: one live, meaningful fact drawn from the same reads the
// home widgets already run — no new migrations. Each renders only when its panel first opens (Base UI keeps
// inactive content unmounted), so the queries are lazy. Errors degrade to the group's quiet empty state.

// Mijn → your next stand-duty shift (my_subject_id() → own event_shifts; RLS lets a member read their own).
const MijnHighlight = () => {
	const { loading, data } = useWidgetData(async (db) => {
		const { data: subjectId, error: subjectError } = await db.rpc('my_subject_id');
		if (subjectError) throw subjectError;
		if (!subjectId) return null;

		const { data: shifts, error } = await db
			.from('event_shifts')
			.select('id, event_id, starts_at, ends_at, station')
			.eq('subject_id', subjectId)
			.gte('starts_at', new Date().toISOString())
			.order('starts_at')
			.limit(1);
		if (error) throw error;

		const shift = shifts?.[0];
		if (!shift) return null;

		const { data: event } = await db.from('events').select('name').eq('id', shift.event_id).maybeSingle();
		return { shift, eventName: event?.name ?? 'Onbekende conventie' };
	});

	return (
		<HighlightCard
			eyebrow="Volgende shift"
			href="/dashboard/my-inventory"
			ctaLabel="Naar mijn conventies"
			loading={loading}
			isEmpty={!data}
			emptyLabel="Nog geen shifts toegewezen."
			lead={data && fmtRange(data.shift.starts_at, data.shift.ends_at)}
			sub={data && `${data.eventName}${data.shift.station ? ` · ${data.shift.station}` : ''}`}
		/>
	);
};

// Operaties → the next convention on the calendar, deep-linking straight into its editor.
const OperatiesHighlight = () => {
	const { loading, data } = useWidgetData(async (db) => {
		const { data: rows, error } = await db
			.from('events')
			.select('id, name, location, starts_on')
			.is('archived_at', null)
			.gte('starts_on', new Date().toISOString().slice(0, 10))
			.order('starts_on', { ascending: true })
			.limit(1);
		if (error) throw error;
		return rows?.[0] ?? null;
	});

	return (
		<HighlightCard
			eyebrow="Volgende conventie"
			href={data ? `/dashboard/events?id=${data.id}` : '/dashboard/events'}
			ctaLabel="Open conventie"
			loading={loading}
			isEmpty={!data}
			emptyLabel="Geen geplande conventies."
			lead={data?.name}
			sub={data && `${data.starts_on ? formatDate(data.starts_on, { dateStyle: 'full' }) ?? data.starts_on : 'Datum onbekend'}${data.location ? ` · ${data.location}` : ''}`}
		/>
	);
};

// Financiën → the org-wide approval queue: how many declaraties await review.
const FinancienHighlight = () => {
	const { loading, data } = useWidgetData(async (db) => {
		const { count, error } = await db.from('expenses').select('id', { count: 'exact', head: true }).eq('status', 'submitted').is('archived_at', null);
		if (error) throw error;
		return count ?? 0;
	});

	const count = data ?? 0;
	return (
		<HighlightCard
			eyebrow="Te beoordelen"
			href="/dashboard/expenses"
			ctaLabel="Naar declaratie-beheer"
			loading={loading}
			isEmpty={count === 0}
			emptyLabel="Geen openstaande declaraties."
			lead={`${count} ${count === 1 ? 'declaratie' : 'declaraties'}`}
			sub="wachten op je beoordeling."
		/>
	);
};

// Content → the most recently uploaded image (the builder/media people's "what changed" glance).
const ContentHighlight = () => {
	const { loading, data } = useWidgetData(async (db) => {
		const { data: objects, error } = await db.storage.from('media').list('', { limit: 8, sortBy: { column: 'created_at', order: 'desc' } });
		if (error) throw error;
		const newest = (objects ?? []).find((object) => object.id && (object.metadata?.mimetype as string | undefined)?.startsWith('image/'));
		return newest ? { name: newest.name } : null;
	});

	return (
		<HighlightCard eyebrow="Media" href="/upload" ctaLabel="Naar media" loading={loading} isEmpty={!data} emptyLabel="Nog geen media geüpload." lead={data?.name} sub="Laatst geüpload bestand." />
	);
};

const humanizeTable = (name: string): string => {
	const spaced = name.replace(/_/g, ' ');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const labelOf = (row: { new_data: unknown; old_data: unknown; table_name: string }): string => {
	const rowData = (row.new_data ?? row.old_data) as Record<string, unknown> | null;
	const pick = (rowData?.name ?? rowData?.title ?? rowData?.username) as string | undefined;
	return pick ?? humanizeTable(row.table_name);
};

// Systeem → the tail of the audit log: the single most recent change across the whole platform.
const SysteemHighlight = () => {
	const { loading, data } = useWidgetData(async (db) => {
		const { data: rows, error } = await db.from('audit_log').select('id, table_name, op, old_data, new_data, created_at').order('created_at', { ascending: false }).limit(1);
		if (error) throw error;
		return rows?.[0] ?? null;
	});

	return (
		<HighlightCard
			eyebrow="Laatste wijziging"
			href="/dashboard/logs"
			ctaLabel="Naar logs"
			loading={loading}
			isEmpty={!data}
			emptyLabel="Nog geen activiteit."
			lead={data && labelOf(data)}
			sub={data && `${humanizeTable(data.table_name)} · ${new Date(data.created_at).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}`}
		/>
	);
};

// group key → its highlight node. DashboardNav attaches these onto the permission-filtered groups.
export const NAV_HIGHLIGHTS: Record<string, ReactNode> = {
	mijn: <MijnHighlight />,
	operaties: <OperatiesHighlight />,
	financien: <FinancienHighlight />,
	content: <ContentHighlight />,
	systeem: <SysteemHighlight />,
};
