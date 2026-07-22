'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Skeleton from '@/components/basics/Skeleton';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import Drawer from '@/components/components/Drawer';
import Entry from '@/components/components/Entry';
import Switch from '@/components/components/Switch';
import ConventionInvolvementCard from '@/components/dashboard/components/ConventionInvolvementCard';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import DataTableSkeleton, { rememberRowCount } from '@/components/dashboard/components/DataTableSkeleton';
import { fmtRange } from '@/components/dashboard/events/datetime';
import MemberShiftAgenda from '@/components/dashboard/my-inventory/MemberShiftAgenda';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

interface Item {
	id: string;
	name: string;
	quantity: number;
	value_eur: number | null;
	available: boolean;
	notes: string | null;
}
interface Assignment {
	id: string;
	event_id: string;
	item_id: string;
	quantity: number;
	expected_to_bring: boolean;
	notes: string | null;
	packed_at: string | null;
}
interface Shift {
	id: string;
	event_id: string;
	starts_at: string;
	ends_at: string;
	station: string | null;
}
interface Ticket {
	id: string;
	event_id: string;
	day: string | null;
	quantity: number;
	ticket_pdf_path: string | null;
	note: string | null;
}
interface OwnItemForm {
	name: string;
	quantity: string;
	value_eur: string;
	notes: string;
}
interface UnavailWindow {
	id: string;
	item_id: string;
	starts_on: string;
	ends_on: string | null;
	reason: string | null;
	status: string;
}

const EMPTY_OWN: OwnItemForm = { name: '', quantity: '1', value_eur: '', notes: '' };
const TICKET_DEFAULT_NOTE = 'Wordt per bandje op de dag zelf geregeld.';

// Mirrors the items table's columns so the loading placeholder reserves the same table shape.
const ITEM_SKELETON_COLUMNS = [{ header: 'Naam' }, { header: 'Aantal', align: 'center' as const }, { header: 'Waarde', align: 'end' as const }, { header: 'Beschikbaar', align: 'center' as const }, { header: '', align: 'end' as const }];

// Card-shaped placeholder for the "Aankomende conventies" grid while assignments/tickets/shifts load.
const ConGroupsSkeleton = () => (
	<div className="con-groups" aria-hidden="true">
		{[0, 1].map((i) => (
			<article key={i} className="con-group">
				<Skeleton width="50%" height="1.1rem" />
				<Skeleton width="100%" height="4.5rem" radius="m" />
			</article>
		))}
	</div>
);

// The personal view for stand-staff / any member granted inventory.view: manage YOUR OWN items
// (add + toggle availability), and see per convention what you must bring and which tickets you hold —
// grouped by convention (mobile-first) so it's the kernel of the later "Mijn conventie"-page.
const MyInventory = () => {
	const { ready, fallback, session } = useDashboardGuard('inventory.view', { className: 'inventory', label: 'Laden' });

	const [items, setItems] = useState<Item[] | null>(null);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [eventNames, setEventNames] = useState<Map<string, string>>(new Map());
	const [itemNames, setItemNames] = useState<Map<string, string>>(new Map());
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [windows, setWindows] = useState<UnavailWindow[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [ownForm, setOwnForm] = useState<OwnItemForm | null>(null);
	const [unavailFor, setUnavailFor] = useState<Item | null>(null);
	const [uStart, setUStart] = useState('');
	const [uEnd, setUEnd] = useState('');
	const [uReason, setUReason] = useState('');
	const toast = Toast.useToastManager();

	const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		// Explicitly scope to the current user: a manager's RLS would otherwise return ALL rows here,
		// making "mijn items/toewijzingen/tickets" show everyone's.
		Promise.all([
			db.from('inventory_items').select('*').eq('owner_user_id', session.user.id).is('archived_at', null).order('name'),
			db.from('event_item_assignments').select('*').eq('assigned_user_id', session.user.id),
			db.from('event_tickets').select('*').eq('assigned_user_id', session.user.id).order('day'),
			db.from('events').select('id, name'),
			db.rpc('my_subject_id'),
			db.rpc('my_assignment_item_names'),
		]).then(async (res) => {
			if (!active) return;
			// Fout niet stil inslikken tot een misleidend lege lijst — toon 'm.
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon je inventory niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: itemRows }, { data: assignRows }, { data: ticketRows }, { data: eventRows }, { data: subjectId }, { data: nameRows }] = res;
			const ownItems = (itemRows ?? []) as Item[];
			setItems(ownItems);
			rememberRowCount('my-inventory-items', ownItems.length);
			setAssignments((assignRows ?? []) as Assignment[]);
			setTickets((ticketRows ?? []) as Ticket[]);
			setEventNames(new Map((eventRows ?? []).map((e) => [e.id as string, e.name as string])));
			setItemNames(new Map(((nameRows ?? []) as { item_id: string; name: string }[]).map((r) => [r.item_id, r.name])));
			// Eigen onbeschikbaarheidsvensters — RLS geeft anders álle vensters terug, dus client-side op eigen items scopen.
			const ownedIds = ownItems.map((i) => i.id);
			if (ownedIds.length > 0) {
				const { data: winRows } = await db
					.from('item_unavailability')
					.select('id, item_id, starts_on, ends_on, reason, status')
					.in('item_id', ownedIds)
					.order('starts_on', { ascending: false });
				if (active) setWindows((winRows ?? []) as UnavailWindow[]);
			} else if (active) {
				setWindows([]);
			}
			if (subjectId) {
				const { data: shiftRows } = await db
					.from('event_shifts')
					.select('id, event_id, starts_at, ends_at, station')
					.eq('subject_id', subjectId as string)
					.order('starts_at');
				if (active) setShifts((shiftRows ?? []) as Shift[]);
			}
		});
		return () => {
			active = false;
		};
	}, [ready, session, refreshKey]);

	const toggleAvailable = async (item: Item) => {
		const { error: err } = await getBrowserClient().from('inventory_items').update({ available: !item.available }).eq('id', item.id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: item.available ? 'Op niet-beschikbaar gezet' : 'Op beschikbaar gezet', type: 'success' });
	};

	const saveOwnItem = async () => {
		if (!ownForm || !session) return;
		if (!ownForm.name.trim()) {
			toast.add({ title: 'Naam is verplicht.', type: 'error' });
			return;
		}
		const { error: err } = await getBrowserClient().from('inventory_items').insert({
			name: ownForm.name.trim(),
			owner_user_id: session.user.id,
			quantity: Number(ownForm.quantity) || 1,
			value_eur: ownForm.value_eur ? Number(ownForm.value_eur) : null,
			available: true,
			notes: ownForm.notes.trim() || null,
			created_by: session.user.id,
		});
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setOwnForm(null);
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Item toegevoegd', type: 'success' });
	};

	const downloadTicket = async (path: string) => {
		const { data, error: err } = await getBrowserClient().storage.from('tickets').createSignedUrl(path, 120);
		if (err || !data) {
			toast.add({ title: 'Kon ticket niet openen', description: err?.message, type: 'error' });
			return;
		}
		window.open(data.signedUrl, '_blank', 'noopener');
	};

	const setPacked = async (assignmentId: string, packed: boolean) => {
		const { error: err } = await getBrowserClient().rpc('set_packed', { assignment_id: assignmentId, packed });
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((key) => key + 1);
	};

	const requestUnavail = async () => {
		if (!unavailFor || !uStart) {
			toast.add({ title: 'Startdatum is verplicht.', type: 'error' });
			return;
		}
		const { data, error: err } = await getBrowserClient().rpc('request_item_unavailability', {
			p_item: unavailFor.id,
			p_starts: uStart,
			p_ends: (uEnd || null) as string,
			p_reason: (uReason.trim() || null) as string,
		});
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		const status = (data as { status?: string } | null)?.status;
		setUnavailFor(null);
		setUStart('');
		setUEnd('');
		setUReason('');
		setRefreshKey((key) => key + 1);
		toast.add({
			title: status === 'requested' ? 'Verzoek naar yakuza gestuurd (er wordt op gerekend)' : 'Op onbeschikbaar gezet',
			type: 'success',
		});
	};

	// Eigen venster intrekken (aanvrager of eigenaar) via de SECURITY DEFINER-RPC — een view-only houder
	// mag de rij zelf niet verwijderen (dat is inventory.manage), dus dit loopt via de RPC.
	const cancelWindow = async (id: string) => {
		const { error: err } = await getBrowserClient().rpc('cancel_own_item_unavailability', { p_id: id });
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Venster ingetrokken', type: 'success' });
	};

	const itemName = (id: string): string => itemNames.get(id) ?? (items ?? []).find((i) => i.id === id)?.name ?? id.slice(0, 8);
	const eventName = (id: string): string => eventNames.get(id) ?? id.slice(0, 8);

	// One card per convention you're involved with — union of the events you must bring items to and the
	// events you hold tickets for.
	const conIds = useMemo(
		() => [...new Set([...assignments.map((a) => a.event_id), ...tickets.map((t) => t.event_id), ...shifts.map((s) => s.event_id)])],
		[assignments, tickets, shifts],
	);

	if (!ready || !session) return fallback;

	const loading = items === null;

	const itemColumns: DataTableColumn<Item>[] = [
		{ key: 'name', header: 'Naam', sortable: true, sortValue: (item) => item.name, cell: (item) => item.name },
		{ key: 'quantity', header: 'Aantal', align: 'center', sortable: true, sortValue: (item) => item.quantity, cell: (item) => String(item.quantity) },
		{
			key: 'value',
			header: 'Waarde',
			align: 'end',
			sortable: true,
			sortValue: (item) => item.value_eur ?? 0,
			cell: (item) => (item.value_eur !== null ? `€ ${item.value_eur.toFixed(2)}` : '—'),
		},
		{
			key: 'available',
			header: 'Beschikbaar',
			align: 'center',
			cell: (item) => {
				const active = windows.some(
					(w) => w.item_id === item.id && w.status === 'active' && w.starts_on <= today && (w.ends_on === null || w.ends_on >= today),
				);
				const requested = windows.some((w) => w.item_id === item.id && w.status === 'requested');
				return (
					<span className="inventory-avail-cell">
						<Switch checked={item.available} aria-label={`${item.name} beschikbaar`} onCheckedChange={() => toggleAvailable(item)} />
						{item.available && active && <StatusBadge domain="request" status="requested" label="Venster actief" />}
						{item.available && !active && requested && <StatusBadge domain="request" status="requested" label="Aangevraagd" dot />}
					</span>
				);
			},
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (item) => (
				<Button variant="ghost" onClick={() => setUnavailFor(item)}>
					Onbeschikbaar melden
				</Button>
			),
		},
	];

	return (
		<Container className="inventory">
			<Title size={2}>Mijn inventory &amp; conventies</Title>

			<section className="inventory-section">
				<div className="inventory-toolbar">
					<Title element="h3" size={4}>Mijn items</Title>
					<Button variant="primary" icon="plus" onClick={() => setOwnForm({ ...EMPTY_OWN })}>
						Nieuw item
					</Button>
				</div>
				{loading ? (
					<DataTableSkeleton columns={ITEM_SKELETON_COLUMNS} storageKey="my-inventory-items" />
				) : (
					<div className="reveal">
						<DataTable columns={itemColumns} data={items} empty={{ title: 'Nog geen items', description: 'Voeg je eerste item toe.' }} />
					</div>
				)}
			</section>

			<section className="inventory-section">
				<Title element="h3" size={4}>Aankomende conventies</Title>
				{loading ? (
					<ConGroupsSkeleton />
				) : conIds.length === 0 ? (
					<Alert variant="info">Je hebt nog geen toewijzingen of tickets voor een conventie.</Alert>
				) : (
					<div className="con-groups reveal">
						{conIds.map((id) => (
							<ConventionInvolvementCard
								key={id}
								eventName={eventName(id)}
								assignments={assignments
									.filter((a) => a.event_id === id)
									.map((a) => ({ id: a.id, name: itemName(a.item_id), quantity: a.quantity, expectedToBring: a.expected_to_bring, notes: a.notes, packed: a.packed_at !== null }))}
								tickets={tickets
									.filter((t) => t.event_id === id)
									.map((t) => ({ id: t.id, day: t.day, quantity: t.quantity, pdfPath: t.ticket_pdf_path, note: t.note ?? TICKET_DEFAULT_NOTE }))}
								shifts={shifts.filter((s) => s.event_id === id).map((s) => ({ id: s.id, time: fmtRange(s.starts_at, s.ends_at), station: s.station }))}
								onTogglePacked={setPacked}
								onDownloadTicket={downloadTicket}
							/>
						))}
					</div>
				)}
			</section>

			<section className="inventory-section" id="shifts">
				<Title element="h3" size={4}>Mijn shifts</Title>
				<MemberShiftAgenda session={session} />
			</section>

			<Drawer
				open={ownForm !== null}
				onOpenChange={(open) => !open && setOwnForm(null)}
				title="Nieuw item"
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setOwnForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={saveOwnItem}>
							Opslaan
						</Button>
					</>
				}
			>
				{ownForm && (
					<div className="inventory-form">
						<Field name="name">
							<Field.Label>Naam</Field.Label>
							<TextInput value={ownForm.name} onChange={(e) => setOwnForm({ ...ownForm, name: e.currentTarget.value })} />
						</Field>
						<Field name="qty">
							<Field.Label>Aantal</Field.Label>
							<TextInput type="number" value={ownForm.quantity} onChange={(e) => setOwnForm({ ...ownForm, quantity: e.currentTarget.value })} />
						</Field>
						<Field name="value">
							<Field.Label>Waarde (€)</Field.Label>
							<TextInput type="number" value={ownForm.value_eur} onChange={(e) => setOwnForm({ ...ownForm, value_eur: e.currentTarget.value })} />
						</Field>
						<Field name="notes">
							<Field.Label>Notities</Field.Label>
							<TextArea value={ownForm.notes} onChange={(e) => setOwnForm({ ...ownForm, notes: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>

			<Drawer
				open={unavailFor !== null}
				onOpenChange={(open) => !open && setUnavailFor(null)}
				title={unavailFor ? `Onbeschikbaar melden — ${unavailFor.name}` : 'Onbeschikbaar melden'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setUnavailFor(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={requestUnavail}>
							Melden
						</Button>
					</>
				}
			>
				{unavailFor && (
					<div className="inventory-form">
						{windows.filter((w) => w.item_id === unavailFor.id).length > 0 && (
							<div className="con-block">
								<Title element="h5" size={6} value="Gemelde vensters" />
								<Entry.List>
									{windows
										.filter((w) => w.item_id === unavailFor.id)
										.map((w) => (
											<Entry
												key={w.id}
												main={`${w.starts_on} – ${w.ends_on ?? 'onbepaald'}`}
												sub={w.reason ?? undefined}
												trailing={
													<>
														<StatusBadge
															domain="request"
															status={w.status === 'active' ? 'active' : w.status === 'requested' ? 'requested' : 'cancelled'}
															label={w.status === 'active' ? 'Actief' : w.status === 'requested' ? 'Aangevraagd' : 'Afgewezen'}
														/>
														{w.status !== 'rejected' && (
															<Button variant="ghost" onClick={() => cancelWindow(w.id)}>
																Intrekken
															</Button>
														)}
													</>
												}
											/>
										))}
								</Entry.List>
							</div>
						)}
						<Field name="ustart">
							<Field.Label>Onbeschikbaar vanaf</Field.Label>
							<TextInput type="date" value={uStart} onChange={(e) => setUStart(e.currentTarget.value)} />
						</Field>
						<Field name="uend">
							<Field.Label>Tot (leeg = onbepaald)</Field.Label>
							<TextInput type="date" value={uEnd} onChange={(e) => setUEnd(e.currentTarget.value)} />
						</Field>
						<Field name="ureason">
							<Field.Label>Reden</Field.Label>
							<TextArea value={uReason} onChange={(e) => setUReason(e.currentTarget.value)} />
						</Field>
					</div>
				)}
			</Drawer>
		</Container>
	);
};

export default MyInventory;
