'use client';

import { useSearchParams } from 'next/navigation';

import EventEditor from '@/components/dashboard/events/EventEditor';
import EventsLanding from '@/components/dashboard/events/EventsLanding';

// /dashboard/events is the section: no ?id → the landing (list + stats), ?id=… → the 7-tab editor.
const EventsRouter = () => {
	const eventId = useSearchParams().get('id');
	return eventId ? <EventEditor /> : <EventsLanding />;
};

export default EventsRouter;
