import type { Metadata } from 'next';
import { Suspense } from 'react';

import EventsRouter from '@/app/(admin)/dashboard/events/_components/EventsRouter';

import '@/app/(admin)/dashboard/dashboard.scss';
import '@/app/(admin)/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Conventies & events', robots: { index: false, follow: false } };

// EventsRouter leest ?id via useSearchParams → moet binnen een Suspense-grens bij static export.
const EventPage = () => (
	<Suspense>
		<EventsRouter />
	</Suspense>
);

export default EventPage;
