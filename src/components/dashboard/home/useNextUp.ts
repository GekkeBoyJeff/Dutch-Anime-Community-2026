'use client';

import type { Session } from '@supabase/supabase-js';

import type { Permission } from '@/lib/auth/permissions';
import { formatEur } from '@/lib/expenses/types';

import { useWidgetData } from './useWidgetData';

// A quick action inside the hero card. `external` links leave the app (Google Maps); the rest are
// internal deep links into an existing dashboard route.
export interface HeroAction {
	label: string;
	icon: string;
	href: string;
	external?: boolean;
}

export type NextUpKind = 'shift' | 'convention' | 'expense' | 'reviews' | 'survey';

// The single highest-priority actionable item for this user — the hero card model. `card` is null when
// nothing is pending (the hero then shows a warm fallback line instead).
export interface NextUp {
	kind: NextUpKind;
	eyebrow: string;
	title: string;
	meta: string;
	actions: HeroAction[];
}

export interface NextUpResult {
	loading: boolean;
	error: string | null;
	/** The one summary sentence — always present once resolved (falls back to a warm rotating line). */
	sentence: string | null;
	/** The next-up card, or null when the fallback line is showing. */
	card: NextUp | null;
}

const EXPENSE_STATUS_NL: Record<string, string> = {
	approved: 'goedgekeurd',
	rejected: 'afgewezen',
	reimbursed: 'uitbetaald',
};

const time = (iso: string): string => new Date(iso).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
const dayLabel = (iso: string): string => new Date(iso).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
const weekday = (iso: string): string => new Date(iso).toLocaleDateString('nl-NL', { weekday: 'long' });
const fullDate = (iso: string): string => new Date(iso).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });

// Human "when": counts hours today, then days ahead — feeds the card eyebrow ("over 3 uur").
const relativeWhen = (iso: string): string => {
	const diffMs = new Date(iso).getTime() - Date.now();
	const hours = Math.round(diffMs / 3_600_000);
	if (hours < 1) return 'zo meteen';
	if (hours < 24) return `over ${hours} uur`;
	const days = Math.round(hours / 24);
	if (days === 1) return 'morgen';
	return `over ${days} dagen`;
};

const mapsAction = (location: string | null): HeroAction[] =>
	location ? [{ label: 'Route', icon: 'map-pin', href: `https://maps.google.com/?q=${encodeURIComponent(location)}`, external: true }] : [];

// The priority ladder (research §1/§2): evaluate top-down, first non-empty wins, so everyone gets the
// single most relevant sentence + card. Every row reuses a query an existing widget already runs; the
// manager rows (5–6) stay gated on the same permission their RLS policy re-checks. No new data.
export const useNextUp = (session: Session, permissions: ReadonlySet<Permission>): NextUpResult => {
	const canManageExpenses = permissions.has('expenses.manage');
	const canManageInventory = permissions.has('inventory.manage');

	const { loading, error, data } = useWidgetData<{ sentence: string; card: NextUp | null }>(async (db) => {
		const today = new Date().toISOString().slice(0, 10);
		const nowIso = new Date().toISOString();

		const { data: subjectId } = await db.rpc('my_subject_id');

		const [shiftsRes, assignmentsRes, eventsRes, myExpenseRes, reviewsRes, openSurveysRes] = await Promise.all([
			subjectId
				? db.from('event_shifts').select('id, event_id, starts_at, ends_at, station').eq('subject_id', subjectId).gte('starts_at', nowIso).order('starts_at').limit(1)
				: Promise.resolve({ data: [], error: null }),
			db.from('event_item_assignments').select('event_id, packed_at').eq('assigned_user_id', session.user.id).eq('expected_to_bring', true),
			db.from('events').select('id, name, location, starts_on, ends_on').is('archived_at', null),
			db.from('expenses').select('description, amount_eur, status, updated_at').eq('user_id', session.user.id).is('archived_at', null).in('status', ['approved', 'rejected', 'reimbursed']).order('updated_at', { ascending: false }).limit(1),
			canManageExpenses ? db.from('expenses').select('id', { count: 'exact', head: true }).eq('status', 'submitted').is('archived_at', null) : Promise.resolve({ count: 0 }),
			db.rpc('my_open_surveys'),
		]);

		const eventById = new Map((eventsRes.data ?? []).map((e) => [e.id, e]));

		// Row 1–2: next shift within 7 days.
		const shift = shiftsRes.data?.[0];
		if (shift) {
			const daysAhead = Math.floor((new Date(shift.starts_at).getTime() - Date.now()) / 86_400_000);
			if (daysAhead <= 7) {
				const event = eventById.get(shift.event_id);
				const eventName = event?.name ?? 'een conventie';
				const isToday = shift.starts_at.slice(0, 10) === today;
				const sentence = isToday
					? `Je hebt vandaag een shift bij ${eventName} — ${time(shift.starts_at)}–${time(shift.ends_at ?? shift.starts_at)}.`
					: `Je volgende shift is ${weekday(shift.starts_at)} bij ${eventName}.`;
				const card: NextUp = {
					kind: 'shift',
					eyebrow: `Volgende shift · ${relativeWhen(shift.starts_at)}`,
					title: shift.station ? `${eventName} — ${shift.station}` : eventName,
					meta: [dayLabel(shift.starts_at), `${time(shift.starts_at)}–${time(shift.ends_at ?? shift.starts_at)}`, event?.location].filter(Boolean).join(' · '),
					actions: [
						{ label: 'Agenda', icon: 'calendar', href: `/dashboard/events?id=${shift.event_id}` },
						{ label: 'Ruilverzoek', icon: 'swap', href: `/dashboard/events?id=${shift.event_id}` },
						...mapsAction(event?.location ?? null),
					],
				};
				return { sentence, card };
			}
		}

		// Row 3: unpacked items for the soonest convention I must bring things to.
		const assignedEventIds = new Set((assignmentsRes.data ?? []).map((r) => r.event_id));
		const nextPackConv = (eventsRes.data ?? [])
			.filter((e) => assignedEventIds.has(e.id) && e.starts_on !== null && e.starts_on >= today)
			.sort((a, b) => (a.starts_on! < b.starts_on! ? -1 : 1))[0];
		if (nextPackConv) {
			const unpacked = (assignmentsRes.data ?? []).filter((r) => r.event_id === nextPackConv.id && r.packed_at === null).length;
			if (unpacked > 0) {
				return {
					sentence: `Nog ${unpacked} ${unpacked === 1 ? 'ding' : 'dingen'} in te pakken voor ${nextPackConv.name}.`,
					card: {
						kind: 'convention',
						eyebrow: `Inpakken voor ${nextPackConv.name}`,
						title: nextPackConv.name,
						meta: [nextPackConv.starts_on ? fullDate(nextPackConv.starts_on) : null, nextPackConv.location].filter(Boolean).join(' · '),
						actions: [
							{ label: 'Inpaklijst', icon: 'list', href: '/dashboard/my-inventory' },
							{ label: 'Details', icon: 'calendar', href: `/dashboard/events?id=${nextPackConv.id}` },
							...mapsAction(nextPackConv.location),
						],
					},
				};
			}
		}

		// Row 4: my own declaratie that got a decision.
		const myExpense = myExpenseRes.data?.[0];
		if (myExpense) {
			const statusNl = EXPENSE_STATUS_NL[myExpense.status] ?? myExpense.status;
			return {
				sentence: `Je declaratie "${myExpense.description}" is ${statusNl}.`,
				card: {
					kind: 'expense',
					eyebrow: 'Jouw declaratie',
					title: myExpense.description,
					meta: `${formatEur(myExpense.amount_eur)} · ${statusNl}`,
					actions: [{ label: 'Bekijk', icon: 'arrow-right', href: '/dashboard/expenses' }],
				},
			};
		}

		// Row 5 (managers): declaraties waiting on my review.
		const reviewCount = 'count' in reviewsRes ? (reviewsRes.count ?? 0) : 0;
		if (canManageExpenses && reviewCount > 0) {
			return {
				sentence: `${reviewCount} ${reviewCount === 1 ? 'declaratie wacht' : 'declaraties wachten'} op jouw beoordeling.`,
				card: {
					kind: 'reviews',
					eyebrow: 'Te beoordelen',
					title: `${reviewCount} ${reviewCount === 1 ? 'declaratie' : 'declaraties'}`,
					meta: 'Wacht op jouw beoordeling',
					actions: [{ label: 'Beoordeel', icon: 'arrow-right', href: '/dashboard/expenses' }],
				},
			};
		}

		// Row 6 (managers, C7): a convention that just ended (≤7 days ago) still needs wrapping up — evaluatie
		// + post-draft. Uses ends_on when set, else starts_on; ranked above the upcoming-convention row so the
		// loop gets closed before the next one is prepped.
		if (canManageInventory) {
			const justEnded = (eventsRes.data ?? [])
				.map((e) => ({ event: e, end: e.ends_on ?? e.starts_on }))
				.filter(({ end }) => end !== null && end < today)
				.sort((a, b) => (a.end! > b.end! ? -1 : 1))[0];
			if (justEnded && justEnded.end) {
				const daysAgo = Math.floor((Date.now() - new Date(justEnded.end).getTime()) / 86_400_000);
				if (daysAgo <= 7) {
					const conv = justEnded.event;
					return {
						sentence: `${conv.name} is voorbij — rond 'm af met een evaluatie.`,
						card: {
							kind: 'convention',
							eyebrow: 'Conventie afronden',
							title: conv.name,
							meta: [conv.starts_on ? fullDate(conv.starts_on) : null, conv.location].filter(Boolean).join(' · ') || 'Net voorbij',
							actions: [
								{ label: 'Evaluatie', icon: 'star', href: `/dashboard/events?id=${conv.id}` },
								{ label: 'Post-draft', icon: 'edit', href: `/dashboard/events?id=${conv.id}` },
							],
						},
					};
				}
			}
		}

		// Row 7 (managers): a convention on the near horizon.
		if (canManageInventory) {
			const soon = (eventsRes.data ?? [])
				.filter((e) => e.starts_on !== null && e.starts_on >= today)
				.sort((a, b) => (a.starts_on! < b.starts_on! ? -1 : 1))[0];
			if (soon && soon.starts_on) {
				const days = Math.floor((new Date(soon.starts_on).getTime() - Date.now()) / 86_400_000);
				if (days <= 14) {
					return {
						sentence: `${soon.name} is over ${days === 0 ? 'nul' : days} ${days === 1 ? 'dag' : 'dagen'}${soon.location ? ` — ${soon.location}` : ''}.`,
						card: {
							kind: 'convention',
							eyebrow: `Volgende conventie · ${relativeWhen(soon.starts_on)}`,
							title: soon.name,
							meta: [fullDate(soon.starts_on), soon.location].filter(Boolean).join(' · '),
							actions: [
								{ label: 'Details', icon: 'calendar', href: `/dashboard/events?id=${soon.id}` },
								...mapsAction(soon.location),
							],
						},
					};
				}
			}
		}

			// Row 8 (C8, everyone — the plain user's hero): an open survey I may still fill. Ranked below
			// personal work and the manager rows, so a member with nothing else pending still gets a hero
			// card (blueprint §1a: the user's hero is a greeting + enquête-prompt, never a bare empty state).
			const survey = (openSurveysRes.data ?? [])[0];
			if (survey) {
				const questions = Number(survey.question_count);
				return {
					sentence: `Er staat een enquête voor je klaar: "${survey.title}".`,
					card: {
						kind: 'survey',
						eyebrow: 'Enquête voor jou',
						title: survey.title,
						meta: `${questions} ${questions === 1 ? 'vraag' : 'vragen'}`,
						actions: [{ label: 'Vul in', icon: 'arrow-right', href: `/enquete?id=${survey.survey_id}` }],
					},
				};
			}

			// Row 9: nothing pending — the hero shows a warm fallback line, no card.
			return { sentence: '', card: null };
	});

	return { loading, error, sentence: data?.sentence ?? null, card: data?.card ?? null };
};
