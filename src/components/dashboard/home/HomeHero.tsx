'use client';

import type { Session } from '@supabase/supabase-js';

import Avatar from '@/components/basics/Avatar';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import type { Permission } from '@/lib/auth/permissions';

import { FALLBACK_LINES, firstNameFrom, greetingFor, rotatingLine } from './greeting';
import NotificationBell from './NotificationBell';
import { useNextUp, type HeroAction, type NextUp } from './useNextUp';

const HeroActionButton = ({ action }: { action: HeroAction }) => (
	<Interactive url={action.href} target={action.external ? '_blank' : undefined} className="home-action" aria-label={action.label}>
		<span className="home-action-icon">
			<Icon name={action.icon} />
		</span>
		<span className="home-action-label">{action.label}</span>
	</Interactive>
);

const HeroCard = ({ card }: { card: NextUp }) => (
	<article className="home-card" data-kind={card.kind}>
		<div className="home-card-body">
			<p className="home-card-eyebrow">{card.eyebrow}</p>
			<h2 className="home-card-title">{card.title}</h2>
			<p className="home-card-meta">{card.meta}</p>
		</div>
		<div className="home-card-actions">
			{card.actions.map((action) => (
				<HeroActionButton key={action.label} action={action} />
			))}
		</div>
	</article>
);

// The warm empty card — shown when nothing is pending, so the hero never leaves a hole (same reserved
// height as a real card, so resolving into it causes no shift).
const HeroCalmCard = () => (
	<article className="home-card is-calm">
		<div className="home-card-body">
			<p className="home-card-eyebrow">Niets openstaand</p>
			<h2 className="home-card-title">Je bent helemaal bij.</h2>
			<p className="home-card-meta">Geen shifts, inpaklijsten of declaraties die je aandacht vragen.</p>
		</div>
		<div className="home-card-actions">
			<HeroActionButton action={{ label: 'Mijn conventies', icon: 'calendar', href: '/dashboard/my-inventory' }} />
		</div>
	</article>
);

interface HomeHeroProps {
	session: Session;
	permissions: ReadonlySet<Permission>;
}

// The greeting hero (research §1/§2): a date eyebrow with the notification bell + avatar, a time-of-day
// greeting, one role-aware summary sentence, and the next-up card with inline quick actions. Name and
// avatar come straight from the session (no query → no shift); the sentence and card are async, each
// with a reserved skeleton so content crossfades in without moving the greeting.
const HomeHero = ({ session, permissions }: HomeHeroProps) => {
	const now = new Date();
	const name = firstNameFrom(session);
	const meta = session.user.user_metadata ?? {};
	const avatarUrl = (meta.avatar_url as string) || (meta.picture as string) || undefined;
	const eyebrow = now.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

	const { loading, sentence, card } = useNextUp(session, permissions);
	const summary = sentence && sentence.length > 0 ? sentence : rotatingLine(FALLBACK_LINES, now);

	return (
		<section className="home-hero">
			<div className="home-hero-wash" aria-hidden="true" />
			<header className="home-hero-top">
				<p className="home-hero-eyebrow">{eyebrow}</p>
				<div className="home-hero-tools">
					<NotificationBell />
					<Avatar src={avatarUrl} size="m" initials={name.slice(0, 2).toUpperCase()} alt={name} />
				</div>
			</header>

			<div className="home-hero-greet">
				<h1 className="home-hero-title">
					{greetingFor(now)}, {name}.
				</h1>
				{loading ? (
					<div className="home-hero-summary is-loading" aria-hidden="true">
						<Skeleton height="1.35rem" width="min(24rem, 70%)" />
					</div>
				) : (
					<p className="home-hero-summary">{summary}</p>
				)}
			</div>

			<div className="home-hero-slot">
				{loading ? (
					<div className="home-card is-skeleton" aria-hidden="true">
						<div className="home-card-body">
							<Skeleton height="0.85rem" width="9rem" />
							<Skeleton height="1.5rem" width="min(18rem, 80%)" />
							<Skeleton height="0.95rem" width="min(22rem, 90%)" />
						</div>
						<div className="home-card-actions">
							<Skeleton height="2.75rem" width="6rem" radius="m" />
							<Skeleton height="2.75rem" width="6rem" radius="m" />
						</div>
					</div>
				) : card ? (
					<HeroCard card={card} />
				) : (
					<HeroCalmCard />
				)}
			</div>
		</section>
	);
};

export default HomeHero;
