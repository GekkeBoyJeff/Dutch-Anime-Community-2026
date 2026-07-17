import type { Metadata } from 'next';
import { Suspense } from 'react';

import EventEditor from '@/app/(admin)/dashboard/events/_components/EventEditor';

import '@/app/(admin)/dashboard/dashboard.scss';
import '@/app/(admin)/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Conventie', robots: { index: false, follow: false } };

// EventEditor leest ?id via useSearchParams → moet binnen een Suspense-grens bij static export.
const EventPage = () => (
	<Suspense>
		<EventEditor />
	</Suspense>
);

export default EventPage;
