'use client';

import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import { getBrowserClient } from '@/lib/supabase/client';

interface LinkedSurvey {
	id: string;
	title: string;
	opens_at: string | null;
	closes_at: string | null;
	archived_at: string | null;
}

const statusOf = (s: LinkedSurvey, now: string): string =>
	s.archived_at ? 'archived' : s.opens_at === null ? 'concept' : s.closes_at !== null && s.closes_at <= now ? 'closed' : 'open';

// Snelkoppeling: enquêtes die aan deze conventie zijn gekoppeld. Beheer gebeurt in de Enquêtes-sectie.
const EvaluationTab = ({ eventId }: { eventId: string }) => {
	const [surveys, setSurveys] = useState<LinkedSurvey[] | null>(null);

	useEffect(() => {
		let active = true;
		getBrowserClient()
			.from('surveys')
			.select('id, title, opens_at, closes_at, archived_at')
			.eq('event_id', eventId)
			.order('created_at', { ascending: false })
			.then(({ data }) => {
				if (active) setSurveys((data ?? []) as LinkedSurvey[]);
			});
		return () => {
			active = false;
		};
	}, [eventId]);

	const now = new Date().toISOString();

	return (
		<div className="inventory-tab">
			<p className="con-note">Enquêtes gekoppeld aan deze conventie. Aanmaken en beheren doe je in de Enquêtes-sectie.</p>
			{surveys === null ? (
				<p className="con-note">Laden…</p>
			) : surveys.length === 0 ? (
				<p className="con-note">Nog geen gekoppelde enquête.</p>
			) : (
				<ul className="con-list">
					{surveys.map((s) => (
						<li key={s.id} className="con-line">
							<span className="con-line-main">{s.title}</span>
							<StatusBadge domain="survey" status={statusOf(s, now)} />
						</li>
					))}
				</ul>
			)}
			<Button variant="secondary" url="/dashboard/surveys">
				Naar Enquêtes
			</Button>
		</div>
	);
};

export default EvaluationTab;
