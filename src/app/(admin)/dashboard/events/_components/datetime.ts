// timestamptz <-> <input type="datetime-local"> in lokale wandkloktijd, consistent heen en terug.
export const toInput = (iso: string | null): string => {
	if (!iso) return '';
	const d = new Date(iso);
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const fromInput = (s: string): string | null => (s ? new Date(s).toISOString() : null);

// Compacte tijdweergave voor een shift/activiteit.
export const fmtRange = (startIso: string | null, endIso: string | null): string => {
	const f = (iso: string | null) => (iso ? new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' }) : '—');
	if (!startIso && !endIso) return '—';
	return `${f(startIso)} – ${f(endIso)}`;
};
