// Sample data for the Storybook Supabase mock. Deliberately recognisable as fiction — Dutch names and
// invented conventions — so nobody mistakes a story for production data. Rows carry only the columns
// the dashboard actually selects; anything it does not read is absent on purpose, because a fixture
// that is richer than the query hides which columns a screen depends on.

import { PERMISSIONS_BY_ROLE } from './roles';

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

// Discord handles per person, keyed by subject id — the same names the profiles rows carry.
const USERNAMES: Record<string, string> = {
	[SUBJECT_ID]: 'gekkeboyjeff',
	'sub-0002': 'sannebakker',
	'sub-0003': 'milanjansen',
	'sub-0004': 'evasmit',
};

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
	shift_swap_requests: [
		{ id: 'swp-1', shift_id: 'shf-2', from_subject: SUBJECT_ID, to_subject: 'sub-0002', status: 'pending' },
		{ id: 'swp-2', shift_id: 'shf-1', from_subject: SUBJECT_ID, to_subject: 'sub-0003', status: 'pending' },
	],
	expenses: [
		{ id: 'exp-1', user_id: USER_ID, event_id: 'evt-1', description: 'Treinkaartje opbouwdag', amount_eur: 24.4, incurred_on: day(-6), status: 'submitted', category: 'travel', archived_at: null, review_note: null, receipt_path: 'usr-0001/exp-1/bon.jpg', iban: 'NL91 ABNA 0417 1643 00', account_holder: 'J. de Vries' },
		{ id: 'exp-2', user_id: USER_ID, event_id: 'evt-1', description: 'Kabelhaspel', amount_eur: 41.95, incurred_on: day(-12), status: 'approved', category: 'materials', archived_at: null, review_note: null, receipt_path: 'usr-0001/exp-2/bon.pdf', iban: 'NL91 ABNA 0417 1643 00', account_holder: 'J. de Vries' },
		{ id: 'exp-3', user_id: 'usr-0002', event_id: 'evt-3', description: 'Posters laten drukken', amount_eur: 89.0, incurred_on: day(-30), status: 'rejected', category: 'stand', archived_at: null, review_note: 'Geen bon bijgevoegd.', receipt_path: 'usr-0002/exp-3/bon.jpg', iban: 'NL02 RABO 0123 4567 89', account_holder: 'S. Bakker' },
		{ id: 'exp-4', user_id: 'usr-0002', event_id: 'evt-3', description: 'Parkeerkosten', amount_eur: 12.5, incurred_on: day(-29), status: 'reimbursed', category: 'travel', archived_at: null, review_note: null, receipt_path: 'usr-0002/exp-4/bon.jpg', iban: 'NL02 RABO 0123 4567 89', account_holder: null },
		{ id: 'exp-5', user_id: USER_ID, event_id: null, description: 'Lunch onderweg', amount_eur: 18.75, incurred_on: day(-24), status: 'rejected', category: 'food', archived_at: null, review_note: 'Eten onderweg valt niet onder de vergoeding.', receipt_path: 'usr-0001/exp-5/bon.jpg', iban: 'NL91 ABNA 0417 1643 00', account_holder: 'J. de Vries' },
	],
	inventory_items: [
		{ id: 'itm-1', name: 'Katana replica', owner_user_id: USER_ID, owner_label: null, quantity: 3, value_eur: 45, available: true, notes: 'Zit in de zwarte foedraal.', archived_at: null },
		{ id: 'itm-2', name: 'Banner groot', owner_user_id: 'usr-0002', owner_label: null, quantity: 1, value_eur: 120, available: true, notes: null, archived_at: null },
		{ id: 'itm-3', name: 'Kassalade', owner_user_id: USER_ID, owner_label: null, quantity: 1, value_eur: 60, available: false, notes: null, archived_at: null },
		{ id: 'itm-4', name: 'Statafel', owner_user_id: null, owner_label: 'Vereniging', quantity: 2, value_eur: 80, available: true, notes: null, archived_at: at(-70, 12) },
	],
	event_item_assignments: [
		{ id: 'asg-1', event_id: 'evt-1', item_id: 'itm-1', assigned_user_id: USER_ID, assigned_label: null, quantity: 2, packed_at: at(20, 9), expected_to_bring: true, notes: null },
		{ id: 'asg-2', event_id: 'evt-1', item_id: 'itm-3', assigned_user_id: USER_ID, assigned_label: null, quantity: 1, packed_at: null, expected_to_bring: true, notes: 'Sleutel zit in het zijvak.' },
	],
	item_unavailability: [
		{ id: 'unv-1', item_id: 'itm-3', starts_on: day(-20), ends_on: day(12), reason: 'Uitgeleend aan Sanne', status: 'active' },
		{ id: 'unv-2', item_id: 'itm-1', starts_on: day(30), ends_on: null, reason: 'Naar de wapenkeuring', status: 'requested' },
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
	mod_subjects: [
		{ id: SUBJECT_ID, discord_id: '123456789012345678', discord_name: 'gekkeboyjeff', user_id: USER_ID, merged_into: null, created_at: at(-200, 12) },
		{ id: 'sub-0002', discord_id: '234567890123456789', discord_name: 'sannebakker', user_id: 'usr-0002', merged_into: null, created_at: at(-180, 12) },
		{ id: 'sub-0003', discord_id: '456789012345678901', discord_name: 'milan_j', user_id: null, merged_into: null, created_at: at(-90, 12) },
		{ id: 'sub-0004', discord_id: '567890123456789012', discord_name: 'eva.smit', user_id: null, merged_into: null, created_at: at(-40, 12) },
	],
	mod_warnings: [
		{ id: 'wrn-1', subject_id: 'sub-0003', color: 'yellow', reason: 'Te laat op shift zonder afmelding', issued_at: at(-45, 15), issued_by: USER_ID, removed_at: null },
		{ id: 'wrn-2', subject_id: SUBJECT_ID, color: 'yellow', reason: 'Discussie in #algemeen niet gestaakt na verzoek', issued_at: at(-30, 20), issued_by: USER_ID, removed_at: null },
		{ id: 'wrn-3', subject_id: SUBJECT_ID, color: 'red', reason: 'Afspraken over de kassa genegeerd', issued_at: at(-90, 18), issued_by: USER_ID, removed_at: at(-80, 9) },
	],
	mod_evidence: [
		{ id: 'evd-1', warning_id: 'wrn-2', kind: 'image', storage_path: 'wrn-2/schermafbeelding-algemeen.png', url: null, body: null, created_at: at(-30, 20) },
		{ id: 'evd-2', warning_id: 'wrn-2', kind: 'link', storage_path: null, url: 'https://discord.com/channels/000/111/222', body: null, created_at: at(-30, 21) },
		{ id: 'evd-3', warning_id: 'wrn-2', kind: 'text', storage_path: null, url: null, body: 'Twee moderators hebben het gesprek meegelezen.', created_at: at(-29, 9) },
	],
	mod_link_evidence: [
		{ id: 'lev-1', link_id: 'lnk-1', kind: 'text', storage_path: null, url: null, body: 'Beide accounts posten vanaf hetzelfde apparaat volgens de bot-logs.', created_at: at(-25, 12) },
	],
	mod_notes: [
		{ id: 'not-1', subject_id: 'sub-0003', body: 'Gesproken na Animecon; afspraken gemaakt over aanwezigheid.', created_at: at(-40, 11), created_by: USER_ID, archived_at: null },
		{ id: 'not-2', subject_id: SUBJECT_ID, body: 'Zelf melding gemaakt bij de garderobe; afspraken staan in ticket 0142.', created_at: at(-12, 16), created_by: USER_ID, archived_at: null },
	],
	mod_bans: [
		{ id: 'ban-1', subject_id: SUBJECT_ID, scope: 'convention', reason: 'Tijdelijk geweerd na onenigheid bij de garderobe', issued_at: at(-60, 19), expires_at: at(30, 12), lifted_at: null },
	],
	mod_subject_links: [
		{ id: 'lnk-1', subject_low: SUBJECT_ID, subject_high: 'sub-0004', status: 'confirmed', reason: 'Zelfde persoon, ander Discord-account', created_at: at(-25, 11) },
		{ id: 'lnk-2', subject_low: SUBJECT_ID, subject_high: 'sub-0003', status: 'suspected', reason: 'Zelfde schrijfstijl, zelfde tijdstippen', created_at: at(-5, 13) },
	],
	mod_subject_aliases: [
		{ id: 1, subject_id: SUBJECT_ID, alias: 'GekkeBoyJeff', kind: 'discord', source: 'guild-sync', last_seen: at(-10, 9) },
		{ id: 2, subject_id: SUBJECT_ID, alias: 'Jeffrey (DAC)', kind: 'nickname', source: 'ticket', last_seen: at(-40, 14) },
	],
	conduct_notes: [
		{ id: 'cnd-1', subject_id: SUBJECT_ID, kind: 'compliment', body: 'Sprong bij toen de kassa uitviel.', event_id: 'evt-3', created_at: at(-19, 17) },
		{ id: 'cnd-2', subject_id: SUBJECT_ID, kind: 'aandachtspunt', body: 'Te laat teruggekomen van pauze.', event_id: null, created_at: at(-2, 12) },
	],
	tickets: [
		{ id: 'tkt-1', ticket_number: '0142', title: 'Melding over gedrag op de stand', status: 'open', channel_name: 'ticket-0142', opened_at: at(-3, 14), closed_at: at(-3, 15), uploaded_at: at(-2, 9), message_count: 3, archived_at: null, created_at: at(-3, 14) },
		{ id: 'tkt-2', ticket_number: '0138', title: 'Vraag over vrijwilligersvergoeding', status: 'closed', channel_name: 'ticket-0138', opened_at: at(-18, 10), closed_at: at(-18, 11), uploaded_at: at(-17, 9), message_count: 2, archived_at: at(-10, 8), created_at: at(-18, 10) },
	],
	ticket_participants: [
		{ id: 'tpa-1', ticket_id: 'tkt-1', subject_id: 'sub-0002', name: 'Sanne Bakker', discord_id: '234567890123456789', is_bot: false },
		{ id: 'tpa-2', ticket_id: 'tkt-1', subject_id: null, name: 'DAC Bot', discord_id: '345678901234567890', is_bot: true },
		{ id: 'tpa-3', ticket_id: 'tkt-1', subject_id: SUBJECT_ID, name: 'Jeffrey de Vries', discord_id: '123456789012345678', is_bot: false },
		{ id: 'tpa-4', ticket_id: 'tkt-2', subject_id: SUBJECT_ID, name: 'Jeffrey de Vries', discord_id: '123456789012345678', is_bot: false },
		{ id: 'tpa-5', ticket_id: 'tkt-2', subject_id: 'sub-0003', name: 'Milan Jansen', discord_id: '456789012345678901', is_bot: false },
	],
	ticket_messages: [
		{ id: 'msg-1', ticket_id: 'tkt-1', seq: 1, discord_id: '900000000000000001', sent_at: at(-3, 14), author_discord_id: '234567890123456789', author_name: 'Sanne Bakker', author_avatar_url: null, is_bot: false, content: 'Ik wil iets melden over gisteren bij de stand.', reply_to_discord_id: null, embeds: [], attachments: [] },
		{ id: 'msg-2', ticket_id: 'tkt-1', seq: 2, discord_id: '900000000000000002', sent_at: at(-3, 14), author_discord_id: '345678901234567890', author_name: 'DAC Bot', author_avatar_url: null, is_bot: true, content: '', reply_to_discord_id: null, embeds: [{ title: 'Ticket geopend', description: 'Een moderator sluit zo aan.', color: '#7c5cff', imageUrl: null, footer: 'DAC Bot' }], attachments: [] },
		{ id: 'msg-3', ticket_id: 'tkt-1', seq: 3, discord_id: '900000000000000003', sent_at: at(-3, 15), author_discord_id: '123456789012345678', author_name: 'Jeffrey de Vries', author_avatar_url: null, is_bot: false, content: 'Dank je, ik pak het op en kom er vanavond op terug.', reply_to_discord_id: '900000000000000001', embeds: [], attachments: [{ name: 'stand-opbouw.svg', url: '/media/dac-logo.svg', size: 84_213, width: 800, height: 600 }] },
	],
	badges: [
		{ id: 'bdg-1', subject_id: SUBJECT_ID, title: 'Eerste conventie', description: 'Je eerste shift gedraaid.', awarded_on: day(-120), image_path: null, archived_at: null },
		{ id: 'bdg-2', subject_id: SUBJECT_ID, title: 'Trouwe kracht', description: 'Vijf conventies meegedraaid.', awarded_on: day(-14), image_path: null, archived_at: null },
	],
	surveys: [
		{ id: 'srv-1', title: 'Evaluatie Animecon 2026', description: 'Kort rondje langs de standdagen.', status: 'open', closes_on: day(10), opens_at: at(-18, 9), closes_at: at(10, 22), archived_at: null, event_id: 'evt-3', access_mode: 'authenticated', anonymous: false, audience: 'event_attendees', audience_role: null, created_at: at(-20, 9) },
		{ id: 'srv-4', title: 'Evaluatie Abunai! 2026', description: 'Na afloop: hoe liep de stand?', status: 'concept', closes_on: null, opens_at: null, closes_at: null, archived_at: null, event_id: 'evt-1', access_mode: 'authenticated', anonymous: false, audience: 'event_attendees', audience_role: null, created_at: at(-1, 9) },
		{ id: 'srv-2', title: 'Voorkeuren shifts najaar', description: null, status: 'closed', closes_on: day(-25), opens_at: at(-45, 9), closes_at: at(-25, 22), archived_at: null, event_id: null, access_mode: 'authenticated', anonymous: true, audience: 'role', audience_role: 'stand-staff', created_at: at(-50, 9) },
		{ id: 'srv-3', title: 'Aanmelding Dokomi NL', description: null, status: 'open', closes_on: day(40), opens_at: at(-2, 9), closes_at: at(40, 22), archived_at: null, event_id: 'evt-2', access_mode: 'public', anonymous: false, audience: 'all_users', audience_role: null, created_at: at(-3, 9) },
	],
	survey_questions: [
		{ id: 'sq-1', survey_id: 'srv-1', position: 0, label: 'Hoe beviel de opbouw?', kind: 'rating_1_5', required: true },
		{ id: 'sq-2', survey_id: 'srv-1', position: 1, label: 'Welke dag draaide je mee?', kind: 'single_choice', required: false },
		{ id: 'sq-3', survey_id: 'srv-1', position: 2, label: 'Wat kan er beter?', kind: 'text', required: false },
	],
	survey_question_options: [
		{ id: 'sqo-1', question_id: 'sq-2', position: 0, label: 'Vrijdag' },
		{ id: 'sqo-2', question_id: 'sq-2', position: 1, label: 'Zaterdag' },
		{ id: 'sqo-3', question_id: 'sq-2', position: 2, label: 'Zondag' },
	],
	notifications: [
		{ id: 'ntf-1', user_id: USER_ID, title: 'Je shift is bevestigd', body: 'Zaterdag 22 augustus, 13:00–17:00.', created_at: at(-1, 9), read_at: null },
		{ id: 'ntf-2', user_id: USER_ID, title: 'Declaratie goedgekeurd', body: 'Kabelhaspel — € 41,95.', created_at: at(-8, 16), read_at: at(-7, 8) },
	],
	notification_types: [
		{ id: 'nty-1', key: 'handmatige-melding', label: 'Handmatige melding', description: 'Een bericht dat een teamlid zelf opstelt en verstuurt.', enabled: true },
		{ id: 'nty-2', key: 'shift-reminder-30', label: 'Shift-herinnering (30 min)', description: 'Automatisch, een half uur voor een shift begint.', enabled: true },
		{ id: 'nty-3', key: 'shift-reminder-5', label: 'Shift-herinnering (5 min)', description: 'Automatisch, vlak voor een shift begint.', enabled: false },
	],
	notification_history: [
		{ id: 'nhi-1', type_key: 'handmatige-melding', title: 'Oproep vrijwilligers Abunai', body: 'We zoeken nog twee mensen voor de opbouw op vrijdag.', sender_user_id: USER_ID, audience: { kind: 'manual', audience: 'all', user_count: 42 }, sent_at: at(-14, 12) },
		{ id: 'nhi-2', type_key: 'handmatige-melding', title: 'Kassa-instructie gewijzigd', body: 'Lees de bijgewerkte instructie voor je shift begint.', sender_user_id: 'usr-0002', audience: { kind: 'manual', user_count: 3 }, sent_at: at(-6, 9) },
		{ id: 'nhi-3', type_key: 'shift-reminder-30', title: 'Je shift begint zo', body: null, sender_user_id: null, audience: { kind: 'shift-reminder', window_minutes: 30, user_count: 7 }, sent_at: at(-1, 8) },
	],
	donation_notes: [{ id: 'dnt-1', user_id: USER_ID, note: 'Doneerde een setje banners', source: 'Discord', noted_on: day(-60) }],
	payout_details: [{ user_id: USER_ID, iban: 'NL91 ABNA 0417 1643 00', account_holder: 'J. de Vries' }],
	receipts: [{ id: 'rcp-1', expense_id: 'exp-1', storage_path: 'receipts/exp-1.pdf' }],
	audit_log: [
		{ id: 'aud-1', table_name: 'events', record_id: 'evt-1', actor_id: USER_ID, op: 'UPDATE', old_data: { name: 'Abunai 2026', location: 'Nijmegen' }, new_data: { name: 'Abunai! 2026', location: 'Nijmegen' }, created_at: at(-1, 13) },
		{ id: 'aud-2', table_name: 'expenses', record_id: 'exp-1', actor_id: 'usr-0002', op: 'INSERT', old_data: null, new_data: { description: 'Treinkaartje opbouwdag', amount_eur: 24.4 }, created_at: at(-6, 10) },
		{ id: 'aud-3', table_name: 'event_shifts', record_id: 'shf-4', actor_id: null, op: 'DELETE', old_data: { name: 'Opbouw Dokomi NL' }, new_data: null, created_at: at(-4, 17) },
	],
	activity_log: [
		{ id: 'act-1', subject_id: SUBJECT_ID, actor_id: USER_ID, kind: 'shift', summary: 'Shift gedraaid op Stand A', created_at: at(-20, 12) },
		{ id: 'act-2', subject_id: 'sub-0002', actor_id: 'usr-0002', kind: 'expense', summary: 'Declaratie "Kabelhaspel" goedgekeurd', created_at: at(-11, 15) },
		{ id: 'act-3', subject_id: 'sub-0003', actor_id: null, kind: 'warning', summary: 'Waarschuwing (geel) uitgedeeld', created_at: at(-45, 15) },
	],
	event_activities: [
		{ id: 'eac-1', event_id: 'evt-1', venue: 'stage', title: 'Cosplay-wedstrijd', description: 'Voorronde op het hoofdpodium.', starts_at: at(22, 15), ends_at: at(22, 17) },
		{ id: 'eac-2', event_id: 'evt-1', venue: 'stand', title: 'Origami-workshop', description: null, starts_at: at(23, 11), ends_at: at(23, 12) },
	],
	activity_requirements: [{ id: 'arq-1', activity_id: 'eac-1', item_id: 'itm-2', label: null, quantity: 1 }],
	activity_hosts: [{ id: 'aho-1', activity_id: 'eac-1', subject_id: 'sub-0002' }],
	event_attendance: [
		{ id: 'eat-1', event_id: 'evt-1', subject_id: SUBJECT_ID, status: 'present', note: null },
		{ id: 'eat-2', event_id: 'evt-1', subject_id: 'sub-0002', status: 'signed_up', note: null },
		{ id: 'eat-3', event_id: 'evt-1', subject_id: 'sub-0003', status: 'late', note: 'Komt met de trein van 11:12.' },
	],
	event_tickets: [
		{ id: 'etk-1', event_id: 'evt-1', subject_id: SUBJECT_ID, storage_path: 'tickets/evt-1-jeffrey.pdf', day: day(21), assigned_user_id: USER_ID, assigned_label: null, quantity: 1, ticket_pdf_path: 'tickets/evt-1-jeffrey.pdf', note: null },
		{ id: 'etk-2', event_id: 'evt-1', subject_id: null, storage_path: null, day: day(22), assigned_user_id: null, assigned_label: 'Sanne Bakker', quantity: 2, ticket_pdf_path: null, note: null },
	],
	event_posts: [
		{
			id: 'epo-1',
			event_id: 'evt-1',
			channel: 'discord',
			title: 'Bedankt voor Abunai! 2026!',
			body: 'Wat was Abunai! 2026 op 22 augustus 2026 weer een topeditie! We kijken met trots terug op deze conventie.\n\nEen dikke dankjewel aan iedereen die zich heeft ingezet: Jeffrey de Vries en Milan Jansen. Zonder jullie was het niet gelukt.\n\nTot de volgende keer!',
			generated_at: at(-2, 10),
			updated_at: at(-1, 16),
			posted_at: null,
		},
	],
	org_income: [
		{ id: 'inc-1', description: 'Standverkoop Animecon', amount_eur: 640, received_on: day(-19), event_id: 'evt-3', category: 'sale' },
		{ id: 'inc-2', description: 'Donatie na de cosplay-wedstrijd', amount_eur: 75, received_on: day(-40), event_id: null, category: 'donation' },
	],
	user_roles: [
		{ user_id: USER_ID, role: 'yakuza' },
		{ user_id: 'usr-0002', role: 'stand-staff' },
		{ user_id: 'usr-0003', role: 'author' },
		{ user_id: 'usr-0004', role: 'user' },
	],
	user_permissions: [
		{ id: 'upm-1', user_id: USER_ID, permission: 'logs.view', created_at: at(-2, 14) },
		{ id: 'upm-2', user_id: 'usr-0002', permission: 'expenses.manage', created_at: at(-9, 11) },
		{ id: 'upm-3', user_id: 'usr-0002', permission: 'inventory.view', created_at: at(-30, 16) },
	],
	// The role bundles the access drawer shows behind the per-user toggles — the same table the role
	// switcher reads, so a granted-by-role permission reads as granted there too.
	role_permissions: Object.entries(PERMISSIONS_BY_ROLE).flatMap(([role, permissions]) => permissions.map((permission) => ({ role, permission }))),
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
	my_warnings: [{ color: 'yellow', reason: 'Discussie in #algemeen niet gestaakt na verzoek', issued_at: at(-30, 20) }],
	my_badges: [
		{ title: 'Eerste conventie', description: 'Je eerste shift gedraaid.', awarded_on: day(-120), image_path: null },
		{ title: 'Trouwe kracht', description: 'Vijf conventies meegedraaid.', awarded_on: day(-14), image_path: null },
	],
	my_open_surveys: [{ survey_id: 'srv-1', title: 'Evaluatie Animecon 2026', question_count: 1 }],
	my_survey_history: [{ survey_id: 'srv-2', title: 'Voorkeuren shifts najaar', submitted_at: at(-25, 19) }],
	my_assignment_item_names: [
		{ item_id: 'itm-1', name: 'Katana replica' },
		{ item_id: 'itm-3', name: 'Kassalade' },
	],
	// The real RPC returns subject_id (not id); the event editor maps c.subject_id, so mirror that shape.
	team_candidates: PEOPLE.map((p) => ({ subject_id: p.id, display_name: p.display_name })),
	// The composer picks a member by id and shows the username; the history maps sender ids to the same
	// names, so both read from this one list.
	list_notifiable_members: PEOPLE.map((p) => ({ id: p.id.replace('sub', 'usr'), user_id: p.id.replace('sub', 'usr'), display_name: p.display_name, username: USERNAMES[p.id] ?? null })),
	staff_overview: PEOPLE.map((p, i) => ({
		user_id: p.id.replace('sub', 'usr'),
		subject_id: p.id,
		display_name: p.display_name,
		avatar_url: null,
		discord_tag: USERNAMES[p.id] ?? null,
		role: i === 0 ? 'yakuza' : 'stand-staff',
		next_shift_at: i < 2 ? at(21 + i, 10) : null,
		next_shift_event_id: i < 2 ? 'evt-1' : null,
		next_shift_event_name: i < 2 ? 'Abunai! 2026' : null,
		open_warnings: i === 2 ? 1 : 0,
	})),
	// One flat row per money movement — the shape finance_rollup() returns: declaraties and event costs
	// (richting 'uitgaven') alongside org_income (richting 'inkomsten'), already joined to their event name.
	finance_rollup: [
		{ id: 'inc-1', richting: 'inkomsten', bron: 'inkomst', event_id: 'evt-3', event_naam: 'Animecon 2026', categorie: 'sale', omschrijving: 'Standverkoop Animecon', datum: day(-19), bedrag: 640, status: 'approved' },
		{ id: 'inc-2', richting: 'inkomsten', bron: 'inkomst', event_id: null, event_naam: null, categorie: 'donation', omschrijving: 'Donatie na de cosplay-wedstrijd', datum: day(-40), bedrag: 75, status: 'approved' },
		{ id: 'exp-1', richting: 'uitgaven', bron: 'declaratie', event_id: 'evt-1', event_naam: 'Abunai! 2026', categorie: 'travel', omschrijving: 'Treinkaartje opbouwdag', datum: day(-6), bedrag: 24.4, status: 'submitted' },
		{ id: 'exp-2', richting: 'uitgaven', bron: 'declaratie', event_id: 'evt-1', event_naam: 'Abunai! 2026', categorie: 'materials', omschrijving: 'Kabelhaspel', datum: day(-12), bedrag: 41.95, status: 'approved' },
		{ id: 'exp-4', richting: 'uitgaven', bron: 'declaratie', event_id: 'evt-3', event_naam: 'Animecon 2026', categorie: 'travel', omschrijving: 'Parkeerkosten', datum: day(-29), bedrag: 12.5, status: 'reimbursed' },
		{ id: 'cst-1', richting: 'uitgaven', bron: 'kosten', event_id: 'evt-3', event_naam: 'Animecon 2026', categorie: 'stand', omschrijving: 'Standhuur', datum: day(-52), bedrag: 450, status: 'reimbursed' },
		{ id: 'cst-2', richting: 'uitgaven', bron: 'kosten', event_id: 'evt-1', event_naam: 'Abunai! 2026', categorie: 'stand', omschrijving: 'Aanbetaling standplek B12', datum: day(-80), bedrag: 300, status: 'approved' },
	],
	survey_response_counts: [
		{ survey_id: 'srv-1', responses: 12, response_count: 12 },
		{ survey_id: 'srv-3', responses: 1, response_count: 1 },
	],
	// One survey's answers as the results drawer reads them: the mock ignores RPC arguments, so every
	// survey resolves to this same set.
	get_survey_results: {
		survey: { id: 'srv-1', title: 'Evaluatie Animecon 2026', anonymous: false, access_mode: 'authenticated' },
		questions: [
			{ id: 'sq-1', label: 'Hoe beviel de opbouw?', kind: 'rating_1_5', options: [] },
			{
				id: 'sq-2',
				label: 'Welke dag draaide je mee?',
				kind: 'single_choice',
				options: [
					{ id: 'sqo-1', label: 'Vrijdag' },
					{ id: 'sqo-2', label: 'Zaterdag' },
					{ id: 'sqo-3', label: 'Zondag' },
				],
			},
			{ id: 'sq-3', label: 'Wat kan er beter?', kind: 'text', options: [] },
		],
		responses: [
			{
				response_id: 'srp-1',
				submitted_at: at(-16, 20),
				respondent: { user_id: USER_ID, name: 'Jeffrey de Vries' },
				answers: [
					{ question_id: 'sq-1', value_number: 4, value_text: null, value_date: null, option_ids: [] },
					{ question_id: 'sq-2', value_number: null, value_text: null, value_date: null, option_ids: ['sqo-2'] },
					{ question_id: 'sq-3', value_number: null, value_text: 'Meer pauzes tijdens de opbouw.', value_date: null, option_ids: [] },
				],
			},
			{
				response_id: 'srp-2',
				submitted_at: at(-15, 11),
				respondent: { user_id: 'usr-0002', name: 'Sanne Bakker' },
				answers: [
					{ question_id: 'sq-1', value_number: 5, value_text: null, value_date: null, option_ids: [] },
					{ question_id: 'sq-2', value_number: null, value_text: null, value_date: null, option_ids: ['sqo-1'] },
					{ question_id: 'sq-3', value_number: null, value_text: null, value_date: null, option_ids: [] },
				],
			},
			{
				response_id: 'srp-3',
				submitted_at: at(-14, 9),
				respondent: { user_id: 'usr-0003', name: 'Milan Jansen' },
				answers: [
					{ question_id: 'sq-1', value_number: 3, value_text: null, value_date: null, option_ids: [] },
					{ question_id: 'sq-2', value_number: null, value_text: null, value_date: null, option_ids: ['sqo-3'] },
					{ question_id: 'sq-3', value_number: null, value_text: 'Duidelijkere kassa-instructie.', value_date: null, option_ids: [] },
				],
			},
		],
	},
	media_usage: [{ media_path: 'hero-abunai-2026.jpg', page_path: '/', page_title: 'Home' }],
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
