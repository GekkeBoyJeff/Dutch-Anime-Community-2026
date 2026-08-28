// Sample data for the Storybook Supabase mock. Rows carry only the columns the app actually selects;
// a fixture that is richer than the query hides which columns a screen depends on.

const TODAY = new Date('2026-08-01T10:00:00.000Z');
const day = (offset: number): string => new Date(TODAY.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
const at = (offset: number, hour: number): string => {
	const d = new Date(TODAY.getTime() + offset * 86_400_000);
	d.setUTCHours(hour, 0, 0, 0);
	return d.toISOString();
};

const SUBJECT_ID = 'sub-0001';
export const USER_ID = 'usr-0001';

const PEOPLE = [
	{ id: SUBJECT_ID, display_name: 'Jeffrey de Vries' },
	{ id: 'sub-0002', display_name: 'Sanne Bakker' },
	{ id: 'sub-0003', display_name: 'Milan Jansen' },
	{ id: 'sub-0004', display_name: 'Eva Smit' },
];

export const FIXTURES: Record<string, unknown[]> = {
	events: [
		{ id: 'evt-1', name: 'Abunai! 2026', location: 'Nijmegen', kind: 'convention', starts_on: day(21), ends_on: day(23), signups_open_at: at(-10, 9), signups_close_at: at(14, 23), notes: 'Standplek B12, opbouw vrijdagochtend.', archived_at: null, budget_eur: 2500 },
		{ id: 'evt-2', name: 'Dokomi NL', location: 'Rotterdam', kind: 'convention', starts_on: day(64), ends_on: day(65), signups_open_at: null, signups_close_at: null, notes: null, archived_at: null, budget_eur: 1800 },
		{ id: 'evt-3', name: 'Animecon 2026', location: 'Den Haag', kind: 'event', starts_on: day(-20), ends_on: day(-18), signups_open_at: null, signups_close_at: null, notes: null, archived_at: null, budget_eur: 3200 },
	],
	event_shifts: [
		{ id: 'shf-1', event_id: 'evt-1', subject_id: SUBJECT_ID, starts_at: at(21, 10), ends_at: at(21, 14), station: 'Stand A', note: null, locked_at: null },
		{ id: 'shf-2', event_id: 'evt-1', subject_id: SUBJECT_ID, starts_at: at(22, 13), ends_at: at(22, 17), station: 'Kassa', note: 'Wisselgeld meenemen.', locked_at: null },
		{ id: 'shf-3', event_id: 'evt-1', subject_id: null, starts_at: at(23, 10), ends_at: at(23, 14), station: 'Stand A', note: null, locked_at: null },
		{ id: 'shf-4', event_id: 'evt-2', subject_id: null, starts_at: at(64, 9), ends_at: at(64, 13), station: 'Opbouw', note: null, locked_at: null },
	],
	expenses: [
		{ id: 'exp-1', user_id: USER_ID, event_id: 'evt-1', description: 'Treinkaartje opbouwdag', amount_eur: 24.4, incurred_on: day(-6), status: 'submitted', category: 'travel', archived_at: null, review_note: null, receipt_path: 'usr-0001/exp-1/bon.jpg', iban: 'NL91 ABNA 0417 1643 00', account_holder: 'J. de Vries' },
		{ id: 'exp-2', user_id: USER_ID, event_id: 'evt-1', description: 'Kabelhaspel', amount_eur: 41.95, incurred_on: day(-12), status: 'approved', category: 'materials', archived_at: null, review_note: null, receipt_path: 'usr-0001/exp-2/bon.pdf', iban: 'NL91 ABNA 0417 1643 00', account_holder: 'J. de Vries' },
		{ id: 'exp-3', user_id: 'usr-0002', event_id: 'evt-3', description: 'Posters laten drukken', amount_eur: 89.0, incurred_on: day(-30), status: 'rejected', category: 'stand', archived_at: null, review_note: 'Geen bon bijgevoegd.', receipt_path: 'usr-0002/exp-3/bon.jpg', iban: 'NL02 RABO 0123 4567 89', account_holder: 'S. Bakker' },
		{ id: 'exp-4', user_id: 'usr-0002', event_id: 'evt-3', description: 'Parkeerkosten', amount_eur: 12.5, incurred_on: day(-29), status: 'reimbursed', category: 'travel', archived_at: null, review_note: null, receipt_path: 'usr-0002/exp-4/bon.jpg', iban: 'NL02 RABO 0123 4567 89', account_holder: null },
		{ id: 'exp-5', user_id: USER_ID, event_id: null, description: 'Lunch onderweg', amount_eur: 18.75, incurred_on: day(-24), status: 'rejected', category: 'food', archived_at: null, review_note: 'Eten onderweg valt niet onder de vergoeding.', receipt_path: 'usr-0001/exp-5/bon.jpg', iban: 'NL91 ABNA 0417 1643 00', account_holder: 'J. de Vries' },
	],
	profiles: [
		// terms_version must match TERMS_VERSION in app/_components/TermsGate — an older value puts every
		// story behind AdminShell on the acceptance card instead of the screen it is meant to show.
		{ id: USER_ID, username: 'gekkeboyjeff', global_name: 'Jeffrey', guild_nick: 'Jeffrey (DAC)', discord_id: '123456789012345678', guild_roles: ['Yakuza', 'Standteam'], guild_joined_at: at(-900, 12), avatar_url: null, public_name: 'Jeffrey', age: 29, instagram: 'gekkeboyjeff', about: 'Standteam sinds 2023, meestal bij de kassa te vinden.', photo_path: null, terms_accepted_at: at(-200, 12), terms_version: '2026-07-17' },
		{ id: 'usr-0002', username: 'sannebakker', global_name: 'Sanne', guild_nick: 'Sanne (standteam)', discord_id: '234567890123456789', guild_roles: ['Standteam'], guild_joined_at: at(-300, 9), avatar_url: null },
		{ id: 'usr-0003', username: 'milanjansen' },
		{ id: 'usr-0004', username: 'evasmit' },
	],
	subject_names: PEOPLE,
	user_roles: [
		{ user_id: USER_ID, role: 'yakuza' },
		{ user_id: 'usr-0002', role: 'stand-staff' },
		{ user_id: 'usr-0003', role: 'author' },
		{ user_id: 'usr-0004', role: 'user' },
	],
	pages: [
		{ id: 'pag-1', path: '/', title: 'Home', published_at: at(-5, 9), updated_at: at(-2, 15) },
		{ id: 'pag-2', path: '/conventies', title: 'Conventies', published_at: null, updated_at: at(-1, 11) },
	],
	structures: [],
	push_subscriptions: [],
};

export const RPC_FIXTURES: Record<string, unknown> = {
	// What my_permissions() answers: everything, so no screen is gated while you are demoing it. This
	// mirrors APP_PERMISSIONS in src/lib/auth/permissions.ts rather than importing it — that module
	// pulls in the Supabase client, which Storybook aliases back to this mock's own importer.
	my_permissions: [
		'pages.create',
		'pages.edit',
		'pages.delete',
		'structures.edit',
		'media.upload',
		'media.delete',
		'site.publish_staging',
		'site.approve',
		'moderation.view',
		'moderation.manage',
		'roles.manage',
		'events.view',
		'events.manage',
		'inventory.view',
		'inventory.manage',
		'expenses.view',
		'expenses.review',
		'finance.view',
		'finance.manage',
		'staff.view',
		'staff.manage',
		'surveys.manage',
		'surveys.results',
		'notifications.send',
		'notifications.manage',
		'logs.view',
		'badges.manage',
		'records.delete',
	],
};

export const STORAGE_FIXTURES: Record<string, unknown[]> = {
	media: [
		{ id: 'md-1', name: 'hero-abunai-2026.jpg', created_at: at(-2, 11), metadata: { mimetype: 'image/jpeg', size: 284_113 } },
		{ id: 'md-2', name: 'stand-opbouw.png', created_at: at(-9, 16), metadata: { mimetype: 'image/png', size: 512_004 } },
	],
};
