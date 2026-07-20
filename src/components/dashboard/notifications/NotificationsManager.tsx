'use client';

import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import DetailTabs from '@/components/components/DetailTabs';
import NotificationHistory from '@/components/dashboard/notifications/NotificationHistory';
import NotificationsComposer from '@/components/dashboard/notifications/NotificationsComposer';
import NotificationTypes from '@/components/dashboard/notifications/NotificationTypes';

// Eén route, drie tabs: Versturen (bestaande composer, ongewijzigd), Historie (verzendhistorie,
// leesbaar) en Types (enabled-toggle per notification_type). Alle drie RLS-gated op notifications.send.
const NotificationsManager = () => (
	<Container className="inventory">
		<Title size={2}>Meldingen</Title>
		<DetailTabs
			label="Meldingen"
			tabs={[
				{ label: 'Versturen', panel: <NotificationsComposer /> },
				{ label: 'Historie', panel: <NotificationHistory /> },
				{ label: 'Types', panel: <NotificationTypes /> },
			]}
		/>
	</Container>
);

export default NotificationsManager;
