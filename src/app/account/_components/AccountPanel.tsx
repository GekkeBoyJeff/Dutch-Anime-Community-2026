'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NotificationsList from '@/app/account/_components/NotificationsList';
import PushToggle from '@/app/account/_components/PushToggle';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Spinner from '@/components/basics/Spinner';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import { signOut, usePermissions } from '@/lib/auth/permissions';
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

// Minimal member page: profile + logout, and a link into the dashboard when the user has any access.
const AccountPanel = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();
	const [username, setUsername] = useState<string | null>(null);
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
			.select('username')
			.eq('id', session.user.id)
			.maybeSingle()
			.then(({ data }) => setUsername((data?.username as string | null) ?? null));
		// Eigen actieve warnings (kolom-afgeschermde RPC: alleen kleur/reden/datum, volgt merges).
		db.rpc('my_warnings').then(({ data }) => setWarnings((data ?? []) as MyWarning[]));
		db.rpc('my_badges').then(({ data }) => setBadges((data ?? []) as MyBadge[]));
		db.rpc('my_open_surveys').then(({ data }) => setOpenSurveys((data ?? []) as OpenSurvey[]));
		db.rpc('my_survey_history').then(({ data }) => setSurveyHistory((data ?? []) as HistorySurvey[]));
	}, [loading, session, router]);

	const badgeUrl = (path: string): string => getBrowserClient().storage.from('badges').getPublicUrl(path).data.publicUrl;

	if (loading || !session) {
		return (
			<Container element="main" className="auth-page">
				<Spinner label="Account laden" />
			</Container>
		);
	}

	return (
		<Container element="main" className="auth-page">
			<Title size={2}>Account</Title>
			<Content element="p">Ingelogd als {username ?? session.user.email ?? 'gebruiker'}.</Content>

			{warnings.length > 0 && (
				<section className="account-warnings">
					<Title element="h2" size={4}>Mijn warnings</Title>
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
				</section>
			)}

			{badges.length > 0 && (
				<section className="account-badges">
					<Title element="h2" size={4}>Mijn badges</Title>
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
				</section>
			)}

			{(openSurveys.length > 0 || surveyHistory.length > 0) && (
				<section className="account-surveys">
					<Title element="h2" size={4}>Mijn enquêtes</Title>
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

			<NotificationsList userId={session.user.id} />
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
		</Container>
	);
};

export default AccountPanel;
