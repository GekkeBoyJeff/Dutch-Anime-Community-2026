// Formats an ISO date string deterministically — a fixed nl-NL locale and UTC time zone — so the
// server and client render the exact same string and hydration never mismatches. Returns undefined
// for an invalid date so callers skip rendering rather than emit "Invalid Date".
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions): string | undefined => {
	const date = new Date(iso);

	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return new Intl.DateTimeFormat('nl-NL', { timeZone: 'UTC', ...options }).format(date);
}
