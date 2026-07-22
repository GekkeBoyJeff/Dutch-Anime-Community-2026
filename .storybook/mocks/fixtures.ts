// Sample data for the Storybook Supabase mock. Deliberately recognisable as fiction — Dutch names and
// invented conventions — so nobody mistakes a story for production data. Rows carry only the columns
// the dashboard actually selects; anything it does not read is absent on purpose, because a fixture
// that is richer than the query hides which columns a screen depends on.

const TODAY = new Date('2026-08-01T10:00:00.000Z');
const day = (offset: number): string => new Date(TODAY.getTime() + offset * 86_400_000).toISOString().slice(0, 10);
const at = (offset: number, hour: number): string => {
	const d = new Date(TODAY.getTime() + offset * 86_400_000);
	d.setUTCHours(hour, 0, 0, 0);
	return d.toISOString();
};

export const SUBJECT_ID = 'sub-0001';
export const USER_ID = 'usr-0001';

const PEOPLE = [
	{ id: SUBJECT_ID, display_name: 'Jeffrey de Vries' },
	{ id: 'sub-0002', display_name: 'Sanne Bakker' },
	{ id: 'sub-0003', display_name: 'Milan Jansen' },
	{ id: 'sub-0004', display_name: 'Eva Smit' },
];

export const FIXTURES: Record<string, unknown[]> = {
	events: [
		{ id: 'evt-1', name: 'Abunai! 2026', location: 'Nijmegen', starts_on: day(21), ends_on: day(23), archived_at: null, budget_eur: 2500 },
		{ id: 'evt-2', name: 'Dokomi NL', location: 'Rotterdam', starts_on: day(64), ends_on: day(65), archived_at: null, budget_eur: 1800 },
		{ id: 'evt-3', name: 'Animecon 2026', location: 'Den Haag', starts_on: day(-20), ends_on: day(-18), archived_at: null, budget_eur: 3200 },
	],
	event_shifts: [
		{ id: 'shf-1', event_id: 'evt-1', subject_id: SUBJECT_ID, starts_at: at(21, 10), ends_at: at(21, 14), station: 'Stand A' },
		{ id: 'shf-2', event_id: 'evt-1', subject_id: SUBJECT_ID, starts_at: at(22, 13), ends_at: at(22, 17), station: 'Kassa' },
		{ id: 'shf-3', event_id: 'evt-1', subject_id: null, starts_at: at(23, 10), ends_at: at(23, 14), station: 'Stand A' },
		{ id: 'shf-4', event_id: 'evt-2', subject_id: null, starts_at: at(64, 9), ends_at: at(64, 13), station: 'Opbouw' },
	],
	shift_swap_requests: [
		{ id: 'swp-1', shift_id: 'shf-2', from_subject: SUBJECT_ID, to_subject: 'sub-0002', status: 'pending' },
	],
	expenses: [
		{ id: 'exp-1', user_id: USER_ID, event_id: 'evt-1', description: 'Treinkaartje opbouwdag', amount_eur: 24.4, incurred_on: day(-6), status: 'submitted', category: 'travel', archived_at: null, review_note: null },
		{ id: 'exp-2', user_id: USER_ID, event_id: 'evt-1', description: 'Kabelhaspel', amount_eur: 41.95, incurred_on: day(-12), status: 'approved', category: 'materials', archived_at: null, review_note: null },
		{ id: 'exp-3', user_id: 'usr-0002', event_id: 'evt-3', description: 'Posters laten drukken', amount_eur: 89.0, incurred_on: day(-30), status: 'rejected', category: 'promo', archived_at: null, review_note: 'Geen bon bijgevoegd.' },
		{ id: 'exp-4', user_id: 'usr-0002', event_id: 'evt-3', description: 'Parkeerkosten', amount_eur: 12.5, incurred_on: day(-29), status: 'paid', category: 'travel', archived_at: null, review_note: null },
	],
	inventory_items: [
		{ id: 'itm-1', name: 'Katana replica', owner_subject_id: SUBJECT_ID, quantity: 3, value_eur: 45, available: true, archived_at: null },
		{ id: 'itm-2', name: 'Banner groot', owner_subject_id: 'sub-0002', quantity: 1, value_eur: 120, available: true, archived_at: null },
		{ id: 'itm-3', name: 'Kassalade', owner_subject_id: SUBJECT_ID, quantity: 1, value_eur: 60, available: false, archived_at: null },
	],
	event_item_assignments: [
		{ id: 'asg-1', event_id: 'evt-1', item_id: 'itm-1', assigned_user_id: USER_ID, quantity: 2, packed_at: at(20, 9), expected_to_bring: true },
		{ id: 'asg-2', event_id: 'evt-1', item_id: 'itm-3', assigned_user_id: USER_ID, quantity: 1, packed_at: null, expected_to_bring: true },
	],
	item_unavailability: [
		{ id: 'unv-1', item_id: 'itm-3', starts_on: day(5), ends_on: day(12), reason: 'Uitgeleend aan Sanne', status: 'approved' },
	],
	profiles: [
		{ id: USER_ID, username: 'gekkeboyjeff', global_name: 'Jeffrey', guild_nick: 'Jeffrey (DAC)', discord_id: '123456789012345678', guild_roles: ['Yakuza', 'Standteam'], guild_joined_at: at(-900, 12), avatar_url: null },
	],
	subject_names: PEOPLE,
	mod_subjects: PEOPLE.map((p) => ({ ...p, merged_into: null })),
	mod_warnings: [
		{ id: 'wrn-1', subject_id: 'sub-0003', color: 'yellow', reason: 'Te laat op shift zonder afmelding', issued_at: at(-45, 15) },
	],
	mod_notes: [
		{ id: 'not-1', subject_id: 'sub-0003', body: 'Gesproken na Animecon; afspraken gemaakt over aanwezigheid.', created_at: at(-40, 11), archived_at: null },
	],
	mod_bans: [],
	mod_subject_links: [
		{ id: 'lnk-1', subject_id: SUBJECT_ID, other_subject_id: 'sub-0004', status: 'confirmed', reason: 'Zelfde persoon, ander Discord-account' },
	],
	mod_subject_aliases: [{ id: 'als-1', subject_id: SUBJECT_ID, alias: 'GekkeBoyJeff', last_seen: at(-10, 9) }],
	conduct_notes: [],
	tickets: [
		{ id: 'tkt-1', title: 'Melding over gedrag op de stand', status: 'open', created_at: at(-3, 14) },
		{ id: 'tkt-2', title: 'Vraag over vrijwilligersvergoeding', status: 'closed', created_at: at(-18, 10) },
	],
	ticket_participants: [
		{ id: 'tpa-1', ticket_id: 'tkt-1', name: 'Sanne Bakker', discord_id: '234567890123456789', is_bot: false },
		{ id: 'tpa-2', ticket_id: 'tkt-1', name: 'DAC Bot', discord_id: '345678901234567890', is_bot: true },
	],
	ticket_messages: [
		{ id: 'msg-1', ticket_id: 'tkt-1', author: 'Sanne Bakker', body: 'Ik wil iets melden over gisteren.', sent_at: at(-3, 14) },
	],
	badges: [
		{ id: 'bdg-1', title: 'Eerste conventie', description: 'Je eerste shift gedraaid.', image_path: null },
		{ id: 'bdg-2', title: 'Trouwe kracht', description: 'Vijf conventies meegedraaid.', image_path: null },
	],
	surveys: [
		{ id: 'srv-1', title: 'Evaluatie Animecon 2026', status: 'open', closes_on: day(10) },
		{ id: 'srv-2', title: 'Voorkeuren shifts najaar', status: 'closed', closes_on: day(-25) },
	],
	survey_questions: [{ id: 'sq-1', survey_id: 'srv-1', prompt: 'Hoe beviel de opbouw?', kind: 'scale', position: 1 }],
	survey_question_options: [],
	notifications: [
		{ id: 'ntf-1', user_id: USER_ID, title: 'Je shift is bevestigd', body: 'Zaterdag 22 augustus, 13:00–17:00.', created_at: at(-1, 9), read_at: null },
		{ id: 'ntf-2', user_id: USER_ID, title: 'Declaratie goedgekeurd', body: 'Kabelhaspel — € 41,95.', created_at: at(-8, 16), read_at: at(-7, 8) },
	],
	notification_types: [{ id: 'nty-1', key: 'shift_confirmed', label: 'Shift bevestigd', enabled: true }],
	notification_history: [{ id: 'nhi-1', title: 'Oproep vrijwilligers Abunai', sent_at: at(-14, 12), recipients: 42 }],
	donation_notes: [{ id: 'dnt-1', user_id: USER_ID, note: 'Doneerde een setje banners', source: 'Discord', noted_on: day(-60) }],
	payout_details: [{ id: 'pay-1', user_id: USER_ID, iban_last4: '4321', holder: 'J. de Vries' }],
	receipts: [{ id: 'rcp-1', expense_id: 'exp-1', storage_path: 'receipts/exp-1.pdf' }],
	audit_log: [
		{ id: 'aud-1', table_name: 'events', op: 'UPDATE', old_data: null, new_data: { name: 'Abunai! 2026' }, created_at: at(-1, 13) },
		{ id: 'aud-2', table_name: 'expenses', op: 'INSERT', old_data: null, new_data: { description: 'Treinkaartje opbouwdag' }, created_at: at(-6, 10) },
	],
	activity_log: [{ id: 'act-1', subject_id: SUBJECT_ID, kind: 'shift', summary: 'Shift gedraaid op Stand A', created_at: at(-20, 12) }],
	event_activities: [{ id: 'eac-1', event_id: 'evt-1', title: 'Cosplay-wedstrijd', starts_at: at(22, 15), ends_at: at(22, 17) }],
	activity_requirements: [{ id: 'arq-1', activity_id: 'eac-1', item_id: 'itm-2', label: null, quantity: 1 }],
	activity_hosts: [{ id: 'aho-1', activity_id: 'eac-1', subject_id: 'sub-0002' }],
	event_attendance: [{ id: 'eat-1', event_id: 'evt-1', subject_id: SUBJECT_ID, status: 'confirmed' }],
	event_tickets: [{ id: 'etk-1', event_id: 'evt-1', subject_id: SUBJECT_ID, storage_path: 'tickets/evt-1-jeffrey.pdf' }],
	event_posts: [{ id: 'epo-1', event_id: 'evt-1', channel: 'discord', body: 'Wie helpt er mee met de opbouw?', posted_at: null }],
	org_income: [{ id: 'inc-1', description: 'Standverkoop Animecon', amount_eur: 640, received_on: day(-19) }],
	user_roles: [{ user_id: USER_ID, role: 'yakuza' }],
	user_permissions: [],
	role_permissions: [],
	pages: [
		{ id: 'pag-1', path: '/', title: 'Home', published_at: at(-5, 9), updated_at: at(-2, 15) },
		{ id: 'pag-2', path: '/conventies', title: 'Conventies', published_at: null, updated_at: at(-1, 11) },
	],
	structures: [],
	push_subscriptions: [],
	media: [],
	avatars: [],
};

// RPC results, keyed by function name. Anything absent resolves to null, which is what a Supabase RPC
// returns when it has nothing to give.
export const RPC_FIXTURES: Record<string, unknown> = {
	my_subject_id: SUBJECT_ID,
	my_warnings: [],
	my_badges: [
		{ title: 'Eerste conventie', description: 'Je eerste shift gedraaid.', awarded_on: day(-120), image_path: null },
		{ title: 'Trouwe kracht', description: 'Vijf conventies meegedraaid.', awarded_on: day(-14), image_path: null },
	],
	my_open_surveys: [{ survey_id: 'srv-1', title: 'Evaluatie Animecon 2026' }],
	my_survey_history: [{ survey_id: 'srv-2', title: 'Voorkeuren shifts najaar', submitted_at: at(-25, 19) }],
	my_assignment_item_names: [
		{ item_id: 'itm-1', name: 'Katana replica' },
		{ item_id: 'itm-3', name: 'Kassalade' },
	],
	team_candidates: PEOPLE,
	list_notifiable_members: PEOPLE.map((p) => ({ ...p, user_id: p.id.replace('sub', 'usr') })),
	staff_overview: PEOPLE.map((p, i) => ({ ...p, role: i === 0 ? 'yakuza' : 'stand-staff', shift_count: 4 - i, warning_count: i === 2 ? 1 : 0 })),
	finance_rollup: { income_eur: 640, committed_eur: 54.45, pending_eur: 24.4, balance_eur: 561.15 },
	survey_response_counts: [{ survey_id: 'srv-1', responses: 12 }],
	get_survey_results: [],
	media_usage: [],
};

// Storage buckets: list() results per bucket.
export const STORAGE_FIXTURES: Record<string, unknown[]> = {
	media: [
		{ id: 'md-1', name: 'hero-abunai-2026.jpg', created_at: at(-2, 11), metadata: { mimetype: 'image/jpeg', size: 284_113 } },
		{ id: 'md-2', name: 'stand-opbouw.png', created_at: at(-9, 16), metadata: { mimetype: 'image/png', size: 512_004 } },
	],
	badges: [],
	receipts: [],
	tickets: [],
};
