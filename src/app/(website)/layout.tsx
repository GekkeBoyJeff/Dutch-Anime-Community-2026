import type { ReactNode } from 'react';

import RevealObserver from '@/components/basics/RevealObserver';
import CookieConsent from '@/components/components/CookieConsent';
import ScrollProgress from '@/components/components/ScrollProgress';
import SearchPalette from '@/components/components/SearchPalette';
import SiteChrome from '@/components/structures/SiteChrome';
import { getSiteStructures } from '@/lib/content';
import { resolveChrome } from '@/lib/site';

interface WebsiteLayoutProps {
	/** The routed page content */
	children?: ReactNode;
}

// The website route group's shared frame: validated chrome data around every page. The builder
// route lives outside this group so the editor canvas doesn't get double chrome. resolveChrome swaps
// the Storybook nav item's sentinel URL for the environment-correct one (dev :6006 vs. static build).
const WebsiteLayout = async ({ children }: WebsiteLayoutProps) => {
	const structures = resolveChrome(await getSiteStructures());
	const { scrollProgress, searchPalette, cookieConsent } = structures;

	// The overlays live here, not inside SiteChrome, so the builder preview (which reuses SiteChrome)
	// never gets a ⌘K palette or a cookie bar in its editing canvas. ScrollProgress sits inside the
	// page frame because that is the scroll container its timeline reads (scroll(nearest)).
	return (
		<>
			<div className="page-frame">
				<div className="page-frame-scroll">
					{scrollProgress && <ScrollProgress {...scrollProgress} />}
					<SiteChrome structures={structures}>{children}</SiteChrome>
				</div>
			</div>
			<RevealObserver />
			{searchPalette && <SearchPalette {...searchPalette} />}
			{cookieConsent && <CookieConsent {...cookieConsent} />}
		</>
	);
};

export default WebsiteLayout;
