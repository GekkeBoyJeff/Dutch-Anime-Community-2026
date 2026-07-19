'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NotificationsList from '@/app/(admin)/account/_components/NotificationsList';
import PushToggle from '@/app/(admin)/account/_components/PushToggle';
import DonationNotes from '@/app/(admin)/dashboard/_components/DonationNotes';
import ProfileFieldsForm from '@/app/(admin)/dashboard/_components/ProfileFieldsForm';
import Avatar from '@/components/basics/Avatar';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import { APP_ROLES, highestRole, signOut, usePermissions, type AppRole } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

interface MyWarning {
	color: string;
	reason: string;
	issued_at: string;
}
interface MyBadge {
	title: string;
	description: string | null;
	awarded_on: string;
	image_path: string | null;
}
interface OpenSurvey {
	survey_id: string;
	title: string;
}
interface HistorySurvey {
	survey_id: string;
	title: string;
	submitted_at: string;
}
interface DiscordProfile {
	username: string | null;
	global_name: string | null;
	guild_nick: string | null;
	discord_id: string | null;
	guild_roles: string[] | null;
	guild_joined_at: string | null;
	avatar_url: string | null;
}

// Standteam en hoger zien de bewerkbare organisatievelden (bedoeld voor latere publieke surfacing).
const isStaffRole = (role: AppRole | null): boolean => role != null && APP_ROLES.indexOf(role) >= APP_ROLES.indexOf('stand-staff');

// "Mijn profiel" — het account-home binnen de dashboard-chrome. Iedere ingelogde gebruiker ziet z'n
// Discord-blok, signalen, enquêtes, meldingen en donaties; standteam+ ziet daarnaast het bewerkbare
// organisatieprofiel. Alle self-queries zijn RLS-/RPC-afgeschermd op de eigen rijen.
const ProfilePanel = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();
	const [role, setRole] = useState<AppRole | null>(null);
	const [discord, setDiscord] = useState<DiscordProfile | null>(null);
	const [warnings, setWarnings] = useState<MyWarning[]>([]);
	const [badges, setBadges] = useState<MyBadge[]>([]);
	const [openSurveys, setOpenSurveys] = useState<OpenSurvey[]>([]);
	const [surveyHistory, setSurveyHistory] = useState<HistorySurvey[]>([]);

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace('/login?next=/account');
			return;
		}
		const db = getBrowserClient();
		db.from('profiles')
			.select('username, global_name, guild_nick, discord_id, guild_roles, guild_joined_at, avatar_url')
			.eq('id', session.user.id)
			.maybeSingle()
			.then(({ data }) => setDiscord((data ?? null) as DiscordProfile | null));
		db.from('user_roles')
			.select('role')
			.eq('user_id', session.user.id)
			.then(({ data }) => setRole(highestRole((data ?? []).map((r) => r.role as AppRole))));
		db.rpc('my_warnings').then(({ data }) => setWarnings((data ?? []) as MyWarning[]));
		db.rpc('my_badges').then(({ data }) => setBadges((data ?? []) as MyBadge[]));
		db.rpc('my_open_surveys').then(({ data }) => setOpenSurveys((data ?? []) as OpenSurvey[]));
		db.rpc('my_survey_history').then(({ data }) => setSurveyHistory((data ?? []) as HistorySurvey[]));
	}, [loading, session, router]);

	const badgeUrl = (path: string): string => getBrowserClient().storage.from('badges').getPublicUrl(path).data.publicUrl;

	if (loading || !session) {
		return (
			<Container className="inventory">
				<Spinner label="Profiel laden" />
			</Container>
		);
	}

	const displayName = discord?.guild_nick || discord?.global_name || discord?.username || session.user.email || 'gebruiker';
	const roleCount = discord?.guild_roles?.length ?? 0;

	return (
		<Container className="inventory moderation">
			<div className="profile-head">
				<Avatar src={discord?.avatar_url ?? undefined} initials={displayName.slice(0, 2).toUpperCase()} size="l" alt="" />
				<div>
					<Title size={2}>{displayName}</Title>
					<span className="mod-meta">
						{discord?.discord_id && <span className="con-note">Discord-ID {discord.discord_id}</span>}
						{role && <StatusBadge domain="request" status="active" label={role} />}
					</span>
				</div>
			</div>

			<section className="inventory-section">
				<Title element="h2" size={4}>Discord</Title>
				<ul className="con-list">
					<li className="con-line">
						<span className="con-line-main">Gebruikersnaam</span>
						<span className="con-note">{discord?.username ?? '—'}</span>
					</li>
					{discord?.global_name && (
						<li className="con-line">
							<span className="con-line-main">Weergavenaam</span>
							<span className="con-note">{discord.global_name}</span>
						</li>
					)}
					{discord?.guild_nick && (
						<li className="con-line">
							<span className="con-line-main">Bijnaam in de server</span>
							<span className="con-note">{discord.guild_nick}</span>
						</li>
					)}
					<li className="con-line">
						<span className="con-line-main">Serverrollen</span>
						<span className="con-note">{roleCount > 0 ? `${roleCount} rol(len)` : 'Geen'}</span>
					</li>
					{discord?.guild_joined_at && (
						<li className="con-line">
							<span className="con-line-main">Lid sinds</span>
							<span className="con-note">{formatDate(discord.guild_joined_at, { dateStyle: 'medium' }) ?? discord.guild_joined_at}</span>
						</li>
					)}
				</ul>
				<span className="con-note">Discord-gegevens worden bij elke login automatisch bijgewerkt.</span>
			</section>

			{isStaffRole(role) && (
				<section className="inventory-section">
					<Title element="h2" size={4}>Profiel</Title>
					<ProfileFieldsForm userId={session.user.id} canEdit />
				</section>
			)}

			{(warnings.length > 0 || badges.length > 0) && (
				<section className="inventory-section">
					<Title element="h2" size={4}>Mijn signalen</Title>
					{warnings.length > 0 && (
						<ul className="con-list">
							{warnings.map((w, i) => (
								<li key={i} className="con-line">
									<div className="con-line-info">
										<span className="con-line-main">{w.reason}</span>
										<span className="con-note">{formatDate(w.issued_at, { dateStyle: 'medium' }) ?? w.issued_at}</span>
									</div>
									<StatusBadge domain="warning" status={w.color} />
								</li>
							))}
						</ul>
					)}
					{badges.length > 0 && (
						<div className="badge-grid">
							{badges.map((b, i) => (
								<article key={i} className="badge-card">
									{/* eslint-disable-next-line @next/next/no-img-element -- publieke badge-bucket, geen next/image in static export */}
									{b.image_path && <img className="badge-img" src={badgeUrl(b.image_path)} alt="" width={64} height={64} />}
									<span className="badge-title">{b.title}</span>
									{b.description && <span className="con-note">{b.description}</span>}
								</article>
							))}
						</div>
					)}
				</section>
			)}

			{(openSurveys.length > 0 || surveyHistory.length > 0) && (
				<section className="inventory-section">
					<Title element="h2" size={4}>Enquêtes</Title>
					{openSurveys.length > 0 && (
						<ul className="con-list">
							{openSurveys.map((s) => (
								<li key={s.survey_id} className="con-line">
									<span className="con-line-main">{s.title}</span>
									<Button variant="secondary" url={`/enquete?id=${s.survey_id}`}>
										Invullen
									</Button>
								</li>
							))}
						</ul>
					)}
					{surveyHistory.length > 0 && (
						<ul className="con-list">
							{surveyHistory.map((s) => (
								<li key={s.survey_id} className="con-line">
									<div className="con-line-info">
										<span className="con-line-main">{s.title}</span>
										<span className="con-note">{formatDate(s.submitted_at, { dateStyle: 'medium' }) ?? s.submitted_at}</span>
									</div>
									<Button variant="ghost" url={`/enquete?id=${s.survey_id}`}>
										Bekijk
									</Button>
								</li>
							))}
						</ul>
					)}
				</section>
			)}

			<section className="inventory-section">
				<NotificationsList userId={session.user.id} />
			</section>

			<section className="inventory-section">
				<Title element="h2" size={4}>Donaties</Title>
				<DonationNotes userId={session.user.id} canManage={false} />
			</section>

			<div className="inventory-row-actions">
				<PushToggle />
				{permissions.size > 0 && (
					<Button variant="primary" url="/dashboard">
						Naar dashboard
					</Button>
				)}
				<Button
					variant="secondary"
					icon="logout"
					onClick={async () => {
						await signOut();
						router.replace('/');
					}}
				>
					Uitloggen
				</Button>
			</div>
		</Container>
	);
};

export default ProfilePanel;
