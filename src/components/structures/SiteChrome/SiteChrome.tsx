import AnnouncementBar from '@/components/structures/AnnouncementBar/AnnouncementBar';
import Footer from '@/components/structures/Footer/Footer';
import Navigation from '@/components/structures/Navigation/Navigation';

import type { SiteChromeProps as SiteChromeSchemaProps } from './SiteChrome.schema';

// The type import points at the schema file, not the @/lib/content barrel, so the client-side
// editor bundle never touches the server-only accessor modules.
type SiteChromeProps = SiteChromeSchemaProps;

const SiteChrome = ({
	structures,
	children,
}: SiteChromeProps) => {
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
