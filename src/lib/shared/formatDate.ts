// The fixed nl-NL locale and UTC time zone are what keep the server and the client rendering the
// same string; a runtime locale or time zone would mismatch on hydration.
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions): string | undefined => {
	const date = new Date(iso);

	if (Number.isNaN(date.getTime())) {
		return undefined;
	}

	return new Intl.DateTimeFormat('nl-NL', { timeZone: 'UTC', ...options }).format(date);
}
