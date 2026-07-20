// Pure generator for the first version of a convention post: a Dutch thank-you built from the event's
// own data (present/helped attendees + item contributors). No LLM, no I/O — a plain function over
// already-fetched data so it stays unit-testable and deterministic.

export interface PostDraftInput {
	eventName: string;
	startsOn: string | null; // ISO date, e.g. "2026-07-19"
	helpers: string[]; // display names of attendees who were present/helped
	contributors: string[]; // names of people who brought items
}

export interface PostDraft {
	title: string;
	body: string;
}

const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const formatDutchDate = (iso: string): string | null => {
	const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
	if (!m) return null;
	return `${Number(m[3])} ${MONTHS_NL[Number(m[2]) - 1]} ${m[1]}`;
};

// Unieke, niet-lege namen met behoud van volgorde.
const uniqueNames = (names: string[]): string[] => {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const raw of names) {
		const name = raw.trim();
		if (name && !seen.has(name)) {
			seen.add(name);
			out.push(name);
		}
	}
	return out;
};

// "A", "A en B", "A, B en C".
const joinNames = (names: string[]): string => {
	if (names.length <= 1) return names[0] ?? '';
	return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
};

export const generatePostDraft = ({ eventName, startsOn, helpers, contributors }: PostDraftInput): PostDraft => {
	const date = startsOn ? formatDutchDate(startsOn) : null;
	const helperNames = uniqueNames(helpers);
	const contributorNames = uniqueNames(contributors);

	const intro = date
		? `Wat was ${eventName} op ${date} weer een topeditie! We kijken met trots terug op deze conventie.`
		: `Wat was ${eventName} weer een topeditie! We kijken met trots terug op deze conventie.`;

	const paragraphs = [intro];

	if (helperNames.length > 0) {
		paragraphs.push(`Een dikke dankjewel aan iedereen die zich heeft ingezet: ${joinNames(helperNames)}. Zonder jullie was het niet gelukt.`);
	}
	if (contributorNames.length > 0) {
		paragraphs.push(`Speciale dank aan iedereen die materiaal heeft meegebracht: ${joinNames(contributorNames)}.`);
	}
	if (helperNames.length === 0 && contributorNames.length === 0) {
		paragraphs.push('Vul hier de namen aan van iedereen die heeft geholpen — nog niemand staat als aanwezig of als brenger geregistreerd.');
	}

	paragraphs.push('Tot de volgende keer!');

	return {
		title: `Bedankt voor ${eventName}!`,
		body: paragraphs.join('\n\n'),
	};
};
