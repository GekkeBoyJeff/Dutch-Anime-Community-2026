'use client';

import type { ReactNode } from 'react';

import Metric from '@/components/components/Metric';
import Moment from '@/components/components/Moment';
import Panel from '@/components/components/Panel';
import { formatDate } from '@/lib/formatDate';

import { fmtDayMarker, fmtRange } from '../events/datetime';
import { useWidgetData } from '../home/useWidgetData';

// The mega-menu's highlight per group: one live, meaningful fact drawn from the same reads the
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
		<Panel title="Volgende shift" href="/dashboard/my-inventory" linkLabel="Naar mijn conventies" isEmpty={!loading && !data} emptyLabel="Nog geen shifts toegewezen.">
			<Moment.List>
				<Moment
					marker={data ? fmtDayMarker(data.shift.starts_at) : ''}
					title={data ? fmtRange(data.shift.starts_at, data.shift.ends_at) : ''}
					meta={data ? `${data.eventName}${data.shift.station ? ` · ${data.shift.station}` : ''}` : undefined}
					loading={loading}
				/>
			</Moment.List>
		</Panel>
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
		<Panel
			title="Volgende conventie"
			href={data ? `/dashboard/events?id=${data.id}` : '/dashboard/events'}
			linkLabel="Open conventie"
			isEmpty={!loading && !data}
			emptyLabel="Geen geplande conventies."
		>
			<Moment.List>
				<Moment
					marker={data?.starts_on ? fmtDayMarker(data.starts_on) : ''}
					title={data?.name ?? ''}
					meta={data ? `${data.starts_on ? (formatDate(data.starts_on, { dateStyle: 'full' }) ?? data.starts_on) : 'Datum onbekend'}${data.location ? ` · ${data.location}` : ''}` : undefined}
					loading={loading}
				/>
			</Moment.List>
		</Panel>
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
		<Panel title="Te beoordelen" href="/dashboard/expenses" linkLabel="Naar declaratie-beheer" isEmpty={!loading && count === 0} emptyLabel="Geen openstaande declaraties.">
			<Metric label="Wachten op je beoordeling" value={count} loading={loading} tone={count > 0 ? 'negative' : 'neutral'} />
		</Panel>
	);
};

// Content → the most recently uploaded image (the builder/media people's "what changed" glance).
const ContentHighlight = () => {
	const { loading, data } = useWidgetData(async (db) => {
		const { data: objects, error } = await db.storage.from('media').list('', { limit: 8, sortBy: { column: 'created_at', order: 'desc' } });
		if (error) throw error;
		const newest = (objects ?? []).find((object) => object.id && (object.metadata?.mimetype as string | undefined)?.startsWith('image/'));
		return newest ? { name: newest.name, createdAt: newest.created_at as string | undefined } : null;
	});

	return (
		<Panel title="Media" href="/upload" linkLabel="Naar media" isEmpty={!loading && !data} emptyLabel="Nog geen media geüpload.">
			<Moment.List>
				<Moment marker={data?.createdAt ? fmtDayMarker(data.createdAt) : ''} title={data?.name ?? ''} meta="Laatst geüpload" loading={loading} />
			</Moment.List>
		</Panel>
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
		<Panel title="Laatste wijziging" href="/dashboard/logs" linkLabel="Naar logs" isEmpty={!loading && !data} emptyLabel="Nog geen activiteit.">
			<Moment.List>
				<Moment
					marker={data ? new Date(data.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : ''}
					title={data ? labelOf(data) : ''}
					meta={data ? `${humanizeTable(data.table_name)} · ${new Date(data.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}` : undefined}
					loading={loading}
				/>
			</Moment.List>
		</Panel>
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
