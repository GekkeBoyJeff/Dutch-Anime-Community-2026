'use client';

import { Toast } from '@base-ui/react/toast';
import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import Drawer from '@/components/components/Drawer';
import ShiftCalendar, { type ShiftBlock } from '@/components/dashboard/components/ShiftCalendar';
import { fmtRange } from '@/components/dashboard/events/datetime';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import { getBrowserClient } from '@/lib/supabase/client';

interface Shift {
	id: string;
	event_id: string;
	subject_id: string | null;
	starts_at: string;
	ends_at: string;
	station: string | null;
	locked_at: string | null;
}
interface Swap {
	id: string;
	shift_id: string;
	from_subject: string;
	to_subject: string;
	status: string;
}

// The member's read-only shift agenda (blueprint §1e): stand-staff can't reach the manager events editor
// (inventory.manage), so their own shift-week lives here in Mijn spullen. It renders every shift of the
// conventions they're rostered on — inventory.view already grants reading shifts — with their own marked
// `.is-mine`, and lets them offer a shift for swap straight from the block. All mutations go through the
// existing swap plumbing (RLS insert scoped to from_subject = me; apply/cancel via the SECURITY DEFINER
// RPCs), so no schema or policy changes are involved.
const MemberShiftAgenda = ({ session }: { session: Session }) => {
	const toast = Toast.useToastManager();
	const [subjectId, setSubjectId] = useState<string | null>(null);
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [swaps, setSwaps] = useState<Swap[]>([]);
	const [names, setNames] = useState<Map<string, string>>(new Map());
	const [eventNames, setEventNames] = useState<Map<string, string>>(new Map());
	const [ready, setReady] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);
	const [selected, setSelected] = useState<Shift | null>(null);
	const [offerTo, setOfferTo] = useState('');

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		(async () => {
			const { data: mySubject } = await db.rpc('my_subject_id');
			if (!active) return;
			setSubjectId((mySubject as string) ?? null);
			if (!mySubject) {
				setReady(true);
				return;
			}
			// The conventions I'm rostered on, then every shift of those conventions (colleagues included).
			const nowIso = new Date().toISOString();
			const { data: mine } = await db.from('event_shifts').select('event_id').eq('subject_id', mySubject as string).gte('starts_at', nowIso);
			const eventIds = [...new Set((mine ?? []).map((r) => r.event_id))];
			if (eventIds.length === 0) {
				setShifts([]);
				setReady(true);
				return;
			}
			const [shiftRes, nameRes, eventRes] = await Promise.all([
				db.from('event_shifts').select('id, event_id, subject_id, starts_at, ends_at, station, locked_at').in('event_id', eventIds).order('starts_at'),
				db.from('subject_names').select('id, display_name'),
				db.from('events').select('id, name').in('id', eventIds),
			]);
			if (!active) return;
			const shiftRows = (shiftRes.data ?? []) as Shift[];
			setShifts(shiftRows);
			setNames(new Map(((nameRes.data ?? []) as { id: string; display_name: string | null }[]).filter((r) => r.display_name).map((r) => [r.id, r.display_name as string])));
			setEventNames(new Map(((eventRes.data ?? []) as { id: string; name: string }[]).map((r) => [r.id, r.name])));
			const shiftIds = shiftRows.map((s) => s.id);
			if (shiftIds.length > 0) {
				const { data: swapRows } = await db.from('shift_swap_requests').select('id, shift_id, from_subject, to_subject, status').in('shift_id', shiftIds).eq('status', 'pending');
				if (active) setSwaps((swapRows ?? []) as Swap[]);
			}
			setReady(true);
		})();
		return () => {
			active = false;
		};
	}, [session, refreshKey]);

	const nameOf = useCallback((id: string | null): string => (id ? names.get(id) ?? 'Teamlid' : 'Onbezet'), [names]);

	const blocks = useMemo<ShiftBlock[]>(
		() =>
			shifts.map((s) => ({
				id: s.id,
				start: new Date(s.starts_at),
				end: new Date(s.ends_at),
				title: nameOf(s.subject_id),
				station: s.station,
				isMine: s.subject_id !== null && s.subject_id === subjectId,
				isLocked: s.locked_at !== null,
			})),
		[shifts, subjectId, nameOf],
	);

	const defaultDate = useMemo(() => {
		const mineSoon = shifts.filter((s) => s.subject_id === subjectId).sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1))[0];
		return mineSoon ? new Date(mineSoon.starts_at) : undefined;
	}, [shifts, subjectId]);

	// Colleagues I can offer a shift to: everyone else rostered on the same conventions (name-resolvable).
	const candidates = useMemo(() => {
		const ids = new Set(shifts.map((s) => s.subject_id).filter((id): id is string => id !== null && id !== subjectId));
		return [...ids].map((id) => ({ value: id, label: nameOf(id) })).sort((a, b) => a.label.localeCompare(b.label, 'nl'));
	}, [shifts, subjectId, nameOf]);

	const openShift = useCallback(
		(id: string) => {
			const shift = shifts.find((s) => s.id === id) ?? null;
			setOfferTo('');
			setSelected(shift);
		},
		[shifts],
	);

	const selectedSwaps = useMemo(() => (selected ? swaps.filter((sw) => sw.shift_id === selected.id) : []), [selected, swaps]);
	const isMineSelected = selected !== null && selected.subject_id === subjectId;

	const requestSwap = async () => {
		if (!selected || !offerTo) {
			toast.add({ title: 'Kies eerst een teamlid.', type: 'error' });
			return;
		}
		const { error } = await getBrowserClient().from('shift_swap_requests').insert({ shift_id: selected.id, from_subject: subjectId as string, to_subject: offerTo, created_by: session.user.id });
		if (error) {
			toast.add({ title: 'Ruilverzoek mislukt', description: error.message, type: 'error' });
			return;
		}
		setSelected(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Ruilverzoek verstuurd', type: 'success' });
	};

	const cancelSwap = async (id: string) => {
		const { error } = await getBrowserClient().rpc('cancel_swap', { request_id: id });
		if (error) {
			toast.add({ title: 'Niet geannuleerd', description: error.message, type: 'error' });
			return;
		}
		setSelected(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Ruilverzoek geannuleerd', type: 'success' });
	};

	const acceptSwap = async (id: string) => {
		const { error } = await getBrowserClient().rpc('apply_shift_swap', { request_id: id });
		if (error) {
			toast.add({ title: 'Ruil niet geaccepteerd', description: error.message, type: 'error' });
			return;
		}
		setSelected(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Ruil geaccepteerd', type: 'success' });
	};

	if (ready && subjectId && shifts.length === 0) {
		return <Alert variant="info">Je hebt nog geen shifts ingeroosterd.</Alert>;
	}
	if (ready && !subjectId) return null;

	return (
		<>
			<ShiftCalendar shifts={blocks} editable={false} defaultDate={defaultDate} onSelect={openShift} loading={!ready} />

			<Drawer open={selected !== null} onOpenChange={(open) => !open && setSelected(null)} title="Shift" size="26rem">
				{selected && (
					<div className="inventory-form">
						<div className="con-block">
							<Title element="h4" size={5} value={eventNames.get(selected.event_id) ?? 'Conventie'} />
							<p className="con-line-main">{fmtRange(selected.starts_at, selected.ends_at)}</p>
							<p className="con-note">
								{nameOf(selected.subject_id)}
								{selected.station ? ` · ${selected.station}` : ''}
							</p>
						</div>

						{selectedSwaps.length > 0 && (
							<div className="con-block">
								<Title element="h5" size={6} value="Ruilverzoeken" />
								<ul className="con-list">
									{selectedSwaps.map((sw) => (
										<li key={sw.id} className="con-line">
											<div className="con-line-info">
												<span className="con-line-main">
													{nameOf(sw.from_subject)} → {nameOf(sw.to_subject)}
												</span>
											</div>
											<div className="con-line-actions">
												<StatusBadge domain="request" status="requested" label="In behandeling" dot />
												{sw.to_subject === subjectId && (
													<Button variant="primary" onClick={() => acceptSwap(sw.id)}>
														Accepteren
													</Button>
												)}
												{sw.from_subject === subjectId && (
													<Button variant="ghost" onClick={() => cancelSwap(sw.id)}>
														Intrekken
													</Button>
												)}
											</div>
										</li>
									))}
								</ul>
							</div>
						)}

						{isMineSelected && selected.locked_at === null && (
							<div className="con-block">
								<Title element="h5" size={6} value="Ruil je shift" />
								{candidates.length === 0 ? (
									<p className="con-note">Er zijn geen andere teamleden op deze conventie om aan te bieden.</p>
								) : (
									<>
										<Field name="offer-to">
											<Field.Label>Bied aan aan</Field.Label>
											<Select native aria-label="Teamlid" value={offerTo} options={[{ value: '', label: 'Kies teamlid' }, ...candidates]} onValueChange={(v) => setOfferTo(v as string)} />
										</Field>
										<Button variant="primary" icon="swap" onClick={requestSwap}>
											Ruilverzoek versturen
										</Button>
									</>
								)}
							</div>
						)}
					</div>
				)}
			</Drawer>
		</>
	);
};

export default MemberShiftAgenda;
