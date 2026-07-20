import type { Session } from '@supabase/supabase-js';

// Time-of-day greeting buckets, the industry-standard windows (Momentum/Nextcloud): ochtend 05–11:59,
// middag 12–17:59, avond 18–21:59, nacht 22–04:59. Client-only, so the hour is the viewer's own.
export const greetingFor = (date: Date): string => {
	const hour = date.getHours();
	if (hour >= 5 && hour < 12) return 'Goeiemorgen';
	if (hour >= 12 && hour < 18) return 'Goeiemiddag';
	if (hour >= 18 && hour < 22) return 'Goeienavond';
	return 'Nog wakker';
};

// First name from the live Discord session metadata (same source the nav chip uses), first token only.
export const firstNameFrom = (session: Session): string => {
	const meta = session.user.user_metadata ?? {};
	const full = (meta.full_name as string) || (meta.name as string) || (meta.user_name as string) || session.user.email || 'daar';
	return full.trim().split(/\s+/)[0] ?? 'daar';
};

// Warm rotating lines for the empty state — the summary sentence and any empty zone borrow from this so
// the page never reads as a bare "Niets te tonen". Kept DAC-flavoured, never cutesy-corporate.
export const FALLBACK_LINES = [
	'Rustig aan het front vandaag.',
	'Niets urgents — mooie dag ervoor.',
	'Alles onder controle. Geniet ervan.',
	'Geen vuurtjes te blussen. Fijn zo.',
	'Even geen deadlines in zicht.',
] as const;

// Deterministic pick so the line is stable within a day (no reshuffle per render, no hydration drift).
export const rotatingLine = (pool: readonly string[], date = new Date()): string => {
	const start = Date.UTC(date.getUTCFullYear(), 0, 0);
	const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
	return pool[dayOfYear % pool.length] ?? pool[0]!;
};
