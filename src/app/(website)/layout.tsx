import type { ReactNode } from 'react';

import CookieConsent from '@/components/components/CookieConsent/CookieConsent';
import ScrollProgress from '@/components/components/ScrollProgress/ScrollProgress';
import SearchPalette from '@/components/components/SearchPalette/SearchPalette';
import SiteChrome from '@/components/structures/SiteChrome/SiteChrome';
import { getSiteStructures } from '@/lib/site/content/load';
import { resolveChrome } from '@/lib/site/site';

type WebsiteLayoutProps = { children: ReactNode };

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
			{searchPalette && <SearchPalette {...searchPalette} />}
			{cookieConsent && <CookieConsent {...cookieConsent} />}
		</>
	);
};

export default WebsiteLayout;
