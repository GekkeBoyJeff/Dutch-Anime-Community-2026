'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import { fmtRange, fromInput, toInput } from '@/app/(admin)/dashboard/events/_components/datetime';
import Button from '@/components/basics/Button';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Enums } from '@/types/database.types';

type ItemOption = { id: string; name: string };
type SubjectName = { id: string; display_name: string };
type Activity = { id: string; venue: string; title: string; description: string | null; starts_at: string | null; ends_at: string | null };
type Requirement = { id: string; activity_id: string; item_id: string | null; label: string | null; quantity: number };
type Host = { id: string; activity_id: string; subject_id: string };
type ActivityForm = { id?: string; venue: string; title: string; description: string; starts_at: string; ends_at: string };

type ActivitiesTabProps = {
	eventId: string;
	sessionUserId: string;
	items: ItemOption[];
	// Team-only host choice list (team_candidates RPC); existing non-team hosts still render via subjectName.
	candidates: SubjectName[];
	subjectName: (id: string | null) => string;
};

const VENUE_OPTIONS = [
	{ value: 'stand', label: 'Stand' },
	{ value: 'booth', label: 'Booth' },
	{ value: 'stage', label: 'Podium' },
	{ value: 'other', label: 'Overig' },
];
const VENUE_LABEL: Record<string, string> = { stand: 'Stand', booth: 'Booth', stage: 'Podium', other: 'Overig' };
const EMPTY_ACTIVITY: ActivityForm = { venue: 'stand', title: '', description: '', starts_at: '', ends_at: '' };

// Activiteiten-tab: gehoste activiteiten (CRUD) met per activiteit benodigdheden (inventory-item óf
// vrije tekst) en hosts. Benodigdheden/hosts bewerk je in de detail-drawer van een bestaande activiteit.
const ActivitiesTab = ({ eventId, sessionUserId, items, candidates, subjectName }: ActivitiesTabProps) => {
	const toast = Toast.useToastManager();
	const [activities, setActivities] = useState<Activity[]>([]);
	const [requirements, setRequirements] = useState<Requirement[]>([]);
	const [hosts, setHosts] = useState<Host[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<ActivityForm | null>(null);
	const [reqItem, setReqItem] = useState('');
	const [reqLabel, setReqLabel] = useState('');
	const [reqQty, setReqQty] = useState('1');
	const [newHost, setNewHost] = useState('');

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		db.from('event_activities')
			.select('*')
			.eq('event_id', eventId)
			.order('starts_at', { nullsFirst: false })
			.then(async ({ data: actRows }) => {
				if (!active) return;
				const list = (actRows ?? []) as Activity[];
				setActivities(list);
				const ids = list.map((a) => a.id);
				if (ids.length) {
					const [{ data: reqRows }, { data: hostRows }] = await Promise.all([
						db.from('activity_requirements').select('id, activity_id, item_id, label, quantity').in('activity_id', ids),
						db.from('activity_hosts').select('id, activity_id, subject_id').in('activity_id', ids),
					]);
					if (active) {
						setRequirements((reqRows ?? []) as Requirement[]);
						setHosts((hostRows ?? []) as Host[]);
					}
				} else if (active) {
					setRequirements([]);
					setHosts([]);
				}
			});
		return () => {
			active = false;
		};
	}, [eventId, refreshKey]);

	const activityRows = useMemo(() => [...activities], [activities]);
	const itemName = (id: string | null): string => (id ? items.find((i) => i.id === id)?.name ?? id.slice(0, 8) : '');

	const saveActivity = async () => {
		if (!form) return;
		if (!form.title.trim()) {
			toast.add({ title: 'Titel is verplicht.', type: 'error' });
			return;
		}
		const payload = {
			...(form.id ? { id: form.id } : {}),
			event_id: eventId,
			venue: form.venue as Enums<'activity_venue'>,
			title: form.title.trim(),
			description: form.description.trim() || null,
			starts_at: fromInput(form.starts_at),
			ends_at: fromInput(form.ends_at),
			created_by: sessionUserId,
		};
		const { data, error } = await getBrowserClient().from('event_activities').upsert(payload).select('id').maybeSingle();
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		// Houd de drawer open op een net-aangemaakte activiteit zodat je meteen benodigdheden/hosts kunt toevoegen.
		if (!form.id && data?.id) setForm({ ...form, id: data.id as string });
		toast.add({ title: 'Activiteit opgeslagen', type: 'success' });
	};

	const deleteActivity = async (id: string) => {
		const { error } = await getBrowserClient().from('event_activities').delete().eq('id', id);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setForm(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Activiteit verwijderd', type: 'success' });
	};

	const addRequirement = async (activityId: string) => {
		if (!reqItem && !reqLabel.trim()) {
			toast.add({ title: 'Kies een item of vul een omschrijving in.', type: 'error' });
			return;
		}
		const { error } = await getBrowserClient().from('activity_requirements').insert({
			activity_id: activityId,
			item_id: reqItem || null,
			label: reqItem ? null : reqLabel.trim(),
			quantity: Number(reqQty) || 1,
		});
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setReqItem('');
		setReqLabel('');
		setReqQty('1');
		setRefreshKey((k) => k + 1);
	};

	const removeRequirement = async (id: string) => {
		const { error } = await getBrowserClient().from('activity_requirements').delete().eq('id', id);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
	};

	const addHost = async (activityId: string) => {
		if (!newHost) return;
		const { error } = await getBrowserClient().from('activity_hosts').insert({ activity_id: activityId, subject_id: newHost });
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setNewHost('');
		setRefreshKey((k) => k + 1);
	};

	const removeHost = async (id: string) => {
		const { error } = await getBrowserClient().from('activity_hosts').delete().eq('id', id);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
	};

	const columns: DataTableColumn<Activity>[] = [
		{ key: 'title', header: 'Titel', sortable: true, sortValue: (a) => a.title, cell: (a) => a.title },
		{ key: 'venue', header: 'Waar', cell: (a) => VENUE_LABEL[a.venue] ?? a.venue },
		{ key: 'time', header: 'Tijd', cell: (a) => fmtRange(a.starts_at, a.ends_at) },
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (a) => (
				<span className="inventory-row-actions">
					<Button
						variant="secondary"
						onClick={() => setForm({ id: a.id, venue: a.venue, title: a.title, description: a.description ?? '', starts_at: toInput(a.starts_at), ends_at: toInput(a.ends_at) })}
					>
						Bewerk
					</Button>
					<Button variant="ghost" icon="trash" onClick={() => deleteActivity(a.id)}>
						Verwijder
					</Button>
				</span>
			),
		},
	];

	const activityReqs = form?.id ? requirements.filter((r) => r.activity_id === form.id) : [];
	const activityHosts = form?.id ? hosts.filter((h) => h.activity_id === form.id) : [];
	const availableHosts = candidates.filter((s) => !activityHosts.some((h) => h.subject_id === s.id));

	return (
		<div className="inventory-tab">
			<div className="inventory-toolbar">
				<Title size={5}>Activiteiten</Title>
				<Button variant="primary" icon="plus" onClick={() => setForm({ ...EMPTY_ACTIVITY })}>
					Nieuwe activiteit
				</Button>
			</div>
			<DataTable columns={columns} data={activityRows} empty={{ title: 'Nog geen activiteiten', description: 'Voeg gehoste activiteiten toe.' }} />

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title={form?.id ? 'Activiteit bewerken' : 'Nieuwe activiteit'}
				size="32rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Sluiten
						</Button>
						<Button variant="primary" onClick={saveActivity}>
							Opslaan
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="title">
							<Field.Label>Titel</Field.Label>
							<TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
						</Field>
						<Field name="venue">
							<Field.Label>Waar</Field.Label>
							<Select native aria-label="Waar" value={form.venue} options={VENUE_OPTIONS} onValueChange={(v) => setForm({ ...form, venue: v as string })} />
						</Field>
						<Field name="starts">
							<Field.Label>Start</Field.Label>
							<TextInput type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.currentTarget.value })} />
						</Field>
						<Field name="ends">
							<Field.Label>Eind</Field.Label>
							<TextInput type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.currentTarget.value })} />
						</Field>
						<Field name="description">
							<Field.Label>Omschrijving</Field.Label>
							<TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
						</Field>

						{form.id ? (
							<>
								<div className="con-block">
									<Title element="h4" size={6} value="Benodigdheden" />
									<ul className="con-list">
										{activityReqs.map((r) => (
											<li key={r.id} className="con-line">
												<span className="con-line-main">
													{(r.item_id ? itemName(r.item_id) : r.label) ?? '—'} × {r.quantity}
												</span>
												<Button variant="ghost" icon="trash" onClick={() => removeRequirement(r.id)}>
													Verwijder
												</Button>
											</li>
										))}
									</ul>
									<div className="inventory-toolbar">
										<Select
											native
											aria-label="Item"
											value={reqItem}
											options={[{ value: '', label: 'Vrije tekst…' }, ...items.map((i) => ({ value: i.id, label: i.name }))]}
											onValueChange={(v) => setReqItem(v as string)}
										/>
										{!reqItem && <TextInput placeholder="Omschrijving" value={reqLabel} onChange={(e) => setReqLabel(e.currentTarget.value)} />}
										<TextInput type="number" value={reqQty} onChange={(e) => setReqQty(e.currentTarget.value)} />
										<Button variant="secondary" onClick={() => addRequirement(form.id as string)}>
											Toevoegen
										</Button>
									</div>
								</div>

								<div className="con-block">
									<Title element="h4" size={6} value="Hosts" />
									<ul className="con-list">
										{activityHosts.map((h) => (
											<li key={h.id} className="con-line">
												<span className="con-line-main">{subjectName(h.subject_id)}</span>
												<Button variant="ghost" icon="trash" onClick={() => removeHost(h.id)}>
													Verwijder
												</Button>
											</li>
										))}
									</ul>
									<div className="inventory-toolbar">
										<Select
											native
											aria-label="Host toevoegen"
											value={newHost}
											options={[{ value: '', label: 'Kies persoon…' }, ...availableHosts.map((s) => ({ value: s.id, label: s.display_name }))]}
											onValueChange={(v) => setNewHost(v as string)}
										/>
										<Button variant="secondary" onClick={() => addHost(form.id as string)} disabled={!newHost}>
											Toevoegen
										</Button>
									</div>
								</div>
							</>
						) : (
							<p className="con-note">Sla de activiteit eerst op om benodigdheden en hosts toe te voegen.</p>
						)}
					</div>
				)}
			</Drawer>
		</div>
	);
};

export default ActivitiesTab;
