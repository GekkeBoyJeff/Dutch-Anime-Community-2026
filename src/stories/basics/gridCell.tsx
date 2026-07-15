import type { ReactNode } from 'react';

// Shared demo cell for the grid stories (Column + Columns): a tinted, labelled box so the
// spans/offsets are visible. Kept out of both story files so they don't duplicate the helper.
export const cell = (label: string): ReactNode => (
	<div style={{ background: 'color-mix(in srgb, currentColor 12%, transparent)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
		{label}
	</div>
);
