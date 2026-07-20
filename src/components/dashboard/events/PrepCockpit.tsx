'use client';

import { useEffect, useState } from 'react';

import CountUp from '@/components/basics/CountUp';
import Icon from '@/components/basics/Icon';
import Skeleton from '@/components/basics/Skeleton';
import { formatEur } from '@/lib/expenses/types';
import { getBrowserClient } from '@/lib/supabase/client';

// The prep-cockpit that opens the event editor (blueprint §1e/§3.10): a row of clickable stat tiles per
// tab plus a "wat is nog niet geregeld" checklist, all off data the tabs already own. It runs one summary
// fetch of counts (the tabs fetch full rows lazily; this is the aggregate glance, not a duplicate), and
// reserves its full height with skeleton tiles so resolving in causes no shift.

interface PrepData {
	shiftsTotal: number;
	shiftsFilled: number;
	activities: number;
	itemsTotal: number;
	itemsPacked: number;
	itemsOwnerless: number;
	tickets: number;
	committed: number | null;
}

interface PrepCockpitProps {
	eventId: string;
	/** Attendance count, already loaded by the editor — reused instead of re-queried. */
	attendanceCount: number;
	/** The convention budget, from the editor's event row (null = none set). */
	budget: number | null;
	/** Whether the viewer may read the linked declaraties (expenses.manage); gates the € figure. */
	canReadExpenses: boolean;
	/** Jump the editor to a tab index when a tile is clicked. */
	onJump: (tabIndex: number) => void;
}

// Editor tab order (EventEditor): 0 Info · 1 Aanwezigheid · 2 Agenda · 3 Activiteiten · 4 Kosten ·
// 5 Evaluatie · 6 Items & tickets · 7 Post.
const TAB = { attendance: 1, agenda: 2, activities: 3, costs: 4, items: 6 } as const;

// One stat tile: an eyebrow, a count-up value with an optional total, and a hint. A button so it jumps to
// its tab on click/enter; `flag` tints it when something needs attention (unfilled shifts, over budget).
const Tile = ({ eyebrow, value, total, suffix, hint, icon, flag, onClick }: { eyebrow: string; value: number; total?: number; suffix?: string; hint: string; icon: string; flag?: boolean; onClick: () => void }) => (
	<button type="button" className={`prep-tile${flag ? ' is-flag' : ''}`} onClick={onClick}>
		<span className="prep-tile-icon" aria-hidden="true">
			<Icon name={icon} />
		</span>
		<span className="prep-tile-eyebrow">{eyebrow}</span>
		<span className="prep-tile-value">
			<CountUp value={value} suffix={suffix} />
			{total !== undefined && <span className="prep-tile-total">/{total}</span>}
		</span>
		<span className="prep-tile-hint">{hint}</span>
	</button>
);

// Reserved-height placeholder shown while the editor's event fetch is still in flight, so the cockpit
// occupies its final footprint from first paint (zero CLS).
export const PrepCockpitSkeleton = () => (
	<section className="prep-cockpit" aria-hidden="true">
		<div className="prep-tiles">
			{Array.from({ length: 6 }, (_, i) => (
				<div key={i} className="prep-tile is-skeleton">
					<Skeleton width="4rem" height="0.7rem" />
					<Skeleton width="3rem" height="1.6rem" />
					<Skeleton width="5rem" height="0.7rem" />
				</div>
			))}
		</div>
		<Skeleton width="100%" height="2.5rem" radius="m" />
	</section>
);

const PrepCockpit = ({ eventId, attendanceCount, budget, canReadExpenses, onJump }: PrepCockpitProps) => {
	const [data, setData] = useState<PrepData | null>(null);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('event_shifts').select('id, subject_id').eq('event_id', eventId),
			db.from('event_activities').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
			db.from('event_item_assignments').select('id, assigned_user_id, packed_at').eq('event_id', eventId).eq('expected_to_bring', true),
			db.from('event_tickets').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
			canReadExpenses
				? db.from('expenses').select('amount_eur, status').eq('event_id', eventId).is('archived_at', null)
				: Promise.resolve({ data: null, count: null }),
		]).then(([shifts, activities, items, tickets, expenses]) => {
			if (!active) return;
			const shiftRows = shifts.data ?? [];
			const itemRows = items.data ?? [];
			const committed =
				canReadExpenses && Array.isArray(expenses.data)
					? (expenses.data as { amount_eur: number; status: string }[])
							.filter((e) => e.status === 'approved' || e.status === 'reimbursed')
							.reduce((sum, e) => sum + Number(e.amount_eur), 0)
					: null;
			setData({
				shiftsTotal: shiftRows.length,
				shiftsFilled: shiftRows.filter((s) => s.subject_id !== null).length,
				activities: activities.count ?? 0,
				itemsTotal: itemRows.length,
				itemsPacked: itemRows.filter((i) => i.packed_at !== null).length,
				itemsOwnerless: itemRows.filter((i) => i.assigned_user_id === null).length,
				tickets: tickets.count ?? 0,
				committed,
			});
		});
		return () => {
			active = false;
		};
	}, [eventId, canReadExpenses]);

	if (!data) return <PrepCockpitSkeleton />;

	const shiftsOpen = data.shiftsTotal - data.shiftsFilled;
	const remaining = budget !== null && data.committed !== null ? budget - data.committed : null;
	const overBudget = remaining !== null && remaining < 0;

	// The "nog niet geregeld" checklist: only the gaps show. Each entry deep-links to the tab that fixes it;
	// when the list is empty the convention reads as prep-complete.
	const gaps: { label: string; tab: number }[] = [];
	if (attendanceCount === 0) gaps.push({ label: 'Nog geen aanwezigheid geregistreerd', tab: TAB.attendance });
	if (data.shiftsTotal === 0) gaps.push({ label: 'Nog geen shifts ingepland', tab: TAB.agenda });
	else if (shiftsOpen > 0) gaps.push({ label: `${shiftsOpen} ${shiftsOpen === 1 ? 'shift' : 'shifts'} nog onbezet`, tab: TAB.agenda });
	if (data.itemsOwnerless > 0) gaps.push({ label: `${data.itemsOwnerless} ${data.itemsOwnerless === 1 ? 'item' : 'items'} zonder eigenaar`, tab: TAB.items });
	if (data.tickets === 0) gaps.push({ label: 'Nog geen tickets toegevoegd', tab: TAB.items });
	if (budget === null) gaps.push({ label: 'Nog geen budget ingesteld', tab: TAB.costs });
	else if (overBudget) gaps.push({ label: 'Boven budget', tab: TAB.costs });

	return (
		<section className="prep-cockpit reveal" aria-label="Voorbereiding">
			<div className="prep-tiles">
				<Tile eyebrow="Aanwezigen" icon="users" value={attendanceCount} hint="ingeschreven" onClick={() => onJump(TAB.attendance)} />
				<Tile eyebrow="Shifts" icon="calendar" value={data.shiftsFilled} total={data.shiftsTotal} hint="bezet" flag={shiftsOpen > 0} onClick={() => onJump(TAB.agenda)} />
				<Tile eyebrow="Activiteiten" icon="star" value={data.activities} hint="gepland" onClick={() => onJump(TAB.activities)} />
				<Tile eyebrow="Ingepakt" icon="list" value={data.itemsPacked} total={data.itemsTotal} hint={data.itemsOwnerless > 0 ? `${data.itemsOwnerless} zonder eigenaar` : 'toegewezen'} flag={data.itemsOwnerless > 0} onClick={() => onJump(TAB.items)} />
				<Tile eyebrow="Tickets" icon="file" value={data.tickets} hint="toegevoegd" flag={data.tickets === 0} onClick={() => onJump(TAB.items)} />
				{canReadExpenses && (
					<Tile
						eyebrow="Besteed"
						icon="file"
						value={Math.round(data.committed ?? 0)}
						suffix="€"
						hint={budget !== null ? `van ${formatEur(budget)}` : 'geen budget'}
						flag={overBudget}
						onClick={() => onJump(TAB.costs)}
					/>
				)}
			</div>

			{gaps.length > 0 ? (
				<ul className="prep-checklist">
					{gaps.map((gap) => (
						<li key={gap.label}>
							<button type="button" className="prep-checklist-item" onClick={() => onJump(gap.tab)}>
								<Icon name="warning" className="prep-checklist-icon" />
								<span>{gap.label}</span>
								<Icon name="arrow-right" className="prep-checklist-arrow" />
							</button>
						</li>
					))}
				</ul>
			) : (
				<p className="prep-checklist is-done">
					<Icon name="check" className="prep-checklist-icon" />
					Alles geregeld — deze conventie staat klaar.
				</p>
			)}
		</section>
	);
};

export default PrepCockpit;
