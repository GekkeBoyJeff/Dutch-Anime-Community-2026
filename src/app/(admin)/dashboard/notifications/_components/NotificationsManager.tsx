'use client';

import NotificationHistory from '@/app/(admin)/dashboard/notifications/_components/NotificationHistory';
import NotificationsComposer from '@/app/(admin)/dashboard/notifications/_components/NotificationsComposer';
import NotificationTypes from '@/app/(admin)/dashboard/notifications/_components/NotificationTypes';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import DetailTabs from '@/components/components/DetailTabs';

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
