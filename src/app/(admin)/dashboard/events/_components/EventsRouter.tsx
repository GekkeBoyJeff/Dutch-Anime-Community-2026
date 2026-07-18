'use client';

import { useSearchParams } from 'next/navigation';

import EventEditor from '@/app/(admin)/dashboard/events/_components/EventEditor';
import EventsLanding from '@/app/(admin)/dashboard/events/_components/EventsLanding';

// /dashboard/events is the section: no ?id → the landing (list + stats), ?id=… → the 7-tab editor.
const EventsRouter = () => {
	const eventId = useSearchParams().get('id');
	return eventId ? <EventEditor /> : <EventsLanding />;
};

export default EventsRouter;
