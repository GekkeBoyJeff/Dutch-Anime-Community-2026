import type { Metadata } from 'next';
import { Suspense } from 'react';

import EventsRouter from '@/components/dashboard/events/EventsRouter';

export const metadata: Metadata = { title: 'Conventies & events', robots: { index: false, follow: false } };

// EventsRouter leest ?id via useSearchParams → moet binnen een Suspense-grens bij static export.
const EventPage = () => (
	<Suspense>
		<EventsRouter />
	</Suspense>
);

export default EventPage;
