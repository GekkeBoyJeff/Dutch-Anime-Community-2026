'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useState } from 'react';

import BadgesTab from '@/app/(admin)/dashboard/moderation/_components/BadgesTab';
import BansTab from '@/app/(admin)/dashboard/moderation/_components/BansTab';
import LinksTab from '@/app/(admin)/dashboard/moderation/_components/LinksTab';
import NotesTab from '@/app/(admin)/dashboard/moderation/_components/NotesTab';
import WarningsTab from '@/app/(admin)/dashboard/moderation/_components/WarningsTab';
import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Spinner from '@/components/basics/Spinner';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import DetailTabs from '@/components/components/DetailTabs';
import { formatDate } from '@/lib/formatDate';
import { type Alias, type ConductNote, type Subject } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean; canDelete: boolean; canBadges: boolean; onBack: () => void };
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

const ProfileDetail = ({ subjectId, sessionUserId, canManage, canDelete, canBadges, onBack }: Props) => {
	const toast = Toast.useToastManager();
	const [subject, setSubject] = useState<Subject | null>(null);
	const [display, setDisplay] = useState('');
	const [aliases, setAliases] = useState<Alias[]>([]);
	const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
	const [eventNames, setEventNames] = useState<Map<string, string>>(new Map());
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
		]).then((res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon profiel niet laden', description: failed.message, type: 'error' });
				setLoaded(true);
				return;
			}
			const [{ data: subj }, { data: name }, { data: aliasRows }, { data: att }, { data: events }, { data: conductRows }, { data: activityRows }] = res;
			const s = (subj ?? null) as Subject | null;
			setSubject(s);
			setDisplay((name?.display_name as string) ?? s?.discord_name ?? s?.discord_id ?? subjectId.slice(0, 8));
			setAliases((aliasRows ?? []) as Alias[]);
			setAttendance((att ?? []) as AttendanceRow[]);
			setEventNames(new Map((events ?? []).map((e) => [e.id as string, e.name as string])));
			setConduct((conductRows ?? []) as ConductNote[]);
			setActivity((activityRows ?? []) as ActivityRow[]);
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

	if (!loaded) return <Spinner label="Profiel laden" />;
	if (!subject) {
		return (
			<>
				<Alert variant="error" title="Niet gevonden">Dit profiel bestaat niet of je hebt er geen toegang toe.</Alert>
				<Button variant="secondary" onClick={onBack}>
					Terug
				</Button>
			</>
		);
	}

	const eventName = (id: string): string => eventNames.get(id) ?? id.slice(0, 8);

	const aliasPanel = (
		<ul className="con-list">
			{aliases.length === 0 && <li className="con-note">Geen aliassen.</li>}
			{aliases.map((a) => (
				<li key={a.id} className="con-line">
					<div className="con-line-info">
						<span className="con-line-main">{a.alias}</span>
						<span className="con-note">{[a.kind, a.source].filter(Boolean).join(' · ')}</span>
					</div>
					<span className="con-note">{formatDate(a.last_seen, { dateStyle: 'medium' }) ?? a.last_seen}</span>
				</li>
			))}
		</ul>
	);

	const attendancePanel = (
		<ul className="con-list">
			{attendance.length === 0 && <li className="con-note">Geen aanwezigheid geregistreerd.</li>}
			{attendance.map((a) => (
				<li key={a.id} className="con-line">
					<span className="con-line-main">{eventName(a.event_id)}</span>
					<StatusBadge domain="attendance" status={a.status} />
				</li>
			))}
		</ul>
	);

	const conductPanel = (
		<ul className="con-list">
			{conduct.length === 0 && <li className="con-note">Geen gedragsnotities.</li>}
			{conduct.map((c) => (
				<li key={c.id} className="con-line">
					<div className="con-line-info">
						<span className="con-line-main">{c.kind}{c.event_id ? ` · ${eventName(c.event_id)}` : ''}</span>
						{c.body && <span className="con-note">{c.body}</span>}
					</div>
					<span className="con-note">{formatDate(c.created_at, { dateStyle: 'medium' }) ?? c.created_at}</span>
				</li>
			))}
		</ul>
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

			<DetailTabs
				label="Profiel"
				tabs={[
					{ label: 'Warnings', panel: <WarningsTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} canDelete={canDelete} /> },
					{ label: 'Notities', panel: <NotesTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} /> },
					{ label: 'Links', panel: <LinksTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} canDelete={canDelete} /> },
					{ label: 'Bans', panel: <BansTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canManage} /> },
					{ label: 'Badges', panel: <BadgesTab subjectId={subjectId} sessionUserId={sessionUserId} canManage={canBadges} /> },
					{ label: 'Gedrag', panel: conductPanel },
					{ label: 'Aliassen', panel: aliasPanel },
					{ label: 'Aanwezigheid', panel: attendancePanel },
					{ label: 'Activity', panel: activityPanel },
				]}
			/>
		</div>
	);
};

export default ProfileDetail;
