'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState, type ReactNode } from 'react';

import Alert from '@/components/basics/Alert';
import Breadcrumb from '@/components/basics/Breadcrumb';
import Button from '@/components/basics/Button';
import Skeleton from '@/components/basics/Skeleton';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import DetailTabs from '@/components/components/DetailTabs';
import Entry from '@/components/components/Entry';
import BadgesTab from '@/components/dashboard/moderation/BadgesTab';
import BansTab from '@/components/dashboard/moderation/BansTab';
import BetrokkenenPanel, { type BetrokkenenPeer, type BetrokkenenShift } from '@/components/dashboard/moderation/BetrokkenenPanel';
import LinksTab from '@/components/dashboard/moderation/LinksTab';
import NotesTab from '@/components/dashboard/moderation/NotesTab';
import TicketsTab from '@/components/dashboard/moderation/TicketsTab';
import WarningsTab from '@/components/dashboard/moderation/WarningsTab';
import DonationNotesContainer from '@/components/dashboard/shell/DonationNotesContainer';
import ProfileFieldsContainer from '@/components/dashboard/shell/ProfileFieldsContainer';
import { formatDate } from '@/lib/formatDate';
import { type Alias, type ConductNote, type Subject } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean; canDelete: boolean; canBadges: boolean; canEditProfile: boolean; onBack: () => void };
interface AttendanceRow {
	id: string;
	event_id: string;
	status: string;
}
interface ActivityRow {
	id: number;
	kind: string;
	summary: string | null;
	created_at: string;
}

// A stacked profile section: a consistent eyebrow header over its content, so the tabs' stacked blocks
// read as one rhythm instead of ad-hoc size-5 titles.
const Section = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="mod-section">
		<h4 className="mod-section-title">{title}</h4>
		{children}
	</section>
);

const ProfileDetail = ({ subjectId, sessionUserId, canManage, canDelete, canBadges, canEditProfile, onBack }: Props) => {
	const toast = Toast.useToastManager();
	const [subject, setSubject] = useState<Subject | null>(null);
	const [display, setDisplay] = useState('');
	const [aliases, setAliases] = useState<Alias[]>([]);
	const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
	const [eventNames, setEventNames] = useState<Map<string, string>>(new Map());
	const [shifts, setShifts] = useState<BetrokkenenShift[]>([]);
	const [peers, setPeers] = useState<BetrokkenenPeer[]>([]);
	const [conduct, setConduct] = useState<ConductNote[]>([]);
	const [activity, setActivity] = useState<ActivityRow[]>([]);
	const [loaded, setLoaded] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('mod_subjects').select('id, discord_id, discord_name, user_id, merged_into, created_at').eq('id', subjectId).maybeSingle(),
			db.from('subject_names').select('id, display_name').eq('id', subjectId).maybeSingle(),
			db.from('mod_subject_aliases').select('id, alias, kind, source, last_seen').eq('subject_id', subjectId).order('last_seen', { ascending: false }),
			db.from('event_attendance').select('id, event_id, status').eq('subject_id', subjectId),
			db.from('events').select('id, name'),
			db.from('conduct_notes').select('id, kind, body, event_id, created_at').eq('subject_id', subjectId).order('created_at', { ascending: false }),
			db.from('activity_log').select('id, kind, summary, created_at').eq('subject_id', subjectId).order('created_at', { ascending: false }).limit(100),
			db.from('event_shifts').select('id, event_id, starts_at, station').eq('subject_id', subjectId).order('starts_at', { ascending: false }).limit(8),
			db.from('ticket_participants').select('ticket_id').eq('subject_id', subjectId),
		]).then(async (res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon profiel niet laden', description: failed.message, type: 'error' });
				setLoaded(true);
				return;
			}
			const [{ data: subj }, { data: name }, { data: aliasRows }, { data: att }, { data: events }, { data: conductRows }, { data: activityRows }, { data: shiftRows }, { data: myTickets }] = res;
			const s = (subj ?? null) as Subject | null;
			setSubject(s);
			setDisplay((name?.display_name as string) ?? s?.discord_name ?? s?.discord_id ?? subjectId.slice(0, 8));
			setAliases((aliasRows ?? []) as Alias[]);
			setAttendance((att ?? []) as AttendanceRow[]);
			const eventNameMap = new Map((events ?? []).map((e) => [e.id as string, e.name as string]));
			setEventNames(eventNameMap);
			setConduct((conductRows ?? []) as ConductNote[]);
			setActivity((activityRows ?? []) as ActivityRow[]);
			setShifts(
				((shiftRows ?? []) as { id: string; event_id: string; starts_at: string; station: string | null }[]).map((sh) => ({
					id: sh.id,
					eventId: sh.event_id,
					eventName: eventNameMap.get(sh.event_id) ?? sh.event_id.slice(0, 8),
					startsAt: sh.starts_at,
					station: sh.station,
				})),
			);

			// Shared-ticket peers: the other participants of every ticket this person is in, folded to one row
			// per peer with a shared-ticket count. A second read (needs the ticket ids first); RLS scopes it.
			const ticketIds = ((myTickets ?? []) as { ticket_id: string }[]).map((t) => t.ticket_id);
			if (ticketIds.length > 0) {
				const { data: coRows } = await db.from('ticket_participants').select('ticket_id, subject_id, name, discord_id').in('ticket_id', ticketIds).neq('subject_id', subjectId);
				if (!active) return;
				const byPeer = new Map<string, BetrokkenenPeer>();
				for (const row of (coRows ?? []) as { ticket_id: string; subject_id: string | null; name: string | null; discord_id: string }[]) {
					const key = row.subject_id ?? `d:${row.discord_id}`;
					const existing = byPeer.get(key);
					if (existing) existing.tickets += 1;
					else byPeer.set(key, { subjectId: row.subject_id, name: row.name ?? row.discord_id, tickets: 1 });
				}
				setPeers([...byPeer.values()].sort((a, b) => b.tickets - a.tickets));
			} else {
				setPeers([]);
			}
			setLoaded(true);
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectId, refreshKey]);

	const unmerge = async () => {
		const { error } = await getBrowserClient().rpc('unmerge_subject', { p_id: subjectId });
		if (error) {
			toast.add({ title: 'Loskoppelen mislukt', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Profiel losgekoppeld', type: 'success' });
	};

	const crumbs = [
		{ label: 'Dashboard', url: '/dashboard' },
		{ label: 'Moderatie', url: '/dashboard/moderation' },
		{ label: display || 'Profiel' },
	];

	if (!loaded) {
		return (
			<div aria-hidden="true">
				<Breadcrumb items={crumbs} />
				<div className="profile-head">
					<Skeleton width="14rem" height="2rem" />
					<Skeleton width="6rem" height="1.5rem" radius="full" />
				</div>
				<div className="mod-detail-skeleton">
					{Array.from({ length: 3 }, (_, i) => (
						<section key={i} className="mod-section">
							<Skeleton width="8rem" height="0.85rem" />
							<Skeleton width="100%" height="3rem" radius="m" />
						</section>
					))}
				</div>
			</div>
		);
	}
	if (!subject) {
		return (
			<>
				<Breadcrumb items={crumbs} />
				<Alert variant="error" title="Niet gevonden">Dit profiel bestaat niet of je hebt er geen toegang toe.</Alert>
				<Button variant="secondary" onClick={onBack}>
					Terug
				</Button>
			</>
		);
	}

	const eventName = (id: string): string => eventNames.get(id) ?? id.slice(0, 8);

	const aliasPanel =
		aliases.length === 0 ? (
			<p className="con-note">Geen aliassen.</p>
		) : (
			<Entry.List>
				{aliases.map((a) => (
					<Entry
						key={a.id}
						main={a.alias}
						sub={[a.kind, a.source].filter(Boolean).join(' · ')}
						trailing={<span className="con-note">{formatDate(a.last_seen, { dateStyle: 'medium' }) ?? a.last_seen}</span>}
					/>
				))}
			</Entry.List>
		);

	const attendancePanel =
		attendance.length === 0 ? (
			<p className="con-note">Geen aanwezigheid geregistreerd.</p>
		) : (
			<Entry.List>
				{attendance.map((a) => (
					<Entry key={a.id} main={eventName(a.event_id)} trailing={<StatusBadge domain="attendance" status={a.status} />} />
				))}
			</Entry.List>
		);

	const conductPanel =
		conduct.length === 0 ? (
			<p className="con-note">Geen gedragsnotities.</p>
		) : (
			<Entry.List>
				{conduct.map((c) => (
					<Entry
						key={c.id}
						main={`${c.kind}${c.event_id ? ` · ${eventName(c.event_id)}` : ''}`}
						sub={c.body || undefined}
						trailing={<span className="con-note">{formatDate(c.created_at, { dateStyle: 'medium' }) ?? c.created_at}</span>}
					/>
				))}
			</Entry.List>
		);

	const activityPanel = (
		<ul className="con-list">
			{activity.length === 0 && <li className="con-note">Nog geen activiteit.</li>}
			{activity.map((a) => (
				<li key={a.id} className="con-line">
					<div className="con-line-info">
						<span className="con-line-main">{a.summary ?? a.kind}</span>
						<span className="con-note">{a.kind}</span>
					</div>
					<span className="con-note">{formatDate(a.created_at, { dateStyle: 'medium', timeStyle: 'short' }) ?? a.created_at}</span>
				</li>
			))}
		</ul>
	);

	return (
		<div>
			<Breadcrumb items={crumbs} />
			<div className="profile-head">
				<Title size={2}>{display}</Title>
				<span className="mod-meta">
					<StatusBadge domain="request" status={subject.user_id ? 'active' : 'requested'} label={subject.user_id ? 'Account' : 'Schaduw'} />
					{subject.merged_into && <StatusBadge domain="request" status="cancelled" label="Samengevoegd" />}
					{subject.discord_id && <span className="con-note">{subject.discord_id}</span>}
				</span>
			</div>
			<div className="inventory-row-actions">
				<Button variant="secondary" onClick={onBack}>
					Terug naar lijst
				</Button>
				{canManage && subject.merged_into && (
					<Button variant="ghost" onClick={unmerge}>
						Loskoppelen
					</Button>
				)}
			</div>

			<BetrokkenenPanel
				events={attendance.map((a) => ({ eventId: a.event_id, eventName: eventName(a.event_id), status: a.status }))}
				shifts={shifts}
				peers={peers}
			/>

			<DetailTabs
				label="Profiel"
				// Signalen is the default tab so warnings land first — Team's warnings shortcut relies on this.
				defaultValue={1}
				tabs={[
					{
						label: 'Overzicht',
						panel: (
							<div className="inventory-section">
								{subject.user_id && (
									<>
										<Section title="Profiel">
											<ProfileFieldsContainer userId={subject.user_id} canEdit={canEditProfile} />
										</Section>
										<Section title="Donaties">
											<DonationNotesContainer userId={subject.user_id} canManage={canEditProfile} />
										</Section>
									</>
								)}
								<Section title="Notities">
									<NotesTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} />
								</Section>
								<Section title="Badges">
									<BadgesTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canBadges} />
								</Section>
							</div>
						),
					},
					{
						label: 'Signalen',
						panel: (
							<div className="inventory-section">
								<Section title="Warnings">
									<WarningsTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} canDelete={canDelete} />
								</Section>
								<Section title="Gedrag">{conductPanel}</Section>
								<Section title="Aliassen">{aliasPanel}</Section>
								<Section title="Aanwezigheid">{attendancePanel}</Section>
								<Section title="Activity">{activityPanel}</Section>
							</div>
						),
					},
					{ label: 'Verbindingen', panel: <LinksTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} canDelete={canDelete} /> },
					{ label: 'Acties', panel: <BansTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} /> },
					{ label: 'Tickets', panel: <TicketsTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} canDelete={canDelete} /> },
				]}
			/>
		</div>
	);
};

export default ProfileDetail;
