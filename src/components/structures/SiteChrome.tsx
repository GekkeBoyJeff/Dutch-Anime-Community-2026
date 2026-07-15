import type { ReactNode } from 'react';

import AnnouncementBar from '@/components/structures/AnnouncementBar';
import Footer from '@/components/structures/Footer';
import Navigation from '@/components/structures/Navigation';
import type { SiteStructures } from '@/lib/content/schema/structures/site';

interface SiteChromeProps {
	/** The validated site-wide chrome data (announcement bar, navigation, footer) */
	structures: SiteStructures;
	/** The page content rendered between the navigation and the footer */
	children?: ReactNode;
}

// Composes the site-wide chrome around the page content. Used by the (website) layout AND the
// builder preview (lib/puck/config), so the real site and the editor canvas share one implementation.
// The type import points at the schema file, not the @/lib/content barrel, so the client-side
// editor bundle never touches the server-only accessor modules.
const SiteChrome = ({ structures, children }: SiteChromeProps) => {
	const { announcementBar, navigation, footer } = structures;

	return (
		<>
			<a className="skip-link" href="#main">
				Ga naar de inhoud
			</a>
			{announcementBar && <AnnouncementBar {...announcementBar} />}
			<Navigation {...navigation} />
			{children}
			<Footer {...footer} />
		</>
	);
};

export default SiteChrome;
